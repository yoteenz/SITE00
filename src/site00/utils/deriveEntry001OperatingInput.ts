/**
 * B5.7 — Derive Entry 001 metrics for ProjectOperatingState from campaign package API.
 */

import type { BuildProjectOperatingStateInput } from '../../../shared/site00-brand-lore/founderWorkspace/projectOperatingState/index.js';
import type { CampaignPackageApiResponse } from '../components/founderWorkspace/entry001CampaignPackage/campaignPackageApi.js';
import {
  buildActiveArchive,
  countActiveArchive,
} from '../components/founderWorkspace/entry001CampaignPackage/entry001ArchiveIntelligence.js';

type PackageSnapshotShape = {
  deliverables?: Array<{ removedFromPackage?: boolean }>;
  sequences?: Array<{ formatFamily: string; orderedAssetIds: string[] }>;
};

export function deriveEntry001OperatingInput(
  pkg: CampaignPackageApiResponse | null,
): BuildProjectOperatingStateInput['entry001'] | undefined {
  if (!pkg?.legacy) return undefined;

  const legacy = pkg.legacy;
  const activeArchive = buildActiveArchive(legacy.overrides, legacy.removedAssetIds, legacy.extraAssets);
  const snap = (pkg.snapshot ?? null) as PackageSnapshotShape | null;
  const carousel = snap?.sequences?.find((s) => s.formatFamily === 'CAROUSEL');
  const story = snap?.sequences?.find((s) => s.formatFamily === 'STORY');
  const deliverables = (snap?.deliverables ?? []).filter((d) => !d.removedFromPackage);
  const carouselSlideCount = carousel?.orderedAssetIds.length ?? pkg.carouselAssets?.length ?? 0;
  const storyFrameCount = story?.orderedAssetIds.length ?? pkg.storyAssets?.length ?? 0;
  const packageIncomplete = !(carouselSlideCount >= 4 && storyFrameCount >= 1);

  return {
    activeArchiveCount: countActiveArchive(activeArchive),
    archivedRemovedCount: legacy.removedAssetIds.length + legacy.archivedAssets.length,
    packageDeliverableCount: deliverables.length,
    carouselSlideCount,
    storyFrameCount,
    packageIncomplete,
    needsFounderReview: false,
  };
}
