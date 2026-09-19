/**
 * P0.5C.4A — Anti-AI artifact evaluation + machine-perfect detail guards.
 */

import type {
  AntiAIGeneratedArtifactEvaluation,
  HandMarkLegibilityEvaluation,
  HumanMadeArtifactEvaluation,
  NDXHumanMadeMarkSystem,
} from './types.js';

export function evaluateAntiAIGeneratedArtifact(params: {
  artifactId: string;
  markSystem: NDXHumanMadeMarkSystem;
  hasGenericPictograms?: boolean;
  hasVectorIcons?: boolean;
  hasFakeHandwriting?: boolean;
}): AntiAIGeneratedArtifactEvaluation {
  const machineSignals: string[] = [];
  if (params.hasGenericPictograms) machineSignals.push('polished pictogram icons');
  if (params.hasVectorIcons) machineSignals.push('vector icon library look');
  if (params.hasFakeHandwriting) machineSignals.push('random faux-handwriting');

  let result: AntiAIGeneratedArtifactEvaluation['result'] = 'HUMAN_AUTHORED';
  if (params.hasVectorIcons || params.hasGenericPictograms) {
    result = params.hasVectorIcons ? 'CLIP_ART_LIKE' : 'INFOGRAPHIC_GENERIC';
  } else if (params.markSystem.handDrawnIcons.length > 0 || params.markSystem.marks.length > 0) {
    result = 'EDITORIALLY_DRAWN';
  }

  const blocked = ['MACHINE_GENERATED', 'CLIP_ART_LIKE', 'INFOGRAPHIC_GENERIC'].includes(result);

  return {
    evaluationId: `aai-${params.artifactId}`,
    artifactId: params.artifactId,
    result,
    machineSignals,
    passesGate: !blocked,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateHandMarkLegibility(params: {
  artifactId: string;
  markSystem: NDXHumanMadeMarkSystem;
}): HandMarkLegibilityEvaluation {
  const totalMarks = params.markSystem.marks.length + params.markSystem.handDrawnIcons.length;
  let result: HandMarkLegibilityEvaluation['result'] = 'PRESENT_AT_FEED';
  if (params.markSystem.handDrawnIcons.length >= 3 || params.markSystem.marks.length >= 2) {
    result = 'STRONG_AT_FEED';
  }
  if (totalMarks === 0) result = 'LOST_AT_FEED';
  if (totalMarks === 1 && params.markSystem.handDrawnIcons.length === 0) result = 'TOO_SMALL';

  return {
    evaluationId: `hml-${params.artifactId}`,
    artifactId: params.artifactId,
    result,
    feedRhythmContribution: result === 'STRONG_AT_FEED' || result === 'PRESENT_AT_FEED',
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateMakerEvidenceStrength(params: {
  markSystem: NDXHumanMadeMarkSystem;
}): HumanMadeArtifactEvaluation['makerEvidenceStrength'] {
  const actions = params.markSystem.makerActions.length;
  const marks = params.markSystem.marks.length + params.markSystem.handDrawnIcons.length;
  if (actions >= 3 || marks >= 5) return 'STRONG';
  if (actions >= 2 || marks >= 2) return 'MODERATE';
  if (actions >= 1 || marks >= 1) return 'LOW';
  return 'NONE';
}

export function machineGeneratedBlocked(result: AntiAIGeneratedArtifactEvaluation): boolean {
  return !result.passesGate;
}

export function fakeHandwritingFails(hasFakeHandwriting: boolean): boolean {
  return hasFakeHandwriting;
}

export function machinePerfectMicrodetailFails(hasSterilePrecision: boolean): boolean {
  return hasSterilePrecision;
}

export function infographicCollapseFails(hasGenericInfographic: boolean): boolean {
  return hasGenericInfographic;
}

export function noVisibleMakerActionFails(strength: HumanMadeArtifactEvaluation['makerEvidenceStrength']): boolean {
  return strength === 'NONE' || strength === 'LOW';
}
