-- Marketing commercial pipeline state (entitlements, usage events, interrupted actions)

alter table public.site00_marketing_engagements
  add column if not exists commercial_state jsonb not null default '{}'::jsonb;

create index if not exists site00_marketing_engagements_commercial_gin
  on public.site00_marketing_engagements using gin (commercial_state);
