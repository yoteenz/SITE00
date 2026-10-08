-- Digital Foundation — checkout correlation, readiness clock, operations bundle persistence

alter table public.site00_df_artifacts
  add column if not exists readiness_satisfied_at timestamptz,
  add column if not exists production_started_at timestamptz,
  add column if not exists readiness_snapshot jsonb not null default '{}'::jsonb;

create table if not exists public.site00_df_checkout_sessions (
  session_id text primary key,
  artifact_id uuid not null references public.site00_df_artifacts(artifact_id) on delete cascade,
  quote_id uuid not null,
  quote_version integer not null,
  status text not null default 'OPEN',
  created_at timestamptz not null default now()
);

create index if not exists site00_df_checkout_sessions_artifact_idx
  on public.site00_df_checkout_sessions (artifact_id);

create table if not exists public.site00_df_operations_bundle (
  artifact_id uuid primary key references public.site00_df_artifacts(artifact_id) on delete cascade,
  bundle jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site00_df_quotes
  add column if not exists founder_commercial_ready boolean not null default false,
  add column if not exists founder_commercial_ready_at timestamptz;

alter table public.site00_df_checkout_sessions enable row level security;
alter table public.site00_df_operations_bundle enable row level security;
