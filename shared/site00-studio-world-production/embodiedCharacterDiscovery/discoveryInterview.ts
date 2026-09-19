/**
 * P0.5E.3 — Discovery interview rounds (generic structure).
 */

import { DISCOVERY_ROUNDS } from './constants.js';
import type { DiscoveryInterviewRound, DiscoveryRound } from './types.js';

const ROUND_TITLES: Record<DiscoveryRound, string> = {
  WHO_IS_SHE: 'WHO IS SHE?',
  HOW_DOES_SHE_THINK: 'HOW DOES SHE THINK?',
  WHAT_MAKES_HER_HUMAN: 'WHAT MAKES HER HUMAN?',
  HOW_DOES_SHE_SOUND: 'HOW DOES SHE SOUND?',
  WHAT_DOES_SHE_NOTICE: 'WHAT DOES SHE NOTICE?',
  WHAT_DOES_SHE_GET_WRONG: 'WHAT DOES SHE GET WRONG?',
  WHAT_MAKES_HER_LAUGH: 'WHAT MAKES HER LAUGH?',
  WHAT_IS_HER_LIFE_LIKE: 'WHAT IS HER LIFE LIKE?',
  RELATIONSHIP_WITH_PRIMARY_ARTIFACT: 'RELATIONSHIP WITH PRIMARY ARTIFACT',
  HOW_DOES_SHE_MOVE: 'HOW DOES SHE MOVE?',
  HOW_DOES_SHE_LOOK: 'HOW DOES SHE LOOK?',
  DOES_THIS_FEEL_LIKE_HER: 'DOES THIS FEEL LIKE HER?',
};

export function buildDiscoveryInterviewRounds(customPrompts?: Partial<Record<DiscoveryRound, string[]>>): DiscoveryInterviewRound[] {
  return DISCOVERY_ROUNDS.map((round) => ({
    round,
    title: ROUND_TITLES[round],
    prompts: customPrompts?.[round] ?? [`Discovery prompts for ${ROUND_TITLES[round]}`],
    founderAnswer: null,
    founderRawWording: null,
    completedAt: null,
  }));
}

export function applyFounderInterviewAnswer(
  rounds: DiscoveryInterviewRound[],
  round: DiscoveryRound,
  answer: string,
  rawWording?: string,
): DiscoveryInterviewRound[] {
  return rounds.map((r) =>
    r.round === round
      ? {
          ...r,
          founderAnswer: answer,
          founderRawWording: rawWording ?? answer,
          completedAt: new Date().toISOString(),
        }
      : r,
  );
}

export function discoveryInterviewRoundCount(): number {
  return DISCOVERY_ROUNDS.length;
}
