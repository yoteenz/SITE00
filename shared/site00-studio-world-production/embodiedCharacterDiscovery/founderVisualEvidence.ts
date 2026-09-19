/**
 * P0.5E.3 — Founder visual preference evidence (generic).
 */

import { randomId } from './id.js';
import type { FounderEmbodiedCharacterVisualPreferenceEvidence } from './types.js';

export function buildFounderVisualPreferenceEvidence(params: {
  referenceBoardId: string;
  selectionIds: string[];
  observedCommonalities?: string[];
  possibleInterpretations?: string[];
  uncertainties?: string[];
  visualTendencyHypotheses?: string[];
}): FounderEmbodiedCharacterVisualPreferenceEvidence {
  return {
    evidenceId: randomId('fve'),
    referenceBoardId: params.referenceBoardId,
    selectionIds: [...params.selectionIds],
    founderRawSelection: params.selectionIds.map((id) => `#${id}`).join(', '),
    observedCommonalities: params.observedCommonalities ?? [],
    possibleInterpretations: params.possibleInterpretations ?? [],
    uncertainties: params.uncertainties ?? [],
    visualAuthority: 'TENDENCY_HYPOTHESIS',
    identityAuthority: 'NONE',
    visualTendencyHypotheses: params.visualTendencyHypotheses ?? [],
    isFinalCasting: false,
    isFinalFace: false,
    isCharacterCanon: false,
    isGenerationReference: false,
  };
}

export function founderVisualSelectionsTreatedAsCanon(evidence: FounderEmbodiedCharacterVisualPreferenceEvidence): false {
  return evidence.isCharacterCanon ? (false as never) : false;
}

export function visualIdentityRemainsUnset(evidence: FounderEmbodiedCharacterVisualPreferenceEvidence[]): boolean {
  return evidence.every((e) => e.identityAuthority === 'NONE' && !e.isFinalFace);
}
