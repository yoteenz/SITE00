import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  builderManifestAnchorIds,
} from '../src/site00/pages/foundation/digitalFoundationBuilderManifest';
import {
  galleryCoverageTotals,
  galleryEntriesOrdered,
  galleryMountContractAnchors,
} from '../src/site00/pages/foundation/digitalFoundationReviewGallery';
import { reviewEntriesForIndex } from '../src/site00/pages/foundation/digitalFoundationReviewRegistry';

describe('digital foundation review gallery regression lock', () => {
  const page = readFileSync('src/site00/pages/foundation/DigitalFoundationReviewPage.tsx', 'utf8');
  const gallery = readFileSync('src/site00/pages/foundation/DigitalFoundationReviewGallery.tsx', 'utf8');

  it('uses continuous gallery as primary surface (not single-screen mode)', () => {
    expect(page).toContain('DigitalFoundationReviewGallery');
    expect(page).toContain('CONTINUOUS GALLERY');
    expect(page).not.toContain('df-review-stage');
    expect(page).not.toMatch(/DigitalFoundationReviewPreviewHost anchorId=\{activeAnchor\}/);
    expect(gallery).toContain('df-review__strip');
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

  it('reports honest gallery totals separate from registry-only counts', () => {
    const totals = galleryCoverageTotals();
    expect(totals.gallerySections).toBeGreaterThan(40);
    expect(totals.rendered + totals.simulated).toBeGreaterThan(20);
    expect(totals.registered).toBeGreaterThanOrEqual(totals.gallerySections);
    expect(reviewEntriesForIndex().length).toBeGreaterThan(30);
  });
});
