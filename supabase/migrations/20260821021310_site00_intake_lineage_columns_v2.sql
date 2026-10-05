-- SITE 00 — intake lineage columns (organization_id / engagement_id / project_id) on both
-- canonical intake tables, so IDENTITY intakes have the same lineage surface as BUILDER intakes
-- (which already had project_id). All nullable — most intakes stay NULL until a downstream
-- engagement/project is actually created; the original intake row is never duplicated.
--
-- NOTE: the repository's `site00_marketing_engagements` migration file exists but is NOT
-- applied to this live project (schema drift — the live EVOLVE marketing architecture uses
-- site00_marketing_profiles/site00_marketing_campaigns/site00_evolve_intakes instead). There is
-- no single canonical "engagement" table live today, so engagement_id is kept as a plain nullable
-- uuid (no FK) until that lineage entity is reconciled — see FORENSIC AUDIT / KNOWN GAPS.

alter table public.site00_idnty_submissions
  add column if not exists organization_id uuid references public.site00_organizations(id) on delete set null,
  add column if not exists engagement_id uuid,
  add column if not exists project_id uuid references public.site00_projects(id) on delete set null;

alter table public.site00_bldr_intakes
  add column if not exists organization_id uuid references public.site00_organizations(id) on delete set null,
  add column if not exists engagement_id uuid;

create index if not exists site00_idnty_submissions_project_idx on public.site00_idnty_submissions (project_id);
create index if not exists site00_idnty_submissions_org_idx on public.site00_idnty_submissions (organization_id);
create index if not exists site00_bldr_intakes_org_idx on public.site00_bldr_intakes (organization_id);
create index if not exists site00_bldr_intakes_engagement_idx on public.site00_bldr_intakes (engagement_id);
create index if not exists site00_idnty_submissions_engagement_idx on public.site00_idnty_submissions (engagement_id);
