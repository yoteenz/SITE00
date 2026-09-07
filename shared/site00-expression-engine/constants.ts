/**
 * Expression Engine V0 constants — brand-agnostic production pipeline.
 */

export const EXPRESSION_ENGINE_VERSION = '0.1.0' as const;

/** Proof brand for Sprint B — explicit ownership only; never generic fallback. */
export const NDXBOOK_PROOF_PROJECT_KEY = 'ndxbook' as const;
export const NDXBOOK_PROOF_BRAND_ID = 'ndxbook' as const;

export const ENTRY_FORMATS = [
  'REEL',
  'CAROUSEL',
  'STORY',
  'CTA_STORY',
  'COVER',
  'HIGHLIGHT',
  'TIKTOK',
  'X',
] as const;

export const PRODUCTION_TASK_CLASSES = [
  'IMAGE_GENERATION',
  'IMAGE_EDIT',
  'IMAGE_REFERENCE_FIDELITY',
  'VIDEO_START_END_FRAME',
  'VIDEO_CHARACTER_CONTINUITY',
  'TTS_DIALOGUE',
  'SOUND_EFFECT',
  'MUSIC',
  'LIP_SYNC',
  'UPSCALE',
  'COMPOSITING',
  'TYPOGRAPHY',
  'EDITING',
] as const;

export const AUDIO_LAYER_TYPES = [
  'AMBIENCE',
  'FOLEY',
  'DIALOGUE_VO',
  'BROADCAST_AUDIO',
  'GLITCH_TRANSITION',
  'PHONE_UI_SOUND',
  'TITLE_CARD_SOUND',
  'MUSIC',
] as const;

export const CONTINUITY_NODE_KINDS = [
  'CHARACTER',
  'ENVIRONMENT',
  'OBJECT_ARTIFACT',
  'PALETTE',
  'TYPOGRAPHY',
  'WORLD_GRAMMAR',
  'NARRATIVE_STATE',
  'SEQUENCE_STATE',
] as const;

export const PLATFORM_TARGETS = ['INSTAGRAM', 'TIKTOK', 'X'] as const;

export const TRANSLATION_MODES = [
  'REUSE',
  'REFRAME',
  'REEDIT',
  'REWRITE',
  'REGENERATE',
  'IDEA_ONLY',
] as const;

export const ENTRY_STATUSES = [
  'DRAFT',
  'IN_PRODUCTION',
  'QA_BLOCKED',
  'READY_FOR_JUDGMENT',
  'COMPLETE',
  'ARCHIVED',
] as const;

export const LINEAGE_TRACKING_STATES = ['TRACKED', 'LEGACY_UNTRACKED'] as const;

export const EXPRESSION_QA_MAX_REPAIR_LOOPS = 2 as const;

export const ENTRY_001_NUMBER = 1 as const;
export const ENTRY_002_NUMBER = 2 as const;

export const ENTRY_001_TITLE = 'WHO TF IS WE?' as const;
export const ENTRY_001_SUBJECT = 'BRITNEY SPEARS' as const;

export const ENTRY_002_TITLE = 'OH, NOW IT WAS FUN?' as const;
export const ENTRY_002_SUBJECT = '2016 NOSTALGIA / CULTURAL REVISION' as const;
export const ENTRY_002_THESIS = 'WHEN CRINGE BECOMES NOSTALGIA.' as const;
