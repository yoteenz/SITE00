/**
 * Studio World acting catalogue — Production resident ensemble + preserved client-cast talent for assignments.
 * Generic mock seed actors retired (see legacyGenericMockCatalogue + MOCK_ACTOR_MIGRATION.md).
 */

import { getStudioWorldSeason1ResidentDossiers } from '../resident-intelligence/season1-ensemble/residents.js';
import { projectResidentToStudioWorldActor } from '../resident-intelligence/season1-ensemble/projectToActor.js';
import {
  PRESERVED_CLIENT_CAST_IDENTITY_AUTHORITIES,
  PRESERVED_CLIENT_CAST_TALENT,
} from './preservedClientCastTalent.js';
import { STUDIO_WORLD_SEASON1_CATALOGUE_VERSION } from './types.js';
import type { ActorIdentityAuthority, StudioWorldActor, StudioWorldActorCatalogue } from './types.js';

const RESIDENT_ACTORS = getStudioWorldSeason1ResidentDossiers().map(projectResidentToStudioWorldActor);

const ALL_ACTORS: StudioWorldActor[] = [...RESIDENT_ACTORS, ...PRESERVED_CLIENT_CAST_TALENT];

const IDENTITY_AUTHORITIES: ActorIdentityAuthority[] = [
  ...RESIDENT_ACTORS.map((a) => ({
    identityAuthorityId: a.identityAuthorityId,
    actorId: a.actorId,
    canonicalFaceDescription: `${a.stageName} resident authority — ${a.facialFeatures}`,
    facialProportions: 'Resident canon locked',
    baselineSkinAppearance: a.skinToneDescription,
    baselineBodyProportions: a.build,
    baselineHairState: a.hairBaseline,
    neutralExpressionNote: 'Resident neutral — see camera behavior in dossier',
    views: [
      { view: 'FRONTAL' as const, assetId: `asset-${a.catalogueNumber}-front`, storagePath: null, previewUrl: a.headshotPreviewUrl },
      { view: 'THREE_QUARTER' as const, assetId: `asset-${a.catalogueNumber}-34`, storagePath: null, previewUrl: null },
      { view: 'PROFILE' as const, assetId: `asset-${a.catalogueNumber}-profile`, storagePath: null, previewUrl: null },
      { view: 'FULL_BODY' as const, assetId: `asset-${a.catalogueNumber}-body`, storagePath: null, previewUrl: null },
    ],
    immutable: true as const,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  })),
  ...PRESERVED_CLIENT_CAST_IDENTITY_AUTHORITIES,
];

export function getStudioWorldActorCatalogue(): StudioWorldActorCatalogue {
  return {
    catalogueId: 'studio-world-acting-company',
    version: STUDIO_WORLD_SEASON1_CATALOGUE_VERSION,
    actors: ALL_ACTORS,
    identityAuthorities: IDENTITY_AUTHORITIES,
    updatedAt: '2026-10-03T00:00:00.000Z',
  };
}

export function findActorByCatalogueNumber(catalogueNumber: string): StudioWorldActor | null {
  return ALL_ACTORS.find((a) => a.catalogueNumber === catalogueNumber) ?? null;
}

export function findActorById(actorId: string): StudioWorldActor | null {
  return ALL_ACTORS.find((a) => a.actorId === actorId) ?? null;
}

export function findIdentityAuthority(actorId: string): ActorIdentityAuthority | null {
  return IDENTITY_AUTHORITIES.find((i) => i.actorId === actorId) ?? null;
}

/** Resident-only pool for Expression → Casting → Actors (excludes client-cast SW-017). */
export function listStudioWorldResidentTalentActors(): StudioWorldActor[] {
  return [...RESIDENT_ACTORS];
}
