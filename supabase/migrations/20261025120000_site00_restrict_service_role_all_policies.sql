-- D-14 — two policies named service_role_all were created without a TO clause, so they applied to every role
-- (anon and authenticated included). Restrict both to service_role. Only server code reads these tables, through the
-- service-role client. Idempotent; no data change. Verified on an isolated cluster by
-- scripts/production/verify-role-policies.sh, never against a live project.

do $$
begin
  if to_regclass('public.site00_brand_creative_context') is not null then
    drop policy if exists service_role_all on public.site00_brand_creative_context;
    create policy service_role_all on public.site00_brand_creative_context
      for all to service_role using (true) with check (true);
  end if;

  if to_regclass('public.site00_page_concept_generation_runs') is not null then
    drop policy if exists service_role_all on public.site00_page_concept_generation_runs;
    create policy service_role_all on public.site00_page_concept_generation_runs
      for all to service_role using (true) with check (true);
  end if;
end $$;
