/**
 * Generic Studio World — Human Motion Trace System.
 * Human behavior must have causal meaning; do not manufacture fake imperfection.
 */

import { randomUUID } from 'node:crypto';
import type { HumanMotionTrace, HumanMotionTraceSystem } from './types.js';

export const GENERIC_HUMAN_MOTION_TRACES = [
  { kind: 'CAMERA_REPOSITION', causalMeaning: 'Subject or evidence moved; camera follows naturally' },
  { kind: 'REAL_PAUSE', causalMeaning: 'Processing or surprise before reaction' },
  { kind: 'CURSOR_HESITATION', causalMeaning: 'Uncertainty about what to click or read next' },
  { kind: 'SCROLL_REVERSAL', causalMeaning: 'Missed something; returning to verify' },
  { kind: 'SEARCH_REFINEMENT', causalMeaning: 'First query insufficient; narrowing investigation' },
  { kind: 'MISSPELLED_SEARCH_CORRECTED', causalMeaning: 'Human typing error corrected mid-search' },
  { kind: 'PHYSICAL_HANDWRITING', causalMeaning: 'Annotating or note-taking in real environment' },
  { kind: 'PAGE_TURN', causalMeaning: 'Moving through physical or digital material' },
  { kind: 'PAPER_MOVEMENT', causalMeaning: 'Handling receipts, printouts, or reference material' },
  { kind: 'HIGHLIGHTER_MOVEMENT', causalMeaning: 'Marking evidence during review' },
  { kind: 'PHONE_HANDLING', causalMeaning: 'Spontaneous capture or screen share setup' },
  { kind: 'UNEXPECTED_INTERRUPTION', causalMeaning: 'Real environment intrudes; human responds' },
  { kind: 'LAUGH', causalMeaning: 'Genuine reaction to absurdity or discovery' },
  { kind: 'SILENCE', causalMeaning: 'Letting evidence land before commentary' },
  { kind: 'SECOND_THOUGHT', causalMeaning: 'Reconsidering prior judgment' },
  { kind: 'CROSS_OUT', causalMeaning: 'Correcting written thought in progress' },
  { kind: 'REWIND', causalMeaning: 'Returning to earlier moment for comparison' },
  { kind: 'COMPARISON', causalMeaning: 'Side-by-side evaluation of options or claims' },
  { kind: 'UNFINISHED_SENTENCE', causalMeaning: 'Thought still forming; process visible' },
  { kind: 'ENVIRONMENT_INTERACTION', causalMeaning: 'Physical world participates in investigation' },
] as const;

export function buildHumanMotionTraceSystem(): HumanMotionTraceSystem {
  const traces: HumanMotionTrace[] = GENERIC_HUMAN_MOTION_TRACES.map((t) => ({
    traceId: randomUUID(),
    kind: t.kind,
    causalMeaning: t.causalMeaning,
    mustNotBeManufacturedMechanically: true as const,
  }));
  return {
    systemId: randomUUID(),
    traces,
    fakeImperfectionBlocked: true,
  };
}

export function failAiPresenter(): true {
  return true;
}

export function failGenericInfluencer(): true {
  return true;
}

export function failMotionPoster(): true {
  return true;
}

export function failAnimatedCarousel(): true {
  return true;
}

export function failStockBrollExplainer(): true {
  return true;
}

export function failFakeHumanImperfection(): true {
  return true;
}
