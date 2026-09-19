-- P0.VR.TWINV3.0R8M — Durable mobile twin package approval + implementation builds

create table if not exists public.site00_mobile_twin_package_approvals (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,
  workspace_type text not null default 'DESIGN',
  viewport text not null default 'MOBILE',
  package_id text not null,
  package_checksum text not null,
  composition_state_id text not null,
  composition_hash text not null,
  actual_render_id text not null,
  actual_render_hash text not null,
  blueprint_render_id text not null,
  blueprint_render_hash text not null,
  implementation_visual_authority_id text not null,
  provider_strategy text not null default 'UNRESOLVED',
  feature_manifest_version text not null,
  project_context_version text not null,
  approved_at timestamptz not null,
  approved_by text not null default 'founder',
  approval_version text not null default 'r8m-v1',
  status text not null default 'APPROVED',
  source text not null default 'FOUNDER_APPROVAL',
  approval_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_mt_pkg_approvals_project_idx
  on public.site00_mobile_twin_package_approvals (project_id, approved_at desc);

create unique index if not exists site00_mt_pkg_approvals_package_uidx
  on public.site00_mobile_twin_package_approvals (project_id, package_id, approval_version);

create table if not exists public.site00_mobile_twin_implementation_builds (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,
  package_approval_id uuid not null references public.site00_mobile_twin_package_approvals(id) on delete cascade,
  package_id text not null,
  package_checksum text not null,
  composition_hash text not null,
  implementation_version text not null,
  preview_route text not null,
  compiled_at timestamptz not null default now(),
  build_status text not null default 'PREVIEW_BUILD_READY',
  compiled_document jsonb not null default '{}'::jsonb,
  visual_fidelity_receipt jsonb,
  structural_fidelity_receipt jsonb,
  functional_qa jsonb,
  founder_status text not null default 'PENDING',
  promotion_status text not null default 'NOT_READY',
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_mt_impl_builds_project_idx
  on public.site00_mobile_twin_implementation_builds (project_id, compiled_at desc);

create table if not exists public.site00_mobile_twin_implementation_state (
  project_id text primary key,
  status text not null default 'NOT_STARTED',
  latest_package_approval_id uuid references public.site00_mobile_twin_package_approvals(id) on delete set null,
  latest_build_id uuid references public.site00_mobile_twin_implementation_builds(id) on delete set null,
  implementation_payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site00_mobile_twin_package_approvals enable row level security;
alter table public.site00_mobile_twin_implementation_builds enable row level security;
alter table public.site00_mobile_twin_implementation_state enable row level security;
