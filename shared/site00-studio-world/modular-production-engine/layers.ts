/**
 * Canonical system layers — Performer, Environment, Prop/Graphic, Wardrobe, Motion/Performance.
 */

export const PRODUCTION_LAYERS = [
  'PERFORMER',
  'ENVIRONMENT',
  'PROP_GRAPHIC',
  'WARDROBE',
  'MOTION_PERFORMANCE',
] as const;

export type ProductionLayer = (typeof PRODUCTION_LAYERS)[number];

/** Performer sub-layers (swappable skins vs immutable identity). */
export const PERFORMER_SUB_LAYERS = [
  'ACTOR_IDENTITY',
  'CHARACTER_ROLE',
  'PERSONALITY_SKIN',
  'BEHAVIOR_MANNERISM_SKIN',
  'ANIMATION_MOVEMENT_SKIN',
  'VOICE_TONE_SKIN',
  'HAIR_MAKEUP_SKIN',
  'WARDROBE_SKIN',
  'SHOT_DIRECTION',
] as const;

export type PerformerSubLayer = (typeof PERFORMER_SUB_LAYERS)[number];

export const IMMUTABLE_PERFORMER_LAYERS: readonly PerformerSubLayer[] = ['ACTOR_IDENTITY'];
export const SWAPPABLE_PERFORMER_SKINS: readonly PerformerSubLayer[] = [
  'PERSONALITY_SKIN',
  'BEHAVIOR_MANNERISM_SKIN',
  'ANIMATION_MOVEMENT_SKIN',
  'VOICE_TONE_SKIN',
  'HAIR_MAKEUP_SKIN',
  'WARDROBE_SKIN',
];

export const ENVIRONMENT_SUB_LAYERS = [
  'WORLD',
  'DISTRICT_CATEGORY',
  'ENVIRONMENT',
  'SET',
  'ZONE_ANGLE_COVERAGE',
  'LIGHTING_MOOD',
  'SURFACE_MATERIAL',
  'SIGNAGE_TEXT_SLOTS',
  'INTERACTION_ANCHORS',
] as const;

export type EnvironmentSubLayer = (typeof ENVIRONMENT_SUB_LAYERS)[number];

export const PROP_GRAPHIC_SUB_LAYERS = [
  'PROP',
  'SCREEN',
  'SIGNAGE',
  'FRAMED_GRAPHIC',
  'TEXT_OVERLAY',
  'PRINTED_MATTER',
  'UI_OVERLAY',
  'WORLD_LOGIC_OBJECT',
] as const;

export type PropGraphicSubLayer = (typeof PROP_GRAPHIC_SUB_LAYERS)[number];

export const WARDROBE_SUB_LAYERS = [
  'BASE_ITEM',
  'STYLE_CATEGORY',
  'ERA',
  'MOOD',
  'FORMALITY',
  'ROLE_COMPATIBILITY',
  'COLOR_FAMILY',
  'FIT_SILHOUETTE',
  'ACCESSORY_COMPATIBILITY',
] as const;

export type WardrobeSubLayer = (typeof WARDROBE_SUB_LAYERS)[number];

export const MOTION_PERFORMANCE_SUB_LAYERS = [
  'POSTURE',
  'WALK_CYCLE',
  'GESTURE_LANGUAGE',
  'EYE_BEHAVIOR',
  'HEAD_MOVEMENT',
  'EMOTIONAL_CADENCE',
  'REACTION_STYLE',
  'INTERACTION_STYLE',
  'ANIMATION_REALISM_MODE',
] as const;

export type MotionPerformanceSubLayer = (typeof MOTION_PERFORMANCE_SUB_LAYERS)[number];
