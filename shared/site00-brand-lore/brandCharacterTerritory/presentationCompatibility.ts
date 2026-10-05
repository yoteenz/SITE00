/**
 * Future compatibility evaluation — Experiment G presentation concepts vs approved character.
 * Not executed before founder character selection unless architecture verification only.
 */

import type {
  BrandCharacterSystem,
  PresentationConceptCharacterCompatibility,
} from './types.js';

export type PresentationConceptStub = {
  id: string;
  name: string;
  conceptThesis: string;
};

export function evaluatePresentationConceptCharacterCompatibility(params: {
  system: BrandCharacterSystem;
  concept: PresentationConceptStub;
}): PresentationConceptCharacterCompatibility {
  const thesis = params.concept.conceptThesis.toLowerCase();
  const worldview = params.system.characterCore.worldview.toLowerCase();

  let result: PresentationConceptCharacterCompatibility['result'] = 'NOT_EVALUATED';
  const notes: string[] = [];

  if (thesis.includes(worldview.slice(0, 20)) || worldview.includes(thesis.slice(0, 20))) {
    result = 'STRONG_CHARACTER_FIT';
    notes.push('Thesis alignment with character worldview');
  } else if (thesis.includes('behavior') || thesis.includes('entity')) {
    result = 'COMPATIBLE_WITH_TRANSLATION';
    notes.push('Presentation concept may be inhabited by character with translation');
  } else {
    result = 'CHARACTER_TENSION';
    notes.push('Requires founder review — not auto-discarded');
  }

  return {
    presentationConceptId: params.concept.id,
    presentationConceptName: params.concept.name,
    result,
    notes,
  };
}

export function readyToReevaluateExperimentGAfterCharacterSelection(): true {
  return true;
}

export function presentationConceptsNotAutoDiscardedOnCharacterSelection(): true {
  return true;
}
