-- SITE 00 Sprint 01 — Production Orchestration Foundation
-- Multi-project registry, launch manifests, external systems, knowledge layer

-- ─── Organization / brand registry ───

create table if not exists public.site00_organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  classification text not null,
  state text not null default 'ACTIVE',
  repository_ownership text,
  production_engine text,
  external_repository text,
  host text,
  role text,
  client_facing boolean not null default true,
  reconciliation_state text not null default 'UNRECONCILED',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_organization_relationships (
  id uuid primary key default gen_random_uuid(),
  source_organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  target_organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  relationship_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (source_organization_id, target_organization_id, relationship_type)
);

alter table public.site00_projects
  add column if not exists organization_id uuid references public.site00_organizations(id) on delete set null;

alter table public.site00_projects
  add column if not exists orchestration_state text;

alter table public.site00_projects
  add column if not exists project_classification text;

-- ─── Methodology & workstreams ───

create table if not exists public.site00_methodology_stages (
  id uuid primary key default gen_random_uuid(),
  stage_key text not null unique,
  display_name text not null,
  sort_order int not null default 0,
  description text,
  active boolean not null default true
);

create table if not exists public.site00_workstreams (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  project_id uuid references public.site00_projects(id) on delete set null,
  stage_key text references public.site00_methodology_stages(stage_key) on delete set null,
  workstream_key text not null,
  title text not null,
  description text,
  owner_email text,
  attention_state text not null default 'NORMAL',
  execution_status text not null default 'NOT_STARTED',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, workstream_key)
);

-- ─── Launch manifests & requirements ───

create table if not exists public.site00_launch_manifests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  project_id uuid references public.site00_projects(id) on delete set null,
  target_name text not null,
  target_type text not null,
  objective text,
  target_date date,
  manifest_state text not null default 'PROPOSED',
  approval_state text not null default 'PENDING',
  is_active boolean not null default false,
  readiness_score int,
  readiness_explanation jsonb not null default '{}'::jsonb,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_launch_manifests_org_active_idx
  on public.site00_launch_manifests(organization_id, is_active)
  where is_active = true;

create table if not exists public.site00_manifest_requirements (
  id uuid primary key default gen_random_uuid(),
  manifest_id uuid not null references public.site00_launch_manifests(id) on delete cascade,
  workstream_id uuid references public.site00_workstreams(id) on delete set null,
  requirement_key text not null,
  title text not null,
  description text,
  why_required text,
  source_of_requirement text,
  classification text not null default 'REQUIRED_FOR_LAUNCH',
  execution_status text not null default 'NOT_STARTED',
  priority text not null default 'MEDIUM',
  owner_email text,
  can_defer boolean not null default false,
  deferred_until date,
  target_milestone text,
  blocking_impact text,
  admin_notes text,
  external_source_ref text,
  sort_order int not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (manifest_id, requirement_key)
);

create table if not exists public.site00_requirement_dependencies (
  id uuid primary key default gen_random_uuid(),
  manifest_id uuid not null references public.site00_launch_manifests(id) on delete cascade,
  source_requirement_id uuid not null references public.site00_manifest_requirements(id) on delete cascade,
  target_requirement_id uuid not null references public.site00_manifest_requirements(id) on delete cascade,
  dependency_type text not null default 'blocks',
  unique (source_requirement_id, target_requirement_id)
);

create table if not exists public.site00_manifest_deferrals (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references public.site00_manifest_requirements(id) on delete cascade,
  manifest_id uuid not null references public.site00_launch_manifests(id) on delete cascade,
  deferred_by uuid references auth.users(id) on delete set null,
  deferred_by_email text,
  deferred_at timestamptz not null default now(),
  reason text not null,
  original_classification text not null,
  new_classification text not null default 'DEFERRED_BY_OWNER',
  destination_milestone text,
  impact_snapshot jsonb not null default '{}'::jsonb,
  evolve_roadmap_item_id uuid
);

create table if not exists public.site00_launch_overrides (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references public.site00_manifest_requirements(id) on delete cascade,
  manifest_id uuid not null references public.site00_launch_manifests(id) on delete cascade,
  approver_id uuid references auth.users(id) on delete set null,
  approver_email text,
  reason text not null,
  impact_acknowledgment text,
  overridden_at timestamptz not null default now()
);

-- ─── External systems ───

create table if not exists public.site00_external_systems (
  id uuid primary key default gen_random_uuid(),
  system_key text not null unique,
  system_type text not null,
  display_name text not null,
  description text,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.site00_external_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  project_id uuid references public.site00_projects(id) on delete set null,
  external_system_id uuid not null references public.site00_external_systems(id) on delete cascade,
  logical_name text not null,
  connection_state text not null default 'NOT_CONNECTED',
  external_identifier text,
  environment text not null default 'production',
  sync_state text not null default 'NEVER_SYNCED',
  last_sync_at timestamptz,
  health_state text not null default 'UNKNOWN',
  secret_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, external_system_id, logical_name)
);

-- ─── Signals, evidence, reconciliation ───

create table if not exists public.site00_project_signals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  project_id uuid references public.site00_projects(id) on delete set null,
  workstream_id uuid references public.site00_workstreams(id) on delete set null,
  source text not null,
  event_type text not null,
  external_id text,
  signal_timestamp timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  processed_state text not null default 'PENDING',
  reconciliation_state text not null default 'UNPROCESSED',
  created_at timestamptz not null default now()
);

create table if not exists public.site00_evidence_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  requirement_id uuid references public.site00_manifest_requirements(id) on delete set null,
  workstream_id uuid references public.site00_workstreams(id) on delete set null,
  signal_id uuid references public.site00_project_signals(id) on delete set null,
  evidence_type text not null,
  title text not null,
  description text,
  source text not null,
  external_ref text,
  does_not_imply_completion boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now(),
  recorded_by text
);

create table if not exists public.site00_reconciliation_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  requirement_id uuid references public.site00_manifest_requirements(id) on delete set null,
  workstream_id uuid references public.site00_workstreams(id) on delete set null,
  declared_state text not null,
  observed_evidence_summary text,
  suggested_state text,
  confidence text not null default 'MEDIUM',
  outcome text not null default 'REQUIRES_REVIEW',
  admin_decision text,
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ─── Canon / Reference / Template / Instance ───

create table if not exists public.site00_canon_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  canon_type text not null,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  approval_state text not null default 'DRAFT',
  current_version int not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_canon_versions (
  id uuid primary key default gen_random_uuid(),
  canon_id uuid not null references public.site00_canon_records(id) on delete cascade,
  version_number int not null,
  content jsonb not null default '{}'::jsonb,
  changed_by text,
  change_reason text,
  created_at timestamptz not null default now(),
  unique (canon_id, version_number)
);

create table if not exists public.site00_reference_families (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  family_key text not null,
  title text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, family_key)
);

create table if not exists public.site00_references (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  family_id uuid references public.site00_reference_families(id) on delete set null,
  reference_type text not null,
  title text not null,
  asset_ref text,
  approval_state text not null default 'DRAFT',
  version int not null default 1,
  parent_reference_id uuid references public.site00_references(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_production_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  reference_id uuid references public.site00_references(id) on delete set null,
  template_key text not null,
  title text not null,
  template_type text not null,
  implementation_spec jsonb not null default '{}'::jsonb,
  approval_state text not null default 'DRAFT',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, template_key)
);

create table if not exists public.site00_production_instances (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  template_id uuid references public.site00_production_templates(id) on delete set null,
  instance_key text not null,
  title text not null,
  rendered_output_ref text,
  status text not null default 'DRAFT',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Content brain & evolve ───

create table if not exists public.site00_content_brain_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  entry_type text not null,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  approval_state text not null default 'DRAFT',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_evolve_roadmap_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  manifest_id uuid references public.site00_launch_manifests(id) on delete set null,
  deferred_requirement_id uuid references public.site00_manifest_requirements(id) on delete set null,
  deferral_id uuid references public.site00_manifest_deferrals(id) on delete set null,
  title text not null,
  description text,
  category text not null default 'EVOLVE',
  priority text not null default 'MEDIUM',
  status text not null default 'PLANNED',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site00_manifest_deferrals
  drop constraint if exists site00_manifest_deferrals_evolve_fkey;
alter table public.site00_manifest_deferrals
  add constraint site00_manifest_deferrals_evolve_fkey
  foreign key (evolve_roadmap_item_id) references public.site00_evolve_roadmap_items(id) on delete set null;

-- ─── Project ingestion & orchestration history ───

create table if not exists public.site00_project_ingestions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.site00_organizations(id) on delete set null,
  project_name text not null,
  organization_name text,
  project_classification text,
  project_type text,
  existing_or_new text not null default 'EXISTING',
  current_state text,
  repository_reference text,
  production_engine text,
  known_database text,
  known_deployment text,
  current_objective text,
  current_launch_target text,
  ingestion_state text not null default 'RECONCILIATION_REQUIRED',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_orchestration_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.site00_organizations(id) on delete set null,
  manifest_id uuid references public.site00_launch_manifests(id) on delete set null,
  requirement_id uuid references public.site00_manifest_requirements(id) on delete set null,
  event_type text not null,
  actor_type text not null default 'SYSTEM',
  actor_email text,
  summary text not null,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists site00_orchestration_events_org_idx
  on public.site00_orchestration_events(organization_id, created_at desc);

create index if not exists site00_evidence_records_req_idx
  on public.site00_evidence_records(requirement_id);

create index if not exists site00_project_signals_org_idx
  on public.site00_project_signals(organization_id, created_at desc);

-- ─── RLS (service_role only) ───

do $$
declare
  t text;
begin
  foreach t in array array[
    'site00_organizations','site00_organization_relationships',
    'site00_methodology_stages','site00_workstreams',
    'site00_launch_manifests','site00_manifest_requirements',
    'site00_requirement_dependencies','site00_manifest_deferrals',
    'site00_launch_overrides','site00_external_systems',
    'site00_external_connections','site00_project_signals',
    'site00_evidence_records','site00_reconciliation_records',
    'site00_canon_records','site00_canon_versions',
    'site00_reference_families','site00_references',
    'site00_production_templates','site00_production_instances',
    'site00_content_brain_entries','site00_evolve_roadmap_items',
    'site00_project_ingestions','site00_orchestration_events'
  ] loop
    execute format('alter table public.%I enable row level security', t);
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

-- ─── Seed methodology stages ───

insert into public.site00_methodology_stages (stage_key, display_name, sort_order, description)
values
  ('IDEA', 'IDEA', 10, 'Initial concept and opportunity'),
  ('FOUNDATION', 'FOUNDATION', 20, 'Core business and project foundation'),
  ('IDENTITY', 'IDENTITY', 30, 'Brand identity and positioning'),
  ('WORLD', 'WORLD', 40, 'Brand world and creative universe'),
  ('DIGITAL', 'DIGITAL', 50, 'Digital product and platform'),
  ('COMMUNICATION', 'COMMUNICATION', 60, 'Communication systems'),
  ('SOCIAL', 'SOCIAL', 70, 'Social presence and assets'),
  ('CONTENT', 'CONTENT', 80, 'Content production'),
  ('CAMPAIGN', 'CAMPAIGN', 90, 'Campaign and launch creative'),
  ('LAUNCH', 'LAUNCH', 100, 'Launch execution'),
  ('EVOLVE', 'EVOLVE', 110, 'Post-launch evolution')
on conflict (stage_key) do nothing;

-- ─── Seed external system types ───

insert into public.site00_external_systems (system_key, system_type, display_name, description)
values
  ('github_site00', 'GITHUB_REPOSITORY', 'SITE 00 GitHub', 'SITE 00 repository'),
  ('github_fs', 'GITHUB_REPOSITORY', 'Frontal Slayer GitHub', 'Frontal Slayer / Studio World repository'),
  ('github_aio', 'GITHUB_REPOSITORY', 'AIO GitHub', 'All In One Enterprises repository'),
  ('studio_world', 'STUDIO_WORLD', 'Studio World', 'Production engine infrastructure'),
  ('supabase_site00', 'SUPABASE_PROJECT', 'SITE 00 Supabase', 'SITE 00 database project'),
  ('deployment_godaddy', 'DEPLOYMENT_PROVIDER', 'GoDaddy cPanel', 'Static deployment provider'),
  ('email_provider', 'EMAIL_PROVIDER', 'Email Provider', 'Transactional email'),
  ('analytics_provider', 'ANALYTICS_PROVIDER', 'Analytics Provider', 'Web analytics')
on conflict (system_key) do nothing;
