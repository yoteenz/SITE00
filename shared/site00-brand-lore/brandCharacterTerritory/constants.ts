/**
 * Brand Character Territory — upstream WHO layer (Studio World generic + NDXBOOK pilot).
 */

export const BRAND_CHARACTER_TERRITORY_V1 = 'BRAND_CHARACTER_TERRITORY_V1' as const;

export const BRAND_CHARACTER_FORMATION_CLASSIFICATION = 'BRAND_CHARACTER_FORMATION' as const;

export const NDXBOOK_CHARACTER_FORMATION_RUN_ID = 'ndxbook-brand-character-formation';

export const NDXBOOK_CHARACTER_FORMATION_DB_ID = 'c4e1a2b3-0009-4000-8000-000000000001';

export const BRAND_CHARACTER_INTELLIGENCE_SNAPSHOT_VERSION = 1;

export const BRAND_CHARACTER_COUNT = 6;

export const BRAND_CHARACTER_LAYER_FORMALIZED = true as const;

export const BRAND_CHARACTER_SYSTEM_IMPLEMENTED = true as const;

export const CHARACTER_VS_PRESENTATION_BOUNDARY_ENFORCED = true as const;

export const CULTURAL_INTELLIGENCE_FIRST_CLASS = true as const;

export const CHARACTER_ARTIFACT_RELATIONSHIP_FORMALIZED = true as const;

export const NDXBOOK_CHARACTER_FORMATION_PIPELINE_READY = true as const;

/** Topic-blind — character answers WHO, not WHAT topic or HOW to present. */
export const BRAND_CHARACTER_FORMATION_SUBJECT = null;

export const CHARACTER_DISCOVERY_MODES = [
  'CHARACTER_DISCOVERY_REQUIRED',
  'CHARACTER_PARTIALLY_ESTABLISHED',
  'CHARACTER_ESTABLISHED',
] as const;

export type CharacterDiscoveryMode = (typeof CHARACTER_DISCOVERY_MODES)[number];

export const BRAND_CHARACTER_JUDGMENTS = [
  'LOVE_THE_CHARACTER',
  'PROMISING_DEVELOP',
  'TOO_GENERIC',
  'TOO_PERFORMATIVE',
  'TOO_INTERNET',
  'TOO_ACADEMIC',
  'TOO_STYLE_DEPENDENT',
  'TOO_CLOSE_TO_ANOTHER',
  'CULTURALLY_HOLLOW',
  'NOT_NDXBOOK',
  'REFORM_SET',
] as const;

export type BrandCharacterJudgment = (typeof BRAND_CHARACTER_JUDGMENTS)[number] | null;

export const CHARACTER_ABSTRACTION_FAILURES = [
  'STYLE_AS_CHARACTER',
  'FORMAT_AS_CHARACTER',
  'PRESENTATION_CONCEPT_AS_CHARACTER',
  'CONTENT_CONCEPT_AS_CHARACTER',
  'TOPIC_AS_CHARACTER',
  'CAMPAIGN_AS_CHARACTER',
  'PERSONALITY_STUB_AS_CHARACTER',
  'IDENTITY_DIRECTION_AS_CHARACTER',
] as const;

export type CharacterAbstractionFailure = (typeof CHARACTER_ABSTRACTION_FAILURES)[number];

export const CHARACTER_DISTINCTIVENESS_RESULTS = [
  'PASS_STRUCTURAL',
  'FAIL_ADJECTIVE_ONLY',
  'FAIL_STYLE_ONLY',
  'FAIL_HUMOR_INTENSITY_ONLY',
  'NOT_EVALUATED',
  'REQUIRES_SEMANTIC_AUDIT',
] as const;

export type CharacterDistinctivenessResult = (typeof CHARACTER_DISTINCTIVENESS_RESULTS)[number];

export const CHARACTER_ARTIFACT_EVAL_RESULTS = [
  'PASS_CHARACTER_EVIDENCE',
  'FAIL_NO_DETECTABLE_MAKER',
  'FAIL_GENERIC_EXPRESSION',
  'FAIL_PERSONALITY_ABOUT_NOT_IN',
  'NOT_EVALUATED',
] as const;

export type CharacterArtifactEvalResult = (typeof CHARACTER_ARTIFACT_EVAL_RESULTS)[number];

export const BURN_BOOK_CHARACTER_CALIBRATION_PURPOSE = 'CHARACTER_CALIBRATION' as const;

export const BURN_BOOK_CHARACTER_EVIDENCE_CLASSIFICATION = 'FOUNDER_REFERENCE_EVIDENCE' as const;

export const UPSTREAM_CHARACTER_LAYER_MISSING = 'UPSTREAM_CHARACTER_LAYER_MISSING' as const;

export const PRESENTATION_CONCEPT_COMPATIBILITY_RESULTS = [
  'STRONG_CHARACTER_FIT',
  'COMPATIBLE_WITH_TRANSLATION',
  'CHARACTER_TENSION',
  'INCOMPATIBLE',
  'NOT_EVALUATED',
] as const;

export type PresentationConceptCompatibilityResult =
  (typeof PRESENTATION_CONCEPT_COMPATIBILITY_RESULTS)[number];

export const CHARACTER_FIDELITY_DIMENSIONS = [
  'character_fidelity',
  'cultural_fidelity',
  'humor_wit_fidelity',
  'language_fidelity',
  'taste_fidelity',
  'artifact_authorship',
  'generic_brand_risk',
] as const;

export type CharacterFidelityDimension = (typeof CHARACTER_FIDELITY_DIMENSIONS)[number];

export const REFERENCE_CALIBRATION_DIMENSIONS = [
  'VISUAL_STYLE',
  'ARTIFACT_BEHAVIOR',
  'CULTURAL_CALIBRATION',
  'CHARACTER_CALIBRATION',
  'HUMOR_CALIBRATION',
  'AUDIENCE_RELATIONSHIP',
  'MATERIAL_BEHAVIOR',
  'TYPOGRAPHIC_BEHAVIOR',
  'IMAGE_BEHAVIOR',
  'COMPOSITIONAL_BEHAVIOR',
  'TEMPORAL_CULTURE',
  'SOCIAL_BEHAVIOR',
] as const;

export type ReferenceCalibrationDimension = (typeof REFERENCE_CALIBRATION_DIMENSIONS)[number];

export const EXPERIMENT_G_CHARACTER_ANCHOR_BLOCKLIST = [
  'THE ROOM THAT KNOWS',
  'THE THING THAT KEEPS NOTICING',
  'THE COLLECTOR WHO CONNECTS',
  'ROOM THAT KNOWS',
  'THING THAT KEEPS NOTICING',
  'COLLECTOR WHO CONNECTS',
] as const;

export const BURN_BOOK_LITERAL_STYLE_BLOCKLIST = [
  'mandatory pink',
  'mandatory handwriting',
  'mandatory scrapbook',
  'mandatory teenage aesthetic',
  'literal burn book clone',
] as const;
