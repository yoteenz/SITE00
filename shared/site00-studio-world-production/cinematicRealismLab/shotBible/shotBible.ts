/**
 * Cinematic Realism Shot Bible — canonical shot categories and rules.
 */

import type { CinematicRealismShotType } from '../types.js';

export type ShotBibleEntry = {
  shotType: CinematicRealismShotType;
  label: string;
  sceneObjective: string;
  environmentRules: string[];
  wardrobeRules: string[];
  groomingRules: string[];
  lightingRules: string[];
  cameraLanguage: string[];
  movementRestrictions: string[];
  realismRiskProfile: string[];
  bestUseCases: string[];
  recommendedProviderModes: string[];
  continuityAnchors: string[];
  allowedProps: string[];
  disallowedProps: string[];
};

export const CINEMATIC_REALISM_SHOT_BIBLE: Record<CinematicRealismShotType, ShotBibleEntry> = {
  LUXURY_CAR_SEATED: {
    shotType: 'LUXURY_CAR_SEATED',
    label: 'Luxury Car — Seated',
    sceneObjective: 'Establish founder-in-transit credibility with premium interior realism.',
    environmentRules: ['Real luxury interior materials', 'Plausible city light through windows', 'No fantasy vehicle branding'],
    wardrobeRules: ['Editorial but wearable luxury', 'Natural fabric folds', 'No costume exaggeration'],
    groomingRules: ['Believable skin texture', 'Natural hair movement', 'Subtle makeup only'],
    lightingRules: ['Golden-hour or soft daylight mix', 'Interior fill from window', 'No flat AI glow'],
    cameraLanguage: ['Medium close with shallow depth', 'Subtle handheld micro-movement', 'Social-native framing'],
    movementRestrictions: ['No exaggerated head turns', 'Micro-expressions only', 'Device interaction must be grounded'],
    realismRiskProfile: ['FAIL_PLASTIC_SKIN', 'FAIL_PROP_DRIFT', 'FAIL_ENVIRONMENT_INSTABILITY'],
    bestUseCases: ['Founder transit reels', 'Luxury lifestyle proof', 'Hybrid still→video pilot'],
    recommendedProviderModes: ['image-to-video', 'reference-image', 'still-first hybrid'],
    continuityAnchors: ['face', 'wardrobe', 'device props', 'window light direction'],
    allowedProps: ['phone', 'tablet', 'luxury bag', 'sunglasses'],
    disallowedProps: ['floating UI overlays', 'stock watermark', 'fantasy logos'],
  },
  LUXURY_CAR_MIRROR_GLANCE: {
    shotType: 'LUXURY_CAR_MIRROR_GLANCE',
    label: 'Luxury Car — Mirror Glance',
    sceneObjective: 'Capture reflective realism and eye contact without uncanny gaze.',
    environmentRules: ['Mirror geometry must be plausible', 'Reflection continuity with subject'],
    wardrobeRules: ['Same as seated lane for continuity'],
    groomingRules: ['Eye moisture and lid behavior natural'],
    lightingRules: ['Specular highlights controlled', 'No blown mirror hotspots'],
    cameraLanguage: ['Over-shoulder or mirror POV', 'Slow push optional'],
    movementRestrictions: ['Glance duration under 2s', 'No locked stare'],
    realismRiskProfile: ['FAIL_UNNATURAL_GAZE', 'FAIL_DEAD_EYES'],
    bestUseCases: ['Transition beat', 'Emotional punctuation'],
    recommendedProviderModes: ['image-to-video with reference'],
    continuityAnchors: ['face', 'mirror angle'],
    allowedProps: ['rearview mirror', 'seat headrest'],
    disallowedProps: ['distorted reflections'],
  },
  LUXURY_CAR_DEVICE_INTERACTION: {
    shotType: 'LUXURY_CAR_DEVICE_INTERACTION',
    label: 'Luxury Car — Device Interaction',
    sceneObjective: 'Show believable phone/tablet use without floaty hands.',
    environmentRules: ['Interior stable across frames'],
    wardrobeRules: ['Sleeve and cuff behavior realistic'],
    groomingRules: ['Hand skin matches face tone'],
    lightingRules: ['Screen glow subtle on face', 'Not overpowering ambient'],
    cameraLanguage: ['Insert + medium two-shot', 'Focus pull optional'],
    movementRestrictions: ['Thumb taps plausible', 'No morphing devices'],
    realismRiskProfile: ['FAIL_FLOATING_HANDS', 'FAIL_PROP_DRIFT'],
    bestUseCases: ['Productivity founder narrative', 'Social-native B-roll'],
    recommendedProviderModes: ['still-first then animate hands'],
    continuityAnchors: ['device model', 'hand position'],
    allowedProps: ['phone', 'tablet', 'stylus'],
    disallowedProps: ['impossible screen content'],
  },
  FOUNDER_OFFICE_DESK: {
    shotType: 'FOUNDER_OFFICE_DESK',
    label: 'Founder Office Desk',
    sceneObjective: 'Premium workspace credibility without stock-photo stiffness.',
    environmentRules: ['Real materials', 'Clutter discipline', 'Brand-neutral unless adapter supplies'],
    wardrobeRules: ['Smart casual luxury'],
    groomingRules: ['Natural under-eye texture allowed'],
    lightingRules: ['Window key + soft fill'],
    cameraLanguage: ['Desk-level medium', 'Slow dolly optional'],
    movementRestrictions: ['Typing/gesture grounded'],
    realismRiskProfile: ['FAIL_STIFF_POSTURE', 'FAIL_AI_GLOSS_OVERLOAD'],
    bestUseCases: ['Thought leadership clips', 'Voiceover-led reels'],
    recommendedProviderModes: ['text-to-image + image-to-video'],
    continuityAnchors: ['desk objects', 'wardrobe'],
    allowedProps: ['laptop', 'notebook', 'pen', 'coffee'],
    disallowedProps: ['generic stock trophies'],
  },
  FOUNDER_WALK_AND_TALK: {
    shotType: 'FOUNDER_WALK_AND_TALK',
    label: 'Founder Walk and Talk',
    sceneObjective: 'Motion realism with conversational energy.',
    environmentRules: ['Plausible urban or office corridor'],
    wardrobeRules: ['Movement-friendly tailoring'],
    groomingRules: ['Hair responds to motion'],
    lightingRules: ['Consistent direction while moving'],
    cameraLanguage: ['Tracking medium', 'Gimbal-like stability not robotic'],
    movementRestrictions: ['Gait human-paced', 'Lip sync only if supported'],
    realismRiskProfile: ['FAIL_MOTION_RUBBERINESS', 'FAIL_VOICE_UNCANNY'],
    bestUseCases: ['Manifesto snippets', 'Event arrival content'],
    recommendedProviderModes: ['video providers with motion control'],
    continuityAnchors: ['wardrobe', 'location'],
    allowedProps: ['phone', 'bag'],
    disallowedProps: ['crowd cloning artifacts'],
  },
  HOTEL_SUITE_EDITORIAL: {
    shotType: 'HOTEL_SUITE_EDITORIAL',
    label: 'Hotel Suite Editorial',
    sceneObjective: 'Luxury travel editorial without fantasy hotel CGI.',
    environmentRules: ['Boutique hotel realism', 'Linen and wood textures'],
    wardrobeRules: ['Elevated travel editorial'],
    groomingRules: ['Soft natural beauty'],
    lightingRules: ['Warm practicals + window'],
    cameraLanguage: ['Wide establishing to medium'],
    movementRestrictions: ['Slow reveals'],
    realismRiskProfile: ['FAIL_LUXURY_FANTASY_NOT_REALITY'],
    bestUseCases: ['Travel founder narrative'],
    recommendedProviderModes: ['still hero + animate'],
    continuityAnchors: ['suite layout', 'wardrobe'],
    allowedProps: ['room service tray', 'magazine'],
    disallowedProps: ['impossible skyline composites'],
  },
  RESTAURANT_BOOTH_CONVERSATION: {
    shotType: 'RESTAURANT_BOOTH_CONVERSATION',
    label: 'Restaurant Booth Conversation',
    sceneObjective: 'Intimate dialogue scene with believable depth and bokeh.',
    environmentRules: ['Restaurant scale plausible', 'Background patrons soft not cloned'],
    wardrobeRules: ['Evening editorial'],
    groomingRules: ['Expression range natural'],
    lightingRules: ['Practical candle/warm key'],
    cameraLanguage: ['Over-table two-shot', 'Shallow DOF'],
    movementRestrictions: ['Dialogue cadence human'],
    realismRiskProfile: ['FAIL_VOICE_UNCANNY', 'FAIL_UNNATURAL_GAZE'],
    bestUseCases: ['Interview-style reels'],
    recommendedProviderModes: ['providers with lip-sync if dialogue'],
    continuityAnchors: ['booth geometry', 'wardrobe'],
    allowedProps: ['glassware', 'menu'],
    disallowedProps: ['floating cutlery'],
  },
  ELEVATOR_MOMENT: {
    shotType: 'ELEVATOR_MOMENT',
    label: 'Elevator Moment',
    sceneObjective: 'Contained vertical space with metallic reflections controlled.',
    environmentRules: ['Elevator scale accurate', 'Panel buttons plausible'],
    wardrobeRules: ['Compact framing friendly'],
    groomingRules: ['Face evenly lit without plastic sheen'],
    lightingRules: ['Top-down elevator practicals'],
    cameraLanguage: ['Static or slow push'],
    movementRestrictions: ['Minimal gesture'],
    realismRiskProfile: ['FAIL_ENVIRONMENT_INSTABILITY', 'FAIL_PLASTIC_SKIN'],
    bestUseCases: ['Punctuation beat', 'Transition hook'],
    recommendedProviderModes: ['image-to-video short clip'],
    continuityAnchors: ['elevator interior', 'wardrobe'],
    allowedProps: ['phone', 'bag'],
    disallowedProps: ['wrong floor indicators'],
  },
  CONCIERGE_STYLE_SCENE: {
    shotType: 'CONCIERGE_STYLE_SCENE',
    label: 'Concierge Style Scene',
    sceneObjective: 'Service luxury without theatrical performance.',
    environmentRules: ['Hotel lobby or arrival context'],
    wardrobeRules: ['Polished founder arrival look'],
    groomingRules: ['Confident natural expression'],
    lightingRules: ['Mixed lobby lighting controlled'],
    cameraLanguage: ['Medium wide arrival'],
    movementRestrictions: ['Walk pace dignified not rushed'],
    realismRiskProfile: ['FAIL_TOO_PERFECT_TO_BE_REAL'],
    bestUseCases: ['Brand arrival content'],
    recommendedProviderModes: ['hybrid still-first'],
    continuityAnchors: ['location', 'wardrobe'],
    allowedProps: [' luggage', 'phone'],
    disallowedProps: ['uniformed staff clones'],
  },
  PHONE_CAPTURED_SOCIAL_MOMENT: {
    shotType: 'PHONE_CAPTURED_SOCIAL_MOMENT',
    label: 'Phone-Captured Social Moment',
    sceneObjective: 'Native social capture aesthetic — slightly imperfect but premium.',
    environmentRules: ['Everyday luxury context'],
    wardrobeRules: ['Social-ready not overstyled'],
    groomingRules: ['Authentic not filtered'],
    lightingRules: ['Available light realism'],
    cameraLanguage: ['Handheld social framing', 'Slight grain acceptable'],
    movementRestrictions: ['Organic micro-shake'],
    realismRiskProfile: ['FAIL_AI_GLOSS_OVERLOAD'],
    bestUseCases: ['Stories/Reels native feel'],
    recommendedProviderModes: ['MiniMax/Hailuo social motion'],
    continuityAnchors: ['subject identity'],
    allowedProps: ['phone in frame optional'],
    disallowedProps: ['platform UI clones'],
  },
};

export function getShotBibleEntry(shotType: CinematicRealismShotType): ShotBibleEntry {
  return CINEMATIC_REALISM_SHOT_BIBLE[shotType];
}

export function listShotBibleEntries(): ShotBibleEntry[] {
  return Object.values(CINEMATIC_REALISM_SHOT_BIBLE);
}
