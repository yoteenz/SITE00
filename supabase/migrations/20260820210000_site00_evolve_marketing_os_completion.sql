-- SITE 00 — EVOLVE Marketing OS completion (idempotent — only missing objects)

-- FK on objectives → campaigns (may already exist)
alter table public.site00_marketing_objectives
  drop constraint if exists site00_marketing_objectives_campaign_fkey;
alter table public.site00_marketing_objectives
  add constraint site00_marketing_objectives_campaign_fkey
  foreign key (campaign_id) references public.site00_marketing_campaigns(id) on delete set null;

create table if not exists public.site00_campaign_objectives (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.site00_marketing_campaigns(id) on delete cascade,
  objective_id uuid not null references public.site00_marketing_objectives(id) on delete cascade,
  unique (campaign_id, objective_id)
);

create table if not exists public.site00_campaign_channels (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.site00_marketing_campaigns(id) on delete cascade,
  channel_key text not null,
  role text,
  unique (campaign_id, channel_key)
);

create table if not exists public.site00_campaign_deliverables (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.site00_marketing_campaigns(id) on delete cascade,
  deliverable_key text not null,
  title text not null,
  deliverable_type text not null,
  status text not null default 'PLANNED',
  metadata jsonb not null default '{}'::jsonb,
  unique (campaign_id, deliverable_key)
);

create table if not exists public.site00_campaign_dependencies (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.site00_marketing_campaigns(id) on delete cascade,
  depends_on_type text not null,
  depends_on_id uuid not null,
  dependency_type text not null default 'blocks'
);

create table if not exists public.site00_campaign_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.site00_marketing_campaigns(id) on delete cascade,
  event_type text not null,
  actor_email text,
  summary text not null,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_content_calendar_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  campaign_id uuid references public.site00_marketing_campaigns(id) on delete set null,
  channel_key text not null,
  content_type text not null,
  title text not null,
  objective text,
  content_pillar text,
  planned_date date,
  status text not null default 'IDEA',
  production_required boolean not null default false,
  approval_required boolean not null default true,
  asset_refs jsonb not null default '[]'::jsonb,
  copy_refs jsonb not null default '[]'::jsonb,
  published_url text,
  performance_link_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_content_calendar_org_date_idx
  on public.site00_content_calendar_items(organization_id, planned_date);

create table if not exists public.site00_marketing_email_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  campaign_id uuid references public.site00_marketing_campaigns(id) on delete set null,
  calendar_item_id uuid references public.site00_content_calendar_items(id) on delete set null,
  email_type text not null,
  objective text,
  audience text,
  subject text,
  preheader text,
  content_brief text,
  cta text,
  template_ref text,
  approval_state text not null default 'DRAFT',
  delivery_state text not null default 'NOT_SCHEDULED',
  performance jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_social_content_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  campaign_id uuid references public.site00_marketing_campaigns(id) on delete set null,
  calendar_item_id uuid references public.site00_content_calendar_items(id) on delete set null,
  platform text not null,
  content_pillar text,
  format text,
  hook text,
  caption text,
  cta text,
  asset_requirement text,
  publish_state text not null default 'DRAFT',
  performance jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_studio_production_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  project_id uuid references public.site00_projects(id) on delete set null,
  campaign_id uuid references public.site00_marketing_campaigns(id) on delete set null,
  calendar_item_id uuid references public.site00_content_calendar_items(id) on delete set null,
  production_type text not null,
  objective text,
  brief text,
  deliverables jsonb not null default '[]'::jsonb,
  canon_refs jsonb not null default '[]'::jsonb,
  reference_refs jsonb not null default '[]'::jsonb,
  asset_refs jsonb not null default '[]'::jsonb,
  priority text not null default 'MEDIUM',
  due_date date,
  approval_state text not null default 'PENDING',
  production_state text not null default 'REQUESTED',
  governance_state text,
  external_production_id text,
  external_status text,
  estimated_cost numeric,
  actual_cost numeric,
  created_by text,
  approved_by text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_marketing_approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  subject_type text not null,
  subject_id uuid not null,
  approval_type text not null,
  status text not null default 'PENDING',
  requested_by text,
  decided_by text,
  decided_at timestamptz,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_marketing_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  plan_type text not null default 'QUARTERLY',
  period_label text not null,
  period_start date,
  period_end date,
  objectives jsonb not null default '[]'::jsonb,
  campaign_expectations jsonb not null default '[]'::jsonb,
  content_expectations jsonb not null default '[]'::jsonb,
  production_expectations jsonb not null default '[]'::jsonb,
  measurement_targets jsonb not null default '[]'::jsonb,
  budget_notes text,
  review_state text not null default 'DRAFT',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_marketing_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  campaign_id uuid references public.site00_marketing_campaigns(id) on delete set null,
  channel_key text,
  content_item_id uuid,
  metric_key text not null,
  metric_value numeric,
  metric_unit text,
  source text not null,
  observed_at timestamptz not null default now(),
  data_freshness text not null default 'UNKNOWN',
  confidence text not null default 'UNKNOWN',
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.site00_marketing_performance_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  campaign_id uuid references public.site00_marketing_campaigns(id) on delete set null,
  channel_key text,
  date_range_start date,
  date_range_end date,
  metrics jsonb not null default '{}'::jsonb,
  source text not null,
  observed_at timestamptz not null default now(),
  data_freshness text not null default 'UNKNOWN',
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.site00_marketing_insights (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  insight_type text not null default 'PERFORMANCE_LEARNING',
  title text not null,
  summary text not null,
  evidence jsonb not null default '[]'::jsonb,
  confidence text not null default 'MEDIUM',
  recommendation text,
  recommendation_status text not null default 'SUGGESTED',
  content_brain_entry_id uuid references public.site00_content_brain_entries(id) on delete set null,
  campaign_id uuid references public.site00_marketing_campaigns(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- RLS (service_role only)
do $$
declare
  t text;
begin
  foreach t in array array[
    'site00_marketing_profiles','site00_marketing_objectives','site00_marketing_channels',
    'site00_marketing_assessments','site00_marketing_manifests','site00_marketing_manifest_items',
    'site00_marketing_campaigns','site00_campaign_objectives','site00_campaign_channels',
    'site00_campaign_deliverables','site00_campaign_dependencies','site00_campaign_events',
    'site00_content_calendar_items','site00_marketing_email_items','site00_social_content_items',
    'site00_studio_production_requests','site00_marketing_approvals','site00_marketing_plans',
    'site00_marketing_metrics','site00_marketing_performance_snapshots','site00_marketing_insights'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    if not exists (
      select 1 from pg_policies where tablename = t and policyname = 'service_role_all'
    ) then
      execute format(
        'create policy service_role_all on public.%I for all to service_role using (true) with check (true)',
        t
      );
    end if;
  end loop;
end $$;
