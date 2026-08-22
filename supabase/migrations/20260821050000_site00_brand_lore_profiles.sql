-- SITE 00 — Brand Lore Profile system of record.
--
-- Productionizes BrandLoreProfile (previously memory-only — see
-- api/_lib/site00BrandLore/memoryStore.ts) into durable Supabase storage so it survives
-- refresh/logout/server restart/deployment and can serve as the upstream intelligence layer for
-- Creative Direction readiness (see docs/site00/CORE_DIRECTION_METHODOLOGY.md and
-- shared/site00-brand-lore/readiness.ts).
--
-- Design notes (see sprint audit — "BRAND LORE PRODUCTIONIZATION + INTAKE JOURNEY CLOSURE"):
--   - A dedicated table is used rather than the generic site00_canon_records /
--     site00_references tables (20260820180000_site00_production_orchestration.sql) because
--     those enforce organization_id NOT NULL, but a BrandLoreProfile legitimately exists before
--     any organization/project record does (guest Identity intake drafts synthesize lore from the
--     first autosave tick, long before a project is created). organization_id/project_id are kept
--     nullable here and backfilled once the intake is claimed into a real project.
--   - "Mutable current profile + audit history" (not versioned snapshots): profile_version is a
--     simple monotonically-incrementing counter on the current row; founder confirmation events
--     are audited through the EXISTING site00_intake_events table (event_type
--     'BRAND_LORE_FIELD_CONFIRMED'), not a new versions table — this is the simplest architecture
--     consistent with existing SITE 00 conventions (see VI in the sprint spec) and avoids a
--     redundant parallel audit mechanism.
--   - The full structured BrandLoreProfile (every BrandLoreField with value/classification/
--     confidence/sourceAnswerIds/sourceType/founderConfirmationState/updatedAt, plus
--     rawLoreAnswers) is preserved verbatim in the `profile` jsonb column — provenance is never
--     flattened away.

create table if not exists public.site00_brand_lore_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.site00_organizations(id) on delete set null,
  project_id uuid references public.site00_projects(id) on delete set null,
  source_intake_type text not null check (source_intake_type in ('IDENTITY', 'BUILDER')),
  source_intake_id text not null,
  profile_version integer not null default 1,
  expression_context text,
  readiness_state text not null default 'CONTEXT_INCOMPLETE'
    check (readiness_state in ('CONTEXT_INCOMPLETE', 'CONTEXT_PARTIAL', 'CORE_DIRECTION_READY')),
  readiness_missing_domains jsonb not null default '[]'::jsonb,
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_intake_type, source_intake_id)
);

create index if not exists site00_brand_lore_profiles_org_idx
  on public.site00_brand_lore_profiles (organization_id);

create index if not exists site00_brand_lore_profiles_project_idx
  on public.site00_brand_lore_profiles (project_id);

-- Server-mediated access only (all reads/writes go through api/_lib/site00BrandLore/* using the
-- service-role client, mirroring api/_lib/site00Intakes/supabaseStore.ts) — deny by default,
-- explicit service_role policy for clarity/audit, same convention as
-- 20260820180000_site00_production_orchestration.sql.
alter table public.site00_brand_lore_profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'site00_brand_lore_profiles' and policyname = 'service_role_all'
  ) then
    create policy service_role_all on public.site00_brand_lore_profiles
      for all to service_role using (true) with check (true);
  end if;
end $$;
