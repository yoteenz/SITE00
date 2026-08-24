/**
 * P0.5E.3 — Character synthesis — founder-triggered, describes ONE woman.
 */

import { randomId } from './id.js';
import type { EmbodiedCharacterSynthesis } from './types.js';

export function buildEmbodiedCharacterSynthesis(params: {
  characterEssence: string;
  psychologicalLogic: string;
  knownUnknowns: string[];
  visualImplications: string[];
  founderTriggered: boolean;
}): EmbodiedCharacterSynthesis {
  return {
    synthesisId: randomId('syn'),
    characterEssence: params.characterEssence,
    psychologicalLogic: params.psychologicalLogic,
    knownUnknowns: params.knownUnknowns,
    visualImplications: params.visualImplications,
    synthesizedAt: params.founderTriggered ? new Date().toISOString() : null,
    founderTriggered: params.founderTriggered,
  };
}

export function synthesisIsNotArchetypeMashup(essence: string): boolean {
  const mashupMarkers = ['THE SLEUTH + THE ARCHIVIST', 'ARCHETYPE MASHUP', 'THE FUNNY GIRL + THE ICON'];
  return !mashupMarkers.some((m) => essence.toUpperCase().includes(m));
}
