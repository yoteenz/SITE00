/**
 * P0.5E.4F — NDX-specific character authority adapter.
 */

import type { CharacterVisualCastingState } from '../characterVisualCasting/types.js';
import { buildCharacterAuthorityContext } from './castingBridge.js';
import {
  compileInjectionPromptSections,
  injectCharacterAuthorityIntoPrompt,
  requestCharacterInjectionBundle,
} from './injectionAuthority.js';
import { evaluatePreCanonCharacterGenerationGuard } from './preCanonGuard.js';
import type { CharacterInjectionRequest, CharacterAssetLineageRecord } from './types.js';

export const NDX_BOOK_BEHAVIOR_NOTES = [
  'Book relationship informs presence — not visual identity drift',
  'Lime accent restrained per scene',
  'NDX working wardrobe from approved bible only in production',
] as const;

export function buildNdxCharacterInjectionForSurface(params: {
  casting: CharacterVisualCastingState | null | undefined;
  projectId: string;
  surface: CharacterInjectionRequest['surface'];
  requiresCharacterPhotography: boolean;
  sceneContext?: string;
}): {
  guard: ReturnType<typeof evaluatePreCanonCharacterGenerationGuard>;
  bundle: ReturnType<typeof requestCharacterInjectionBundle>;
  context: ReturnType<typeof buildCharacterAuthorityContext>;
} {
  const context = buildCharacterAuthorityContext(params.casting);
  const guard = evaluatePreCanonCharacterGenerationGuard({
    casting: params.casting,
    surface: params.surface,
    requiresCharacterPhotography: params.requiresCharacterPhotography,
    allowReferenceOnly: true,
    allowPlaceholder: true,
  });

  const bundle =
    guard.mode === 'PRODUCTION'
      ? requestCharacterInjectionBundle({
          request: {
            projectId: params.projectId,
            characterId: 'ndx',
            surface: params.surface,
            requiresCharacterPhotography: params.requiresCharacterPhotography,
            sceneContext: params.sceneContext ?? null,
          },
          casting: params.casting,
        })
      : null;

  return { guard, bundle, context };
}

export function buildNdxAssetLineageRecord(params: {
  bundle: NonNullable<ReturnType<typeof requestCharacterInjectionBundle>>;
  continuityEvaluationId?: string | null;
}): CharacterAssetLineageRecord {
  return {
    characterId: 'ndx',
    characterVisualVersion: params.bundle.characterVisualVersion,
    injectionBundleSnapshot: params.bundle,
    wardrobeContinuityId: params.bundle.wardrobeContinuityId,
    environmentAuthorityId: params.bundle.environmentAuthorityId,
    providerReferenceIds: params.bundle.providerReferencePack,
    continuityEvaluationId: params.continuityEvaluationId ?? null,
  };
}

export { compileInjectionPromptSections, injectCharacterAuthorityIntoPrompt };

export function ndxCharacterBehaviorAdapterDriven(): true {
  return (NDX_BOOK_BEHAVIOR_NOTES.length > 0) as true;
}
