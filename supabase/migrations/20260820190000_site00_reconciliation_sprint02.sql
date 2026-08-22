-- SITE 00 Sprint 02 — Reconciliation, evidence lineage, project health, drift detection

alter table public.site00_organizations
  add column if not exists project_health text not null default 'ATTENTION_REQUIRED';

alter table public.site00_evidence_records
  add column if not exists repository text;

alter table public.site00_evidence_records
  add column if not exists source_identifier text;

alter table public.site00_evidence_records
  add column if not exists source_commit text;

alter table public.site00_evidence_records
  add column if not exists source_path text;

alter table public.site00_evidence_records
  add column if not exists confidence text not null default 'MEDIUM';

alter table public.site00_evidence_records
  add column if not exists observed_at timestamptz not null default now();

alter table public.site00_evidence_records
  add column if not exists validation_type text not null default 'REPOSITORY_SCAN';

alter table public.site00_reconciliation_records
  add column if not exists reasoning jsonb not null default '{}'::jsonb;

alter table public.site00_reconciliation_records
  add column if not exists launch_impact text;

alter table public.site00_launch_manifests
  add column if not exists is_provisional boolean not null default true;

alter table public.site00_launch_manifests
  add column if not exists master_roadmap_count int;

create table if not exists public.site00_drift_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.site00_organizations(id) on delete cascade,
  workstream_id uuid references public.site00_workstreams(id) on delete set null,
  requirement_id uuid references public.site00_manifest_requirements(id) on delete set null,
  previous_observed_state jsonb not null default '{}'::jsonb,
  new_observed_state jsonb not null default '{}'::jsonb,
  drift_type text not null,
  requires_reconciliation boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  detected_at timestamptz not null default now()
);

create index if not exists site00_drift_events_org_idx
  on public.site00_drift_events(organization_id, detected_at desc);

alter table public.site00_drift_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'site00_drift_events' and policyname = 'service_role_all'
  ) then
    create policy service_role_all on public.site00_drift_events
      for all to service_role using (true) with check (true);
  end if;
end $$;

insert into public.site00_external_systems (system_key, system_type, display_name, description)
values ('supabase_aio', 'SUPABASE_PROJECT', 'AIO Supabase', 'All In One Enterprises database project')
on conflict (system_key) do nothing;
