-- SITE 00 — Identity + Builder intake persistence, guest access & retrieval infrastructure.
--
-- Extends the existing canonical intake tables (site00_idnty_submissions, site00_bldr_intakes —
-- created in 20260818180000_site00_admin_operations.sql) rather than creating a parallel
-- `site00_intakes` table, per the "prefer extending a valid existing canonical entity" directive.
-- Identity and Builder keep separate schemas (their answer shapes differ) but now share:
--   - the same lifecycle column set (guest/owner, draft vs submitted snapshot, autosave, claim)
--   - the same secure guest access token table
--   - the same intake audit event table
--
-- All changes are additive (ADD COLUMN / CREATE TABLE IF NOT EXISTS) — no destructive changes,
-- no data loss for any existing row.

-- ---------------------------------------------------------------------------
-- A. site00_idnty_submissions — canonical IDENTITY intake lifecycle columns
-- ---------------------------------------------------------------------------
alter table public.site00_idnty_submissions
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists public_reference text,
  add column if not exists verified_email_at timestamptz,
  add column if not exists source text not null default 'WEB',
  add column if not exists source_route text,
  add column if not exists current_step text,
  add column if not exists total_steps integer,
  add column if not exists submitted_payload jsonb,
  add column if not exists last_saved_at timestamptz,
  add column if not exists claimed_at timestamptz,
  add column if not exists claimed_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists version integer not null default 1,
  add column if not exists schema_version integer not null default 1;

-- Backfill a stable human-readable reference for any pre-existing rows, then enforce uniqueness.
update public.site00_idnty_submissions
set public_reference = 'IDN-' || upper(substr(replace(id::text, '-', ''), 1, 8))
where public_reference is null;

alter table public.site00_idnty_submissions
  alter column public_reference set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'site00_idnty_submissions_public_reference_unique'
  ) then
    alter table public.site00_idnty_submissions
      add constraint site00_idnty_submissions_public_reference_unique unique (public_reference);
  end if;
end $$;

-- Reconcile legacy demo-seed status value ('COMPLETE') to the canonical lifecycle before
-- adding the enforced check constraint (see also adminOperations.ts seed, updated alongside).
update public.site00_idnty_submissions set status = 'SUBMITTED' where status = 'COMPLETE';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'site00_idnty_submissions_status_check'
  ) then
    alter table public.site00_idnty_submissions
      add constraint site00_idnty_submissions_status_check check (
        status in ('DRAFT', 'AWAITING_EMAIL_VERIFICATION', 'ACTIVE', 'SUBMITTED', 'IN_REVIEW', 'CONVERTED', 'ARCHIVED')
      );
  end if;
end $$;

create index if not exists site00_idnty_submissions_user_id_idx on public.site00_idnty_submissions (user_id);
create index if not exists site00_idnty_submissions_status_idx on public.site00_idnty_submissions (status);
create index if not exists site00_idnty_submissions_email_idx on public.site00_idnty_submissions (lower(email)) where email is not null;

-- ---------------------------------------------------------------------------
-- B. site00_bldr_intakes — canonical BUILDER intake lifecycle columns
-- ---------------------------------------------------------------------------
alter table public.site00_bldr_intakes
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists public_reference text,
  add column if not exists verified_email_at timestamptz,
  add column if not exists source text not null default 'WEB',
  add column if not exists source_route text,
  add column if not exists current_step text,
  add column if not exists total_steps integer,
  add column if not exists submitted_payload jsonb,
  add column if not exists last_saved_at timestamptz,
  add column if not exists claimed_at timestamptz,
  add column if not exists claimed_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists version integer not null default 1,
  add column if not exists schema_version integer not null default 1;

update public.site00_bldr_intakes
set public_reference = 'BLD-' || upper(substr(replace(id::text, '-', ''), 1, 8))
where public_reference is null;

alter table public.site00_bldr_intakes
  alter column public_reference set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'site00_bldr_intakes_public_reference_unique'
  ) then
    alter table public.site00_bldr_intakes
      add constraint site00_bldr_intakes_public_reference_unique unique (public_reference);
  end if;
end $$;

-- Preserve legacy status vocabulary already used by the existing BLDR Intakes admin page
-- (IN_PROGRESS / SUBMITTED / REVIEWED / CONVERTED) as a superset alongside the new canonical
-- lifecycle values this sprint introduces (DRAFT / AWAITING_EMAIL_VERIFICATION / ACTIVE /
-- IN_REVIEW / ARCHIVED). Nothing existing is renamed or removed.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'site00_bldr_intakes_status_check'
  ) then
    alter table public.site00_bldr_intakes
      add constraint site00_bldr_intakes_status_check check (
        status in (
          'DRAFT', 'IN_PROGRESS', 'AWAITING_EMAIL_VERIFICATION', 'ACTIVE',
          'SUBMITTED', 'IN_REVIEW', 'REVIEWED', 'CONVERTED', 'ARCHIVED'
        )
      );
  end if;
end $$;

create index if not exists site00_bldr_intakes_user_id_idx on public.site00_bldr_intakes (user_id);
create index if not exists site00_bldr_intakes_email_idx on public.site00_bldr_intakes (lower(email)) where email is not null;

-- ---------------------------------------------------------------------------
-- C. Secure guest access tokens — polymorphic across intake types.
--    Raw tokens are never stored; only a sha256 hash. Server issues the raw token once
--    (in the email event payload / response) and can only ever look records up by hash.
-- ---------------------------------------------------------------------------
create table if not exists public.site00_intake_access_tokens (
  id uuid primary key default gen_random_uuid(),
  intake_type text not null check (intake_type in ('IDENTITY', 'BUILDER')),
  intake_id uuid not null,
  token_hash text not null,
  purpose text not null default 'GUEST_ACCESS' check (purpose in ('GUEST_ACCESS', 'EMAIL_VERIFICATION')),
  guest_email text,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_used_at timestamptz,
  used_count integer not null default 0,
  revoked_at timestamptz,
  replaced_by_token_id uuid references public.site00_intake_access_tokens(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint site00_intake_access_tokens_token_hash_unique unique (token_hash)
);

create index if not exists site00_intake_access_tokens_intake_idx
  on public.site00_intake_access_tokens (intake_type, intake_id);
create index if not exists site00_intake_access_tokens_expires_idx
  on public.site00_intake_access_tokens (expires_at);

-- ---------------------------------------------------------------------------
-- D. Intake audit events — polymorphic, coalesced (autosave does NOT write one row per
--    keystroke; last_saved_at on the intake row carries that signal instead).
-- ---------------------------------------------------------------------------
create table if not exists public.site00_intake_events (
  id uuid primary key default gen_random_uuid(),
  intake_type text not null check (intake_type in ('IDENTITY', 'BUILDER')),
  intake_id uuid not null,
  event_type text not null check (
    event_type in (
      'INTAKE_CREATED', 'INTAKE_EMAIL_ASSOCIATED', 'INTAKE_SAVED', 'INTAKE_ACCESS_ISSUED',
      'INTAKE_RESUMED', 'INTAKE_SUBMITTED', 'INTAKE_CLAIMED', 'INTAKE_MARKED_IN_REVIEW',
      'INTAKE_CONVERTED', 'INTAKE_ARCHIVED'
    )
  ),
  actor text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists site00_intake_events_intake_idx
  on public.site00_intake_events (intake_type, intake_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS — service_role only, same pattern as site00_access_credentials. Server API routes are
-- the sole authorization boundary (Node layer verifies owner/guest-token/admin before any read
-- or write); this does not weaken the existing model used elsewhere in SITE 00.
-- ---------------------------------------------------------------------------
alter table public.site00_intake_access_tokens enable row level security;
alter table public.site00_intake_events enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['site00_intake_access_tokens', 'site00_intake_events'] loop
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
