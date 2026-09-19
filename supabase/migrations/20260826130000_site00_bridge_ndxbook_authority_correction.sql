-- P0.BRIDGE.1B-SITE00 — NDXBOOK repo authority correction + FSBW branch normalization
-- NDXBOOK lives in yoteenz/SITE00 (SITE00_NATIVE); FSBW bridge retains Frontal Slayer, AIO, Studio World Website only.

-- ─── Correct NDXBOOK managed project authority ───

update public.site00_managed_projects
set
  source_repo = 'yoteenz/SITE00',
  source_project_key = 'ndxbook',
  runtime_mode = 'SITE00_NATIVE',
  metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'executionMode', 'SITE00_NATIVE',
    'externalRepoBridgeRequired', false,
    'authorityCorrection', 'P0.BRIDGE.1B-SITE00'
  ),
  updated_at = now()
where project_key = 'ndxbook';

update public.site00_managed_projects
set
  source_repo = coalesce(source_repo, 'yoteenz/SITE00'),
  runtime_mode = 'SITE00_NATIVE',
  metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'executionMode', 'SITE00_NATIVE',
    'externalRepoBridgeRequired', false
  ),
  updated_at = now()
where project_key = 'site00';

update public.site00_managed_projects
set
  runtime_mode = 'CROSS_REPO_FSBW',
  metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'executionMode', 'CROSS_REPO_FSBW',
    'externalRepoBridgeRequired', true
  ),
  updated_at = now()
where project_key in ('frontal-slayer', 'all-in-one-enterprises', 'studio-world');

-- ─── Supersede stale NDXBOOK → FSBW binding (preserve audit history) ───

update public.site00_repo_bindings rb
set
  active = false,
  metadata = coalesce(rb.metadata, '{}'::jsonb) || jsonb_build_object(
    'bindingStatus', 'SUPERSEDED',
    'supersededReason', 'REPO_AUTHORITY_CORRECTION',
    'lineage', 'P0.BRIDGE.1B-SITE00'
  ),
  updated_at = now()
from public.site00_managed_projects p
where rb.project_id = p.id
  and p.project_key = 'ndxbook'
  and rb.repo_owner = 'yoteenz'
  and rb.repo_name = 'fsbw';

-- ─── SITE00 native bindings for site00 + ndxbook ───

insert into public.site00_repo_bindings (
  project_id, repo_owner, repo_name, default_branch, source_project_path,
  adapter_type, runtime_binding_mode, source_materialization_enabled, metadata
)
select p.id, 'yoteenz', 'SITE00', 'main',
  case when p.project_key = 'ndxbook' then 'ndxbook' else null end,
  'SITE00_NATIVE', 'HYBRID', true,
  jsonb_build_object(
    'bindingStatus', 'ACTIVE',
    'projects', jsonb_build_array(p.project_key),
    'lineage', 'P0.BRIDGE.1B-SITE00'
  )
from public.site00_managed_projects p
where p.project_key in ('site00', 'ndxbook')
on conflict (project_id, repo_owner, repo_name) do update set
  default_branch = excluded.default_branch,
  source_project_path = excluded.source_project_path,
  adapter_type = excluded.adapter_type,
  active = true,
  metadata = excluded.metadata,
  updated_at = now();

-- ─── Normalize FSBW default branch (GitHub defaultBranchRef = master) ───

update public.site00_repo_bindings
set
  default_branch = 'master',
  metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'branchAuthority', 'github:defaultBranchRef',
    'previousDefaultBranch', default_branch
  ),
  updated_at = now()
where repo_owner = 'yoteenz'
  and repo_name = 'fsbw'
  and default_branch = 'main'
  and coalesce(metadata->>'bindingStatus', 'ACTIVE') = 'ACTIVE';

-- ─── Block legacy NDXBOOK requests targeting FSBW ───

update public.site00_change_requests cr
set
  status = 'BLOCKED_REPO_AUTHORITY_MISMATCH',
  metadata = coalesce(cr.metadata, '{}'::jsonb) || jsonb_build_object(
    'blocker', 'BLOCKED_REPO_AUTHORITY_MISMATCH',
    'reason', 'INVALID_REPO_AUTHORITY',
    'lineage', 'P0.BRIDGE.1B-SITE00'
  )
from public.site00_managed_projects p,
     public.site00_repo_bindings rb
where cr.project_id = p.id
  and p.project_key = 'ndxbook'
  and cr.repo_binding_id = rb.id
  and rb.repo_owner = 'yoteenz'
  and rb.repo_name = 'fsbw'
  and cr.status in ('READY_FOR_REPO', 'FOUNDER_APPROVED', 'APPLYING', 'PR_CREATED');
