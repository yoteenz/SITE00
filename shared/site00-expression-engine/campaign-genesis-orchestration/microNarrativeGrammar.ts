/**
 * P0.CGO.2 — MicroNarrativeGrammar for short-form social.
 */

import type { MicroNarrativeGrammarType } from './conceptualEfficiencyTypes.js';
import type { CampaignWorldCandidate } from './types.js';

export const MICRO_NARRATIVE_GRAMMARS: Record<
  MicroNarrativeGrammarType,
  { label: string; pattern: string; minDurationSec: number; maxDurationSec: number }
> = {
  ACTION_CLUE_TITLE: { label: 'Action → Clue → Title', pattern: 'BEHAVIOR → VISUAL HINT → TITLE CARD', minDurationSec: 3, maxDurationSec: 8 },
  OBJECT_BEHAVIOR_PAYOFF: { label: 'Object → Behavior → Payoff', pattern: 'PROP → ACTION → PRODUCT MOMENT', minDurationSec: 4, maxDurationSec: 8 },
  MOTION_REVEAL_END: { label: 'Motion → Reveal → End', pattern: 'MOVEMENT → PRODUCT SURFACE → CUT', minDurationSec: 3, maxDurationSec: 7 },
  WORLD_PRODUCT_INTERSECTION: { label: 'World → Product intersection', pattern: 'ENVIRONMENT → NATURAL PRODUCT MOMENT', minDurationSec: 5, maxDurationSec: 8 },
  MOTIF_PRODUCT_COPY: { label: 'Motif → Product → Copy', pattern: 'VISUAL SYSTEM → PRODUCT → WORLD-NATIVE LINE', minDurationSec: 4, maxDurationSec: 8 },
  SETUP_CONTRADICTION: { label: 'Setup → Contradiction', pattern: 'EXPECTATION → WITTY BREAK', minDurationSec: 5, maxDurationSec: 8 },
  SINGLE_LOOP: { label: 'Single loop', pattern: 'START STATE → ACTION → RETURN', minDurationSec: 3, maxDurationSec: 6 },
  SINGLE_VISUAL_PUNCHLINE: { label: 'Single visual punchline', pattern: 'ONE IMAGE JOKE → BRAND', minDurationSec: 3, maxDurationSec: 5 },
};

export function selectMicroNarrativeGrammar(candidate: CampaignWorldCandidate): MicroNarrativeGrammarType {
  const oneShot = candidate.efficiencyEnrichment?.oneShotPotential.viable;
  const hasMotion = candidate.humanExpression.movement.length > 0;
  const hasMotif = candidate.motifs.length >= 2;

  if (oneShot && hasMotion) return 'MOTION_REVEAL_END';
  if (oneShot) return 'SINGLE_VISUAL_PUNCHLINE';
  if (hasMotif && candidate.copyLanguage.length) return 'MOTIF_PRODUCT_COPY';
  if (hasMotion) return 'ACTION_CLUE_TITLE';
  return 'WORLD_PRODUCT_INTERSECTION';
}

export function reelDurationForGrammar(grammar: MicroNarrativeGrammarType): number {
  const g = MICRO_NARRATIVE_GRAMMARS[grammar];
  return Math.round((g.minDurationSec + g.maxDurationSec) / 2);
}

export function isShortFormDuration(seconds: number): boolean {
  return seconds >= 3 && seconds <= 8;
}
