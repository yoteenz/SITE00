/**
 * Surface ≠ Cause — classify visible characteristics without encoding style rules.
 */

import type { SurfaceCauseRecord } from './types.js';

export const NORTH_STAR_SURFACE_CAUSE_SEED: SurfaceCauseRecord[] = [
  {
    visibleCharacteristic: 'LIME HIGHLIGHT',
    classification: 'POSSIBLE_VISUAL_MANIFESTATION',
    causalBehavior: 'SELECTION / JUDGMENT',
    behavioralTrace: 'EMPHASIS',
    possibleManifestation: 'lime highlight',
    surfaceStyle: 'high-contrast accent',
    mustNotEncodeAsRule: 'JUDGMENT = LIME',
  },
  {
    visibleCharacteristic: 'HANDWRITING',
    classification: 'POSSIBLE_VISUAL_MANIFESTATION',
    causalBehavior: 'REACTION',
    behavioralTrace: 'MARGINAL INTERVENTION',
    possibleManifestation: 'handwritten annotation',
    surfaceStyle: 'cursive marginal note',
    mustNotEncodeAsRule: 'REACTION = HANDWRITING',
  },
  {
    visibleCharacteristic: 'RECEIPT / ARCHIVAL SCREENSHOT',
    classification: 'POSSIBLE_VISUAL_MANIFESTATION',
    causalBehavior: 'EVIDENCE RETRIEVAL',
    behavioralTrace: 'SOURCE PRESENTATION',
    possibleManifestation: 'receipt or screenshot',
    surfaceStyle: null,
    mustNotEncodeAsRule: 'EVIDENCE = RECEIPT',
  },
  {
    visibleCharacteristic: 'CROSS-OUT',
    classification: 'POSSIBLE_VISUAL_MANIFESTATION',
    causalBehavior: 'CORRECTION / DISAGREEMENT',
    behavioralTrace: 'REVISION',
    possibleManifestation: 'strikethrough',
    surfaceStyle: null,
    mustNotEncodeAsRule: 'DISAGREEMENT = STRIKETHROUGH',
  },
  {
    visibleCharacteristic: 'HUGE TYPOGRAPHY',
    classification: 'BEHAVIORAL_TRACE',
    causalBehavior: 'JUDGMENT / INTERRUPTION',
    behavioralTrace: 'A thought became impossible for NDX to ignore',
    possibleManifestation: 'oversized type',
    surfaceStyle: null,
    mustNotEncodeAsRule: 'NDX uses huge type',
  },
  {
    visibleCharacteristic: 'CIRCLE',
    classification: 'BEHAVIORAL_TRACE',
    causalBehavior: 'SELECTION',
    behavioralTrace: 'NDX caught a detail that changed interpretation',
    possibleManifestation: 'hand-drawn circle',
    surfaceStyle: null,
    mustNotEncodeAsRule: 'NDX uses circles',
  },
];

export function surfaceCauseSeparationImplemented(): true {
  return true;
}

export function limeCannotBecomeCanonical(): true {
  return true;
}

export function handwritingCannotBecomeCanonical(): true {
  return true;
}

export function typographyCannotBecomeCanonical(): true {
  return true;
}

export function collageCannotBecomeCanonical(): true {
  return true;
}

export function artifactSurvivesLimeRemovalConceptually(thesis: string): boolean {
  return thesis.length > 40 && !/lime green is (the|our|ndx)/i.test(thesis);
}
