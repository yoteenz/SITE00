/**
 * P0.5E.3 — Embodied character psychology (behavioral, not personality-test output).
 */

import { randomId } from './id.js';
import type { EmbodiedCharacterPsychology } from './types.js';

export function buildEmbodiedCharacterPsychology(overrides: Partial<EmbodiedCharacterPsychology> = {}): EmbodiedCharacterPsychology {
  return {
    psychologyId: randomId('psy'),
    whatSheNotices: overrides.whatSheNotices ?? [],
    whatSheIgnores: overrides.whatSheIgnores ?? [],
    whatBothersHer: overrides.whatBothersHer ?? [],
    whatDelightsHer: overrides.whatDelightsHer ?? [],
    attentionBiases: overrides.attentionBiases ?? [],
    curiosityTriggers: overrides.curiosityTriggers ?? [],
    skepticismTriggers: overrides.skepticismTriggers ?? [],
    emotionalTriggers: overrides.emotionalTriggers ?? [],
    petPeeves: overrides.petPeeves ?? [],
    insecurities: overrides.insecurities ?? [],
    confidenceSources: overrides.confidenceSources ?? [],
    avoidancePatterns: overrides.avoidancePatterns ?? [],
    decisionStyle: overrides.decisionStyle ?? 'TBD — discovery in progress',
    conflictStyle: overrides.conflictStyle ?? 'TBD — discovery in progress',
    selfCorrectionBehavior: overrides.selfCorrectionBehavior ?? 'TBD — discovery in progress',
    memoryBehavior: overrides.memoryBehavior ?? 'TBD — discovery in progress',
    obsessionBehavior: overrides.obsessionBehavior ?? 'TBD — discovery in progress',
    uncertaintyBehavior: overrides.uncertaintyBehavior ?? 'TBD — discovery in progress',
  };
}

export function psychologyRequiresBehavioralEvidence(psychology: EmbodiedCharacterPsychology): boolean {
  return psychology.whatSheNotices.length > 0 || psychology.attentionBiases.length > 0;
}
