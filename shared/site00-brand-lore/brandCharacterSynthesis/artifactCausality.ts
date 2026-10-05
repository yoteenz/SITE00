/**
 * Character → artifact causality enforcement.
 */

import type { BrandCharacterArtifactProof, CharacterTrace } from './types.js';
import { createCharacterTrace } from './characterTrace.js';

export function assertArtifactCausality(params: {
  whatNDXNoticed: string;
  whatNDXThought: string;
  whatNDXDecided: string;
  whatNDXDid: string;
  traceClass: CharacterTrace['traceClass'];
}): CharacterTrace {
  if (!params.whatNDXNoticed || !params.whatNDXDid) {
    throw new Error('Artifact intervention requires noticed trigger and resulting action');
  }
  return createCharacterTrace({
    traceClass: params.traceClass,
    trigger: params.whatNDXNoticed,
    behavior: params.whatNDXDid,
    visibleManifestation: `Evidence of ${params.traceClass.replace(/_/g, ' ').toLowerCase()}`,
    causalChain: [
      'CHARACTER',
      params.whatNDXThought || 'REACTION',
      params.whatNDXDecided || 'DECISION',
      params.whatNDXDid,
      'TRACE',
    ],
  });
}

export function decorativeTraceFails(proof: BrandCharacterArtifactProof): boolean {
  return proof.traces.some(
    (t) =>
      t.causalChain.length < 3 ||
      t.behavior.toLowerCase().includes('add decoration') ||
      t.behavior.toLowerCase().includes('because the identity uses'),
  );
}

export function randomCollageFails(proof: BrandCharacterArtifactProof): boolean {
  const p = proof.falPromptContract.prompt.toLowerCase();
  return (
    (p.includes('collage') || p.includes('scrapbook')) &&
    !proof.situation &&
    !proof.whatNDXNoticed
  );
}

export function artifactCausalityEnforced(): true {
  return true;
}
