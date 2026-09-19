/**
 * P0.CGO.2 — ProductInteractionProfile builder.
 */

import type { ProductCategory } from './types.js';
import type { ProductInteractionProfile, ProductMotionSignature } from './conceptualEfficiencyTypes.js';

const MOTION_SIGNATURES: Record<ProductCategory, ProductMotionSignature> = {
  JEWELRY: {
    productCategory: 'JEWELRY',
    motions: ['STACK', 'GRIP', 'ADJUST', 'DEAL', 'REACH', 'TAP'],
    primaryMotion: 'GRIP',
  },
  HAIR: {
    productCategory: 'HAIR',
    motions: ['SWAY', 'BOUNCE', 'FLOW', 'RELEASE', 'TURN', 'SWEEP', 'DROP', 'FLOAT', 'DRAPE', 'MOVE_ACROSS_SHOULDER'],
    primaryMotion: 'SWAY',
  },
  FRAGRANCE: {
    productCategory: 'FRAGRANCE',
    motions: ['MIST', 'APPLY', 'INHALE', 'CAP_TWIST'],
    primaryMotion: 'APPLY',
  },
  FASHION: {
    productCategory: 'FASHION',
    motions: ['WALK', 'TURN', 'LAYER', 'SWISH', 'STRIDE'],
    primaryMotion: 'WALK',
  },
  GENERAL: {
    productCategory: 'GENERAL',
    motions: ['USE', 'HOLD', 'DISCOVER'],
    primaryMotion: 'USE',
  },
};

const PROFILES: Record<ProductCategory, Omit<ProductInteractionProfile, 'productId' | 'motionSignature'>> = {
  JEWELRY: {
    productCategory: 'JEWELRY',
    bodyInterfaces: ['HANDS', 'WRISTS', 'FINGERS', 'EARS', 'NECK'],
    behaviorInterfaces: ['HANDLING', 'REACHING', 'STACKING', 'POURING', 'HOLDING', 'TYPING', 'DEALING', 'BETTING'],
    motionInterfaces: ['GRIP', 'STACK', 'FLIP', 'TAP', 'SLIDE'],
    environmentInterfaces: ['FELT', 'TABLE', 'COUNTER', 'KEYBOARD', 'CARDS', 'CHIPS', 'TOOLS'],
    socialInterfaces: ['WAGER', 'TOAST', 'HANDSHAKE', 'GIFTING', 'NEGOTIATION'],
    sensoryInterfaces: ['WEIGHT', 'TEXTURE', 'COLD_METAL', 'CLICK', 'SHINE'],
    visibilityConditions: ['HANDS IN ACTION', 'WRIST TURN', 'NECKLINE IN FRAME', 'GESTURE MID-MOTION'],
    naturalActions: ['STACK CHIPS', 'DEAL CARDS', 'GRIP CUE', 'TYPE', 'POUR', 'ADJUST RING'],
    unnaturalActions: ['HOLD JEWELRY TO CAMERA', 'PRESENT ON PALM', 'FREEZE POSE FOR REVEAL'],
    interactionConstraints: ['PRODUCT MUST APPEAR THROUGH HAND USE', 'NO CENTERED HERO WITHOUT BEHAVIOR'],
  },
  HAIR: {
    productCategory: 'HAIR',
    bodyInterfaces: ['HEAD', 'FACE_FRAME', 'SHOULDERS', 'BACK', 'SILHOUETTE', 'HANDS_TOUCHING_HAIR'],
    behaviorInterfaces: [
      'FLIPPING',
      'TURNING',
      'WALKING',
      'RUNNING',
      'TYING',
      'RELEASING',
      'TOUCHING',
      'BRUSHING',
      'WIND_RESPONSE',
      'WATER_RESPONSE',
      'DANCE',
      'CONVERSATION',
    ],
    motionInterfaces: ['SWAY', 'BOUNCE', 'FLOW', 'RELEASE', 'TURN', 'SWEEP', 'DROP', 'FLOAT', 'DRAPE'],
    environmentInterfaces: ['WIND', 'TRANSIT', 'ELEVATOR', 'ROOFTOP', 'DANCE_FLOOR', 'POOL_EDGE', 'STREET'],
    socialInterfaces: ['GLANCE', 'OVERHEARD', 'PASSING', 'WAITING', 'PERFORMANCE'],
    sensoryInterfaces: ['TEXTURE', 'MOVEMENT', 'LIGHT_CATCH', 'WEIGHT', 'VOLUME'],
    visibilityConditions: [
      'HAIR MOVING THROUGH AIR',
      'HAIR FALLING OVER SHOULDER',
      'HAIR TUCKED BEHIND EAR',
      'HAIR RELEASED FROM TIE',
      'HAIR REACTING TO WIND OR SPEED',
      'HAIR FRAMING FACE IN STILLNESS',
      'HAIR CHANGING SILHOUETTE ON TURN',
    ],
    naturalActions: ['TURN INTO WIND', 'RELEASE PONYTAIL', 'TUCK BEHIND EAR', 'WALK PLATFORM', 'DANCE TURN'],
    unnaturalActions: ['MODEL STANDS STILL SHOWING HAIR', 'SALON MIRROR POSE ONLY', 'WIG INSTALLATION DEMO'],
    interactionConstraints: ['AVOID SALON/VANITY AS DEFAULT WORLD', 'PRODUCT VISIBLE THROUGH BEHAVIOR NOT POSE'],
  },
  FRAGRANCE: {
    productCategory: 'FRAGRANCE',
    bodyInterfaces: ['WRIST', 'NECK', 'COLLARBONE', 'HAND'],
    behaviorInterfaces: ['APPLICATION', 'DEPARTURE', 'INHALATION', 'GIFTING'],
    motionInterfaces: ['MIST', 'APPLY', 'CAP_TWIST'],
    environmentInterfaces: ['VANITY', 'DOORWAY', 'TRAVEL', 'INTIMATE SPACE'],
    socialInterfaces: ['GIFT', 'ARRIVAL', 'INTIMACY'],
    sensoryInterfaces: ['SCENT', 'MIST', 'WARMTH'],
    visibilityConditions: ['APPLICATION GESTURE', 'BOTTLE IN HAND MID-RITUAL'],
    naturalActions: ['SPRITZ WRIST', 'CAP TWIST', 'INHALE'],
    unnaturalActions: ['BOTTLE CENTERED ON WHITE'],
    interactionConstraints: ['RITUAL BEHAVIOR REQUIRED'],
  },
  FASHION: {
    productCategory: 'FASHION',
    bodyInterfaces: ['FULL_BODY', 'LEGS', 'FEET', 'SHOULDERS', 'SILHOUETTE'],
    behaviorInterfaces: ['WALKING', 'RUNNING', 'STANCE', 'SITTING', 'LAYERING', 'CARRYING'],
    motionInterfaces: ['WALK', 'TURN', 'STRIDE', 'SWISH'],
    environmentInterfaces: ['STREET', 'TRANSIT', 'STAIR', 'DOORWAY'],
    socialInterfaces: ['COMMUTE', 'EVENT', 'WORK'],
    sensoryInterfaces: ['TEXTURE', 'DRAPE', 'WEIGHT'],
    visibilityConditions: ['MOVEMENT REVEALS SILHOUETTE', 'STANCE IN ENVIRONMENT'],
    naturalActions: ['WALK', 'ASCEND STAIRS', 'CROSS STREET'],
    unnaturalActions: ['STATIC MANNEQUIN POSE'],
    interactionConstraints: ['MOTION OR STANCE IN WORLD'],
  },
  GENERAL: {
    productCategory: 'GENERAL',
    bodyInterfaces: ['HANDS', 'FACE', 'FULL_BODY'],
    behaviorInterfaces: ['USE', 'DISCOVERY', 'RITUAL', 'OBSERVATION'],
    motionInterfaces: ['USE', 'HOLD'],
    environmentInterfaces: ['TABLE', 'STREET', 'WORKSPACE'],
    socialInterfaces: ['CONVERSATION', 'WORK', 'LEISURE'],
    sensoryInterfaces: ['TEXTURE', 'SOUND'],
    visibilityConditions: ['IN-USE MOMENT'],
    naturalActions: ['HANDLE OBJECT', 'WRITE', 'OBSERVE'],
    unnaturalActions: ['PRODUCT CENTERED POSE'],
    interactionConstraints: ['BEHAVIOR-LED VISIBILITY'],
  },
};

export function buildProductInteractionProfile(input: {
  productId: string;
  productCategory: ProductCategory;
}): ProductInteractionProfile {
  const base = PROFILES[input.productCategory];
  return {
    productId: input.productId,
    ...base,
    motionSignature: MOTION_SIGNATURES[input.productCategory],
  };
}

export function getBodyInterfacesForCategory(category: ProductCategory): string[] {
  return PROFILES[category].bodyInterfaces;
}

export function getBehaviorInterfacesForCategory(category: ProductCategory): string[] {
  return PROFILES[category].behaviorInterfaces;
}
