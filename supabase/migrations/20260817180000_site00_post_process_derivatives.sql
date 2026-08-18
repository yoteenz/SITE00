-- SITE 00 post-processing / derivative pipeline (loader geometry first dogfood)

create table if not exists public.site00_post_process_jobs (
  id uuid primary key default gen_random_uuid(),
  job_key text not null,
  source_asset_id uuid not null references public.site00_logical_assets(id) on delete cascade,
  source_version_id uuid references public.site00_asset_versions(id) on delete set null,
  output_asset_id uuid references public.site00_logical_assets(id) on delete set null,
  output_version_id uuid references public.site00_asset_versions(id) on delete set null,
  processor text not null default 'fal',
  processor_model text not null,
  processor_version text,
  derivative_type text not null default 'background_removed',
  processor_settings jsonb not null default '{}'::jsonb,
  status text not null default 'QUEUED',
  provider_job_id text,
  request_snapshot jsonb,
  response_snapshot jsonb,
  source_metadata jsonb,
  cost_usd numeric(10, 4),
  processing_duration_ms int,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists site00_post_process_jobs_status_idx on public.site00_post_process_jobs(status);
create index if not exists site00_post_process_jobs_source_idx on public.site00_post_process_jobs(source_asset_id, created_at desc);

alter table public.site00_asset_versions
  add column if not exists derivative_type text,
  add column if not exists source_version_id uuid references public.site00_asset_versions(id) on delete set null,
  add column if not exists post_process_job_id uuid references public.site00_post_process_jobs(id) on delete set null,
  add column if not exists media_metadata jsonb;

alter table public.site00_post_process_jobs enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'site00_post_process_jobs' and policyname = 'service_role_all') then
    create policy service_role_all on public.site00_post_process_jobs for all to service_role using (true) with check (true);
  end if;
end $$;

-- Loader geometry semantic slots
insert into public.site00_asset_slots (slot_key, description, asset_type, environment)
values
  ('site00.loader.geometry.master', 'Approved SITE 00 loader geometry master (OpenArt MP4)', 'loader_geometry', 'site00_loader'),
  ('site00.loader.geometry.production', 'Locked transparent loader geometry for runtime', 'loader_geometry', 'site00_loader')
on conflict (slot_key) do nothing;
