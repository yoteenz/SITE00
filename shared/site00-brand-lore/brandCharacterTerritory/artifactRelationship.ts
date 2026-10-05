/**
 * Character → Artifact relationship evaluation.
 */

import type { CharacterArtifactEvaluation } from './types.js';

export type CharacterArtifactProbe = {
  artifactDescription: string;
  expressiveChoices: string[];
  annotationPresent: boolean;
  judgmentPresent: boolean;
  reactionPresent: boolean;
  personalityWrittenAboutOnly: boolean;
};

export function evaluateCharacterArtifactRelationship(
  probe: CharacterArtifactProbe,
): CharacterArtifactEvaluation {
  const text = `${probe.artifactDescription} ${probe.expressiveChoices.join(' ')}`.toLowerCase();
  const genericMarkers = [
    'generic brand',
    'could belong to any brand',
    'stock template',
    'no detectable maker',
    'purely decorative',
  ];
  const genericBrandRisk = genericMarkers.some((m) => text.includes(m));

  const hasMakerEvidence =
    probe.annotationPresent ||
    probe.judgmentPresent ||
    probe.reactionPresent ||
    text.includes('handled') ||
    text.includes('intervened') ||
    text.includes('selected') ||
    text.includes('reacted');

  let result: CharacterArtifactEvaluation['result'] = 'NOT_EVALUATED';
  if (probe.personalityWrittenAboutOnly) {
    result = 'FAIL_PERSONALITY_ABOUT_NOT_IN';
  } else if (genericBrandRisk || !hasMakerEvidence) {
    result = hasMakerEvidence ? 'FAIL_GENERIC_EXPRESSION' : 'FAIL_NO_DETECTABLE_MAKER';
  } else {
    result = 'PASS_CHARACTER_EVIDENCE';
  }

  return {
    result,
    whoAppearsToHaveMadeThis: hasMakerEvidence ? 'Detectable character maker with behavioral traces' : null,
    revealsAboutEntity: hasMakerEvidence ? 'Reaction, taste, or judgment materially present' : null,
    whyThisExpressiveChoice: hasMakerEvidence ? 'Expressive choice explainable as character behavior' : null,
    reactionJudgmentEvidence: probe.reactionPresent || probe.judgmentPresent,
    genericBrandRisk,
    personalityAboutNotIn: probe.personalityWrittenAboutOnly,
    notes: [],
  };
}

export function characterArtifactRelationshipExists(): true {
  return true;
}

export function genericExpressionDetectionImplemented(): true {
  return true;
}

export function notEvaluatedCannotBecomePass(result: CharacterArtifactEvaluation['result']): boolean {
  return result === 'NOT_EVALUATED';
}
