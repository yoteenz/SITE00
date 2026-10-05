/**
 * C1.0 — Payoff integrity (setup ↔ payoff linkage).
 */

import type { NarrativeBeat, NarrativePayoff } from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';

export function buildNarrativePayoff(beats: NarrativeBeat[], interjectionLine: string): NarrativePayoff {
  const setupBeats = beats.filter((b) => b.beatType === 'SETUP' || b.beatType === 'DISCOVERY').map((b) => b.beatId);
  const payoffBeat = beats.find((b) => b.beatType === 'PAYOFF' || b.beatType === 'INTERJECTION');

  return {
    setupBeatIds: setupBeats.length > 0 ? setupBeats : [beats[0]?.beatId ?? 'setup'],
    promiseCreated: 'The story will prove whether cultural labels changed without the object changing.',
    payoffBeatId: payoffBeat?.beatId ?? beats[beats.length - 2]?.beatId ?? 'payoff',
    payoffMechanism: 'Contradiction alignment + interjection compression',
    intellectualPayoff: interjectionLine,
    emotionalPayoff: 'Recognition that memory was edited, not the outfit.',
    visualPayoff: 'Same woman / same fit / opposite reaction split or receipt pull.',
  };
}

export function validatePayoffIntegrity(
  payoff: NarrativePayoff,
  beats: NarrativeBeat[],
): { unsetupPayoff: boolean; unpaidSetup: boolean } {
  const setupExists = payoff.setupBeatIds.some((id) => beats.some((b) => b.beatId === id));
  const payoffExists = beats.some((b) => b.beatId === payoff.payoffBeatId);
  const setupBeatsWithoutPayoffLink = beats.filter(
    (b) => b.requiredPayoffLink && !beats.some((p) => p.beatId === b.requiredPayoffLink),
  );

  return {
    unsetupPayoff: payoffExists && !setupExists,
    unpaidSetup: setupBeatsWithoutPayoffLink.length > 0,
  };
}
