/**
 * Experiment C supersession + cancellation regression tests.
 */

import { describe, expect, it } from 'vitest';
import {
  applyCarouselSupersession,
  assertCarouselGenerationAllowed,
  buildSupersessionRecord,
  CAROUSEL_SUPERSEDED_STATUS,
  countGeneratedSlidesRun,
  countPendingSlides,
  isCarouselRunGenerationBlocked,
  isCarouselRunSuperseded,
  isExperimentCSupersessionError,
  shouldAutoSupersedeExperimentC,
} from './canonicalCarouselSupersession.js';
import type { CanonicalCarouselExpansionRun } from './canonicalCarouselExpansionTypes.js';
import { CANONICAL_CAROUSEL_EXPANSION_EXPERIMENT } from './canonicalCarouselExpansionConstants.js';

function mockRun(overrides: Partial<CanonicalCarouselExpansionRun> = {}): CanonicalCarouselExpansionRun {
  return {
    experimentClassification: CANONICAL_CAROUSEL_EXPANSION_EXPERIMENT,
    runId: 'ndxbook-canonical-carousel-expansion',
    organizationId: 'org',
    projectId: 'ndxbook',
    carouselExperimentVersion: 'carousel-v1',
    status: 'GENERATING_SLIDE',
    currentDirectionIndex: 1,
    currentSlideNumber: 3,
    sharedTopic: null,
    directions: [
      {
        comparisonIndex: 1,
        directionId: 'd1',
        directionName: 'THE MARKED-UP COPY',
        cover: null,
        worldBible: null,
        slides: [
          { slideNumber: 1, preserved: true } as never,
          { slideNumber: 2, preserved: false, asset: { storagePath: 'a' }, generationReceipt: { firstGenerationResult: 'SUCCESS' } } as never,
          { slideNumber: 3, preserved: false, asset: null, generationReceipt: null } as never,
        ],
        dnaEnvelope: null,
        compositionModesUsed: [],
        paletteRecognitionTest: 'NOT_EVALUATED',
        founderVerdict: null,
        founderNote: null,
        rangeAnalysis: null,
      },
    ],
    crossDirectionPairs: [],
    emergentDna: null,
    contaminationTest: null,
    accounting: { falCostUsd: 1.2, gptImage2CostUsd: 0.5 } as never,
    error: null,
    startedAt: '2026-01-01T00:00:00Z',
    completedAt: null,
    ...overrides,
  };
}

describe('EXPERIMENT_C_ACTIVE_RUN_DETECTION_TEST', () => {
  it('detects active partial run for supersession', () => {
    expect(shouldAutoSupersedeExperimentC(mockRun())).toBe(true);
    expect(shouldAutoSupersedeExperimentC(mockRun({ status: 'COMPLETE' }))).toBe(false);
  });
});

describe('EXPERIMENT_C_SUPERSESSION_TEST', () => {
  it('applies SUPERSEDED_BY_METHODOLOGY with record', () => {
    const superseded = applyCarouselSupersession(mockRun(), 1);
    expect(superseded.status).toBe(CAROUSEL_SUPERSEDED_STATUS);
    expect(superseded.supersession?.runId).toBe('ndxbook-canonical-carousel-expansion');
    expect(superseded.methodologyLineage).toBe('PRE_CONCEPT_TERRITORY_METHODOLOGY');
  });
});

describe('PENDING_GENERATION_CANCEL_TEST', () => {
  it('counts pending slides as cancelled queue', () => {
    const run = mockRun();
    expect(countPendingSlides(run)).toBeGreaterThan(0);
    const record = buildSupersessionRecord(run, 0);
    expect(record.cancelledPendingCount).toBeGreaterThan(0);
  });
});

describe('NO_PROVIDER_DISPATCH_AFTER_SUPERSESSION_TEST', () => {
  it('blocks generation after supersession', () => {
    const superseded = applyCarouselSupersession(mockRun());
    expect(() => assertCarouselGenerationAllowed(superseded)).toThrow(/SUPERSEDED/);
    expect(isCarouselRunGenerationBlocked(superseded)).toBe(true);
  });
});

describe('IN_FLIGHT_RESULT_PRESERVATION_TEST', () => {
  it('preserves generated slide counts in supersession record', () => {
    const record = buildSupersessionRecord(mockRun(), 1);
    expect(record.inFlightCountAtCancellation).toBe(1);
    expect(record.generatedSlideCount).toBe(countGeneratedSlidesRun(mockRun()));
    expect(record.providerRequestsAfterCancellationBoundary).toBe(0);
  });
});

describe('PARTIAL_CAROUSEL_VALIDITY_TEST', () => {
  it('marks direction carousel as SUPERSEDED_PARTIAL', () => {
    const superseded = applyCarouselSupersession(mockRun());
    expect(superseded.directions[0]?.carouselStatus).toBe('SUPERSEDED_PARTIAL');
  });
});

describe('SUPERSEDED_NOT_FAILED_TEST', () => {
  it('superseded status is distinct from FAILED', () => {
    expect(CAROUSEL_SUPERSEDED_STATUS).not.toBe('FAILED');
    expect(CAROUSEL_SUPERSEDED_STATUS).not.toBe('REJECTED');
    expect(isCarouselRunSuperseded(applyCarouselSupersession(mockRun()))).toBe(true);
  });
});

describe('REFRESH_CANNOT_RESUME_SUPERSEDED_TEST', () => {
  it('supersession error is recognizable for resume block', () => {
    expect(isExperimentCSupersessionError('EXPERIMENT SUPERSEDED — generation read-only')).toBe(true);
  });
});

describe('RUN_SCOPED_SUPERSESSION_TEST', () => {
  it('does not supersede complete runs', () => {
    expect(shouldAutoSupersedeExperimentC(mockRun({ status: 'COMPLETE', directions: [] }))).toBe(false);
  });
});

describe('CREATIVE_LINEAGE_SURVIVES_SUPERSESSION_TEST', () => {
  it('does not remove generated assets on supersession', () => {
    const superseded = applyCarouselSupersession(mockRun());
    const slide = superseded.directions[0]?.slides[1];
    expect(slide?.asset).toBeTruthy();
    expect(slide?.generationReceipt?.firstGenerationResult).toBe('SUCCESS');
  });
});
