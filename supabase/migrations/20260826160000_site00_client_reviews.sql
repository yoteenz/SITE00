-- P0.CLIENT.2 — Client Reviews durable persistence

create table if not exists public.site00_client_review_objects (
  id text primary key,
  project_id uuid references public.site00_projects(id) on delete cascade,
  project_slug text not null,
  phase_id text not null,
  phase_label text not null,
  object_type text not null,
  title text not null,
  subtitle text not null default '',
  internal_status text not null default 'CLIENT_REVIEW_READY',
  client_status text not null default 'READY_FOR_REVIEW',
  current_version_id text not null,
  client_visible boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  ready_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_client_review_versions (
  id text primary key,
  review_id text not null references public.site00_client_review_objects(id) on delete cascade,
  label text not null,
  client_summary text not null default '',
  preview_asset_url text,
  preview_asset_alt text not null default '',
  available_viewports jsonb not null default '[]'::jsonb,
  is_current boolean not null default false,
  is_approved boolean not null default false,
  is_superseded boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_client_review_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.site00_projects(id) on delete cascade,
  review_id text not null references public.site00_client_review_objects(id) on delete cascade,
  version_id text not null,
  viewport text,
  author_user_id uuid,
  author_role text not null,
  body text not null,
  annotation_id uuid,
  parent_comment_id uuid references public.site00_client_review_comments(id) on delete set null,
  visibility text not null default 'CLIENT_AND_SITE00',
  status text not null default 'OPEN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.site00_client_review_annotations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.site00_projects(id) on delete cascade,
  review_id text not null references public.site00_client_review_objects(id) on delete cascade,
  version_id text not null,
  viewport text not null,
  x_percent numeric(6,3) not null,
  y_percent numeric(6,3) not null,
  width_percent numeric(6,3),
  height_percent numeric(6,3),
  marker_index int not null default 1,
  comment_id uuid references public.site00_client_review_comments(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.site00_client_review_receipts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.site00_projects(id) on delete cascade,
  review_id text not null references public.site00_client_review_objects(id) on delete cascade,
  version_id text not null,
  actor_user_id uuid not null,
  actor_role text not null,
  decision_type text not null,
  request_id text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (review_id, decision_type, request_id)
);

create index if not exists idx_site00_client_reviews_project_slug on public.site00_client_review_objects(project_slug);
create index if not exists idx_site00_client_review_comments_review on public.site00_client_review_comments(review_id);
create index if not exists idx_site00_client_review_annotations_review on public.site00_client_review_annotations(review_id);

alter table public.site00_client_review_objects enable row level security;
alter table public.site00_client_review_versions enable row level security;
alter table public.site00_client_review_comments enable row level security;
alter table public.site00_client_review_annotations enable row level security;
alter table public.site00_client_review_receipts enable row level security;

create policy if not exists site00_client_reviews_service_role on public.site00_client_review_objects for all using (true) with check (true);
create policy if not exists site00_client_review_versions_service_role on public.site00_client_review_versions for all using (true) with check (true);
create policy if not exists site00_client_review_comments_service_role on public.site00_client_review_comments for all using (true) with check (true);
create policy if not exists site00_client_review_annotations_service_role on public.site00_client_review_annotations for all using (true) with check (true);
create policy if not exists site00_client_review_receipts_service_role on public.site00_client_review_receipts for all using (true) with check (true);
