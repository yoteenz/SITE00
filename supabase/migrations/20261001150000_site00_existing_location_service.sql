-- P0.SITE00.EXISTING-LOCATION.SERVICE-ARCHITECTURE1 — additive schema (service role API; RLS enabled, no public policies)

create table if not exists public.site00_existing_location_cases (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique,
  client_user_id uuid,
  client_email text,
  project_id uuid references public.site00_projects(id) on delete set null,
  platform text,
  site_url text,
  request_type text,
  client_description text not null default '',
  expected_behavior text not null default '',
  actual_behavior text not null default '',
  enhancement_goal text not null default '',
  evidence jsonb not null default '[]'::jsonb,
  access_requirements jsonb not null default '[]'::jsonb,
  access_status text not null default 'NOT_REQUESTED',
  status text not null default 'DRAFT',
  diagnosis_status text not null default 'DRAFT',
  risk_level text not null default 'UNKNOWN',
  affected_systems jsonb not null default '[]'::jsonb,
  findings jsonb not null default '[]'::jsonb,
  recommended_intervention text,
  service_classification text,
  modify_production_authorized boolean not null default false,
  quote_id uuid,
  approval_status text not null default 'NONE',
  checkout_status text not null default 'NONE',
  implementation_status text not null default 'NONE',
  qa_status text not null default 'NONE',
  entitlement jsonb,
  courtesy_redemption_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists site00_existing_location_cases_status_idx on public.site00_existing_location_cases (status);
create index if not exists site00_existing_location_cases_platform_idx on public.site00_existing_location_cases (platform);

create table if not exists public.site00_existing_location_quotes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.site00_existing_location_cases(id) on delete cascade,
  currency text not null default 'USD',
  line_items jsonb not null default '[]'::jsonb,
  subtotal_cents int not null default 0,
  discount_cents int not null default 0,
  total_cents int not null default 0,
  diagnosis_fee_cents int not null default 0,
  basis_notes text not null default '',
  locked boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_existing_location_case_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.site00_existing_location_cases(id) on delete cascade,
  event_type text not null,
  actor text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists site00_existing_location_case_events_case_idx on public.site00_existing_location_case_events (case_id);

create table if not exists public.site00_courtesy_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  display_label text not null,
  discount_type text not null,
  discount_value numeric not null default 0,
  eligible_services jsonb not null default '["EXISTING_LOCATION"]'::jsonb,
  eligible_client_id uuid,
  eligible_email text,
  max_redemptions int not null default 1,
  redemptions_used int not null default 0,
  valid_from timestamptz not null default now(),
  expires_at timestamptz,
  founder_note text not null default '',
  active boolean not null default true,
  created_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_courtesy_redemptions (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.site00_courtesy_codes(id) on delete restrict,
  case_id uuid not null references public.site00_existing_location_cases(id) on delete cascade,
  quote_id uuid not null references public.site00_existing_location_quotes(id) on delete cascade,
  client_email text,
  discount_applied_cents int not null default 0,
  final_total_cents int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_capabilities (
  capability_id text primary key,
  name text not null,
  category text not null,
  origin_project text,
  origin_case uuid references public.site00_existing_location_cases(id) on delete set null,
  description text not null default '',
  supported_platforms jsonb not null default '[]'::jsonb,
  experience_family text not null default '',
  reusability_status text not null default 'PROJECT_LOCAL',
  maturity_status text not null default 'DRAFT',
  version text not null default '0.1.0',
  created_at timestamptz not null default now()
);

alter table public.site00_existing_location_cases enable row level security;
alter table public.site00_existing_location_quotes enable row level security;
alter table public.site00_existing_location_case_events enable row level security;
alter table public.site00_courtesy_codes enable row level security;
alter table public.site00_courtesy_redemptions enable row level security;
alter table public.site00_capabilities enable row level security;
