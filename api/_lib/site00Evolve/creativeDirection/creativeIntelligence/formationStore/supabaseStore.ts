/**
 * Supabase-backed Core Direction Formation store — durable system of record.
 */

import { getSupabaseAdmin } from '../../../../supabase.js';
import type { CoreDirectionFormationRecord } from '../types.js';

const TABLE = 'site00_core_direction_formations';

type Row = {
  id: string;
  organization_id: string;
  project_id: string | null;
  engagement_id: string | null;
  brand_lore_profile_id: string;
  brand_lore_profile_version: number;
  brand_lore_fingerprint: string;
  formation_version: number;
  prompt_version: string;
  provider_id: string;
  model_id: string;
  status: string;
  formation_input: unknown;
  candidate_directions: unknown;
  critic_result: unknown;
  revision_rounds: number;
  final_directions: unknown;
  visual_proof_plans: unknown;
  idempotency_key: string;
  request_count: number;
  token_usage: unknown;
  cost_metadata: unknown;
  record: unknown;
  error_code: string | null;
  error_message_safe: string | null;
  started_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: Row): CoreDirectionFormationRecord {
  const embedded = row.record as CoreDirectionFormationRecord | null;
  if (embedded?.formationId) return embedded;
  return {
    formationId: row.id,
    organizationId: row.organization_id,
    projectId: row.project_id,
    engagementId: row.engagement_id,
    brandLoreProfileId: row.brand_lore_profile_id,
    brandLoreProfileVersion: row.brand_lore_profile_version,
    brandLoreFingerprint: row.brand_lore_fingerprint,
    formationVersion: row.formation_version,
    providerId: row.provider_id,
    modelId: row.model_id,
    promptVersion: row.prompt_version,
    status: row.status as CoreDirectionFormationRecord['status'],
    idempotencyKey: row.idempotency_key,
    formationInput: (row.formation_input ?? null) as CoreDirectionFormationRecord['formationInput'],
    candidateDirections: (row.candidate_directions ?? []) as CoreDirectionFormationRecord['candidateDirections'],
    criticResult: (row.critic_result ?? null) as CoreDirectionFormationRecord['criticResult'],
    revisionRounds: row.revision_rounds,
    finalDirections: (row.final_directions ?? []) as CoreDirectionFormationRecord['finalDirections'],
    visualProofPlans: (row.visual_proof_plans ?? []) as CoreDirectionFormationRecord['visualProofPlans'],
    legacyStaticPreview: 'PRESERVED',
    proposedFormationLabel: 'PROPOSED_FORMATION',
    providerAccounting: {
      providerId: row.provider_id,
      modelId: row.model_id,
      requestCount: row.request_count,
      revisionCount: embedded?.providerAccounting?.revisionCount ?? 0,
      formationRequests: embedded?.providerAccounting?.formationRequests ?? 0,
      critiqueRequests: embedded?.providerAccounting?.critiqueRequests ?? 0,
      reviseRequests: embedded?.providerAccounting?.reviseRequests ?? 0,
      tokenUsage: (row.token_usage ?? {}) as CoreDirectionFormationRecord['providerAccounting']['tokenUsage'],
    },
    error: row.error_message_safe,
    errorCode: row.error_code,
    createdAt: row.created_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    failedAt: row.failed_at,
    updatedAt: row.updated_at,
  };
}

function toColumns(record: CoreDirectionFormationRecord): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    organization_id: record.organizationId,
    project_id: record.projectId,
    engagement_id: record.engagementId ?? null,
    brand_lore_profile_id: record.brandLoreProfileId,
    brand_lore_profile_version: record.brandLoreProfileVersion,
    brand_lore_fingerprint: record.brandLoreFingerprint,
    formation_version: record.formationVersion,
    prompt_version: record.promptVersion,
    provider_id: record.providerId,
    model_id: record.modelId,
    status: record.status,
    formation_input: record.formationInput ?? {},
    candidate_directions: record.candidateDirections,
    critic_result: record.criticResult,
    revision_rounds: record.revisionRounds,
    final_directions: record.finalDirections,
    visual_proof_plans: record.visualProofPlans,
    idempotency_key: record.idempotencyKey,
    request_count: record.providerAccounting.requestCount,
    token_usage: record.providerAccounting.tokenUsage,
    cost_metadata: {
      estimatedCostUsd: record.providerAccounting.tokenUsage.estimatedCostUsd ?? null,
    },
    record,
    error_code: record.errorCode ?? null,
    error_message_safe: record.error ?? null,
    started_at: record.startedAt ?? null,
    completed_at: record.completedAt ?? null,
    failed_at: record.failedAt ?? null,
    updated_at: now,
  };
}

export async function saveFormationRecord(record: CoreDirectionFormationRecord): Promise<CoreDirectionFormationRecord> {
  const { data: existing, error: findErr } = await getSupabaseAdmin()
    .from(TABLE)
    .select('id, created_at')
    .eq('idempotency_key', record.idempotencyKey)
    .maybeSingle();
  if (findErr) throw findErr;

  const columns = toColumns(record);
  if (existing) {
    const { data, error } = await getSupabaseAdmin()
      .from(TABLE)
      .update(columns)
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error || !data) throw error ?? new Error('FAILED TO UPDATE FORMATION RECORD');
    return mapRow(data as Row);
  }

  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .insert({
      id: record.formationId,
      created_at: record.createdAt,
      ...columns,
    })
    .select('*')
    .single();
  if (error || !data) throw error ?? new Error('FAILED TO CREATE FORMATION RECORD');
  return mapRow(data as Row);
}

export async function getFormationRecordByIdempotencyKey(
  idempotencyKey: string,
): Promise<CoreDirectionFormationRecord | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : null;
}

export async function getFormationRecordById(formationId: string): Promise<CoreDirectionFormationRecord | null> {
  const { data, error } = await getSupabaseAdmin().from(TABLE).select('*').eq('id', formationId).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : null;
}

export async function listFormationRecordsByOrganizationId(
  organizationId: string,
): Promise<CoreDirectionFormationRecord[]> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as Row));
}

export async function formationTablesExist(): Promise<boolean> {
  try {
    const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
