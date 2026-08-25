/**
 * Explicit canon promotion — CREATIVE EXPLORATION → REVIEW → APPROVAL → IDENTITY CANON
 */

import { getSupabaseAdmin } from '../../supabase.js';
import { resolveCanonicalProject } from '../canonicalProject.js';
import { assertNoHostIdentityInClientCanon } from '../../../../shared/site00-identity/hostFirewall.js';
import type { CanonHierarchyScope } from '../../../../shared/site00-identity/types.js';

export type CanonPromotionResult = {
  promotionId: string;
  canonRecordId: string;
  version: number;
};

export async function promoteIdentityToCanon(input: {
  projectIdOrSlug: string;
  territoryId: string;
  hierarchyScope: CanonHierarchyScope;
  scopeNodeId?: string | null;
  approvedFields: Record<string, unknown>;
  approver: string;
}): Promise<CanonPromotionResult> {
  const resolved = await resolveCanonicalProject({ slug: input.projectIdOrSlug, projectId: input.projectIdOrSlug });
  if (!resolved.ok) throw new Error(resolved.error.message);

  if (!assertNoHostIdentityInClientCanon(input.approvedFields)) {
    throw new Error('Canon promotion blocked: SITE 00 host identity detected in approved fields');
  }

  const { data: territory } = await getSupabaseAdmin()
    .from('site00_identity_territories')
    .select('*')
    .eq('id', input.territoryId)
    .eq('project_id', resolved.project.id)
    .maybeSingle();

  if (!territory) throw new Error('Territory not found for project');

  const orgId = resolved.project.organizationId;
  if (!orgId) throw new Error('Project has no organization_id for canon record');

  const canonContent = {
    truthLayer: 'APPROVED_CANON',
    hierarchyScope: input.hierarchyScope,
    approvedFields: input.approvedFields,
    sourceTerritoryId: input.territoryId,
    sourceTerritoryKey: territory.territory_key,
    lineage: {
      promotedFrom: 'CREATIVE_EXPLORATION',
      territoryStatus: territory.status,
      approver: input.approver,
    },
  };

  const { data: canonRecord, error: canonErr } = await getSupabaseAdmin()
    .from('site00_canon_records')
    .insert({
      organization_id: orgId,
      project_id: resolved.project.id,
      canon_type: 'IDENTITY',
      title: `Identity Canon — ${territory.working_label} (${input.hierarchyScope})`,
      content: canonContent,
      approval_state: 'APPROVED',
      current_version: 1,
      metadata: { promotionSource: 'P0.D', scopeNodeId: input.scopeNodeId ?? null },
    })
    .select('id')
    .single();

  if (canonErr) throw canonErr;

  await getSupabaseAdmin().from('site00_canon_versions').insert({
    canon_id: canonRecord.id,
    version_number: 1,
    content: canonContent,
    changed_by: input.approver,
    change_reason: 'Initial identity canon promotion',
  });

  const partial = Object.keys(input.approvedFields).length < 5;
  await getSupabaseAdmin()
    .from('site00_identity_territories')
    .update({
      status: partial ? 'PROMOTED_PARTIAL' : 'PROMOTED',
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.territoryId);

  const { data: promotion, error: promoErr } = await getSupabaseAdmin()
    .from('site00_identity_canon_promotions')
    .insert({
      project_id: resolved.project.id,
      canon_record_id: canonRecord.id,
      territory_id: input.territoryId,
      hierarchy_scope: input.hierarchyScope,
      scope_node_id: input.scopeNodeId ?? null,
      approved_fields: input.approvedFields,
      version: 1,
      approver: input.approver,
      lineage: canonContent.lineage,
    })
    .select('id')
    .single();

  if (promoErr) throw promoErr;

  const approvedFieldCount = Object.keys(input.approvedFields).length;
  const phaseStatus = partial ? 'PARTIALLY_APPROVED' : 'COMPLETE';
  await getSupabaseAdmin()
    .from('site00_identity_phases')
    .update({ status: phaseStatus, updated_at: new Date().toISOString() })
    .eq('project_id', resolved.project.id);

  if (!partial && approvedFieldCount > 0) {
    await getSupabaseAdmin()
      .from('site00_projects')
      .update({ status: 'IDENTITY_COMPLETE', updated_at: new Date().toISOString() })
      .eq('id', resolved.project.id)
      .eq('status', 'IDENTITY_IN_PROGRESS');
  }

  return {
    promotionId: promotion.id,
    canonRecordId: canonRecord.id,
    version: 1,
  };
}

export async function countCanonRecordsFromOrigin(projectIdOrSlug: string): Promise<number> {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) return 0;

  const { count } = await getSupabaseAdmin()
    .from('site00_canon_records')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', resolved.project.id)
    .eq('canon_type', 'IDENTITY')
    .eq('approval_state', 'APPROVED');

  return count ?? 0;
}

export function canAutoCanonize(): false {
  return false;
}
