/**
 * P0.5C.4A — NDX Lime Intervention System + density governance.
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
  const iconCount = params.markSystem.handDrawnIcons.length;
  const semanticallyJustifiedCount = limeMarks.length + iconCount;

  let density: LimeInterventionDensity = 'SUBTLE';
  if (semanticallyJustifiedCount >= 4 && semanticallyJustifiedCount <= 8) density = 'MODERATE';
  else if (semanticallyJustifiedCount > 8) density = 'STRONG';
  else if (params.topicIndex === 1 && semanticallyJustifiedCount >= 3) density = 'MODERATE';

  const applicationModes = [
    ...new Set([
      ...params.markSystem.marks.map((m) => m.applicationMode),
      ...params.markSystem.handDrawnIcons.map((i) => i.applicationMode),
    ]),
  ];

  return {
    density,
    applicationModes,
    interventionSites: [
      ...params.markSystem.marks.map((m) => m.semanticPurpose),
      ...params.markSystem.handDrawnIcons.map((i) => `hand-drawn ${i.subject}`),
    ],
    semanticPurposes: params.limeFunction ? [params.limeFunction] : ['INTERVENTION'],
    decorativeOnly: false,
    appliedAfterBaseMaterial: true,
    elementCount: semanticallyJustifiedCount,
    semanticallyJustifiedCount,
  };
}

export function evaluateLimeInterventionDensity(params: {
  limeIntervention: NDXLimeInterventionSystem;
}): LimeInterventionDensity {
  const { elementCount, semanticallyJustifiedCount, decorativeOnly } = params.limeIntervention;
  if (decorativeOnly) return 'OVERUSED';
  const ratio = semanticallyJustifiedCount / Math.max(elementCount, 1);
  if (elementCount >= 10 && ratio < 0.5) return 'OVERUSED';
  if (elementCount >= 6 && ratio >= 0.8) return 'STRONG';
  if (elementCount >= 3) return 'MODERATE';
  return 'SUBTLE';
}

export function limeDensityIndependentFromRawCount(params: {
  elementCount: number;
  semanticallyJustifiedCount: number;
}): boolean {
  return params.elementCount > 2 && params.semanticallyJustifiedCount === params.elementCount;
}

export function limeCanExceedTwoElementsWhenJustified(lime: NDXLimeInterventionSystem): boolean {
  return lime.semanticallyJustifiedCount > 2 && !lime.decorativeOnly;
}

export function limeNotDecorativeOnly(lime: NDXLimeInterventionSystem): boolean {
  return !lime.decorativeOnly && lime.semanticPurposes.length > 0;
}

export function limeTooPassiveFails(lime: NDXLimeInterventionSystem, topicRequiresIntervention: boolean): boolean {
  return topicRequiresIntervention && lime.density === 'SUBTLE' && lime.elementCount <= 1;
}

export function evaluateLimeFeedDistance(params: {
  artifactId: string;
  limeIntervention: NDXLimeInterventionSystem;
}): LimeFeedDistanceEvaluation {
  let result: LimeFeedDistanceEvaluation['result'] = 'SUBTLE_BUT_PRESENT';
  if (params.limeIntervention.density === 'MODERATE' || params.limeIntervention.density === 'STRONG') {
    result = params.limeIntervention.density === 'STRONG' ? 'CLEAR' : 'CLEAR';
  }
  if (params.limeIntervention.density === 'SUBTLE' && params.limeIntervention.elementCount === 0) {
    result = 'TOO_WEAK';
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
