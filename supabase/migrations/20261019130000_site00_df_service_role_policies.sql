-- Digital Foundation — service_role RLS policies (align with other SITE 00 tables).
-- Backend API uses service_role; anon/authenticated must not gain direct table access.

do $$
declare
  t text;
begin
  foreach t in array array[
    'site00_df_referral_sources',
    'site00_df_leads',
    'site00_df_artifacts',
    'site00_df_quotes',
    'site00_df_quote_acceptances',
    'site00_df_artifact_events',
    'site00_df_client_actions',
    'site00_df_approvals',
    'site00_df_project_stages',
    'site00_df_build_credits',
    'site00_df_stripe_events',
    'site00_df_checkout_sessions',
    'site00_df_operations_bundle'
  ]
  loop
    execute format('drop policy if exists service_role_all on public.%I', t);
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
