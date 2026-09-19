/**
 * In-memory Core Direction Formation store — tests only.
 */

import type { CoreDirectionFormationRecord } from '../types.js';

const byIdempotency = new Map<string, CoreDirectionFormationRecord>();
const byId = new Map<string, CoreDirectionFormationRecord>();

export function resetFormationMemoryStore(): void {
  byIdempotency.clear();
  byId.clear();
}

export async function saveFormationRecord(record: CoreDirectionFormationRecord): Promise<CoreDirectionFormationRecord> {
  byIdempotency.set(record.idempotencyKey, record);
  byId.set(record.formationId, record);
  return record;
}

export async function getFormationRecordByIdempotencyKey(
  idempotencyKey: string,
): Promise<CoreDirectionFormationRecord | null> {
  return byIdempotency.get(idempotencyKey) ?? null;
}

export async function getFormationRecordById(formationId: string): Promise<CoreDirectionFormationRecord | null> {
  return byId.get(formationId) ?? null;
}

export async function listFormationRecordsByOrganizationId(
  organizationId: string,
): Promise<CoreDirectionFormationRecord[]> {
  return [...byIdempotency.values()]
    .filter((r) => r.organizationId === organizationId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
