/**
 * Canonical resident media for Character Fabrication — one resolver for all 8 stations.
 * When a Season 1 resident actor is confirmed, legacy SW-017 / stock slot ids must not resolve.
 */
import { buildCurrentFabricationSourceAuthority } from '../site00-studio-world/resident-fabrication/fabricationSourceAuthority.js';
import { geometryCompletePublicPath } from '../site00-studio-world/resident-fabrication/residentGeometryCompleteRegistry.js';
import { STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES } from '../site00-studio-world/resident-fabrication/residentGeometryFrames.js';
import { publicResidentCatalogueId } from '../site00-studio-world/resident-intelligence/season1-ensemble/projectToActor.js';
import { PRODUCTION_ACTING_CATALOGUE_SOURCE } from '../site00-studio-world/acting-catalogue/productionCastingCatalogue.js';
import { actorAngleSlotId } from './actors.js';
import type { ActorRecord, FabricationSubjectSnapshot, StationId } from './types.js';

const LEGACY_STOCK_SLOT = /sw017|subject-woman|sw022|sw031|sw034|sw042|sw044/i;

export function isResidentBackedActor(actor: ActorRecord): boolean {
  return actor.dataSource === PRODUCTION_ACTING_CATALOGUE_SOURCE && !!actor.sourceResidentId;
}

export function residentCatalogueIdFromActor(actor: ActorRecord): string | null {
  if (!actor.sourceResidentId) return null;
  return publicResidentCatalogueId(actor.sourceResidentId);
}

export function buildFabricationSubjectSnapshot(actor: ActorRecord, confirmedAt: string | null): FabricationSubjectSnapshot {
  const residentId = residentCatalogueIdFromActor(actor);
  let portraitUrl = actor.portraitUrl;
  let fullBodyUrl: string | null = null;
  if (residentId) {
    const auth = buildCurrentFabricationSourceAuthority(residentId as `SW-${string}`);
    if (auth) {
      portraitUrl = auth.portraitAuthority.url ?? portraitUrl;
    }
    const profile = STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES.find((p) => p.residentId === residentId);
    if (profile) {
      fullBodyUrl = `/${geometryCompletePublicPath(profile.folderName, '00_APPROVED_FULL_BODY_FRONT').replace(/^public\//, '')}`;
    }
  }
  return {
    residentId,
    actorId: actor.actorId,
    catalogueNumber: actor.catalogueNumber,
    displayName: actor.stageName,
    portraitUrl,
    fullBodyUrl,
    portraitSlotId: actor.portraitSlotId,
    confirmedAt,
  };
}

export function chamberMediaUrl(subject: FabricationSubjectSnapshot | null, station: StationId): string | null {
  if (!subject?.portraitUrl) return null;
  switch (station) {
    case 'body':
    case 'look':
      return subject.fullBodyUrl ?? subject.portraitUrl;
    case 'appearance':
    case 'identity':
      return subject.portraitUrl;
    case 'character':
    case 'performance':
    case 'simulation':
    case 'authority':
      return subject.portraitUrl;
    default:
      return subject.portraitUrl;
  }
}

export function resolveFabricationSlotUrl(
  slotId: string,
  actor: ActorRecord,
  subject: FabricationSubjectSnapshot | null,
  station: StationId,
  runtimeUrls: Readonly<Record<string, string | null | undefined>>,
  baseResolver: (slotId: string) => string | null,
): string | null {
  if (isResidentBackedActor(actor)) {
    if (LEGACY_STOCK_SLOT.test(slotId)) {
      if (slotId.includes('chamber.figure')) return chamberMediaUrl(subject, station);
      if (slotId.includes('body.neutral') || slotId.includes('movement')) {
        return subject?.fullBodyUrl ?? subject?.portraitUrl ?? null;
      }
      if (slotId.includes('portrait') || slotId.includes('continuity') || slotId.includes('appearance') || slotId.includes('behavior') || slotId.includes('simulation')) {
        return subject?.portraitUrl ?? null;
      }
      return subject?.portraitUrl ?? null;
    }
    const prefix = `actor.${actor.catalogueNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    if (slotId.startsWith(prefix)) {
      if (slotId.includes('angle') || slotId.includes('portrait')) return subject?.portraitUrl ?? runtimeUrls[slotId] ?? null;
      if (slotId.includes('body')) return subject?.fullBodyUrl ?? subject?.portraitUrl ?? null;
    }
    if (slotId === actor.portraitSlotId) return subject?.portraitUrl ?? actor.portraitUrl;
    if (slotId === actorAngleSlotId(actor.catalogueNumber, 'front')) return subject?.portraitUrl ?? null;
  }
  const fromRuntime = runtimeUrls[slotId] ?? baseResolver(slotId);
  if (isResidentBackedActor(actor) && fromRuntime && LEGACY_STOCK_SLOT.test(fromRuntime)) return null;
  return fromRuntime;
}
