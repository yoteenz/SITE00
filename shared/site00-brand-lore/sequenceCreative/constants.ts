/**
 * Sequence Creative System — methodology constants.
 */

export const SEQUENCE_CREATIVE_METHODOLOGY_VERSION = 'SEQUENCE_CREATIVE_V1' as const;

export const SEQUENCE_TYPES = [
  'CAROUSEL',
  'STORY_SEQUENCE',
  'REEL_SEQUENCE',
  'TIKTOK_SEQUENCE',
  'MOTION_SEQUENCE',
  'CAMPAIGN_SERIES',
  'EMAIL_SERIES',
  'OTHER_MULTI_FRAME_CREATIVE',
] as const;

export type SequenceType = (typeof SEQUENCE_TYPES)[number];

export const PALETTE_USAGE_ROLES = [
  'DOMINANT',
  'SECONDARY',
  'STRUCTURAL_SECONDARY',
  'SUPPORT',
  'ACCENT',
  'RARE_SIGNAL',
] as const;

export type PaletteUsageRole = (typeof PALETTE_USAGE_ROLES)[number];

export const FRAME_ROLES = [
  'HOOK',
  'EVIDENCE',
  'CONTRAST',
  'BREAKDOWN',
  'REACTION',
  'DATA',
  'QUOTE',
  'PAUSE',
  'ESCALATION',
  'PAYOFF',
  'CTA',
  'OTHER',
] as const;

export type FrameRole = (typeof FRAME_ROLES)[number];

export const REFERENCE_STRATEGIES = [
  'IDENTITY_REFERENCE',
  'COMPOSITION_REFERENCE',
  'MATERIAL_REFERENCE',
  'PALETTE_REFERENCE',
] as const;

export type ReferenceStrategy = (typeof REFERENCE_STRATEGIES)[number];

export const ANCHOR_COMPARISON_RESULTS = [
  'CONSISTENT',
  'CONSISTENT_WITH_INTENTIONAL_VARIATION',
  'DRIFT_WARNING',
  'ART_DIRECTION_BREAK',
] as const;

export type AnchorComparisonResult = (typeof ANCHOR_COMPARISON_RESULTS)[number];

export const COHESION_GATE_RESULTS = ['PASS', 'WARN', 'FAIL', 'NOT_EVALUATED'] as const;

export type CohesionGateResult = (typeof COHESION_GATE_RESULTS)[number];
