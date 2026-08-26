-- P0.R.1 — Astral World Reader accounts + canonical avatar library

create table if not exists public.site00_astral_avatars (
  avatar_id text primary key,
  project_id text not null default 'astral-world',
  presentation text not null check (presentation in ('feminine', 'masculine', 'androgynous')),
  display_label text not null,
  master_asset_slot text not null,
  portrait_asset_slot text not null,
  thumbnail_asset_slot text not null,
  approval_state text not null default 'PENDING_GENERATION',
  prompt_version text not null default 'v1',
  assigned_user_id uuid references auth.users(id),
  version integer not null default 1,
  pilot_batch boolean not null default false,
  generation_receipt jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_astral_reader_profiles (
  reader_id text primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null default '',
  introduction text not null default '',
  experience_notes text not null default '',
  specialties text[] not null default '{}',
  primary_destination text not null default 'tarot-suite',
  avatar_id text references public.site00_astral_avatars(avatar_id),
  custom_avatar_id text,
  custom_avatar_entitlement text not null default 'NOT_PURCHASED',
  presence text not null default 'OFFLINE',
  current_destination text,
  current_room_id text,
  onboarding_step text not null default 'WELCOME',
  onboarding_complete boolean not null default false,
  alert_preferences jsonb not null default '{}'::jsonb,
  rating numeric(3,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site00_astral_custom_avatar_generations (
  custom_avatar_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  reader_id text not null references public.site00_astral_reader_profiles(reader_id) on delete cascade,
  entitlement_state text not null default 'NOT_PURCHASED',
  generation_state text not null default 'GENERATED',
  reference_image_storage_path text,
  reference_image_is_private boolean not null default true,
  presentation_preferences text,
  prompt_version text not null default 'v1',
  model text,
  provider text,
  request_id text,
  candidate_asset_urls jsonb not null default '[]'::jsonb,
  selected_candidate_index integer,
  active_avatar_id text,
  regeneration_credits_remaining integer not null default 0,
  cost_metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_astral_reader_profiles_user on public.site00_astral_reader_profiles(user_id);
create index if not exists idx_astral_avatars_approval on public.site00_astral_avatars(approval_state);

alter table public.site00_astral_reader_profiles enable row level security;
alter table public.site00_astral_custom_avatar_generations enable row level security;

create policy "reader owns profile" on public.site00_astral_reader_profiles
  for all using (auth.uid() = user_id);

create policy "reader owns custom avatar" on public.site00_astral_custom_avatar_generations
  for all using (auth.uid() = user_id);

create policy "public read approved avatars" on public.site00_astral_avatars
  for select using (approval_state in ('APPROVED_LIBRARY_ASSET', 'ASSIGNED') or pilot_batch = true);
