-- P0.CLIENT.2A — Client Reviews production persistence hardening

alter table public.site00_client_review_objects
  add column if not exists is_preview_fixture boolean not null default false;

alter table public.site00_client_review_annotations
  add column if not exists created_by_user_id uuid;

create table if not exists public.site00_client_review_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.site00_projects(id) on delete cascade,
  review_id text not null references public.site00_client_review_objects(id) on delete cascade,
  event_type text not null,
  actor_user_id uuid,
  actor_role text,
  payload jsonb not null default '{}'::jsonb,
  client_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_site00_client_review_events_review
  on public.site00_client_review_events(review_id);

create index if not exists idx_site00_client_review_events_project
  on public.site00_client_review_events(project_id);

create index if not exists idx_site00_client_review_receipts_request
  on public.site00_client_review_receipts(review_id, decision_type, request_id);

alter table public.site00_client_review_events enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'site00_client_review_objects',
    'site00_client_review_versions',
    'site00_client_review_comments',
    'site00_client_review_annotations',
    'site00_client_review_receipts',
    'site00_client_review_events'
  ]
  loop
    if not exists (
      select 1 from pg_policies where tablename = t and policyname = 'service_role_all'
    ) then
      execute format(
        'create policy service_role_all on public.%I for all to service_role using (true) with check (true)',
        t
      );
    end if;
  end loop;
end $$;
