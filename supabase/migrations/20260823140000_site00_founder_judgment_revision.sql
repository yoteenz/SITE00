-- SITE 00 — Founder creative judgment + surgical revision lineage.
-- Append-only judgment history; parent assets immutable; revision specs gated.

create table if not exists public.site00_founder_creative_judgments (
  id uuid primary key default gen_random_uuid(),
  judgment_id text not null unique,
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  asset_id text not null,
  brand_slug text not null,
  founder_action text not null,
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_founder_judgments_brand_asset_idx
  on public.site00_founder_creative_judgments (brand_slug, asset_id, updated_at desc);

create table if not exists public.site00_brand_asset_dispositions (
  id uuid primary key default gen_random_uuid(),
  disposition_id text not null unique,
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  asset_id text not null,
  brand_slug text not null,
  brand_disposition text not null,
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists site00_brand_dispositions_brand_asset_uidx
  on public.site00_brand_asset_dispositions (brand_slug, asset_id);

create table if not exists public.site00_creative_revision_specs (
  id uuid primary key default gen_random_uuid(),
  revision_id text not null unique,
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  parent_asset_id text not null,
  brand_slug text not null,
  status text not null default 'DRAFT',
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_revision_specs_parent_idx
  on public.site00_creative_revision_specs (brand_slug, parent_asset_id);

create table if not exists public.site00_creative_revision_branches (
  id uuid primary key default gen_random_uuid(),
  branch_id text not null unique,
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  root_asset_id text not null,
  brand_slug text not null,
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_founder_preference_evidence (
  id uuid primary key default gen_random_uuid(),
  evidence_id text not null unique,
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  brand_slug text not null,
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site00_founder_creative_judgments enable row level security;
alter table public.site00_brand_asset_dispositions enable row level security;
alter table public.site00_creative_revision_specs enable row level security;
alter table public.site00_creative_revision_branches enable row level security;
alter table public.site00_founder_preference_evidence enable row level security;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'site00_founder_creative_judgments',
    'site00_brand_asset_dispositions',
    'site00_creative_revision_specs',
    'site00_creative_revision_branches',
    'site00_founder_preference_evidence'
  ]
  loop
    if not exists (
      select 1 from pg_policies where tablename = tbl and policyname = 'service_role_all'
    ) then
      execute format(
        'create policy service_role_all on public.%I for all to service_role using (true) with check (true)',
        tbl
      );
    end if;
  end loop;
end $$;
