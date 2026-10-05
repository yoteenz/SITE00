/**
 * Realism Canon — visual north star for cinematic realism lab.
 */

export const CINEMATIC_REALISM_CANON = {
  version: 'P0.CR.1',
  northStar:
    'Premium luxury lifestyle footage that could pass as real on Instagram — cinematic, socially native, editorial, never fantasy-glamour AI.',
  principles: [
    'Believable skin texture with pores and subtle imperfection',
    'Premium but natural lighting — no flat AI glow',
    'Real-world wardrobe folds and material behavior',
    'Plausible interior reflections and environment stability',
    'Subtle human micro-expressions',
    'Grounded motion — no rubberiness or float',
    'Non-gimmicky camera behavior',
    'Premium environments that still obey physics',
    'Taste and restraint over spectacle',
    'Continuity over one-off hero frames',
  ],
  prohibited: [
    'Plastic skin / beauty-filter overload',
    'Fantasy luxury environments',
    'Floating hands and prop drift',
    'Dead eyes and unnatural gaze',
    'Over-symmetry and too-perfect staging',
    'Platform UI imitation',
    'Uncanny lip-sync without intent',
  ],
  benchmarkCategory: 'AI luxury lifestyle / founder / influencer reel content',
} as const;

export type RealismCanon = typeof CINEMATIC_REALISM_CANON;
