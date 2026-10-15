-- Digital Foundation — align project_messages with other site00_df_* tables.
--
-- Pattern (artifact v1): RLS enabled, no permissive policies. Railway API uses the
-- Supabase service role (bypasses RLS). PostgREST roles anon/authenticated hold no
-- SELECT/INSERT/UPDATE/DELETE on this table (same as site00_df_artifacts).
--
-- Runtime messaging today persists in site00_df_operations_bundle JSON; this table is
-- forward-compatible storage. Enabling RLS closes the gap where RLS was left off.
--
-- Idempotent: safe to re-run. No data deletion or column changes.

alter table if exists public.site00_df_project_messages enable row level security;

-- Ensure PostgREST roles cannot gain row access if table privileges change later.
revoke select, insert, update, delete on table public.site00_df_project_messages from anon, authenticated;
