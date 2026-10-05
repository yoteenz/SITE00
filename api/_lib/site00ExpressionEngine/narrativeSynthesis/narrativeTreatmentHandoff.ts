/**
 * C1.0 — Treatment must consume approved narrative authority (no silent rewrite).
 */

import type {
  NarrativeSynthesis,
  TreatmentHandoffContract,
} from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';

const IMMUTABLE_ELEMENTS = [
  'centralQuestion',
  'turningPoint',
  'contradiction',
  'interjection',
  'payoff',
  'aftershock',
] as const;

export function buildTreatmentHandoffContract(
  synthesis: NarrativeSynthesis,
): TreatmentHandoffContract {
  return {
    narrativeAuthorityId: synthesis.synthesisId,
    narrativeVersion: synthesis.version,
    immutableStoryElements: [...IMMUTABLE_ELEMENTS],
    spineBeatOrder: synthesis.narrativeSpine.beats.map((b) => b.beatId),
    treatmentMustNotRewrite: [
      'Do not reorder spine beats without narrative version bump.',
      'Do not replace interjection before contradiction is earned.',
      'Do not change NDX/subject role assignment without founder revision.',
    ],
  };
}

export function assertTreatmentRespectsNarrativeAuthority(params: {
  synthesis: NarrativeSynthesis | null;
  treatmentCoreStory: string;
}): { valid: boolean; violations: string[] } {
  if (!params.synthesis?.narrativeAuthority) {
    return { valid: true, violations: [] };
  }

  const violations: string[] = [];
  const story = params.treatmentCoreStory.toLowerCase();
  const interjection = params.synthesis.interjection.line.toLowerCase();

  if (interjection && !story.includes(interjection.slice(0, 20))) {
    violations.push('Treatment core story missing approved interjection fragment');
  }
  if (
    params.synthesis.centralQuestion.toLowerCase().includes('same style') &&
    !story.includes('same') &&
    !story.includes('scroll')
  ) {
    violations.push('Treatment may have diverged from same-object contradiction spine');
  }

  return { valid: violations.length === 0, violations };
}
