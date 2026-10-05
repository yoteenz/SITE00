import type { ProofArchitecture, ProofObject, ProofPlacementPlan } from './types.js';

export function buildProofPlacementPlan(input: {
  grammarId: string;
  beats: readonly { beatId: string; label: string }[];
  proofs: readonly ProofObject[];
}): ProofPlacementPlan {
  const primary = input.proofs.filter((p) => p.strength === 'PRIMARY');
  const strategy =
    input.grammarId === 'CULTURAL_GLITCH' || input.grammarId === 'INVESTIGATION' ?
      'WITHHOLD_THEN_RELEASE'
    : input.grammarId === 'CONTRADICTION' ?
      'SURPRISE_AFTER_CLAIM'
    : 'INTERLEAVED';

  const beatPlacements: Record<string, string[]> = {};
  for (const beat of input.beats) {
    const label = beat.label.toUpperCase();
    if (label.includes('RECEIPT') || label.includes('PROOF') || label.includes('EVIDENCE')) {
      beatPlacements[beat.beatId] = primary.map((p) => p.proofId);
    } else if (label.includes('CONTRADICTION')) {
      beatPlacements[beat.beatId] = input.proofs
        .filter((p) => p.proofType === 'CONTRADICTION_PROOF' || p.proofType === 'COMPARATIVE_PROOF')
        .map((p) => p.proofId);
    } else {
      beatPlacements[beat.beatId] = input.proofs
        .filter((p) => p.strength === 'ATMOSPHERIC')
        .slice(0, 1)
        .map((p) => p.proofId);
    }
  }

  return {
    strategy,
    rationale:
      strategy === 'WITHHOLD_THEN_RELEASE' ?
        'Archive proof withheld briefly after familiar scene to build tension before contradiction.'
      : strategy === 'SURPRISE_AFTER_CLAIM' ?
        'Present-tense claim first; receipts land as interruption.'
      : 'Proof interleaved with beats to maintain motion.',
    beatPlacements,
  };
}

export function assembleProofArchitecture(input: {
  grammarId: string;
  beats: readonly { beatId: string; label: string }[];
  proofs: readonly ProofObject[];
}): ProofArchitecture {
  return {
    objects: input.proofs,
    placementPlan: buildProofPlacementPlan(input),
  };
}
