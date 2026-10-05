import type { PerformanceQuality, RoleArchetype, StudioWorldActor } from '../../acting-catalogue/types.js';
import { getStudioWorldSeason1ResidentDossiers } from './residents.js';
import type { StudioWorldResidentDossier } from './types.js';
import { resolveCastingCardImage } from './visualAuthority.js';

const NOW = '2026-10-03T00:00:00.000Z';

function actorIdFromResident(sourceResidentId: string): string {
  return sourceResidentId.toLowerCase();
}

/** Public roster id (SW-001 … SW-008) — distinct from internal sourceResidentId (SW-RESIDENT-00N). */
export function publicResidentCatalogueId(sourceResidentId: string): string {
  const m = /^SW-RESIDENT-(\d+)$/i.exec(sourceResidentId);
  if (!m) return sourceResidentId;
  return `SW-${m[1]!.padStart(3, '0')}`;
}

function mapEligibility(
  e: StudioWorldResidentDossier['castingEligibility'],
): StudioWorldActor['availabilityState'] {
  switch (e) {
    case 'AVAILABLE':
      return 'AVAILABLE';
    case 'LIMITED':
      return 'RESTING_RECENTLY_USED';
    case 'ROLE_RESTRICTED':
    case 'UNAVAILABLE':
      return 'ARCHIVED';
    default:
      return 'AVAILABLE';
  }
}

function roleArchetypesFor(d: StudioWorldResidentDossier): RoleArchetype[] {
  const role = d.studioWorldRole.toLowerCase();
  if (role.includes('creative director')) return ['CREATIVE_DIRECTOR', 'FOUNDER'];
  if (role.includes('casting')) return ['CREATIVE_DIRECTOR', 'MODEL'];
  if (role.includes('fabrication')) return ['DESIGNER', 'ARTIST'];
  if (role.includes('systems')) return ['EXECUTIVE', 'OFFICE_WORKER'];
  if (role.includes('concierge')) return ['SERVER', 'OFFICE_WORKER'];
  if (role.includes('world director')) return ['ARTIST', 'PHOTOGRAPHER'];
  if (role.includes('business development')) return ['EXECUTIVE', 'FOUNDER'];
  return ['OFFICE_WORKER'];
}

function performanceFor(d: StudioWorldResidentDossier): PerformanceQuality[] {
  const base: PerformanceQuality[] = ['CONTROLLED'];
  if (d.sourceResidentId === 'SW-RESIDENT-003') base.push('WARM', 'CHARISMATIC');
  if (d.sourceResidentId === 'SW-RESIDENT-005') base.push('EXPRESSIVE', 'MYSTERIOUS');
  if (d.sourceResidentId === 'SW-RESIDENT-007') base.push('CHARISMATIC', 'COMEDIC');
  if (d.sourceResidentId === 'SW-RESIDENT-004') base.push('UNDERSTATED', 'INTELLECTUAL');
  return base;
}

export type ResidentBackedStudioWorldActor = StudioWorldActor & {
  talentClassification: 'STUDIO_WORLD_RESIDENT';
  sourceResidentId: string;
  studioWorldRole: string;
  residentBadgeLabel: 'STUDIO WORLD RESIDENT';
  sourceAuthority: StudioWorldResidentDossier['sourceAuthority'];
  cameraBehavior: string;
};

export function projectResidentToStudioWorldActor(d: StudioWorldResidentDossier): ResidentBackedStudioWorldActor {
  const catalogueNumber = publicResidentCatalogueId(d.sourceResidentId);
  const actorId = actorIdFromResident(d.sourceResidentId);
  const ageRange = d.agePresentation ?? '—';
  const build = '—';
  return {
    actorId,
    catalogueNumber,
    stageName: d.canonicalName,
    status: 'ACTIVE',
    identityAuthorityId: `id-auth-${d.sourceResidentId}`,
    presentation: d.presentation,
    ageRange,
    heightRange: '—',
    build,
    skinToneDescription: '—',
    hairBaseline: '—',
    eyeDescription: '—',
    facialFeatures: d.personalitySummary,
    distinguishingFeatures: d.identityConstraints.join('; '),
    nationalityOrCulturalCastingTags: d.culturalContext ?? ['Studio World resident'],
    languages: ['English'],
    accentCapabilities: ['General American'],
    performanceProfile: performanceFor(d),
    personalityRange: [d.personalitySummary],
    emotionalRange: ['Canon-range — see dossier'],
    roleArchetypes: roleArchetypesFor(d),
    occupationArchetypes: roleArchetypesFor(d),
    fashionRange: [d.visualIdentitySummary],
    wardrobeCompatibility: [d.naturalWardrobeSummary],
    hairAdaptability: ['Role styling within continuity only'],
    makeupAdaptability: ['Role styling within continuity only'],
    periodAdaptability: ['Contemporary Studio World'],
    cinematicPresence: [d.cameraBehavior],
    commercialFit: ['In-house production'],
    editorialFit: ['Studio World documentary'],
    comedicFit: ['Contextual'],
    dramaticFit: ['Contextual'],
    projectsUsed: ['studio-world'],
    campaignsUsed: [],
    charactersPlayed: [],
    availabilityState: mapEligibility(d.castingEligibility),
    continuityRisk: 'LOW',
    headshotPreviewUrl: resolveCastingCardImage(d.sourceResidentId),
    createdAt: NOW,
    updatedAt: NOW,
    talentClassification: 'STUDIO_WORLD_RESIDENT',
    sourceResidentId: d.sourceResidentId,
    studioWorldRole: d.studioWorldRole,
    residentBadgeLabel: 'STUDIO WORLD RESIDENT',
    sourceAuthority: d.sourceAuthority,
    cameraBehavior: d.cameraBehavior,
  };
}

export function projectAllResidentsToActors(): ResidentBackedStudioWorldActor[] {
  return getStudioWorldSeason1ResidentDossiers().map(projectResidentToStudioWorldActor);
}
