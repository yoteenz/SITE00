/**
 * Founder Character Hypothesis — high-value formation evidence, NOT Brand Canon.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { FounderCharacterHypothesis } from './types.js';

export const NDXBOOK_FOUNDER_CHARACTER_HYPOTHESIS_RAW =
  'NDXBOOK is the grown-up, matured, grown-wiser version of the messy younger Burn Book energy it used to be. It learned from mistakes, gained context and became more intellectually responsible, but it is still the same nosy, culturally fluent, funny, opinionated, receipt-keeping character underneath.';

export function captureFounderCharacterHypothesis(params?: {
  rawWording?: string;
  projectId?: string;
}): FounderCharacterHypothesis {
  const rawWording = params?.rawWording?.trim() || NDXBOOK_FOUNDER_CHARACTER_HYPOTHESIS_RAW;
  const normalizedInterpretation =
    'Matured investigative receipt-keeper: same nosy cultural fluency and wit, with gained context, ethical restraint, and willingness to revise when evidence changes — not sanitized into corporate thought leadership.';
  return {
    id: `fch-${randomUUID().slice(0, 8)}`,
    projectId: params?.projectId ?? 'ndxbook',
    classification: 'FOUNDER_CHARACTER_HYPOTHESIS',
    authority: 'HIGH_VALUE_FORMATION_EVIDENCE',
    rawWording,
    normalizedInterpretation,
    maturationInsight:
      'Younger instinct ("Girl, look at this.") matured into contextual invitation ("Okay, look at this — because I think there is actually something going on here.") without erasing humor, messiness, or judgment.',
    isBrandCanon: false,
    isFinalCharacterSystem: false,
    isVisualStyleMandate: false,
    ancestryCalibrationRole: 'CHARACTER_ANCESTRY_CALIBRATION',
    capturedAt: new Date().toISOString(),
    fingerprint: createHash('sha256').update(rawWording).digest('hex').slice(0, 16),
  };
}

export function founderHypothesisIsEvidenceNotCanon(hypothesis: FounderCharacterHypothesis): boolean {
  return !hypothesis.isBrandCanon && hypothesis.classification === 'FOUNDER_CHARACTER_HYPOTHESIS';
}

export function rawFounderHypothesisPreserved(hypothesis: FounderCharacterHypothesis): boolean {
  return hypothesis.rawWording.length > 40 && hypothesis.rawWording !== hypothesis.normalizedInterpretation;
}
