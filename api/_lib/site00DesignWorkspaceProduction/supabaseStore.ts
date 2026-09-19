import { getSupabaseAdmin } from '../supabase.js';
import { computeDesignReadiness } from '../../../shared/site00-design-workspace-production/designReadinessEngine.js';
import type { DesignProductionState } from '../../../shared/site00-design-workspace-production/types.js';
import type { DesignWorkspaceAuthoritySessionRow } from './types.js';

export async function designWorkspaceProductionTablesExist(): Promise<boolean> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from('site00_design_workspace_authority_sessions').select('id').limit(1);
  return !error;
}

function rowToSession(data: Record<string, unknown>): DesignWorkspaceAuthoritySessionRow {
  const state = data.state_payload as DesignProductionState;
  return {
    id: String(data.id),
    projectId: String(data.project_id),
    pageId: String(data.page_id),
    sessionVersion: Number(data.session_version),
    state: {
      ...state,
      sessionVersion: Number(data.session_version),
    },
    latestBuildPackageId: data.latest_build_package_id ? String(data.latest_build_package_id) : null,
    authorityLockedAt: data.authority_locked_at ? String(data.authority_locked_at) : null,
    authorityLockedBy: data.authority_locked_by ? String(data.authority_locked_by) : null,
    updatedAt: String(data.updated_at),
  };
}

export async function getSessionSupabase(projectId: string, pageId: string): Promise<DesignWorkspaceAuthoritySessionRow | null> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from('site00_design_workspace_authority_sessions')
    .select('*')
    .eq('project_id', projectId.toLowerCase())
    .eq('page_id', pageId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return rowToSession(data as Record<string, unknown>);
}

export async function upsertSessionSupabase(input: {
  projectId: string;
  pageId: string;
  expectedSessionVersion: number | null;
  state: DesignProductionState;
  latestBuildPackageId: string | null;
  newEvents: { type: string; payload?: Record<string, unknown>; actorEmail: string | null; at: string }[];
}): Promise<DesignWorkspaceAuthoritySessionRow> {
  const sb = getSupabaseAdmin();
  const existing = await getSessionSupabase(input.projectId, input.pageId);
  if (existing && input.expectedSessionVersion !== null && existing.sessionVersion !== input.expectedSessionVersion) {
    throw new Error('STALE_STATE');
  }

  const receipt = computeDesignReadiness(input.state);
  const nextVersion = (existing?.sessionVersion ?? 0) + 1;
  const sessionId = existing?.id;
  const row = {
    project_id: input.projectId.toLowerCase(),
    page_id: input.pageId,
    session_version: nextVersion,
    design_authority_version: input.state.designAuthorityVersion,
    interaction_contract_version: input.state.contractFreeze.contractVersion,
    interaction_contract_hash: input.state.contractFreeze.contractHash,
    workflow_stage: input.state.workflowStage,
    package_status: input.state.packageStatus,
    latest_build_package_id: input.latestBuildPackageId,
    state_payload: { ...input.state, sessionVersion: nextVersion },
    readiness_snapshot: receipt,
    provenance_snapshot: { provenanceVersion: 'entry001-campaign-archive-v1' },
    authority_locked_at: input.state.pairLockedAt,
    authority_locked_by: input.state.authorityLockedBy,
    updated_at: input.state.updatedAt,
  };

  let savedId = sessionId;
  if (existing) {
    const { data, error } = await sb
      .from('site00_design_workspace_authority_sessions')
      .update(row)
      .eq('id', existing.id)
      .eq('session_version', existing.sessionVersion)
      .select('*')
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('STALE_STATE');
    savedId = String(data.id);
  } else {
    const { data, error } = await sb.from('site00_design_workspace_authority_sessions').insert(row).select('*').single();
    if (error) throw new Error(error.message);
    savedId = String(data.id);
  }

  for (const ev of input.newEvents) {
    const { error: evErr } = await sb.from('site00_design_workspace_authority_events').insert({
      session_id: savedId,
      project_id: input.projectId.toLowerCase(),
      page_id: input.pageId,
      event_type: ev.type,
      actor_email: ev.actorEmail,
      design_authority_version: input.state.designAuthorityVersion,
      payload: ev.payload ?? {},
      created_at: ev.at,
    });
    if (evErr) throw new Error(evErr.message);
  }

  const refreshed = await getSessionSupabase(input.projectId, input.pageId);
  if (!refreshed) throw new Error('SESSION_PERSIST_FAILED');
  return refreshed;
}

export async function persistBuildPackageSupabase(input: {
  sessionId: string;
  projectId: string;
  pageId: string;
  buildPackage: NonNullable<DesignProductionState['buildPackage']>;
  readinessReceipt: ReturnType<typeof computeDesignReadiness>;
}): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from('site00_design_workspace_build_packages').upsert({
    id: input.buildPackage.id,
    session_id: input.sessionId,
    project_id: input.projectId.toLowerCase(),
    page_id: input.pageId,
    design_authority_version: input.buildPackage.designAuthorityVersion,
    interaction_contract_version: input.buildPackage.interactionContractVersion,
    asset_manifest_version: input.buildPackage.assetManifestVersion,
    provenance_version: input.buildPackage.provenanceVersion,
    readiness_receipt_id: input.buildPackage.readinessReceiptId,
    package_payload: { buildPackage: input.buildPackage, readinessReceipt: input.readinessReceipt },
    created_by: input.buildPackage.createdBy,
    created_at: input.buildPackage.createdAt,
  });
  if (error) throw new Error(error.message);
}
