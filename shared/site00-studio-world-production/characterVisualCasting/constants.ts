/** P0.5E.4E.1 — Image-reference identity generation + turnaround separation */

export const CHARACTER_VISUAL_CASTING_VERSION = 'CHARACTER_VISUAL_CASTING@P0.5E.4E.1' as const;

export const WHITE_STUDIO_BACKGROUND =
  'CLEAN WHITE — pure neutral studio white background, no environment, no furniture, no room, no decor' as const;

export const FAIL_TURNAROUND_OUTFIT_DRIFT = 'FAIL_TURNAROUND_OUTFIT_DRIFT' as const;

export const CASTING_AUTHORITY_MODES = ['REFERENCE_IMAGE_DRIVEN', 'LEGACY_TEXT_CASTING_PROMPT'] as const;

/** Required character turnaround angles — same woman, same outfit, white background. */
export const CHARACTER_TURNAROUND_SLOTS = [
  'FRONT_FULL_BODY',
  'FRONT_PORTRAIT_MID',
  'THREE_QUARTER_LEFT',
  'THREE_QUARTER_RIGHT',
  'LEFT_PROFILE',
  'RIGHT_PROFILE',
  'FULL_BODY_LEFT',
  'FULL_BODY_RIGHT',
  'FULL_BODY_BACK',
  'BACK_HAIR_DETAIL',
  'SEATED_NEUTRAL',
  'CLOSE_FACE_REFERENCE',
] as const;

export const CHARACTER_WARDROBE_DOC_SLOTS = [
  'WARDROBE_FRONT',
  'WARDROBE_SIDE',
  'WARDROBE_BACK',
  'GARMENT_DETAILS',
  'ACCESSORY_DETAILS',
] as const;

export const ENVIRONMENT_PLATE_MODES = [
  'ENVIRONMENT_HERO',
  'ENVIRONMENT_WIDE',
  'ENVIRONMENT_REVERSE',
  'ENVIRONMENT_LEFT_ANGLE',
  'ENVIRONMENT_RIGHT_ANGLE',
  'ENVIRONMENT_DETAIL',
  'ENVIRONMENT_PROP_LAYOUT',
] as const;

export const ENVIRONMENT_LEAK_FAILURE_CODES = [
  'FAIL_PERSON_IN_ENVIRONMENT_PLATE',
  'FAIL_CHARACTER_REFLECTION_LEAK',
  'FAIL_BODY_PART_IN_ENVIRONMENT',
  'FAIL_ENVIRONMENT_STYLE_DRIFT',
  'FAIL_ARCHITECTURE_DRIFT',
] as const;

export const TURNAROUND_NEGATIVE_CONSTRAINTS = [
  'different woman',
  'outfit change',
  'new garments',
  'environment',
  'furniture',
  'room',
  'restyling',
  'beautification drift',
  'generic model',
  'editorial set',
  'shadow-heavy backdrop',
] as const;

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
  'FULL_LOOK',
  'FACE',
  'HAIR',
  'WARDROBE',
  'PRESENCE',
  'MOOD',
  'FACE_CLOSEUP',
  'FULL_BODY_REFERENCE',
  'SIDE_VIEW_SUPPORT',
  'BACK_VIEW_SUPPORT',
  'WARDROBE_DETAIL_SUPPORT',
  'ENVIRONMENT_SUPPORT',
] as const;

export const OPTIONAL_SUPPORTING_REFERENCE_ROLES = [
  'FACE_CLOSEUP',
  'FULL_BODY_REFERENCE',
  'SIDE_VIEW_SUPPORT',
  'BACK_VIEW_SUPPORT',
  'WARDROBE_DETAIL_SUPPORT',
  'ENVIRONMENT_SUPPORT',
] as const;

export const CANONICAL_ANCHOR_STAGES = [
  'CANONICAL_ANCHOR_PENDING',
  'CANONICAL_ANCHOR_GENERATING',
  'CANONICAL_ANCHOR_REVIEW',
  'CANONICAL_ANCHOR_APPROVED',
  'BIBLE_PACK_READY_TO_GENERATE',
  'BIBLE_PACK_REVIEW',
  'BIBLE_PACK_APPROVED',
] as const;

export const INFERENCE_VISIBILITY_LEVELS = [
  'DIRECTLY_VISIBLE',
  'STRONGLY_INFERRED',
  'WEAKLY_INFERRED',
] as const;

export const CHARACTER_CONTINUITY_DRIFT_CATEGORIES = [
  'IDENTITY_MATCH',
  'FACE_MATCH',
  'HAIR_MATCH',
  'SKIN_TONE_MATCH',
  'BODY_MATCH',
  'WARDROBE_MATCH',
  'ACCESSORY_MATCH',
  'ENVIRONMENT_MATCH',
  'PRESENCE_MATCH',
  'SAME_WOMAN_CONFIDENCE',
  'SAME_LOOK_CONFIDENCE',
] as const;

export const CHARACTER_DRIFT_FAILURE_CODES = [
  'FAIL_IDENTITY_DRIFT',
  'FAIL_FACE_STRUCTURE_DRIFT',
  'FAIL_HAIR_DRIFT',
  'FAIL_SKIN_TONE_DRIFT',
  'FAIL_BODY_SILHOUETTE_DRIFT',
  'FAIL_WARDROBE_DRIFT',
  'FAIL_ACCESSORY_DRIFT',
  'FAIL_ENVIRONMENT_DRIFT',
  'FAIL_PRESENCE_DRIFT',
  'FAIL_MULTI_ASSET_CONTINUITY_BREAK',
  'FAIL_WARDROBE_DOCUMENTATION_BECAME_RESTYLE',
  'FAIL_ENVIRONMENT_DOCUMENTATION_BECAME_NEW_SCENE',
  'FAIL_TURNAROUND_OUTFIT_DRIFT',
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
  'UPLOADED_REFERENCE_AUTHORITY',
  'IDENTITY_LOCK',
  'WARDROBE_LOCK',
  'ENVIRONMENT_LOCK',
  'APPROVED_CANONICAL_ANCHOR',
  'VIEW_CONTRACT',
  'INFERENCE_RULES',
  'STYLE_REALISM_FINISHING',
  'CHARACTER_TRUTH_SNAPSHOT',
  'LEGACY_CASTING_PROMPT_TEXT',
  'GENERIC_PROVIDER_DEFAULTS',
] as const;

export const IDENTITY_LOCK_PROMPT_AUTHORITY_LAYERS = [
  'UPLOADED_REFERENCE_AUTHORITY',
  'IDENTITY_LOCK',
  'WARDROBE_LOCK',
  'ENVIRONMENT_LOCK',
  'APPROVED_CANONICAL_ANCHOR',
  'VIEW_CONTRACT',
  'INFERENCE_RULES',
  'STYLE_REALISM_FINISHING',
] as const;

/** Character Bible asset pack slots — anchor-dependent, same woman + same look. */
export const CHARACTER_BIBLE_ASSET_SLOTS = [
  'FRONT_VIEW',
  'LEFT_SIDE_VIEW',
  'RIGHT_SIDE_VIEW',
  'BACK_VIEW',
  'FULL_BODY_VIEW',
  'SEATED_EDITORIAL_VIEW',
  'WARDROBE_DOCUMENTATION_SHEET',
  'WARDROBE_ITEM_DETAIL_SET',
  'ENVIRONMENT_REFERENCE_SET',
  'CHARACTER_BIBLE_CONTACT_SHEET',
] as const;

/** P0.5E.4D slot aliases for migrated state / tests. */
export const LEGACY_CHARACTER_BIBLE_ASSET_SLOT_ALIASES: Record<string, (typeof CHARACTER_BIBLE_ASSET_SLOTS)[number]> = {
  PORTRAIT_FRONT: 'FRONT_VIEW',
  PORTRAIT_LEFT_PROFILE: 'LEFT_SIDE_VIEW',
  PORTRAIT_RIGHT_PROFILE: 'RIGHT_SIDE_VIEW',
  PORTRAIT_BACK_HAIR: 'BACK_VIEW',
  FULL_BODY_STANDING_NEUTRAL: 'FULL_BODY_VIEW',
  FULL_BODY_FRONT: 'FULL_BODY_VIEW',
  WARDROBE_SHEET: 'WARDROBE_DOCUMENTATION_SHEET',
  ENVIRONMENT_SET: 'ENVIRONMENT_REFERENCE_SET',
} as const;

export const ANCHOR_DEPENDENT_NEGATIVE_CONSTRAINTS = [
  ...REFERENCE_DRIVEN_NEGATIVE_CONSTRAINTS,
  'do not generate a different woman',
  'do not re-cast the face',
  'do not change the hairstyle category',
  'do not change outfit color palette',
  'do not invent different garments',
  'do not substitute a different environment aesthetic',
  'do not treat the reference as loose inspiration',
  'do not create a new fashion concept when documenting wardrobe',
  'do not over-glamorize or beautify into a different identity',
  'do not drift into generalized stock editorial woman output',
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
