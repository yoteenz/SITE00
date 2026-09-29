-- Identity intake commercial spine (authorization + bootstrap metadata)
alter table public.site00_idnty_submissions
  add column if not exists commercial_state jsonb not null default '{}'::jsonb;

create index if not exists site00_idnty_submissions_commercial_state_idx
  on public.site00_idnty_submissions using gin (commercial_state);
