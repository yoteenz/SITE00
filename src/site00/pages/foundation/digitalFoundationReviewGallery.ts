/**
 * Continuous review gallery ordering — registry is navigation; gallery is the primary surface.
 */
import {
  REVIEW_GROUP_ORDER,
  allReviewRegistryEntries,
  reviewEntriesForIndex,
  type DfReviewEntry,
  type DfReviewGroupId,
} from './digitalFoundationReviewRegistry';
import {
  galleryEntriesForZoneFilter,
  type DfReviewZoneId,
} from './digitalFoundationReviewZones';
import { previewStatusForEntry } from './reviewPreviewStatus';

/** Gallery sections in stable group order (every registry index entry, deduped by anchor). */
export function galleryEntriesOrdered(): DfReviewEntry[] {
  const seen = new Set<string>();
  const out: DfReviewEntry[] = [];
  for (const groupId of REVIEW_GROUP_ORDER) {
    for (const entry of allReviewRegistryEntries()) {
      if (entry.group !== groupId) continue;
      if (seen.has(entry.anchorId)) continue;
      seen.add(entry.anchorId);
      out.push(entry);
    }
  }
  return out;
}

/** @deprecated Use zone filter on the review page. */
export function galleryEntriesFiltered(groupFilter: DfReviewGroupId | 'ALL'): DfReviewEntry[] {
  const all = galleryEntriesOrdered();
  if (groupFilter === 'ALL') return all;
  return all.filter((e) => e.group === groupFilter);
}

export function galleryEntriesFilteredByZone(zone: DfReviewZoneId): DfReviewEntry[] {
  return galleryEntriesForZoneFilter(zone);
}

/** Sections that must mount in the DOM for regression tests (inline + founder shell + gaps + blocked BLDR). */
export function galleryMountContractAnchors(): string[] {
  return reviewEntriesForIndex().map((e) => e.anchorId);
}

export function galleryCoverageTotals() {
  const discovered = allReviewRegistryEntries();
  const gallery = galleryEntriesOrdered();
  const index = reviewEntriesForIndex();
  let rendered = 0;
  let simulated = 0;
  let authenticated = 0;
  let blocked = 0;
  let notImplemented = 0;
  let linkOnly = 0;

  for (const entry of gallery) {
    const status = previewStatusForEntry(entry);
    if (entry.renderMode === 'registry_gap' || entry.implementationStatus === 'not_implemented') {
      notImplemented += 1;
      continue;
    }
    if (entry.renderMode === 'legacy_redirect' || entry.implementationStatus === 'backend_blocked') {
      blocked += 1;
      continue;
    }
    if (entry.renderMode === 'external_route') {
      linkOnly += 1;
      if (status === 'AUTHENTICATED') authenticated += 1;
      continue;
    }
    if (status === 'SIMULATED') simulated += 1;
    else rendered += 1;
  }

  return {
    discovered: discovered.length,
    registered: discovered.length,
    gallerySections: gallery.length,
    indexSections: index.length,
    rendered,
    simulated,
    authenticated,
    blocked,
    notImplemented,
    linkOnly,
  };
}

/** Eager-mount only the first screens in the active zone (scroll + hash mount the rest). */
export const GALLERY_EAGER_MOUNT_COUNT = 3;

/** Mount only when the section is in the first N slots of the visible zone gallery. */
export function gallerySectionEagerMount(_entry: DfReviewEntry, indexInZone: number): boolean {
  return indexInZone < GALLERY_EAGER_MOUNT_COUNT;
}
