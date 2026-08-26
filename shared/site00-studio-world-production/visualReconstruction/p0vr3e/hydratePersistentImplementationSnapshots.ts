/**
 * P0.VR.3J.1 — Hydrate in-memory P0.VR.3E registry from persistent metadata + storage.
 */

import { registerImplementationSnapshot, getLatestImplementationSnapshot } from './implementationSnapshotRegistry.js';
import type { ImplementationSnapshotRecord } from './types.js';
import {
  loadPersistentImplementationSnapshotRegistry,
  resolveLatestPersistentSnapshots,
  type ImplementationSnapshotPersistentRegistry,
} from './implementationSnapshotPersistentStore.js';
import { buildComposerDraftCaptureTargets } from '../p0vr3h/composerDraftSnapshots.js';
import { buildSnapshotRegistryHealth, type SnapshotRegistryHealth } from '../p0vr3j/snapshotRegistryHealth.js';

export type HydratePersistentSnapshotsResult = {
  registry: ImplementationSnapshotPersistentRegistry;
  health: SnapshotRegistryHealth;
  hydrated: number;
  reused: number;
  storageMissing: number;
  orphaned: number;
};

function resolveHydratedPublicUrl(record: ImplementationSnapshotRecord): ImplementationSnapshotRecord {
  if (!record.storagePath) return record;
  if (record.publicUrl.startsWith('https://cdn.site00.com/') || record.publicUrl.startsWith('https://vitest.local/')) {
    try {
      const { getSite00AssetPublicUrl } = require('../../../../api/_lib/site00Assts/storage.js') as typeof import('../../../../api/_lib/site00Assts/storage.js');
      return { ...record, publicUrl: getSite00AssetPublicUrl(record.storagePath) };
    } catch {
      return record;
    }
  }
  return record;
}

export function clearHydrationCacheForTest(): void {
  hydratedOnce.clear();
}

export async function hydratePersistentImplementationSnapshots(input?: {
  repoRoot?: string;
  verifyStorage?: boolean;
  force?: boolean;
}): Promise<HydratePersistentSnapshotsResult> {
  const repoRoot = input?.repoRoot ?? process.cwd();
  const cacheKey = repoRoot;

  const registry = loadPersistentImplementationSnapshotRegistry(repoRoot);
  if (!input?.force && hydratedOnce.has(cacheKey)) {
    return {
      registry,
      health: buildSnapshotRegistryHealth(repoRoot),
      hydrated: resolveLatestPersistentSnapshots(registry).size,
      reused: 0,
      storageMissing: 0,
      orphaned: 0,
    };
  }

  const latest = resolveLatestPersistentSnapshots(registry);
  const composerScreenIds = new Set(buildComposerDraftCaptureTargets().map((t) => t.screenId));

  let storageMissing = 0;
  let orphaned = 0;

  for (const record of latest.values()) {
    const existing = getLatestImplementationSnapshot(
      record.projectId,
      record.designScreenId,
      record.viewportClass,
      record.visualStateId,
    );
    if (existing?.captureStatus === 'CURRENT' && existing.qaPassed) {
      const existingTime = Date.parse(existing.capturedAt);
      const incomingTime = Date.parse(record.capturedAt);
      if (!Number.isNaN(existingTime) && !Number.isNaN(incomingTime) && existingTime >= incomingTime) {
        continue;
      }
    }
    registerImplementationSnapshot(record);
  }

  for (const record of latest.values()) {
    let status: ImplementationSnapshotRecord = record;
    if (input?.verifyStorage && record.storagePath && process.env.VITEST !== 'true') {
      try {
        const { site00StorageObjectExists } = await import('../../../../api/_lib/site00Assts/storage.js');
        const exists = await site00StorageObjectExists(record.storagePath);
        if (!exists && record.captureStatus === 'CURRENT') {
          storageMissing++;
          status = { ...record, captureStatus: 'MISSING', error: 'STORAGE_MISSING' };
          registerImplementationSnapshot(status);
        }
      } catch {
        /* storage check unavailable */
      }
    }
    if (!composerScreenIds.has(record.designScreenId)) orphaned++;
  }

  hydratedOnce.add(cacheKey);

  const health = buildSnapshotRegistryHealth(repoRoot, { storageMissing, orphaned });
  return {
    registry,
    health,
    hydrated: latest.size,
    reused: health.persistentReused,
    storageMissing,
    orphaned,
  };
}
