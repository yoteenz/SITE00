-- SITE 00 ASSTS Asset Vault + FAL Asset Factory (Foundation)

create table if not exists public.site00_asset_slots (
  id uuid primary key default gen_random_uuid(),
  slot_key text not null unique,
  description text,
  asset_type text not null default 'environment',
  environment text,
  current_locked_asset_id uuid,
  current_locked_version_id uuid,
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_batches (
  id uuid primary key default gen_random_uuid(),
  batch_key text not null unique,
  display_name text not null,
  description text,
  category text,
  status text not null default 'DRAFT',
  total_assets int not null default 0,
  required_assets int not null default 0,
  manifest jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  locked_at timestamptz
);

create table if not exists public.site00_logical_assets (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null unique,
  display_name text not null,
  asset_type text not null default 'environment',
  category text,
  batch_id uuid references public.site00_batches(id) on delete set null,
  semantic_slot_key text references public.site00_asset_slots(slot_key) on delete set null,
  canonical_master_id uuid,
  current_version_id uuid,
  approved_version_id uuid,
  production_version_id uuid,
  status text not null default 'QUEUED',
  required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  locked_at timestamptz
);

create table if not exists public.site00_asset_versions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.site00_logical_assets(id) on delete cascade,
  version_number int not null,
  file_path text,
  thumbnail_path text,
  preview_path text,
  generation_provider text,
  generation_model text,
  prompt_version text,
  prompt_snapshot text,
  seed text,
  generation_parameters jsonb,
  parent_version_id uuid references public.site00_asset_versions(id) on delete set null,
  canonical_master_version_id uuid references public.site00_asset_versions(id) on delete set null,
  status text not null default 'QUEUED',
  created_at timestamptz not null default now(),
  unique (asset_id, version_number)
);

create table if not exists public.site00_review_events (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.site00_logical_assets(id) on delete cascade,
  asset_version_id uuid references public.site00_asset_versions(id) on delete set null,
  batch_id uuid references public.site00_batches(id) on delete set null,
  action text not null,
  note text,
  correction_categories text[],
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.site00_logical_assets(id) on delete cascade,
  asset_version_id uuid references public.site00_asset_versions(id) on delete set null,
  batch_id uuid references public.site00_batches(id) on delete set null,
  provider text not null default 'fal',
  provider_job_id text,
  provider_model text,
  status text not null default 'QUEUED',
  attempt int not null default 1,
  idempotency_key text unique,
  request_snapshot jsonb,
  response_snapshot jsonb,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists site00_logical_assets_batch_idx on public.site00_logical_assets(batch_id);
create index if not exists site00_asset_versions_asset_idx on public.site00_asset_versions(asset_id);
create index if not exists site00_generation_jobs_status_idx on public.site00_generation_jobs(status);
create index if not exists site00_review_events_asset_idx on public.site00_review_events(asset_id, created_at desc);

alter table public.site00_asset_slots enable row level security;
alter table public.site00_batches enable row level security;
alter table public.site00_logical_assets enable row level security;
alter table public.site00_asset_versions enable row level security;
alter table public.site00_review_events enable row level security;
alter table public.site00_generation_jobs enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'site00_asset_slots' and policyname = 'service_role_all') then
    create policy service_role_all on public.site00_asset_slots for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'site00_batches' and policyname = 'service_role_all') then
    create policy service_role_all on public.site00_batches for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'site00_logical_assets' and policyname = 'service_role_all') then
    create policy service_role_all on public.site00_logical_assets for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'site00_asset_versions' and policyname = 'service_role_all') then
    create policy service_role_all on public.site00_asset_versions for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'site00_review_events' and policyname = 'service_role_all') then
    create policy service_role_all on public.site00_review_events for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'site00_generation_jobs' and policyname = 'service_role_all') then
    create policy service_role_all on public.site00_generation_jobs for all to service_role using (true) with check (true);
  end if;
end $$;

-- Seed semantic asset slots (no locked assets yet)
insert into public.site00_asset_slots (slot_key, description, asset_type, environment)
values
  ('assts.library.environment.mobile', 'ASSTS Library mobile environment', 'environment', 'REVIEW_ENVIRONMENT/ASSTS'),
  ('assts.batch.environment.mobile', 'ASSTS Batch Review mobile environment', 'environment', 'REVIEW_ENVIRONMENT/ASSTS'),
  ('assts.inspection.environment.mobile', 'ASSTS Inspection mobile environment', 'environment', 'REVIEW_ENVIRONMENT/ASSTS')
on conflict (slot_key) do nothing;
