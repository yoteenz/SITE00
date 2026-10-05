/**
 * P0.5E.4E.1 — Image-reference casting state migration helpers.
 */

import type { CharacterVisualCastingState } from './types.js';
import { migrateReferenceDrivenCastingState } from './referenceDrivenCasting.js';

export function migrateImageReferenceCastingState(state: CharacterVisualCastingState): CharacterVisualCastingState {
  const base = migrateReferenceDrivenCastingState(state);
  return {
    ...base,
    castingAuthorityMode: base.castingAuthorityMode ?? 'REFERENCE_IMAGE_DRIVEN',
    characterImageReferenceAuthority: base.characterImageReferenceAuthority ?? null,
    characterIsolate: base.characterIsolate ?? null,
    environmentPlate: base.environmentPlate ?? null,
    characterTurnaroundPack: base.characterTurnaroundPack ?? null,
  };
}

export function assertCharacterIsolateApproved(state: CharacterVisualCastingState): void {
  const isolate = state.characterIsolate;
  const anchor = state.canonicalAnchor;
  if (isolate?.status === 'APPROVED') return;
  if (anchor?.status === 'APPROVED') return;
  throw new Error('Character isolate must be approved before turnaround generation');
}

export function isCharacterIsolateApproved(state: CharacterVisualCastingState): boolean {
  return state.characterIsolate?.status === 'APPROVED' || state.canonicalAnchor?.status === 'APPROVED';
}

export function turnaroundBlockedUntilIsolateApproved(state: CharacterVisualCastingState): boolean {
  return !isCharacterIsolateApproved(state);
}
