/**
 * Canonical adapters: Studio World actor catalogue + Entry 002 cast state → Fabrication ACTOR / CHARACTER records.
 * ACTOR and CHARACTER stay separate: actor = reusable catalogue identity, character = project role instantiated from it.
 */
import {
  getProductionStudioWorldActorCatalogue,
  PRODUCTION_ACTING_CATALOGUE_SOURCE,
} from '../site00-studio-world/acting-catalogue/productionCastingCatalogue.js';
import { buildEntry002ProductionCastState } from '../site00-studio-world/acting-catalogue/entry002RetroactiveMapping.js';
import { findActorById as findLegacySeedActorById } from '../site00-studio-world/acting-catalogue/seedCatalogue.js';
import type { StudioWorldActor } from '../site00-studio-world/acting-catalogue/types.js';
import type { ResidentBackedStudioWorldActor } from '../site00-studio-world/resident-intelligence/season1-ensemble/projectToActor.js';
import type { ActorRecord, CharacterRecord } from './types.js';

const PRODUCTION_ACTORS = (): readonly ResidentBackedStudioWorldActor[] =>
  getProductionStudioWorldActorCatalogue().actors as readonly ResidentBackedStudioWorldActor[];

export const FABRICATION_DEFAULTS = {
  projectId: 'ndxbook',
  entryId: '002',
  actorId: 'sw-resident-001',
  characterId: 'char-entry002-subject-woman',
  characterDisplayName: 'SUBJECT WOMAN',
  version: 'V2.1',
} as const;

export const actorPortraitSlotId = (catalogueNumber: string): string =>
  `actor.${catalogueNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}.portrait.primary`;

export const actorAngleSlotId = (catalogueNumber: string, angle: 'front' | 'left' | 'right' | 'back'): string =>
  `actor.${catalogueNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}.angle.${angle}`;

function toRecord(a: StudioWorldActor & Partial<ResidentBackedStudioWorldActor>): ActorRecord {
  const resident = 'sourceResidentId' in a && a.sourceResidentId ? a : null;
  const inProduction = a.projectsUsed.length > 0 && a.campaignsUsed.length > 0;
  return {
    actorId: a.actorId,
    catalogueNumber: a.catalogueNumber,
    stageName: a.stageName,
    ageRange: a.ageRange,
    heightRange: a.heightRange,
    build: a.build,
    presentation: a.presentation,
    skinTone: a.skinToneDescription,
    hair: a.hairBaseline,
    eyes: a.eyeDescription,
    availability: a.availabilityState.replace(/_/g, ' '),
    verified: a.status === 'ACTIVE',
    entryLabel: inProduction ? `ENTRY ${a.campaignsUsed[0]?.replace(/^entry-/, '') ?? '—'}` : 'UNASSIGNED',
    projectLabel: inProduction ? a.projectsUsed[0]!.toUpperCase() : 'STUDIO WORLD',
    projectsUsed: a.projectsUsed,
    campaignsUsed: a.campaignsUsed,
    languages: a.languages,
    accents: a.accentCapabilities,
    continuityRisk: a.continuityRisk,
    castingTags: resident ? [] : a.nationalityOrCulturalCastingTags.map((t) => t.toUpperCase()),
    authorityId: a.identityAuthorityId,
    authorityLevel: a.status === 'ACTIVE' ? 'A1' : 'PENDING',
    updatedAt: a.updatedAt,
    portraitSlotId: actorPortraitSlotId(a.catalogueNumber),
    portraitUrl: a.headshotPreviewUrl,
    sourceResidentId: resident?.sourceResidentId ?? null,
    studioWorldRole: resident?.studioWorldRole ?? null,
    dataSource: resident ? PRODUCTION_ACTING_CATALOGUE_SOURCE : 'LEGACY_SEED',
  };
}

/** Live Character Fabrication + Production Expression actor catalogue (Season 1 residents). */
export function listFabricationActors(): ActorRecord[] {
  return PRODUCTION_ACTORS().map(toRecord);
}

export function findFabricationActor(actorId: string): ActorRecord | null {
  const fromProduction = listFabricationActors().find((a) => a.actorId === actorId);
  if (fromProduction) return fromProduction;
  const legacy = findLegacySeedActorById(actorId);
  return legacy ? toRecord(legacy) : null;
}

/** The project-specific CHARACTER instantiated from the selected actor (never the same object as the actor). */
export function buildFabricationCharacter(characterId: string = FABRICATION_DEFAULTS.characterId): CharacterRecord | null {
  const cast = buildEntry002ProductionCastState();
  const c = cast.characters.find((x) => x.characterId === characterId);
  if (!c) return null;
  const looks = cast.looks
    .filter((l) => l.characterId === c.characterId || c.temporalLookIds.length === 0 || cast.temporalLooks.some((t) => t.characterId === c.characterId && t.campaignLookId === l.lookId))
    .map((l) => ({ lookId: l.lookId, label: l.label, era: l.era, wardrobe: l.wardrobe, hair: l.hair, makeup: l.makeup, palette: l.colorPalette, garments: l.garments }));
  return {
    characterId: c.characterId,
    displayName: characterId === FABRICATION_DEFAULTS.characterId ? FABRICATION_DEFAULTS.characterDisplayName : c.characterName,
    canonicalName: c.characterName,
    actorId: c.actorId,
    projectId: c.projectId,
    entryId: c.entryId,
    version: FABRICATION_DEFAULTS.version,
    narrativeRole: c.narrativeRole,
    personality: c.personality,
    performanceDirection: c.performanceDirection,
    screenImportance: c.screenImportance,
    looks,
    portraitSlotId: 'character.subject-woman.portrait.primary',
  };
}
