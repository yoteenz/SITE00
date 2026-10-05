/** Prompt markers used to verify feature coverage in generation text (deterministic QA). */
export const FEATURE_PROMPT_MARKERS: Record<string, string[]> = {
  design_workspace_context: ['SITE 00', 'PROJECT', 'DESIGN'],
  design_workspace_navigation: ['REFERENCES', 'ASSETS', 'PAGES', 'SKINS', 'HISTORY'],
  viewport_control: ['MOBILE', 'DESKTOP', 'VIEWPORT'],
  active_design_target: ['TARGET', 'ACTIVE', 'CONTEXT'],
  concept_candidate_gallery: ['CANDIDATE', 'GALLERY', 'CONCEPT'],
  compare_concepts: ['COMPARE'],
  refine_concept: ['REFINE'],
  regenerate_concept: ['REGENERATE'],
  inspect_candidate: ['INSPECT', 'FULLSCREEN', 'VIEW'],
  select_mobile_master_candidate: ['SELECT FOR MOBILE', 'SELECTED FOR MOBILE'],
  select_desktop_master_candidate: ['SELECT FOR DESKTOP', 'SELECTED FOR DESKTOP'],
  promote_mobile_viewport_master: ['PROMOTE MOBILE', 'MOBILE MASTER'],
  promote_desktop_viewport_master: ['PROMOTE DESKTOP', 'DESKTOP MASTER'],
  authority_pair_status: ['AUTHORITY PAIR', 'MOBILE MASTER', 'DESKTOP MASTER'],
  replace_viewport_master: ['REPLACE'],
  review_authority_pair: ['PAIR REVIEW', 'REVIEW AUTHORITY'],
  lock_authority_pair: ['LOCK', 'AUTHORITY PAIR'],
  inspect_project_grounding: ['GROUNDING'],
  inspect_blueprint: ['BLUEPRINT'],
  inspect_overlay: ['OVERLAY'],
  inspect_assets: ['ASSET'],
  inspect_function_mapping: ['FUNCTION', 'OWNERSHIP'],
  compiler_readiness: ['READINESS', 'COMPILER'],
  move_to_build: ['BUILD', 'MOVE TO BUILD'],
  technical_details: ['TECHNICAL', 'BOTTOM SHEET', 'DRAWER'],
  design_history: ['HISTORY'],
  feature_change_history: ['FEATURE CHANGE', 'CHANGE HISTORY'],
  master_amendment_status: ['MASTER UPDATE', 'AMENDMENT'],
  contextual_next_action: ['NEXT ACTION', 'PRIMARY ACTION'],
};

export const UNAPPROVED_FEATURE_MARKERS = ['RANDOM FEATURE', 'INVENTED MODULE', 'UNSUPPORTED CAPABILITY'];

export const REMOVED_FEATURE_FORBIDDEN_MARKERS: Record<string, string[]> = {};
