-- B5.6 — Campaign package persistent storage (generic, entry-agnostic)

create table if not exists public.site00_campaign_packages (
  id uuid primary key default gen_random_uuid(),
  package_key text not null unique,
  project_id text not null,
  brand_id text not null,
  entry_id text not null,
  package_type text not null default 'ENTRY_CAMPAIGN_PACKAGE',
  status text not null default 'IN_PROGRESS',
  preview_readiness text not null default 'PARTIAL',
  campaign_board_eligibility boolean not null default false,
  migration_version int not null default 0,
  migration_complete boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_campaign_package_assets (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.site00_campaign_packages(id) on delete cascade,
  asset_key text not null,
  entry_id text not null,
  asset_type text not null,
  asset_role text,
  format_family text,
  platform text,
  title text not null,
  file_path text not null,
  format text not null,
  legacy_role text not null,
  source text not null,
  storage_source text not null default 'STATIC_PUBLIC',
  status text not null,
  founder_judgment text,
  approved boolean not null default false,
  sequence_index int,
  parent_asset_key text,
  package_membership_id text,
  removed_from_active_archive boolean not null default false,
  archived_at timestamptz,
  caption text,
  version_label text not null default 'v001',
  metadata jsonb not null default '{}'::jsonb,
  lineage jsonb not null default '{}'::jsonb,
  classification_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (package_id, asset_key)
);

create table if not exists public.site00_campaign_deliverables (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.site00_campaign_packages(id) on delete cascade,
  deliverable_key text not null,
  asset_id uuid references public.site00_campaign_package_assets(id) on delete set null,
  format_family text not null,
  platform text not null,
  deliverable_type text not null,
  status text not null,
  current_version_id uuid,
  removed_from_package boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  lineage jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (package_id, deliverable_key)
);

create table if not exists public.site00_campaign_deliverable_versions (
  id uuid primary key default gen_random_uuid(),
  deliverable_id uuid not null references public.site00_campaign_deliverables(id) on delete cascade,
  version_number int not null,
  file_path text not null,
  caption text,
  title text not null,
  asset_type text not null,
  asset_role text,
  sequence_index int,
  source text not null,
  storage_source text not null default 'STATIC_PUBLIC',
  created_by text,
  superseded_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (deliverable_id, version_number)
);

create table if not exists public.site00_campaign_format_sequences (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.site00_campaign_packages(id) on delete cascade,
  format_family text not null,
  platform text not null,
  ordered_asset_keys text[] not null default '{}',
  version_number int not null,
  is_current boolean not null default true,
  sequence_changed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_campaign_package_migrations (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.site00_campaign_packages(id) on delete cascade,
  source text not null,
  records_examined int not null default 0,
  records_created int not null default 0,
  records_updated int not null default 0,
  records_skipped int not null default 0,
  errors jsonb not null default '[]'::jsonb,
  legacy_backup jsonb,
  completed_at timestamptz not null default now()
);

create table if not exists public.site00_campaign_package_audit_events (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.site00_campaign_packages(id) on delete cascade,
  entry_id text not null,
  actor text,
  event_type text not null,
  target_id text not null,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_site00_campaign_packages_entry on public.site00_campaign_packages(entry_id);
create index if not exists idx_site00_campaign_package_assets_pkg on public.site00_campaign_package_assets(package_id);
create index if not exists idx_site00_campaign_format_sequences_pkg_current on public.site00_campaign_format_sequences(package_id, format_family, is_current);

alter table public.site00_campaign_packages enable row level security;
alter table public.site00_campaign_package_assets enable row level security;
alter table public.site00_campaign_deliverables enable row level security;
alter table public.site00_campaign_deliverable_versions enable row level security;
alter table public.site00_campaign_format_sequences enable row level security;
alter table public.site00_campaign_package_migrations enable row level security;
alter table public.site00_campaign_package_audit_events enable row level security;
