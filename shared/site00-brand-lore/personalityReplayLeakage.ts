/**
 * Shadow replay leakage policy — benchmark downstream outputs must never enter generation inputs.
 */

import type { ReplayLeakageGuardResult } from './personalityReplayTypes.js';

/** Canonical direction names that must not appear in formation prompts during replay. */
export const FORBIDDEN_FORMATION_DIRECTION_NAMES = [
  'THE MARKED-UP COPY',
  'THE COUNTDOWN ROOM',
  'THE PERSONAL ARCHIVE',
  'THE ANNOTATED COPY',
  'THE ROOM WHERE IT HAPPENS',
  'THE INDEX',
] as const;

/** Downstream artifact keys that must never be in replay generation inputs. */
export const FORBIDDEN_REPLAY_INPUT_KEYS = [
  'benchmarkHeroImage',
  'benchmarkHeroPrompt',
  'benchmarkHeroTypography',
  'canonicalHeroTypography',
  'historicalPilotTypography',
  'martianMonoTypographyRoles',
  'canonicalIdentityNativeArtDirection',
  'canonicalCreativeExpressionSystem',
  'canonicalHeroCreativeConcept',
  'canonicalDirectionExpressionSystem',
  'currentBoardArtDirection',
  'currentFinalBoard',
  'downstreamRescueInstructions',
] as const;

export type ReplayInputPayload = Record<string, unknown>;

export function assertNoForbiddenReplayInputKeys(payload: ReplayInputPayload): ReplayLeakageGuardResult {
  const violations: string[] = [];
  for (const key of FORBIDDEN_REPLAY_INPUT_KEYS) {
    if (key in payload && payload[key] != null) {
      violations.push(`forbidden input key: ${key}`);
    }
  }
  return { allowed: violations.length === 0, violations };
}

export function assertNoForbiddenDirectionNamesInText(text: string): ReplayLeakageGuardResult {
  const violations: string[] = [];
  const upper = text.toUpperCase();
  for (const name of FORBIDDEN_FORMATION_DIRECTION_NAMES) {
    if (upper.includes(name)) {
      violations.push(`forbidden direction name in prompt: ${name}`);
    }
  }
  return { allowed: violations.length === 0, violations };
}

export function assertReplayFormationInputAllowed(input: {
  includeLegacyExplorations?: boolean;
  existingCreativeExplorations?: Array<{ directionName?: string }>;
  formationPromptText?: string;
}): ReplayLeakageGuardResult {
  const violations: string[] = [];

  if (input.includeLegacyExplorations === true) {
    violations.push('includeLegacyExplorations must be false for shadow replay');
  }

  for (const exploration of input.existingCreativeExplorations ?? []) {
    if (exploration.directionName) {
      const check = assertNoForbiddenDirectionNamesInText(exploration.directionName);
      violations.push(...check.violations);
    }
  }

  if (input.formationPromptText) {
    const check = assertNoForbiddenDirectionNamesInText(input.formationPromptText);
    violations.push(...check.violations);
  }

  return { allowed: violations.length === 0, violations };
}

export function stripPersonalityFromLoreSnapshot(profile: import('./types.js').BrandLoreProfile): import('./types.js').BrandLoreProfile {
  return {
    ...profile,
    brandPersonality: null,
  };
}
