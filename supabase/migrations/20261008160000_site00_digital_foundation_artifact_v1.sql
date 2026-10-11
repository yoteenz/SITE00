-- SITE 00 — IDNTY Digital Foundation Artifact V1

create table if not exists public.site00_df_referral_sources (
  referral_source_id uuid primary key default gen_random_uuid(),
  kind text not null,
  label text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_df_leads (
  lead_id uuid primary key default gen_random_uuid(),
  contact_email text,
  contact_name text,
  business_name text,
  referral_source_id uuid references public.site00_df_referral_sources(referral_source_id) on delete set null,
  referral_funnel_stage text not null default 'REFERRED',
  created_at timestamptz not null default now()
);

create table if not exists public.site00_df_artifacts (
  artifact_id uuid primary key default gen_random_uuid(),
  public_token text not null unique,
  lead_id uuid not null references public.site00_df_leads(lead_id) on delete cascade,
  client_org_id uuid,
  contact_id uuid,
  referral_source_id uuid references public.site00_df_referral_sources(referral_source_id) on delete set null,
  service_id text not null default 'IDNTY.DIGITAL_FOUNDATION',
  state text not null,
  intake_state text not null,
  quote_id uuid,
  payment_state text not null,
  project_state text not null,
  completion_state text not null,
  build_interest text not null default 'NONE',
  build_recommendation text not null default 'NONE',
  foundation_credit_id uuid,
  intake jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  opened_at timestamptz,
  last_activity_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists site00_df_artifacts_token_idx on public.site00_df_artifacts (public_token);

create table if not exists public.site00_df_quotes (
  quote_id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references public.site00_df_artifacts(artifact_id) on delete cascade,
  base_service_version text not null,
  base_price_minor integer not null,
  selected_addons jsonb not null default '[]'::jsonb,
  addon_total_minor integer not null,
  manual_adjustments_minor integer not null default 0,
  subtotal_minor integer not null,
  currency text not null,
  projected_min_days integer not null,
  projected_max_days integer not null,
  timeline_custom_review boolean not null default false,
  third_party_cost_notice text not null,
  quote_version integer not null,
  status text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists public.site00_df_quote_acceptances (
  artifact_id uuid primary key references public.site00_df_artifacts(artifact_id) on delete cascade,
  quote_version integer not null,
  terms_version text not null,
  accepted_at timestamptz not null,
  accepted_disclosures jsonb not null,
  source_surface text not null,
  client_ip text,
  user_agent text
);

create table if not exists public.site00_df_artifact_events (
  event_id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references public.site00_df_artifacts(artifact_id) on delete cascade,
  event_type text not null,
  actor text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_df_client_actions (
  request_id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references public.site00_df_artifacts(artifact_id) on delete cascade,
  action_type text not null,
  title text not null,
  detail text not null,
  status text not null,
  response jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.site00_df_approvals (
  approval_id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references public.site00_df_artifacts(artifact_id) on delete cascade,
  subject text not null,
  version integer not null,
  status text not null,
  actor text not null,
  note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.site00_df_project_stages (
  artifact_id uuid not null references public.site00_df_artifacts(artifact_id) on delete cascade,
  stage_code text not null,
  status text not null,
  updated_at timestamptz not null,
  primary key (artifact_id, stage_code)
);

create table if not exists public.site00_df_build_credits (
  credit_id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references public.site00_df_artifacts(artifact_id) on delete cascade,
  amount_minor integer not null,
  currency text not null,
  valid_from timestamptz not null,
  expires_at timestamptz not null,
  status text not null,
  applicable_product_types jsonb not null default '[]'::jsonb,
  applied_project_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_df_stripe_events (
  stripe_event_id text primary key,
  processed_at timestamptz not null default now()
);

alter table public.site00_df_referral_sources enable row level security;
alter table public.site00_df_leads enable row level security;
alter table public.site00_df_artifacts enable row level security;
alter table public.site00_df_quotes enable row level security;
alter table public.site00_df_quote_acceptances enable row level security;
alter table public.site00_df_artifact_events enable row level security;
alter table public.site00_df_client_actions enable row level security;
alter table public.site00_df_approvals enable row level security;
alter table public.site00_df_project_stages enable row level security;
alter table public.site00_df_build_credits enable row level security;
alter table public.site00_df_stripe_events enable row level security;
