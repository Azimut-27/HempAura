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
