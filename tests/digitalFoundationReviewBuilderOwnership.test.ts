import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  APPROVED_FOUNDATION_BUILDER_SOURCE,
  DIGITAL_FOUNDATION_REVIEW_REGISTRY_VERSION,
  FORBIDDEN_FOUNDATION_BUILDER_REVIEW_IMPORTS,
  FORBIDDEN_FOUNDATION_BUILDER_REVIEW_SRC,
  reviewEntriesForIndex,
} from '../src/site00/pages/foundation/digitalFoundationReviewRegistry';

describe('digital foundation review builder ownership', () => {
  const reviewBundle = [
    readFileSync('src/site00/pages/foundation/DigitalFoundationReviewPage.tsx', 'utf8'),
    readFileSync('src/site00/pages/foundation/DigitalFoundationReviewGallery.tsx', 'utf8'),
    readFileSync('src/site00/pages/foundation/DigitalFoundationReviewPreviewHost.tsx', 'utf8'),
  ].join('\n');

  it('locks registry version and approved builder source', () => {
    expect(DIGITAL_FOUNDATION_REVIEW_REGISTRY_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}-/);
    expect(APPROVED_FOUNDATION_BUILDER_SOURCE).toContain('P03Configure');
  });

  it('does not iframe or route review through the public SITE 00 builder', () => {
    expect(reviewBundle).not.toContain(FORBIDDEN_FOUNDATION_BUILDER_REVIEW_SRC);
    expect(reviewBundle).not.toContain('BuilderStudio');
    expect(reviewBundle).not.toContain('BldrSpatialStudioPage');
    expect(reviewBundle).not.toContain('<iframe');
    for (const forbidden of FORBIDDEN_FOUNDATION_BUILDER_REVIEW_IMPORTS) {
      expect(reviewBundle).not.toContain(forbidden);
    }
  });

  it('blocks legacy BLDR anchors with explicit wrong-product panel', () => {
    expect(reviewBundle).toContain('LegacyPublicBuilderBlocked');
    expect(reviewBundle).toContain('WRONG PRODUCT BLOCKED');
    expect(reviewBundle).toContain('df-r-bldr-');
  });

  it('routes registry entries through the continuous gallery', () => {
    expect(reviewBundle).toContain('DigitalFoundationReviewGallery');
    expect(reviewBundle).toContain('df-review__strip');
    expect(reviewBundle).toContain('DigitalFoundationReviewPreviewHost');
    expect(reviewBundle).not.toContain('df-review-stage');
    const inlineCount = reviewEntriesForIndex().filter(
      (e) => e.renderMode === 'inline_df_screen' || e.renderMode === 'inline_founder_shell',
    ).length;
    expect(inlineCount).toBeGreaterThan(15);
  });
});
