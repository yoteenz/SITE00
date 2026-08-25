/**
 * Identity judgment service — field-level judgments, review state, verification (P0.E)
 */

import { getSupabaseAdmin } from '../../supabase.js';
import { resolveCanonicalProject } from '../canonicalProject.js';
import { listIdentityTerritories } from './identityPhaseService.js';
import { listWorldHierarchy } from './worldHierarchyService.js';
import { assertNoHostIdentityInClientCanon } from '../../../../shared/site00-identity/hostFirewall.js';
import {
  IDENTITY_CANON_FIELD_KEYS,
  TERRITORY_PAYLOAD_TO_FIELD,
  isBlockedAutomatedApprover,
  extractFieldValueFromTerritoryPayload,
  type IdentityCanonFieldKey,
  type FieldJudgmentValue,
} from '../../../../shared/site00-identity/identityFields.js';
import type { CanonHierarchyScope } from '../../../../shared/site00-identity/types.js';

export type TerritoryVerificationResult = {
  territoryId: string;
  territoryKey: string;
  workingLabel: string;
  status: string;
  strategicPremise: string;
  payload: Record<string, unknown>;
  creativeHypotheses: unknown[];
  sourceTruthRefCount: number;
  valid: boolean;
  issues: string[];
};

export type IdentityReviewState = {
  projectSlug: string;
  projectStatus: string;
  founderJudgmentState: 'AWAITING_FOUNDER_JUDGMENT' | 'JUDGMENT_IN_PROGRESS' | 'READY_FOR_PROMOTION' | 'PARTIALLY_PROMOTED';
  territoryCount: number;
  territories: TerritoryVerificationResult[];
  fieldJudgmentCount: number;
  structuralConfirmations: Record<string, boolean>;
  canonFieldCount: number;
  identityCanonVersion: number | null;
};

export async function verifyIdentityTerritories(projectIdOrSlug: string): Promise<TerritoryVerificationResult[]> {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) return [];

  const territories = await listIdentityTerritories(projectIdOrSlug);
  const results: TerritoryVerificationResult[] = [];

  for (const t of territories) {
    const issues: string[] = [];
    const payload = (t.payload ?? {}) as Record<string, unknown>;
    const sourceRefs = (t.source_truth_refs ?? []) as string[];

    if (['PROMOTED', 'PROMOTED_PARTIAL'].includes(t.status)) {
      issues.push('Territory already has canon promotion — verify lineage');
    }
    if (!t.strategic_premise || t.strategic_premise.length < 20) {
      issues.push('Strategic premise missing or too short');
    }
    if (!assertNoHostIdentityInClientCanon(payload)) {
      issues.push('Host identity leak detected in payload');
    }
    const serialized = JSON.stringify(t).toLowerCase();
    if (serialized.includes('ndxbook')) {
      issues.push('NDXBOOK contamination detected');
    }

    results.push({
      territoryId: t.id,
      territoryKey: t.territory_key,
      workingLabel: t.working_label,
      status: t.status,
      strategicPremise: t.strategic_premise,
      payload,
      creativeHypotheses: (t.creative_hypotheses ?? []) as unknown[],
      sourceTruthRefCount: sourceRefs.length,
      valid: issues.length === 0,
      issues,
    });
  }

  return results;
}

export async function getIdentityReviewState(projectIdOrSlug: string): Promise<IdentityReviewState> {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) throw new Error(resolved.error.message);

  const territories = await verifyIdentityTerritories(projectIdOrSlug);

  const { count: fieldJudgmentCount } = await getSupabaseAdmin()
    .from('site00_identity_field_judgments')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', resolved.project.id)
    .neq('judgment', 'UNREVIEWED');

  const { data: confirmations } = await getSupabaseAdmin()
    .from('site00_world_structure_confirmations')
    .select('confirmation_key, confirmed')
    .eq('project_id', resolved.project.id);

  const structuralConfirmations: Record<string, boolean> = {};
  for (const c of confirmations ?? []) {
    structuralConfirmations[c.confirmation_key] = c.confirmed;
  }

  const { count: canonFieldCount } = await getSupabaseAdmin()
    .from('site00_canon_field_records')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', resolved.project.id)
    .eq('status', 'ACTIVE');

  const { data: canonRecords } = await getSupabaseAdmin()
    .from('site00_canon_records')
    .select('current_version')
    .eq('project_id', resolved.project.id)
    .eq('approval_state', 'APPROVED')
    .order('created_at', { ascending: false })
    .limit(1);

  const approveCount = fieldJudgmentCount ?? 0;
  const promoted = (canonFieldCount ?? 0) > 0;

  let founderJudgmentState: IdentityReviewState['founderJudgmentState'] = 'AWAITING_FOUNDER_JUDGMENT';
  if (approveCount > 0 && !promoted) founderJudgmentState = 'READY_FOR_PROMOTION';
  else if (approveCount > 0) founderJudgmentState = 'JUDGMENT_IN_PROGRESS';
  else if (promoted) founderJudgmentState = 'PARTIALLY_PROMOTED';

  return {
    projectSlug: resolved.project.slug,
    projectStatus: resolved.project.status,
    founderJudgmentState,
    territoryCount: territories.length,
    territories,
    fieldJudgmentCount: approveCount,
    structuralConfirmations,
    canonFieldCount: canonFieldCount ?? 0,
    identityCanonVersion: canonRecords?.[0]?.current_version ?? null,
  };
}

export async function recordFieldJudgment(input: {
  projectIdOrSlug: string;
  territoryId: string;
  fieldKey: IdentityCanonFieldKey;
  judgment: FieldJudgmentValue;
  hierarchyScope?: CanonHierarchyScope;
  scopeNodeId?: string | null;
  approver: string;
  notes?: string;
  founderCritique?: string;
  requestedChange?: string;
}) {
  if (isBlockedAutomatedApprover(input.approver)) {
    throw new Error('Field judgment blocked: automated/system approvers cannot record founder judgment');
  }

  if (!IDENTITY_CANON_FIELD_KEYS.includes(input.fieldKey)) {
    throw new Error(`Unknown field key: ${input.fieldKey}`);
  }

  const resolved = await resolveCanonicalProject({ slug: input.projectIdOrSlug, projectId: input.projectIdOrSlug });
  if (!resolved.ok) throw new Error(resolved.error.message);

  const { data: territory } = await getSupabaseAdmin()
    .from('site00_identity_territories')
    .select('*')
    .eq('id', input.territoryId)
    .eq('project_id', resolved.project.id)
    .maybeSingle();

  if (!territory) throw new Error('Territory not found for project');

  const payload = (territory.payload ?? {}) as Record<string, unknown>;
  const fieldValue = extractFieldValueFromTerritoryPayload(payload, input.fieldKey);

  if (fieldValue !== null && !assertNoHostIdentityInClientCanon({ [input.fieldKey]: fieldValue })) {
    throw new Error('Field judgment blocked: host identity leak in field value');
  }

  const { data: judgment, error } = await getSupabaseAdmin()
    .from('site00_identity_field_judgments')
    .insert({
      project_id: resolved.project.id,
      territory_id: input.territoryId,
      field_key: input.fieldKey,
      hierarchy_scope: input.hierarchyScope ?? 'MASTER',
      scope_node_id: input.scopeNodeId ?? null,
      judgment: input.judgment,
      field_value: fieldValue,
      approver: input.approver,
      notes: input.notes ?? null,
      metadata: { recordedAt: new Date().toISOString(), source: 'P0.E' },
    })
    .select('*')
    .single();

  if (error) throw error;

  if (input.judgment === 'REVISE') {
    await getSupabaseAdmin().from('site00_identity_revision_targets').insert({
      project_id: resolved.project.id,
      territory_id: input.territoryId,
      field_key: input.fieldKey,
      hierarchy_scope: input.hierarchyScope ?? 'MASTER',
      scope_node_id: input.scopeNodeId ?? null,
      original_value: fieldValue ?? {},
      founder_critique: input.founderCritique ?? input.notes ?? null,
      requested_change: input.requestedChange ?? null,
      source_judgment_id: judgment.id,
      lineage: { territoryKey: territory.territory_key, preservedOriginal: true },
    });
  }

  const phaseStatus = input.judgment === 'UNREVIEWED' ? 'AWAITING_FOUNDER_JUDGMENT' : 'AWAITING_REVIEW';
  await getSupabaseAdmin()
    .from('site00_identity_phases')
    .update({ status: phaseStatus, updated_at: new Date().toISOString() })
    .eq('project_id', resolved.project.id);

  return judgment;
}

export async function listFieldJudgments(projectIdOrSlug: string) {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) return [];

  const { data } = await getSupabaseAdmin()
    .from('site00_identity_field_judgments')
    .select('*')
    .eq('project_id', resolved.project.id)
    .order('created_at', { ascending: false });

  return data ?? [];
}

export async function listRevisionTargets(projectIdOrSlug: string) {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) return [];

  const { data } = await getSupabaseAdmin()
    .from('site00_identity_revision_targets')
    .select('*')
    .eq('project_id', resolved.project.id)
    .eq('status', 'OPEN');

  return data ?? [];
}

export async function listRejectedTerritories(projectIdOrSlug: string) {
  const territories = await listIdentityTerritories(projectIdOrSlug);
  return territories.filter((t) => t.status === 'REJECTED');
}

export function territoryReviewFields(payload: Record<string, unknown>): Array<{
  fieldKey: IdentityCanonFieldKey;
  label: string;
  value: unknown;
}> {
  const fields: Array<{ fieldKey: IdentityCanonFieldKey; label: string; value: unknown }> = [];
  for (const [payloadKey, fieldKey] of Object.entries(TERRITORY_PAYLOAD_TO_FIELD)) {
    if (payload[payloadKey] !== undefined) {
      fields.push({
        fieldKey,
        label: payloadKey.replace(/([A-Z])/g, ' $1').trim(),
        value: payload[payloadKey],
      });
    }
  }
  return fields;
}

export async function ensureAwaitingFounderJudgment(projectIdOrSlug: string) {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) return;

  const { data: phase } = await getSupabaseAdmin()
    .from('site00_identity_phases')
    .select('id, status')
    .eq('project_id', resolved.project.id)
    .maybeSingle();

  if (phase && phase.status === 'IN_PROGRESS') {
    await getSupabaseAdmin()
      .from('site00_identity_phases')
      .update({ status: 'AWAITING_FOUNDER_JUDGMENT', updated_at: new Date().toISOString() })
      .eq('id', phase.id);
  }
}
