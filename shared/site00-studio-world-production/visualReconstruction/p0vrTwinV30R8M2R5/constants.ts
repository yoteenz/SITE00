export { FORENSIC_PROMPT_OPENING } from './buildForensicImplementationCodingPrompt.js';

export const P0_VR_TWIN_V30R8M2R5_LINEAGE = 'P0.VR.TWINV3.0R8M2R5' as const;
export const P0_VR_TWIN_V30R8M2R5F1_LINEAGE = 'P0.VR.TWINV3.0R8M2R5F1' as const;
/** Bumps local twin implementation cache without founder clearing storage manually. */
export const MOBILE_TWIN_IMPLEMENTATION_CLIENT_CACHE_EPOCH = 2 as const;
export const MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R5 = 'R8M2R5' as const;
export const MOBILE_TWIN_IMPLEMENTATION_VERSION_FORENSIC_BLUEPRINT =
  'mobile-twin-impl-v7-forensic-blueprint' as const;

export const FORENSIC_BLUEPRINT_FAL_ENDPOINT = 'fal-ai/nano-banana-2/edit' as const;
export const FORENSIC_BLUEPRINT_PROMPT_VERSION = 'forensic-ui-v1' as const;
export const FORENSIC_BLUEPRINT_OUTPUT_FORMAT = 'png' as const;
export const FORENSIC_BLUEPRINT_RESOLUTION = '4K' as const;

export const FORENSIC_CSS_PREFIX = 'site00-twin-fb' as const;

export const R8M2R4_CORRECTION_REQUIRED_REASON = 'ACTUAL_FIRST_SYNTHETIC_SCREENSHOT_NOT_SUFFICIENT' as const;

export const FORENSIC_BLUEPRINT_GENERATION_FAILED = 'FORENSIC_BLUEPRINT_GENERATION_FAILED' as const;
export const FORENSIC_BLUEPRINT_NOT_FAITHFUL = 'FORENSIC_BLUEPRINT_NOT_FAITHFUL' as const;
export const FORENSIC_OBJECT_MAP_INCOMPLETE = 'FORENSIC_OBJECT_MAP_INCOMPLETE' as const;
export const FORENSIC_SPEC_NOT_CONSUMED = 'FORENSIC_SPEC_NOT_CONSUMED' as const;
export const LIVE_DOM_GEOMETRY_DRIFT = 'LIVE_DOM_GEOMETRY_DRIFT' as const;
export const ACTUAL_TO_LIVE_FIDELITY_FAILED = 'ACTUAL_TO_LIVE_FIDELITY_FAILED' as const;
export const SYNTHETIC_SCREENSHOT_USED_AS_PROOF = 'SYNTHETIC_SCREENSHOT_USED_AS_PROOF' as const;

export const MIN_FORENSIC_DOM_CORRECTION_ITERATIONS = 2 as const;

export const CRITICAL_OBJECT_TOLERANCE_RATIO = 0.04 as const;
export const SECONDARY_OBJECT_TOLERANCE_RATIO = 0.05 as const;

export const FORENSIC_SECTION_IDS = [
  'HOST_SHELL',
  'PROJECT_CONTEXT',
  'TARGET_VIEWPORT_STAGE',
  'HERO_WORKSPACE',
  'AUTHORITY_PANEL',
  'CANDIDATE_GALLERY',
  'DECISION_BAR',
  'STRUCTURED_OUTPUT',
  'READINESS',
  'CONCEPT_DATA_HISTORY',
  'BOTTOM_NAV',
] as const;

export type ForensicSectionId = (typeof FORENSIC_SECTION_IDS)[number];
