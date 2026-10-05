/**
 * Character continuity validation across look / wardrobe / temporal states.
 */

import { findIdentityAuthority } from './seedCatalogue.js';
import type {
  CharacterAuthoritySheet,
  CharacterCampaignLook,
  CharacterTemporalLook,
  ProductionCharacter,
  StudioWorldActor,
} from './types.js';

export type ContinuityValidationInput = {
  character: ProductionCharacter;
  actor: StudioWorldActor | null;
  look: CharacterCampaignLook | null;
  temporalLook: CharacterTemporalLook | null;
  authoritySheet: CharacterAuthoritySheet | null;
  priorLook: CharacterCampaignLook | null;
};

export type ContinuityValidationResult = {
  valid: boolean;
  driftFlags: readonly string[];
};

export function validateCharacterContinuity(input: ContinuityValidationInput): ContinuityValidationResult {
  const driftFlags: string[] = [];
  const { character, actor, look, temporalLook, authoritySheet } = input;

  if (!actor && character.screenImportance !== 'ENSEMBLE') {
    driftFlags.push('Missing catalogue Actor for non-ensemble character');
  }

  if (actor && authoritySheet && authoritySheet.actorId !== actor.actorId) {
    driftFlags.push('Character authority actorId mismatch');
  }

  if (actor) {
    const identity = findIdentityAuthority(actor.actorId);
    if (!identity) driftFlags.push('Missing ActorIdentityAuthority');
    else if (authoritySheet && authoritySheet.actorIdentityAuthorityId !== identity.identityAuthorityId) {
      driftFlags.push('Identity authority id drift');
    }
  }

  if (temporalLook && !temporalLook.preservesActorIdentity) {
    driftFlags.push('Temporal look must preserve actor identity');
  }

  if (look && input.priorLook && look.wardrobeContinuityDefault === 'SAME') {
    if (look.wardrobe !== input.priorLook.wardrobe) {
      driftFlags.push('Wardrobe changed without continuity mode update');
    }
  }

  if (look && temporalLook) {
    if (look.lookId !== temporalLook.campaignLookId) {
      driftFlags.push('Temporal look campaignLookId mismatch');
    }
  }

  if (authoritySheet?.locked === false && character.status === 'LOCKED') {
    driftFlags.push('Character locked without locked authority sheet');
  }

  return { valid: driftFlags.length === 0, driftFlags };
}
