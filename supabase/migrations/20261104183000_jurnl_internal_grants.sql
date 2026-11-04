-- JURNL internal authorization grants (FOUNDER_FULL). Service-role writes only; no end-user RLS policies.
-- Do not apply to production until founder-approved migration window.

create table if not exists public.jurnl_internal_grants (
  grant_id uuid primary key default gen_random_uuid(),
  project_id text not null,
  principal_id uuid not null references auth.users (id) on delete cascade,
  grant_type text not null check (grant_type in ('FOUNDER_FULL')),
  status text not null check (status in ('ACTIVE', 'REVOKED')),
  granted_by uuid not null,
  reason text not null,
  schema_version text not null default 'SITE00.INTERNAL_GRANT.V1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz
);

create unique index if not exists jurnl_internal_grants_one_active_idx
  on public.jurnl_internal_grants (project_id, principal_id, grant_type)
  where status = 'ACTIVE';

create index if not exists jurnl_internal_grants_principal_idx
  on public.jurnl_internal_grants (project_id, principal_id, status);

create table if not exists public.jurnl_internal_grant_audit (
  audit_id uuid primary key default gen_random_uuid(),
  grant_id uuid not null references public.jurnl_internal_grants (grant_id) on delete cascade,
  action text not null check (action in ('GRANT', 'REVOKE')),
  actor_id uuid not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists jurnl_internal_grant_audit_grant_idx
  on public.jurnl_internal_grant_audit (grant_id, created_at desc);

alter table public.jurnl_internal_grants enable row level security;
alter table public.jurnl_internal_grant_audit enable row level security;

-- Intentionally no policies: authenticated users cannot read or write grants.
-- Trusted API uses service role (bypasses RLS).

comment on table public.jurnl_internal_grants is 'JURNL internal grants (FOUNDER_FULL). Not a billing subscription.';
comment on table public.jurnl_internal_grant_audit is 'Append-only audit trail for internal grant lifecycle.';
