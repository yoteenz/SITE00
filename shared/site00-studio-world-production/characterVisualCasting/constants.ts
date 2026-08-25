/** P0.5E.4C — Visual casting constants */

export const CHARACTER_VISUAL_CASTING_VERSION = 'CHARACTER_VISUAL_CASTING@P0.5E.4C' as const;

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
