/**
 * Client-campaign cast assignment talent — not Studio World residents, not generic roster filler.
 * SW-017 remains for Entry 002 subject woman continuity (character ≠ actor separation preserved).
 */

import type { ActorIdentityAuthority, StudioWorldActor } from './types.js';

function idAuth(actorId: string, catalogueNumber: string, face: string): ActorIdentityAuthority {
  const now = '2026-09-29T00:00:00.000Z';
  return {
    identityAuthorityId: `id-auth-${catalogueNumber}`,
    actorId,
    canonicalFaceDescription: face,
    facialProportions: 'Production-locked proportions from identity session',
    baselineSkinAppearance: 'Locked baseline — campaign makeup adapts, identity persists',
    baselineBodyProportions: 'Locked full-body silhouette anchor',
    baselineHairState: 'Natural baseline — era looks override in Campaign Look only',
    neutralExpressionNote: 'Neutral mouth, direct gaze, no performance exaggeration',
    views: [
      { view: 'FRONTAL', assetId: `asset-${catalogueNumber}-front`, storagePath: null, previewUrl: null },
      { view: 'THREE_QUARTER', assetId: `asset-${catalogueNumber}-34`, storagePath: null, previewUrl: null },
      { view: 'PROFILE', assetId: `asset-${catalogueNumber}-profile`, storagePath: null, previewUrl: null },
      { view: 'FULL_BODY', assetId: `asset-${catalogueNumber}-body`, storagePath: null, previewUrl: null },
    ],
    immutable: true,
    createdAt: now,
    updatedAt: now,
  };
}

export const ENTRY002_SUBJECT_ACTOR: StudioWorldActor = {
  actorId: 'sw-actor-017',
  catalogueNumber: 'SW-017',
  stageName: 'Maya Okonkwo',
  status: 'ACTIVE',
  identityAuthorityId: 'id-auth-SW-017',
  presentation: 'WOMAN',
  ageRange: '26–32',
  heightRange: '5\'6"–5\'8"',
  build: 'Athletic-medium',
  skinToneDescription: 'Deep brown, warm undertone',
  hairBaseline: 'Black, 4C coils, shoulder length',
  eyeDescription: 'Dark brown, almond',
  facialFeatures: 'High cheekbones, full lips, strong brow',
  distinguishingFeatures: 'Small gold nose stud (may be removed per look)',
  nationalityOrCulturalCastingTags: ['Nigerian-American', 'Southern US lived-in'],
  languages: ['English'],
  accentCapabilities: ['General American', 'Light Southern'],
  performanceProfile: ['EXPRESSIVE', 'EVERYDAY', 'RAW', 'VULNERABLE', 'CHARISMATIC'],
  personalityRange: ['Direct', 'Wry', 'Observant'],
  emotionalRange: ['Defiant', 'Nostalgic', 'Skeptical'],
  roleArchetypes: ['SUBJECT', 'INFLUENCER', 'FRIEND', 'SHOPPER'],
  occupationArchetypes: ['STUDENT', 'OFFICE_WORKER', 'INFLUENCER'],
  fashionRange: ['Street', '2016 IG era', 'Contemporary editorial'],
  wardrobeCompatibility: ['Athleisure', 'Y2K revival', 'Minimal luxury'],
  hairAdaptability: ['High — protective styles, straightened era looks'],
  makeupAdaptability: ['High — soft glam to bare'],
  periodAdaptability: ['2016', '2020s'],
  cinematicPresence: ['Lead-adjacent', 'Social proof subject'],
  commercialFit: ['Fashion', 'Platform culture'],
  editorialFit: ['Culture essay', 'Beauty archive'],
  comedicFit: ['Dry'],
  dramaticFit: ['Medium-high'],
  projectsUsed: ['ndxbook'],
  campaignsUsed: ['entry-002'],
  charactersPlayed: [],
  availabilityState: 'IN_CURRENT_PRODUCTION',
  continuityRisk: 'LOW',
  headshotPreviewUrl: null,
  createdAt: '2026-09-29T00:00:00.000Z',
  updatedAt: '2026-09-29T00:00:00.000Z',
};

export const PRESERVED_CLIENT_CAST_TALENT: readonly StudioWorldActor[] = [ENTRY002_SUBJECT_ACTOR];

export const PRESERVED_CLIENT_CAST_IDENTITY_AUTHORITIES: readonly ActorIdentityAuthority[] = [
  idAuth(ENTRY002_SUBJECT_ACTOR.actorId, ENTRY002_SUBJECT_ACTOR.catalogueNumber, `${ENTRY002_SUBJECT_ACTOR.stageName}: ${ENTRY002_SUBJECT_ACTOR.facialFeatures}; ${ENTRY002_SUBJECT_ACTOR.skinToneDescription}; ${ENTRY002_SUBJECT_ACTOR.hairBaseline}`),
];
