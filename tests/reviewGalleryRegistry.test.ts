import { describe, expect, it } from 'vitest';
import {
  allReviewAnchors,
  BLDR_REVIEW_ROOMS,
  COMMERCE_VIEWS,
  INTAKE_VIEWS,
  PORTAL_VIEWS,
  REVIEW_ANCHOR_COMPLETE,
  REVIEW_ANCHOR_DIGITAL_LOCATION,
  REVIEW_FIXTURE_IDS,
} from '../src/site00/pages/foundation/reviewGalleryRegistry';
import { reviewAnchorForView } from '../src/site00/pages/foundation/reviewLinks';

describe('review gallery registry', () => {
  it('lists canonical preview fixtures', () => {
    expect(REVIEW_FIXTURE_IDS.quote).toBe('A_BASE');
    expect(REVIEW_FIXTURE_IDS.portalPaid).toBe('J_PAYMENT_SUCCESS');
    expect(REVIEW_FIXTURE_IDS.completeCredit).toBe('M_COMPLETE_CREDIT');
  });

  it('keeps intake P01–P06 and portal views in inventory', () => {
    expect(INTAKE_VIEWS).toEqual(['P01', 'P02', 'P03']);
    expect(COMMERCE_VIEWS).toEqual(['P04', 'P05', 'P06']);
    expect(PORTAL_VIEWS).toContain('OVERVIEW');
    expect(PORTAL_VIEWS).toContain('ROADMAP');
    expect(PORTAL_VIEWS).toContain('NEEDS_YOU');
    expect(PORTAL_VIEWS).toContain('RECORDS');
    expect(PORTAL_VIEWS).toContain('COMM_PREFS');
  });

  it('registers unique anchors including BLDR and completion', () => {
    const anchors = allReviewAnchors();
    expect(new Set(anchors).size).toBe(anchors.length);
    expect(anchors).toContain(reviewAnchorForView('OVERVIEW'));
    expect(anchors).toContain(REVIEW_ANCHOR_COMPLETE);
    expect(anchors).toContain(REVIEW_ANCHOR_DIGITAL_LOCATION);
    expect(anchors).toContain('df-r-bldr-PLACE');
    expect(BLDR_REVIEW_ROOMS).toHaveLength(5);
  });
});
