/**
 * B5.4 — Entry 001 archive resolution, parent packages, intelligence.
 */

import type {
  Entry001ArchiveIntelligenceSnapshot,
  Entry001CampaignAsset,
  Entry001ParentPackage,
} from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import {
  ENTRY001_APPROVED_ARCHIVE,
  ENTRY001_PARENT_PACKAGES,
} from '../../../config/entry001CampaignAssets.js';
import {
  enrichAssetWithTaxonomy,
  isActiveArchiveAsset,
  legacyRoleToAssetType,
} from './entry001AssetTaxonomy.js';

export type Entry001ArchiveStatePersisted = {
  overrides: Record<string, Partial<Entry001CampaignAsset>>;
  removedAssetIds: string[];
  archivedAssets: Entry001CampaignAsset[];
  extraAssets: Entry001CampaignAsset[];
};

export function resolveArchiveAsset(
  base: Entry001CampaignAsset,
  overrides: Record<string, Partial<Entry001CampaignAsset>>,
): Entry001CampaignAsset {
  const merged = enrichAssetWithTaxonomy({ ...base, ...overrides[base.assetId] });
  return merged;
}

export function buildActiveArchive(
  overrides: Record<string, Partial<Entry001CampaignAsset>> = {},
  removedIds: string[] = [],
  extraApproved: Entry001CampaignAsset[] = [],
): Entry001CampaignAsset[] {
  const removed = new Set(removedIds);
  const baseActive = ENTRY001_APPROVED_ARCHIVE.filter((a) => !removed.has(a.assetId)).map((a) =>
    resolveArchiveAsset(a, overrides),
  );
  const extras = extraApproved
    .filter((a) => isActiveArchiveAsset(a) && !removed.has(a.assetId))
    .map((a) => enrichAssetWithTaxonomy(a));
  return [...baseActive, ...extras].filter(isActiveArchiveAsset);
}

export function countActiveArchive(assets: Entry001CampaignAsset[]): number {
  return assets.filter(isActiveArchiveAsset).length;
}

export function buildParentPackages(activeArchive: Entry001CampaignAsset[]): Entry001ParentPackage[] {
  return ENTRY001_PARENT_PACKAGES.map((pkg) => ({
    ...pkg,
    childAssetIds: pkg.childAssetIds.filter((id) => activeArchive.some((a) => a.assetId === id)),
    status: pkg.childAssetIds.some((id) => activeArchive.some((a) => a.assetId === id))
      ? 'APPROVED'
      : 'IN_PROGRESS',
  }));
}

export function buildEntry001ArchiveIntelligence(
  activeArchive: Entry001CampaignAsset[],
): Entry001ArchiveIntelligenceSnapshot {
  const typesPresent = new Set<ReturnType<typeof legacyRoleToAssetType>>();
  for (const a of activeArchive) {
    typesPresent.add(a.assetType ?? legacyRoleToAssetType(a.role));
  }

  const requiredMissing: Entry001ArchiveIntelligenceSnapshot['missingFormats'] = [];
  for (const t of ['REEL_COVER', 'HIGHLIGHT_ICON', 'REEL', 'TIKTOK', 'X_POST'] as const) {
    if (!typesPresent.has(t)) requiredMissing.push(t);
  }

  const carouselSlides = activeArchive.filter((a) => a.assetType === 'CAROUSEL_SLIDE').length;
  const storyFrames = activeArchive.filter(
    (a) => a.assetType === 'STORY_FRAME' || a.assetType === 'CTA_FRAME',
  ).length;

  const doNotRegenerate: Entry001ArchiveIntelligenceSnapshot['doNotRegenerateTypes'] = [];
  if (carouselSlides >= 4) doNotRegenerate.push('CAROUSEL', 'CAROUSEL_SLIDE');
  if (storyFrames >= 1) doNotRegenerate.push('STORY', 'STORY_FRAME');

  return {
    entryId: 'entry-001',
    existingAssetTypes: [...typesPresent],
    completeFormats: [...typesPresent].filter(
      (t) => !requiredMissing.includes(t as (typeof requiredMissing)[number]),
    ),
    missingFormats: requiredMissing,
    packageGroups: buildParentPackages(activeArchive).map((p) => ({
      packageId: p.packageId,
      assetType: p.assetType,
      childCount: p.childAssetIds.length,
    })),
    styleReferenceAssetIds: activeArchive
      .filter((a) => a.assetType === 'CAROUSEL_SLIDE' || a.assetType === 'QUOTE_POST')
      .map((a) => a.assetId),
    doNotRegenerateTypes: doNotRegenerate,
    derivableFromFamilies: {
      REEL_COVER: ['CAROUSEL_SLIDE', 'STORY_FRAME', 'STATIC_POST', 'QUOTE_POST'],
      HIGHLIGHT_ICON: ['CAROUSEL_SLIDE', 'STATIC_POST'],
      TIKTOK: ['CAROUSEL_SLIDE', 'STORY_FRAME'],
      X_POST: ['QUOTE_POST', 'CAROUSEL_SLIDE'],
    },
  };
}
