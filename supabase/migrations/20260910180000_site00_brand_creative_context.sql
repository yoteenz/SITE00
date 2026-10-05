-- P0.CBI.1 — Brand Creative Context durable persistence

create table if not exists public.site00_brand_creative_context (
  id uuid primary key default gen_random_uuid(),
  brand_id text not null,
  project_id text,
  context_version integer not null default 1,
  readiness_state text not null default 'MISSING_CRITICAL',
  confidence text,
  context jsonb not null,
  founder_overrides jsonb not null default '{}'::jsonb,
  campaign_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists site00_brand_creative_context_brand_idx
  on public.site00_brand_creative_context (brand_id);

create index if not exists site00_brand_creative_context_project_idx
  on public.site00_brand_creative_context (project_id);

alter table public.site00_brand_creative_context enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'site00_brand_creative_context' and policyname = 'service_role_all'
  ) then
    create policy service_role_all on public.site00_brand_creative_context
      for all using (true) with check (true);
  end if;
end $$;
