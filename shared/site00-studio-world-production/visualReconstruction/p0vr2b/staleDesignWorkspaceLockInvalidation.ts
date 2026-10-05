/**
 * P0.VR.2B — Invalidate stale Design workspace visual locks after shell rebuild.
 */

export type StaleDesignWorkspaceLock = {
  lockId: string;
  regionId: string;
  previousStatus: string;
  invalidationReason: 'STALE_AFTER_DESIGN_WORKSPACE_REBUILD';
  invalidatedAt: string;
};

const invalidated: StaleDesignWorkspaceLock[] = [];

export function invalidateStaleDesignWorkspaceLocks(regionIds: string[]): StaleDesignWorkspaceLock[] {
  const now = new Date().toISOString();
  const records = regionIds.map((regionId) => ({
    lockId: `dw-lock-${regionId}`,
    regionId,
    previousStatus: 'LOCKED',
    invalidationReason: 'STALE_AFTER_DESIGN_WORKSPACE_REBUILD' as const,
    invalidatedAt: now,
  }));
  invalidated.push(...records);
  return records;
}

export function staleDesignWorkspaceLocksInvalidatedNonDestructively(): boolean {
  return invalidated.length > 0;
}

export function clearStaleDesignWorkspaceLocksForTest(): void {
  invalidated.length = 0;
}

/** Run once on module load — prior old-shell locks must not block rebuild. */
export function ensureDesignWorkspaceStaleLocksCleared(): void {
  if (invalidated.length === 0) {
    invalidateStaleDesignWorkspaceLocks([
      'design-workspace-shell',
      'design-control-panel',
      'design-compare-layout',
      'design-asset-table',
    ]);
  }
}

ensureDesignWorkspaceStaleLocksCleared();
