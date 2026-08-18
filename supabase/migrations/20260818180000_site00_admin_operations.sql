-- SITE 00 Admin Operations — identities, intakes, leads, sites, discovery, finance, activity

create table if not exists public.site00_identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  display_name text,
  idnty_state text,
  account_status text not null default 'ACTIVE',
  onboarding_status text not null default 'INCOMPLETE',
  is_client boolean not null default false,
  is_lead boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_identities_email_idx on public.site00_identities (lower(email));
create index if not exists site00_identities_user_id_idx on public.site00_identities (user_id);

create table if not exists public.site00_idnty_submissions (
  id uuid primary key default gen_random_uuid(),
  identity_id uuid references public.site00_identities(id) on delete set null,
  email text,
  identity_state text not null,
  status text not null default 'DRAFT',
  answers jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_bldr_intakes (
  id uuid primary key default gen_random_uuid(),
  identity_id uuid references public.site00_identities(id) on delete set null,
  email text,
  build_class text not null,
  primary_type text,
  audience text,
  status text not null default 'IN_PROGRESS',
  budget_range text,
  timeline text,
  answers jsonb not null default '{}'::jsonb,
  recommendation text,
  recommendation_reasons jsonb not null default '[]'::jsonb,
  project_id uuid references public.site00_projects(id) on delete set null,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_bldr_intakes_build_class_idx on public.site00_bldr_intakes (build_class);
create index if not exists site00_bldr_intakes_status_idx on public.site00_bldr_intakes (status);

create table if not exists public.site00_leads (
  id uuid primary key default gen_random_uuid(),
  identity_id uuid references public.site00_identities(id) on delete set null,
  bldr_intake_id uuid references public.site00_bldr_intakes(id) on delete set null,
  contact_name text not null,
  email text not null,
  source text not null default 'OTHER',
  idnty_state text,
  build_class text,
  budget_range text,
  status text not null default 'NEW',
  owner_email text,
  estimated_value numeric(12,2),
  last_contact_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_leads_status_idx on public.site00_leads (status);

create table if not exists public.site00_discovery_bookings (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.site00_leads(id) on delete set null,
  identity_id uuid references public.site00_identities(id) on delete set null,
  contact_name text not null,
  email text not null,
  build_class text,
  scheduled_at timestamptz not null,
  duration_minutes int not null default 30,
  status text not null default 'UPCOMING',
  owner_email text,
  notes text,
  outcome text,
  project_id uuid references public.site00_projects(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_discovery_bookings_status_idx on public.site00_discovery_bookings (status);
create index if not exists site00_discovery_bookings_scheduled_idx on public.site00_discovery_bookings (scheduled_at);

create table if not exists public.site00_sites (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.site00_projects(id) on delete set null,
  identity_id uuid references public.site00_identities(id) on delete set null,
  name text not null,
  domain text,
  status text not null default 'DRAFT',
  health text not null default 'OK',
  owner_email text,
  last_deploy_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_sites_status_idx on public.site00_sites (status);
create index if not exists site00_sites_project_id_idx on public.site00_sites (project_id);

create table if not exists public.site00_invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.site00_projects(id) on delete set null,
  identity_id uuid references public.site00_identities(id) on delete set null,
  invoice_number text not null unique,
  client_name text not null,
  client_email text,
  amount numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  status text not null default 'DRAFT',
  due_date date,
  paid_at timestamptz,
  line_items jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_invoices_status_idx on public.site00_invoices (status);

create table if not exists public.site00_admin_activity (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  entity_label text,
  actor_email text,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists site00_admin_activity_created_idx on public.site00_admin_activity (created_at desc);
create index if not exists site00_admin_activity_type_idx on public.site00_admin_activity (event_type);

create table if not exists public.site00_admin_notes (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  author_email text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.site00_identities enable row level security;
alter table public.site00_idnty_submissions enable row level security;
alter table public.site00_bldr_intakes enable row level security;
alter table public.site00_leads enable row level security;
alter table public.site00_discovery_bookings enable row level security;
alter table public.site00_sites enable row level security;
alter table public.site00_invoices enable row level security;
alter table public.site00_admin_activity enable row level security;
alter table public.site00_admin_notes enable row level security;
