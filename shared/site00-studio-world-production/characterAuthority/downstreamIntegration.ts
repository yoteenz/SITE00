/**
 * P0.5E.4F — Downstream integration helpers (carousel, film, FCI, realism lab).
 */

import type { CharacterVisualCastingState } from '../characterVisualCasting/types.js';
import { buildCharacterAuthorityContext } from './castingBridge.js';
import {
  injectCharacterAuthorityIntoPrompt,
  requestCharacterInjectionBundle,
} from './injectionAuthority.js';
import {
  evaluatePreCanonCharacterGenerationGuard,
  evaluateProductionCharacterGenerationGuard,
} from './preCanonGuard.js';
import type { CharacterAuthoritySurface, CharacterInjectionBundle } from './types.js';

export function assertCarouselCharacterPhotographyAllowed(params: {
  casting: CharacterVisualCastingState | null | undefined;
  projectId: string;
  requiresCharacterPhotography: boolean;
}): { bundle: CharacterInjectionBundle | null; guard: ReturnType<typeof evaluatePreCanonCharacterGenerationGuard> } {
  const guard = evaluatePreCanonCharacterGenerationGuard({
    casting: params.casting,
    surface: 'CAROUSEL',
    requiresCharacterPhotography: params.requiresCharacterPhotography,
    allowReferenceOnly: true,
    allowPlaceholder: true,
  });

  if (!guard.allowed && params.requiresCharacterPhotography) {
    throw new Error(guard.founderMessage ?? 'CHARACTER_VISUAL_IDENTITY_NOT_READY');
  }

  const bundle =
    guard.mode === 'PRODUCTION' && params.requiresCharacterPhotography
      ? requestCharacterInjectionBundle({
          request: {
            projectId: params.projectId,
            characterId: 'ndx',
            surface: 'CAROUSEL',
            requiresCharacterPhotography: true,
          },
          casting: params.casting,
        })
      : null;

  return { bundle, guard };
}

export function compileV23PromptWithCharacterAuthority(params: {
  basePrompt: string;
  casting: CharacterVisualCastingState | null | undefined;
  projectId: string;
  requiresCharacterPhotography: boolean;
}): { prompt: string; bundle: CharacterInjectionBundle | null; blocked: boolean; blockReason: string | null } {
  if (!params.requiresCharacterPhotography) {
    return { prompt: params.basePrompt, bundle: null, blocked: false, blockReason: null };
  }

  const { bundle, guard } = assertCarouselCharacterPhotographyAllowed({
    casting: params.casting,
    projectId: params.projectId,
    requiresCharacterPhotography: true,
  });

  if (guard.mode === 'CHARACTER_PLACEHOLDER') {
    return {
      prompt: `[${guard.founderMessage}] Layout only — no generated woman`,
      bundle: null,
      blocked: false,
      blockReason: null,
    };
  }

  if (guard.mode === 'REFERENCE_ONLY') {
    return {
      prompt: params.basePrompt,
      bundle: null,
      blocked: false,
      blockReason: guard.founderMessage,
    };
  }

  if (!bundle) {
    return { prompt: params.basePrompt, bundle: null, blocked: true, blockReason: guard.founderMessage };
  }

  return {
    prompt: injectCharacterAuthorityIntoPrompt(params.basePrompt, bundle),
    bundle,
    blocked: false,
    blockReason: null,
  };
}

export function assertFilmCharacterGenerationAllowed(params: {
  casting: CharacterVisualCastingState | null | undefined;
  requiresMotion?: boolean;
}): ReturnType<typeof evaluateProductionCharacterGenerationGuard> {
  return evaluateProductionCharacterGenerationGuard({
    casting: params.casting,
    requiresMotion: params.requiresMotion ?? false,
  });
}

export function assertFounderCreativeNdxPhotographyAllowed(params: {
  casting: CharacterVisualCastingState | null | undefined;
  sequenceId: string;
  hasNdxPhotography: boolean;
}): ReturnType<typeof evaluatePreCanonCharacterGenerationGuard> {
  const surface: CharacterAuthoritySurface =
    params.sequenceId.includes('meet') ? 'MEET_NDX' : 'FOUNDER_CREATIVE_RECONSTRUCTION';

  const guard = evaluatePreCanonCharacterGenerationGuard({
    casting: params.casting,
    surface,
    requiresCharacterPhotography: params.hasNdxPhotography,
    allowReferenceOnly: true,
    allowPlaceholder: true,
  });

  if (!guard.allowed && params.hasNdxPhotography) {
    throw new Error(guard.founderMessage ?? 'CHARACTER_VISUAL_IDENTITY_NOT_READY');
  }

  return guard;
}

export function realismLabPreCanonCannotBecomeNdxCanon(
  visualIdentityReady: boolean,
  isCanonicalNdxTest: boolean,
): boolean {
  return !visualIdentityReady && isCanonicalNdxTest;
}

export function creditUtilizationPlanningAllowedBeforeLock(): true {
  return true;
}

export function meetNdxFinalPhotographyBlockedBeforeLock(
  casting: CharacterVisualCastingState | null | undefined,
): boolean {
  const ctx = buildCharacterAuthorityContext(casting);
  return !ctx.visualIdentityReadiness.ready;
}

export function filmCanPlanBeforeVisualLock(): true {
  return true;
}

export function downstreamSystemsCanIndependentlyReinventNdx(): false {
  return false;
}
