import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { allReviewAnchors } from '../src/site00/pages/foundation/reviewGalleryRegistry';
import { reviewAnchorForView, reviewScreenUrl } from '../src/site00/pages/foundation/reviewLinks';

const ANCHORS = allReviewAnchors();

describe('foundation review direct links', () => {
  it('builds an absolute review URL for every screen', () => {
    for (const anchor of ANCHORS) {
      expect(reviewScreenUrl(anchor, 'https://review.example')).toBe(
        `https://review.example/foundation/review#${anchor}`,
      );
    }
  });

  it('strips a trailing slash from the origin', () => {
    expect(reviewScreenUrl('df-r-P02', 'https://review.example/')).toBe(
      'https://review.example/foundation/review#df-r-P02',
    );
  });

  it('renders direct addresses for gallery screens', () => {
    const page = readFileSync('src/site00/pages/foundation/DigitalFoundationReviewPage.tsx', 'utf8');
    expect(page).toContain('className="df-review__direct"');
    expect(page.match(/<DirectLink /g)?.length ?? 0).toBeGreaterThanOrEqual(10);
  });

  it('maps review steps to anchor ids', () => {
    expect(reviewAnchorForView('P04')).toBe('df-r-P04');
    expect(reviewAnchorForView('OVERVIEW')).toBe('df-r-OVERVIEW');
  });

  it('advances the intake flow by scrolling, not routing away from review', () => {
    const page = readFileSync('src/site00/pages/foundation/DigitalFoundationReviewPage.tsx', 'utf8');
    expect(page).toContain("advance('P04')");
    expect(page).toContain('scrollToReviewAnchor');
    expect(page).not.toContain('navigate(');
  });
});
