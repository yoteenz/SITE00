-- SITE 00 EVOLVE primary service — intakes + project service line

alter table public.site00_projects
  add column if not exists service_line text;

create index if not exists site00_projects_service_line_idx on public.site00_projects (service_line);

create table if not exists public.site00_evolve_intakes (
  id uuid primary key default gen_random_uuid(),
  identity_id uuid references public.site00_identities(id) on delete set null,
  email text,
  evolve_path text not null,
  property_url text,
  property_type text,
  status text not null default 'IN_PROGRESS',
  assessment_status text not null default 'PENDING_ASSESSMENT',
  access_status text not null default 'NOT_CONNECTED',
  compatibility_status text not null default 'PENDING_REVIEW',
  answers jsonb not null default '{}'::jsonb,
  scope_assessment jsonb not null default '{}'::jsonb,
  requested_capabilities jsonb not null default '[]'::jsonb,
  provider_connections jsonb not null default '[]'::jsonb,
  risk_flags jsonb not null default '[]'::jsonb,
  project_id uuid references public.site00_projects(id) on delete set null,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_evolve_intakes_path_idx on public.site00_evolve_intakes (evolve_path);
create index if not exists site00_evolve_intakes_status_idx on public.site00_evolve_intakes (status);

alter table public.site00_evolve_intakes enable row level security;
