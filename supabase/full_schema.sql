-- HerbaGallus Unified Supabase Schema
-- Run this in your new Supabase project SQL Editor


-- ==========================================
-- Migration: 202607160001_initial_schema.sql
-- ==========================================

create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  active boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  public_order_number text not null unique,
  provider text not null,
  provider_session_id text not null unique,
  provider_payment_id text,
  customer_email text,
  customer_name text,
  currency text not null check (char_length(currency) = 3),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null check (shipping_cents >= 0),
  tax_cents integer not null check (tax_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  payment_status text not null,
  fulfillment_status text not null,
  shipping_address_json jsonb,
  billing_address_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id),
  sku_snapshot text not null,
  name_snapshot text not null,
  quantity integer not null check (quantity > 0 and quantity <= 20),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  line_total_cents integer not null check (line_total_cents >= 0)
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null unique,
  type text not null,
  processed_at timestamptz,
  payload_summary_json jsonb not null default '{}'::jsonb,
  status text not null
);

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  order_number text,
  consent boolean not null check (consent = true),
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null,
  consent_text_version text not null,
  consent_at timestamptz not null,
  source text not null,
  confirmation_token_hash text,
  confirmation_token_expires_at timestamptz,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx
  on public.order_items(order_id);
create index if not exists orders_customer_email_idx
  on public.orders(customer_email);
create index if not exists newsletter_confirmation_token_idx
  on public.newsletter_subscribers(confirmation_token_hash)
  where confirmation_token_hash is not null;

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
    shipping_cents,
    tax_cents,
    total_cents,
    payment_status,
    fulfillment_status,
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
    (p_order->>'shipping_cents')::integer,
    (p_order->>'tax_cents')::integer,
    (p_order->>'total_cents')::integer,
    p_order->>'payment_status',
    p_order->>'fulfillment_status',
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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_events enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- No public policies are created. Server functions use the service-role key.

insert into public.products (id, slug, name, active)
values
  (
    'hempaura-cbd-kapljice-5',
    'hempaura-cbd-kapljice-5',
    'HempAura CBD kapljice 5%',
    true
  ),
  (
    'hempaura-cbg-cvetovi-citrin-15',
    'hempaura-cbg-cvetovi-citrin-15-5g',
    'HempAura CBD cvetovi Citrin 15 %',
    true
  ),
  (
    'hempaura-cbd-krema-sprostitev',
    'hempaura-cbd-krema-za-sprostitev-50ml',
    'HempAura CBD krema za sprostitev',
    true
  )
on conflict (id) do update
set
  slug = excluded.slug,
  name = excluded.name,
  active = excluded.active,
  updated_at = now();


-- ==========================================
-- Migration: 202607270001_resend_contact_infrastructure.sql
-- ==========================================

alter table public.contact_submissions
  add column if not exists internal_email_id text,
  add column if not exists acknowledgement_email_id text,
  add column if not exists internal_email_status text,
  add column if not exists acknowledgement_email_status text,
  add column if not exists last_email_event_at timestamptz;

create index if not exists contact_submissions_internal_email_id_idx
  on public.contact_submissions(internal_email_id)
  where internal_email_id is not null;

create index if not exists contact_submissions_ack_email_id_idx
  on public.contact_submissions(acknowledgement_email_id)
  where acknowledgement_email_id is not null;

create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null unique,
  provider_email_id text,
  type text not null,
  recipient text,
  contact_submission_id uuid references public.contact_submissions(id) on delete set null,
  channel text,
  payload_summary_json jsonb not null default '{}'::jsonb,
  provider_created_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists email_events_provider_email_id_idx
  on public.email_events(provider_email_id)
  where provider_email_id is not null;

create index if not exists email_events_contact_submission_id_idx
  on public.email_events(contact_submission_id)
  where contact_submission_id is not null;

alter table public.email_events enable row level security;

-- No public policies are created. Server functions use the service-role key.


-- ==========================================
-- Migration: 202607280001_order_email_infrastructure.sql
-- ==========================================

-- Bring already-created projects in sync with the current server catalogue.
insert into public.products (id, slug, name, active)
values
  (
    'hempaura-cbd-kapljice-5',
    'hempaura-cbd-kapljice-5',
    'HempAura CBD kapljice 5%',
    true
  ),
  (
    'hempaura-cbg-cvetovi-citrin-15',
    'hempaura-cbg-cvetovi-citrin-15-5g',
    'HempAura CBD cvetovi Citrin 15 %',
    true
  ),
  (
    'hempaura-cbd-krema-sprostitev',
    'hempaura-cbd-krema-za-sprostitev-50ml',
    'HempAura CBD krema za sprostitev',
    true
  )
on conflict (id) do update
set
  slug = excluded.slug,
  name = excluded.name,
  active = excluded.active,
  updated_at = now();

-- Each order can have one customer confirmation and one owner notification.
-- The unique constraint and claim function make Stripe webhook retries safe.
create table if not exists public.order_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  kind text not null check (kind in ('customer_confirmation', 'owner_notification')),
  recipient text not null,
  provider text not null default 'resend',
  provider_email_id text,
  status text not null check (status in ('processing', 'sent', 'failed')),
  attempts integer not null default 1 check (attempts > 0),
  last_error text,
  last_attempt_at timestamptz not null default now(),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, kind)
);

create index if not exists order_email_deliveries_status_idx
  on public.order_email_deliveries(status, last_attempt_at);

create index if not exists order_email_deliveries_provider_email_id_idx
  on public.order_email_deliveries(provider_email_id)
  where provider_email_id is not null;

alter table public.order_email_deliveries enable row level security;

drop trigger if exists order_email_deliveries_set_updated_at
  on public.order_email_deliveries;
create trigger order_email_deliveries_set_updated_at
before update on public.order_email_deliveries
for each row execute function public.set_updated_at();

create or replace function public.claim_order_email_delivery(
  p_order_id uuid,
  p_kind text,
  p_recipient text
)
returns table(id uuid, attempts integer)
language plpgsql
as $$
declare
  v_id uuid;
  v_attempts integer;
begin
  insert into public.order_email_deliveries (
    order_id,
    kind,
    recipient,
    status,
    attempts,
    last_attempt_at
  )
  values (
    p_order_id,
    p_kind,
    p_recipient,
    'processing',
    1,
    now()
  )
  on conflict (order_id, kind) do nothing
  returning
    order_email_deliveries.id,
    order_email_deliveries.attempts
  into v_id, v_attempts;

  if v_id is null then
    update public.order_email_deliveries
    set
      recipient = p_recipient,
      status = 'processing',
      attempts = order_email_deliveries.attempts + 1,
      last_error = null,
      last_attempt_at = now()
    where order_id = p_order_id
      and kind = p_kind
      and (
        status = 'failed'
        or (
          status = 'processing'
          and last_attempt_at < now() - interval '15 minutes'
        )
      )
    returning
      order_email_deliveries.id,
      order_email_deliveries.attempts
    into v_id, v_attempts;
  end if;

  if v_id is not null then
    return query select v_id, v_attempts;
  end if;
end;
$$;

-- No public policies are created. Server functions use the service-role key.


-- ==========================================
-- Migration: 202607290001_referral_program.sql
-- ==========================================

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


-- ==========================================
-- Migration: 202607300001_gls_shipping.sql
-- ==========================================

-- GLS labels contain recipient personal data. The table has RLS enabled and no
-- public policies; only the server-side Supabase secret key may access it.
create table if not exists public.gls_shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  environment text not null check (environment in ('test', 'live')),
  client_reference text not null,
  request_fingerprint text not null,
  status text not null
    check (status in ('processing', 'label_created', 'failed', 'cancelled')),
  parcel_id bigint,
  parcel_number text,
  label_mime_type text,
  label_pdf_base64 text,
  error_code integer,
  error_message text,
  attempts integer not null default 1 check (attempts > 0),
  last_attempt_at timestamptz not null default now(),
  label_created_at timestamptz,
  label_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists gls_shipments_environment_reference_idx
  on public.gls_shipments(environment, client_reference);

create index if not exists gls_shipments_status_idx
  on public.gls_shipments(status, last_attempt_at);

alter table public.gls_shipments enable row level security;

drop trigger if exists gls_shipments_set_updated_at
  on public.gls_shipments;
create trigger gls_shipments_set_updated_at
before update on public.gls_shipments
for each row execute function public.set_updated_at();

-- No public policies are created. The PDF should be removed after the business
-- retention period while retaining parcel identifiers required for support.


