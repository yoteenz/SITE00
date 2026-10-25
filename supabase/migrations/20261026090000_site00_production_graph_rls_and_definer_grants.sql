-- D-14 follow-up (P0.SITE00.STUDIOWORLD.PRODUCTION-LIVE-PERSISTENCE-SECURITY-AND-FIRST-SHOT-READINESS.V1).
--
-- A read-only inspection of the production project on 2026-10-25 (Supabase security advisor and pg_class) found
-- two more cross-role exposures in SITE 00 objects, beyond the two policies repaired by
-- 20261025120000_site00_restrict_service_role_all_policies.sql:
--
--   1. site00_production_dependency_edges and site00_production_invalidation_events have row level security
--      DISABLED, so the anon and authenticated roles can read and write them through PostgREST. No application code
--      reads or writes either table; the server would use the service role if it did.
--   2. site00_allocate_access_credential_code() is SECURITY DEFINER and executable by anon and authenticated. Only
--      the server calls it, through the service-role client (api/_lib/site00AccessCredentials/service.ts).
--
-- This migration enables RLS on the two tables with a service-role-only policy (the pattern every other SITE 00
-- table uses) and limits EXECUTE on the function to service_role. It is idempotent, changes no data, and does nothing
-- for an object that does not exist.
--
-- Rollback (restores the previous exposure; only if a caller outside this repository breaks):
--   alter table public.site00_production_dependency_edges disable row level security;
--   alter table public.site00_production_invalidation_events disable row level security;
--   grant execute on function public.site00_allocate_access_credential_code() to anon, authenticated;

do $$
declare
  t text;
begin
  foreach t in array array['site00_production_dependency_edges', 'site00_production_invalidation_events'] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists service_role_all on public.%I', t);
      execute format('create policy service_role_all on public.%I for all to service_role using (true) with check (true)', t);
    end if;
  end loop;
end $$;

do $$
begin
  if to_regprocedure('public.site00_allocate_access_credential_code()') is not null then
    revoke execute on function public.site00_allocate_access_credential_code() from public, anon, authenticated;
    grant execute on function public.site00_allocate_access_credential_code() to service_role;
  end if;
end $$;
