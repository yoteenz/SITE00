import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  builderManifestAnchorIds,
} from '../src/site00/pages/foundation/digitalFoundationBuilderManifest';
import {
  GALLERY_EAGER_MOUNT_COUNT,
  galleryCoverageTotals,
  galleryEntriesOrdered,
  galleryMountContractAnchors,
  gallerySectionEagerMount,
} from '../src/site00/pages/foundation/digitalFoundationReviewGallery';
import {
  REVIEW_ZONE_ORDER,
  galleryEntriesForZone,
} from '../src/site00/pages/foundation/digitalFoundationReviewZones';
import { reviewEntriesForIndex } from '../src/site00/pages/foundation/digitalFoundationReviewRegistry';

describe('digital foundation review gallery regression lock', () => {
  const page = readFileSync('src/site00/pages/foundation/DigitalFoundationReviewPage.tsx', 'utf8');
  const gallery = readFileSync('src/site00/pages/foundation/DigitalFoundationReviewGallery.tsx', 'utf8');

  it('uses continuous gallery as primary surface (not single-screen mode)', () => {
    expect(page).toContain('DigitalFoundationReviewGallery');
    expect(page).toContain('CONTINUOUS GALLERY');
    expect(page).not.toContain('ZONE STAGE');
    expect(page).not.toContain('df-review-stage');
    expect(page).not.toMatch(/DigitalFoundationReviewPreviewHost anchorId=\{activeAnchor\}/);
    expect(gallery).toContain('df-review__strip--continuous');
    expect(gallery).toContain('DigitalFoundationReviewGallerySection');
    expect(gallery).not.toContain('DigitalFoundationReviewStage');
    expect(gallery).toContain('df-review-gallery');
  });

  it('mounts every index contract anchor in the gallery pipeline', () => {
    const ordered = galleryEntriesOrdered().map((e) => e.anchorId);
    for (const anchor of galleryMountContractAnchors()) {
      expect(ordered).toContain(anchor);
    }
    expect(ordered.length).toBeGreaterThan(40);
  });

  it('preserves canonical builder manifest anchors in gallery order', () => {
    const ordered = new Set(galleryEntriesOrdered().map((e) => e.anchorId));
    for (const anchor of builderManifestAnchorIds()) {
      expect(ordered.has(anchor)).toBe(true);
    }
  });

  it('eager-mounts only the first screens in each zone gallery', () => {
    for (const zone of REVIEW_ZONE_ORDER) {
      const entries = galleryEntriesForZone(zone);
      entries.forEach((entry, index) => {
        expect(gallerySectionEagerMount(entry, index)).toBe(index < GALLERY_EAGER_MOUNT_COUNT);
      });
    }
  });

  it('reports honest gallery totals separate from registry-only counts', () => {
    const totals = galleryCoverageTotals();
    expect(totals.gallerySections).toBeGreaterThan(40);
    expect(totals.rendered + totals.simulated).toBeGreaterThan(20);
    expect(totals.registered).toBeGreaterThanOrEqual(totals.gallerySections);
    expect(reviewEntriesForIndex().length).toBeGreaterThan(30);
  });
});
