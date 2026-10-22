import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { reviewAnchorForView, reviewScreenUrl } from '../src/site00/pages/foundation/reviewLinks';

const ANCHORS = [
  'df-r-P01',
  'df-r-P02',
  'df-r-P03',
  'df-r-P04',
  'df-r-P05',
  'df-r-P06',
  'df-r-OVERVIEW',
  'df-r-bldr-PLACE',
  'df-r-bldr-FEEL',
  'df-r-bldr-WORK',
  'df-r-bldr-PACE',
  'df-r-bldr-BLUEPRINT',
];

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

  it('renders deep-link markers on the preview stage chrome', () => {
    const host = readFileSync('src/site00/pages/foundation/DigitalFoundationReviewPreviewHost.tsx', 'utf8');
    expect(host).toContain('className="df-review__direct"');
    expect(host.match(/df-review__direct/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
  });

  it('collapses the review nav by default on mobile preview', () => {
    const page = readFileSync('src/site00/pages/foundation/DigitalFoundationReviewPage.tsx', 'utf8');
    const nav = readFileSync('src/site00/pages/foundation/DigitalFoundationReviewNav.tsx', 'utf8');
    expect(page).toContain('DigitalFoundationReviewNav');
    expect(nav).toContain('df-review__nav-shell');
    expect(nav).toContain('SHOW REGISTRY');
    const css = readFileSync('src/site00/styles/site00-df-client.css', 'utf8');
    expect(css).toMatch(/\.df-review__nav-shell--open \.df-review__nav[\s\S]*display: flex/);
    expect(css).toMatch(/\.df-review__nav \{[\s\S]*display: none/);
  });

  it('maps review steps to anchor ids', () => {
    expect(reviewAnchorForView('P04')).toBe('df-r-P04');
    expect(reviewAnchorForView('OVERVIEW')).toBe('df-r-OVERVIEW');
  });

  it('advances the intake flow by scrolling, not routing away from review', () => {
    const page = readFileSync('src/site00/pages/foundation/DigitalFoundationReviewPage.tsx', 'utf8');
    const host = readFileSync('src/site00/pages/foundation/DigitalFoundationReviewPreviewHost.tsx', 'utf8');
    expect(host).toContain("advance('P04')");
    expect(host).toContain('scrollToReviewAnchor');
    expect(page).toMatch(/navigateToReviewAnchor|scrollToReviewAnchor/);
    expect(host).not.toContain('useNavigate(');
  });
});
