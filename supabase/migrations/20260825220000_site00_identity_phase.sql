-- P0.D — Identity phase entry + world hierarchy + identity canon promotion

-- Extend project lifecycle status
alter table public.site00_projects
  drop constraint if exists site00_projects_status_lifecycle_check;

alter table public.site00_projects
  add constraint site00_projects_status_lifecycle_check
  check (
    status in (
      'ACTIVE',
      'PRE_INGESTION',
      'ORIGIN_INGESTED',
      'IDENTITY_IN_PROGRESS',
      'IDENTITY_COMPLETE',
      'INGESTION',
      'PRODUCTION',
      'ARCHIVED'
    )
  );

-- Project-scoped canon records
alter table public.site00_canon_records
  add column if not exists project_id uuid references public.site00_projects(id) on delete cascade;

create index if not exists site00_canon_records_project_id_idx
  on public.site00_canon_records(project_id);

-- ─── Identity phase state ───

create table if not exists public.site00_identity_phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  status text not null default 'NOT_STARTED',
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site00_identity_phases_status_check
    check (status in ('NOT_STARTED', 'IN_PROGRESS', 'AWAITING_REVIEW', 'PARTIALLY_APPROVED', 'COMPLETE'))
);

create unique index if not exists site00_identity_phases_project_uidx
  on public.site00_identity_phases(project_id);

-- ─── Derived identity brief (non-canonical) ───

create table if not exists public.site00_identity_briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  brief jsonb not null default '{}'::jsonb,
  source_record_ids uuid[] not null default '{}',
  is_canonical boolean not null default false,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists site00_identity_briefs_project_idx
  on public.site00_identity_briefs(project_id, generated_at desc);

-- ─── Identity territories (creative exploration — non-canonical until promoted) ───

create table if not exists public.site00_identity_territories (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  territory_key text not null,
  working_label text not null,
  strategic_premise text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'PROPOSED',
  source_truth_refs uuid[] not null default '{}',
  creative_hypotheses jsonb not null default '[]'::jsonb,
  lineage jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site00_identity_territories_status_check
    check (status in ('PROPOSED', 'SELECTED', 'REVISED', 'REJECTED', 'PROMOTED_PARTIAL', 'PROMOTED')),
  unique (project_id, territory_key)
);

create index if not exists site00_identity_territories_project_idx
  on public.site00_identity_territories(project_id);

-- ─── Identity judgments ───

create table if not exists public.site00_identity_judgments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  territory_id uuid not null references public.site00_identity_territories(id) on delete cascade,
  judgment text not null default 'UNREVIEWED',
  approver text,
  approved_fields jsonb not null default '{}'::jsonb,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site00_identity_judgments_judgment_check
    check (judgment in ('SELECT', 'REVISE', 'REJECT', 'UNREVIEWED', 'HYBRIDIZE'))
);

create index if not exists site00_identity_judgments_territory_idx
  on public.site00_identity_judgments(territory_id);

-- ─── World hierarchy nodes (WORLD → DISTRICT → DESTINATION → EXPERIENCE) ───

create table if not exists public.site00_world_hierarchy_nodes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  node_type text not null,
  slug text not null,
  display_name text not null,
  parent_id uuid references public.site00_world_hierarchy_nodes(id) on delete cascade,
  sort_order int not null default 0,
  truth_layer text not null default 'CLIENT_FOUNDER_TRUTH',
  payload jsonb not null default '{}'::jsonb,
  is_canonical boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site00_world_hierarchy_node_type_check
    check (node_type in ('WORLD', 'DISTRICT', 'DESTINATION', 'EXPERIENCE')),
  constraint site00_world_hierarchy_truth_layer_check
    check (truth_layer in ('CLIENT_FOUNDER_TRUTH', 'APPROVED_CANON', 'UNRESOLVED', 'CREATIVE_EXPLORATION')),
  unique (project_id, slug)
);

create index if not exists site00_world_hierarchy_project_idx
  on public.site00_world_hierarchy_nodes(project_id, node_type);

-- ─── Identity canon promotions (audit trail) ───

create table if not exists public.site00_identity_canon_promotions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  canon_record_id uuid references public.site00_canon_records(id) on delete set null,
  territory_id uuid references public.site00_identity_territories(id) on delete set null,
  hierarchy_scope text not null default 'MASTER',
  scope_node_id uuid references public.site00_world_hierarchy_nodes(id) on delete set null,
  approved_fields jsonb not null default '{}'::jsonb,
  version int not null default 1,
  superseded_by uuid references public.site00_identity_canon_promotions(id) on delete set null,
  approver text,
  lineage jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists site00_identity_canon_promotions_project_idx
  on public.site00_identity_canon_promotions(project_id);

-- ─── RLS ───

alter table public.site00_identity_phases enable row level security;
alter table public.site00_identity_briefs enable row level security;
alter table public.site00_identity_territories enable row level security;
alter table public.site00_identity_judgments enable row level security;
alter table public.site00_world_hierarchy_nodes enable row level security;
alter table public.site00_identity_canon_promotions enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'site00_identity_phases','site00_identity_briefs','site00_identity_territories',
    'site00_identity_judgments','site00_world_hierarchy_nodes','site00_identity_canon_promotions'
  ] loop
    if not exists (select 1 from pg_policies where tablename = t and policyname = 'service_role_all') then
      execute format(
        'create policy service_role_all on public.%I for all to service_role using (true) with check (true)', t
      );
    end if;
  end loop;
end $$;
