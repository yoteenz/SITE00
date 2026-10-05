/**
 * Sequence Cohesion Gate — maximum compositional range within one recognizable system.
 */

import type { CarouselSlideRecord } from '../canonicalCarouselExpansionTypes.js';
import {
  detectAccentColorDrift,
  detectResizeOnlySequenceFailure,
  detectSlide01Outlier,
} from './driftDetection.js';
import type { CohesionGateResult } from './constants.js';
import type { SequenceCohesionDimensionResult, SequenceCohesionGateReport, SequenceCreativeSystem } from './types.js';

function gateResult(value: CohesionGateResult): CohesionGateResult {
  return value;
}

export function runSequenceCohesionGate(params: {
  sequenceSystem: SequenceCreativeSystem;
  slides: CarouselSlideRecord[];
  visionAvailable?: boolean;
}): SequenceCohesionGateReport {
  const anchor = params.slides.find((s) => s.slideNumber === params.sequenceSystem.anchorFrameIndex) ?? params.slides[0];
  const subsequent = params.slides.filter((s) => s.slideNumber > (anchor?.slideNumber ?? 1));
  const driftWarnings = anchor ? detectAccentColorDrift({ anchorSlide: anchor, subsequentSlides: subsequent, sequenceSystem: params.sequenceSystem }) : [];

  const dimensions: SequenceCohesionDimensionResult[] = [];
  dimensions.push({
    dimension: 'PALETTE_COHERENCE',
    result: gateResult(driftWarnings.length ? 'WARN' : 'PASS'),
    notes: driftWarnings,
  });

  const typographyDrift = subsequent.filter(
    (s) => anchor && s.typography.fontRole !== anchor.typography.fontRole,
  ).length;
  dimensions.push({
    dimension: 'TYPOGRAPHY_COHERENCE',
    result: gateResult(typographyDrift > subsequent.length / 2 ? 'FAIL' : 'PASS'),
    notes: typographyDrift ? [`${typographyDrift} frames shift typography role`] : [],
  });

  const uniqueCompositions = new Set(params.slides.map((s) => s.compositionMode)).size;
  dimensions.push({
    dimension: 'COMPOSITIONAL_VARIETY',
    result: gateResult(uniqueCompositions <= 1 && params.slides.length > 2 ? 'FAIL' : 'PASS'),
    notes: uniqueCompositions <= 1 ? ['resize-only sequence risk'] : [`${uniqueCompositions} composition modes`],
  });

  dimensions.push({
    dimension: 'RECOGNITION_CONTINUITY',
    result: gateResult(anchor && detectSlide01Outlier({ anchorSlide: anchor, subsequentSlides: subsequent }) ? 'WARN' : 'PASS'),
    notes: [],
  });

  dimensions.push({
    dimension: 'ACCENT_DISCIPLINE',
    result: gateResult(driftWarnings.length ? 'WARN' : 'PASS'),
    notes: driftWarnings,
  });

  const resizeOnly = detectResizeOnlySequenceFailure(params.slides);
  if (resizeOnly) {
    dimensions.push({
      dimension: 'RESIZE_ONLY_SEQUENCE',
      result: gateResult('FAIL'),
      notes: ['Slides appear to be layout clones of anchor'],
    });
  }

  const unexplainedDeviations = params.sequenceSystem.plannedDeviations.filter((d) => d.intentionality === 'UNEXPLAINED');
  dimensions.push({
    dimension: 'CONTROLLED_DEVIATION_VALIDITY',
    result: gateResult(unexplainedDeviations.length ? 'FAIL' : 'PASS'),
    notes: unexplainedDeviations.map((d) => `Frame ${d.frameIndex}: unexplained ${d.propertyBeingBroken}`),
  });

  if (!params.visionAvailable) {
    dimensions.push({
      dimension: 'POST_GENERATION_VISION_QA',
      result: gateResult('NOT_EVALUATED'),
      notes: ['Vision unavailable — NEEDS_HUMAN_REVIEW'],
    });
  }

  const failed = dimensions.some((d) => d.result === 'FAIL');
  const warned = dimensions.some((d) => d.result === 'WARN');

  return {
    passed: !failed,
    overallResult: failed ? 'FAIL' : warned ? 'WARN' : params.visionAvailable ? 'PASS' : 'NOT_EVALUATED',
    dimensions,
    driftWarnings,
    intentionalDeviations: params.sequenceSystem.plannedDeviations.filter((d) => d.intentionality === 'DELIBERATE'),
    visionEvaluated: Boolean(params.visionAvailable),
  };
}

export function runTypographySequenceRecognitionTest(slides: CarouselSlideRecord[]): boolean {
  if (slides.length < 2) return true;
  const roles = slides.map((s) => s.typography.fontRole).filter(Boolean);
  const unique = new Set(roles);
  return unique.size <= Math.ceil(slides.length / 2) + 1;
}
