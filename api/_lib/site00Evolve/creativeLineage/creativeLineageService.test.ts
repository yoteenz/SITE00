/**
 * Creative lineage service integration tests.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import type { CanonicalCreativeRangeRun } from '../../../../shared/site00-brand-lore/canonicalCreativeRangeTypes.js';
import { CANONICAL_NDXBOOK_DIRECTION_NAMES } from '../../../../shared/site00-brand-lore/canonicalCreativeRangeConstants.js';

vi.mock('../creativeDirection/canonicalCreativeRange/canonicalCreativeRangeService.js', () => ({
  getCanonicalCreativeRangeRun: vi.fn(),
}));
vi.mock('../creativeDirection/canonicalCarouselExpansion/canonicalCarouselExpansionService.js', () => ({
  getCanonicalCarouselExpansionRun: vi.fn(),
}));

import { getCanonicalCreativeRangeRun } from '../creativeDirection/canonicalCreativeRange/canonicalCreativeRangeService.js';
import { getCanonicalCarouselExpansionRun } from '../creativeDirection/canonicalCarouselExpansion/canonicalCarouselExpansionService.js';
import { normalizeNdxbookCreativeLineage, createWinningWorldPromotionPlan } from './creativeLineageService.js';
import * as store from './storeAdapter.js';

function mockRangeRun(): CanonicalCreativeRangeRun {
  const directions = CANONICAL_NDXBOOK_DIRECTION_NAMES.map((name, i) => ({
    comparisonIndex: i + 1,
    directionId: randomUUID(),
    canonicalName: name,
    sourceFormationId: randomUUID(),
    sourceFormationVersion: i < 3 ? 1 : 2,
    provenance: {
      directionId: randomUUID(),
      canonicalName: name,
      sourceRecord: 'test',
      sourceVersion: 1,
      sourceFormationId: randomUUID(),
      approvalState: 'APPROVED',
      coreDirectionAvailable: true,
      directionExpressionAvailable: true,
      creativeExpressionAvailable: true,
      identityArtDirectionAvailable: true,
      visualBriefAvailable: true,
      formatLineageAvailable: true,
      personalityLineageAvailable: true,
      missingLayers: [],
    },
    dnaEnvelope: null,
    formatSelection: null,
    directionExpression: null,
    identityArtDirection: null,
    creativeExpression: null,
    heroConcept: null,
    heroBrief: null,
    heroAsset: {
      assetId: `hero-${i + 1}`,
      storagePath: `site00/validation/ndxbook/canonical-creative-range/${String(i + 1).padStart(2, '0')}/hero.webp`,
      topic: 'credit utilization',
      provider: 'openai/gpt-image-2' as const,
      generatedAt: new Date().toISOString(),
    },
    generationReceipt: null,
    contaminationTest: null,
    firstPassStatus: 'STRONG' as const,
    founderJudgment: null,
  }));
  return {
    experimentClassification: 'CANONICAL_CREATIVE_RANGE_VALIDATION',
    runId: 'test',
    organizationId: 'org',
    projectId: 'ndxbook',
    status: 'COMPLETE',
    currentDirectionIndex: null,
    rosterTest: null,
    provenanceReports: [],
    distinctivenessPairs: [],
    directions,
    observedFormatDiversity: null,
    audit: null,
    accounting: { anthropicRequests: 0, falRequests: 6, estimatedCostUsd: 0 },
    error: null,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
}

describe('creative lineage service', () => {
  beforeEach(() => {
    store.resetCreativeLineageMemory();
    vi.mocked(getCanonicalCreativeRangeRun).mockResolvedValue(mockRangeRun());
    vi.mocked(getCanonicalCarouselExpansionRun).mockResolvedValue(null);
  });

  it('normalizes validation heroes into asset records', async () => {
    const { normalized } = await normalizeNdxbookCreativeLineage();
    expect(normalized.assetsNormalized).toBeGreaterThanOrEqual(6);
    expect(normalized.conceptsNormalized).toBe(6);
    expect(normalized.familiesNormalized).toBeGreaterThanOrEqual(6);
  });

  it('promotion plan is draft and not auto-triggered', async () => {
    const plan = await createWinningWorldPromotionPlan({
      winningDirectionId: 'dir-1',
      winningDirectionName: 'THE MARKED-UP COPY',
      winningWorldId: 'world-1',
    });
    expect(plan.status).toBe('DRAFT');
    expect(plan.autoTriggered).toBe(false);
  });
});
