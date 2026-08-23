-- SITE 00 — P0.5A production invalidation events (durable methodology layer).

create table if not exists public.site00_production_invalidation_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  project_id uuid references public.site00_projects(id) on delete set null,
  source_type text not null,
  source_id text not null,
  source_version_before text,
  source_version_after text,
  change_type text not null,
  change_summary text not null,
  affected_nodes jsonb not null default '[]'::jsonb,
  policy_applied text not null,
  resolution text,
  founder_action_required boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists site00_production_invalidation_events_project_idx
  on public.site00_production_invalidation_events (project_id, created_at desc);

create index if not exists site00_production_invalidation_events_source_idx
  on public.site00_production_invalidation_events (source_type, source_id, created_at desc);

create table if not exists public.site00_production_dependency_edges (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  project_id uuid references public.site00_projects(id) on delete set null,
  upstream_type text not null,
  upstream_id text not null,
  downstream_type text not null,
  downstream_id text not null,
  relationship_type text not null,
  invalidation_policy text not null,
  reason text not null,
  source_methodology_version text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_production_dependency_edges_upstream_idx
  on public.site00_production_dependency_edges (project_id, upstream_type, upstream_id);

create index if not exists site00_production_dependency_edges_downstream_idx
  on public.site00_production_dependency_edges (project_id, downstream_type, downstream_id);

create unique index if not exists site00_production_dependency_edges_unique_idx
  on public.site00_production_dependency_edges (
    project_id,
    upstream_type,
    upstream_id,
    downstream_type,
    downstream_id,
    relationship_type
  );
