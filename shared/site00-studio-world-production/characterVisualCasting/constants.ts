/** P0.5E.4D — Visual casting constants (reference-first regeneration) */

export const CHARACTER_VISUAL_CASTING_VERSION = 'CHARACTER_VISUAL_CASTING@P0.5E.4D' as const;

export const DEFAULT_CASTING_CANDIDATE_COUNT = 6 as const;

export const CASTING_PRIMARY_JUDGMENTS = [
  'THATS_HER',
  'CLOSE',
  'NOT_HER',
  'MIX_THESE',
  'RIGHT_FACE_WRONG_ENERGY',
  'RIGHT_ENERGY_WRONG_STYLING',
] as const;

export const CASTING_DEEPER_JUDGMENTS = [
  'TOO_POLISHED',
  'TOO_YOUNG',
  'TOO_OLD',
  'TOO_GLAM',
  'TOO_GENERIC',
  'TOO_MODEL_LIKE',
  'TOO_CORPORATE',
  'TOO_INFLUENCER',
  'WRONG_HAIR',
  'WRONG_WARDROBE',
  'WRONG_CAMERA_PRESENCE',
  'WRONG_CULTURAL_ENERGY',
  'OTHER',
] as const;

export const CASTING_CANDIDATE_STATUSES = [
  'UNREVIEWED',
  'CLOSE',
  'REJECTED',
  'SHORTLISTED',
  'SELECTED',
  'MERGE_SOURCE',
  'SUPERSEDED',
] as const;

export const CASTING_ROUND_STATUSES = [
  'READY',
  'GENERATING',
  'REVIEW_READY',
  'CALIBRATING',
  'COMPLETE',
  'SUPERSEDED',
] as const;

export const CASTING_VARIATION_AXES = [
  'FACE_STRUCTURE',
  'AGE_EXPRESSION',
  'HAIR_PROTECTIVE_STYLE',
  'NATURAL_TEXTURE',
  'STYLING_POLISH',
  'WARDROBE_ENERGY',
  'APPROACHABLE_VS_SHARP',
  'CAMERA_EASE',
  'INTELLECTUAL_PRESENCE',
  'EDITORIAL_POLISH',
] as const;

export const MERGE_TRAIT_OPTIONS = [
  'FACE',
  'HAIR',
  'AGE_ENERGY',
  'WARDROBE',
  'PRESENCE',
  'STYLING',
  'CAMERA_ENERGY',
] as const;

export const FINAL_IDENTITY_VIEWS = [
  'FRONT_PORTRAIT',
  'THREE_QUARTER',
  'PROFILE',
] as const;

export const FINAL_IDENTITY_EXPRESSIONS = [
  'NEUTRAL',
  'SMALL_SMILE',
  'LAUGHING',
  'SKEPTICAL',
  'MILDLY_IRRITATED',
] as const;

export const FINAL_IDENTITY_POSES = ['SEATED', 'STANDING'] as const;

export const FOUNDER_CASTING_REFERENCE_ROLES = [
  'FACE',
  'HAIR',
  'WARDROBE',
  'PRESENCE',
  'FULL_LOOK',
  'MOOD',
] as const;

export const CASTING_NEGATIVE_CONSTRAINTS = [
  'generic AI influencer',
  'beauty campaign model',
  'hyper-glam plastic skin',
  'oversexualized styling',
  'stereotyped Black femininity',
  'AI Instagram model look',
  'corporate headshot',
  'uncanny eyes',
  'unreal hair',
] as const;

/** P0.5E.4D — Reference-driven anti-drift negatives (dominate when founder reference authority is active). */
export const REFERENCE_DRIVEN_NEGATIVE_CONSTRAINTS = [
  ...CASTING_NEGATIVE_CONSTRAINTS,
  'different woman',
  'unrelated casting candidate',
  'age drift',
  'face structure drift',
  'race or ethnicity drift',
  'hairstyle identity loss',
  'wardrobe lane drift',
  'environment mismatch',
  'beauty-influencer generic glam',
  'random casting pool interpretation',
  'inspired-by instead of reconstruct',
] as const;

export const CASTING_PROMPT_AUTHORITY_LAYERS = [
  'REFERENCE_IDENTITY_AUTHORITY',
  'REFERENCE_STYLING_AUTHORITY',
  'REFERENCE_WARDROBE_AUTHORITY',
  'CHARACTER_TRUTH_SNAPSHOT',
  'VISUAL_CASTING_RULES',
  'LEGACY_CASTING_PROMPT_TEXT',
  'GENERIC_PROVIDER_DEFAULTS',
] as const;

/** Character Bible asset pack slots — same woman, structured coverage from one reference. */
export const CHARACTER_BIBLE_ASSET_SLOTS = [
  'PORTRAIT_FRONT',
  'PORTRAIT_THREE_QUARTER',
  'PORTRAIT_LEFT_PROFILE',
  'PORTRAIT_RIGHT_PROFILE',
  'PORTRAIT_BACK_HAIR',
  'FULL_BODY_FRONT',
  'FULL_BODY_LEFT',
  'FULL_BODY_RIGHT',
  'FULL_BODY_BACK',
  'FULL_BODY_STANDING_NEUTRAL',
  'WARDROBE_SHEET',
  'ENVIRONMENT_SET',
  'EXPRESSION_NEUTRAL',
  'EXPRESSION_SLIGHT_SMILE',
  'EXPRESSION_SKEPTICAL',
  'EXPRESSION_OBSERVANT',
  'EXPRESSION_CALM_DIRECT',
] as const;

export const CHARACTER_BIBLE_REVIEW_TABS = [
  'PRESENCE',
  'PORTRAIT_ANGLES',
  'FULL_TURNAROUND',
  'WARDROBE',
  'ENVIRONMENT',
  'BIBLE_SUMMARY',
] as const;

export const REFERENCE_CONTROLLED_VARIATION_SLOTS = [
  'CONTROLLED_EXPRESSION',
  'CONTROLLED_HAIR_POLISH',
  'CONTROLLED_WARDROBE_POLISH',
  'CONTROLLED_PRESENCE_INTENSITY',
  'CONTROLLED_CAMERA_ANGLE',
  'CONTROLLED_ENVIRONMENT_FRAMING',
] as const;
