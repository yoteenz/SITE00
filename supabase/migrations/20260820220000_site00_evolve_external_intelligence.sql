-- SITE 00 — EVOLVE Sprint 03: External intelligence + provider connection architecture

-- Extend external connections for EVOLVE provider model
alter table public.site00_external_connections
  add column if not exists provider_key text,
  add column if not exists provider_category text,
  add column if not exists connection_type text default 'OAUTH',
  add column if not exists display_name text,
  add column if not exists external_account_id text,
  add column if not exists external_account_name text,
  add column if not exists external_property_id text,
  add column if not exists external_property_name text,
  add column if not exists status text,
  add column if not exists health text default 'UNKNOWN',
  add column if not exists granted_capabilities jsonb not null default '[]'::jsonb,
  add column if not exists supported_capabilities jsonb not null default '[]'::jsonb,
  add column if not exists granted_scopes jsonb not null default '[]'::jsonb,
  add column if not exists connected_at timestamptz,
  add column if not exists last_verified_at timestamptz,
  add column if not exists last_error_at timestamptz,
  add column if not exists last_error_code text,
  add column if not exists last_error_message text,
  add column if not exists credential_state text default 'NOT_CONFIGURED';

-- Backfill status from connection_state where null
update public.site00_external_connections
set status = connection_state
where status is null;

-- EVOLVE pilot / automation configuration per organization
create table if not exists public.site00_evolve_pilot_config (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade unique,
  pilot_role text,
  automation_mode text not null default 'MANUAL',
  publishing_status text not null default 'DISABLED',
  provider_status text not null default 'NOT_CONNECTED',
  automation_status text not null default 'DISABLED',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Connection audit / sync events
create table if not exists public.site00_connection_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  connection_id uuid references public.site00_external_connections(id) on delete set null,
  event_type text not null,
  actor_email text,
  summary text not null,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists site00_connection_events_org_idx
  on public.site00_connection_events(organization_id, created_at desc);

-- Sync runs
create table if not exists public.site00_connection_sync_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  connection_id uuid not null references public.site00_external_connections(id) on delete cascade,
  sync_type text not null default 'METRICS',
  state text not null default 'STARTED',
  records_fetched int not null default 0,
  records_normalized int not null default 0,
  records_rejected int not null default 0,
  period_start timestamptz,
  period_end timestamptz,
  error_code text,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

-- Normalized metric observations with provenance
create table if not exists public.site00_marketing_metric_observations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  connection_id uuid references public.site00_external_connections(id) on delete set null,
  sync_run_id uuid references public.site00_connection_sync_runs(id) on delete set null,
  campaign_id uuid references public.site00_marketing_campaigns(id) on delete set null,
  calendar_item_id uuid references public.site00_content_calendar_items(id) on delete set null,
  provider_key text not null,
  external_account_id text,
  external_property_id text,
  external_object_id text,
  metric_key text not null,
  metric_value numeric,
  metric_unit text,
  dimension text,
  dimension_value text,
  period_start timestamptz,
  period_end timestamptz,
  observed_at timestamptz not null default now(),
  ingested_at timestamptz not null default now(),
  attribution_state text not null default 'UNATTRIBUTED',
  confidence text not null default 'MEDIUM',
  source_metadata jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists site00_metric_obs_org_period_idx
  on public.site00_marketing_metric_observations(organization_id, metric_key, period_start desc);

-- Distribution jobs (foundation — no live dispatch this sprint)
create table if not exists public.site00_distribution_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  campaign_id uuid references public.site00_marketing_campaigns(id) on delete set null,
  calendar_item_id uuid references public.site00_content_calendar_items(id) on delete set null,
  social_item_id uuid references public.site00_social_content_items(id) on delete set null,
  email_item_id uuid references public.site00_marketing_email_items(id) on delete set null,
  production_request_id uuid references public.site00_studio_production_requests(id) on delete set null,
  approval_id uuid references public.site00_marketing_approvals(id) on delete set null,
  connection_id uuid references public.site00_external_connections(id) on delete set null,
  channel text not null,
  scheduled_for timestamptz,
  state text not null default 'DRAFT',
  automation_mode text not null default 'MANUAL',
  created_by text,
  approved_by text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- External publication records (foundation)
create table if not exists public.site00_external_publications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  distribution_job_id uuid references public.site00_distribution_jobs(id) on delete set null,
  connection_id uuid references public.site00_external_connections(id) on delete set null,
  provider_key text not null,
  external_publication_id text,
  external_url text,
  published_at timestamptz,
  verified_at timestamptz,
  status text not null default 'PENDING',
  provider_response_ref text,
  content_lineage jsonb not null default '{}'::jsonb,
  metrics_sync_status text not null default 'NOT_SYNCED',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Register EVOLVE marketing provider systems
insert into public.site00_external_systems (system_key, system_type, display_name, description, metadata)
values
  ('google_analytics', 'ANALYTICS_PROVIDER', 'Google Analytics', 'Web analytics measurement', '{"provider_category":"ANALYTICS","provider_key":"google_analytics"}'),
  ('google_search_console', 'ANALYTICS_PROVIDER', 'Google Search Console', 'Search performance measurement', '{"provider_category":"SEARCH","provider_key":"google_search_console"}'),
  ('meta_instagram', 'SOCIAL_PROVIDER', 'Meta / Instagram', 'Instagram social platform', '{"provider_category":"SOCIAL","provider_key":"meta_instagram"}'),
  ('tiktok', 'SOCIAL_PROVIDER', 'TikTok', 'TikTok social platform', '{"provider_category":"SOCIAL","provider_key":"tiktok"}'),
  ('resend', 'EMAIL_PROVIDER', 'Resend', 'Transactional/marketing email', '{"provider_category":"EMAIL","provider_key":"resend"}'),
  ('sendgrid', 'EMAIL_PROVIDER', 'SendGrid', 'Email delivery', '{"provider_category":"EMAIL","provider_key":"sendgrid"}')
on conflict (system_key) do update set
  display_name = excluded.display_name,
  metadata = excluded.metadata;

-- NDXbook organization (independent brand context — assessment required, not launch-ready)
insert into public.site00_organizations (slug, name, classification, state, client_facing, metadata)
values (
  'ndxbook',
  'NDXBOOK',
  'MANAGED_BRAND',
  'ACTIVE',
  true,
  '{"registered":"evolve_sprint03","pilot_role":"DISTRIBUTION_PUBLISHING_PILOT","note":"Future controlled publishing pilot — independent organization context"}'
)
on conflict (slug) do update set
  metadata = site00_organizations.metadata || excluded.metadata;

-- RLS
do $$
declare t text;
begin
  foreach t in array array[
    'site00_evolve_pilot_config','site00_connection_events','site00_connection_sync_runs',
    'site00_marketing_metric_observations','site00_distribution_jobs','site00_external_publications'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    if not exists (select 1 from pg_policies where tablename = t and policyname = 'service_role_all') then
      execute format(
        'create policy service_role_all on public.%I for all to service_role using (true) with check (true)',
        t
      );
    end if;
  end loop;
end $$;
