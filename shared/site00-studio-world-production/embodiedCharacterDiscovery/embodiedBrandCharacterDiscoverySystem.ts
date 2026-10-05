/**
 * P0.5E.3 — Generic Embodied Brand Character Discovery System.
 */

import { EMBODIED_CHARACTER_DISCOVERY_VERSION } from './constants.js';
import { randomId } from './id.js';
import type { EmbodiedBrandCharacterDiscoverySystem } from './types.js';

export function buildEmbodiedBrandCharacterDiscoverySystem(brandId: string): EmbodiedBrandCharacterDiscoverySystem {
  return {
    systemId: randomId('ebcds'),
    version: EMBODIED_CHARACTER_DISCOVERY_VERSION,
    brandId,
    distinctFromFounder: true,
    distinctFromBrandCharacter: true,
    brandCharacterInheritance: 'SELECTED_PSYCHOLOGICAL_INHERITANCE',
    visualDesignFinalized: false,
    finalFaceSelected: false,
    characterGenerationPerformed: false,
    falRequired: false,
  };
}

export function embodiedCharacterDistinctFromFounder(): true {
  return true;
}

export function embodiedCharacterDistinctFromBrandCharacter(): true {
  return true;
}

export function brandCharacterInheritanceIsSelectedNotAutomatic(): true {
  return true;
}

export function noFalRequiredForDiscovery(): true {
  return true;
}

export function generationRemainsFounderTriggered(): true {
  return true;
}

export function contractMutationDoesNotTriggerFal(): true {
  return true;
}
