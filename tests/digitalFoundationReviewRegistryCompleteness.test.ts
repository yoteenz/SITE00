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
    expect(DIGITAL_FOUNDATION_REVIEW_REGISTRY_VERSION).toContain('coverage');
    const totals = registryCoverageTotals();
    expect(totals.discovered).toBeGreaterThan(60);
    expect(totals.auth_gated).toBeGreaterThanOrEqual(35);
  });

  it('includes every required sprint group bucket', () => {
    const groups = new Set(allReviewRegistryEntries().map((e) => e.group));
    for (const g of REVIEW_GROUP_ORDER) {
      expect(groups.has(g)).toBe(true);
    }
  });

  it('declares client portal and founder workspace entries in source', () => {
    const page = readFileSync('src/site00/pages/foundation/DigitalFoundationReviewPage.tsx', 'utf8');
    expect(page).toContain('df-r-OVERVIEW');
    expect(page).toContain('df-r-ROADMAP');
    expect(page).toContain('df-r-NEEDS_YOU');
    expect(page).toContain('df-r-proposal-ready');
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
