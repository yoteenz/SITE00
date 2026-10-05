/**
 * P0.5E.4F — Canonical character visual authority builder.
 */

import { randomUUID } from 'node:crypto';
import { ANCHOR_DEPENDENT_NEGATIVE_CONSTRAINTS } from '../characterVisualCasting/constants.js';
import type { CharacterVisualCastingState } from '../characterVisualCasting/types.js';
import { NDX_VISUAL_VERSION_PREFIX } from './constants.js';
import {
  evaluateNDXProductionReadiness,
  evaluateNDXVisualIdentityReadiness,
} from './readiness.js';
import type { CanonicalCharacterVisualAuthority, CanonicalCharacterVisualVersion } from './types.js';

export function buildCanonicalCharacterVisualVersion(
  casting: CharacterVisualCastingState | null | undefined,
  overrides?: Partial<CanonicalCharacterVisualVersion>,
): CanonicalCharacterVisualVersion {
  const packId = casting?.characterBibleAssetPack?.packId ?? null;
  const versionNumber = casting?.visualCastingLineage.filter((e) => e.kind === 'BIBLE_PACK_APPROVAL').length || 1;

  return {
    versionId: randomUUID(),
    versionLabel: `${NDX_VISUAL_VERSION_PREFIX}_V${versionNumber}`,
    createdAt: new Date().toISOString(),
    founderReferenceIds: casting?.founderReferences.map((r) => r.referenceId) ?? [],
    canonicalAnchorId: casting?.canonicalAnchor?.anchorId ?? null,
    referencePackId: packId,
    wardrobeBibleVersion: casting?.visualAuthoritySnapshot?.wardrobeLock.lockId ?? null,
    environmentAuthorityVersion: casting?.visualAuthoritySnapshot?.environmentLock.lockId ?? null,
    status: resolveVersionStatus(casting),
    supersedesVersionId: null,
    ...overrides,
  };
}

function resolveVersionStatus(
  casting: CharacterVisualCastingState | null | undefined,
): CanonicalCharacterVisualVersion['status'] {
  const production = evaluateNDXProductionReadiness({ casting });
  if (production.readyForMotionProduction) return 'READY_FOR_MOTION';
  if (production.readyForStillProduction) return 'READY_FOR_STILL';
  return 'DRAFT';
}

export function buildCanonicalCharacterVisualAuthority(
  casting: CharacterVisualCastingState | null | undefined,
): CanonicalCharacterVisualAuthority | null {
  if (!casting?.visualAuthoritySnapshot) return null;

  const visualVersion = buildCanonicalCharacterVisualVersion(casting);
  const visualReadiness = evaluateNDXVisualIdentityReadiness(casting);
  const productionReadiness = evaluateNDXProductionReadiness({ casting });
  const authority = casting.visualAuthoritySnapshot;
  const anchor = casting.canonicalAnchor;
  const fullLook = casting.founderReferences.find((r) => r.role === 'FULL_LOOK');

  return {
    authorityId: randomUUID(),
    characterId: 'ndx',
    visualVersion,
    approvedFounderReferenceId: fullLook?.referenceId ?? casting.activeReferenceAuthority?.referenceId ?? null,
    approvedFounderReferenceUrl: fullLook?.previewUrl ?? casting.activeReferenceAuthority?.previewUrl ?? null,
    canonicalAnchorId: anchor?.anchorId ?? null,
    canonicalAnchorPreviewUrl: anchor?.previewUrl ?? null,
    identityLockId: authority.identityLock.lockId,
    wardrobeLockId: authority.wardrobeLock.lockId,
    environmentLockId: authority.environmentLock.lockId,
    referencePackId: casting.characterBibleAssetPack?.packId ?? null,
    anglePackSlotCount: casting.characterBibleAssetPack?.slots.length ?? 0,
    negativeIdentityConstraints: [...ANCHOR_DEPENDENT_NEGATIVE_CONSTRAINTS],
    continuityEvaluationIds: casting.continuityDriftEvaluations.map((e) => e.evaluationId),
    visualIdentityReadiness: visualReadiness,
    productionReadiness: productionReadiness,
    compiledAt: new Date().toISOString(),
  };
}
