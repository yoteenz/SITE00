/**
 * B5.6 — Campaign package service — canonical CRUD + sequence reorder + migration.
 */

import type {
  CampaignAssetRecord,
  CampaignFormatSequenceRecord,
  CampaignPackageAuditEvent,
  CampaignPackageSnapshot,
  CampaignSequenceConflict,
  LegacyEntry001LocalState,
} from '../../../shared/site00-campaign-package/types.js';
import {
  appendAuditEvent,
  appendMigrationReceipt,
  getCampaignPackageSnapshot,
  upsertCampaignPackageSnapshot,
} from './memoryStore.js';
import {
  ENTRY001_PACKAGE_KEY_EXPORT,
  migrateEntry001Package,
} from './entry001Migration.js';
import { resolveCampaignPackageStoreMode } from './storeAdapter.js';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function audit(
  snapshot: CampaignPackageSnapshot,
  eventType: CampaignPackageAuditEvent['eventType'],
  targetId: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): void {
  const event: CampaignPackageAuditEvent = {
    eventId: uid('audit'),
    packageId: snapshot.package.packageId,
    entryId: snapshot.package.entryId,
    actor: 'founder',
    eventType,
    targetId,
    before,
    after,
    createdAt: new Date().toISOString(),
  };
  appendAuditEvent(event);
  snapshot.auditEvents.push(event);
}

export async function loadCampaignPackage(packageKey: string): Promise<CampaignPackageSnapshot | null> {
  const mode = await resolveCampaignPackageStoreMode();
  if (mode === 'memory') return getCampaignPackageSnapshot(packageKey);
  return getCampaignPackageSnapshot(packageKey);
}

export async function syncEntry001Package(args: {
  legacy?: LegacyEntry001LocalState | null;
  forceMigration?: boolean;
}): Promise<{ snapshot: CampaignPackageSnapshot; migrated: boolean }> {
  const existing = await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT);
  if (existing?.package.migrationComplete && !args.forceMigration && !args.legacy) {
    return { snapshot: existing, migrated: false };
  }

  const { snapshot, receipt } = migrateEntry001Package({
    existing,
    legacy: args.legacy ?? null,
    source: args.legacy ? 'LOCAL_STORAGE' : existing ? 'MERGE' : 'SEED',
  });

  const migrated = receipt.recordsCreated > 0 || receipt.recordsUpdated > 0;

  appendMigrationReceipt(receipt);
  snapshot.migrationReceipts.push(receipt);
  if (args.legacy && migrated) {
    audit(snapshot, 'MIGRATION_COMPLETED', receipt.migrationId, null, { receiptId: receipt.migrationId });
  }

  upsertCampaignPackageSnapshot(snapshot);
  return { snapshot, migrated };
}

export async function updateCampaignAsset(
  packageKey: string,
  assetId: string,
  patch: Partial<CampaignAssetRecord>,
): Promise<CampaignPackageSnapshot> {
  const snapshot = (await loadCampaignPackage(packageKey))!;
  const idx = snapshot.assets.findIndex((a) => a.assetId === assetId);
  if (idx < 0) throw new Error('Asset not found');
  const before = { ...snapshot.assets[idx] };
  snapshot.assets[idx] = { ...snapshot.assets[idx]!, ...patch, updatedAt: new Date().toISOString() };
  audit(snapshot, patch.status === 'ARCHIVED' ? 'ASSET_REMOVED' : 'ASSET_RECLASSIFIED', assetId, before, snapshot.assets[idx]!);
  snapshot.package.updatedAt = new Date().toISOString();
  upsertCampaignPackageSnapshot(snapshot);
  return snapshot;
}

export async function restoreCampaignAsset(packageKey: string, assetId: string): Promise<CampaignPackageSnapshot> {
  const snapshot = (await loadCampaignPackage(packageKey))!;
  const idx = snapshot.assets.findIndex((a) => a.assetId === assetId);
  if (idx < 0) throw new Error('Asset not found');
  const before = { ...snapshot.assets[idx]! };
  snapshot.assets[idx] = {
    ...snapshot.assets[idx]!,
    removedFromActiveArchive: false,
    archivedAt: null,
    status: 'APPROVED',
    updatedAt: new Date().toISOString(),
  };
  audit(snapshot, 'ASSET_RESTORED', assetId, before, snapshot.assets[idx]!);
  snapshot.package.updatedAt = new Date().toISOString();
  upsertCampaignPackageSnapshot(snapshot);
  return snapshot;
}

export async function removeCampaignAsset(packageKey: string, assetId: string): Promise<CampaignPackageSnapshot> {
  const snapshot = (await loadCampaignPackage(packageKey))!;
  const asset = snapshot.assets.find((a) => a.assetId === assetId);
  if (!asset) throw new Error('Asset not found');
  return updateCampaignAsset(packageKey, assetId, {
    removedFromActiveArchive: true,
    archivedAt: new Date().toISOString(),
    status: 'ARCHIVED',
  });
}

export async function reorderCampaignSequence(args: {
  packageKey: string;
  formatFamily: 'CAROUSEL' | 'STORY';
  orderedAssetIds: string[];
  expectedVersion: number;
}): Promise<{ snapshot: CampaignPackageSnapshot } | { conflict: CampaignSequenceConflict }> {
  const snapshot = (await loadCampaignPackage(args.packageKey))!;
  const current = snapshot.sequences.find((s) => s.formatFamily === args.formatFamily && s.isCurrent);
  if (!current) throw new Error('Sequence not found');
  if (current.versionNumber !== args.expectedVersion) {
    return {
      conflict: {
        code: 'SEQUENCE_UPDATED_ELSEWHERE',
        message: 'Sequence was updated on another device. Reload the latest order.',
        currentSequence: current,
      },
    };
  }

  const before = { orderedAssetIds: [...current.orderedAssetIds], version: current.versionNumber };
  const now = new Date().toISOString();
  const nextVersion = current.versionNumber + 1;

  snapshot.sequences = snapshot.sequences.map((s) =>
    s.sequenceId === current.sequenceId ? { ...s, isCurrent: false } : s,
  );

  const newSeq: CampaignFormatSequenceRecord = {
    sequenceId: uid(`seq-${args.formatFamily.toLowerCase()}`),
    packageId: snapshot.package.packageId,
    formatFamily: args.formatFamily,
    platform: current.platform,
    orderedAssetIds: args.orderedAssetIds,
    versionNumber: nextVersion,
    isCurrent: true,
    sequenceChangedAt: now,
    updatedAt: now,
    metadata: { label: `${args.formatFamily} SEQUENCE V${String(nextVersion).padStart(3, '0')}` },
  };
  snapshot.sequences.push(newSeq);

  snapshot.assets = snapshot.assets.map((asset) => {
    const idx = args.orderedAssetIds.indexOf(asset.assetId);
    if (idx >= 0) return { ...asset, sequenceIndex: idx + 1, updatedAt: now };
    return asset;
  });

  audit(snapshot, 'SEQUENCE_REORDERED', newSeq.sequenceId, before, {
    orderedAssetIds: args.orderedAssetIds,
    version: nextVersion,
  });

  snapshot.package.updatedAt = now;
  upsertCampaignPackageSnapshot(snapshot);
  return { snapshot };
}

export function snapshotToLegacyPersisted(snapshot: CampaignPackageSnapshot): {
  overrides: Record<string, Partial<CampaignAssetRecord>>;
  removedAssetIds: string[];
  archivedAssets: CampaignAssetRecord[];
  extraAssets: CampaignAssetRecord[];
} {
  const seedIds = new Set(
    snapshot.assets.filter((a) => a.source === 'SEED' || a.storageSource === 'STATIC_PUBLIC').map((a) => a.assetId),
  );
  const removedAssetIds = snapshot.assets.filter((a) => a.removedFromActiveArchive).map((a) => a.assetId);
  const archivedAssets = snapshot.assets.filter((a) => a.status === 'ARCHIVED' || a.removedFromActiveArchive);
  const extraAssets = snapshot.assets.filter((a) => !seedIds.has(a.assetId) && !a.removedFromActiveArchive);
  const overrides: Record<string, Partial<CampaignAssetRecord>> = {};
  for (const asset of snapshot.assets) {
    if (seedIds.has(asset.assetId)) {
      overrides[asset.assetId] = {
        assetType: asset.assetType,
        assetRole: asset.assetRole,
        status: asset.status,
        sequenceIndex: asset.sequenceIndex,
        removedFromActiveArchive: asset.removedFromActiveArchive,
        archivedAt: asset.archivedAt,
      };
    }
  }
  return { overrides, removedAssetIds, archivedAssets, extraAssets };
}

export function getOrderedSequenceAssets(
  snapshot: CampaignPackageSnapshot,
  formatFamily: 'CAROUSEL' | 'STORY',
): CampaignAssetRecord[] {
  const seq = snapshot.sequences.find((s) => s.formatFamily === formatFamily && s.isCurrent);
  if (!seq) return [];
  return seq.orderedAssetIds
    .map((id) => snapshot.assets.find((a) => a.assetId === id && !a.removedFromActiveArchive))
    .filter(Boolean) as CampaignAssetRecord[];
}

export { ENTRY001_PACKAGE_KEY_EXPORT };
