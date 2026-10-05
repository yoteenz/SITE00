-- SITE 00 — World-class client guest intake foundation (invite + session + snapshots)
-- Brand-agnostic; no tarot/world hardcoding. World Formation pipeline NOT implemented here.

create table if not exists public.site00_intake_invites (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  project_id uuid references public.site00_projects(id) on delete cascade,
  org_id uuid,
  project_slug text not null,
  project_display_name text not null,
  intake_type text not null default 'WORLD_DISCOVERY' check (intake_type in ('WORLD_DISCOVERY')),
  project_experience_class text not null default 'UNRESOLVED' check (
    project_experience_class in ('SITE', 'APPLICATION', 'IMMERSIVE_SITE', 'WORLD', 'UNRESOLVED')
  ),
  status text not null default 'CREATED' check (
    status in ('CREATED', 'ACTIVE', 'STARTED', 'COMPLETED', 'EXPIRED', 'REVOKED')
  ),
  created_by text,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  revoked_at timestamptz,
  last_saved_at timestamptz,
  recipient_label text not null,
  recipient_email text,
  allowed_sections jsonb not null default '[]'::jsonb,
  intelligence_snapshot_version int not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  claimable_by_email text,
  claimed_by_user_id uuid references auth.users(id) on delete set null,
  claimed_at timestamptz
);

create index if not exists site00_intake_invites_token_hash_idx on public.site00_intake_invites (token_hash);
create index if not exists site00_intake_invites_project_slug_idx on public.site00_intake_invites (project_slug);
create index if not exists site00_intake_invites_status_idx on public.site00_intake_invites (status);

create table if not exists public.site00_guest_intake_sessions (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.site00_intake_invites(id) on delete cascade,
  project_id uuid references public.site00_projects(id) on delete set null,
  started_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  current_section text,
  current_step text,
  completion_percentage int not null default 0,
  completed_sections jsonb not null default '[]'::jsonb,
  raw_answers jsonb not null default '{}'::jsonb,
  draft_state jsonb not null default '{}'::jsonb,
  synthesized jsonb not null default '{}'::jsonb,
  client_device_metadata jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  version int not null default 1
);

create unique index if not exists site00_guest_intake_sessions_invite_unique on public.site00_guest_intake_sessions (invite_id);

create table if not exists public.site00_world_intelligence_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_id text not null unique,
  project_id uuid references public.site00_projects(id) on delete set null,
  invite_id uuid references public.site00_intake_invites(id) on delete set null,
  session_id uuid references public.site00_guest_intake_sessions(id) on delete set null,
  profile_versions jsonb not null default '{}'::jsonb,
  business_intelligence_version int not null default 1,
  brand_lore_fingerprint text,
  personality_fingerprint text,
  creative_appetite_version text,
  world_readiness_version int not null default 1,
  offering_map_version int not null default 1,
  readiness_state text not null default 'WORLD_INTAKE_INCOMPLETE',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.site00_intake_invites enable row level security;
alter table public.site00_guest_intake_sessions enable row level security;
alter table public.site00_world_intelligence_snapshots enable row level security;
