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
): Promise<BrandPersonalityReplayRecord[]> {
  return [...records.values()]
    .filter((r) => r.organizationId === organizationId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
