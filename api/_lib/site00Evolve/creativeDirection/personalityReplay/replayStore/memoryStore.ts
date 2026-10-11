/**
 * In-memory store for methodology validation replay records (tests + dev).
 */

import type { BrandPersonalityReplayRecord } from '../../../../../shared/site00-brand-lore/personalityReplayTypes.js';

const records = new Map<string, BrandPersonalityReplayRecord>();

export function resetPersonalityReplayMemoryStore(): void {
  records.clear();
}

export async function savePersonalityReplayRecord(
  record: BrandPersonalityReplayRecord,
): Promise<BrandPersonalityReplayRecord> {
  records.set(record.replayId, record);
  return record;
}

export async function getPersonalityReplayRecord(replayId: string): Promise<BrandPersonalityReplayRecord | null> {
  return records.get(replayId) ?? null;
}

export async function listPersonalityReplayRecordsForOrg(
  organizationId: string,
  options?: { limit?: number; mode?: string },
): Promise<BrandPersonalityReplayRecord[]> {
  const limit = options?.limit ?? 100;
  return [...records.values()]
    .filter((r) => r.organizationId === organizationId)
    .filter((r) => !options?.mode || r.mode === options.mode)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}
