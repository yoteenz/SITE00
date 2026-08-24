/**
 * P0.5E.3 — Camera relationship — not every reel is talking-head.
 */

import { randomId } from './id.js';
import { CAMERA_RELATIONSHIP_MODES } from './constants.js';
import type { EmbodiedCharacterCameraRelationship } from './types.js';

export function buildEmbodiedCharacterCameraRelationship(
  overrides: Partial<EmbodiedCharacterCameraRelationship> = {},
): EmbodiedCharacterCameraRelationship {
  return {
    relationshipId: randomId('cam'),
    modes: overrides.modes ?? [...CAMERA_RELATIONSHIP_MODES],
    whenSheTalksToUs: overrides.whenSheTalksToUs ?? 'TBD — discovery',
    whenWeObserveHer: overrides.whenWeObserveHer ?? 'TBD — discovery',
    whenSheForgetsCamera: overrides.whenSheForgetsCamera ?? 'TBD — discovery',
  };
}

export function cameraRelationshipModeled(rel: EmbodiedCharacterCameraRelationship): boolean {
  return rel.modes.length >= 4;
}
