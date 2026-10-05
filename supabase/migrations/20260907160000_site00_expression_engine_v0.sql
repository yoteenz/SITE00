-- Expression Engine V0 — creative entries + generation receipts (Sprint B)

create table if not exists public.site00_creative_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_managed_projects(id) on delete cascade,
  brand_id text not null,
  entry_number int not null,
  title text not null,
  subject text not null,
  objective_id text,
  territory_id text,
  world_expression_id text,
  status text not null default 'DRAFT',
  canon_state text not null default 'DRAFT',
  format_expressions jsonb not null default '[]'::jsonb,
  production_plan jsonb,
  audio_plan jsonb,
  continuity_graph jsonb,
  platform_translations jsonb not null default '[]'::jsonb,
  artifact jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site00_creative_entries_status_check
    check (status in ('DRAFT', 'IN_PRODUCTION', 'QA_BLOCKED', 'READY_FOR_JUDGMENT', 'COMPLETE', 'ARCHIVED')),
  constraint site00_creative_entries_canon_state_check
    check (canon_state in ('DRAFT', 'PRODUCTION', 'CANON_CANDIDATE', 'CANON')),
  unique (project_id, brand_id, entry_number)
);

create index if not exists site00_creative_entries_project_brand_idx
  on public.site00_creative_entries (project_id, brand_id, entry_number);

create table if not exists public.site00_expression_generation_receipts (
  id uuid primary key default gen_random_uuid(),
  creative_entry_id uuid not null references public.site00_creative_entries(id) on delete cascade,
  project_id uuid not null references public.site00_managed_projects(id) on delete cascade,
  brand_id text not null,
  format text not null,
  asset_id text not null,
  territory_id text,
  world_id text,
  parent_asset_id text,
  provider text not null,
  model text not null,
  prompt_lineage jsonb not null default '[]'::jsonb,
  reference_lineage jsonb not null default '[]'::jsonb,
  status text not null default 'REGISTERED',
  judgment_state text not null default 'UNREVIEWED',
  canon_state text not null default 'NON_CANON',
  tracking_state text not null default 'TRACKED',
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint site00_expression_generation_receipts_status_check
    check (status in ('REGISTERED', 'QA_PASS', 'QA_FAIL', 'ORPHAN')),
  constraint site00_expression_generation_receipts_tracking_check
    check (tracking_state in ('TRACKED', 'LEGACY_UNTRACKED'))
);

create index if not exists site00_expression_generation_receipts_entry_idx
  on public.site00_expression_generation_receipts (creative_entry_id, format);

-- RLS
alter table public.site00_creative_entries enable row level security;
alter table public.site00_expression_generation_receipts enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'site00_creative_entries' and policyname = 'service_role_all') then
    create policy service_role_all on public.site00_creative_entries for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'site00_expression_generation_receipts' and policyname = 'service_role_all') then
    create policy service_role_all on public.site00_expression_generation_receipts for all to service_role using (true) with check (true);
  end if;
end $$;
