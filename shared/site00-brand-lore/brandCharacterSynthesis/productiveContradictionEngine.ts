/**
 * Productive contradiction engine — preserve tension, don't flatten character.
 */

import type { BrandCharacterSynthesis } from './types.js';

export type ProductiveContradictionPair = {
  pair: string;
  question: string;
  resolutionBehavior: string;
  modulationRule: string;
};

const CORE_PAIRS: Array<{ id: string; question: string }> = [
  {
    id: 'BELONGING_CONTRARIANISM',
    question: 'Why does NDX feel entitled to challenge the room it clearly belongs to?',
  },
  {
    id: 'CURIOSITY_CONVICTION',
    question: 'When does investigation become conviction — and what reopens it?',
  },
  {
    id: 'HUMOR_SERIOUSNESS',
    question: 'When does wit sharpen the observation vs cheapen it?',
  },
  {
    id: 'DEPTH_SPEED',
    question: 'Which observations earn a quick reaction vs go into the file?',
  },
  {
    id: 'INSIDER_INDEPENDENT',
    question: 'How does belonging coexist with independence from room approval?',
  },
];

export function evaluateProductiveContradictions(params: {
  synthesis: BrandCharacterSynthesis;
}): ProductiveContradictionPair[] {
  const blob = JSON.stringify(params.synthesis).toLowerCase();
  return CORE_PAIRS.map((pair) => {
    const resolutionBehavior =
      pair.id === 'BELONGING_CONTRARIANISM'
        ? blob.includes('challenge') && blob.includes('belong')
          ? 'Challenges from inside shared context — fluency earns the contradiction'
          : 'Requires behavioral evidence of in-room participation before challenge'
        : pair.id === 'CURIOSITY_CONVICTION'
          ? 'Provisional synthesis until evidence threshold; conviction reopens on contradiction'
          : pair.id === 'HUMOR_SERIOUSNESS'
            ? 'Humor follows noticing — withheld when stakes cheapen the observation'
            : pair.id === 'DEPTH_SPEED'
              ? 'Quick reactions for surface absurdity; files for structural connections'
              : 'Insider fluency without approval-seeking — judgment precedes consensus';

    return {
      pair: pair.id,
      question: pair.question,
      resolutionBehavior,
      modulationRule: params.synthesis.contextualModulationRules.find((r) =>
        r.toLowerCase().includes(pair.id.split('_')[0]!.toLowerCase()),
      ) ?? resolutionBehavior,
    };
  });
}

export function productiveContradictionsPreserved(synthesis: BrandCharacterSynthesis): boolean {
  return synthesis.productiveTensions.length >= 2 && synthesis.unresolvedContradictions.length >= 1;
}

export function humorSystemDeepened(synthesis: BrandCharacterSynthesis): boolean {
  return (
    synthesis.humorIdentity.length > 30 &&
    !/^witty\.?$/i.test(synthesis.humorIdentity.trim())
  );
}

export function culturalInteriorityModeled(synthesis: BrandCharacterSynthesis): boolean {
  return synthesis.culturalInstincts.length >= 2 || synthesis.culturalIdentity.includes('participat');
}
