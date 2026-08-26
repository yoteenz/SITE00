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

async function resolveHydratedPublicUrl(record: ImplementationSnapshotRecord): Promise<ImplementationSnapshotRecord> {
  if (!record.storagePath) return record;
  if (record.publicUrl.startsWith('https://cdn.site00.com/') || record.publicUrl.startsWith('https://vitest.local/')) {
    if (process.env.VITEST === 'true') return record;
    try {
      const { getSite00AssetPublicUrl } = await import('../../../../api/_lib/site00Assts/storage.js');
      return { ...record, publicUrl: getSite00AssetPublicUrl(record.storagePath) };
    } catch {
      return record;
    }
  }
  return record;
}

const hydratedOnce = new Set<string>();

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
    const hydratedRecord = await resolveHydratedPublicUrl(record);
    registerImplementationSnapshot(hydratedRecord);
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
