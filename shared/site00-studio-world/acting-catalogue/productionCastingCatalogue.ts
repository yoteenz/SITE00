/**
 * Studio World production casting catalogue — Season 1 residents projected to eligible ACTOR/talent entries.
 * Legacy seed roster remains in seedCatalogue.ts for Entry 002 fixtures and explicit demo/test imports only.
 */

import {
  projectAllResidentsToActors,
  type ResidentBackedStudioWorldActor,
} from '../resident-intelligence/season1-ensemble/projectToActor.js';
import type { ActorIdentityAuthority, StudioWorldActor, StudioWorldActorCatalogue } from './types.js';

export const PRODUCTION_ACTING_CATALOGUE_ID = 'studio-world-season1-resident-casting' as const;
export const PRODUCTION_ACTING_CATALOGUE_SOURCE = 'resident-intelligence/season1-ensemble' as const;

function identityAuthorityFor(actor: StudioWorldActor): ActorIdentityAuthority {
  const now = actor.updatedAt;
  const thumb = actor.headshotPreviewUrl;
  return {
    identityAuthorityId: actor.identityAuthorityId,
    actorId: actor.actorId,
    canonicalFaceDescription: `${actor.stageName}: ${actor.facialFeatures}`,
    facialProportions: 'Resident identity — see casting thumbnail authority',
    baselineSkinAppearance: actor.skinToneDescription,
    baselineBodyProportions: 'Resident fabrication authority — not stock demographics',
    baselineHairState: actor.hairBaseline,
    neutralExpressionNote: 'Casting thumbnail — approved resident visual authority',
    views: [
      {
        view: 'FRONTAL',
        assetId: `asset-${actor.catalogueNumber}-casting-thumbnail`,
        storagePath: null,
        previewUrl: thumb,
      },
      { view: 'THREE_QUARTER', assetId: `asset-${actor.catalogueNumber}-34`, storagePath: null, previewUrl: null },
      { view: 'PROFILE', assetId: `asset-${actor.catalogueNumber}-profile`, storagePath: null, previewUrl: null },
      { view: 'FULL_BODY', assetId: `asset-${actor.catalogueNumber}-body`, storagePath: null, previewUrl: null },
    ],
    immutable: true,
    createdAt: now,
    updatedAt: now,
  };
}

/** Residents eligible for casting (excludes ARCHIVED availability from projection). */
export function getProductionStudioWorldActorCatalogue(): StudioWorldActorCatalogue {
  const actors: ResidentBackedStudioWorldActor[] = projectAllResidentsToActors().filter(
    (a) => a.availabilityState !== 'ARCHIVED',
  );
  return {
    catalogueId: PRODUCTION_ACTING_CATALOGUE_ID,
    version: '1.0.0',
    actors,
    identityAuthorities: actors.map(identityAuthorityFor),
    updatedAt: '2026-10-05T00:00:00.000Z',
  };
}

export function findProductionActorByCatalogueNumber(catalogueNumber: string): ResidentBackedStudioWorldActor | null {
  const actors = getProductionStudioWorldActorCatalogue().actors as readonly ResidentBackedStudioWorldActor[];
  return actors.find((a) => a.catalogueNumber === catalogueNumber || a.sourceResidentId === catalogueNumber) ?? null;
}

export function findProductionActorById(actorId: string): ResidentBackedStudioWorldActor | null {
  const actors = getProductionStudioWorldActorCatalogue().actors as readonly ResidentBackedStudioWorldActor[];
  return actors.find((a) => a.actorId === actorId) ?? null;
}
