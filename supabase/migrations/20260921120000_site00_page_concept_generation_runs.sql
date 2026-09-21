-- SITE 00 — durable page concept generation runs (GPT2 mobile FAL wiring sprint).

create table if not exists public.site00_page_concept_generation_runs (
  run_id text primary key,
  organization_id uuid not null,
  project_id text not null,
  page_id text not null,
  pipeline_id text not null default 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
  status text not null,
  run_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_page_concept_generation_runs_page_idx
  on public.site00_page_concept_generation_runs (project_id, page_id, updated_at desc);

alter table public.site00_page_concept_generation_runs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'site00_page_concept_generation_runs' and policyname = 'service_role_all'
  ) then
    create policy service_role_all on public.site00_page_concept_generation_runs
      for all using (true) with check (true);
  end if;
end $$;
