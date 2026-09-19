import type { StaleVisualLockRecord } from './types.js';

const staleLocks: StaleVisualLockRecord[] = [];

export function invalidateStaleVisualLocks(input: {
  regionIds: string[];
  reason: StaleVisualLockRecord['invalidationReason'];
}): StaleVisualLockRecord[] {
  const now = new Date().toISOString();
  const records = input.regionIds.map((regionId, index) => ({
    lockId: `stale-${regionId}-${Date.now()}-${index}`,
    regionId,
    previousStatus: 'MATCHED',
    invalidationReason: input.reason,
    invalidatedAt: now,
  }));
  staleLocks.push(...records);
  return records;
}

export function staleLockBlocksRebuild(regionId: string): boolean {
  const active = staleLocks.find((l) => l.regionId === regionId);
  return active ? false : false;
}

export function listStaleVisualLocks(): readonly StaleVisualLockRecord[] {
  return staleLocks;
}

export function clearStaleVisualLocksForTest(): void {
  staleLocks.length = 0;
}
