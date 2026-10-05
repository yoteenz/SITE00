-- SITE 00 Founder Access Credential system
-- Physical-to-digital access cards with serialized codes and scan tracking.

create sequence if not exists site00_access_credential_serial start 1 increment 1;

create table if not exists public.site00_access_credentials (
  id uuid primary key default gen_random_uuid(),
  credential_code text not null,
  serial_number integer not null,
  credential_type text not null default 'FOUNDER_ACCESS',
  status text not null default 'INACTIVE',
  issued_at timestamptz,
  activated_at timestamptz,
  first_scanned_at timestamptz,
  last_scanned_at timestamptz,
  scan_count integer not null default 0,
  recipient_name text,
  recipient_email text,
  recipient_company text,
  notes text,
  assigned_user_id uuid,
  created_by text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site00_access_credentials_code_unique unique (credential_code),
  constraint site00_access_credentials_serial_unique unique (serial_number),
  constraint site00_access_credentials_type_check check (
    credential_type in ('FOUNDER_ACCESS', 'CLIENT_ACCESS', 'PARTNER_ACCESS', 'VIP_ACCESS')
  ),
  constraint site00_access_credentials_status_check check (
    status in ('ACTIVE', 'INACTIVE', 'REVOKED', 'EXPIRED')
  ),
  constraint site00_access_credentials_code_format check (credential_code ~ '^00-[0-9]{4}$')
);

create index if not exists site00_access_credentials_status_idx
  on public.site00_access_credentials (status);

create index if not exists site00_access_credentials_type_idx
  on public.site00_access_credentials (credential_type);

create index if not exists site00_access_credentials_assigned_user_idx
  on public.site00_access_credentials (assigned_user_id)
  where assigned_user_id is not null;

create table if not exists public.site00_access_credential_events (
  id uuid primary key default gen_random_uuid(),
  credential_id uuid not null references public.site00_access_credentials(id) on delete cascade,
  event_type text not null,
  session_id text,
  user_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint site00_access_credential_events_type_check check (
    event_type in (
      'SCANNED',
      'ENTERED_SITE',
      'ACCOUNT_ASSOCIATED',
      'PROJECT_STARTED',
      'ACTIVATED',
      'REVOKED',
      'CREATED'
    )
  )
);

create index if not exists site00_access_credential_events_credential_idx
  on public.site00_access_credential_events (credential_id, created_at desc);

create index if not exists site00_access_credential_events_type_idx
  on public.site00_access_credential_events (event_type);

-- Concurrency-safe credential code allocation (00-0001, 00-0002, …)
create or replace function public.site00_allocate_access_credential_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_serial integer;
  formatted text;
begin
  next_serial := nextval('site00_access_credential_serial');
  formatted := '00-' || lpad(next_serial::text, 4, '0');
  return formatted;
end;
$$;

-- RLS: service_role only — public reads via Node API, not direct Supabase client
alter table public.site00_access_credentials enable row level security;
alter table public.site00_access_credential_events enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['site00_access_credentials', 'site00_access_credential_events'] loop
    if not exists (
      select 1 from pg_policies where tablename = t and policyname = 'service_role_all'
    ) then
      execute format(
        'create policy service_role_all on public.%I for all to service_role using (true) with check (true)',
        t
      );
    end if;
  end loop;
end $$;
