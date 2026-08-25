/**
 * Explicit canon promotion — CREATIVE EXPLORATION → REVIEW → APPROVAL → IDENTITY CANON (P0.D/P0.E)
 */

import { getSupabaseAdmin } from '../../supabase.js';
import { resolveCanonicalProject } from '../canonicalProject.js';
import { assertNoHostIdentityInClientCanon } from '../../../../shared/site00-identity/hostFirewall.js';
import type { CanonHierarchyScope } from '../../../../shared/site00-identity/types.js';
import {
  isBlockedAutomatedApprover,
  type IdentityCanonFieldKey,
} from '../../../../shared/site00-identity/identityFields.js';
import { evaluateIdentityCanonGate } from '../../../../shared/site00-identity/identityCanonGate.js';
import { listWorldHierarchy } from './worldHierarchyService.js';
import { ASTRAL_WORLD_HIERARCHY_SEED, ASTRAL_WORLD_FOUNDER_HIERARCHY_TRUTH } from '../../../../shared/site00-identity/astralWorldIdentity.js';

export type CanonPromotionResult = {
  promotionId: string;
  canonRecordId: string;
  version: number;
};

export type FieldApprovalInput = {
  fieldKey: IdentityCanonFieldKey;
  hierarchyScope: CanonHierarchyScope;
  scopeNodeId?: string | null;
  territoryId: string;
  sourceJudgmentId: string;
  value: unknown;
};

export type PromoteFieldsResult = {
  promotedFieldIds: string[];
  canonRecordId: string;
  version: number;
  identityCanonGate: ReturnType<typeof evaluateIdentityCanonGate>;
};

export type PromotionPreview = {
  eligible: FieldApprovalInput[];
  blocked: Array<{ fieldKey: string; reason: string }>;
  structuralWorldReady: boolean;
};

export async function previewCanonPromotion(input: {
  projectIdOrSlug: string;
  approver: string;
}): Promise<PromotionPreview> {
  const resolved = await resolveCanonicalProject({ slug: input.projectIdOrSlug, projectId: input.projectIdOrSlug });
  if (!resolved.ok) throw new Error(resolved.error.message);

  const { data: approveJudgments } = await getSupabaseAdmin()
    .from('site00_identity_field_judgments')
    .select('*')
    .eq('project_id', resolved.project.id)
    .eq('judgment', 'APPROVE')
    .eq('approver', input.approver);

  const { data: existingCanon } = await getSupabaseAdmin()
    .from('site00_canon_field_records')
    .select('field_key, hierarchy_scope')
    .eq('project_id', resolved.project.id)
    .eq('status', 'ACTIVE');

  const existingKeys = new Set((existingCanon ?? []).map((c) => `${c.hierarchy_scope}:${c.field_key}`));

  const eligible: FieldApprovalInput[] = [];
  const blocked: Array<{ fieldKey: string; reason: string }> = [];

  for (const j of approveJudgments ?? []) {
    const key = `${j.hierarchy_scope}:${j.field_key}`;
    if (existingKeys.has(key)) {
      blocked.push({ fieldKey: j.field_key, reason: 'Already in active canon' });
      continue;
    }
    eligible.push({
      fieldKey: j.field_key as IdentityCanonFieldKey,
      hierarchyScope: j.hierarchy_scope as CanonHierarchyScope,
      scopeNodeId: j.scope_node_id,
      territoryId: j.territory_id,
      sourceJudgmentId: j.id,
      value: j.field_value,
    });
  }

  const { data: confirmations } = await getSupabaseAdmin()
    .from('site00_world_structure_confirmations')
    .select('confirmation_key, confirmed')
    .eq('project_id', resolved.project.id)
    .eq('confirmed', true);

  const confirmedKeys = new Set((confirmations ?? []).map((c) => c.confirmation_key));
  const structuralWorldReady =
    confirmedKeys.has('master_product_universe') &&
    confirmedKeys.has('astrea_flagship_district') &&
    confirmedKeys.has('astrea_destinations');

  return { eligible, blocked, structuralWorldReady };
}

export async function promoteIdentityFields(input: {
  projectIdOrSlug: string;
  approver: string;
  approvals: FieldApprovalInput[];
}): Promise<PromoteFieldsResult> {
  if (isBlockedAutomatedApprover(input.approver)) {
    throw new Error('Canon promotion blocked: automated/system approvers cannot promote canon');
  }

  if (!input.approvals.length) {
    throw new Error('Canon promotion blocked: no approved fields provided');
  }

  const resolved = await resolveCanonicalProject({ slug: input.projectIdOrSlug, projectId: input.projectIdOrSlug });
  if (!resolved.ok) throw new Error(resolved.error.message);

  const orgId = resolved.project.organizationId;
  if (!orgId) throw new Error('Project has no organization_id for canon record');

  const promotedFieldIds: string[] = [];
  const lineageSources: Array<{ fieldKey: string; territoryId: string; judgmentId: string }> = [];

  for (const approval of input.approvals) {
    const { data: judgment } = await getSupabaseAdmin()
      .from('site00_identity_field_judgments')
      .select('*')
      .eq('id', approval.sourceJudgmentId)
      .eq('project_id', resolved.project.id)
      .eq('territory_id', approval.territoryId)
      .eq('field_key', approval.fieldKey)
      .eq('judgment', 'APPROVE')
      .maybeSingle();

    if (!judgment) {
      throw new Error(`Canon promotion blocked: missing APPROVE judgment for field ${approval.fieldKey}`);
    }

    if (judgment.approver !== input.approver) {
      throw new Error(`Canon promotion blocked: judgment approver mismatch for ${approval.fieldKey}`);
    }

    const { data: territory } = await getSupabaseAdmin()
      .from('site00_identity_territories')
      .select('id, status, project_id')
      .eq('id', approval.territoryId)
      .eq('project_id', resolved.project.id)
      .maybeSingle();

    if (!territory) {
      throw new Error(`Canon promotion blocked: territory ${approval.territoryId} not owned by project`);
    }

    if (territory.status === 'REJECTED') {
      throw new Error(`Canon promotion blocked: territory is REJECTED`);
    }

    if (!assertNoHostIdentityInClientCanon({ [approval.fieldKey]: approval.value })) {
      throw new Error(`Canon promotion blocked: host identity in field ${approval.fieldKey}`);
    }

    lineageSources.push({
      fieldKey: approval.fieldKey,
      territoryId: approval.territoryId,
      judgmentId: approval.sourceJudgmentId,
    });
  }

  const { data: existingVersion } = await getSupabaseAdmin()
    .from('site00_canon_records')
    .select('current_version')
    .eq('project_id', resolved.project.id)
    .eq('canon_type', 'IDENTITY')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const version = (existingVersion?.current_version ?? 0) + 1;

  const canonContent = {
    truthLayer: 'APPROVED_CANON',
    canonVersion: version,
    approvedFields: input.approvals.map((a) => ({
      fieldKey: a.fieldKey,
      hierarchyScope: a.hierarchyScope,
      value: a.value,
      sourceTerritoryId: a.territoryId,
      sourceJudgmentId: a.sourceJudgmentId,
    })),
    lineage: { promotedFrom: 'CREATIVE_EXPLORATION', approver: input.approver, sources: lineageSources },
  };

  const { data: canonRecord, error: canonErr } = await getSupabaseAdmin()
    .from('site00_canon_records')
    .insert({
      organization_id: orgId,
      project_id: resolved.project.id,
      canon_type: 'IDENTITY',
      title: `Identity Canon V${version} — ${resolved.project.displayName}`,
      content: canonContent,
      approval_state: 'APPROVED',
      current_version: version,
      metadata: { promotionSource: 'P0.E', fieldCount: input.approvals.length },
    })
    .select('id')
    .single();

  if (canonErr) throw canonErr;

  await getSupabaseAdmin().from('site00_canon_versions').insert({
    canon_id: canonRecord.id,
    version_number: version,
    content: canonContent,
    changed_by: input.approver,
    change_reason: version === 1 ? 'First identity canon promotion' : `Identity canon supersession V${version}`,
  });

  for (const approval of input.approvals) {
    const { data: fieldRecord, error: fieldErr } = await getSupabaseAdmin()
      .from('site00_canon_field_records')
      .insert({
        project_id: resolved.project.id,
        canon_type: 'IDENTITY',
        field_key: approval.fieldKey,
        hierarchy_scope: approval.hierarchyScope,
        scope_node_id: approval.scopeNodeId ?? null,
        field_value: approval.value ?? {},
        source_territory_id: approval.territoryId,
        source_judgment_id: approval.sourceJudgmentId,
        canon_record_id: canonRecord.id,
        canon_version: version,
        status: 'ACTIVE',
        approver: input.approver,
        lineage: {
          sourceTerritoryId: approval.territoryId,
          sourceJudgmentId: approval.sourceJudgmentId,
        },
      })
      .select('id')
      .single();

    if (fieldErr) throw fieldErr;
    promotedFieldIds.push(fieldRecord.id);
  }

  const { data: promotion } = await getSupabaseAdmin()
    .from('site00_identity_canon_promotions')
    .insert({
      project_id: resolved.project.id,
      canon_record_id: canonRecord.id,
      territory_id: input.approvals[0]?.territoryId ?? null,
      hierarchy_scope: 'MASTER',
      approved_fields: canonContent.approvedFields as unknown as Record<string, unknown>,
      version,
      approver: input.approver,
      lineage: canonContent.lineage,
    })
    .select('id')
    .single();

  const gate = await evaluateProjectIdentityGate(resolved.project.slug);

  await getSupabaseAdmin()
    .from('site00_identity_phases')
    .update({
      status: gate.satisfied ? 'COMPLETE' : 'PARTIALLY_APPROVED',
      updated_at: new Date().toISOString(),
    })
    .eq('project_id', resolved.project.id);

  if (gate.satisfied) {
    await getSupabaseAdmin()
      .from('site00_projects')
      .update({ status: 'IDENTITY_COMPLETE', updated_at: new Date().toISOString() })
      .eq('id', resolved.project.id)
      .eq('status', 'IDENTITY_IN_PROGRESS');
  }

  return {
    promotedFieldIds,
    canonRecordId: canonRecord.id,
    version,
    identityCanonGate: gate,
    ...(promotion ? {} : {}),
  };
}

export async function promoteStructuralWorldCanon(input: {
  projectIdOrSlug: string;
  approver: string;
  confirmations: Record<string, boolean>;
}) {
  if (isBlockedAutomatedApprover(input.approver)) {
    throw new Error('Structural canon promotion blocked: automated approvers not allowed');
  }

  const required = ['master_product_universe', 'astrea_flagship_district', 'astrea_destinations'];
  for (const key of required) {
    if (!input.confirmations[key]) {
      throw new Error(`Structural canon promotion blocked: ${key} not confirmed by founder`);
    }
  }

  const resolved = await resolveCanonicalProject({ slug: input.projectIdOrSlug, projectId: input.projectIdOrSlug });
  if (!resolved.ok) throw new Error(resolved.error.message);

  const orgId = resolved.project.organizationId;
  if (!orgId) throw new Error('Project has no organization_id');

  const hierarchy = await listWorldHierarchy(resolved.project.slug);
  const now = new Date().toISOString();

  for (const [key, confirmed] of Object.entries(input.confirmations)) {
    await getSupabaseAdmin().from('site00_world_structure_confirmations').upsert(
      {
        project_id: resolved.project.id,
        confirmation_key: key,
        confirmed,
        approver: confirmed ? input.approver : null,
        confirmed_at: confirmed ? now : null,
        metadata: { source: 'P0.E', founderExplicit: true },
      },
      { onConflict: 'project_id,confirmation_key' },
    );
  }

  for (const node of hierarchy) {
    await getSupabaseAdmin()
      .from('site00_world_hierarchy_nodes')
      .update({
        is_canonical: true,
        truth_layer: 'APPROVED_CANON',
        updated_at: now,
      })
      .eq('id', node.id)
      .eq('project_id', resolved.project.id);
  }

  const structureContent = {
    truthLayer: 'APPROVED_CANON',
    canonType: 'WORLD_STRUCTURE',
    masterBrand: ASTRAL_WORLD_HIERARCHY_SEED.world.displayName,
    masterRole: ASTRAL_WORLD_HIERARCHY_SEED.world.role,
    flagshipDistrict: ASTRAL_WORLD_HIERARCHY_SEED.district.displayName,
    districtRole: ASTRAL_WORLD_HIERARCHY_SEED.district.role,
    destinations: ASTRAL_WORLD_HIERARCHY_SEED.destinations.map((d) => d.displayName),
    expansionModel: ASTRAL_WORLD_FOUNDER_HIERARCHY_TRUTH.expansionModel,
    hierarchy: hierarchy.map((n) => ({
      type: n.node_type,
      slug: n.slug,
      name: n.display_name,
    })),
    note: 'Structural world canon only — NOT visual world formation',
    approver: input.approver,
    confirmations: input.confirmations,
  };

  const { data: canonRecord, error } = await getSupabaseAdmin()
    .from('site00_canon_records')
    .insert({
      organization_id: orgId,
      project_id: resolved.project.id,
      canon_type: 'WORLD_STRUCTURE',
      title: `World Structure Canon — ${resolved.project.displayName}`,
      content: structureContent,
      approval_state: 'APPROVED',
      current_version: 1,
      metadata: { promotionSource: 'P0.E', structuralOnly: true },
    })
    .select('id')
    .single();

  if (error) throw error;

  await getSupabaseAdmin().from('site00_canon_versions').insert({
    canon_id: canonRecord.id,
    version_number: 1,
    content: structureContent,
    changed_by: input.approver,
    change_reason: 'Structural world hierarchy canon — founder confirmed',
  });

  await getSupabaseAdmin().from('site00_canon_field_records').insert({
    project_id: resolved.project.id,
    canon_type: 'WORLD_STRUCTURE',
    field_key: 'worldStructureHierarchy',
    hierarchy_scope: 'MASTER',
    field_value: structureContent,
    canon_record_id: canonRecord.id,
    canon_version: 1,
    status: 'ACTIVE',
    approver: input.approver,
    lineage: { promotedFrom: 'CLIENT_FOUNDER_TRUTH', founderConfirmed: true },
  });

  return { canonRecordId: canonRecord.id, version: 1, nodeCount: hierarchy.length };
}

export async function evaluateProjectIdentityGate(projectIdOrSlug: string) {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) {
    return evaluateIdentityCanonGate(new Set(), false, false);
  }

  const { data: activeFields } = await getSupabaseAdmin()
    .from('site00_canon_field_records')
    .select('field_key')
    .eq('project_id', resolved.project.id)
    .eq('canon_type', 'IDENTITY')
    .eq('status', 'ACTIVE');

  const { count: structureCount } = await getSupabaseAdmin()
    .from('site00_canon_field_records')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', resolved.project.id)
    .eq('canon_type', 'WORLD_STRUCTURE')
    .eq('status', 'ACTIVE');

  const { count: masterRoleCount } = await getSupabaseAdmin()
    .from('site00_world_structure_confirmations')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', resolved.project.id)
    .eq('confirmation_key', 'master_product_universe')
    .eq('confirmed', true);

  return evaluateIdentityCanonGate(
    new Set((activeFields ?? []).map((f) => f.field_key)),
    (structureCount ?? 0) > 0,
    (masterRoleCount ?? 0) > 0,
  );
}

/** @deprecated Use promoteIdentityFields — unsafe whole-territory promotion */
export async function promoteIdentityToCanon(input: {
  projectIdOrSlug: string;
  territoryId: string;
  hierarchyScope: CanonHierarchyScope;
  scopeNodeId?: string | null;
  approvedFields: Record<string, unknown>;
  approver: string;
}): Promise<CanonPromotionResult> {
  throw new Error(
    'Unsafe whole-territory promotion blocked. Use canon_promote_fields with explicit field approvals.',
  );
}

export async function countCanonRecordsFromOrigin(projectIdOrSlug: string): Promise<number> {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) return 0;

  const { count } = await getSupabaseAdmin()
    .from('site00_canon_records')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', resolved.project.id)
    .in('canon_type', ['IDENTITY', 'WORLD_STRUCTURE'])
    .eq('approval_state', 'APPROVED');

  return count ?? 0;
}

export async function listActiveCanonFields(projectIdOrSlug: string) {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) return [];

  const { data } = await getSupabaseAdmin()
    .from('site00_canon_field_records')
    .select('*')
    .eq('project_id', resolved.project.id)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: true });

  return data ?? [];
}

export function canAutoCanonize(): false {
  return false;
}
