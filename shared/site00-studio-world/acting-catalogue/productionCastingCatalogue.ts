/**
 * Production Casting UI dataset — Studio World residents only (not generic mocks, not client-cast unless explicitly added).
 */

import { getStudioWorldSeason1ResidentDossiers } from '../resident-intelligence/season1-ensemble/residents.js';
import { projectResidentToStudioWorldActor } from '../resident-intelligence/season1-ensemble/projectToActor.js';
import { STUDIO_WORLD_SEASON1_CATALOGUE_VERSION } from './types.js';
import type { StudioWorldActorCatalogue } from './types.js';

export function getProductionCastingResidentTalentCatalogue(): StudioWorldActorCatalogue {
  const actors = getStudioWorldSeason1ResidentDossiers().map(projectResidentToStudioWorldActor);
  return {
    catalogueId: 'studio-world-season1-resident-talent',
    version: STUDIO_WORLD_SEASON1_CATALOGUE_VERSION,
    actors,
    identityAuthorities: actors.map((a) => ({
      identityAuthorityId: a.identityAuthorityId,
      actorId: a.actorId,
      canonicalFaceDescription: `${a.stageName} — ${a.skinToneDescription}; asset pending if no preview`,
      facialProportions: 'Resident canon — do not replace for role',
      baselineSkinAppearance: a.skinToneDescription,
      baselineBodyProportions: a.build,
      baselineHairState: a.hairBaseline,
      neutralExpressionNote: a.cameraBehavior,
      views: [
        { view: 'FRONTAL', assetId: `asset-${a.catalogueNumber}-front`, storagePath: null, previewUrl: a.headshotPreviewUrl },
        { view: 'THREE_QUARTER', assetId: `asset-${a.catalogueNumber}-34`, storagePath: null, previewUrl: null },
        { view: 'PROFILE', assetId: `asset-${a.catalogueNumber}-profile`, storagePath: null, previewUrl: null },
        { view: 'FULL_BODY', assetId: `asset-${a.catalogueNumber}-body`, storagePath: null, previewUrl: null },
      ],
      immutable: true,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    })),
    updatedAt: '2026-10-03T00:00:00.000Z',
  };
}
