/**
 * B5.6R1 — Campaign package service — canonical CRUD via unified store adapter.
 */

import type {
  CampaignAssetRecord,
  CampaignDeliverableRecord,
  CampaignDeliverableVersionRecord,
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
} from './campaignPackageStore.js';
import {
  ENTRY001_PACKAGE_KEY_EXPORT,
  migrateEntry001Package,
  syncDeliverablesIntoSnapshot,
} from './entry001Migration.js';

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
  void appendAuditEvent(event);
  snapshot.auditEvents.push(event);
}

async function saveSnapshot(snapshot: CampaignPackageSnapshot): Promise<CampaignPackageSnapshot> {
  return upsertCampaignPackageSnapshot(snapshot);
}

export async function loadCampaignPackage(packageKey: string): Promise<CampaignPackageSnapshot | null> {
  return getCampaignPackageSnapshot(packageKey);
}

export async function syncEntry001Package(args: {
  legacy?: LegacyEntry001LocalState | null;
  forceMigration?: boolean;
}): Promise<{ snapshot: CampaignPackageSnapshot; migrated: boolean }> {
  const existing = await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT);
  if (existing?.package.migrationComplete && !args.forceMigration && !args.legacy) {
    return { snapshot: syncDeliverablesIntoSnapshot(existing), migrated: false };
  }

  const { snapshot: migratedSnapshot, receipt } = migrateEntry001Package({
    existing,
    legacy: args.legacy ?? null,
    source: args.legacy ? 'LOCAL_STORAGE' : existing ? 'MERGE' : 'SEED',
  });

  const snapshot = syncDeliverablesIntoSnapshot(migratedSnapshot);
  const migrated = receipt.recordsCreated > 0 || receipt.recordsUpdated > 0;

  appendMigrationReceipt(receipt);
  snapshot.migrationReceipts.push(receipt);
  if (args.legacy && migrated) {
    audit(snapshot, 'MIGRATION_COMPLETED', receipt.migrationId, null, { receiptId: receipt.migrationId });
  }

  await saveSnapshot(snapshot);
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
  return saveSnapshot(snapshot);
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
  return saveSnapshot(snapshot);
}

export async function removeCampaignAsset(packageKey: string, assetId: string): Promise<CampaignPackageSnapshot> {
  return updateCampaignAsset(packageKey, assetId, {
    removedFromActiveArchive: true,
    archivedAt: new Date().toISOString(),
    status: 'ARCHIVED',
  });
}

export async function deleteCampaignAssetPermanently(
  packageKey: string,
  assetId: string,
): Promise<CampaignPackageSnapshot> {
  const snapshot = (await loadCampaignPackage(packageKey))!;
  const tombstones = new Set(
    ((snapshot.package.metadata?.deletedAssetTombstones as string[] | undefined) ?? []).map(String),
  );
  tombstones.add(assetId);
  snapshot.package.metadata = {
    ...(snapshot.package.metadata ?? {}),
    deletedAssetTombstones: [...tombstones],
  };
  snapshot.assets = snapshot.assets.filter((a) => a.assetId !== assetId);
  snapshot.deliverables = snapshot.deliverables.filter((d) => d.assetId !== assetId);
  audit(snapshot, 'ASSET_REMOVED', assetId, { permanent: false }, { permanent: true, tombstoned: true });
  snapshot.package.updatedAt = new Date().toISOString();
  return saveSnapshot(snapshot);
}

export async function updateCampaignDeliverable(
  packageKey: string,
  deliverableId: string,
  patch: Partial<CampaignDeliverableRecord>,
): Promise<CampaignPackageSnapshot> {
  const snapshot = (await loadCampaignPackage(packageKey))!;
  const idx = snapshot.deliverables.findIndex((d) => d.deliverableId === deliverableId);
  if (idx < 0) throw new Error('Deliverable not found');
  const before = { ...snapshot.deliverables[idx]! };
  snapshot.deliverables[idx] = {
    ...snapshot.deliverables[idx]!,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  audit(snapshot, 'DELIVERABLE_REPLACED', deliverableId, before, snapshot.deliverables[idx]!);
  snapshot.package.updatedAt = new Date().toISOString();
  return saveSnapshot(snapshot);
}

export async function replaceDeliverableVersion(args: {
  packageKey: string;
  deliverableId: string;
  filePath: string;
  title: string;
  caption?: string | null;
}): Promise<CampaignPackageSnapshot> {
  const snapshot = (await loadCampaignPackage(args.packageKey))!;
  const deliverable = snapshot.deliverables.find((d) => d.deliverableId === args.deliverableId);
  if (!deliverable) throw new Error('Deliverable not found');

  const existingVersions = snapshot.versions.filter((v) => v.deliverableId === args.deliverableId);
  const nextVersionNumber =
    existingVersions.reduce((max, v) => Math.max(max, v.versionNumber), 0) + 1;
  const now = new Date().toISOString();

  snapshot.versions = snapshot.versions.map((v) =>
    v.deliverableId === args.deliverableId && !v.supersededAt
      ? { ...v, supersededAt: now }
      : v,
  );

  const version: CampaignDeliverableVersionRecord = {
    versionId: uid('ver'),
    deliverableId: args.deliverableId,
    versionNumber: nextVersionNumber,
    filePath: args.filePath,
    caption: args.caption ?? null,
    title: args.title,
    assetType: deliverable.deliverableType,
    assetRole: null,
    sequenceIndex: null,
    source: 'FOUNDER_SUPPLIED',
    storageSource: args.filePath.startsWith('blob:') ? 'BLOB_SESSION' : 'STATIC_PUBLIC',
    createdAt: now,
    createdBy: 'founder',
    supersededAt: null,
    metadata: {},
  };
  snapshot.versions.push(version);

  const dIdx = snapshot.deliverables.findIndex((d) => d.deliverableId === args.deliverableId);
  snapshot.deliverables[dIdx] = {
    ...deliverable,
    currentVersionId: version.versionId,
    status: 'UPLOADED',
    updatedAt: now,
  };

  audit(snapshot, 'DELIVERABLE_REPLACED', args.deliverableId, { version: nextVersionNumber - 1 }, { version: nextVersionNumber });
  snapshot.package.updatedAt = now;
  return saveSnapshot(snapshot);
}

export async function updateDeliverableCaption(
  packageKey: string,
  deliverableId: string,
  caption: string,
): Promise<CampaignPackageSnapshot> {
  const snapshot = (await loadCampaignPackage(packageKey))!;
  const idx = snapshot.deliverables.findIndex((d) => d.deliverableId === deliverableId);
  if (idx < 0) throw new Error('Deliverable not found');
  const before = { caption: snapshot.deliverables[idx]!.metadata?.caption };
  snapshot.deliverables[idx] = {
    ...snapshot.deliverables[idx]!,
    metadata: { ...snapshot.deliverables[idx]!.metadata, caption },
    updatedAt: new Date().toISOString(),
  };
  audit(snapshot, 'CAPTION_EDITED', deliverableId, before, { caption });
  snapshot.package.updatedAt = new Date().toISOString();
  return saveSnapshot(snapshot);
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
  const saved = await saveSnapshot(snapshot);
  return { snapshot: saved };
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

export function computePackageReadinessFromSnapshot(snapshot: CampaignPackageSnapshot): {
  previewReadiness: string;
  campaignBoardEligibility: boolean;
} {
  const activeDeliverables = snapshot.deliverables.filter(
    (d) => !d.removedFromPackage && d.status !== 'DELETED',
  );
  const approved = activeDeliverables.filter((d) => d.status === 'APPROVED').length;
  const total = activeDeliverables.length;
  const ratio = total ? approved / total : 0;
  return {
    previewReadiness: ratio >= 0.8 ? 'READY' : ratio >= 0.4 ? 'PARTIAL' : 'INCOMPLETE',
    campaignBoardEligibility: ratio >= 0.8,
  };
}

export { ENTRY001_PACKAGE_KEY_EXPORT };
