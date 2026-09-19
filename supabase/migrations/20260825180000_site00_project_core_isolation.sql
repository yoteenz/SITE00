-- P0.B — Project core + project_id isolation foundation

-- ─── Canonical project classification on site00_projects ───

alter table public.site00_projects
  add column if not exists project_type text;

alter table public.site00_projects
  add column if not exists experience_class text;

comment on column public.site00_projects.project_type is
  'Canonical project type: IDENTITY | SITE | PRODUCT | WORLD';

comment on column public.site00_projects.experience_class is
  'Unified ProjectExperienceClass — scope/manifest discriminator';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'site00_projects_project_type_check'
  ) then
    alter table public.site00_projects
      add constraint site00_projects_project_type_check
      check (
        project_type is null
        or project_type in ('IDENTITY', 'SITE', 'PRODUCT', 'WORLD')
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'site00_projects_experience_class_check'
  ) then
    alter table public.site00_projects
      add constraint site00_projects_experience_class_check
      check (
        experience_class is null
        or experience_class in ('SITE', 'APPLICATION', 'IMMERSIVE_SITE', 'WORLD', 'UNRESOLVED')
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'site00_projects_status_lifecycle_check'
  ) then
    alter table public.site00_projects
      add constraint site00_projects_status_lifecycle_check
      check (
        status in ('ACTIVE', 'PRE_INGESTION', 'INGESTION', 'PRODUCTION', 'ARCHIVED')
      );
  end if;
end $$;

create index if not exists site00_projects_project_type_idx
  on public.site00_projects(project_type);

create index if not exists site00_projects_experience_class_idx
  on public.site00_projects(experience_class);

-- ─── Ingestion ownership ───

alter table public.site00_project_ingestions
  add column if not exists project_id uuid references public.site00_projects(id) on delete set null;

alter table public.site00_project_ingestions
  add column if not exists reconciliation_note text;

create index if not exists site00_project_ingestions_project_id_idx
  on public.site00_project_ingestions(project_id);

comment on column public.site00_project_ingestions.reconciliation_note is
  'Explicit note when project_id cannot be deterministically assigned';

-- ─── Logical asset project ownership ───

alter table public.site00_logical_assets
  add column if not exists project_id uuid references public.site00_projects(id) on delete set null;

alter table public.site00_logical_assets
  add column if not exists ownership_status text not null default 'UNSCOPED';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'site00_logical_assets_ownership_status_check'
  ) then
    alter table public.site00_logical_assets
      add constraint site00_logical_assets_ownership_status_check
      check (ownership_status in ('SCOPED', 'UNSCOPED', 'RECONCILIATION_REQUIRED'));
  end if;
end $$;

create index if not exists site00_logical_assets_project_id_idx
  on public.site00_logical_assets(project_id);

-- Backfill NDXBOOK logical assets when ndxbook project row exists (deterministic only)
update public.site00_logical_assets la
set
  project_id = p.id,
  ownership_status = 'SCOPED'
from public.site00_projects p
where p.slug = 'ndxbook'
  and la.project_id is null;

-- ─── Client truth (non-canonical client-supplied records) ───

create table if not exists public.site00_client_truth_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  truth_class text not null default 'CLIENT_SUPPLIED',
  status text not null default 'RAW',
  title text,
  payload jsonb not null default '{}'::jsonb,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site00_client_truth_truth_class_check
    check (truth_class in ('CLIENT_SUPPLIED', 'FOUNDER_PROPOSED_CONCEPT')),
  constraint site00_client_truth_status_check
    check (status in ('RAW', 'UNAPPROVED', 'REVIEW', 'WITHDRAWN'))
);

create index if not exists site00_client_truth_project_id_idx
  on public.site00_client_truth_records(project_id);

alter table public.site00_client_truth_records enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'site00_client_truth_records' and policyname = 'service_role_all'
  ) then
    create policy service_role_all on public.site00_client_truth_records
      for all to service_role using (true) with check (true);
  end if;
end $$;

-- ─── Astral World minimal project registration (org + project, no creative canon) ───

insert into public.site00_organizations (slug, name, classification, state, client_facing, metadata)
values (
  'astral-world',
  'Astral World (Client Project)',
  'MANAGED_BRAND',
  'ACTIVE',
  false,
  jsonb_build_object(
    'registrationSource', 'P0.B',
    'note', 'Minimal PRE_INGESTION project record — no creative canon populated'
  )
)
on conflict (slug) do update set
  metadata = public.site00_organizations.metadata || excluded.metadata,
  updated_at = now();

insert into public.site00_projects (
  slug,
  name,
  organization_id,
  project_type,
  experience_class,
  status,
  current_phase,
  metadata
)
select
  'astral-world',
  'Astral World',
  o.id,
  'WORLD',
  'WORLD',
  'PRE_INGESTION',
  'DISCOVERY',
  jsonb_build_object(
    'registrationSource', 'P0.B',
    'clientState', 'Concept exists / identity not finalized',
    'founderIndex', false
  )
from public.site00_organizations o
where o.slug = 'astral-world'
on conflict (slug) do update set
  project_type = excluded.project_type,
  experience_class = excluded.experience_class,
  status = excluded.status,
  organization_id = excluded.organization_id,
  metadata = public.site00_projects.metadata || excluded.metadata,
  updated_at = now();

-- Enrich existing founder rows with project_type where deterministically known
update public.site00_projects set project_type = 'WORLD', experience_class = 'WORLD'
where slug = 'frontal-slayer' and project_type is null;

update public.site00_projects set project_type = 'SITE', experience_class = 'SITE'
where slug in ('all-in-one-enterprises', 'studio-world') and project_type is null;

update public.site00_projects set project_type = 'PRODUCT', experience_class = 'IMMERSIVE_SITE'
where slug = 'ndxbook' and project_type is null;
