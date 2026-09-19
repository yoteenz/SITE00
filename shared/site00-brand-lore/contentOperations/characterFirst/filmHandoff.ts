/**
 * P0.5E.7 — Film handoff for P0.FILM.1 consumption.
 */

import type { ContentSeedFilmHandoff, NDXContentSeed } from './types.js';

export function buildContentSeedFilmHandoff(seed: NDXContentSeed): ContentSeedFilmHandoff {
  const reelArc = [
    'NORMAL_STATE',
    seed.notice.toUpperCase(),
    seed.firstReaction.toUpperCase(),
    'DOUBLE_TAKE',
    'SEARCH',
    'RABBIT_HOLE',
    seed.investigationTrigger.toUpperCase(),
    'BOOK',
    seed.thoughtArc.beliefRevision === 'PARTIALLY_REVISED' || seed.changedMind
      ? 'REVISION'
      : 'CONFIRMATION',
    seed.currentView.toUpperCase(),
    'PAYOFF',
  ];

  return {
    contentSeedId: seed.seedId,
    reelArc,
    openingBeat: seed.characterBeat,
    rabbitHoleTrigger: seed.investigationTrigger,
    payoff: seed.currentView,
  };
}
