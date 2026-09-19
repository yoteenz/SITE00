/**
 * P0.5E.3 — NDX Embodied Character Discovery types.
 */

import type { EmbodiedCharacterDiscoveryRun } from '../../site00-studio-world-production/embodiedCharacterDiscovery/types.js';

export type NdxEmbodiedCharacterDiscoveryRun = EmbodiedCharacterDiscoveryRun & {
  runId: typeof import('./constants.js').NDX_EMBODIED_CHARACTER_DISCOVERY_RUN_ID;
  platformExpression: {
    storiesAreMargins: true;
    tiktokIsThoughtBeingWorkedOut: true;
    reelsAreBookInMotion: true;
    feedIsPages: true;
    reuseThinkingNotPosts: true;
  };
  nextCastingRoundSpec: {
    candidateCount: 12;
    sameWrittenCharacter: true;
    generationPerformed: false;
    architectureOnly: true;
  };
  futureContinuityBibleSchema: readonly string[];
};
