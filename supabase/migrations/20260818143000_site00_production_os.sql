-- SITE 00 Admin Production Operating System — core schema

-- ─── Projects ───

create table if not exists public.site00_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  client_user_id uuid references auth.users(id) on delete set null,
  client_email text,
  build_class text,
  build_type text,
  identity_state text,
  current_phase text not null default 'DISCOVERY',
  project_health text not null default 'ON_TRACK',
  payment_state text not null default 'PENDING',
  provisioning_state text not null default 'NOT_STARTED',
  production_readiness_pct int not null default 0,
  environment_readiness_pct int not null default 0,
  recipe_id uuid,
  automation_level int not null default 2,
  status text not null default 'ACTIVE',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_project_intelligence (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.site00_projects(id) on delete cascade,
  identity_state text,
  build_class text,
  build_type text,
  business_type text,
  industry text,
  primary_goals jsonb not null default '[]'::jsonb,
  secondary_goals jsonb not null default '[]'::jsonb,
  target_audience jsonb not null default '[]'::jsonb,
  brand_maturity text,
  existing_assets jsonb not null default '[]'::jsonb,
  missing_assets jsonb not null default '[]'::jsonb,
  required_features jsonb not null default '[]'::jsonb,
  requested_integrations jsonb not null default '[]'::jsonb,
  timeline text,
  budget_range text,
  creative_preferences jsonb not null default '[]'::jsonb,
  creative_restrictions jsonb not null default '[]'::jsonb,
  technical_requirements jsonb not null default '[]'::jsonb,
  required_services jsonb not null default '[]'::jsonb,
  risk_flags jsonb not null default '[]'::jsonb,
  recommended_sequence jsonb not null default '[]'::jsonb,
  current_phase text,
  confidence numeric(5,2),
  provenance jsonb not null default '{}'::jsonb,
  last_generated_at timestamptz,
  last_reviewed_by_admin uuid references auth.users(id) on delete set null,
  stale_fields jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_creative_constitutions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.site00_projects(id) on delete cascade,
  brand_rules jsonb not null default '[]'::jsonb,
  client_preferences jsonb not null default '[]'::jsonb,
  technical_rules jsonb not null default '[]'::jsonb,
  approved_decisions jsonb not null default '[]'::jsonb,
  rejected_decisions jsonb not null default '[]'::jsonb,
  must_include jsonb not null default '[]'::jsonb,
  must_avoid jsonb not null default '[]'::jsonb,
  locked_assets jsonb not null default '[]'::jsonb,
  locked_design_decisions jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- ─── Recipes & deliverables ───

create table if not exists public.site00_production_recipes (
  id uuid primary key default gen_random_uuid(),
  recipe_key text not null unique,
  display_name text not null,
  build_class text not null,
  build_type text,
  description text,
  automation_level_default int not null default 2,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_recipe_deliverables (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.site00_production_recipes(id) on delete cascade,
  deliverable_key text not null,
  category text not null,
  title text not null,
  description text,
  sort_order int not null default 0,
  default_variants int not null default 1,
  approval_required boolean not null default true,
  client_review_required boolean not null default true,
  depends_on jsonb not null default '[]'::jsonb,
  required_services jsonb not null default '[]'::jsonb,
  unique (recipe_id, deliverable_key)
);

create table if not exists public.site00_project_deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  recipe_deliverable_id uuid references public.site00_recipe_deliverables(id) on delete set null,
  deliverable_key text not null,
  category text not null,
  type text not null default 'creative',
  title text not null,
  description text,
  status text not null default 'NOT_READY',
  priority text not null default 'MEDIUM',
  recipe_id uuid references public.site00_production_recipes(id) on delete set null,
  brief_id uuid,
  assigned_to text,
  variants_requested int not null default 1,
  approval_required boolean not null default true,
  client_review_required boolean not null default true,
  blocked_by jsonb not null default '[]'::jsonb,
  required_assets jsonb not null default '[]'::jsonb,
  required_services jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, deliverable_key)
);

create table if not exists public.site00_deliverable_dependencies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  source_deliverable_id uuid not null references public.site00_project_deliverables(id) on delete cascade,
  target_deliverable_id uuid not null references public.site00_project_deliverables(id) on delete cascade,
  dependency_type text not null default 'blocks',
  unique (source_deliverable_id, target_deliverable_id)
);

-- ─── Briefs, jobs, versions ───

create table if not exists public.site00_production_briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  deliverable_id uuid not null references public.site00_project_deliverables(id) on delete cascade,
  title text not null,
  status text not null default 'DRAFT',
  brief_json jsonb not null default '{}'::jsonb,
  provenance text not null default 'AI_SUGGESTED',
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  stale_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_production_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  deliverable_id uuid not null references public.site00_project_deliverables(id) on delete cascade,
  brief_id uuid references public.site00_production_briefs(id) on delete set null,
  job_type text not null default 'generation',
  status text not null default 'QUEUED',
  priority text not null default 'MEDIUM',
  variants_requested int not null default 1,
  progress_pct int not null default 0,
  provider text,
  provider_job_id text,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_deliverable_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  deliverable_id uuid not null references public.site00_project_deliverables(id) on delete cascade,
  job_id uuid references public.site00_production_jobs(id) on delete set null,
  version_number int not null,
  option_label text,
  title text,
  status text not null default 'AI_DRAFT',
  preview_url text,
  rationale text,
  creative_json jsonb not null default '{}'::jsonb,
  generation_metadata jsonb not null default '{}'::jsonb,
  parent_version_id uuid references public.site00_deliverable_versions(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (deliverable_id, version_number, option_label)
);

-- ─── Approvals & actions ───

create table if not exists public.site00_approval_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  deliverable_id uuid references public.site00_project_deliverables(id) on delete set null,
  version_id uuid references public.site00_deliverable_versions(id) on delete set null,
  brief_id uuid references public.site00_production_briefs(id) on delete set null,
  title text not null,
  category text not null,
  approval_type text not null default 'ADMIN_REVIEW',
  status text not null default 'AI_DRAFT',
  priority text not null default 'MEDIUM',
  submitted_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references auth.users(id) on delete set null,
  decision text,
  notes text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.site00_next_actions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  action_type text not null,
  priority text not null default 'MEDIUM',
  title text not null,
  reason text not null,
  dependency text,
  destination text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.site00_automation_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null unique,
  trigger_event text not null,
  action_key text not null,
  autonomy_level int not null default 2,
  requires_admin_approval boolean not null default false,
  active boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ─── Service catalog & access ───

create table if not exists public.site00_service_catalog (
  id uuid primary key default gen_random_uuid(),
  provider_key text not null unique,
  display_name text not null,
  category text not null,
  description text,
  connection_method text not null default 'oauth',
  ownership_default text not null default 'CLIENT',
  supported_build_classes jsonb not null default '[]'::jsonb,
  required_for_features jsonb not null default '[]'::jsonb,
  setup_url text,
  help_content text,
  active boolean not null default true
);

create table if not exists public.site00_project_service_requirements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  service_id uuid not null references public.site00_service_catalog(id) on delete cascade,
  required_phase text not null default 'BUILD',
  connection_state text not null default 'NOT_REQUIRED',
  permission_level text,
  owner_type text not null default 'CLIENT',
  connected_account_label text,
  last_verified_at timestamptz,
  dependency_impact jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  unique (project_id, service_id)
);

create table if not exists public.site00_service_connections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  service_id uuid not null references public.site00_service_catalog(id) on delete cascade,
  connection_state text not null default 'CLIENT_ACTION_REQUIRED',
  owner_type text not null default 'CLIENT',
  connected_account_label text,
  permission_level text,
  secret_ref text,
  last_verified_at timestamptz,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, service_id)
);

create table if not exists public.site00_provisioning_sessions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  status text not null default 'OPEN',
  current_step text not null default 'PROJECT_OFFICIAL',
  readiness_pct int not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

-- ─── Feedback & activity ───

create table if not exists public.site00_client_feedback (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  deliverable_id uuid references public.site00_project_deliverables(id) on delete set null,
  version_id uuid references public.site00_deliverable_versions(id) on delete set null,
  body text not null,
  status text not null default 'RECEIVED',
  created_at timestamptz not null default now()
);

create table if not exists public.site00_feedback_interpretations (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.site00_client_feedback(id) on delete cascade,
  interpretation_json jsonb not null default '{}'::jsonb,
  proposed_revision_brief jsonb not null default '{}'::jsonb,
  status text not null default 'PROPOSED',
  created_at timestamptz not null default now()
);

create table if not exists public.site00_project_activity (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  event_type text not null,
  actor_type text not null,
  actor_id uuid,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_studio_pipeline_state (
  project_id uuid primary key references public.site00_projects(id) on delete cascade,
  interpret_status text not null default 'PENDING',
  direct_status text not null default 'PENDING',
  produce_status text not null default 'PENDING',
  approve_status text not null default 'PENDING',
  updated_at timestamptz not null default now()
);

-- FK backfill for projects.recipe_id
alter table public.site00_projects
  drop constraint if exists site00_projects_recipe_id_fkey;
alter table public.site00_projects
  add constraint site00_projects_recipe_id_fkey
  foreign key (recipe_id) references public.site00_production_recipes(id) on delete set null;

alter table public.site00_project_deliverables
  drop constraint if exists site00_project_deliverables_brief_id_fkey;
alter table public.site00_project_deliverables
  add constraint site00_project_deliverables_brief_id_fkey
  foreign key (brief_id) references public.site00_production_briefs(id) on delete set null;

-- Indexes
create index if not exists site00_projects_client_idx on public.site00_projects(client_user_id);
create index if not exists site00_projects_status_idx on public.site00_projects(status, current_phase);
create index if not exists site00_project_deliverables_project_idx on public.site00_project_deliverables(project_id, status);
create index if not exists site00_production_jobs_project_idx on public.site00_production_jobs(project_id, status);
create index if not exists site00_approval_requests_status_idx on public.site00_approval_requests(status, category);
create index if not exists site00_next_actions_open_idx on public.site00_next_actions(project_id) where resolved_at is null;
create index if not exists site00_project_activity_project_idx on public.site00_project_activity(project_id, created_at desc);

-- RLS (service_role only — all access via admin API)
do $$
declare
  t text;
begin
  foreach t in array array[
    'site00_projects','site00_project_intelligence','site00_creative_constitutions',
    'site00_production_recipes','site00_recipe_deliverables','site00_project_deliverables',
    'site00_deliverable_dependencies','site00_production_briefs','site00_production_jobs',
    'site00_deliverable_versions','site00_approval_requests','site00_next_actions',
    'site00_automation_rules','site00_service_catalog','site00_project_service_requirements',
    'site00_service_connections','site00_provisioning_sessions','site00_client_feedback',
    'site00_feedback_interpretations','site00_project_activity','site00_studio_pipeline_state'
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

-- Seed service catalog
insert into public.site00_service_catalog (provider_key, display_name, category, description, connection_method, ownership_default, setup_url)
values
  ('vercel', 'VERCEL', 'HOSTING', 'DEPLOYMENT / HOSTING', 'oauth', 'CLIENT', 'https://vercel.com'),
  ('supabase', 'SUPABASE', 'BACKEND', 'DATABASE / BACKEND', 'oauth', 'CLIENT', 'https://supabase.com'),
  ('godaddy', 'GODADDY', 'DOMAIN', 'DOMAIN / DNS', 'delegated', 'CLIENT', 'https://godaddy.com'),
  ('github', 'GITHUB', 'REPOSITORY', 'CODE REPOSITORY', 'oauth', 'CLIENT', 'https://github.com'),
  ('stripe', 'STRIPE', 'PAYMENTS', 'PAYMENTS', 'oauth', 'CLIENT', 'https://stripe.com'),
  ('resend', 'RESEND', 'EMAIL', 'TRANSACTIONAL EMAIL', 'api_token', 'CLIENT', 'https://resend.com'),
  ('shopify', 'SHOPIFY', 'COMMERCE', 'COMMERCE', 'oauth', 'CLIENT', 'https://shopify.com')
on conflict (provider_key) do nothing;

-- Seed SITE / ECOMMERCE recipe
insert into public.site00_production_recipes (recipe_key, display_name, build_class, build_type, description)
values ('site_ecommerce', 'SITE / ECOMMERCE', 'SITE', 'ECOMMERCE', 'STRUCTURED ECOMMERCE SITE PRODUCTION RECIPE')
on conflict (recipe_key) do nothing;

insert into public.site00_recipe_deliverables (recipe_id, deliverable_key, category, title, description, sort_order, default_variants, depends_on)
select r.id, v.deliverable_key, v.category, v.title, v.description, v.sort_order, v.default_variants, v.depends_on::jsonb
from public.site00_production_recipes r
cross join (values
  ('strategy_synthesis', 'STRATEGY', 'STRATEGY SYNTHESIS', 'SYNTHESIZE CLIENT INTAKE INTO STRATEGY', 10, 1, '[]'),
  ('sitemap', 'STRATEGY', 'SITEMAP', 'CONTENT ARCHITECTURE SITEMAP', 20, 1, '["strategy_synthesis"]'),
  ('conversion_architecture', 'STRATEGY', 'CONVERSION ARCHITECTURE', 'CONVERSION FLOW ARCHITECTURE', 30, 1, '["sitemap"]'),
  ('homepage_visual_direction', 'WEBSITE', 'HOMEPAGE ART DIRECTION', 'HOMEPAGE VISUAL DIRECTION OPTIONS', 40, 3, '["sitemap"]'),
  ('collection_page', 'WEBSITE', 'COLLECTION PAGE', 'COLLECTION PAGE DIRECTION', 50, 2, '["homepage_visual_direction"]'),
  ('product_page', 'WEBSITE', 'PRODUCT PAGE', 'PRODUCT PAGE DIRECTION', 60, 2, '["homepage_visual_direction"]'),
  ('cart_checkout', 'WEBSITE', 'CART & CHECKOUT', 'CART AND CHECKOUT UX', 70, 1, '["product_page"]'),
  ('mobile_adaptation', 'WEBSITE', 'MOBILE ADAPTATION', 'MOBILE HOMEPAGE ADAPTATION', 80, 3, '["homepage_visual_direction"]'),
  ('design_system', 'PRODUCTION', 'DESIGN SYSTEM', 'DESIGN SYSTEM TOKENS AND COMPONENTS', 90, 1, '["homepage_visual_direction"]'),
  ('developer_handoff', 'PRODUCTION', 'DEVELOPER HANDOFF', 'DEVELOPER HANDOFF PACKAGE', 100, 1, '["design_system","mobile_adaptation"]')
) as v(deliverable_key, category, title, description, sort_order, default_variants, depends_on)
where r.recipe_key = 'site_ecommerce'
on conflict (recipe_id, deliverable_key) do nothing;

-- Default automation rules
insert into public.site00_automation_rules (rule_key, trigger_event, action_key, autonomy_level, requires_admin_approval, active)
values
  ('idnty_completed', 'IDNTY_COMPLETED', 'generate_identity_summary', 2, false, true),
  ('bldr_completed', 'BLDR_COMPLETED', 'generate_project_blueprint', 2, false, true),
  ('payment_confirmed', 'PAYMENT_CONFIRMED', 'generate_provisioning_requirements', 2, false, true),
  ('project_created', 'PROJECT_CREATED', 'generate_production_plan', 2, false, true),
  ('production_plan_ready', 'PRODUCTION_PLAN_READY', 'create_suggested_tasks', 2, true, true),
  ('art_direction_approved', 'ART_DIRECTION_APPROVED', 'prepare_next_stage_brief', 2, false, true),
  ('design_generation', 'DESIGN_GENERATION', 'generate_assets', 2, true, true),
  ('client_feedback', 'CLIENT_FEEDBACK', 'analyze_feedback', 2, false, true),
  ('final_delivery', 'FINAL_DELIVERY', 'send_to_client', 1, true, true)
on conflict (rule_key) do nothing;
