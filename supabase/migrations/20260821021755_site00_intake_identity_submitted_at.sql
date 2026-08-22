-- SITE 00 — site00_idnty_submissions is missing submitted_at (site00_bldr_intakes already has it
-- from the original 20260818180000_site00_admin_operations.sql schema). The shared intake store
-- (api/_lib/site00Intakes/supabaseStore.ts) reads/writes submitted_at for both intake types, so
-- both tables must carry the column. Additive only.

alter table public.site00_idnty_submissions
  add column if not exists submitted_at timestamptz;

create index if not exists site00_idnty_submissions_submitted_at_idx
  on public.site00_idnty_submissions (submitted_at);
