/**
 * Entry 002 — map approved visual authorities into Actor/Character model (no regen).
 */

import { compileEntry002RetroactiveNarrativeMomentum } from '../../site00-expression-engine/narrative-momentum/entry002RetroactiveIngest.js';
import { deriveCastingRequirementsFromNarrativePlan } from './deriveCastingRequirements.js';
import { findActorByCatalogueNumber } from './seedCatalogue.js';
import type {
  CharacterAuthoritySheet,
  CharacterCampaignLook,
  CharacterTemporalLook,
  ProductionCastState,
  ProductionCharacter,
} from './types.js';

export type Entry002CastProof = {
  castRequirementCount: number;
  characterCount: number;
  charactersWithVisualAuthorities: readonly string[];
  proposedActorMatchStatus: readonly { requirementId: string; role: string; proposedCatalogueNumber: string; status: string }[];
  samePersonAcross20162026: 'SAME_CHARACTER_ONE_ACTOR' | 'SEPARATE_SUBJECTS';
  temporalLookCount: number;
  missingCharacterAuthorities: readonly string[];
  storyboardCharacterCoverage: readonly { characterId: string; actorId: string | null; authorityLocked: boolean }[];
};

const EXISTING_SUBJECT_AUTHORITY_IDS = [
  'pre-storyboard-subject-woman',
  'subject-woman-continuity-profile',
  'entry002-subject-woman-visual-authority',
] as const;

export function buildEntry002ProductionCastState(): ProductionCastState {
  const plan = compileEntry002RetroactiveNarrativeMomentum();
  const requirements = deriveCastingRequirementsFromNarrativePlan(plan);
  const maya = findActorByCatalogueNumber('SW-017');
  const now = '2026-09-29T00:00:00.000Z';

  const subjectCharacterId = 'char-entry002-subject-woman';
  const ndxCharacterId = 'char-entry002-ndx';
  const ensembleCharacterId = 'char-entry002-commenter';

  const look2016: CharacterCampaignLook = {
    lookId: 'look-entry002-2016-baddie',
    characterId: subjectCharacterId,
    label: '2016 IG BADDIE',
    hair: 'Long straight dark, middle part, gloss finish era styling',
    makeup: 'Heavy liner, contoured cheek, matte lip',
    nails: 'Long acrylic statement',
    wardrobe: 'Crop top, high-waist jeans, statement belt, Y2K accessories',
    shoes: 'Platform sneaker or heel',
    jewelry: 'Layered gold, hoop earrings',
    accessories: 'Phone as prop — archive scroll',
    bodyStyling: '2016 posture — posed, flash-friendly',
    era: '2016',
    colorPalette: 'Warm flash, saturated',
    grooming: 'Brows filled, full glam',
    props: ['smartphone', 'comment screenshot overlay'],
    lookReferences: [...EXISTING_SUBJECT_AUTHORITY_IDS],
    approvedLookAuthorityIds: ['authority-entry002-2016-look'],
    wardrobeLookId: 'wardrobe-entry002-2016',
    garments: ['crop top', 'high-rise denim'],
    layering: 'Single layer summer',
    bag: 'Mini crossbody',
    wardrobeContinuityDefault: 'INTENTIONAL_CHANGE',
    hairAuthorityId: 'hair-entry002-2016',
    makeupAuthorityId: 'makeup-entry002-2016',
    createdAt: now,
    updatedAt: now,
  };

  const look2026: CharacterCampaignLook = {
    lookId: 'look-entry002-2026-present',
    characterId: subjectCharacterId,
    label: '2026 PRESENT RETURN',
    hair: 'Same actor baseline — softer blowout, 2026 grooming',
    makeup: 'Clean skin, subtle lip',
    nails: 'Short natural',
    wardrobe: 'Contemporary minimal — nostalgia callback without costume',
    shoes: 'Simple leather flat',
    jewelry: 'Single delicate chain',
    accessories: 'Phone — present-day feed',
    bodyStyling: 'Relaxed upright — receipt moment',
    era: '2026',
    colorPalette: 'Neutral daylight',
    grooming: 'Natural brow',
    props: ['smartphone'],
    lookReferences: [...EXISTING_SUBJECT_AUTHORITY_IDS],
    approvedLookAuthorityIds: ['authority-entry002-2026-look'],
    wardrobeLookId: 'wardrobe-entry002-2026',
    garments: ['soft knit', 'trouser'],
    layering: 'Light layer',
    bag: null,
    wardrobeContinuityDefault: 'INTENTIONAL_CHANGE',
    hairAuthorityId: 'hair-entry002-2026',
    makeupAuthorityId: 'makeup-entry002-2026',
    createdAt: now,
    updatedAt: now,
  };

  const temporalLooks: CharacterTemporalLook[] = [
    {
      temporalLookId: 'temporal-entry002-2016',
      characterId: subjectCharacterId,
      eraLabel: '2016',
      campaignLookId: look2016.lookId,
      narrativeReason: 'Archival mockery era — same woman, era styling',
      preservesActorIdentity: true,
    },
    {
      temporalLookId: 'temporal-entry002-2026',
      characterId: subjectCharacterId,
      eraLabel: '2026',
      campaignLookId: look2026.lookId,
      narrativeReason: 'Present nostalgia label — same woman, new cultural frame',
      preservesActorIdentity: true,
    },
  ];

  const subjectAuthority: CharacterAuthoritySheet = {
    characterAuthorityId: 'char-auth-entry002-subject',
    characterId: subjectCharacterId,
    actorId: maya?.actorId ?? 'sw-actor-017',
    actorIdentityAuthorityId: maya?.identityAuthorityId ?? 'id-auth-SW-017',
    campaignLookId: look2026.lookId,
    characterName: 'THE 2026 WOMAN / 2016 SUBJECT',
    narrativeRole: 'SUBJECT WOMAN',
    narrativeFunction: 'Proof same woman both timelines',
    personalityPerformance: 'Expressive receipt — skeptical nostalgia',
    frontPortraitAssetId: 'mapped-pre-storyboard-front',
    threeQuarterPortraitAssetId: 'mapped-pre-storyboard-34',
    sideProfileAssetId: 'mapped-pre-storyboard-profile',
    fullBodyAssetId: 'mapped-pre-storyboard-body',
    wardrobeFrontAssetId: 'mapped-wardrobe-front',
    wardrobeBackAssetId: null,
    hairDetailAssetId: 'mapped-hair-detail',
    makeupGroomingAssetId: 'mapped-makeup-detail',
    accessoryDetailAssetId: null,
    expressionRange: ['NEUTRAL', 'SKEPTICAL', 'CURIOUS', 'CONFIDENT'],
    keyProp: 'smartphone',
    continuityNotes: 'Same Actor SW-017 — do not regenerate approved pre-storyboard anchors',
    locked: true,
    createdAt: now,
    updatedAt: now,
  };

  const ndxAuthority: CharacterAuthoritySheet = {
    characterAuthorityId: 'char-auth-entry002-ndx',
    characterId: ndxCharacterId,
    actorId: 'sw-actor-catalogue-ndx-partial',
    actorIdentityAuthorityId: 'id-auth-ndx-partial',
    campaignLookId: 'look-entry002-ndx-hands',
    characterName: 'NDX PRESENCE',
    narrativeRole: 'NDX INVESTIGATOR',
    narrativeFunction: 'Partial observer interjector',
    personalityPerformance: 'Understated intellectual',
    frontPortraitAssetId: null,
    threeQuarterPortraitAssetId: null,
    sideProfileAssetId: null,
    fullBodyAssetId: null,
    wardrobeFrontAssetId: null,
    wardrobeBackAssetId: null,
    hairDetailAssetId: null,
    makeupGroomingAssetId: 'mapped-ndx-nail-authority',
    accessoryDetailAssetId: null,
    expressionRange: ['NEUTRAL'],
    keyProp: null,
    continuityNotes: 'Partial visibility — hand/nail authority from existing gate',
    locked: true,
    createdAt: now,
    updatedAt: now,
  };

  const characters: ProductionCharacter[] = [
    {
      characterId: subjectCharacterId,
      projectId: plan.projectId,
      entryId: 'entry-002',
      actorId: maya?.actorId ?? 'sw-actor-017',
      characterName: 'THE 2026 WOMAN',
      narrativeRole: 'SUBJECT WOMAN',
      storyFunction: 'Same woman 2016/2026 proof',
      occupation: 'Cultural subject / everywoman receipt',
      personality: 'Wry, skeptical, embodied',
      motivation: 'Hold the mirror on label flip',
      relationshipMap: 'NDX observes; commenters surround',
      agePresentation: 'Late 20s locked',
      performanceDirection: 'Receipt beats — minimal melodrama',
      screenImportance: 'HERO',
      campaignLookId: look2026.lookId,
      characterAuthorityId: subjectAuthority.characterAuthorityId,
      temporalLookIds: temporalLooks.map((t) => t.temporalLookId),
      firstBeat: 'CLAIM',
      lastBeat: 'SYNTHESIS',
      appearsInBeats: plan.beats.map((b) => b.beatId),
      appearsInShots: [],
      status: 'LOCKED',
      castingRequirementId: 'cast-req-entry002-subject-woman',
      createdAt: now,
      updatedAt: now,
    },
    {
      characterId: ndxCharacterId,
      projectId: plan.projectId,
      entryId: 'entry-002',
      actorId: 'sw-actor-catalogue-ndx-partial',
      characterName: 'NDX',
      narrativeRole: 'NDX INVESTIGATOR',
      storyFunction: 'Interjector partial presence',
      occupation: 'Editorial investigator',
      personality: 'Dry, precise',
      motivation: 'Reframe audience belief',
      relationshipMap: 'Observes subject woman',
      agePresentation: 'Adult',
      performanceDirection: 'Hands-only interjections',
      screenImportance: 'SUPPORTING',
      campaignLookId: 'look-entry002-ndx-hands',
      characterAuthorityId: ndxAuthority.characterAuthorityId,
      temporalLookIds: [],
      firstBeat: 'INTERJECTION',
      lastBeat: 'INTERJECTION',
      appearsInBeats: ['beat-interjection'],
      appearsInShots: [],
      status: 'LOCKED',
      castingRequirementId: 'cast-req-entry002-ndx-presence',
      createdAt: now,
      updatedAt: now,
    },
    {
      characterId: ensembleCharacterId,
      projectId: plan.projectId,
      entryId: 'entry-002',
      actorId: null,
      characterName: '2016 COMMENTER CHORUS',
      narrativeRole: '2016 COMMENTER / BACKGROUND',
      storyFunction: 'Social mockery chorus',
      occupation: 'Platform users',
      personality: 'Chaotic ensemble',
      motivation: 'Represent archival tone',
      relationshipMap: 'Surrounds subject',
      agePresentation: '20s mix',
      performanceDirection: 'Ensemble — catalogue optional',
      screenImportance: 'ENSEMBLE',
      campaignLookId: null,
      characterAuthorityId: null,
      temporalLookIds: [],
      firstBeat: 'RECEIPT',
      lastBeat: 'RECEIPT',
      appearsInBeats: ['beat-receipt'],
      appearsInShots: [],
      status: 'CAST_PENDING',
      castingRequirementId: 'cast-req-entry002-commenter-ensemble',
      createdAt: now,
      updatedAt: now,
    },
  ];

  return {
    projectId: plan.projectId,
    entryId: 'entry-002',
    requirements,
    characters,
    looks: [look2016, look2026],
    temporalLooks,
    authoritySheets: [subjectAuthority, ndxAuthority],
    shotCastByShotId: {
      'shot-entry002-receipt-01': [
        {
          characterId: subjectCharacterId,
          actorId: maya?.actorId ?? 'sw-actor-017',
          lookId: look2016.lookId,
          temporalLookId: 'temporal-entry002-2016',
          position: 'center frame',
          screenPriority: 'HERO',
          action: 'Scroll archival comments',
          expression: 'SKEPTICAL',
          interactionPartners: [ndxCharacterId],
          continuitySourceShotId: null,
        },
      ],
    },
    providerDispatchCount: 0,
    castGateLocked: false,
    updatedAt: now,
  };
}

export function entry002CastProof(state: ProductionCastState = buildEntry002ProductionCastState()): Entry002CastProof {
  const withAuthorities = state.authoritySheets.map((a) => a.characterName);
  const missing = state.characters
    .filter((c) => c.screenImportance !== 'ENSEMBLE' && (!c.characterAuthorityId || c.status !== 'LOCKED'))
    .map((c) => c.characterName);

  return {
    castRequirementCount: state.requirements.length,
    characterCount: state.characters.length,
    charactersWithVisualAuthorities: withAuthorities,
    proposedActorMatchStatus: [
      {
        requirementId: 'cast-req-entry002-subject-woman',
        role: 'SUBJECT WOMAN',
        proposedCatalogueNumber: 'SW-017',
        status: 'MATCHED_LOCKED',
      },
      {
        requirementId: 'cast-req-entry002-ndx-presence',
        role: 'NDX INVESTIGATOR',
        proposedCatalogueNumber: 'NDX-PARTIAL',
        status: 'MATCHED_PARTIAL_AUTHORITY',
      },
      {
        requirementId: 'cast-req-entry002-commenter-ensemble',
        role: '2016 COMMENTER',
        proposedCatalogueNumber: 'SW-052 or SW-063',
        status: 'UNCAST_ENSEMBLE_OK',
      },
    ],
    samePersonAcross20162026: 'SAME_CHARACTER_ONE_ACTOR',
    temporalLookCount: state.temporalLooks.length,
    missingCharacterAuthorities: missing,
    storyboardCharacterCoverage: state.characters.map((c) => ({
      characterId: c.characterId,
      actorId: c.actorId,
      authorityLocked: c.status === 'LOCKED' && Boolean(c.characterAuthorityId),
    })),
  };
}
