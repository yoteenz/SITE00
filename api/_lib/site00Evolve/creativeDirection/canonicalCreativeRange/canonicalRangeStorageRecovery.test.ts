import { describe, expect, it } from 'vitest';
import { shouldReconcileCanonicalRangeRun } from './canonicalRangeStorageRecovery.js';
import type { CanonicalCreativeRangeRun } from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeTypes.js';
import { CANONICAL_CREATIVE_RANGE_EXPERIMENT } from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeConstants.js';

function baseRun(overrides: Partial<CanonicalCreativeRangeRun>): CanonicalCreativeRangeRun {
  return {
    experimentClassification: CANONICAL_CREATIVE_RANGE_EXPERIMENT,
    runId: 'ndxbook-canonical-creative-range',
    organizationId: '7681ab75-bddc-43e5-b594-79fcf8168205',
    projectId: 'ndxbook',
    status: 'GENERATING_DIRECTION',
    currentDirectionIndex: 1,
    rosterTest: null,
    provenanceReports: [],
    distinctivenessPairs: [],
    directions: [],
    observedFormatDiversity: null,
    audit: null,
    accounting: { anthropicRequests: 0, falRequests: 0, estimatedCostUsd: 0 },
    error: null,
    startedAt: null,
    completedAt: null,
    ...overrides,
  };
}

describe('shouldReconcileCanonicalRangeRun', () => {
  it('reconciles null run', () => {
    expect(shouldReconcileCanonicalRangeRun(null)).toBe(true);
  });

  it('does not reconcile complete six-direction run', () => {
    const run = baseRun({
      status: 'COMPLETE',
      directions: Array.from({ length: 6 }, (_, i) => ({
        comparisonIndex: i + 1,
        heroAsset: { storagePath: `path/${i + 1}/hero.webp` },
      })) as CanonicalCreativeRangeRun['directions'],
    });
    expect(shouldReconcileCanonicalRangeRun(run)).toBe(false);
  });

  it('reconciles stuck generating run with zero heroes', () => {
    const run = baseRun({ status: 'GENERATING_DIRECTION', directions: [] });
    expect(shouldReconcileCanonicalRangeRun(run)).toBe(true);
  });
});
