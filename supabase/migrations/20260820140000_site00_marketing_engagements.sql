-- SITE 00 EVOLVE / Marketing & Content engagements

create table if not exists public.site00_marketing_engagements (
  id uuid primary key default gen_random_uuid(),
  engagement_code text not null unique,
  client_user_id uuid,
  client_email text not null,
  project_id uuid references public.site00_projects(id) on delete set null,
  identity_id uuid references public.site00_identities(id) on delete set null,
  campaign_name text not null default 'UNTITLED CAMPAIGN',
  service_category text not null,
  status text not null default 'DRAFT',
  payment_state text not null default 'PENDING',
  brand_source text not null default 'UNKNOWN',
  brand_setup_required boolean not null default false,
  intake jsonb not null default '{}'::jsonb,
  scope jsonb not null default '{}'::jsonb,
  asset_manifest jsonb not null default '[]'::jsonb,
  client_phase text not null default '01',
  client_action_required boolean not null default false,
  client_action_label text,
  provisioning_state text not null default 'NOT_STARTED',
  provisioning_error text,
  studio_world_campaign_id text,
  external_sync_status text not null default 'NOT_LINKED',
  external_last_synced_at timestamptz,
  authorized_at timestamptz,
  paid_at timestamptz,
  provisioned_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_marketing_engagements_client_email_idx
  on public.site00_marketing_engagements (client_email);
create index if not exists site00_marketing_engagements_status_idx
  on public.site00_marketing_engagements (status);
create index if not exists site00_marketing_engagements_project_idx
  on public.site00_marketing_engagements (project_id);
create index if not exists site00_marketing_engagements_studio_world_idx
  on public.site00_marketing_engagements (studio_world_campaign_id);

create table if not exists public.site00_marketing_engagement_events (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.site00_marketing_engagements(id) on delete cascade,
  event_type text not null,
  actor text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists site00_marketing_engagement_events_engagement_idx
  on public.site00_marketing_engagement_events (engagement_id, created_at desc);

create table if not exists public.site00_external_production_links (
  id uuid primary key default gen_random_uuid(),
  external_system text not null default 'STUDIO_WORLD',
  external_engagement_id uuid not null references public.site00_marketing_engagements(id) on delete cascade,
  external_campaign_id text,
  sync_status text not null default 'PENDING',
  external_status text,
  last_synced_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (external_system, external_engagement_id)
);

alter table public.site00_marketing_engagements enable row level security;
alter table public.site00_marketing_engagement_events enable row level security;
alter table public.site00_external_production_links enable row level security;
