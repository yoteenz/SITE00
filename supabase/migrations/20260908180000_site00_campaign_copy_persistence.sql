-- C1.7 — Campaign copy direction persistence

create table if not exists public.site00_campaign_copy_packages (
  id uuid primary key default gen_random_uuid(),
  copy_package_key text not null unique,
  campaign_id text not null,
  project_id text not null,
  package_copy_quality_tier text not null,
  package_copy_handholding_risk text not null,
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_campaign_copy_versions (
  id uuid primary key default gen_random_uuid(),
  copy_direction_id text not null,
  content_unit_id text not null,
  version_label text not null,
  copy_text jsonb not null default '{}'::jsonb,
  cta text,
  status text not null default 'DRAFT',
  founder_judgment text,
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_site00_campaign_copy_campaign on public.site00_campaign_copy_packages(campaign_id);
create index if not exists idx_site00_campaign_copy_unit on public.site00_campaign_copy_versions(content_unit_id);

alter table public.site00_campaign_copy_packages enable row level security;
alter table public.site00_campaign_copy_versions enable row level security;
