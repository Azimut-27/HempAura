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

