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
  const reviewPage = readFileSync('src/site00/pages/foundation/DigitalFoundationReviewPage.tsx', 'utf8');

  it('locks registry version and approved builder source', () => {
    expect(DIGITAL_FOUNDATION_REVIEW_REGISTRY_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}-/);
    expect(APPROVED_FOUNDATION_BUILDER_SOURCE).toContain('P03Configure');
  });

  it('does not iframe or route review through the public SITE 00 builder', () => {
    expect(reviewPage).not.toContain(FORBIDDEN_FOUNDATION_BUILDER_REVIEW_SRC);
    expect(reviewPage).not.toContain('BuilderStudio');
    expect(reviewPage).not.toContain('BldrSpatialStudioPage');
    expect(reviewPage).not.toContain('<iframe');
    for (const forbidden of FORBIDDEN_FOUNDATION_BUILDER_REVIEW_IMPORTS) {
      expect(reviewPage).not.toContain(forbidden);
    }
  });

  it('blocks legacy BLDR anchors with redirect panel copy', () => {
    expect(reviewPage).toContain('LegacyPublicBuilderRedirect');
    expect(reviewPage).toContain('WRONG PRODUCT BLOCKED');
    expect(reviewPage).toContain('DEPRECATED_BLDR_ROOMS');
    expect(reviewPage).toContain('df-r-bldr-');
  });

  it('indexes inline review screens from the registry', () => {
    const anchors = reviewEntriesForIndex()
      .filter((e) => e.renderMode === 'inline_df_screen' || e.renderMode === 'legacy_redirect')
      .map((e) => e.anchorId);
    for (const anchor of anchors) {
      if (anchor.startsWith('df-r-bldr-')) continue;
      expect(reviewPage).toContain(`id="${anchor}"`);
    }
    expect(reviewPage).toContain('LegacyPublicBuilderRedirect');
  });
});
