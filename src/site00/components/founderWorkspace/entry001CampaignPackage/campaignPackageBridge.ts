/**
 * B5.6 — Bridge persistent campaign package records ↔ Entry 001 UI types.
 */

import type { CampaignAssetRecord, CampaignPackageSnapshot } from '../../../../../shared/site00-campaign-package/types.js';
import type { Entry001CampaignAsset } from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import type { Entry001ArchiveStatePersisted } from './entry001ArchiveIntelligence.js';
import { enrichAssetWithTaxonomy } from './entry001AssetTaxonomy.js';

export function campaignAssetToEntry001(asset: CampaignAssetRecord): Entry001CampaignAsset {
  return enrichAssetWithTaxonomy({
    assetId: asset.assetId,
    entryId: 'entry-001',
    filePath: asset.filePath,
    title: asset.title,
    format: asset.format,
    role: asset.legacyRole as Entry001CampaignAsset['role'],
    assetType: asset.assetType as Entry001CampaignAsset['assetType'],
    assetRole: (asset.assetRole as Entry001CampaignAsset['assetRole']) ?? null,
    status: asset.status as Entry001CampaignAsset['status'],
    source: asset.source === 'SEED' ? 'FOUNDER_SUPPLIED' : asset.source,
    approved: asset.approved,
    founderJudgment: asset.founderJudgment,
    version: asset.versionLabel,
    sequenceIndex: asset.sequenceIndex,
    parentAssetId: asset.parentAssetId,
    packageId: asset.packageMembershipId,
    removedFromActiveArchive: asset.removedFromActiveArchive,
    archivedAt: asset.archivedAt,
    classificationHistory: asset.classificationHistory as Entry001CampaignAsset['classificationHistory'],
    lineage: asset.lineage as Entry001CampaignAsset['lineage'],
    notes: String(asset.metadata?.notes ?? ''),
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  });
}

export function legacyToPersisted(legacy: Entry001ArchiveStatePersisted): Entry001ArchiveStatePersisted {
  return legacy;
}

export function snapshotToEntry001Persisted(snapshot: CampaignPackageSnapshot): Entry001ArchiveStatePersisted {
  const seedIds = new Set(
    snapshot.assets
      .filter((a) => a.storageSource === 'STATIC_PUBLIC' && a.source !== 'FOUNDER_SUPPLIED')
      .map((a) => a.assetId),
  );

  const overrides: Entry001ArchiveStatePersisted['overrides'] = {};
  for (const asset of snapshot.assets) {
    if (seedIds.has(asset.assetId)) {
      overrides[asset.assetId] = {
        assetType: asset.assetType as Entry001CampaignAsset['assetType'],
        assetRole: asset.assetRole as Entry001CampaignAsset['assetRole'],
        status: asset.status as Entry001CampaignAsset['status'],
        sequenceIndex: asset.sequenceIndex,
        removedFromActiveArchive: asset.removedFromActiveArchive,
        archivedAt: asset.archivedAt,
        role: asset.legacyRole as Entry001CampaignAsset['role'],
      };
    }
  }

  return {
    overrides,
    removedAssetIds: snapshot.assets.filter((a) => a.removedFromActiveArchive).map((a) => a.assetId),
    archivedAssets: snapshot.assets
      .filter((a) => a.status === 'ARCHIVED' || a.removedFromActiveArchive)
      .map(campaignAssetToEntry001),
    extraAssets: snapshot.assets
      .filter((a) => !seedIds.has(a.assetId) && !a.removedFromActiveArchive)
      .map(campaignAssetToEntry001),
  };
}

export function readLegacyLocalStorage(): Entry001ArchiveStatePersisted | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('site00_entry001_archive_state_v2');
    if (!raw) return null;
    return JSON.parse(raw) as Entry001ArchiveStatePersisted;
  } catch {
    return null;
  }
}

export function markLocalMigrationComplete(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('site00_entry001_package_migrated_v1', new Date().toISOString());
}

export function isLocalMigrationComplete(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem('site00_entry001_package_migrated_v1'));
}

export function backupLegacyLocalStorage(): void {
  if (typeof window === 'undefined') return;
  const legacy = readLegacyLocalStorage();
  if (legacy) {
    localStorage.setItem('site00_entry001_archive_state_backup_v1', JSON.stringify(legacy));
  }
}
