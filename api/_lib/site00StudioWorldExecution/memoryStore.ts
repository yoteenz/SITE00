/**
 * In-memory Studio World execution store (tests only).
 */

import type {
  CapabilityVerificationRecord,
  StudioWorldIdempotencyRecord,
  StudioWorldRunRecord,
} from '../../../shared/site00-studio-world-execution/types.js';

const runs = new Map<string, StudioWorldRunRecord>();
const idempotency = new Map<string, StudioWorldIdempotencyRecord>();
const capabilities = new Map<string, CapabilityVerificationRecord>();

function idempotencyMapKey(projectSlug: string | null, key: string, fingerprint: string): string {
  return `${projectSlug ?? '_global'}:${key}:${fingerprint}`;
}

export async function studioWorldExecutionTablesExist(): Promise<boolean> {
  return true;
}

export async function saveStudioWorldRun(record: StudioWorldRunRecord): Promise<StudioWorldRunRecord> {
  runs.set(record.id, record);
  return record;
}

export async function getStudioWorldRunById(id: string): Promise<StudioWorldRunRecord | null> {
  return runs.get(id) ?? null;
}

export async function listStudioWorldRuns(params: {
  projectSlug?: string;
  runType?: string;
  limit?: number;
}): Promise<StudioWorldRunRecord[]> {
  let list = [...runs.values()];
  if (params.projectSlug) list = list.filter((r) => r.projectSlug === params.projectSlug);
  if (params.runType) list = list.filter((r) => r.runType === params.runType);
  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return list.slice(0, params.limit ?? 50);
}

export async function saveStudioWorldRunWithVersionCheck(
  record: StudioWorldRunRecord,
  expectedVersion: number,
): Promise<StudioWorldRunRecord> {
  const existing = runs.get(record.id);
  if (existing && existing.version !== expectedVersion) {
    const { StaleWriteConflictError } = await import('../../../shared/site00-studio-world-execution/errors.js');
    throw new StaleWriteConflictError(
      `Stale write on run ${record.id}`,
      expectedVersion,
      existing.version,
    );
  }
  const next = { ...record, version: (existing?.version ?? expectedVersion) + 1 };
  runs.set(record.id, next);
  return next;
}

export async function registerIdempotencyKey(
  record: Omit<StudioWorldIdempotencyRecord, 'id' | 'createdAt'>,
): Promise<StudioWorldIdempotencyRecord> {
  const mapKey = idempotencyMapKey(record.projectSlug, record.idempotencyKey, record.inputFingerprint);
  const existing = idempotency.get(mapKey);
  if (existing) {
    const { IdempotencyConflictError } = await import('../../../shared/site00-studio-world-execution/errors.js');
    throw new IdempotencyConflictError(
      `Idempotency key already registered: ${record.idempotencyKey}`,
      existing.runId,
    );
  }
  const saved: StudioWorldIdempotencyRecord = {
    ...record,
    id: `idem-${mapKey}`,
    createdAt: new Date().toISOString(),
  };
  idempotency.set(mapKey, saved);
  return saved;
}

export async function findIdempotencyKey(params: {
  projectSlug: string | null;
  idempotencyKey: string;
  inputFingerprint: string;
}): Promise<StudioWorldIdempotencyRecord | null> {
  const mapKey = idempotencyMapKey(params.projectSlug, params.idempotencyKey, params.inputFingerprint);
  return idempotency.get(mapKey) ?? null;
}

export async function upsertCapabilityVerification(
  record: CapabilityVerificationRecord,
): Promise<CapabilityVerificationRecord> {
  capabilities.set(`${record.capabilityId}:${record.environment}`, record);
  return record;
}

export async function listCapabilityVerifications(): Promise<CapabilityVerificationRecord[]> {
  return [...capabilities.values()];
}

export function resetStudioWorldExecutionMemory(): void {
  runs.clear();
  idempotency.clear();
  capabilities.clear();
}
