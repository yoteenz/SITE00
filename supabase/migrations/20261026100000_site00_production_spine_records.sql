-- SITE 00 production record spine: durable records for Studio World / Director Composer production
-- (P0.SITE00.STUDIOWORLD.PRODUCTION-LIVE-PERSISTENCE-SECURITY-AND-FIRST-SHOT-READINESS.V1).
--
-- Replaces the pilot repository-JSON store as the durable backend of shared/site00-production-spine (RecordStore).
-- Each record keeps its full typed body in `record`; the columns the database must enforce are generated from it, so
-- the application and the database can never disagree about a value.
--
--   logical record                  physical object
--   PRODUCTION_PROJECTS             site00_managed_projects (existing registry; THE EXCHANGE row added below)
--   (shot setup, budget)            site00_spine_shots, site00_spine_budgets
--   PRODUCTION_JOBS                 site00_spine_jobs
--   PRODUCTION_PROVIDER_OPERATIONS  site00_spine_provider_operations (one row per dispatch attempt, kept by trigger)
--   PRODUCTION_COST_RECORDS         site00_spine_cost_records (view: quoted vs actual per attempt)
--   PRODUCTION_TAKES                site00_spine_takes
--   PRODUCTION_EDIT_SELECTIONS      site00_spine_edit_selections (view over takes; one selection per shot by index)
--   PRODUCTION_ASSETS               site00_spine_assets
--   PRODUCTION_APPROVAL_EVENTS      site00_spine_approval_events (append-only)
--   (continuity frames)             site00_spine_continuity_refs
--   (project roles)                 site00_spine_members
--
-- The existing site00_production_jobs (website build deliverables) and site00_generation_jobs (ASSTS asset factory)
-- belong to other domains and are not reused.
--
-- Security: RLS on every table. service_role (the API server) reads and writes. A signed-in user may read the rows
-- of a project they are a member of; nobody but service_role writes. Every function is service_role only.
--
-- Additive and idempotent. Drops nothing. Applying it to production is a founder-controlled deployment step.

create extension if not exists pgcrypto;

-- ── project ─────────────────────────────────────────────────────────────────────────────────────────────
insert into public.site00_managed_projects (
  project_key, display_name, design_authority, source_repo, source_project_key,
  project_type, runtime_mode, design_enabled, marketing_enabled, metadata
) values (
  'the-exchange', 'THE EXCHANGE', 'SITE00', null, null, 'SERIALIZED_FICTION', 'SITE00_MANAGED', false, false,
  jsonb_build_object(
    'productionSpine', true,
    'castAuthority', 'PROJECT_LOCAL',
    'globalActorCatalogue', 'NOT_IMPORTED',
    'canon', jsonb_build_array(
      'THE_EXCHANGE/SEASON_1/SEASON1_86_RELEASE_MASTER_V1.json',
      'THE_EXCHANGE/SEASON_1/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json',
      'THE_EXCHANGE/SEASON_1/CAST_REGISTRY_V1.json'
    )
  )
) on conflict (project_key) do nothing;

-- ── members (project roles) ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.site00_spine_members (
  project_key text not null references public.site00_managed_projects(project_key) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('FOUNDER', 'PRODUCTION_ADMIN', 'AUTHORIZED_EDITOR', 'REVIEWER', 'READ_ONLY')),
  granted_by text not null,
  granted_at timestamptz not null default now(),
  primary key (project_key, user_id)
);

-- ── records ─────────────────────────────────────────────────────────────────────────────────────────────
-- Common shape: (project_key, id) primary key; revision mirrors record.revision; record.id / projectId / kind must
-- match the row. Typed columns are generated from the record.

create table if not exists public.site00_spine_budgets (
  project_key text not null references public.site00_managed_projects(project_key) on delete restrict,
  id text not null,
  revision integer not null check (revision >= 1),
  record jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text generated always as (record->>'status') stored,
  authorized_credits integer generated always as ((record->>'authorizedCredits')::integer) stored,
  approval_id text generated always as (record->>'approvalId') stored,
  fixture boolean generated always as (coalesce(record->>'fixture', '') = 'TEST_FIXTURE') stored,
  primary key (project_key, id),
  constraint site00_spine_budgets_identity check (record->>'kind' = 'BUDGET' and record->>'id' = id and record->>'projectId' = project_key and (record->>'revision')::integer = revision),
  constraint site00_spine_budgets_status check (status in ('PLANNING_ESTIMATE_ONLY', 'AUTHORIZED', 'CLOSED')),
  constraint site00_spine_budgets_authorized check (status <> 'AUTHORIZED' or approval_id is not null)
);

create table if not exists public.site00_spine_shots (
  project_key text not null references public.site00_managed_projects(project_key) on delete restrict,
  id text not null,
  revision integer not null check (revision >= 1),
  record jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  release_id text generated always as (record->>'releaseId') stored,
  scene_id text generated always as (record->>'sceneId') stored,
  budget_id text generated always as (record->>'budgetId') stored,
  generation text generated always as (record->>'generation') stored,
  fixture boolean generated always as (coalesce(record->>'fixture', '') = 'TEST_FIXTURE') stored,
  primary key (project_key, id),
  constraint site00_spine_shots_identity check (record->>'kind' = 'SHOT' and record->>'id' = id and record->>'projectId' = project_key and (record->>'revision')::integer = revision),
  constraint site00_spine_shots_budget_fk foreign key (project_key, budget_id) references public.site00_spine_budgets(project_key, id)
);

create table if not exists public.site00_spine_approval_events (
  project_key text not null references public.site00_managed_projects(project_key) on delete restrict,
  id text not null,
  revision integer not null check (revision = 1),
  record jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approval_kind text generated always as (record->>'approvalKind') stored,
  subject_kind text generated always as (record->'subject'->>'kind') stored,
  subject_id text generated always as (record->'subject'->>'id') stored,
  decision text generated always as (record->>'decision') stored,
  actor text generated always as (record->>'actor') stored,
  actor_role text generated always as (record->>'actorRole') stored,
  decided_at text generated always as (record->>'at') stored,
  previous_state text generated always as (record->>'previousState') stored,
  new_state text generated always as (record->>'newState') stored,
  source_version text generated always as (record->>'sourceVersion') stored,
  input_hash text generated always as (record->>'inputHash') stored,
  fixture boolean generated always as (coalesce(record->>'fixture', '') = 'TEST_FIXTURE') stored,
  primary key (project_key, id),
  constraint site00_spine_approval_events_identity check (record->>'kind' = 'APPROVAL' and record->>'id' = id and record->>'projectId' = project_key and (record->>'revision')::integer = revision),
  constraint site00_spine_approval_events_kind check (approval_kind in ('GENERATION_AUTHORIZATION', 'BUDGET_AUTHORIZATION', 'REFERENCE_APPROVAL', 'TAKE_DECISION', 'CONTINUITY_REVIEW')),
  constraint site00_spine_approval_events_role check (actor_role in ('FOUNDER', 'PRODUCTION_ADMIN', 'AUTHORIZED_EDITOR', 'REVIEWER', 'READ_ONLY', 'SYSTEM')),
  -- Who may record which decision. The API enforces the same table; this keeps a bypass of the API from writing one.
  constraint site00_spine_approval_events_spend_founder check (approval_kind not in ('GENERATION_AUTHORIZATION', 'BUDGET_AUTHORIZATION', 'REFERENCE_APPROVAL') or actor_role = 'FOUNDER'),
  constraint site00_spine_approval_events_take_authority check (approval_kind <> 'TAKE_DECISION' or (
    (decision in ('APPROVE', 'REJECT') and actor_role = 'FOUNDER')
    or (decision in ('SELECT_FOR_EDIT', 'DESELECT_FOR_EDIT') and actor_role in ('FOUNDER', 'AUTHORIZED_EDITOR'))
    or (decision = 'HOLD' and actor_role in ('FOUNDER', 'PRODUCTION_ADMIN', 'AUTHORIZED_EDITOR', 'REVIEWER')))),
  constraint site00_spine_approval_events_continuity_authority check (approval_kind <> 'CONTINUITY_REVIEW' or actor_role in ('FOUNDER', 'PRODUCTION_ADMIN', 'AUTHORIZED_EDITOR', 'REVIEWER'))
);
create index if not exists site00_spine_approval_events_subject_idx on public.site00_spine_approval_events (project_key, subject_kind, subject_id);
-- One decision per subject revision: a double click, a retried request or two reviewers racing on the same take
-- revision records one event; the other is refused.
create unique index if not exists site00_spine_approval_events_once_idx on public.site00_spine_approval_events (project_key, approval_kind, subject_kind, subject_id, source_version) where source_version is not null;

alter table public.site00_spine_budgets drop constraint if exists site00_spine_budgets_approval_fk;
alter table public.site00_spine_budgets add constraint site00_spine_budgets_approval_fk foreign key (project_key, approval_id) references public.site00_spine_approval_events(project_key, id);

create table if not exists public.site00_spine_jobs (
  project_key text not null references public.site00_managed_projects(project_key) on delete restrict,
  id text not null,
  revision integer not null check (revision >= 1),
  record jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  shot_id text generated always as (record->>'shotId') stored,
  status text generated always as (record->>'status') stored,
  provider text generated always as (record->>'provider') stored,
  model text generated always as (record->>'model') stored,
  route_id text generated always as (record->>'routeId') stored,
  input_hash text generated always as (record->>'inputHash') stored,
  idempotency_key text generated always as (record->>'idempotencyKey') stored,
  quoted_credits integer generated always as ((record->'quotedCost'->>'credits')::integer) stored,
  max_authorized_credits integer generated always as ((record->'maxAuthorizedCost'->>'credits')::integer) stored,
  founder_approval_id text generated always as (record->>'founderApprovalRef') stored,
  provider_operation_id text generated always as (record->>'providerOperationId') stored,
  fixture boolean generated always as (coalesce(record->>'fixture', '') = 'TEST_FIXTURE') stored,
  primary key (project_key, id),
  constraint site00_spine_jobs_identity check (record->>'kind' = 'GENERATION_JOB' and record->>'id' = id and record->>'projectId' = project_key and (record->>'revision')::integer = revision),
  constraint site00_spine_jobs_status check (status in ('DRAFT', 'AWAITING_APPROVAL', 'AUTHORIZED', 'QUEUED', 'RUNNING', 'RECONCILIATION_REQUIRED', 'SUCCEEDED', 'FAILED', 'CANCELED', 'ASSET_CAPTURE_PENDING', 'ASSET_CAPTURE_FAILED', 'CAPTURED')),
  constraint site00_spine_jobs_shot_fk foreign key (project_key, shot_id) references public.site00_spine_shots(project_key, id),
  constraint site00_spine_jobs_approval_fk foreign key (project_key, founder_approval_id) references public.site00_spine_approval_events(project_key, id),
  constraint site00_spine_jobs_authorized_has_approval check (status not in ('AUTHORIZED', 'QUEUED') or founder_approval_id is not null),
  constraint site00_spine_jobs_ceiling check (max_authorized_credits is null or quoted_credits is null or quoted_credits <= max_authorized_credits)
);
create unique index if not exists site00_spine_jobs_idempotency_idx on public.site00_spine_jobs (project_key, idempotency_key);

create table if not exists public.site00_spine_assets (
  project_key text not null references public.site00_managed_projects(project_key) on delete restrict,
  id text not null,
  revision integer not null check (revision >= 1),
  record jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  storage_ref text generated always as (record->>'storageRef') stored,
  adapter text generated always as (record->>'adapter') stored,
  content_sha256 text generated always as (record->>'contentSha256') stored,
  byte_size bigint generated always as ((record->>'byteSize')::bigint) stored,
  source_job_id text generated always as (record->'lineage'->>'sourceJobId') stored,
  source_take_id text generated always as (record->'lineage'->>'sourceTakeId') stored,
  fixture boolean generated always as (coalesce(record->>'fixture', '') = 'TEST_FIXTURE') stored,
  primary key (project_key, id),
  constraint site00_spine_assets_identity check (record->>'kind' = 'ASSET' and record->>'id' = id and record->>'projectId' = project_key and (record->>'revision')::integer = revision),
  constraint site00_spine_assets_hash check (content_sha256 ~ '^[0-9a-f]{64}$'),
  constraint site00_spine_assets_size check (byte_size > 0),
  -- Provenance: spine-media://<adapter>/<bucket>/<project>/<sha256>.<ext>, content-addressed by this hash, in this
  -- project, through the adapter the record names.
  constraint site00_spine_assets_provenance check (
    starts_with(storage_ref, 'spine-media://') and split_part(storage_ref, '/', 3) = adapter
    and split_part(storage_ref, '/', 5) = project_key and split_part(storage_ref, '/', 7) = ''
    and split_part(split_part(storage_ref, '/', 6), '.', 1) = content_sha256),
  constraint site00_spine_assets_job_fk foreign key (project_key, source_job_id) references public.site00_spine_jobs(project_key, id)
);

create table if not exists public.site00_spine_takes (
  project_key text not null references public.site00_managed_projects(project_key) on delete restrict,
  id text not null,
  revision integer not null check (revision >= 1),
  record jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  shot_id text generated always as (record->>'shotId') stored,
  job_id text generated always as (record->>'jobId') stored,
  asset_id text generated always as (record->>'assetId') stored,
  content_sha256 text generated always as (record->>'contentSha256') stored,
  decision text generated always as (record->>'decision') stored,
  selected_for_edit boolean generated always as ((record->>'selectedForEdit')::boolean) stored,
  last_approval_id text generated always as (record->'approvalIds'->>-1) stored,
  fixture boolean generated always as (coalesce(record->>'fixture', '') = 'TEST_FIXTURE') stored,
  primary key (project_key, id),
  constraint site00_spine_takes_identity check (record->>'kind' = 'TAKE' and record->>'id' = id and record->>'projectId' = project_key and (record->>'revision')::integer = revision),
  constraint site00_spine_takes_decision check (decision in ('READY_FOR_REVIEW', 'APPROVED', 'HELD', 'REJECTED')),
  constraint site00_spine_takes_selection check (not selected_for_edit or decision = 'APPROVED'),
  constraint site00_spine_takes_shot_fk foreign key (project_key, shot_id) references public.site00_spine_shots(project_key, id),
  constraint site00_spine_takes_job_fk foreign key (project_key, job_id) references public.site00_spine_jobs(project_key, id),
  constraint site00_spine_takes_asset_fk foreign key (project_key, asset_id) references public.site00_spine_assets(project_key, id),
  constraint site00_spine_takes_last_approval_fk foreign key (project_key, last_approval_id) references public.site00_spine_approval_events(project_key, id)
);
-- One take per shot may be selected for the edit.
create unique index if not exists site00_spine_takes_one_selection_idx on public.site00_spine_takes (project_key, shot_id) where selected_for_edit;

alter table public.site00_spine_assets drop constraint if exists site00_spine_assets_take_fk;
alter table public.site00_spine_assets add constraint site00_spine_assets_take_fk foreign key (project_key, source_take_id) references public.site00_spine_takes(project_key, id);

create table if not exists public.site00_spine_continuity_refs (
  project_key text not null references public.site00_managed_projects(project_key) on delete restrict,
  id text not null,
  revision integer not null check (revision >= 1),
  record jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  take_id text generated always as (record->>'takeId') stored,
  asset_id text generated always as (record->>'assetId') stored,
  status text generated always as (record->>'status') stored,
  fixture boolean generated always as (coalesce(record->>'fixture', '') = 'TEST_FIXTURE') stored,
  primary key (project_key, id),
  constraint site00_spine_continuity_refs_identity check (record->>'kind' = 'CONTINUITY_REFERENCE' and record->>'id' = id and record->>'projectId' = project_key and (record->>'revision')::integer = revision),
  constraint site00_spine_continuity_refs_status check (status in ('CANONICAL', 'INSPECTION_ONLY', 'INVALIDATED')),
  constraint site00_spine_continuity_refs_take_fk foreign key (project_key, take_id) references public.site00_spine_takes(project_key, id),
  constraint site00_spine_continuity_refs_asset_fk foreign key (project_key, asset_id) references public.site00_spine_assets(project_key, id)
);

-- One row per dispatch attempt, kept from the job record by trigger. A ticket buys one attempt; a provider
-- operation belongs to one attempt; a job has at most one attempt in flight; a closed attempt never changes.
create table if not exists public.site00_spine_provider_operations (
  project_key text not null,
  job_id text not null,
  attempt integer not null check (attempt >= 1),
  ticket_id text not null,
  authorization_id text not null,
  operation_id text,
  outcome text not null check (outcome in ('OPEN', 'UNCERTAIN', 'SUCCEEDED', 'FAILED', 'CANCELED')),
  quoted_credits integer,
  charged_credits numeric,
  charged_status text not null check (charged_status in ('REPORTED', 'UNKNOWN', 'NOT_AVAILABLE')),
  provider text not null,
  model text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (project_key, job_id, attempt),
  constraint site00_spine_provider_operations_job_fk foreign key (project_key, job_id) references public.site00_spine_jobs(project_key, id)
);
create unique index if not exists site00_spine_provider_operations_ticket_idx on public.site00_spine_provider_operations (ticket_id);
create unique index if not exists site00_spine_provider_operations_operation_idx on public.site00_spine_provider_operations (provider, operation_id) where operation_id is not null;
create unique index if not exists site00_spine_provider_operations_in_flight_idx on public.site00_spine_provider_operations (project_key, job_id) where outcome in ('OPEN', 'UNCERTAIN');

-- ── views ───────────────────────────────────────────────────────────────────────────────────────────────
create or replace view public.site00_spine_cost_records with (security_invoker = true) as
  select o.project_key, o.job_id, j.shot_id, o.attempt, o.provider, o.model, o.quoted_credits,
         case when o.quoted_credits is null then 'UNKNOWN' else 'QUOTED' end as quote_status,
         o.charged_credits as actual_credits, o.charged_status as actual_status, o.outcome, o.created_at, o.updated_at
  from public.site00_spine_provider_operations o
  join public.site00_spine_jobs j on j.project_key = o.project_key and j.id = o.job_id;

create or replace view public.site00_spine_edit_selections with (security_invoker = true) as
  select project_key, shot_id, id as take_id, last_approval_id as selection_approval_id, updated_at as selected_at
  from public.site00_spine_takes where selected_for_edit;

-- ── integrity triggers ──────────────────────────────────────────────────────────────────────────────────
-- The checks that read generated columns run AFTER the row is written: PostgreSQL computes stored generated columns
-- after BEFORE triggers, so a BEFORE trigger would see them as null. Raising in an AFTER trigger still rolls back
-- the statement (and the whole site00_spine_commit batch).

-- Approval events are history: never updated, never deleted.
create or replace function public.site00_spine_approval_events_immutable() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_level = 'STATEMENT' then raise exception 'SPINE_IMMUTABLE_RECORD: approval events are never truncated'; end if;
  raise exception 'SPINE_IMMUTABLE_RECORD: approval events are never changed or removed (%/%)', old.project_key, old.id;
end $$;
drop trigger if exists site00_spine_approval_events_immutable on public.site00_spine_approval_events;
create trigger site00_spine_approval_events_immutable before update or delete on public.site00_spine_approval_events
  for each row execute function public.site00_spine_approval_events_immutable();
drop trigger if exists site00_spine_approval_events_no_truncate on public.site00_spine_approval_events;
create trigger site00_spine_approval_events_no_truncate before truncate on public.site00_spine_approval_events
  for each statement execute function public.site00_spine_approval_events_immutable();

-- An approval event names a subject that exists in the same project.
create or replace function public.site00_spine_approval_subject_exists() returns trigger
language plpgsql set search_path = public as $$
declare
  t text;
  found boolean;
begin
  t := case new.subject_kind
    when 'SHOT' then 'site00_spine_shots' when 'BUDGET' then 'site00_spine_budgets'
    when 'GENERATION_JOB' then 'site00_spine_jobs' when 'TAKE' then 'site00_spine_takes'
    when 'ASSET' then 'site00_spine_assets' when 'CONTINUITY_REFERENCE' then 'site00_spine_continuity_refs'
    when 'APPROVAL' then 'site00_spine_approval_events' end;
  if t is null then raise exception 'SPINE_REFERENCE_NOT_FOUND: unknown subject kind %', new.subject_kind; end if;
  execute format('select exists (select 1 from public.%I where project_key = $1 and id = $2)', t) into found using new.project_key, new.subject_id;
  if not found then raise exception 'SPINE_REFERENCE_NOT_FOUND: %/% does not exist in %', new.subject_kind, new.subject_id, new.project_key; end if;
  return new;
end $$;
drop trigger if exists site00_spine_approval_subject_exists on public.site00_spine_approval_events;
create trigger site00_spine_approval_subject_exists after insert on public.site00_spine_approval_events
  for each row execute function public.site00_spine_approval_subject_exists();

-- A take becomes APPROVED only through a founder APPROVE event, and SELECTED only through a SELECT_FOR_EDIT event by
-- the founder or an authorized editor, each the take's latest decision.
create or replace function public.site00_spine_take_authority() returns trigger
language plpgsql set search_path = public as $$
declare
  a record;
begin
  if new.decision = 'APPROVED' and (tg_op = 'INSERT' or old.decision is distinct from 'APPROVED') then
    select * into a from public.site00_spine_approval_events where project_key = new.project_key and id = new.last_approval_id;
    if a is null or a.subject_kind <> 'TAKE' or a.subject_id <> new.id or a.approval_kind <> 'TAKE_DECISION' or a.decision <> 'APPROVE' or a.actor_role <> 'FOUNDER' then
      raise exception 'SPINE_FORBIDDEN: %/% needs a founder APPROVE event to become APPROVED', new.project_key, new.id;
    end if;
  end if;
  if new.selected_for_edit and (tg_op = 'INSERT' or not old.selected_for_edit) then
    select * into a from public.site00_spine_approval_events where project_key = new.project_key and id = new.last_approval_id;
    if a is null or a.subject_kind <> 'TAKE' or a.subject_id <> new.id or a.decision <> 'SELECT_FOR_EDIT' or a.actor_role not in ('FOUNDER', 'AUTHORIZED_EDITOR') then
      raise exception 'SPINE_FORBIDDEN: %/% needs a SELECT_FOR_EDIT event by the founder or an authorized editor', new.project_key, new.id;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists site00_spine_take_authority on public.site00_spine_takes;
create trigger site00_spine_take_authority after insert or update on public.site00_spine_takes
  for each row execute function public.site00_spine_take_authority();

-- A job becomes AUTHORIZED only against a founder GENERATION_AUTHORIZATION for this job at its current input hash.
create or replace function public.site00_spine_job_authority() returns trigger
language plpgsql set search_path = public as $$
declare
  a record;
begin
  if new.status = 'AUTHORIZED' and (tg_op = 'INSERT' or old.status is distinct from 'AUTHORIZED') then
    select * into a from public.site00_spine_approval_events where project_key = new.project_key and id = new.founder_approval_id;
    if a is null or a.subject_kind <> 'GENERATION_JOB' or a.subject_id <> new.id or a.approval_kind <> 'GENERATION_AUTHORIZATION' or a.decision <> 'AUTHORIZE'
       or a.actor_role <> 'FOUNDER' or a.input_hash is distinct from new.input_hash then
      raise exception 'SPINE_FORBIDDEN: %/% needs a founder generation authorization for input %', new.project_key, new.id, new.input_hash;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists site00_spine_job_authority on public.site00_spine_jobs;
create trigger site00_spine_job_authority after insert or update on public.site00_spine_jobs
  for each row execute function public.site00_spine_job_authority();

-- Keep site00_spine_provider_operations equal to the job's attempts. Closed attempts cannot be rewritten.
create or replace function public.site00_spine_sync_provider_operations() returns trigger
language plpgsql set search_path = public as $$
declare
  att jsonb;
  prev record;
  charged text;
begin
  for att in select * from jsonb_array_elements(coalesce(new.record->'attempts', '[]'::jsonb)) loop
    charged := att->>'chargedCredits';
    select * into prev from public.site00_spine_provider_operations
      where project_key = new.project_key and job_id = new.id and attempt = (att->>'attempt')::integer;
    if prev is null then
      insert into public.site00_spine_provider_operations (project_key, job_id, attempt, ticket_id, authorization_id, operation_id, outcome,
        quoted_credits, charged_credits, charged_status, provider, model)
      values (new.project_key, new.id, (att->>'attempt')::integer, att->>'ticketId', att->>'authorizationId',
        nullif(nullif(att->>'operationId', 'NOT_AVAILABLE'), 'UNKNOWN'), att->>'outcome', new.quoted_credits,
        case when charged ~ '^[0-9.]+$' then charged::numeric end,
        case when charged ~ '^[0-9.]+$' then 'REPORTED' when charged = 'UNKNOWN' then 'UNKNOWN' else 'NOT_AVAILABLE' end,
        new.provider, new.model);
    elsif prev.outcome in ('OPEN', 'UNCERTAIN') then
      update public.site00_spine_provider_operations set
        operation_id = coalesce(nullif(nullif(att->>'operationId', 'NOT_AVAILABLE'), 'UNKNOWN'), prev.operation_id),
        outcome = att->>'outcome',
        charged_credits = case when charged ~ '^[0-9.]+$' then charged::numeric end,
        charged_status = case when charged ~ '^[0-9.]+$' then 'REPORTED' when charged = 'UNKNOWN' then 'UNKNOWN' else 'NOT_AVAILABLE' end,
        updated_at = now()
      where project_key = new.project_key and job_id = new.id and attempt = prev.attempt;
    elsif prev.outcome is distinct from att->>'outcome' or prev.ticket_id is distinct from att->>'ticketId' then
      raise exception 'SPINE_IMMUTABLE_RECORD: attempt % of %/% is closed', prev.attempt, new.project_key, new.id;
    end if;
  end loop;
  return null;
end $$;
drop trigger if exists site00_spine_sync_provider_operations on public.site00_spine_jobs;
create trigger site00_spine_sync_provider_operations after insert or update on public.site00_spine_jobs
  for each row execute function public.site00_spine_sync_provider_operations();

-- ── store API (service_role only) ───────────────────────────────────────────────────────────────────────
create or replace function public.site00_spine_table(p_kind text) returns text
language sql immutable set search_path = public as $$
  select case p_kind
    when 'SHOT' then 'site00_spine_shots' when 'BUDGET' then 'site00_spine_budgets'
    when 'GENERATION_JOB' then 'site00_spine_jobs' when 'TAKE' then 'site00_spine_takes'
    when 'ASSET' then 'site00_spine_assets' when 'APPROVAL' then 'site00_spine_approval_events'
    when 'CONTINUITY_REFERENCE' then 'site00_spine_continuity_refs' end
$$;

create or replace function public.site00_spine_read(p_kind text, p_project text, p_id text) returns jsonb
language plpgsql stable set search_path = public as $$
declare
  t text := public.site00_spine_table(p_kind);
  r jsonb;
begin
  if t is null then raise exception 'SPINE_KIND: unknown record kind %', p_kind; end if;
  execute format('select record from public.%I where project_key = $1 and id = $2', t) into r using p_project, p_id;
  return r;
end $$;

create or replace function public.site00_spine_list(p_kind text, p_project text) returns text[]
language plpgsql stable set search_path = public as $$
declare
  t text := public.site00_spine_table(p_kind);
  ids text[];
begin
  if t is null then raise exception 'SPINE_KIND: unknown record kind %', p_kind; end if;
  execute format('select coalesce(array_agg(id order by id), ''{}'') from public.%I where project_key = $1', t) into ids using p_project;
  return ids;
end $$;

create or replace function public.site00_spine_records(p_kind text, p_project text) returns jsonb
language plpgsql stable set search_path = public as $$
declare
  t text := public.site00_spine_table(p_kind);
  r jsonb;
begin
  if t is null then raise exception 'SPINE_KIND: unknown record kind %', p_kind; end if;
  execute format('select coalesce(jsonb_agg(record order by id), ''[]''::jsonb) from public.%I where project_key = $1', t) into r using p_project;
  return r;
end $$;

-- Applies a batch atomically: each op inserts a new record (expectedRevision null) or replaces one whose stored
-- revision is expectedRevision. Any conflict or constraint failure rolls back the whole batch.
create or replace function public.site00_spine_commit(p_ops jsonb) returns integer
language plpgsql set search_path = public as $$
declare
  op jsonb;
  rec jsonb;
  t text;
  n integer;
  total integer := 0;
begin
  if jsonb_typeof(p_ops) <> 'array' or jsonb_array_length(p_ops) = 0 then raise exception 'SPINE_SCHEMA_INVALID: empty batch'; end if;
  for op in select * from jsonb_array_elements(p_ops) loop
    rec := op->'record';
    t := public.site00_spine_table(op->>'kind');
    if t is null or rec->>'kind' is distinct from op->>'kind' then raise exception 'SPINE_KIND: % does not match its record', op->>'kind'; end if;
    if op->'expectedRevision' is null or jsonb_typeof(op->'expectedRevision') = 'null' then
      execute format('insert into public.%I (project_key, id, revision, record) values ($1, $2, $3, $4) on conflict (project_key, id) do nothing', t)
        using rec->>'projectId', rec->>'id', (rec->>'revision')::integer, rec;
      get diagnostics n = row_count;
      if n = 0 then raise exception 'SPINE_CONFLICT: %/% already exists', op->>'kind', rec->>'id'; end if;
    else
      if op->>'kind' = 'APPROVAL' then raise exception 'SPINE_IMMUTABLE_RECORD: APPROVAL/% is never changed', rec->>'id'; end if;
      if (rec->>'revision')::integer <> (op->>'expectedRevision')::integer + 1 then
        raise exception 'SPINE_CONFLICT: %/% must advance from revision % by one', op->>'kind', rec->>'id', op->>'expectedRevision';
      end if;
      execute format('update public.%I set revision = $3, record = $4, updated_at = now() where project_key = $1 and id = $2 and revision = $5', t)
        using rec->>'projectId', rec->>'id', (rec->>'revision')::integer, rec, (op->>'expectedRevision')::integer;
      get diagnostics n = row_count;
      if n = 0 then raise exception 'SPINE_CONFLICT: %/% is not at revision %', op->>'kind', rec->>'id', op->>'expectedRevision'; end if;
    end if;
    total := total + 1;
  end loop;
  return total;
end $$;

-- The caller's role on a project, or null.
create or replace function public.site00_spine_member_role(p_project text, p_user uuid) returns text
language sql stable set search_path = public as $$
  select role from public.site00_spine_members where project_key = p_project and user_id = p_user
$$;

-- ── row level security ──────────────────────────────────────────────────────────────────────────────────
do $$
declare
  t text;
begin
  foreach t in array array['site00_spine_members', 'site00_spine_budgets', 'site00_spine_shots', 'site00_spine_approval_events',
    'site00_spine_jobs', 'site00_spine_assets', 'site00_spine_takes', 'site00_spine_continuity_refs', 'site00_spine_provider_operations'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists service_role_all on public.%I', t);
    execute format('create policy service_role_all on public.%I for all to service_role using (true) with check (true)', t);
    execute format('drop policy if exists spine_member_read on public.%I', t);
    if t = 'site00_spine_members' then
      execute format('create policy spine_member_read on public.%I for select to authenticated using (user_id = auth.uid())', t);
    else
      execute format('create policy spine_member_read on public.%I for select to authenticated using (exists (select 1 from public.site00_spine_members m where m.project_key = %I.project_key and m.user_id = auth.uid()))', t, t);
    end if;
    execute format('revoke all on public.%I from anon', t);
    execute format('revoke insert, update, delete, truncate, references, trigger on public.%I from authenticated', t);
  end loop;
end $$;

revoke all on public.site00_spine_cost_records, public.site00_spine_edit_selections from anon;

do $$
declare
  f text;
begin
  foreach f in array array[
    'site00_spine_table(text)', 'site00_spine_read(text, text, text)', 'site00_spine_list(text, text)', 'site00_spine_records(text, text)',
    'site00_spine_commit(jsonb)', 'site00_spine_member_role(text, uuid)',
    'site00_spine_approval_events_immutable()', 'site00_spine_approval_subject_exists()', 'site00_spine_take_authority()',
    'site00_spine_job_authority()', 'site00_spine_sync_provider_operations()'] loop
    execute format('revoke execute on function public.%s from public, anon, authenticated', f);
    execute format('grant execute on function public.%s to service_role', f);
  end loop;
end $$;

-- ── private media bucket ────────────────────────────────────────────────────────────────────────────────
-- Production masters live here. Private: no public URL; reads are short-lived signed URLs issued by the server.
-- No storage.objects policy is added, so only the service role can read or write the bucket.
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('site00-production-masters', 'site00-production-masters', false, 524288000,
            array['video/mp4', 'video/quicktime', 'image/png', 'image/jpeg', 'image/webp'])
    on conflict (id) do update set public = false;
  end if;
end $$;
