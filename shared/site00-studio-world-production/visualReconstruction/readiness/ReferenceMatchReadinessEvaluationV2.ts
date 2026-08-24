/**
 * Reference match readiness v2 — design grammar + brand cannot be masked by pixel score.
 */

import type {
  ReferenceMatchReadinessEvaluationV2,
  RenderedReferenceComparison,
  VisualRegionLock,
} from '../types.js';
import { evaluateReferenceMatchReadiness } from './ReferenceMatchReadinessEvaluation.js';

export type ReadinessV2Input = {
  comparison: RenderedReferenceComparison;
  locks: VisualRegionLock[];
  designGrammarScore: number;
  brandScore: number;
  responsiveScore: number;
  artworkScore: number;
  palettePass: boolean;
  hostClientPass: boolean;
  focalPass: boolean;
  criticalFailures: string[];
};

export function evaluateReferenceMatchReadinessV2(input: ReadinessV2Input): ReferenceMatchReadinessEvaluationV2 {
  const base = evaluateReferenceMatchReadiness(input.comparison, input.locks);
  const critical = input.criticalFailures.filter(Boolean);

  const brandEssence = input.brandScore >= 0.65;
  const composition = input.designGrammarScore >= 0.6;
  const artworkAuthority = input.artworkScore >= 0.55;
  const responsiveRelationship = input.responsiveScore >= 0.5;

  const ready =
    base.ready &&
    brandEssence &&
    composition &&
    artworkAuthority &&
    input.palettePass &&
    input.hostClientPass &&
    critical.length === 0;

  return {
    ...base,
    ready,
    blockedReason: ready
      ? null
      : critical[0] ?? base.blockedReason ?? 'Design fidelity or brand essence failed',
    pixelSimilarity: base.overallSimilarity,
    palette: input.palettePass,
    brandEssence,
    hostClientAuthority: input.hostClientPass,
    artworkAuthority,
    composition,
    spatialRhythm: input.designGrammarScore >= 0.5,
    scaleContrast: input.designGrammarScore >= 0.45,
    containerDependence: input.designGrammarScore >= 0.5,
    asymmetry: input.designGrammarScore >= 0.45,
    relationalAlignment: input.designGrammarScore >= 0.5,
    focalHierarchy: input.focalPass,
    responsiveRelationship,
    designGrammarScore: input.designGrammarScore,
    brandScore: input.brandScore,
    criticalFailures: critical,
  };
}

export function pixelScoreCannotOverrideDesignFailure(
  pixelSimilarity: number,
  designGrammarScore: number,
  brandScore: number,
  responsiveScore: number,
): boolean {
  if (pixelSimilarity > 0.9 && designGrammarScore < 0.55) return true;
  if (pixelSimilarity > 0.9 && brandScore < 0.6) return true;
  if (pixelSimilarity > 0.85 && responsiveScore < 0.45) return true;
  return false;
}
