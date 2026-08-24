/**
 * P0.5C.5A — V2.3 Generation Authority adapter + constants.
 */

export const V23_FAL_COMPILER_VERSION = 'falPromptCompilerV23@P0.5C.5A' as const;
export const V23_EXPERIMENT_ID = 'marketing-expression-experiment-01-v23' as const;

export const V23_METHODOLOGY_VERSIONS = [
  'HUMAN_MADE_MARKS@P0.5C.4A',
  'SIGNATURE_LIME@P0.5C.4B',
  'FIRST_PERSON_AUTHORSHIP@P0.5C.5',
  'INTERNAL_LABEL_QUARANTINE@P0.5C.5',
  'ART_BOARD_MATERIALITY@P0.5C.4',
] as const;

export const V23_GOVERNANCE_VERSIONS = [
  'PUBLIC_AUTHORSHIP@P0.5C.5',
  'SIGNATURE_LIME_REQUIRED@P0.5C.4B',
  'HUMAN_MADE_MARKS@P0.5C.4A',
] as const;

export const V2_3_REGENERATION_USES_CURRENT_CONTRACTS = true as const;
export const V2_3_REGENERATION_RECOMPILES_PROMPT = true as const;
export const V2_3_STANDARD_REGENERATION_USES_STORED_PROMPT_SNAPSHOT = false as const;
export const HISTORICAL_PROMPT_REPLAY_SUPPORTED = true as const;
export const C4A_ACTIVE_IN_REGENERATION = true as const;
export const C4B_ACTIVE_IN_REGENERATION = true as const;
export const C5_ACTIVE_IN_REGENERATION = true as const;
export const SIGNATURE_LIME_REQUIRED = true as const;
export const HUMAN_MADE_MARKS_ACTIVE = true as const;
export const FIRST_PERSON_AUTHORSHIP_ACTIVE = true as const;
export const INTERNAL_LABEL_QUARANTINE_ACTIVE = true as const;
export const CURRENT_PUBLIC_COPY_ACTIVE = true as const;
export const LEGACY_ASSET_LINEAGE_CLASSIFIED = true as const;
export const SELECTED_ASSET_AUTHORITY_IMPLEMENTED = true as const;
export const ROUND_01_LOCK_REQUIRES_CURRENT_LINEAGE = true as const;
