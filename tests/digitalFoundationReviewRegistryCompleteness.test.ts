import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  allReviewRegistryEntries,
  DIGITAL_FOUNDATION_REVIEW_REGISTRY_VERSION,
  registryCoverageTotals,
  REVIEW_GROUP_ORDER,
} from '../src/site00/pages/foundation/digitalFoundationReviewRegistry';

describe('digital foundation review registry completeness', () => {
  it('uses coverage registry version and registers far more than the old 12-link index', () => {
    expect(DIGITAL_FOUNDATION_REVIEW_REGISTRY_VERSION).toContain('gallery-restoration');
    const totals = registryCoverageTotals();
    expect(totals.discovered).toBeGreaterThan(85);
    expect(totals.reviewable).toBeGreaterThan(35);
    expect(totals.auth_gated).toBeGreaterThanOrEqual(20);
  });

  it('includes every required sprint group bucket', () => {
    const groups = new Set(allReviewRegistryEntries().map((e) => e.group));
    for (const g of REVIEW_GROUP_ORDER) {
      expect(groups.has(g)).toBe(true);
    }
  });

  it('declares client portal and founder workspace entries in source', () => {
    const page = readFileSync('src/site00/pages/foundation/DigitalFoundationReviewPage.tsx', 'utf8');
    const host = readFileSync('src/site00/pages/foundation/DigitalFoundationReviewPreviewHost.tsx', 'utf8');
    const gallery = readFileSync('src/site00/pages/foundation/DigitalFoundationReviewGallery.tsx', 'utf8');
    expect(page).toContain('DigitalFoundationReviewGallery');
    expect(gallery).toContain('df-review__strip');
    expect(host).toContain('df-r-proposal-ready');
    expect(host).toContain('DigitalFoundationReviewClientPortalHost');
    expect(host).toContain('DigitalFoundationReviewFounderHost');
    expect(page).toContain('DigitalFoundationReviewNav');
    expect(page).toContain('loadReviewBootstrapBundle');
  });

  it('ships offline fixture snapshots for recommendation recovery', () => {
    const raw = readFileSync('src/site00/pages/foundation/generated/reviewFixtureSnapshots.json', 'utf8');
    const json = JSON.parse(raw) as { fixtures: Record<string, unknown> };
    expect(json.fixtures.A_BASE).toBeTruthy();
    expect(json.fixtures.INTAKE_SUBMITTED).toBeTruthy();
    expect(json.fixtures.PROPOSAL_READY).toBeTruthy();
  });
});
