/**
 * P0.5E.3 — Archetype collapse guards — require behavioral evidence.
 */

import { ARCHETYPE_COLLAPSE_FAILURES } from './constants.js';
import type { ArchetypeCollapseFailure } from './types.js';

export function evaluateArchetypeCollapse(params: {
  adjectiveOnlyTraits: boolean;
  perfectCharacter: boolean;
  alwaysSnarky: boolean;
  alwaysUnbothered: boolean;
  alwaysCameraReady: boolean;
  influencerHost: boolean;
  brandMascot: boolean;
  founderClone: boolean;
  derivativeCharacterClone: boolean;
  aiPersonality: boolean;
  culturalReferenceMachine: boolean;
  coolGirlArchetype: boolean;
  sassyArchetype: boolean;
  smartGirlCostume: boolean;
}): { passes: boolean; failures: ArchetypeCollapseFailure[] } {
  const failures: ArchetypeCollapseFailure[] = [];
  if (params.coolGirlArchetype) failures.push('FAIL_COOL_GIRL_ARCHETYPE');
  if (params.sassyArchetype) failures.push('FAIL_SASSY_WOMAN_ARCHETYPE');
  if (params.smartGirlCostume) failures.push('FAIL_SMART_GIRL_COSTUME');
  if (params.influencerHost) failures.push('FAIL_INFLUENCER_HOST');
  if (params.brandMascot) failures.push('FAIL_BRAND_MASCOT');
  if (params.perfectCharacter) failures.push('FAIL_PERFECT_CHARACTER');
  if (params.adjectiveOnlyTraits) failures.push('FAIL_ADJECTIVE_CHARACTER');
  if (params.founderClone) failures.push('FAIL_FOUNDER_CLONE');
  if (params.derivativeCharacterClone) failures.push('FAIL_DERIVATIVE_CHARACTER_CLONE');
  if (params.aiPersonality) failures.push('FAIL_AI_PERSONALITY');
  if (params.alwaysSnarky) failures.push('FAIL_ALWAYS_SNARKY');
  if (params.alwaysUnbothered) failures.push('FAIL_ALWAYS_UNBOTHERED');
  if (params.alwaysCameraReady) failures.push('FAIL_ALWAYS_CAMERA_READY');
  if (params.culturalReferenceMachine) failures.push('FAIL_CULTURAL_REFERENCE_MACHINE');
  return { passes: failures.length === 0, failures };
}

export function founderCloneBehaviorFails(founderClone: boolean): boolean {
  return evaluateArchetypeCollapse({
    adjectiveOnlyTraits: false,
    perfectCharacter: false,
    alwaysSnarky: false,
    alwaysUnbothered: false,
    alwaysCameraReady: false,
    influencerHost: false,
    brandMascot: false,
    founderClone,
    derivativeCharacterClone: false,
    aiPersonality: false,
    culturalReferenceMachine: false,
    coolGirlArchetype: false,
    sassyArchetype: false,
    smartGirlCostume: false,
  }).failures.includes('FAIL_FOUNDER_CLONE');
}

export function burnBookCloneBehaviorFails(derivativeClone: boolean): boolean {
  return evaluateArchetypeCollapse({
    adjectiveOnlyTraits: false,
    perfectCharacter: false,
    alwaysSnarky: false,
    alwaysUnbothered: false,
    alwaysCameraReady: false,
    influencerHost: false,
    brandMascot: false,
    founderClone: false,
    derivativeCharacterClone: derivativeClone,
    aiPersonality: false,
    culturalReferenceMachine: false,
    coolGirlArchetype: false,
    sassyArchetype: false,
    smartGirlCostume: false,
  }).failures.includes('FAIL_DERIVATIVE_CHARACTER_CLONE');
}

export function archetypeCollapseFailureModes(): readonly string[] {
  return ARCHETYPE_COLLAPSE_FAILURES;
}
