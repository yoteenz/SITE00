-- SITE 00 — Methodology validation runs (shadow replay, non-canonical).
-- Isolated from brand lore profiles and formation canon.

create table if not exists public.site00_methodology_validation_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  project_id uuid references public.site00_projects(id) on delete set null,
  mode text not null default 'NDX_PERSONALITY_REPLAY_VALIDATION',
  status text not null default 'CREATED',
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_methodology_validation_runs_org_idx
  on public.site00_methodology_validation_runs (organization_id, updated_at desc);

alter table public.site00_methodology_validation_runs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'site00_methodology_validation_runs' and policyname = 'service_role_all'
  ) then
    create policy service_role_all on public.site00_methodology_validation_runs
      for all to service_role using (true) with check (true);
  end if;
end $$;
