/**
 * P0.5E.4A — Founder cognitive load evaluation.
 */

import { FOUNDER_COGNITIVE_LOAD_MUST_REMAIN_LOW } from './constants.js';

const INTERNAL_DIAGNOSTIC_PATTERNS = [
  'SYSTEM_SEEDED',
  'HYPOTHESIS',
  'TRAIT_AUTHORITY',
  'INFERRED_PENDING',
  'CONTRADICTION_DETECTION',
  'PATTERN_RECOGNITION',
  'CULTURAL_MEMORY',
  'BULLSHIT_DETECTION',
];

export function canFounderAnswerByRecognition(proposition: string): boolean {
  const upper = proposition.toUpperCase();
  if (INTERNAL_DIAGNOSTIC_PATTERNS.some((p) => upper.includes(p))) return false;
  if (proposition.split('\n').length > 14) return false;
  return proposition.length <= 1000;
}

export function rewritePropositionForLowLoad(proposition: string): string {
  if (canFounderAnswerByRecognition(proposition)) return proposition;
  return proposition.replace(/SYSTEM_SEEDED|HYPOTHESIS/gi, '').trim();
}

export function founderCognitiveLoadMustRemainLow(): boolean {
  return FOUNDER_COGNITIVE_LOAD_MUST_REMAIN_LOW;
}

export function abstractTraitsNotPrimaryFounderQuestions(proposition: string): boolean {
  const abstract = ['PATTERN RECOGNITION', 'CONTRADICTION DETECTION', 'CULTURAL MEMORY', 'BULLSHIT DETECTION'];
  return !abstract.some((a) => proposition.toUpperCase().includes(a));
}

export function systemSeededMetadataHiddenFromPrimaryUx(text: string): boolean {
  return !text.includes('SYSTEM_SEEDED · HYPOTHESIS');
}
