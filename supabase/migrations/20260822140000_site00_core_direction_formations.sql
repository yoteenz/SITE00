-- SITE 00 — Core Direction Formation durable records.
--
-- Productionizes CoreDirectionFormationRecord (previously memory-only in
-- api/_lib/site00Evolve/creativeDirection/creativeIntelligence/formationService.ts).
-- Server-mediated access only via service role — same convention as
-- site00_brand_lore_profiles (20260821050000_site00_brand_lore_profiles.sql).
--
-- engagement_id is nullable plain UUID — Creative Direction engagements remain
-- in-memory/process-scoped today; no durable engagement table exists to FK against.

create table if not exists public.site00_core_direction_formations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  project_id uuid references public.site00_projects(id) on delete set null,
  engagement_id uuid,
  brand_lore_profile_id uuid not null,
  brand_lore_profile_version integer not null default 1,
  brand_lore_fingerprint text not null,
  formation_version integer not null default 1,
  prompt_version text not null,
  provider_id text not null,
  model_id text not null,
  status text not null default 'NOT_READY'
    check (status in (
      'NOT_READY',
      'READY_TO_FORM',
      'FORMING',
      'CRITIQUING',
      'REVISING',
      'READY_FOR_VISUAL_PRODUCTION',
      'NEEDS_HUMAN_REVIEW',
      'FAILED'
    )),
  formation_input jsonb not null default '{}'::jsonb,
  candidate_directions jsonb not null default '[]'::jsonb,
  critic_result jsonb,
  revision_rounds integer not null default 0,
  final_directions jsonb not null default '[]'::jsonb,
  visual_proof_plans jsonb not null default '[]'::jsonb,
  idempotency_key text not null unique,
  request_count integer not null default 0,
  token_usage jsonb not null default '{}'::jsonb,
  cost_metadata jsonb not null default '{}'::jsonb,
  record jsonb not null default '{}'::jsonb,
  error_code text,
  error_message_safe text,
  started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_core_direction_formations_org_idx
  on public.site00_core_direction_formations (organization_id, updated_at desc);

create index if not exists site00_core_direction_formations_fingerprint_idx
  on public.site00_core_direction_formations (organization_id, brand_lore_fingerprint, formation_version);

alter table public.site00_core_direction_formations enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'site00_core_direction_formations' and policyname = 'service_role_all'
  ) then
    create policy service_role_all on public.site00_core_direction_formations
      for all to service_role using (true) with check (true);
  end if;
end $$;
