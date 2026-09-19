-- Durable background jobs for NDX BOOK six-direction production (Railway-safe).

create table if not exists public.site00_creative_direction_production_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  org_slug text not null,
  job_type text not null,
  status text not null default 'queued',
  phase text not null default 'queued',
  progress jsonb not null default '{"current":0,"total":1,"label":"Queued"}'::jsonb,
  options jsonb not null default '{}'::jsonb,
  result jsonb,
  error_message text,
  requested_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists site00_cd_production_jobs_org_idx
  on public.site00_creative_direction_production_jobs (org_slug, created_at desc);

alter table public.site00_creative_direction_production_jobs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'site00_creative_direction_production_jobs' and policyname = 'service_role_all'
  ) then
    create policy service_role_all on public.site00_creative_direction_production_jobs
      for all to service_role using (true) with check (true);
  end if;
end $$;
