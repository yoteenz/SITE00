import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { allReviewAnchors } from '../src/site00/pages/foundation/reviewGalleryRegistry';

describe('Digital Foundation review gallery page', () => {
  const page = readFileSync('src/site00/pages/foundation/DigitalFoundationReviewPage.tsx', 'utf8');

  it('mounts full portal components (not InterimOverview)', () => {
    expect(page).toContain('P07ProjectOverview');
    expect(page).not.toContain('InterimOverview');
    expect(page).toContain('P08Roadmap');
    expect(page).toContain('P10NeedsYou');
    expect(page).toContain('RecordsLibrary');
    expect(page).toContain('CommunicationPreferences');
    expect(page).toContain('DigitalFoundationCompleteSurface');
  });

  it('uses review-safe modes for mutating surfaces', () => {
    expect(page).toContain('reviewMode');
    expect(page).toContain('REVIEW_FIXTURE_IDS');
  });

  it('wires review anchors through the canonical helpers', () => {
    expect(page).toContain('reviewAnchorForView');
    expect(page).toContain('reviewAnchorForBldrRoom');
    expect(page).toContain('REVIEW_ANCHOR_COMPLETE');
    expect(page).toContain('REVIEW_ANCHOR_DIGITAL_LOCATION');
    expect(allReviewAnchors().length).toBeGreaterThanOrEqual(18);
  });

  it('preserves BLDR PLACE room in the registry', () => {
    expect(allReviewAnchors()).toContain('df-r-bldr-PLACE');
  });
});
