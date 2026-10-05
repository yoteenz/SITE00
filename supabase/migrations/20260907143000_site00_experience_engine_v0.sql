-- Experience Engine V0 — route reference authority + fidelity iterations (Sprint A)

create table if not exists public.site00_route_references (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_managed_projects(id) on delete cascade,
  project_key text not null,
  route_id text not null,
  viewport_class text not null,
  reference_storage_path text not null,
  authority_level text not null,
  reference_kind text not null,
  status text not null default 'ACTIVE',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site00_route_references_viewport_class_check
    check (viewport_class in ('DESKTOP', 'MOBILE')),
  constraint site00_route_references_authority_level_check
    check (authority_level in ('DESIGN_AUTHORITY', 'IMPLEMENTATION_BASELINE', 'DERIVED_REFERENCE', 'UNAPPROVED')),
  constraint site00_route_references_reference_kind_check
    check (reference_kind in ('ENVIRONMENT_ASSET', 'FULL_VIEWPORT', 'REGION_CROP')),
  constraint site00_route_references_status_check
    check (status in ('ACTIVE', 'BLOCKED_PENDING_REFERENCE_AUTHORITY', 'SUPERSEDED', 'ARCHIVED'))
);

create unique index if not exists site00_route_references_active_authority_idx
  on public.site00_route_references (project_id, route_id, viewport_class, authority_level)
  where status = 'ACTIVE' and authority_level = 'DESIGN_AUTHORITY';

create index if not exists site00_route_references_project_route_idx
  on public.site00_route_references (project_id, route_id, viewport_class);

create table if not exists public.site00_fidelity_iterations (
  id uuid primary key default gen_random_uuid(),
  route_reference_id uuid not null references public.site00_route_references(id) on delete cascade,
  iteration_number int not null,
  render_storage_path text not null,
  heatmap_storage_path text,
  pixel_score numeric(6, 5) not null,
  structural_score numeric(6, 5),
  status text not null,
  comparison_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint site00_fidelity_iterations_status_check
    check (status in ('CAPTURED', 'COMPARED', 'FAILED', 'PIXEL_PASS', 'FOUNDER_REVIEW', 'BLOCKED')),
  constraint site00_fidelity_iterations_iteration_number_check
    check (iteration_number >= 0),
  unique (route_reference_id, iteration_number)
);

create index if not exists site00_fidelity_iterations_reference_idx
  on public.site00_fidelity_iterations (route_reference_id, iteration_number desc);

-- Seed /enter desktop DESIGN_AUTHORITY (SITE 00 host — not NDXBOOK)
insert into public.site00_route_references (
  project_id,
  project_key,
  route_id,
  viewport_class,
  reference_storage_path,
  authority_level,
  reference_kind,
  status,
  metadata
)
select
  p.id,
  'site00',
  '/enter',
  'DESKTOP',
  'live-preview/site00/89319E70-D080-4798-9BCA-E53B137F2387.png',
  'DESIGN_AUTHORITY',
  'ENVIRONMENT_ASSET',
  'ACTIVE',
  jsonb_build_object(
    'environmentId', 'ENTER_00_WAITING_ROOM',
    'assetFileName', '89319E70-D080-4798-9BCA-E53B137F2387.png',
    'focal', 'center 75%',
    'blockedRegionIds', jsonb_build_array('status-strip'),
    'sprint', 'EXPERIENCE_ENGINE_V0_SPRINT_A'
  )
from public.site00_managed_projects p
where p.project_key = 'site00'
on conflict do nothing;

-- Mobile: no founder-approved design authority — blocked state only (no self-promotion)
insert into public.site00_route_references (
  project_id,
  project_key,
  route_id,
  viewport_class,
  reference_storage_path,
  authority_level,
  reference_kind,
  status,
  metadata
)
select
  p.id,
  'site00',
  '/enter',
  'MOBILE',
  '',
  'UNAPPROVED',
  'FULL_VIEWPORT',
  'BLOCKED_PENDING_REFERENCE_AUTHORITY',
  jsonb_build_object(
    'reason', 'NO_FOUNDER_APPROVED_MOBILE_REFERENCE',
    'sprint', 'EXPERIENCE_ENGINE_V0_SPRINT_A'
  )
from public.site00_managed_projects p
where p.project_key = 'site00'
  and not exists (
    select 1 from public.site00_route_references r
    where r.project_id = p.id
      and r.route_id = '/enter'
      and r.viewport_class = 'MOBILE'
      and r.status = 'BLOCKED_PENDING_REFERENCE_AUTHORITY'
  );

-- RLS
alter table public.site00_route_references enable row level security;
alter table public.site00_fidelity_iterations enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'site00_route_references' and policyname = 'service_role_all') then
    create policy service_role_all on public.site00_route_references for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'site00_fidelity_iterations' and policyname = 'service_role_all') then
    create policy service_role_all on public.site00_fidelity_iterations for all to service_role using (true) with check (true);
  end if;
end $$;
