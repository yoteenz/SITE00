-- SITE 00 — Digital Foundation project messaging (durable when persistence v2 is enabled)

create table if not exists public.site00_df_project_messages (
  message_id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references public.site00_df_artifacts(artifact_id) on delete cascade,
  author_role text not null check (author_role in ('CLIENT', 'FOUNDER')),
  body text not null,
  delivery_state text not null default 'DELIVERED' check (delivery_state in ('DELIVERED', 'FAILED')),
  read_by_client_at timestamptz,
  read_by_founder_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists site00_df_project_messages_artifact_idx
  on public.site00_df_project_messages (artifact_id, created_at);
