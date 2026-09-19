-- C1.5 — Creative intelligence persistence (corrections + senior judgments)

create table if not exists public.site00_creative_corrections (
  id uuid primary key default gen_random_uuid(),
  correction_key text not null unique,
  project_id text not null,
  campaign_id text not null,
  content_unit_id text,
  feedback_type text not null,
  surface_feedback text not null,
  underlying_issue text not null,
  generalizable_principle text not null,
  applicable_domains jsonb not null default '[]'::jsonb,
  non_applicable_domains jsonb not null default '[]'::jsonb,
  overfit_risk text not null default 'LOW',
  confidence numeric not null default 0.8,
  active boolean not null default true,
  supersedes uuid,
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_senior_creative_judgments (
  id uuid primary key default gen_random_uuid(),
  judgment_key text not null unique,
  project_id text not null,
  campaign_id text not null,
  content_unit_id text not null,
  initial_winner text not null,
  final_winner text not null,
  quality_tier text not null,
  founder_handholding_risk text not null,
  runtime_mode text not null,
  reasoning_depth_limited boolean not null default false,
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_site00_creative_corrections_project on public.site00_creative_corrections(project_id);
create index if not exists idx_site00_senior_judgments_campaign on public.site00_senior_creative_judgments(campaign_id);

alter table public.site00_creative_corrections enable row level security;
alter table public.site00_senior_creative_judgments enable row level security;
