/**
 * THE MARKED-UP COPY — direction copy contract.
 * All code-native board strings must derive from this contract.
 */

export const MARKED_UP_COPY_IMMUTABLE = {
  directionName: 'THE MARKED-UP COPY',
  thesis: 'SOMEONE ALREADY READ THIS. THEY LEFT NOTES.',
  bigIdea:
    'Every post arrives as though it has already passed through the hands of someone who knew more than you — circled, underlined, flagged, and passed along. The world is a document in active annotation. NDX BOOK doesn\'t publish clean takes; it publishes the working draft with all the margin arguments still visible. Readers don\'t receive information — they inherit it.',
  governingBehavior:
    'Content behaves like a document mid-edit: things are crossed out and replaced in real time, emphasis is added after the fact, secondary opinions interrupt the primary voice. The mark-up is the editorial voice — not decoration but evidence of thinking happening out loud. Every piece of content implies a prior reader who cared enough to react.',
} as const;

/** Board typographic copy — Marked-Up Copy concept only. */
export const MARKED_UP_COPY_BOARD_COPY = {
  issueLabel: 'WORKING DRAFT · REVISION IN PROGRESS',
  headline: 'THE CLAIM IS STILL BEING ARGUED',
  struckOriginal: 'PUBLISH THE CLEAN VERSION',
  replacement: 'SHOW THE MARGIN WARS INSTEAD',
  marginRebuttal: '← prior reader disagrees — prove it',
  thesisLine: MARKED_UP_COPY_IMMUTABLE.thesis,
  socialSource: 'We said credit scores were fixed.',
  socialStrike: 'Scores are locked forever.',
  socialCorrection: 'Still moving — someone crossed that out.',
  socialCounter: 'Show the receipts in the margin.',
  motionFrames: ['CLEAN', 'STRIKE', 'REPLACE', 'MARGIN', 'LIVE'] as const,
  hybridOriginal: 'THE TAKE WAS FINAL',
  hybridReplacement: 'NOT ANYMORE — REWRITE IN PUBLIC',
  hybridMargin: 'who read this first?',
} as const;

/** Sibling-direction vocabulary that must never appear on this board. */
export const FORBIDDEN_SIBLING_VOCABULARY = [
  'THE RANKING IS THE ARGUMENT',
  'ranking is the argument',
  'leaderboard',
  'scoreboard',
  'countdown',
  'placement',
  'final list locked',
  'we ranked this',
  'taxonomy',
  'index entry',
  'classification database',
  'archive folder',
  'saved files stash',
  'newsroom access',
  'room where it happens',
] as const;

export function containsForbiddenSiblingCopy(text: string): string[] {
  const lower = text.toLowerCase();
  return FORBIDDEN_SIBLING_VOCABULARY.filter((term) => lower.includes(term.toLowerCase()));
}

export function scanBoardCopyForContamination(snippets: string[]): {
  pass: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  for (const snippet of snippets) {
    violations.push(...containsForbiddenSiblingCopy(snippet));
  }
  return { pass: violations.length === 0, violations: [...new Set(violations)] };
}

export function collectAllBoardCopyStrings(): string[] {
  return Object.values(MARKED_UP_COPY_BOARD_COPY).flatMap((v) =>
    Array.isArray(v) ? [...v] : [String(v)],
  );
}
