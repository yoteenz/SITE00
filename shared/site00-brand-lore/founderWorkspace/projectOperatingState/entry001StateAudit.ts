/**
 * B5.7 — Entry 001 archive vs package state audit.
 */

import type { Entry001StateAudit } from './types.js';

export function auditEntry001State(args: {
  activeArchiveCount: number;
  archivedRemovedCount: number;
  packageDeliverableCount: number;
  carouselSlideCount: number;
  storyFrameCount: number;
}): Entry001StateAudit {
  const {
    activeArchiveCount,
    archivedRemovedCount,
    packageDeliverableCount,
    carouselSlideCount,
    storyFrameCount,
  } = args;

  const packageHasContent = carouselSlideCount > 0 || storyFrameCount > 0 || packageDeliverableCount > 0;
  const archiveEmpty = activeArchiveCount === 0;

  let explanation: string;
  let consistent = true;

  if (archiveEmpty && packageHasContent) {
    explanation =
      'Archive shows 0 active source assets while package content has deliverables — founder-supplied seeds may live in package sequences only (removed from active archive but still in package).';
    consistent = true;
  } else if (!archiveEmpty && packageHasContent) {
    explanation = 'Archive and package both have active assets — canonical sync OK.';
  } else if (archiveEmpty && !packageHasContent) {
    explanation = 'No active archive assets and no package deliverables — package not started.';
  } else {
    explanation = 'Archive/package relationship under review.';
    consistent = false;
  }

  return {
    activeArchiveCount,
    archivedRemovedCount,
    packageDeliverableCount,
    carouselSlideCount,
    storyFrameCount,
    archivePackageConsistent: consistent,
    explanation,
    mismatchRepairApplied: false,
  };
}
