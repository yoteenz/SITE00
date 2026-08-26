-- P0.PAF.2 — Frontal Slayer product visual asset canon (shared Supabase)
-- Studio World writes; Frontal Slayer website reads ACTIVE approved bindings.

create table if not exists public.fs_product_master_heroes (
  id text primary key,
  product_id text not null,
  source_asset_id text,
  storage_path text not null,
  public_url text not null,
  hero_type text not null default 'PRODUCT',
  background_mode text not null default 'KEEP_ORIGINAL',
  width int not null default 1024,
  height int not null default 1280,
  aspect_ratio numeric not null default 0.8,
  locked_attributes jsonb not null default '{}',
  allowed_variation_axes jsonb not null default '[]',
  status text not null default 'DRAFT',
  canon_status text not null default 'DRAFT',
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  supersedes_id text references public.fs_product_master_heroes(id) on delete set null
);

create index if not exists fs_product_master_heroes_product_idx
  on public.fs_product_master_heroes (product_id, status);

create table if not exists public.fs_product_visual_assets (
  id text primary key,
  product_id text not null,
  master_hero_id text not null references public.fs_product_master_heroes(id) on delete restrict,
  batch_id text,
  variant_key text not null,
  surface text,
  role text not null default 'VARIANT',
  color_id text,
  style_id text,
  texture_id text,
  length text,
  part text,
  finish text,
  storage_path text not null,
  public_url text not null,
  delivery_url text,
  thumbnail_url text,
  width int not null default 1024,
  height int not null default 1280,
  aspect_ratio numeric not null default 0.8,
  background_mode text not null default 'KEEP_ORIGINAL',
  has_alpha boolean not null default false,
  provider text,
  model text,
  prompt_version int,
  qa_status text not null default 'PENDING',
  status text not null default 'GENERATED',
  canon_status text not null default 'GENERATED',
  parent_asset_id text,
  supersedes_id text references public.fs_product_visual_assets(id) on delete set null,
  contract_version text not null default 'v1',
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create index if not exists fs_product_visual_assets_product_idx
  on public.fs_product_visual_assets (product_id, canon_status);
create index if not exists fs_product_visual_assets_variant_key_idx
  on public.fs_product_visual_assets (variant_key);

create table if not exists public.fs_product_asset_bindings (
  id text primary key,
  surface text not null,
  product_id text not null,
  slot_id text not null,
  variant_key text not null,
  asset_id text not null references public.fs_product_visual_assets(id) on delete restrict,
  binding_state text not null default 'PREVIEW',
  is_active boolean not null default true,
  priority int not null default 0,
  superseded_by_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists fs_product_asset_bindings_active_unique
  on public.fs_product_asset_bindings (surface, product_id, slot_id, variant_key)
  where (binding_state = 'ACTIVE' and is_active = true);

create table if not exists public.fs_build_a_wig_visual_variants (
  id text primary key,
  master_hero_id text not null references public.fs_product_master_heroes(id) on delete restrict,
  variant_key text not null unique,
  configuration_json jsonb not null default '{}',
  asset_id text not null references public.fs_product_visual_assets(id) on delete restrict,
  status text not null default 'PREVIEW',
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: public read for approved delivery assets; writes service-role only
alter table public.fs_product_master_heroes enable row level security;
alter table public.fs_product_visual_assets enable row level security;
alter table public.fs_product_asset_bindings enable row level security;
alter table public.fs_build_a_wig_visual_variants enable row level security;

create policy if not exists fs_product_visual_assets_public_read
  on public.fs_product_visual_assets for select
  using (canon_status = 'CANON' and status = 'APPROVED');

create policy if not exists fs_product_asset_bindings_public_read
  on public.fs_product_asset_bindings for select
  using (binding_state = 'ACTIVE' and is_active = true);

create policy if not exists fs_build_a_wig_variants_public_read
  on public.fs_build_a_wig_visual_variants for select
  using (is_active = true and status = 'ACTIVE');

create policy if not exists fs_product_master_heroes_public_read
  on public.fs_product_master_heroes for select
  using (canon_status = 'CANON' or status = 'ACTIVE_CANONICAL');

comment on table public.fs_product_visual_assets is 'Frontal Slayer product visual canon — separate from commerce SKUs (P0.PAF.2)';
