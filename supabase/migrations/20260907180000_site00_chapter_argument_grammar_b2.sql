-- Sprint B2 — Chapter Argument Grammar persistence (NDXBOOK chapters + grammars)

create table if not exists public.site00_creative_chapters (
  id uuid primary key default gen_random_uuid(),
  chapter_key text not null,
  project_id uuid not null references public.site00_managed_projects(id) on delete cascade,
  brand_id text not null,
  chapter_number int not null,
  chapter_title text not null,
  chapter_subtitle text,
  grammar_id uuid,
  entry_ids text[] not null default '{}'::text[],
  status text not null default 'DRAFT',
  canon_state text not null default 'DRAFT',
  founder_judgment text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site00_creative_chapters_status_check
    check (status in ('DRAFT', 'AWAITING_FOUNDER_JUDGMENT', 'LOCKED', 'SUPERSEDED', 'ARCHIVED')),
  constraint site00_creative_chapters_canon_state_check
    check (canon_state in ('DRAFT', 'PRODUCTION', 'CANON_CANDIDATE', 'CANON')),
  unique (project_id, brand_id, chapter_number),
  unique (project_id, brand_id, chapter_key)
);

create table if not exists public.site00_chapter_argument_grammars (
  id uuid primary key default gen_random_uuid(),
  grammar_key text not null,
  chapter_id uuid not null references public.site00_creative_chapters(id) on delete cascade,
  project_id uuid not null references public.site00_managed_projects(id) on delete cascade,
  brand_id text not null,
  chapter_number int not null,
  chapter_title text not null,
  chapter_subtitle text,
  status text not null default 'DRAFT',
  core_question text not null,
  argument_sequence jsonb not null default '[]'::jsonb,
  sequence_definitions jsonb not null default '[]'::jsonb,
  recurring_editorial_behavior text not null default '',
  interjection_behavior text not null default '',
  receipt_behavior text not null default '',
  synthesis_behavior text not null default '',
  allowed_variations jsonb not null default '[]'::jsonb,
  prohibited_repetition jsonb not null default '[]'::jsonb,
  artifact_rules jsonb not null default '[]'::jsonb,
  world_rules jsonb not null default '[]'::jsonb,
  format_translation_rules jsonb not null default '[]'::jsonb,
  entry_requirements jsonb not null default '[]'::jsonb,
  canon_state text not null default 'DRAFT',
  founder_judgment text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site00_chapter_argument_grammars_status_check
    check (status in ('DRAFT', 'AWAITING_FOUNDER_JUDGMENT', 'LOCKED', 'SUPERSEDED', 'ARCHIVED')),
  constraint site00_chapter_argument_grammars_canon_state_check
    check (canon_state in ('DRAFT', 'PRODUCTION', 'CANON_CANDIDATE', 'CANON')),
  unique (project_id, brand_id, grammar_key)
);

alter table public.site00_creative_chapters
  drop constraint if exists site00_creative_chapters_grammar_fk;

alter table public.site00_creative_chapters
  add constraint site00_creative_chapters_grammar_fk
  foreign key (grammar_id) references public.site00_chapter_argument_grammars(id) on delete set null;

alter table public.site00_creative_entries
  add column if not exists chapter_id text;

create index if not exists site00_creative_chapters_project_brand_idx
  on public.site00_creative_chapters (project_id, brand_id, chapter_number);

create index if not exists site00_chapter_argument_grammars_chapter_idx
  on public.site00_chapter_argument_grammars (chapter_id);

create index if not exists site00_creative_entries_chapter_idx
  on public.site00_creative_entries (chapter_id);

alter table public.site00_creative_chapters enable row level security;
alter table public.site00_chapter_argument_grammars enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'site00_creative_chapters' and policyname = 'service_role_all') then
    create policy service_role_all on public.site00_creative_chapters for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'site00_chapter_argument_grammars' and policyname = 'service_role_all') then
    create policy service_role_all on public.site00_chapter_argument_grammars for all to service_role using (true) with check (true);
  end if;
end $$;
