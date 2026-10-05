/**
 * Bridge P0 acting catalogue into modular engine library model.
 */

import type { StudioWorldActor } from '../acting-catalogue/types.js';
import type { ActingCatalogueEntry } from './libraryTypes.js';

export function actorToCatalogueEntry(actor: StudioWorldActor): ActingCatalogueEntry {
  return {
    libraryKind: 'ACTING_CATALOGUE',
    actorId: actor.actorId,
    catalogueNumber: actor.catalogueNumber,
    identityAuthorityId: actor.identityAuthorityId,
    demographicTags: [
      actor.presentation,
      actor.ageRange,
      actor.skinToneDescription,
      ...actor.nationalityOrCulturalCastingTags,
    ],
    beautyFashionEditorialTags: [...actor.fashionRange, ...actor.editorialFit],
    personalityCompatibility: [...actor.performanceProfile, ...actor.personalityRange],
    roleHistory: [...actor.charactersPlayed],
    wardrobeCompatibility: [...actor.wardrobeCompatibility],
    movementCompatibility: [...actor.cinematicPresence],
    usageHistorySummary: `${actor.campaignsUsed.length} campaigns · ${actor.projectsUsed.join(', ')}`,
    tags: actor.roleArchetypes.map(String),
    version: '1.0.0',
    approvalStatus: actor.status === 'ACTIVE' ? 'APPROVED' : 'FOUNDER_REVIEW',
    scopeTier: 'FOUNDER_INTERNAL_ONLY',
    exclusivity: 'INTERNAL_ONLY',
    clientIds: [],
    projectIds: [...actor.projectsUsed],
    createdAt: actor.createdAt,
    updatedAt: actor.updatedAt,
  };
}
