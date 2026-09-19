/**
 * P0.CR.1 — Cinematic Realism Lab constants.
 */

export const CINEMATIC_REALISM_SHOT_TYPES = [
  'LUXURY_CAR_SEATED',
  'LUXURY_CAR_MIRROR_GLANCE',
  'LUXURY_CAR_DEVICE_INTERACTION',
  'FOUNDER_OFFICE_DESK',
  'FOUNDER_WALK_AND_TALK',
  'HOTEL_SUITE_EDITORIAL',
  'RESTAURANT_BOOTH_CONVERSATION',
  'ELEVATOR_MOMENT',
  'CONCIERGE_STYLE_SCENE',
  'PHONE_CAPTURED_SOCIAL_MOMENT',
] as const;

export const CINEMATIC_REALISM_PROVIDER_IDS = [
  'HIGGSFIELD',
  'MINIMAX_HAILUO',
  'KLING',
  'VEO',
  'RUNWAY',
  'GENERIC_STILL',
  'HYBRID_CONTROLLER',
] as const;

export const CINEMATIC_REALISM_LANES = [
  'LANE_A_HIGGSFIELD',
  'LANE_B_MINIMAX',
  'LANE_C_KLING',
  'LANE_D_VEO',
  'LANE_E_RUNWAY',
  'LANE_F_HYBRID_STILL_VIDEO',
  'LANE_G_FUTURE',
] as const;

export const CINEMATIC_REALISM_PROVIDER_READINESS = [
  'READY',
  'SCHEMA_REVIEW_REQUIRED',
  'AUTH_REQUIRED',
  'DISABLED',
  'EXPERIMENTAL',
] as const;

export const CINEMATIC_REALISM_FAILURES = [
  'FAIL_PLASTIC_SKIN',
  'FAIL_FLOATING_HANDS',
  'FAIL_DEAD_EYES',
  'FAIL_STIFF_POSTURE',
  'FAIL_PROP_DRIFT',
  'FAIL_UNNATURAL_GAZE',
  'FAIL_AI_GLOSS_OVERLOAD',
  'FAIL_LUXURY_FANTASY_NOT_REALITY',
  'FAIL_ENVIRONMENT_INSTABILITY',
  'FAIL_FABRIC_BEHAVIOR',
  'FAIL_MOTION_RUBBERINESS',
  'FAIL_INCONSISTENT_IDENTITY',
  'FAIL_VOICE_UNCANNY',
  'FAIL_TOO_PERFECT_TO_BE_REAL',
] as const;

export const CINEMATIC_REALISM_FOUNDER_JUDGMENTS = [
  'THIS_FEELS_REAL',
  'CLOSE_BUT_OFF',
  'TOO_AI',
  'BEST_IN_CLASS',
  'BEST_FACE',
  'BEST_MOTION',
  'BEST_LIGHTING',
  'BEST_SCENE',
  'KEEP_AS_BENCHMARK',
  'REJECT',
] as const;

export const HYBRID_PIPELINE_STAGES = [
  'GENERATE_HERO_STILL',
  'APPROVE_STILL',
  'BIND_CONTINUITY',
  'ANIMATE_VIDEO',
  'EVALUATE_MOTION',
  'APPROVE_OR_REJECT',
  'OPTIONAL_POLISH',
  'LOCK_FINAL',
] as const;

export const POST_PIPELINE_SLOTS = [
  'UPSCALE',
  'SHARPEN',
  'COLOR_CONSISTENCY',
  'SUBTITLE_OVERLAY',
  'AUDIO_VOICE_LAYER',
  'EXPORT_VARIANTS',
] as const;

export const REALISM_REFERENCE_TYPES = [
  'IDENTITY',
  'WARDROBE',
  'ENVIRONMENT',
  'COLOR_LIGHTING',
  'COMPOSITION',
  'MOTION',
  'BENCHMARK',
  'PRIOR_APPROVED',
] as const;

export const REALISM_TEST_TYPES = [
  'MULTI_PROVIDER_SAME_BRIEF',
  'SAME_STILL_MULTI_ANIMATOR',
  'PROMPT_STRUCTURE_VARIANT',
  'MOTION_CONSTRAINT_VARIANT',
  'STILL_FIRST_VS_DIRECT_VIDEO',
] as const;

export const REALISM_EVALUATION_CATEGORIES = [
  'facePlausibility',
  'skinRealism',
  'eyeRealism',
  'hairRealism',
  'handRealism',
  'bodyProportionPlausibility',
  'fabricRealism',
  'propRealism',
  'environmentRealism',
  'lightingRealism',
  'motionRealism',
  'expressionRealism',
  'poseNaturalness',
  'continuityStability',
  'premiumEditorialQuality',
  'passAsRealOnInstagram',
  'wouldStopScrolling',
] as const;

export const LANE_TO_PROVIDER: Record<
  (typeof CINEMATIC_REALISM_LANES)[number],
  (typeof CINEMATIC_REALISM_PROVIDER_IDS)[number]
> = {
  LANE_A_HIGGSFIELD: 'HIGGSFIELD',
  LANE_B_MINIMAX: 'MINIMAX_HAILUO',
  LANE_C_KLING: 'KLING',
  LANE_D_VEO: 'VEO',
  LANE_E_RUNWAY: 'RUNWAY',
  LANE_F_HYBRID_STILL_VIDEO: 'HYBRID_CONTROLLER',
  LANE_G_FUTURE: 'GENERIC_STILL',
};

export const PILOT_EXPERIMENT_NAME = 'LUXURY CREATOR REALISM TEST 01' as const;

export const PILOT_CANONICAL_BRIEF =
  'A stylish founder woman seated in the back seat of a luxury vehicle during golden-hour city transit, using a phone and tablet, speaking calmly and confidently, filmed in a premium cinematic social-media style. The scene must feel believable, polished, editorial, and socially native — not fantasy, not glamour-filtered, not obviously AI.' as const;

export const REALISM_LAB_ARCHITECTURE_VERSION = 'P0.CR.1' as const;
