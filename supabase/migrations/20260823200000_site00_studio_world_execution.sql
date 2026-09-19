-- SITE 00 — Studio World durable execution truth layer (P0 sprint).
-- Execution envelopes, domain persistence, idempotency, capability verification.

-- ── Execution run envelope ────────────────────────────────────────────────

create table if not exists public.site00_studio_world_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  project_id uuid references public.site00_projects(id) on delete set null,
  project_slug text,
  brand_id uuid,
  brand_slug text,
  run_type text not null,
  run_subtype text,
  methodology_domain text,
  methodology_version text,
  experiment_id text,
  experiment_version text,
  parent_run_id uuid references public.site00_studio_world_runs(id) on delete set null,
  root_run_id uuid references public.site00_studio_world_runs(id) on delete set null,
  idempotency_key text,
  status text not null default 'CREATED',
  normalized_status text not null default 'CREATED',
  requested_by text,
  trigger_type text,
  input_fingerprint text,
  output_fingerprint text,
  snapshot_id text,
  snapshot_fingerprint text,
  provider_summary jsonb not null default '{}'::jsonb,
  cost_summary jsonb not null default '{}'::jsonb,
  error_summary jsonb,
  metadata jsonb not null default '{}'::jsonb,
  domain_record_type text,
  domain_record_id text,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  cancelled_at timestamptz,
  superseded_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists site00_studio_world_runs_project_idx
  on public.site00_studio_world_runs (project_id, created_at desc);

create index if not exists site00_studio_world_runs_slug_type_idx
  on public.site00_studio_world_runs (project_slug, run_type, created_at desc);

create index if not exists site00_studio_world_runs_status_idx
  on public.site00_studio_world_runs (normalized_status, updated_at desc);

create index if not exists site00_studio_world_runs_experiment_idx
  on public.site00_studio_world_runs (experiment_id, created_at desc);

create unique index if not exists site00_studio_world_runs_idempotency_uidx
  on public.site00_studio_world_runs (project_slug, idempotency_key)
  where idempotency_key is not null;

-- ── Durable idempotency authority ─────────────────────────────────────────

create table if not exists public.site00_studio_world_idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  project_id uuid references public.site00_projects(id) on delete set null,
  project_slug text,
  idempotency_key text not null,
  input_fingerprint text not null,
  run_id uuid not null references public.site00_studio_world_runs(id) on delete cascade,
  run_type text not null,
  created_at timestamptz not null default now(),
  unique (project_slug, idempotency_key, input_fingerprint)
);

create index if not exists site00_studio_world_idempotency_run_idx
  on public.site00_studio_world_idempotency_keys (run_id);

-- ── Project intelligence manifests (post-purchase, distinct from discovery) ─

create table if not exists public.site00_project_intelligence_manifests (
  id uuid primary key default gen_random_uuid(),
  manifest_id text not null unique,
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  project_slug text not null,
  manifest_version integer not null,
  fingerprint text not null,
  record jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_pi_manifests_slug_version_idx
  on public.site00_project_intelligence_manifests (project_slug, manifest_version desc);

create index if not exists site00_pi_manifests_fingerprint_idx
  on public.site00_project_intelligence_manifests (fingerprint);

-- ── Visual reference intelligence state ───────────────────────────────────

create table if not exists public.site00_visual_reference_state (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  scope text not null check (scope in ('HOST', 'CLIENT')),
  project_id uuid references public.site00_projects(id) on delete set null,
  project_slug text,
  record jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scope, coalesce(project_slug, ''))
);

create table if not exists public.site00_visual_reference_records (
  reference_id text primary key,
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  project_slug text,
  scope text not null,
  record jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_visual_reference_records_slug_idx
  on public.site00_visual_reference_records (project_slug, updated_at desc);

-- ── Visual development runs ─────────────────────────────────────────────────

create table if not exists public.site00_visual_development_runs (
  id uuid primary key default gen_random_uuid(),
  run_id text not null unique,
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  project_slug text not null,
  record jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_visual_development_runs_slug_idx
  on public.site00_visual_development_runs (project_slug);

-- ── Capability verification registry ────────────────────────────────────────

create table if not exists public.site00_capability_verifications (
  capability_id text not null,
  environment text not null default 'production',
  implementation_status text not null,
  verification_status text not null default 'NOT_VERIFIED',
  verified_at timestamptz,
  verification_method text,
  verification_run_id uuid references public.site00_studio_world_runs(id) on delete set null,
  source_commit text,
  notes text,
  updated_at timestamptz not null default now(),
  primary key (capability_id, environment)
);

-- ── Extend methodology validation runs for idempotency + concurrency ────────

alter table public.site00_methodology_validation_runs
  add column if not exists version integer not null default 1;

alter table public.site00_methodology_validation_runs
  add column if not exists idempotency_key text;

create unique index if not exists site00_mvr_idempotency_uidx
  on public.site00_methodology_validation_runs (idempotency_key)
  where idempotency_key is not null;

-- ── Optimistic concurrency on founder judgments ─────────────────────────────

alter table public.site00_founder_creative_judgments
  add column if not exists record_version integer not null default 1;

alter table public.site00_brand_asset_dispositions
  add column if not exists record_version integer not null default 1;

-- ── RLS (service role only for execution truth tables) ──────────────────────

alter table public.site00_studio_world_runs enable row level security;
alter table public.site00_studio_world_idempotency_keys enable row level security;
alter table public.site00_project_intelligence_manifests enable row level security;
alter table public.site00_visual_reference_state enable row level security;
alter table public.site00_visual_reference_records enable row level security;
alter table public.site00_visual_development_runs enable row level security;
alter table public.site00_capability_verifications enable row level security;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'site00_studio_world_runs',
    'site00_studio_world_idempotency_keys',
    'site00_project_intelligence_manifests',
    'site00_visual_reference_state',
    'site00_visual_reference_records',
    'site00_visual_development_runs',
    'site00_capability_verifications'
  ]
  loop
    if not exists (
      select 1 from pg_policies where tablename = tbl and policyname = 'service_role_all'
    ) then
      execute format(
        'create policy service_role_all on public.%I for all to service_role using (true) with check (true)',
        tbl
      );
    end if;
  end loop;
end $$;
