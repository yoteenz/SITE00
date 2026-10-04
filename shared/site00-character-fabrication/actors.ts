/**
 * Canonical adapters: Studio World actor catalogue + Entry 002 cast state → Fabrication ACTOR / CHARACTER records.
 * ACTOR and CHARACTER stay separate: actor = reusable catalogue identity, character = project role instantiated from it.
 */
import { getStudioWorldActorCatalogue } from '../site00-studio-world/acting-catalogue/seedCatalogue.js';
import { buildEntry002ProductionCastState } from '../site00-studio-world/acting-catalogue/entry002RetroactiveMapping.js';
import type { StudioWorldActor } from '../site00-studio-world/acting-catalogue/types.js';
import type { ActorRecord, CharacterRecord } from './types.js';

export const FABRICATION_DEFAULTS = {
  projectId: 'ndxbook',
  entryId: '002',
  actorId: 'sw-actor-017',
  characterId: 'char-entry002-subject-woman',
  characterDisplayName: 'SUBJECT WOMAN',
  version: 'V2.1',
} as const;

export const actorPortraitSlotId = (catalogueNumber: string): string => `actor.${catalogueNumber.toLowerCase().replace('-', '')}.portrait.primary`;
export const actorAngleSlotId = (catalogueNumber: string, angle: 'front' | 'left' | 'right' | 'back'): string =>
  `actor.${catalogueNumber.toLowerCase().replace('-', '')}.angle.${angle}`;

function toRecord(a: StudioWorldActor): ActorRecord {
  const inProduction = a.projectsUsed.length > 0;
  return {
    actorId: a.actorId,
    catalogueNumber: a.catalogueNumber,
    stageName: a.stageName,
    ageRange: a.ageRange.replace('–', ' - '),
    heightRange: a.heightRange,
    build: a.build,
    presentation: a.presentation,
    skinTone: a.skinToneDescription,
    hair: a.hairBaseline,
    eyes: a.eyeDescription,
    availability: a.availabilityState.replace(/_/g, ' '),
    verified: a.status === 'ACTIVE',
    entryLabel: inProduction ? `ENTRY ${a.campaignsUsed[0]?.replace(/^entry-/, '') ?? '—'}` : 'UNASSIGNED',
    projectLabel: inProduction ? a.projectsUsed[0]!.toUpperCase() : 'CATALOGUE',
    projectsUsed: a.projectsUsed,
    campaignsUsed: a.campaignsUsed,
    languages: a.languages,
    accents: a.accentCapabilities,
    continuityRisk: a.continuityRisk,
    castingTags: a.nationalityOrCulturalCastingTags.map((t) => t.toUpperCase()),
    authorityId: a.identityAuthorityId,
    authorityLevel: a.status === 'ACTIVE' ? 'A1' : 'PENDING',
    updatedAt: a.updatedAt,
    portraitSlotId: actorPortraitSlotId(a.catalogueNumber),
  };
}

/** Fabrication remains on client-cast anchors; Studio World residents load canonical identity authority — do not generate new faces. */
export function listFabricationActors(): ActorRecord[] {
  return getStudioWorldActorCatalogue()
    .actors.filter((a) => a.catalogueNumber === 'SW-017')
    .map(toRecord);
}

export function listStudioWorldResidentsForFabricationContext(): ActorRecord[] {
  return getStudioWorldActorCatalogue()
    .actors.filter((a) => a.actorId.startsWith('sw-resident-'))
    .map(toRecord);
}

export function findFabricationActor(actorId: string): ActorRecord | null {
  const direct = listFabricationActors().find((a) => a.actorId === actorId);
  if (direct) return direct;
  const resident = getStudioWorldActorCatalogue().actors.find((a) => a.actorId === actorId);
  return resident ? toRecord(resident) : null;
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
