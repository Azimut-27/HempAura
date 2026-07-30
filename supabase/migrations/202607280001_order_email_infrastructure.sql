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
