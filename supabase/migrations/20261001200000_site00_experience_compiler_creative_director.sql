-- Studio OS Experience Compiler — CGPT Creative Director durable persistence

create table if not exists public.site00_ec_creative_threads (
  thread_id text primary key,
  project_id text not null,
  project_slug text not null,
  title text not null,
  task_mode text not null,
  run_status text not null default 'READY',
  active_artifact_id text,
  last_context_pack_id text,
  downstream_readiness jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_site00_ec_creative_threads_project on public.site00_ec_creative_threads(project_id);

create table if not exists public.site00_ec_creative_messages (
  message_id text primary key,
  thread_id text not null references public.site00_ec_creative_threads(thread_id) on delete cascade,
  role text not null,
  text text not null,
  run_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_site00_ec_creative_messages_thread on public.site00_ec_creative_messages(thread_id);

create table if not exists public.site00_ec_creative_artifacts (
  artifact_id text primary key,
  thread_id text not null references public.site00_ec_creative_threads(thread_id) on delete cascade,
  project_id text not null,
  task_mode text not null,
  context_pack_id text not null,
  model text not null,
  reasoning_effort text,
  parent_artifact_ids jsonb not null default '[]'::jsonb,
  founder_judgment_ids jsonb not null default '[]'::jsonb,
  approval_state text not null,
  superseded_by text,
  payload jsonb not null default '{}'::jsonb,
  run_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_site00_ec_creative_artifacts_thread on public.site00_ec_creative_artifacts(thread_id);

create table if not exists public.site00_ec_founder_judgments (
  judgment_id text primary key,
  thread_id text not null references public.site00_ec_creative_threads(thread_id) on delete cascade,
  artifact_id text not null,
  project_id text not null,
  action text not null,
  founder_note text not null,
  preserve jsonb not null default '[]'::jsonb,
  reject jsonb not null default '[]'::jsonb,
  combine_with text,
  requested_change text not null,
  quarantined boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_site00_ec_founder_judgments_thread on public.site00_ec_founder_judgments(thread_id);

create table if not exists public.site00_ec_creative_runs (
  run_id text primary key,
  thread_id text not null references public.site00_ec_creative_threads(thread_id) on delete cascade,
  project_id text not null,
  task_mode text not null,
  context_pack_id text not null,
  model text not null,
  reasoning_effort text,
  status text not null,
  started_at timestamptz not null,
  finished_at timestamptz,
  input_tokens integer,
  output_tokens integer,
  run_count_for_thread integer not null default 1,
  artifact_id text,
  validation_error text,
  raw_response_storage_key text,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_ec_creative_context_packs (
  context_pack_id text primary key,
  thread_id text not null references public.site00_ec_creative_threads(thread_id) on delete cascade,
  project_id text not null,
  manifest jsonb not null default '[]'::jsonb,
  manifest_hash text not null,
  compiled_at timestamptz not null,
  locked_decisions jsonb not null default '[]'::jsonb,
  rejected_directions jsonb not null default '[]'::jsonb,
  full_context jsonb
);

create table if not exists public.site00_ec_creative_raw_responses (
  storage_key text primary key,
  run_id text,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.site00_ec_creative_threads enable row level security;
alter table public.site00_ec_creative_messages enable row level security;
alter table public.site00_ec_creative_artifacts enable row level security;
alter table public.site00_ec_founder_judgments enable row level security;
alter table public.site00_ec_creative_runs enable row level security;
alter table public.site00_ec_creative_context_packs enable row level security;
alter table public.site00_ec_creative_raw_responses enable row level security;
