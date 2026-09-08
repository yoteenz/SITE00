/**
 * B5.6 — Entry 001 package seed + localStorage migration helpers.
 */

import type {
  CampaignAssetRecord,
  CampaignFormatSequenceRecord,
  CampaignPackageMigrationReceipt,
  CampaignPackageRecord,
  CampaignPackageSnapshot,
  LegacyEntry001LocalState,
} from '../../../shared/site00-campaign-package/types.js';
import {
  ENTRY001_APPROVED_ARCHIVE as SEED_ARCHIVE,
  ENTRY001_HERO_ASSET as SEED_HERO,
  ENTRY001_CAROUSEL_PACKAGE_ID,
  ENTRY001_PARENT_PACKAGES,
  ENTRY001_STORY_PACKAGE_ID,
} from '../../../src/site00/config/entry001CampaignAssets.js';

const ENTRY001_PACKAGE_KEY = 'ndxbook:entry-001:main';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mapSeedAsset(
  seed: (typeof SEED_ARCHIVE)[number] | typeof SEED_HERO,
  packageId: string,
): CampaignAssetRecord {
  const now = new Date().toISOString();
  return {
    assetId: seed.assetId,
    packageId,
    entryId: 'entry-001',
    assetType: seed.assetType,
    assetRole: seed.assetRole ?? null,
    formatFamily:
      seed.assetType === 'CAROUSEL_SLIDE'
        ? 'CAROUSEL'
        : seed.assetType === 'STORY_FRAME' || seed.assetType === 'CTA_FRAME'
          ? 'STORY'
          : null,
    platform: seed.assetType === 'TIKTOK' ? 'TIKTOK' : seed.assetType === 'X_POST' ? 'X' : 'INSTAGRAM',
    title: seed.title,
    filePath: seed.filePath,
    format: seed.format,
    legacyRole: seed.role,
    source: seed.source === 'FOUNDER_SUPPLIED' ? 'FOUNDER_SUPPLIED' : 'SEED',
    storageSource: seed.filePath.startsWith('blob:') ? 'BLOB_SESSION' : 'STATIC_PUBLIC',
    status: seed.status,
    founderJudgment: seed.founderJudgment ?? null,
    approved: seed.approved,
    sequenceIndex: seed.sequenceIndex ?? null,
    parentAssetId: seed.parentAssetId ?? null,
    packageMembershipId: seed.packageId ?? null,
    removedFromActiveArchive: seed.removedFromActiveArchive ?? false,
    archivedAt: seed.archivedAt ?? null,
    caption: null,
    versionLabel: seed.version,
    metadata: { notes: seed.notes ?? null },
    lineage: seed.lineage ?? {},
    classificationHistory: seed.classificationHistory ?? [],
    createdAt: seed.createdAt ?? now,
    updatedAt: seed.updatedAt ?? now,
  };
}

function buildInitialSequences(packageId: string, assets: CampaignAssetRecord[]): CampaignFormatSequenceRecord[] {
  const now = new Date().toISOString();
  const carouselPkg = ENTRY001_PARENT_PACKAGES.find((p) => p.packageId === ENTRY001_CAROUSEL_PACKAGE_ID)!;
  const storyPkg = ENTRY001_PARENT_PACKAGES.find((p) => p.packageId === ENTRY001_STORY_PACKAGE_ID)!;

  const carouselOrder = carouselPkg.childAssetIds.filter((id) =>
    assets.some((a) => a.assetId === id && !a.removedFromActiveArchive),
  );
  const storyOrder = storyPkg.childAssetIds.filter((id) =>
    assets.some((a) => a.assetId === id && !a.removedFromActiveArchive),
  );

  return [
    {
      sequenceId: uid('seq-carousel'),
      packageId,
      formatFamily: 'CAROUSEL',
      platform: 'INSTAGRAM',
      orderedAssetIds: carouselOrder,
      versionNumber: 1,
      isCurrent: true,
      sequenceChangedAt: null,
      updatedAt: now,
      metadata: { label: 'CAROUSEL SEQUENCE V001' },
    },
    {
      sequenceId: uid('seq-story'),
      packageId,
      formatFamily: 'STORY',
      platform: 'INSTAGRAM',
      orderedAssetIds: storyOrder,
      versionNumber: 1,
      isCurrent: true,
      sequenceChangedAt: null,
      updatedAt: now,
      metadata: { label: 'STORY SEQUENCE V001' },
    },
  ];
}

function applyLegacyState(assets: CampaignAssetRecord[], legacy?: LegacyEntry001LocalState | null): CampaignAssetRecord[] {
  if (!legacy) return assets;
  const removed = new Set(legacy.removedAssetIds);
  const archivedById = new Map(legacy.archivedAssets.map((a) => [String(a.assetId), a]));

  let next = assets.map((a) => {
    const override = legacy.overrides[a.assetId];
    const archived = archivedById.get(a.assetId);
    if (removed.has(a.assetId) || archived) {
      const archivedRecord = archived ?? a;
      return {
        ...a,
        ...archivedRecord,
        assetId: a.assetId,
        removedFromActiveArchive: true,
        archivedAt: String(archivedRecord.archivedAt ?? new Date().toISOString()),
        status: 'ARCHIVED',
        updatedAt: new Date().toISOString(),
      } as CampaignAssetRecord;
    }
    if (override) {
      return { ...a, ...override, assetId: a.assetId, updatedAt: new Date().toISOString() } as CampaignAssetRecord;
    }
    return a;
  });

  for (const extra of legacy.extraAssets) {
    const assetId = String(extra.assetId);
    if (removed.has(assetId)) continue;
    next.push(
      mapSeedAsset(
        {
          ...extra,
          assetId,
          entryId: 'entry-001',
          approved: Boolean(extra.approved),
          status: (extra.status as 'APPROVED') ?? 'APPROVED',
          source: 'FOUNDER_SUPPLIED',
          version: String(extra.version ?? 'upload-v002'),
          format: (extra.format as 'IMAGE') ?? 'IMAGE',
          role: (extra.role as 'CAMPAIGN_PACKAGE_ASSET') ?? 'CAMPAIGN_PACKAGE_ASSET',
          assetType: extra.assetType as 'REEL_COVER',
          title: String(extra.title ?? 'UPLOAD'),
          filePath: String(extra.filePath ?? ''),
        } as (typeof SEED_ARCHIVE)[number],
        next[0]?.packageId ?? uid('pkg'),
      ),
    );
  }

  return next;
}

const ENTRY001_STABLE_PACKAGE_ID = 'site00-pkg-entry-001-main';

export function buildEntry001SeedSnapshot(legacy?: LegacyEntry001LocalState | null): CampaignPackageSnapshot {
  const packageId = ENTRY001_STABLE_PACKAGE_ID;
  const now = new Date().toISOString();
  const pkg: CampaignPackageRecord = {
    packageId,
    packageKey: ENTRY001_PACKAGE_KEY,
    projectId: 'ndxbook',
    brandId: 'ndxbook',
    entryId: 'entry-001',
    packageType: 'ENTRY_CAMPAIGN_PACKAGE',
    status: 'INCOMPLETE',
    previewReadiness: 'PARTIAL',
    campaignBoardEligibility: false,
    migrationVersion: 1,
    migrationComplete: false,
    createdAt: now,
    updatedAt: now,
    metadata: {},
  };

  const seedAssets = [SEED_HERO, ...SEED_ARCHIVE].map((a) => mapSeedAsset(a, packageId));
  const assets = applyLegacyState(seedAssets, legacy);
  const sequences = buildInitialSequences(packageId, assets.filter((a) => !a.removedFromActiveArchive));

  assets.forEach((asset, _i, arr) => {
    for (const seq of sequences) {
      const idx = seq.orderedAssetIds.indexOf(asset.assetId);
      if (idx >= 0) asset.sequenceIndex = idx + 1;
    }
  });

  return {
    package: pkg,
    assets,
    deliverables: [],
    versions: [],
    sequences,
    migrationReceipts: [],
    auditEvents: [],
  };
}

export function migrateEntry001Package(args: {
  existing: CampaignPackageSnapshot | null;
  legacy?: LegacyEntry001LocalState | null;
  source: 'LOCAL_STORAGE' | 'SEED' | 'MERGE';
}): { snapshot: CampaignPackageSnapshot; receipt: CampaignPackageMigrationReceipt } {
  const examined =
    (args.legacy?.extraAssets.length ?? 0) +
    (args.legacy?.removedAssetIds.length ?? 0) +
    Object.keys(args.legacy?.overrides ?? {}).length +
    SEED_ARCHIVE.length +
    1;

  if (args.existing?.package.migrationComplete) {
    const receipt: CampaignPackageMigrationReceipt = {
      migrationId: uid('mig'),
      packageId: args.existing.package.packageId,
      source: args.source,
      recordsExamined: examined,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: examined,
      errors: [],
      completedAt: new Date().toISOString(),
      legacyBackup: args.legacy ?? undefined,
    };
    return { snapshot: args.existing, receipt };
  }

  const base = args.existing ?? buildEntry001SeedSnapshot(args.legacy);
  const mergedAssets = applyLegacyState(
    base.assets.filter((a) => a.source === 'SEED' || a.source === 'FOUNDER_SUPPLIED'),
    args.legacy,
  );
  const activeAssets = mergedAssets.filter((a) => !a.removedFromActiveArchive);
  const sequences =
    args.existing?.sequences.filter((s) => s.isCurrent).length && !args.legacy
      ? args.existing.sequences
      : buildInitialSequences(base.package.packageId, activeAssets);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  if (!args.existing) created = mergedAssets.length;
  else {
    for (const asset of mergedAssets) {
      const prev = args.existing.assets.find((a) => a.assetId === asset.assetId);
      if (!prev) created += 1;
      else if (JSON.stringify(prev) !== JSON.stringify(asset)) updated += 1;
      else skipped += 1;
    }
  }

  const snapshot: CampaignPackageSnapshot = {
    ...base,
    package: {
      ...base.package,
      migrationComplete: true,
      migrationVersion: (base.package.migrationVersion ?? 0) + 1,
      updatedAt: new Date().toISOString(),
    },
    assets: mergedAssets,
    sequences,
    migrationReceipts: base.migrationReceipts,
    auditEvents: base.auditEvents,
  };

  const receipt: CampaignPackageMigrationReceipt = {
    migrationId: uid('mig'),
    packageId: snapshot.package.packageId,
    source: args.source,
    recordsExamined: examined,
    recordsCreated: created,
    recordsUpdated: updated,
    recordsSkipped: skipped,
    errors: [],
    completedAt: new Date().toISOString(),
    legacyBackup: args.legacy ?? undefined,
  };

  return { snapshot, receipt };
}

export const ENTRY001_PACKAGE_KEY_EXPORT = ENTRY001_PACKAGE_KEY;
