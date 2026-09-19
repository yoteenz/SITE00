/**
 * Experiment C run-scoped supersession — stop generation without deleting creative.
 */

import type {
  CanonicalCarouselExpansionRun,
  CarouselDirectionCarousel,
  CarouselExpansionStatus,
  CarouselSupersessionRecord,
} from './canonicalCarouselExpansionTypes.js';
import { CAROUSEL_TOTAL_SLIDES } from './canonicalCarouselExpansionConstants.js';
import { CONCEPT_TERRITORY_METHODOLOGY_VERSION } from './conceptTerritory/conceptTerritoryConstants.js';

export const CAROUSEL_SUPERSEDED_STATUS = 'SUPERSEDED_BY_METHODOLOGY' as const satisfies CarouselExpansionStatus;

export const ACTIVE_CAROUSEL_STATUSES: CarouselExpansionStatus[] = [
  'NOT_STARTED',
  'LOADING_COVERS',
  'BUILDING_WORLD_BIBLES',
  'GENERATING_SLIDE',
  'ANALYZING',
];

export function isCarouselRunSuperseded(run: CanonicalCarouselExpansionRun | null | undefined): boolean {
  return run?.status === CAROUSEL_SUPERSEDED_STATUS;
}

export function isCarouselRunGenerationBlocked(run: CanonicalCarouselExpansionRun | null | undefined): boolean {
  if (!run) return false;
  return isCarouselRunSuperseded(run);
}

export function countGeneratedSlides(direction: CarouselDirectionCarousel): number {
  return direction.slides.filter(
    (s) => s.preserved || s.generationReceipt?.firstGenerationResult === 'SUCCESS',
  ).length;
}

export function countPendingSlides(run: CanonicalCarouselExpansionRun): number {
  let pending = 0;
  for (const dir of run.directions) {
    for (const slide of dir.slides) {
      if (slide.preserved) continue;
      if (slide.generationReceipt?.firstGenerationResult !== 'SUCCESS' || !slide.asset) {
        pending += 1;
      }
    }
  }
  return pending;
}

export function countGeneratedSlidesRun(run: CanonicalCarouselExpansionRun): number {
  return run.directions.reduce((sum, d) => sum + countGeneratedSlides(d), 0);
}

export function buildDirectionCarouselStatus(
  direction: CarouselDirectionCarousel,
): 'SUPERSEDED_PARTIAL' | 'SUPERSEDED_COMPLETE' {
  const generated = countGeneratedSlides(direction);
  return generated >= CAROUSEL_TOTAL_SLIDES ? 'SUPERSEDED_COMPLETE' : 'SUPERSEDED_PARTIAL';
}

export function buildSupersessionRecord(
  run: CanonicalCarouselExpansionRun,
  inFlightCount = 0,
): CarouselSupersessionRecord {
  const plannedSlideCount = run.directions.length * CAROUSEL_TOTAL_SLIDES;
  const generatedSlideCount = countGeneratedSlidesRun(run);
  const cancelledPendingCount = countPendingSlides(run);
  const plannedAssetCount = run.directions.length * (CAROUSEL_TOTAL_SLIDES - 1);
  const generatedAssetCount = run.directions.reduce((sum, d) => {
    return (
      sum +
      d.slides.filter(
        (s) => !s.preserved && s.generationReceipt?.firstGenerationResult === 'SUCCESS',
      ).length
    );
  }, 0);

  return {
    runId: run.runId,
    supersededAt: new Date().toISOString(),
    supersededReason:
      'Creative Concept Territory methodology introduced after current expansion demonstrated excessive visual convergence around a shared parent concept. Generation intentionally stopped to prevent unnecessary provider spend.',
    supersededByMethodologyVersion: CONCEPT_TERRITORY_METHODOLOGY_VERSION,
    plannedAssetCount,
    generatedAssetCount,
    plannedSlideCount,
    generatedSlideCount,
    cancelledPendingCount,
    inFlightCountAtCancellation: inFlightCount,
    providerRequestsAfterCancellationBoundary: 0,
    generationCostBeforeCancellation:
      (run.accounting.falCostUsd ?? 0) + (run.accounting.gptImage2CostUsd ?? 0),
    generationCostAfterCancellationBoundary: 0,
  };
}

export function applyCarouselSupersession(
  run: CanonicalCarouselExpansionRun,
  inFlightCount = 0,
): CanonicalCarouselExpansionRun {
  const supersession = buildSupersessionRecord(run, inFlightCount);
  const directions = run.directions.map((d) => ({
    ...d,
    carouselStatus: buildDirectionCarouselStatus(d),
    generatedSlideCount: countGeneratedSlides(d),
    plannedSlideCount: CAROUSEL_TOTAL_SLIDES,
  }));

  return {
    ...run,
    status: CAROUSEL_SUPERSEDED_STATUS,
    supersession,
    methodologyLineage: 'PRE_CONCEPT_TERRITORY_METHODOLOGY',
    directions,
    currentDirectionIndex: null,
    currentSlideNumber: null,
    error: null,
    completedAt: run.completedAt ?? supersession.supersededAt,
  };
}

export function isExperimentCSupersessionEnforced(): boolean {
  return process.env.SITE00_EXPERIMENT_C_SUPERSESSION_DISABLED !== '1';
}

export function shouldAutoSupersedeExperimentC(run: CanonicalCarouselExpansionRun): boolean {
  if (!isExperimentCSupersessionEnforced()) return false;
  if (isCarouselRunSuperseded(run)) return false;
  if (run.status === 'COMPLETE') return false;
  if (run.status === 'BLOCKED_MISSING_COVERS') return false;
  if (run.directions.length > 0) return true;
  return ACTIVE_CAROUSEL_STATUSES.includes(run.status);
}

export function isExperimentCSupersessionError(message: string): boolean {
  return message.includes('EXPERIMENT SUPERSEDED');
}

export function assertCarouselGenerationAllowed(run: CanonicalCarouselExpansionRun | null): void {
  if (!run) return;
  if (isCarouselRunSuperseded(run)) {
    throw new Error('EXPERIMENT SUPERSEDED — Creative Concept Territory methodology active; generation read-only');
  }
}
