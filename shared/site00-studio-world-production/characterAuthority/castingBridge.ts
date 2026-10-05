/**
 * P0.5E.4F — Bridge casting state → character authority context.
 */

import type { CharacterVisualCastingState } from '../characterVisualCasting/types.js';
import { buildCanonicalCharacterVisualAuthority } from './canonicalAuthority.js';
import {
  evaluateNDXCharacterTruthReadiness,
  evaluateNDXProductionReadiness,
  evaluateNDXVisualIdentityReadiness,
} from './readiness.js';
import type { CharacterAuthorityContext } from './types.js';

export function buildCharacterAuthorityContext(
  casting: CharacterVisualCastingState | null | undefined,
  overrides?: {
    stillContinuityPass?: boolean;
    shortVideoContinuityPass?: boolean;
  },
): CharacterAuthorityContext {
  const truthReadiness = evaluateNDXCharacterTruthReadiness(casting);
  const visualIdentityReadiness = evaluateNDXVisualIdentityReadiness(casting);
  const productionReadiness = evaluateNDXProductionReadiness({
    casting,
    stillContinuityPass: overrides?.stillContinuityPass,
    shortVideoContinuityPass: overrides?.shortVideoContinuityPass,
  });
  const canonicalAuthority = buildCanonicalCharacterVisualAuthority(casting);

  return {
    characterId: 'ndx',
    truthReadiness,
    visualIdentityReadiness,
    productionReadiness,
    canonicalAuthority,
    visualVersion: canonicalAuthority?.visualVersion ?? null,
  };
}

export function autoUnblockPlannedAssetsAfterReadiness(
  visualReady: boolean,
  productionReady: boolean,
): { scriptsNeedRebuild: boolean; storyboardsNeedRebuild: boolean; visualGenerationUnblocked: boolean } {
  return {
    scriptsNeedRebuild: false,
    storyboardsNeedRebuild: false,
    visualGenerationUnblocked: visualReady || productionReady,
  };
}
