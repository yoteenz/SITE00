-- JURNL Wave 5: user-scoped production persistence (snapshot + record metadata + idempotency).
-- Domain ownership stays in app/repository contract; this layer stores canonical user blobs.

create table if not exists public.jurnl_user_snapshots (
  user_id uuid primary key references auth.users (id) on delete cascade,
  schema_version integer not null default 5,
  snapshot jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists jurnl_user_snapshots_updated_at_idx on public.jurnl_user_snapshots (updated_at desc);

create table if not exists public.jurnl_record_files (
  file_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  record_id text not null,
  storage_path text not null,
  mime_type text,
  byte_size bigint,
  status text not null default 'PENDING' check (status in ('PENDING', 'READY', 'FAILED', 'ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jurnl_record_files_user_record_idx on public.jurnl_record_files (user_id, record_id);

create table if not exists public.jurnl_mutation_idempotency (
  user_id uuid not null references auth.users (id) on delete cascade,
  idempotency_key text not null,
  mutation_type text not null,
  entity_id text,
  created_at timestamptz not null default now(),
  primary key (user_id, idempotency_key)
);

alter table public.jurnl_user_snapshots enable row level security;
alter table public.jurnl_record_files enable row level security;
alter table public.jurnl_mutation_idempotency enable row level security;

-- Snapshots: owner only
create policy jurnl_user_snapshots_select_own on public.jurnl_user_snapshots
  for select using (auth.uid() = user_id);
create policy jurnl_user_snapshots_insert_own on public.jurnl_user_snapshots
  for insert with check (auth.uid() = user_id);
create policy jurnl_user_snapshots_update_own on public.jurnl_user_snapshots
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy jurnl_user_snapshots_delete_own on public.jurnl_user_snapshots
  for delete using (auth.uid() = user_id);

-- Record files: owner only
create policy jurnl_record_files_select_own on public.jurnl_record_files
  for select using (auth.uid() = user_id);
create policy jurnl_record_files_insert_own on public.jurnl_record_files
  for insert with check (auth.uid() = user_id);
create policy jurnl_record_files_update_own on public.jurnl_record_files
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy jurnl_record_files_delete_own on public.jurnl_record_files
  for delete using (auth.uid() = user_id);

-- Idempotency keys: owner only
create policy jurnl_idempotency_select_own on public.jurnl_mutation_idempotency
  for select using (auth.uid() = user_id);
create policy jurnl_idempotency_insert_own on public.jurnl_mutation_idempotency
  for insert with check (auth.uid() = user_id);

comment on table public.jurnl_user_snapshots is 'JURNL canonical repository snapshot per auth user (JSON matches RepositorySnapshot v5).';
comment on table public.jurnl_record_files is 'JURNL F16 record blob metadata; bytes live in private storage bucket (Wave 5).';
