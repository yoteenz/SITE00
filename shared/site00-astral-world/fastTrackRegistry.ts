/**
 * P0.E.FT1 — Founder Fast Track registry (NOT canon).
 * Bridge: FAST_TRACK_PROTOTYPE → founder review → formal canon promotion.
 */

export const ASTRAL_FAST_TRACK_PROTOTYPE = {
  truthLayer: 'CREATIVE_EXPLORATION' as const,
  fastTrackPrototype: true as const,
  buildMode: 'FOUNDER_FAST_TRACK' as const,
  sprint: 'P0.E.FT1',
  source: 'FOUNDER_REFERENCE' as const,
  route: '/projects/astral-world/debug/world',
  autoCanonized: false,
  governanceBridge: 'FAST_TRACK_PROTOTYPE → FOUNDER REVIEW → PROMOTE SELECTED DECISIONS → FORMAL CANON',
  note: 'Prototype output may inform canon — explicit promotion required.',
} as const;

export type FastTrackReviewVerdict = 'KEEP' | 'REVISE' | 'REJECT' | 'UNREVIEWED';

export function isFastTrackPrototype(): true {
  return true;
}

export function canAutoPromoteFromFastTrack(): false {
  return false;
}
