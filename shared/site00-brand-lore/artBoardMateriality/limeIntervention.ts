/**
 * P0.5C.4A + P0.5C.4B.1 — NDX Lime Intervention System (restraint-aware density).
 */

import type {
  LimeFeedDistanceEvaluation,
  LimeInterventionDensity,
  NDXHumanMadeMarkSystem,
  NDXLimeInterventionSystem,
} from './types.js';
import type { LimeFunction } from '../editorialInformationArchitecture/types.js';

export function buildNdxLimeInterventionSystem(params: {
  markSystem: NDXHumanMadeMarkSystem;
  limeFunction: LimeFunction | null;
  topicIndex: number;
}): NDXLimeInterventionSystem {
  const limeMarks = params.markSystem.marks.filter((m) => m.limeApplied);
  const limeIcons = params.markSystem.handDrawnIcons.filter((i) => i.limeApplied);
  const semanticallyJustifiedCount = limeMarks.length + limeIcons.length;
  const totalMarks = params.markSystem.marks.length + params.markSystem.handDrawnIcons.length;

  let density: LimeInterventionDensity = 'SUBTLE';
  if (semanticallyJustifiedCount >= 4) density = 'STRONG';
  else if (semanticallyJustifiedCount >= 2) density = 'MODERATE';
  else if (semanticallyJustifiedCount === 1) density = 'SUBTLE';

  const applicationModes = [
    ...new Set([
      ...limeMarks.map((m) => m.applicationMode),
      ...limeIcons.map((i) => i.applicationMode),
    ]),
  ];

  return {
    density,
    applicationModes,
    interventionSites: [
      ...limeMarks.map((m) => m.semanticPurpose),
      ...limeIcons.map((i) => `hand-drawn ${i.subject} (attention target)`),
    ],
    semanticPurposes: params.limeFunction ? [params.limeFunction] : ['SELECTIVE_SIGNATURE_ACCENT'],
    decorativeOnly: false,
    appliedAfterBaseMaterial: true,
    elementCount: totalMarks,
    semanticallyJustifiedCount,
  };
}

export function evaluateLimeInterventionDensity(params: {
  limeIntervention: NDXLimeInterventionSystem;
}): LimeInterventionDensity {
  const { semanticallyJustifiedCount, decorativeOnly } = params.limeIntervention;
  if (decorativeOnly) return 'OVERUSED';
  if (semanticallyJustifiedCount === 0) return 'SUBTLE';
  if (semanticallyJustifiedCount === 1) return 'SUBTLE';
  if (semanticallyJustifiedCount === 2) return 'MODERATE';
  if (semanticallyJustifiedCount >= 4) return 'STRONG';
  return 'MODERATE';
}

export function limeDensityIndependentFromRawCount(params: {
  elementCount: number;
  semanticallyJustifiedCount: number;
}): boolean {
  return params.elementCount > params.semanticallyJustifiedCount;
}

export function limeCanExceedTwoElementsWhenJustified(lime: NDXLimeInterventionSystem): boolean {
  return lime.semanticallyJustifiedCount > 2 && !lime.decorativeOnly;
}

export function limeNotDecorativeOnly(lime: NDXLimeInterventionSystem): boolean {
  return !lime.decorativeOnly && lime.semanticPurposes.length > 0;
}

export function limeTooPassiveFails(lime: NDXLimeInterventionSystem, topicRequiresIntervention: boolean): boolean {
  return topicRequiresIntervention && lime.semanticallyJustifiedCount === 0;
}

export function evaluateLimeFeedDistance(params: {
  artifactId: string;
  limeIntervention: NDXLimeInterventionSystem;
}): LimeFeedDistanceEvaluation {
  let result: LimeFeedDistanceEvaluation['result'] = 'SUBTLE_BUT_PRESENT';
  if (params.limeIntervention.semanticallyJustifiedCount >= 1) {
    result = params.limeIntervention.density === 'STRONG' ? 'CLEAR' : 'CLEAR';
  }
  if (params.limeIntervention.semanticallyJustifiedCount === 0) {
    result = params.limeIntervention.elementCount > 0 ? 'SUBTLE_BUT_PRESENT' : 'TOO_WEAK';
  }
  if (params.limeIntervention.density === 'OVERUSED') {
    result = 'OVERPOWERING';
  }

  return {
    evaluationId: `lfd-${params.artifactId}`,
    artifactId: params.artifactId,
    result,
    evaluatedAt: new Date().toISOString(),
  };
}

export function limeInterventionPreservesHeadlineHierarchy(markSystem: NDXHumanMadeMarkSystem): boolean {
  return markSystem.headlineHierarchyPreserved;
}
