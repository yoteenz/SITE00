/**
 * P0.5C.4A — Feed maker rhythm across 3×3 board.
 */

import type { ArtBoardRetainedFirstSlideContract, FeedMakerRhythm } from './types.js';

export function buildFeedMakerRhythm(params: {
  boardId: string;
  contracts: ArtBoardRetainedFirstSlideContract[];
}): FeedMakerRhythm {
  let handDrawnIconPosts = 0;
  let handwritingPosts = 0;
  let markerHighlightPosts = 0;
  let correctionPosts = 0;
  let minimalInterventionPosts = 0;

  for (const c of params.contracts) {
    const hm = c.humanMadeEvaluation?.markSystem;
    if (!hm) {
      minimalInterventionPosts += 1;
      continue;
    }
    if (hm.handDrawnIcons.length > 0) handDrawnIconPosts += 1;
    if (hm.marks.some((m) => m.applicationMode === 'INK' || m.applicationMode === 'DIGITAL_HAND_TRACE')) {
      handwritingPosts += 1;
    }
    if (hm.marks.some((m) => m.applicationMode === 'MARKER' || m.applicationMode === 'HIGHLIGHTER')) {
      markerHighlightPosts += 1;
    }
    if (hm.marks.some((m) => m.markClass === 'CORRECTION_MARK' || m.markClass === 'X_MARK')) {
      correctionPosts += 1;
    }
    if (hm.marks.length === 0 && hm.handDrawnIcons.length === 0) minimalInterventionPosts += 1;
  }

  const behaviors = [handDrawnIconPosts, handwritingPosts, markerHighlightPosts, correctionPosts, minimalInterventionPosts].filter(
    (n) => n > 0,
  ).length;

  return {
    boardId: params.boardId,
    handDrawnIconPosts,
    handwritingPosts,
    markerHighlightPosts,
    correctionPosts,
    minimalInterventionPosts,
    allSameDoodleBehavior: handDrawnIconPosts >= 7,
    sameMakerDifferentBehaviors: behaviors >= 3 && handDrawnIconPosts < 7,
  };
}

export function feedMakerRhythmPreventsIdenticalDoodles(rhythm: FeedMakerRhythm): boolean {
  return !rhythm.allSameDoodleBehavior;
}
