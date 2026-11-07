-- JURNL internal authorization grants (FOUNDER_FULL). Service-role writes only; no end-user RLS policies.
-- Do not apply to production until founder-approved migration window.
-- Grant lifecycle: ACTIVE → REVOKED (no routine DELETE). Audit rows retained (FK RESTRICT).

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
  grant_id uuid not null references public.jurnl_internal_grants (grant_id) on delete restrict,
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
-- Trusted API uses service role (bypasses RLS) and SECURITY INVOKER RPCs below.

comment on table public.jurnl_internal_grants is 'JURNL internal grants (FOUNDER_FULL). Not a billing subscription.';
comment on table public.jurnl_internal_grant_audit is 'Append-only audit trail for internal grant lifecycle.';

-- Atomic grant upsert (insert or idempotent ACTIVE update) + audit in one transaction.
create or replace function public.jurnl_internal_grant_upsert(
  p_project_id text,
  p_principal_id uuid,
  p_grant_type text,
  p_granted_by uuid,
  p_reason text,
  p_schema_version text default 'SITE00.INTERNAL_GRANT.V1'
) returns public.jurnl_internal_grants
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_existing public.jurnl_internal_grants;
  v_row public.jurnl_internal_grants;
begin
  if p_grant_type <> 'FOUNDER_FULL' then
    raise exception 'INVALID_GRANT_TYPE';
  end if;

  select * into v_existing
  from public.jurnl_internal_grants
  where project_id = p_project_id
    and principal_id = p_principal_id
    and grant_type = p_grant_type
    and status = 'ACTIVE'
  for update;

  if found then
    update public.jurnl_internal_grants
    set reason = p_reason,
        updated_at = now(),
        granted_by = p_granted_by
    where grant_id = v_existing.grant_id
    returning * into v_row;

    insert into public.jurnl_internal_grant_audit (grant_id, action, actor_id, reason)
    values (v_row.grant_id, 'GRANT', p_granted_by, 'IDEMPOTENT_UPDATE: ' || p_reason);

    return v_row;
  end if;

  begin
    insert into public.jurnl_internal_grants (
      project_id, principal_id, grant_type, status, granted_by, reason, schema_version
    ) values (
      p_project_id, p_principal_id, p_grant_type, 'ACTIVE', p_granted_by, p_reason, p_schema_version
    ) returning * into v_row;
  exception
    when unique_violation then
      select * into v_row
      from public.jurnl_internal_grants
      where project_id = p_project_id
        and principal_id = p_principal_id
        and grant_type = p_grant_type
        and status = 'ACTIVE';
      if not found then
        raise;
      end if;
      update public.jurnl_internal_grants
      set reason = p_reason, updated_at = now(), granted_by = p_granted_by
      where grant_id = v_row.grant_id
      returning * into v_row;
  end;

  insert into public.jurnl_internal_grant_audit (grant_id, action, actor_id, reason)
  values (v_row.grant_id, 'GRANT', p_granted_by, p_reason);

  return v_row;
end;
$$;

-- Atomic revoke + audit in one transaction.
create or replace function public.jurnl_internal_grant_revoke(
  p_project_id text,
  p_principal_id uuid,
  p_grant_type text,
  p_revoked_by uuid,
  p_reason text
) returns public.jurnl_internal_grants
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_active public.jurnl_internal_grants;
  v_row public.jurnl_internal_grants;
begin
  if p_grant_type <> 'FOUNDER_FULL' then
    raise exception 'INVALID_GRANT_TYPE';
  end if;

  select * into v_active
  from public.jurnl_internal_grants
  where project_id = p_project_id
    and principal_id = p_principal_id
    and grant_type = p_grant_type
    and status = 'ACTIVE'
  for update;

  if not found then
    raise exception 'GRANT_NOT_FOUND';
  end if;

  update public.jurnl_internal_grants
  set status = 'REVOKED',
      updated_at = now(),
      revoked_at = now(),
      reason = v_active.reason || ' · REVOKED: ' || p_reason
  where grant_id = v_active.grant_id
  returning * into v_row;

  insert into public.jurnl_internal_grant_audit (grant_id, action, actor_id, reason)
  values (v_row.grant_id, 'REVOKE', p_revoked_by, p_reason);

  return v_row;
end;
$$;

revoke all on function public.jurnl_internal_grant_upsert(text, uuid, text, uuid, text, text) from public;
revoke all on function public.jurnl_internal_grant_revoke(text, uuid, text, uuid, text) from public;
grant execute on function public.jurnl_internal_grant_upsert(text, uuid, text, uuid, text, text) to service_role;
grant execute on function public.jurnl_internal_grant_revoke(text, uuid, text, uuid, text) to service_role;
