-- P0.BRIDGE.1-SITE00 — Cross-repo design control plane (SITE 00 ↔ FSBW handoff)
-- SITE 00 owns design intent; FSBW owns source code; Supabase is shared control plane.

-- ─── Managed projects (design subject registry) ───

create table if not exists public.site00_managed_projects (
  id uuid primary key default gen_random_uuid(),
  project_key text not null unique,
  display_name text not null,
  design_authority text not null default 'SITE00',
  source_repo text,
  source_project_key text,
  project_type text not null,
  runtime_mode text not null default 'SITE00_MANAGED',
  design_enabled boolean not null default true,
  marketing_enabled boolean not null default true,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_repo_bindings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_managed_projects(id) on delete cascade,
  repo_owner text not null,
  repo_name text not null,
  default_branch text not null default 'main',
  source_project_path text,
  adapter_type text not null default 'FSBW_WEBSITE',
  runtime_binding_mode text not null default 'HYBRID',
  source_materialization_enabled boolean not null default true,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, repo_owner, repo_name)
);

-- ─── Design registry (pages, families, shells) ───

create table if not exists public.site00_design_pages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_managed_projects(id) on delete cascade,
  page_key text not null,
  route_key text not null,
  display_name text not null,
  family_id uuid,
  shell_id uuid,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, page_key)
);

create table if not exists public.site00_design_families (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_managed_projects(id) on delete cascade,
  family_key text not null,
  display_name text not null,
  version int not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, family_key)
);

create table if not exists public.site00_shared_shells (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_managed_projects(id) on delete cascade,
  shell_key text not null,
  display_name text not null,
  version int not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, shell_key)
);

-- ─── Runtime-safe bindings ───

create table if not exists public.site00_page_design_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_managed_projects(id) on delete cascade,
  page_id uuid references public.site00_design_pages(id) on delete cascade,
  version int not null default 1,
  design_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_page_content_bindings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_managed_projects(id) on delete cascade,
  page_id uuid references public.site00_design_pages(id) on delete cascade,
  binding_key text not null,
  payload jsonb not null default '{}'::jsonb,
  version int not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, page_id, binding_key)
);

create table if not exists public.site00_asset_bindings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_managed_projects(id) on delete cascade,
  page_id uuid references public.site00_design_pages(id) on delete set null,
  asset_key text not null,
  asset_url text,
  payload jsonb not null default '{}'::jsonb,
  version int not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, asset_key)
);

create table if not exists public.site00_design_token_overrides (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_managed_projects(id) on delete cascade,
  page_id uuid references public.site00_design_pages(id) on delete set null,
  token_key text not null,
  token_value text not null,
  scope text not null default 'PAGE',
  version int not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, token_key, scope)
);

-- ─── Change requests (handoff contracts) ───

create table if not exists public.site00_change_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_managed_projects(id) on delete cascade,
  repo_binding_id uuid references public.site00_repo_bindings(id) on delete set null,
  page_id uuid references public.site00_design_pages(id) on delete set null,
  family_id uuid references public.site00_design_families(id) on delete set null,
  shell_id uuid references public.site00_shared_shells(id) on delete set null,
  route_key text,
  change_execution_class text not null,
  change_type text not null,
  scope text not null default 'TARGET_ONLY',
  status text not null default 'DRAFT',
  idempotency_key text not null,
  version int not null default 1,
  base_source_commit text,
  expected_source_branch text,
  design_version int,
  shell_version int,
  family_version int,
  requested_by text,
  approved_by text,
  implementation_mode text not null default 'SOURCE_REPO_CHANGE',
  blast_radius jsonb not null default '{}'::jsonb,
  risk_level text not null default 'MEDIUM',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  applied_at timestamptz,
  superseded_at timestamptz,
  unique (project_id, idempotency_key)
);

create index if not exists site00_change_requests_project_status_idx
  on public.site00_change_requests(project_id, status);

create index if not exists site00_change_requests_ready_for_repo_idx
  on public.site00_change_requests(repo_binding_id, status)
  where status in ('READY_FOR_REPO', 'APPLYING', 'PR_CREATED', 'VALIDATED', 'MERGED');

create table if not exists public.site00_change_operations (
  id uuid primary key default gen_random_uuid(),
  change_request_id uuid not null references public.site00_change_requests(id) on delete cascade,
  operation_order int not null,
  operation_type text not null,
  target_selector text,
  target_component_key text,
  payload jsonb not null default '{}'::jsonb,
  expected_before jsonb,
  expected_after jsonb,
  required_capability text,
  created_at timestamptz not null default now(),
  unique (change_request_id, operation_order)
);

create table if not exists public.site00_change_approvals (
  id uuid primary key default gen_random_uuid(),
  change_request_id uuid not null references public.site00_change_requests(id) on delete cascade,
  approval_type text not null default 'FOUNDER',
  approved_by text not null,
  approval_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_change_receipts (
  id uuid primary key default gen_random_uuid(),
  change_request_id uuid not null references public.site00_change_requests(id) on delete cascade,
  event_type text not null,
  actor text,
  repo_commit text,
  pr_url_or_id text,
  status text not null,
  message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ─── Shell propagation ───

create table if not exists public.site00_shell_propagation_changes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_managed_projects(id) on delete cascade,
  change_request_id uuid references public.site00_change_requests(id) on delete set null,
  shell_id uuid references public.site00_shared_shells(id) on delete set null,
  old_version int,
  new_version int,
  scope text not null default 'TARGET_ONLY',
  founder_approved boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_shell_propagation_members (
  id uuid primary key default gen_random_uuid(),
  propagation_change_id uuid not null references public.site00_shell_propagation_changes(id) on delete cascade,
  page_id uuid references public.site00_design_pages(id) on delete set null,
  family_id uuid references public.site00_design_families(id) on delete set null,
  route_key text,
  component_key text,
  included boolean not null default true,
  exception_reason text,
  created_at timestamptz not null default now()
);

-- ─── Release + reference/snapshot bindings ───

create table if not exists public.site00_release_bindings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_managed_projects(id) on delete cascade,
  change_request_id uuid references public.site00_change_requests(id) on delete set null,
  release_key text not null,
  repo_commit text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (project_id, release_key)
);

create table if not exists public.site00_reference_bindings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_managed_projects(id) on delete cascade,
  page_id uuid references public.site00_design_pages(id) on delete set null,
  reference_id text not null,
  staleness_status text not null default 'CURRENT',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_implementation_snapshot_bindings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_managed_projects(id) on delete cascade,
  page_id uuid references public.site00_design_pages(id) on delete set null,
  snapshot_id text not null,
  staleness_status text not null default 'CURRENT',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Seed managed projects + FSBW repo bindings ───

insert into public.site00_managed_projects (
  project_key, display_name, design_authority, source_repo, source_project_key,
  project_type, runtime_mode, design_enabled, marketing_enabled, metadata
) values
  ('site00', 'SITE 00', 'SITE00', null, null, 'HOST_PLATFORM', 'SITE00_NATIVE', true, true, '{"platformRole":"NONE"}'::jsonb),
  ('ndxbook', 'NDXBOOK', 'SITE00', 'yoteenz/fsbw', 'ndxbook', 'MANAGED_BRAND', 'FSBW_WEBSITE', true, true, '{"platformRole":"MANAGED_BRAND"}'::jsonb),
  ('frontal-slayer', 'FRONTAL SLAYER', 'SITE00', 'yoteenz/fsbw', 'frontal-slayer', 'MANAGED_BRAND', 'FSBW_WEBSITE', true, true, '{}'::jsonb),
  ('all-in-one-enterprises', 'ALL IN ONE ENTERPRISES', 'SITE00', 'yoteenz/fsbw', 'all-in-one-enterprises', 'MANAGED_BRAND', 'FSBW_WEBSITE', true, true, '{}'::jsonb),
  ('studio-world', 'STUDIO WORLD WEBSITE', 'SITE00', 'yoteenz/fsbw', 'studio-world', 'MANAGED_WEBSITE', 'FSBW_WEBSITE', true, true, '{"platformRole":"INFRASTRUCTURE","websiteScopeOnly":true}'::jsonb)
on conflict (project_key) do update set
  display_name = excluded.display_name,
  source_repo = excluded.source_repo,
  source_project_key = excluded.source_project_key,
  project_type = excluded.project_type,
  metadata = excluded.metadata,
  updated_at = now();

insert into public.site00_repo_bindings (
  project_id, repo_owner, repo_name, default_branch, source_project_path,
  adapter_type, runtime_binding_mode, source_materialization_enabled, metadata
)
select p.id, 'yoteenz', 'fsbw', 'main', p.source_project_key,
  case when p.project_key = 'studio-world' then 'FSBW_STUDIO_WORLD_WEBSITE' else 'FSBW_WEBSITE' end,
  'HYBRID', true,
  case when p.project_key = 'studio-world' then '{"excludeInternalRoutes":["/studio/","/admin/"]}'::jsonb else '{}'::jsonb end
from public.site00_managed_projects p
where p.source_repo = 'yoteenz/fsbw'
on conflict (project_id, repo_owner, repo_name) do update set
  source_project_path = excluded.source_project_path,
  adapter_type = excluded.adapter_type,
  metadata = excluded.metadata,
  updated_at = now();

-- ─── RLS (service role server-side; no client service role) ───

do $$
declare t text;
begin
  foreach t in array array[
    'site00_managed_projects','site00_repo_bindings','site00_design_pages','site00_design_families',
    'site00_shared_shells','site00_page_design_versions','site00_page_content_bindings',
    'site00_asset_bindings','site00_design_token_overrides','site00_change_requests',
    'site00_change_operations','site00_change_approvals','site00_change_receipts',
    'site00_shell_propagation_changes','site00_shell_propagation_members',
    'site00_release_bindings','site00_reference_bindings','site00_implementation_snapshot_bindings'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    if not exists (select 1 from pg_policies where tablename = t and policyname = 'service_role_all') then
      execute format(
        'create policy service_role_all on public.%I for all to service_role using (true) with check (true)', t
      );
    end if;
  end loop;
end $$;
