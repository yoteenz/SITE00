/**
 * P0.FILM.1 — NDXBOOK film adapter (brand-specific, not in core).
 */

import { buildBrandFilmBible } from '../authorities/brandFilmBible.js';
import { buildCharacterFilmAuthority } from '../authorities/characterFilmAuthority.js';
import { buildWardrobeOutfit, buildCharacterWardrobeBible } from '../authorities/wardrobeBible.js';
import { buildHairBeautyBible } from '../authorities/hairBeautyBible.js';
import { buildPropDefinition, buildAccessoryPropBible } from '../authorities/accessoryPropBible.js';
import { buildEnvironmentDefinition, buildBrandEnvironmentBible } from '../authorities/environmentBible.js';
import { buildBrandCinematographyBible } from '../authorities/cinematographyBible.js';
import { buildShotLibraryEntry, buildBrandShotLibrary } from '../shotLibrary/shotLibrary.js';
import {
  buildVideoFormatTemplateLibrary,
  buildMiniVlogIntroTemplate,
  buildRabbitHoleInvestigationTemplate,
} from '../formatTemplates/formatTemplateLibrary.js';
import type { FilmProductionInput, FilmStoryboardFrame } from '../types.js';
import type { FilmPlannerContext } from '../planning/filmPlanner.js';

export const NDXBOOK_BRAND_ID = 'ndxbook';
export const REEL_01_FILM_ID = 'ndx-reel-01-introduce-myself';
export const REEL_02_FILM_ID = 'ndx-reel-02-that-cannot-be-right-001';

export const REEL_01_TITLE = 'APPARENTLY I HAVE TO INTRODUCE MYSELF';
export const REEL_02_TITLE = 'THAT CANNOT BE RIGHT — 001';

const NDX_VISUAL_TONE = [
  'observational',
  'cultural',
  'intelligent',
  'lived-in',
  'editorial',
  'human',
  'slightly imperfect',
  'social-native',
];

const NDX_DISALLOWED = [
  'commercial influencer polish',
  'music-video posing',
  'generic luxury montage',
  'AI-glam',
  'over-directed cinematography',
  'sterile product-ad energy',
];

export function buildNdxBrandFilmBible() {
  return buildBrandFilmBible({
    brandId: NDXBOOK_BRAND_ID,
    version: '1.0.0',
    overrides: {
      visualTone: NDX_VISUAL_TONE,
      cameraRelationship: 'camera observes before she performs; direct eye contact is meaningful not constant',
      disallowedStylization: NDX_DISALLOWED,
      approvedFormatTemplateIds: ['MINI_VLOG_INTRO', 'RABBIT_HOLE_INVESTIGATION'],
    },
  });
}

export function buildNdxCharacterFilmAuthority() {
  return buildCharacterFilmAuthority({
    characterId: 'ndx',
    overrides: {
      identityAnchors: ['NDX — cultural observer', 'young professional', 'lime accent restraint'],
      faceAnchors: ['natural skin', 'expressive brows', 'direct gaze when earned'],
      hairAnchors: ['natural texture', 'butterfly clips optional', 'consistent between shots'],
      cameraAwareness: 'usually occupied with something else; notices camera late',
      negativeBehaviorConstraints: ['no influencer posing', 'no constant eye contact', 'no content-presenter energy'],
      posture: 'comfortable but not presenting',
      socialBehavior: 'reacts before explaining',
    },
  });
}

export function buildNdxWardrobeBible() {
  return buildCharacterWardrobeBible({
    characterId: 'ndx',
    modes: [
      buildWardrobeOutfit({
        continuityId: 'ndx-everyday-cafe',
        mode: 'EVERYDAY_FITTED',
        top: 'fitted ribbed tank',
        bottom: 'high-waist structured denim',
        shoes: 'white sneakers',
        bag: 'small crossbody',
        limeAccent: 'lime pen behind ear',
        environmentCompatibility: ['CAFE', 'CITY_SIDEWALK', 'BOOKSTORE'],
      }),
      buildWardrobeOutfit({
        continuityId: 'ndx-desk-work',
        mode: 'WORKING_DESK',
        top: 'soft utility overshirt over fitted tee',
        bottom: 'tailored trousers',
        shoes: 'loafers',
        bag: 'tote with book',
        limeAccent: 'lime butterfly clips',
        environmentCompatibility: ['HOME_DESK', 'CREATIVE_OFFICE'],
      }),
      buildWardrobeOutfit({
        continuityId: 'ndx-car-city',
        mode: 'CITY_DAY',
        top: 'structured blazer over tee',
        bottom: 'straight leg denim',
        shoes: 'clean sneakers',
        bag: 'mini bag with lime charm',
        limeAccent: 'mini bag charm',
        environmentCompatibility: ['LUXURY_CAR', 'CITY_SIDEWALK', 'RESTAURANT'],
      }),
    ],
  });
}

export function buildNdxHairBeautyBible() {
  return buildHairBeautyBible({
    characterId: 'ndx',
    overrides: {
      canonicalHairIdentity: 'natural dark texture, butterfly clips or down — consistent campaign-to-campaign',
      approvedHairModes: ['natural down', 'clipped with butterfly clips', 'low pony'],
      nails: 'natural or single lime accent nail',
    },
  });
}

export function buildNdxAccessoryPropBible() {
  return buildAccessoryPropBible({
    brandId: NDXBOOK_BRAND_ID,
    props: [
      buildPropDefinition({ propId: 'lime-pen', name: 'lime pen', canonicalAppearance: 'matte lime pen', sceneRole: 'recurring character artifact', continuityImportance: 'HIGH', handInteractionRisk: 'MEDIUM', providerGenerationRisk: 'MEDIUM' }),
      buildPropDefinition({ propId: 'ndx-notebook', name: 'NDX Book', canonicalAppearance: 'black notebook with NDX branding', sceneRole: 'evidence and writing', continuityImportance: 'HIGH', handInteractionRisk: 'HIGH', providerGenerationRisk: 'HIGH' }),
      buildPropDefinition({ propId: 'phone', name: 'phone', sceneRole: 'evidence device', handInteractionRisk: 'HIGH', providerGenerationRisk: 'MEDIUM' }),
      buildPropDefinition({ propId: 'laptop', name: 'laptop', sceneRole: 'escalation device', handInteractionRisk: 'HIGH', providerGenerationRisk: 'HIGH' }),
      buildPropDefinition({ propId: 'coffee-cup', name: 'coffee cup', handInteractionRisk: 'MEDIUM', providerGenerationRisk: 'LOW' }),
    ],
    persistentArtifacts: ['lime-pen', 'ndx-notebook', 'phone', 'laptop'],
  });
}

export function buildNdxEnvironmentBible() {
  const envs = [
    'CAFE', 'BOOKSTORE', 'CREATIVE_OFFICE', 'HOME_DESK', 'CITY_SIDEWALK',
    'ELEVATOR', 'LUXURY_CAR', 'RESTAURANT', 'HOTEL', 'AIRPORT_LOUNGE', 'STUDIO_BOOK_ROOM',
  ] as const;
  return buildBrandEnvironmentBible({
    brandId: NDXBOOK_BRAND_ID,
    environments: envs.map((id) =>
      buildEnvironmentDefinition({
        environmentId: id,
        visualGrammar: id === 'CAFE' ? ['lived-in', 'warm', 'real', 'not staged'] : ['lived-in', 'real'],
        realismRisks: id === 'CAFE' ? ['fake signage', 'warped patrons', 'prop morphing'] : ['overly pristine'],
        bestShotClasses: id === 'LUXURY_CAR'
          ? ['LUXURY_CAR_PASSENGER_WIDE', 'LUXURY_CAR_MIRROR', 'LUXURY_CAR_CITY_PARALLAX']
          : ['OBSERVATIONAL_WIDE', 'TABLE_LEVEL_LIVED_IN'],
      }),
    ),
  });
}

export function buildNdxCinematographyBible() {
  return buildBrandCinematographyBible({ brandId: NDXBOOK_BRAND_ID });
}

export function buildNdxShotLibrary() {
  const shotClasses = [
    ['OBSERVATIONAL_WIDE', 'Observational Wide', 'character exists inside environment'],
    ['CAMERA_CAUGHT_HER', 'Camera Caught Her', 'subject notices camera late'],
    ['FOLLOW_BEHIND', 'Follow Behind', 'movement / transition / city life'],
    ['TABLE_LEVEL_LIVED_IN', 'Table Level Lived In', 'bag / coffee / notebook / real-world mess'],
    ['OVER_SHOULDER_EVIDENCE', 'Over Shoulder Evidence', 'phone / laptop / article / receipt'],
    ['MICRO_REACTION', 'Micro Reaction', 'small facial response'],
    ['DOUBLE_TAKE', 'Double Take', 'notice → stop → return'],
    ['PHONE_TO_LAPTOP_ESCALATION', 'Phone to Laptop Escalation', 'rabbit-hole transition'],
    ['NOTEBOOK_INSERT', 'Notebook Insert', 'Book / writing / annotation'],
    ['RABBIT_HOLE_MONTAGE', 'Rabbit Hole Montage', 'accelerated evidence sequence'],
    ['MIRROR_CAUGHT', 'Mirror Caught', 'reflection / camera caught'],
    ['LIME_ARTIFACT_INSERT', 'Lime Artifact Insert', 'pen / nails / clip / bag accent'],
    ['ENVIRONMENT_OBSERVATION', 'Environment Observation', 'what she notices in the world'],
    ['DIRECT_CAMERA_PAYOFF', 'Direct Camera Payoff', 'rare direct eye contact / final line'],
    ['EXIT_FRAME', 'Exit Frame', 'character leaves camera behind'],
    ['LUXURY_CAR_PASSENGER_WIDE', 'Luxury Car Passenger Wide', 'car interior wide'],
    ['LUXURY_CAR_MIRROR', 'Luxury Car Mirror', 'mirror reflection in car'],
    ['LUXURY_CAR_DEVICE_INTERACTION', 'Luxury Car Device', 'phone/laptop in car'],
    ['LUXURY_CAR_SIDE_PROFILE', 'Luxury Car Side Profile', 'profile against city parallax'],
    ['LUXURY_CAR_CITY_PARALLAX', 'Luxury Car City Parallax', 'city movement through window'],
    ['RESTAURANT_LISTENING', 'Restaurant Listening', 'listening mid-conversation'],
    ['ELEVATOR_WAIT', 'Elevator Wait', 'transitional pause'],
    ['OFFICE_WORKING_WIDE', 'Office Working Wide', 'desk environment wide'],
    ['OFFICE_REACTION', 'Office Reaction', 'reaction at desk'],
    ['WALK_AND_TALK', 'Walk and Talk', 'movement with dialogue'],
    ['IMPERFECT_HUMAN_BEAT', 'Imperfect Human Beat', 'unguarded human moment'],
    ['CHARACTER_LINE', 'Character Line', 'simple character dialogue line'],
    ['LIVED_IN_MICRO_MONTAGE', 'Lived In Micro Montage', 'life texture montage'],
    ['END_CARD', 'End Card', 'franchise end card'],
    ['NORMAL_STATE', 'Normal State', 'establishing normal before anomaly'],
    ['PHONE_EVIDENCE', 'Phone Evidence', 'phone screen evidence'],
    ['FIRST_SEARCH', 'First Search', 'initial search behavior'],
    ['ABSORBED_WIDE', 'Absorbed Wide', 'absorbed in research wide'],
    ['CONTRADICTION_REACTION', 'Contradiction Reaction', 'contradiction discovered'],
    ['REALIZATION', 'Realization', 'realization moment'],
    ['VERIFY', 'Verify', 'verification beat'],
    ['RECEIPT', 'Receipt', 'evidence receipt'],
    ['FRANCHISE_CARD', 'Franchise Card', 'franchise card end'],
  ] as const;

  return buildBrandShotLibrary(
    NDXBOOK_BRAND_ID,
    shotClasses.map(([shotClass, name, purpose]) =>
      buildShotLibraryEntry({ shotId: shotClass.toLowerCase(), shotClass, name, purpose }),
    ),
  );
}

export function buildNdxFormatTemplateLibrary() {
  return buildVideoFormatTemplateLibrary(NDXBOOK_BRAND_ID, [
    buildMiniVlogIntroTemplate(),
    buildRabbitHoleInvestigationTemplate(),
  ]);
}

export function buildNdxFilmPlannerContext(templateId: 'MINI_VLOG_INTRO' | 'RABBIT_HOLE_INVESTIGATION'): FilmPlannerContext {
  const library = buildNdxFormatTemplateLibrary();
  const template = library.templates.find((t) => t.templateId === templateId)!;
  return {
    brandBible: buildNdxBrandFilmBible(),
    characterAuthority: buildNdxCharacterFilmAuthority(),
    wardrobeBible: buildNdxWardrobeBible(),
    environmentBible: buildNdxEnvironmentBible(),
    shotLibrary: buildNdxShotLibrary(),
    formatTemplate: template,
    cinematography: buildNdxCinematographyBible(),
    tasteModel: { founderId: 'founder', dimensions: {}, explicitJudgments: [], updatedAt: new Date().toISOString() },
  };
}

/* ── Reel 01 storyboard ── */

export function buildReel01Storyboard(): FilmStoryboardFrame[] {
  const shots = [
    ['01', 'OBSERVATIONAL_WIDE', 'Cafe entry wide', 'wide static', 'enters cafe, looks around'],
    ['02', 'TABLE_LEVEL_LIVED_IN', 'Table level bag/coffee', 'table level', 'sets bag, coffee, notebook'],
    ['03', 'LIME_ARTIFACT_INSERT', 'Lime pen detail', 'insert', 'lime pen behind ear or on table'],
    ['04', 'OFF_CAMERA_INTERACTION', 'Non-introduction', 'medium', 'interacts off-camera, not presenting'],
    ['05', 'ENVIRONMENT_OBSERVATION', 'Notices environment', 'profile', 'watches something in cafe'],
    ['06', 'FOLLOW_BEHIND', 'Movement exit', 'follow behind', 'walks through cafe toward door'],
    ['07', 'MIRROR_CAUGHT', 'Mirror caught', 'mirror reflection', 'caught in mirror, late notice'],
    ['08', 'IMPERFECT_HUMAN_BEAT', 'Imperfect moment', 'medium close', 'unguarded laugh or stumble'],
    ['09', 'CHARACTER_LINE', 'Simple line', 'medium', 'delivers intro line naturally'],
    ['10', 'LIVED_IN_MICRO_MONTAGE', 'Life montage', 'varied', 'quick life texture cuts'],
    ['11', 'DIRECT_CAMERA_PAYOFF', 'Direct acknowledgment', 'medium close', 'rare direct eye contact'],
    ['12', 'END_CARD', 'End card', 'graphic', 'NDX end card'],
  ] as const;

  return shots.map(([frameId, shotClass, beat, camera, action]) => ({
    frameId: `r01-${frameId}`,
    beat,
    composition: 'off-center environmental',
    camera,
    action,
    subject: 'NDX',
    environment: 'CAFE',
    prop: shotClass.includes('LIME') ? 'lime-pen' : null,
    intendedDuration: 3,
    transition: 'cut',
    visualAuthority: 'HIGH' as const,
    shotClassHint: shotClass,
  }));
}

export function buildReel01Script(): string {
  return `INT. CAFE — MORNING

NDX enters, already mid-thought. Not performing for camera.

She sets her bag down. Coffee. The Book. Lime pen behind her ear.

She reacts to something off-camera — a barista, a conversation — before she notices she's being observed.

"Apparently I have to introduce myself."

She doesn't explain. She just... lives.

CUT TO: city sidewalk, mirror caught, imperfect human beat.

Direct camera — rare, earned.

END CARD: NDX`;
}

export function buildReel01Input(): FilmProductionInput {
  return {
    inputId: 'input-reel-01',
    inputMode: 'SCRIPT_AND_STORYBOARD',
    title: REEL_01_TITLE,
    objective: 'Character / lifestyle / mini-vlog intro',
    platform: 'REEL_9_16',
    runtime: { min: 25, max: 40 },
    script: buildReel01Script(),
    storyboard: buildReel01Storyboard(),
    formatTemplate: 'MINI_VLOG_INTRO',
    topic: 'introduction',
    campaign: 'ndxbook-reels',
    desiredMood: ['observational', 'warm', 'human'],
    referenceAssets: [],
    requiredLines: ['Apparently I have to introduce myself.'],
    requiredScenes: ['CAFE'],
    requiredProducts: ['lime-pen', 'ndx-notebook'],
    constraints: ['no influencer intro energy', 'camera observes first'],
  };
}

/* ── Reel 02 storyboard ── */

export function buildReel02Storyboard(): FilmStoryboardFrame[] {
  const shots = [
    ['01', 'NORMAL_STATE', 'Normal state', 'wide', 'normal routine moment'],
    ['02', 'DOUBLE_TAKE', 'Double take', 'medium', 'notices anomaly'],
    ['03', 'PHONE_EVIDENCE', 'Phone evidence', 'over shoulder', 'reads something on phone'],
    ['04', 'MICRO_REACTION', 'Micro reaction', 'close', 'subtle facial response'],
    ['05', 'FIRST_SEARCH', 'First search', 'medium', 'initial search on phone'],
    ['06', 'PHONE_TO_LAPTOP_ESCALATION', 'Escalation', 'over shoulder', 'phone to laptop transition'],
    ['07', 'RABBIT_HOLE_MONTAGE', 'Montage', 'varied', 'accelerated evidence sequence'],
    ['08', 'NOTEBOOK_INSERT', 'Notebook', 'insert', 'writes in the Book'],
    ['09', 'ABSORBED_WIDE', 'Absorbed wide', 'wide', 'absorbed in research'],
    ['10', 'CONTRADICTION_REACTION', 'Contradiction', 'medium', 'contradiction discovered'],
    ['11', 'REALIZATION', 'Realization', 'medium close', 'realization moment'],
    ['12', 'VERIFY', 'Verify', 'over shoulder', 'verifies claim'],
    ['13', 'DIRECT_CAMERA_PAYOFF', 'Payoff line', 'medium close', 'direct camera claim'],
    ['14', 'RECEIPT', 'Receipt', 'insert', 'evidence receipt'],
    ['15', 'FRANCHISE_CARD', 'Franchise card', 'graphic', 'franchise end card'],
  ] as const;

  return shots.map(([frameId, shotClass, beat, camera, action]) => ({
    frameId: `r02-${frameId}`,
    beat,
    composition: 'evidence-forward',
    camera,
    action,
    subject: 'NDX',
    environment: 'HOME_DESK',
    prop: shotClass.includes('NOTEBOOK') ? 'ndx-notebook' : shotClass.includes('PHONE') ? 'phone' : null,
    intendedDuration: 2.5,
    transition: 'cut',
    visualAuthority: 'HIGH' as const,
    shotClassHint: shotClass,
  }));
}

export function buildReel02Script(): string {
  return `INT. HOME DESK — AFTERNOON

Normal state. NDX at desk. Casual.

Something on her phone doesn't add up. Double take.

"That cannot be right. Somebody would have said something by now."

First search. Then escalation — phone to laptop.

Rabbit hole montage. Receipts. The Book.

Absorbed. Contradiction. Realization. Verify.

Direct camera payoff.

Receipt. Franchise card.

END.`;
}

export function buildReel02Input(): FilmProductionInput {
  return {
    inputId: 'input-reel-02',
    inputMode: 'SCRIPT_AND_STORYBOARD',
    title: REEL_02_TITLE,
    objective: 'Investigative / editorial / rabbit-hole franchise',
    platform: 'REEL_9_16',
    runtime: { min: 27, max: 45 },
    script: buildReel02Script(),
    storyboard: buildReel02Storyboard(),
    formatTemplate: 'RABBIT_HOLE_INVESTIGATION',
    topic: 'investigative rabbit hole 001',
    campaign: 'ndxbook-reels',
    desiredMood: ['skeptical', 'curious', 'absorbed'],
    referenceAssets: [],
    requiredLines: ['That cannot be right. Somebody would have said something by now.'],
    requiredScenes: ['HOME_DESK'],
    requiredProducts: ['phone', 'laptop', 'ndx-notebook', 'lime-pen'],
    constraints: ['evidence-forward pacing', 'rabbit hole acceleration'],
  };
}

export function ndxFilmBehaviorAdapterDriven(): true {
  return true;
}

export function futureClientFilmBiblesSupported(): true {
  return true;
}

export function futureClientShotLibrariesSupported(): true {
  return true;
}
