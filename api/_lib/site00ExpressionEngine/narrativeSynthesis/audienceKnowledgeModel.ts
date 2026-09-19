/**
 * C1.0 — Audience knowledge progression across narrative beats.
 */

import type { AudienceKnowledgeState, NarrativeBeat } from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';

export function buildAudienceJourneyFromBeats(beats: NarrativeBeat[]): AudienceKnowledgeState[] {
  return beats.map((beat, index) => {
    const prior = beats.slice(0, index);
    const knownFacts = [
      ...prior.flatMap((b) => b.audienceKnowsAfter),
      ...beat.audienceKnowsBefore,
    ];
    const uniqueKnown = [...new Set(knownFacts.filter(Boolean))];

    return {
      beatId: beat.beatId,
      knownFacts: uniqueKnown,
      suspectedFacts: beat.reveals.filter((r) => !uniqueKnown.includes(r)),
      openQuestions:
        index === 0
          ? [beat.storyFunction.includes('?') ? beat.whatHappens : 'What is really going on here?']
          : prior.length > 0
            ? [`Why does ${beat.whatHappens.slice(0, 40)} happen now?`]
            : [],
      misdirection: beat.beatType === 'SETUP' ? ['Surface praise may be innocent nostalgia'] : [],
      revealedContradictions:
        beat.beatType === 'CONTRADICTION' || beat.beatType === 'TURN'
          ? beat.reveals
          : prior.filter((b) => b.beatType === 'CONTRADICTION').flatMap((b) => b.reveals),
      unresolvedTensions:
        beat.beatType === 'AFTERSHOCK'
          ? [beat.whatHappens]
          : prior.slice(-1).flatMap((b) => b.reveals.filter((r) => !beat.audienceKnowsAfter.includes(r))),
    };
  });
}

export function detectRedundantBeats(
  beats: NarrativeBeat[],
  journey: AudienceKnowledgeState[],
): string[] {
  const redundant: string[] = [];
  for (let i = 1; i < journey.length; i += 1) {
    const prev = journey[i - 1];
    const curr = journey[i];
    const prevSet = new Set(prev.knownFacts);
    const newFacts = curr.knownFacts.filter((f) => !prevSet.has(f));
    if (newFacts.length === 0 && beats[i].beatType !== 'INTERJECTION') {
      redundant.push(beats[i].beatId);
    }
  }
  return redundant;
}
