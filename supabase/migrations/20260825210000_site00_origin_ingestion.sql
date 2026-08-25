-- P0.C — Origin ingestion sessions, summaries, ORIGIN_INGESTED lifecycle

-- Extend project status lifecycle
alter table public.site00_projects
  drop constraint if exists site00_projects_status_lifecycle_check;

alter table public.site00_projects
  add constraint site00_projects_status_lifecycle_check
  check (
    status in (
      'ACTIVE',
      'PRE_INGESTION',
      'ORIGIN_INGESTED',
      'INGESTION',
      'PRODUCTION',
      'ARCHIVED'
    )
  );

-- ─── Origin ingestion sessions ───

create table if not exists public.site00_origin_ingestion_sessions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  status text not null default 'NOT_STARTED',
  started_at timestamptz,
  completed_at timestamptz,
  initiated_by text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site00_origin_ingestion_sessions_status_check
    check (status in ('NOT_STARTED', 'IN_PROGRESS', 'INGESTED'))
);

create index if not exists site00_origin_ingestion_sessions_project_idx
  on public.site00_origin_ingestion_sessions(project_id, created_at desc);

-- ─── Derived origin summaries (non-canonical) ───

create table if not exists public.site00_origin_summaries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  session_id uuid references public.site00_origin_ingestion_sessions(id) on delete set null,
  summary jsonb not null default '{}'::jsonb,
  source_record_ids uuid[] not null default '{}',
  is_canonical boolean not null default false,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists site00_origin_summaries_project_idx
  on public.site00_origin_summaries(project_id, generated_at desc);

-- ─── RLS (service_role only) ───

alter table public.site00_origin_ingestion_sessions enable row level security;
alter table public.site00_origin_summaries enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'site00_origin_ingestion_sessions' and policyname = 'service_role_all'
  ) then
    create policy service_role_all on public.site00_origin_ingestion_sessions
      for all to service_role using (true) with check (true);
  end if;
  if not exists (
    select 1 from pg_policies
    where tablename = 'site00_origin_summaries' and policyname = 'service_role_all'
  ) then
    create policy service_role_all on public.site00_origin_summaries
      for all to service_role using (true) with check (true);
  end if;
end $$;
