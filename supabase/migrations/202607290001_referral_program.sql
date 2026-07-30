-- HempAura referral programme
-- Stripe owns the customer discount. Supabase owns partner attribution,
-- commission calculation, approval and payout history.

create table if not exists public.referral_partners (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  contact_email text,
  public_code text not null unique
    check (public_code ~ '^[A-Z0-9][A-Z0-9_-]{2,31}$'),
  stripe_promotion_code_id text unique,
  customer_discount_percent numeric(5,2)
    check (
      customer_discount_percent is null
      or customer_discount_percent between 0 and 100
    ),
  commission_rate_bps integer not null
    check (commission_rate_bps between 0 and 10000),
  hold_days integer not null default 30
    check (hold_days between 0 and 180),
  status text not null default 'pending'
    check (status in ('pending', 'active', 'paused', 'ended')),
  payout_method text not null default 'manual',
  payout_reference text,
  terms_accepted_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists discount_cents integer not null default 0
    check (discount_cents >= 0),
  add column if not exists promotion_code text,
  add column if not exists stripe_promotion_code_id text,
  add column if not exists referral_partner_id uuid
    references public.referral_partners(id);

create table if not exists public.referral_conversions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.referral_partners(id),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  provider_session_id text not null unique,
  promotion_code text not null,
  stripe_promotion_code_id text not null,
  currency text not null check (char_length(currency) = 3),
  gross_subtotal_cents integer not null check (gross_subtotal_cents >= 0),
  discount_cents integer not null check (discount_cents >= 0),
  net_subtotal_cents integer not null check (net_subtotal_cents >= 0),
  commission_rate_bps integer not null
    check (commission_rate_bps between 0 and 10000),
  commission_cents integer not null check (commission_cents >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'paid', 'reversed', 'cancelled')),
  available_at timestamptz not null,
  approved_at timestamptz,
  paid_at timestamptz,
  payout_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists referral_partners_status_idx
  on public.referral_partners(status);
create index if not exists referral_conversions_partner_status_idx
  on public.referral_conversions(partner_id, status, available_at);
create index if not exists orders_referral_partner_idx
  on public.orders(referral_partner_id)
  where referral_partner_id is not null;

alter table public.referral_partners enable row level security;
alter table public.referral_conversions enable row level security;

drop trigger if exists referral_partners_set_updated_at
  on public.referral_partners;
create trigger referral_partners_set_updated_at
before update on public.referral_partners
for each row execute function public.set_updated_at();

drop trigger if exists referral_conversions_set_updated_at
  on public.referral_conversions;
create trigger referral_conversions_set_updated_at
before update on public.referral_conversions
for each row execute function public.set_updated_at();

-- Recreate the atomic order function so discounted orders keep their final
-- Stripe totals while order items retain the catalogue price snapshots.
create or replace function public.create_order_with_items(
  p_order jsonb,
  p_items jsonb
)
returns table(id uuid, public_order_number text)
language plpgsql
as $$
declare
  v_order_id uuid;
  v_public_order_number text;
begin
  insert into public.orders (
    public_order_number,
    provider,
    provider_session_id,
    provider_payment_id,
    customer_email,
    customer_name,
    currency,
    subtotal_cents,
    discount_cents,
    shipping_cents,
    tax_cents,
    total_cents,
    payment_status,
    fulfillment_status,
    promotion_code,
    stripe_promotion_code_id,
    shipping_address_json,
    billing_address_json
  )
  values (
    p_order->>'public_order_number',
    p_order->>'provider',
    p_order->>'provider_session_id',
    p_order->>'provider_payment_id',
    p_order->>'customer_email',
    p_order->>'customer_name',
    p_order->>'currency',
    (p_order->>'subtotal_cents')::integer,
    coalesce((p_order->>'discount_cents')::integer, 0),
    (p_order->>'shipping_cents')::integer,
    (p_order->>'tax_cents')::integer,
    (p_order->>'total_cents')::integer,
    p_order->>'payment_status',
    p_order->>'fulfillment_status',
    nullif(p_order->>'promotion_code', ''),
    nullif(p_order->>'stripe_promotion_code_id', ''),
    nullif(p_order->'shipping_address_json', 'null'::jsonb),
    nullif(p_order->'billing_address_json', 'null'::jsonb)
  )
  on conflict (provider_session_id) do nothing
  returning orders.id, orders.public_order_number
  into v_order_id, v_public_order_number;

  if v_order_id is null then
    return query
      select orders.id, orders.public_order_number
      from public.orders
      where orders.provider_session_id = p_order->>'provider_session_id';
    return;
  end if;

  insert into public.order_items (
    order_id,
    product_id,
    sku_snapshot,
    name_snapshot,
    quantity,
    unit_price_cents,
    line_total_cents
  )
  select
    v_order_id,
    item->>'product_id',
    item->>'sku_snapshot',
    item->>'name_snapshot',
    (item->>'quantity')::integer,
    (item->>'unit_price_cents')::integer,
    (item->>'line_total_cents')::integer
  from jsonb_array_elements(p_items) as item;

  return query select v_order_id, v_public_order_number;
end;
$$;

create or replace function public.record_referral_conversion(
  p_order_id uuid,
  p_provider_session_id text,
  p_stripe_promotion_code_id text,
  p_promotion_code text,
  p_currency text,
  p_gross_subtotal_cents integer,
  p_discount_cents integer
)
returns table(
  conversion_id uuid,
  partner_id uuid,
  commission_cents integer
)
language plpgsql
as $$
declare
  v_partner public.referral_partners%rowtype;
  v_conversion_id uuid;
  v_net_subtotal_cents integer;
  v_commission_cents integer;
begin
  select *
  into v_partner
  from public.referral_partners
  where stripe_promotion_code_id = p_stripe_promotion_code_id
    and status = 'active'
  limit 1;

  if v_partner.id is null then
    return;
  end if;

  v_net_subtotal_cents :=
    greatest(0, p_gross_subtotal_cents - p_discount_cents);
  v_commission_cents := round(
    v_net_subtotal_cents::numeric * v_partner.commission_rate_bps / 10000
  )::integer;

  insert into public.referral_conversions (
    partner_id,
    order_id,
    provider_session_id,
    promotion_code,
    stripe_promotion_code_id,
    currency,
    gross_subtotal_cents,
    discount_cents,
    net_subtotal_cents,
    commission_rate_bps,
    commission_cents,
    status,
    available_at
  )
  values (
    v_partner.id,
    p_order_id,
    p_provider_session_id,
    coalesce(nullif(p_promotion_code, ''), v_partner.public_code),
    p_stripe_promotion_code_id,
    upper(p_currency),
    p_gross_subtotal_cents,
    p_discount_cents,
    v_net_subtotal_cents,
    v_partner.commission_rate_bps,
    v_commission_cents,
    'pending',
    now() + make_interval(days => v_partner.hold_days)
  )
  on conflict (order_id) do update
  set
    promotion_code = excluded.promotion_code,
    stripe_promotion_code_id = excluded.stripe_promotion_code_id
  returning referral_conversions.id
  into v_conversion_id;

  update public.orders
  set
    referral_partner_id = v_partner.id,
    promotion_code = coalesce(nullif(p_promotion_code, ''), v_partner.public_code),
    stripe_promotion_code_id = p_stripe_promotion_code_id
  where orders.id = p_order_id;

  return query
    select v_conversion_id, v_partner.id, v_commission_cents;
end;
$$;

create or replace view public.referral_partner_balances
with (security_invoker = true)
as
select
  rp.id as partner_id,
  rp.display_name,
  rp.public_code,
  rc.currency,
  count(rc.id) filter (where rc.status <> 'cancelled') as conversion_count,
  coalesce(
    sum(rc.commission_cents) filter (where rc.status = 'pending'),
    0
  ) as pending_commission_cents,
  coalesce(
    sum(rc.commission_cents) filter (where rc.status = 'approved'),
    0
  ) as approved_commission_cents,
  coalesce(
    sum(rc.commission_cents) filter (where rc.status = 'paid'),
    0
  ) as paid_commission_cents
from public.referral_partners rp
left join public.referral_conversions rc on rc.partner_id = rp.id
group by rp.id, rp.display_name, rp.public_code, rc.currency;

-- No public policies are created. The service-role key is required.
