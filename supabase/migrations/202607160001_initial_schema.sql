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
  ('cbd-oil-5', 'cbd-olje-5', 'CBD olje 5%', false),
  ('cbd-oil-10', 'cbd-olje-10', 'CBD olje 10%', false),
  ('cbd-balm', 'cbd-balzam', 'CBD balzam', false)
on conflict (id) do nothing;
