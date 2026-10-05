-- P0.VR.DESIGN-PRODUCTION1R1 — server-authoritative design workspace authority session

create table if not exists public.site00_design_workspace_authority_sessions (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,
  page_id text not null,
  session_version integer not null default 1,
  design_authority_version text not null default 'design-authority-v1',
  interaction_contract_version text not null default '2.0.0',
  interaction_contract_hash text not null default '',
  workflow_stage text not null default 'DESIGN',
  package_status text not null default 'DESIGN_IN_PROGRESS',
  latest_build_package_id text,
  state_payload jsonb not null default '{}'::jsonb,
  readiness_snapshot jsonb,
  provenance_snapshot jsonb,
  authority_locked_at timestamptz,
  authority_locked_by text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint site00_dwas_project_page_uidx unique (project_id, page_id)
);

create index if not exists site00_dwas_project_idx
  on public.site00_design_workspace_authority_sessions (project_id, updated_at desc);

create table if not exists public.site00_design_workspace_authority_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.site00_design_workspace_authority_sessions(id) on delete cascade,
  project_id text not null,
  page_id text not null,
  event_type text not null,
  actor_email text,
  design_authority_version text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists site00_dwae_session_idx
  on public.site00_design_workspace_authority_events (session_id, created_at desc);

create index if not exists site00_dwae_project_page_idx
  on public.site00_design_workspace_authority_events (project_id, page_id, created_at desc);

create table if not exists public.site00_design_workspace_build_packages (
  id text primary key,
  session_id uuid not null references public.site00_design_workspace_authority_sessions(id) on delete cascade,
  project_id text not null,
  page_id text not null,
  design_authority_version text not null,
  interaction_contract_version text not null,
  asset_manifest_version text not null,
  provenance_version text not null,
  readiness_receipt_id text not null,
  package_payload jsonb not null default '{}'::jsonb,
  created_by text,
  created_at timestamptz not null default now()
);

create index if not exists site00_dwbp_project_idx
  on public.site00_design_workspace_build_packages (project_id, page_id, created_at desc);

alter table public.site00_design_workspace_authority_sessions enable row level security;
alter table public.site00_design_workspace_authority_events enable row level security;
alter table public.site00_design_workspace_build_packages enable row level security;
