-- Marketing deliverable vault links (Studio World → SITE 00 Vault references)

create table if not exists public.site00_marketing_deliverable_links (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.site00_marketing_engagements(id) on delete cascade,
  studio_world_deliverable_id text not null,
  title text not null,
  format text,
  aspect_ratio text,
  version text,
  preview_url text,
  download_url text,
  vault_status text not null default 'LINKED',
  provenance jsonb not null default '{}'::jsonb,
  linked_at timestamptz not null default now(),
  unique (engagement_id, studio_world_deliverable_id)
);

create index if not exists site00_marketing_deliverable_links_engagement_idx
  on public.site00_marketing_deliverable_links (engagement_id);

alter table public.site00_marketing_deliverable_links enable row level security;
