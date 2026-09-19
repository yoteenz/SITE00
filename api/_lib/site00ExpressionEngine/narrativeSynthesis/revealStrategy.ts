/**
 * C1.0 — Reveal strategy derivation.
 */

import type {
  NarrativeBeat,
  NarrativeSynthesisInput,
  RevealStrategy,
  RevealStrategyMode,
} from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';

export function deriveRevealStrategy(
  input: NarrativeSynthesisInput,
  beats: NarrativeBeat[],
): RevealStrategy {
  const isArchival =
    input.subject.toLowerCase().includes('2016') ||
    input.lockedPremise?.toLowerCase().includes('tacky') ||
    input.thesis.toLowerCase().includes('nostalgia');

  const primaryMode: RevealStrategyMode = isArchival ? 'ARCHIVAL_DISCOVERY' : 'PROGRESSIVE';
  const secondaryModes: RevealStrategyMode[] = isArchival
    ? ['CONTRADICTION_REVEAL', 'CONTEXT_REVEAL']
    : ['OBJECT_REVEAL'];

  const turnBeat = beats.find((b) => b.beatType === 'TURN');
  const withholdBeat = beats.find((b) => b.beatType === 'DISCOVERY')?.beatId ?? turnBeat?.beatId ?? 'turn';

  return {
    primaryMode,
    secondaryModes,
    withholdUntilBeat: withholdBeat,
    rationale: isArchival
      ? 'Same-woman / opposite-reaction proof must not appear immediately — archival scroll earns contradiction.'
      : 'Progressive reveal maintains live question before thesis lands.',
  };
}

export function interjectionIsEarned(
  beats: NarrativeBeat[],
  interjectionBeatId: string,
): boolean {
  const interjectionIndex = beats.findIndex((b) => b.beatId === interjectionBeatId);
  const turnIndex = beats.findIndex((b) => b.beatType === 'TURN');
  const contradictionIndex = beats.findIndex((b) => b.beatType === 'CONTRADICTION');
  const evidenceBefore =
    beats.slice(0, interjectionIndex).some((b) => b.beatType === 'DISCOVERY' || b.beatType === 'TURN') &&
    (turnIndex >= 0 ? interjectionIndex > turnIndex : interjectionIndex > contradictionIndex);
  return interjectionIndex > 0 && evidenceBefore;
}
