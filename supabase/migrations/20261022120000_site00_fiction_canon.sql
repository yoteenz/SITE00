-- THE EXCHANGE / serialized fiction canon (project-scoped)

create table if not exists public.site00_fiction_properties (
  id uuid primary key,
  slug text not null unique,
  display_name text not null,
  property_type text not null default 'SERIALIZED_FICTION',
  ownership text not null default 'FOUNDER_CONTROLLED',
  production_integration text not null default 'FUTURE_NDXBOOK_REUSE',
  metadata jsonb not null default '{}'::jsonb,
  registered_at timestamptz not null default now()
);

create table if not exists public.site00_fiction_canon_documents (
  id text primary key,
  property_id uuid not null references public.site00_fiction_properties(id) on delete cascade,
  property_slug text not null,
  document_type text not null,
  stable_identifier text not null,
  version integer not null,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  source_provenance jsonb not null default '{}'::jsonb,
  canon_status text not null,
  approval_status text not null,
  superseded_by_document_id text null,
  supersedes_document_id text null,
  character_references jsonb not null default '[]'::jsonb,
  world_references jsonb not null default '[]'::jsonb,
  source_text_original text null,
  content_hash text not null,
  knowledge_layer text not null default 'UNSPECIFIED',
  visual_reference_status text null,
  schema_version text not null default '1.0.0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site00_fiction_canon_documents_property_idx
  on public.site00_fiction_canon_documents (property_id, document_type);

create index if not exists site00_fiction_canon_documents_stable_idx
  on public.site00_fiction_canon_documents (property_id, stable_identifier, version desc);

create table if not exists public.site00_fiction_evaluations (
  id text primary key,
  property_id uuid not null references public.site00_fiction_properties(id) on delete cascade,
  property_slug text not null,
  bible_version_fingerprint text not null,
  model_requested text not null,
  model_resolved text not null,
  dry_run boolean not null default true,
  executed boolean not null default false,
  status text not null,
  context_assembly jsonb not null default '{}'::jsonb,
  output jsonb null,
  recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.site00_fiction_properties enable row level security;
alter table public.site00_fiction_canon_documents enable row level security;
alter table public.site00_fiction_evaluations enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'site00_fiction_properties' and policyname = 'service_role_all') then
    create policy service_role_all on public.site00_fiction_properties for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'site00_fiction_canon_documents' and policyname = 'service_role_all') then
    create policy service_role_all on public.site00_fiction_canon_documents for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'site00_fiction_evaluations' and policyname = 'service_role_all') then
    create policy service_role_all on public.site00_fiction_evaluations for all to service_role using (true) with check (true);
  end if;
end $$;
