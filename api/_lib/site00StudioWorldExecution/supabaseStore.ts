/**
 * Supabase persistence for Studio World execution truth.
 */

import { getSupabaseAdmin } from '../supabase.js';
import type {
  CapabilityVerificationRecord,
  StudioWorldIdempotencyRecord,
  StudioWorldRunRecord,
} from '../../../shared/site00-studio-world-execution/types.js';
import {
  IdempotencyConflictError,
  StaleWriteConflictError,
} from '../../../shared/site00-studio-world-execution/errors.js';
import { NDXBOOK_ORG_ID } from '../site00Evolve/creativeDirection/creativeIntelligence/founderComparisonSet.js';

const RUNS = 'site00_studio_world_runs';
const IDEMPOTENCY = 'site00_studio_world_idempotency_keys';
const CAPABILITIES = 'site00_capability_verifications';

export async function studioWorldExecutionTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(RUNS).select('id').limit(1);
  return !error;
}

function runRow(record: StudioWorldRunRecord, organizationId = NDXBOOK_ORG_ID) {
  return {
    id: record.id,
    organization_id: organizationId,
    project_id: record.projectId,
    project_slug: record.projectSlug,
    brand_id: record.brandId,
    brand_slug: record.brandSlug,
    run_type: record.runType,
    run_subtype: record.runSubtype,
    methodology_domain: record.methodologyDomain,
    methodology_version: record.methodologyVersion,
    experiment_id: record.experimentId,
    experiment_version: record.experimentVersion,
    parent_run_id: record.parentRunId,
    root_run_id: record.rootRunId,
    idempotency_key: record.idempotencyKey,
    status: record.status,
    normalized_status: record.normalizedStatus,
    requested_by: record.requestedBy,
    trigger_type: record.triggerType,
    input_fingerprint: record.inputFingerprint,
    output_fingerprint: record.outputFingerprint,
    snapshot_id: record.snapshotId,
    snapshot_fingerprint: record.snapshotFingerprint,
    provider_summary: record.providerSummary,
    cost_summary: record.costSummary,
    error_summary: record.errorSummary,
    metadata: record.metadata,
    domain_record_type: record.domainRecordType,
    domain_record_id: record.domainRecordId,
    version: record.version,
    created_at: record.createdAt,
    started_at: record.startedAt,
    completed_at: record.completedAt,
    failed_at: record.failedAt,
    cancelled_at: record.cancelledAt,
    superseded_at: record.supersededAt,
    updated_at: record.updatedAt,
  };
}

function rowToRun(row: Record<string, unknown>): StudioWorldRunRecord {
  return {
    id: row.id as string,
    projectId: (row.project_id as string) ?? null,
    projectSlug: (row.project_slug as string) ?? null,
    brandId: (row.brand_id as string) ?? null,
    brandSlug: (row.brand_slug as string) ?? null,
    runType: row.run_type as StudioWorldRunRecord['runType'],
    runSubtype: (row.run_subtype as string) ?? null,
    methodologyDomain: (row.methodology_domain as string) ?? null,
    methodologyVersion: (row.methodology_version as string) ?? null,
    experimentId: (row.experiment_id as string) ?? null,
    experimentVersion: (row.experiment_version as string) ?? null,
    parentRunId: (row.parent_run_id as string) ?? null,
    rootRunId: (row.root_run_id as string) ?? null,
    idempotencyKey: (row.idempotency_key as string) ?? null,
    status: row.status as string,
    normalizedStatus: row.normalized_status as StudioWorldRunRecord['normalizedStatus'],
    requestedBy: (row.requested_by as string) ?? null,
    triggerType: (row.trigger_type as string) ?? null,
    createdAt: row.created_at as string,
    startedAt: (row.started_at as string) ?? null,
    completedAt: (row.completed_at as string) ?? null,
    failedAt: (row.failed_at as string) ?? null,
    cancelledAt: (row.cancelled_at as string) ?? null,
    supersededAt: (row.superseded_at as string) ?? null,
    inputFingerprint: (row.input_fingerprint as string) ?? null,
    outputFingerprint: (row.output_fingerprint as string) ?? null,
    snapshotId: (row.snapshot_id as string) ?? null,
    snapshotFingerprint: (row.snapshot_fingerprint as string) ?? null,
    providerSummary: (row.provider_summary as StudioWorldRunRecord['providerSummary']) ?? {},
    costSummary: (row.cost_summary as StudioWorldRunRecord['costSummary']) ?? {},
    errorSummary: (row.error_summary as StudioWorldRunRecord['errorSummary']) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    domainRecordType: (row.domain_record_type as string) ?? null,
    domainRecordId: (row.domain_record_id as string) ?? null,
    version: (row.version as number) ?? 1,
    updatedAt: row.updated_at as string,
  };
}

export async function saveStudioWorldRun(record: StudioWorldRunRecord): Promise<StudioWorldRunRecord> {
  const { error } = await getSupabaseAdmin().from(RUNS).upsert(runRow(record), { onConflict: 'id' });
  if (error) throw new Error(error.message);
  return record;
}

export async function getStudioWorldRunById(id: string): Promise<StudioWorldRunRecord | null> {
  const { data, error } = await getSupabaseAdmin().from(RUNS).select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return rowToRun(data);
}

export async function listStudioWorldRuns(params: {
  projectSlug?: string;
  runType?: string;
  limit?: number;
}): Promise<StudioWorldRunRecord[]> {
  let query = getSupabaseAdmin().from(RUNS).select('*').order('created_at', { ascending: false });
  if (params.projectSlug) query = query.eq('project_slug', params.projectSlug);
  if (params.runType) query = query.eq('run_type', params.runType);
  query = query.limit(params.limit ?? 50);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => rowToRun(row));
}

export async function saveStudioWorldRunWithVersionCheck(
  record: StudioWorldRunRecord,
  expectedVersion: number,
): Promise<StudioWorldRunRecord> {
  const next = { ...record, version: expectedVersion + 1, updatedAt: new Date().toISOString() };
  const { data, error } = await getSupabaseAdmin()
    .from(RUNS)
    .update(runRow(next))
    .eq('id', record.id)
    .eq('version', expectedVersion)
    .select('*')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    const existing = await getStudioWorldRunById(record.id);
    throw new StaleWriteConflictError(
      `Stale write on run ${record.id}`,
      expectedVersion,
      existing?.version ?? -1,
    );
  }
  return rowToRun(data);
}

export async function registerIdempotencyKey(
  record: Omit<StudioWorldIdempotencyRecord, 'id' | 'createdAt'>,
): Promise<StudioWorldIdempotencyRecord> {
  const existing = await findIdempotencyKey({
    projectSlug: record.projectSlug,
    idempotencyKey: record.idempotencyKey,
    inputFingerprint: record.inputFingerprint,
  });
  if (existing) {
    throw new IdempotencyConflictError(
      `Idempotency key already registered: ${record.idempotencyKey}`,
      existing.runId,
    );
  }
  const row = {
    organization_id: NDXBOOK_ORG_ID,
    project_id: record.projectId,
    project_slug: record.projectSlug,
    idempotency_key: record.idempotencyKey,
    input_fingerprint: record.inputFingerprint,
    run_id: record.runId,
    run_type: record.runType,
  };
  const { data, error } = await getSupabaseAdmin().from(IDEMPOTENCY).insert(row).select('*').single();
  if (error) {
    if (error.code === '23505') {
      const found = await findIdempotencyKey({
        projectSlug: record.projectSlug,
        idempotencyKey: record.idempotencyKey,
        inputFingerprint: record.inputFingerprint,
      });
      if (found) {
        throw new IdempotencyConflictError(`Idempotency key conflict: ${record.idempotencyKey}`, found.runId);
      }
    }
    throw new Error(error.message);
  }
  return {
    id: data.id,
    projectId: data.project_id,
    projectSlug: data.project_slug,
    idempotencyKey: data.idempotency_key,
    inputFingerprint: data.input_fingerprint,
    runId: data.run_id,
    runType: data.run_type,
    createdAt: data.created_at,
  };
}

export async function findIdempotencyKey(params: {
  projectSlug: string | null;
  idempotencyKey: string;
  inputFingerprint: string;
}): Promise<StudioWorldIdempotencyRecord | null> {
  let query = getSupabaseAdmin()
    .from(IDEMPOTENCY)
    .select('*')
    .eq('idempotency_key', params.idempotencyKey)
    .eq('input_fingerprint', params.inputFingerprint);
  if (params.projectSlug) {
    query = query.eq('project_slug', params.projectSlug);
  }
  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    projectId: data.project_id,
    projectSlug: data.project_slug,
    idempotencyKey: data.idempotency_key,
    inputFingerprint: data.input_fingerprint,
    runId: data.run_id,
    runType: data.run_type,
    createdAt: data.created_at,
  };
}

export async function upsertCapabilityVerification(
  record: CapabilityVerificationRecord,
): Promise<CapabilityVerificationRecord> {
  const row = {
    capability_id: record.capabilityId,
    environment: record.environment,
    implementation_status: record.implementationStatus,
    verification_status: record.verificationStatus,
    verified_at: record.verifiedAt,
    verification_method: record.verificationMethod,
    verification_run_id: record.verificationRunId,
    source_commit: record.sourceCommit,
    notes: record.notes,
    updated_at: record.updatedAt,
  };
  const { error } = await getSupabaseAdmin()
    .from(CAPABILITIES)
    .upsert(row, { onConflict: 'capability_id,environment' });
  if (error) throw new Error(error.message);
  return record;
}

export async function listCapabilityVerifications(): Promise<CapabilityVerificationRecord[]> {
  const { data, error } = await getSupabaseAdmin().from(CAPABILITIES).select('*');
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    capabilityId: row.capability_id,
    environment: row.environment,
    implementationStatus: row.implementation_status,
    verificationStatus: row.verification_status,
    verifiedAt: row.verified_at,
    verificationMethod: row.verification_method,
    verificationRunId: row.verification_run_id,
    sourceCommit: row.source_commit,
    notes: row.notes,
    updatedAt: row.updated_at,
  }));
}
