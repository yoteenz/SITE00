-- SITE 00 — NDXBOOK creative asset lineage, concept, franchise, and canon infrastructure.
-- Append-only normalization target; does NOT replace methodology_validation_runs JSONB history.

create table if not exists public.site00_creative_asset_records (
  id uuid primary key default gen_random_uuid(),
  asset_id text not null unique,
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  project_id text,
  brand_slug text not null,
  asset_type text not null,
  source_type text not null,
  creative_stage text not null,
  direction_id text,
  direction_name text,
  world_id text,
  topic_id text,
  content_franchise_id text,
  carousel_id text,
  production_state text not null default 'EXPERIMENTAL',
  reuse_state text not null default 'ORIGINAL_USE_ONLY',
  canon_status text not null default 'NON_CANON',
  review_state text not null default 'UNREVIEWED',
  parent_asset_id text,
  creative_family_id text,
  brand_canon_version_at_generation integer not null default 0,
  content_canon_version_at_generation integer not null default 0,
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_creative_asset_org_idx
  on public.site00_creative_asset_records (organization_id, brand_slug, created_at desc);
create index if not exists site00_creative_asset_direction_idx
  on public.site00_creative_asset_records (brand_slug, direction_id);
create index if not exists site00_creative_asset_world_idx
  on public.site00_creative_asset_records (brand_slug, world_id);
create index if not exists site00_creative_asset_topic_idx
  on public.site00_creative_asset_records (brand_slug, topic_id);
create index if not exists site00_creative_asset_franchise_idx
  on public.site00_creative_asset_records (content_franchise_id);
create index if not exists site00_creative_asset_production_idx
  on public.site00_creative_asset_records (brand_slug, production_state);
create index if not exists site00_creative_asset_reuse_idx
  on public.site00_creative_asset_records (brand_slug, reuse_state);
create index if not exists site00_creative_asset_canon_idx
  on public.site00_creative_asset_records (brand_slug, canon_status);
create index if not exists site00_creative_asset_family_idx
  on public.site00_creative_asset_records (creative_family_id);

create table if not exists public.site00_creative_concept_records (
  id uuid primary key default gen_random_uuid(),
  concept_id text not null unique,
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  brand_slug text not null,
  origin_direction_id text not null,
  origin_direction_name text not null,
  origin_world_id text,
  concept_type text not null,
  reuse_assessment text not null default 'WORLD_SPECIFIC',
  canon_status text not null default 'NON_CANON',
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_creative_concept_brand_idx
  on public.site00_creative_concept_records (brand_slug, concept_type);
create index if not exists site00_creative_concept_direction_idx
  on public.site00_creative_concept_records (brand_slug, origin_direction_id);

create table if not exists public.site00_content_franchise_records (
  id uuid primary key default gen_random_uuid(),
  franchise_id text not null unique,
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  brand_slug text not null,
  origin_direction_id text not null,
  origin_world_id text,
  status text not null default 'PROPOSED',
  translation_policy text not null default 'TRANSLATE_TO_WINNING_WORLD',
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_content_franchise_brand_idx
  on public.site00_content_franchise_records (brand_slug, status);

create table if not exists public.site00_editorial_idea_records (
  id uuid primary key default gen_random_uuid(),
  idea_id text not null unique,
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  brand_slug text not null,
  origin_direction_id text not null,
  origin_world_id text,
  idea_type text not null,
  status text not null default 'RAW',
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_editorial_idea_brand_idx
  on public.site00_editorial_idea_records (brand_slug, status);

create table if not exists public.site00_creative_families (
  id uuid primary key default gen_random_uuid(),
  family_id text not null unique,
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  brand_slug text not null,
  topic_id text not null,
  direction_id text not null,
  world_id text,
  name text not null,
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_creative_families_topic_direction_idx
  on public.site00_creative_families (brand_slug, topic_id, direction_id);

create table if not exists public.site00_brand_canon_traits (
  id uuid primary key default gen_random_uuid(),
  trait_id text not null unique,
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  brand_slug text not null,
  trait_type text not null,
  source_direction_id text not null,
  source_world_id text,
  founder_approved boolean not null default false,
  status text not null default 'PROPOSED',
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_brand_canon_traits_brand_idx
  on public.site00_brand_canon_traits (brand_slug, trait_type, status);

create table if not exists public.site00_brand_canon_state (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  brand_slug text not null unique,
  brand_canon_version integer not null default 0,
  content_canon_version integer not null default 0,
  governing_world_id text,
  winning_direction_id text,
  winning_direction_name text,
  record jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_winning_world_promotion_plans (
  id uuid primary key default gen_random_uuid(),
  plan_id text not null unique,
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  brand_slug text not null,
  winning_direction_id text not null,
  winning_world_id text not null,
  founder_decision_id text,
  status text not null default 'DRAFT',
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_launch_seed_sets (
  id uuid primary key default gen_random_uuid(),
  launch_seed_set_id text not null unique,
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  brand_slug text not null,
  winning_direction_id text,
  status text not null default 'DRAFT',
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_launch_seed_sets_brand_idx
  on public.site00_launch_seed_sets (brand_slug, status);

alter table public.site00_creative_asset_records enable row level security;
alter table public.site00_creative_concept_records enable row level security;
alter table public.site00_content_franchise_records enable row level security;
alter table public.site00_editorial_idea_records enable row level security;
alter table public.site00_creative_families enable row level security;
alter table public.site00_brand_canon_traits enable row level security;
alter table public.site00_brand_canon_state enable row level security;
alter table public.site00_winning_world_promotion_plans enable row level security;
alter table public.site00_launch_seed_sets enable row level security;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'site00_creative_asset_records',
    'site00_creative_concept_records',
    'site00_content_franchise_records',
    'site00_editorial_idea_records',
    'site00_creative_families',
    'site00_brand_canon_traits',
    'site00_brand_canon_state',
    'site00_winning_world_promotion_plans',
    'site00_launch_seed_sets'
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
