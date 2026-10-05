-- P0.E — Identity field judgments, revision targets, hierarchical canon fields

-- Field-level founder judgments (territory + scope + field)
create table if not exists public.site00_identity_field_judgments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  territory_id uuid not null references public.site00_identity_territories(id) on delete cascade,
  field_key text not null,
  hierarchy_scope text not null default 'MASTER',
  scope_node_id uuid references public.site00_world_hierarchy_nodes(id) on delete set null,
  judgment text not null default 'UNREVIEWED',
  field_value jsonb,
  approver text not null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site00_identity_field_judgments_judgment_check
    check (judgment in ('APPROVE', 'REVISE', 'REJECT', 'UNREVIEWED')),
  constraint site00_identity_field_judgments_scope_check
    check (hierarchy_scope in ('MASTER', 'DISTRICT', 'DESTINATION', 'EXPERIENCE'))
);

create index if not exists site00_identity_field_judgments_project_idx
  on public.site00_identity_field_judgments(project_id, territory_id);

create index if not exists site00_identity_field_judgments_field_idx
  on public.site00_identity_field_judgments(project_id, field_key, judgment);

-- Revision targets (REVISE path — preserves original proposal)
create table if not exists public.site00_identity_revision_targets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  territory_id uuid not null references public.site00_identity_territories(id) on delete cascade,
  field_key text not null,
  hierarchy_scope text not null default 'MASTER',
  scope_node_id uuid references public.site00_world_hierarchy_nodes(id) on delete set null,
  original_value jsonb not null default '{}'::jsonb,
  founder_critique text,
  requested_change text,
  source_judgment_id uuid references public.site00_identity_field_judgments(id) on delete set null,
  status text not null default 'OPEN',
  lineage jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site00_identity_revision_targets_status_check
    check (status in ('OPEN', 'ADDRESSED', 'WITHDRAWN'))
);

create index if not exists site00_identity_revision_targets_project_idx
  on public.site00_identity_revision_targets(project_id);

-- Granular canon field records (hierarchical partial canon)
create table if not exists public.site00_canon_field_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  canon_type text not null default 'IDENTITY',
  field_key text not null,
  hierarchy_scope text not null default 'MASTER',
  scope_node_id uuid references public.site00_world_hierarchy_nodes(id) on delete set null,
  field_value jsonb not null default '{}'::jsonb,
  source_territory_id uuid references public.site00_identity_territories(id) on delete set null,
  source_judgment_id uuid references public.site00_identity_field_judgments(id) on delete set null,
  canon_record_id uuid references public.site00_canon_records(id) on delete set null,
  canon_version int not null default 1,
  status text not null default 'ACTIVE',
  approver text not null,
  lineage jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  superseded_by uuid references public.site00_canon_field_records(id) on delete set null,
  constraint site00_canon_field_records_type_check
    check (canon_type in ('IDENTITY', 'WORLD_STRUCTURE')),
  constraint site00_canon_field_records_status_check
    check (status in ('ACTIVE', 'SUPERSEDED')),
  constraint site00_canon_field_records_scope_check
    check (hierarchy_scope in ('MASTER', 'DISTRICT', 'DESTINATION', 'EXPERIENCE'))
);

create index if not exists site00_canon_field_records_project_idx
  on public.site00_canon_field_records(project_id, canon_type, status);

-- Structural world hierarchy confirmation (founder explicit — not auto)
create table if not exists public.site00_world_structure_confirmations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  confirmation_key text not null,
  confirmed boolean not null default false,
  approver text,
  confirmed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, confirmation_key)
);

-- Extend identity phase status for founder judgment tracking
alter table public.site00_identity_phases
  drop constraint if exists site00_identity_phases_status_check;

alter table public.site00_identity_phases
  add constraint site00_identity_phases_status_check
  check (status in (
    'NOT_STARTED', 'IN_PROGRESS', 'AWAITING_REVIEW',
    'AWAITING_FOUNDER_JUDGMENT', 'PARTIALLY_APPROVED', 'COMPLETE'
  ));

-- RLS
alter table public.site00_identity_field_judgments enable row level security;
alter table public.site00_identity_revision_targets enable row level security;
alter table public.site00_canon_field_records enable row level security;
alter table public.site00_world_structure_confirmations enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'site00_identity_field_judgments','site00_identity_revision_targets',
    'site00_canon_field_records','site00_world_structure_confirmations'
  ] loop
    if not exists (select 1 from pg_policies where tablename = t and policyname = 'service_role_all') then
      execute format(
        'create policy service_role_all on public.%I for all to service_role using (true) with check (true)', t
      );
    end if;
  end loop;
end $$;
