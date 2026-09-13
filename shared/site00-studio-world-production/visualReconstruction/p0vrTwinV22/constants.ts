export const P0_VR_TWIN_V22_BUILD = 'v364' as const;

export const CONCEPT_GENERATION_TYPES = [
  'INITIAL',
  'REGENERATED',
  'REFINED',
  'DUPLICATED',
  'APPROVED',
  'LEGACY_V2_CONCEPT',
] as const;

export const BUILD_READINESS_STATUSES = [
  'VISUAL_ONLY',
  'BLUEPRINT_INCOMPLETE',
  'ASSETS_INCOMPLETE',
  'FUNCTIONS_INCOMPLETE',
  'READY_TO_BUILD',
  'APPROVED_READY_TO_BUILD',
  'BUILDING',
  'BUILT',
] as const;

export const REQUIRED_NDX_OVERVIEW_FUNCTIONS = [
  'project_progress',
  'current_phase',
  'key_metrics',
  'current_focus',
  'next_milestone',
  'recent_activity',
  'section_nav',
  'shell_host',
] as const;
