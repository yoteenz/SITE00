-- C1.9 — Brand language identity durable persistence

create table if not exists public.site00_brand_language_identities (
  id uuid primary key default gen_random_uuid(),
  brand_id text not null,
  brand_name text not null,
  identity_key text not null unique,
  version_label text not null default 'V001',
  is_current boolean not null default true,
  confidence text not null default 'MODERATE',
  identity_json jsonb not null default '{}'::jsonb,
  voice_confidence_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_brand_language_evidence (
  id uuid primary key default gen_random_uuid(),
  evidence_id text not null unique,
  brand_id text not null,
  source_type text not null,
  source_id text,
  text_sample text not null,
  approved boolean not null default false,
  weight numeric not null default 1,
  recency timestamptz,
  scope text not null default 'BRAND_SCOPE',
  campaign_id text,
  learning_signal text,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_brand_rhetorical_signatures (
  id uuid primary key default gen_random_uuid(),
  brand_id text not null,
  signature_key text not null unique,
  version_label text not null default 'V001',
  sentence_behavior text,
  rhetorical_patterns jsonb not null default '[]'::jsonb,
  preferred_structures jsonb not null default '[]'::jsonb,
  avoided_structures jsonb not null default '[]'::jsonb,
  humor_behavior text,
  cta_behavior text,
  punctuation_behavior text,
  confidence text not null default 'MODERATE',
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_founder_copy_actions (
  id uuid primary key default gen_random_uuid(),
  action_key text not null unique,
  copy_package_id text not null,
  content_unit_id text not null,
  action text not null,
  version_label text,
  caption text,
  project_id text,
  scope text,
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_site00_brand_language_brand on public.site00_brand_language_identities(brand_id);
create index if not exists idx_site00_brand_evidence_brand on public.site00_brand_language_evidence(brand_id);
create index if not exists idx_site00_founder_copy_pkg on public.site00_founder_copy_actions(copy_package_id);

alter table public.site00_brand_language_identities enable row level security;
alter table public.site00_brand_language_evidence enable row level security;
alter table public.site00_brand_rhetorical_signatures enable row level security;
alter table public.site00_founder_copy_actions enable row level security;
