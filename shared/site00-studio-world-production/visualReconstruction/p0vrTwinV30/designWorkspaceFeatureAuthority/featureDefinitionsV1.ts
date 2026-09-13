import type { WorkspaceFeatureDefinition } from './types.js';

const V = 'design-workspace-feature-manifest-v1';

function def(
  featureId: string,
  featureName: string,
  description: string,
  extra?: Partial<WorkspaceFeatureDefinition>,
): WorkspaceFeatureDefinition {
  return {
    featureId,
    featureName,
    description,
    functionalPurpose: description,
    lifecycleStatus: extra?.lifecycleStatus ?? 'ACTIVE',
    required: extra?.required ?? true,
    ownership: extra?.ownership ?? 'SHARED',
    interactionClass: extra?.interactionClass ?? 'WORKSPACE',
    visualPresenceRequirement: extra?.visualPresenceRequirement ?? 'VISIBLE_OR_PROGRESSIVE',
    allowablePresentationModes: extra?.allowablePresentationModes ?? ['INLINE', 'DOCK', 'SHEET', 'DRAWER'],
    dataDependencies: extra?.dataDependencies ?? [],
    functionDependencies: extra?.functionDependencies ?? [],
    authorityRequirements: extra?.authorityRequirements ?? [],
    introducedInVersion: extra?.introducedInVersion ?? V,
    modifiedInVersion: extra?.modifiedInVersion ?? null,
    deprecatedInVersion: extra?.deprecatedInVersion ?? null,
    removedInVersion: extra?.removedInVersion ?? null,
    replacedByFeatureId: extra?.replacedByFeatureId ?? null,
    notes: extra?.notes ?? '',
  };
}

/** Canonical required DESIGN workspace features (identical across territories A/B/C). */
export const DESIGN_WORKSPACE_FEATURE_DEFINITIONS_V1: WorkspaceFeatureDefinition[] = [
  def('design_workspace_context', 'Design workspace context', 'SITE 00 host, active project, DESIGN page, workflow legible'),
  def('design_workspace_navigation', 'Design navigation', 'REFERENCES ASSETS PAGES SKINS HISTORY MORE — SKINS dedicated'),
  def('viewport_control', 'Viewport control', 'MOBILE TABLET DESKTOP workspace controls'),
  def('active_design_target', 'Active design target', 'Clear active artifact/page/stage context'),
  def('concept_candidate_gallery', 'Concept candidate gallery', 'Browse generated candidates with lineage'),
  def('compare_concepts', 'Compare concepts', 'Side-by-side swipe or switcher comparison'),
  def('refine_concept', 'Refine concept', 'Bounded refinement preserving lineage'),
  def('regenerate_concept', 'Regenerate concept', 'Sibling generation without deleting prior'),
  def('inspect_candidate', 'Inspect candidate', 'Fullscreen or scaled inspection'),
  def('select_mobile_master_candidate', 'Select mobile master', 'SELECT FOR MOBILE — reversible, not promotion', {
    lifecycleStatus: 'ADDED',
    introducedInVersion: 'design-workspace-feature-manifest-v1-r5f1',
  }),
  def('select_desktop_master_candidate', 'Select desktop master', 'SELECT FOR DESKTOP — reversible', {
    lifecycleStatus: 'ADDED',
    introducedInVersion: 'design-workspace-feature-manifest-v1-r5f1',
  }),
  def('promote_mobile_viewport_master', 'Promote mobile master', 'Explicit PROMOTE MOBILE MASTER', {
    lifecycleStatus: 'ADDED',
    introducedInVersion: 'design-workspace-feature-manifest-v1-r5f1',
  }),
  def('promote_desktop_viewport_master', 'Promote desktop master', 'Explicit PROMOTE DESKTOP MASTER', {
    lifecycleStatus: 'ADDED',
    introducedInVersion: 'design-workspace-feature-manifest-v1-r5f1',
  }),
  def('authority_pair_status', 'Authority pair status', 'MOBILE/DESKTOP master slots EMPTY SELECTED PROMOTED', {
    lifecycleStatus: 'ADDED',
    introducedInVersion: 'design-workspace-feature-manifest-v1-r5f1',
  }),
  def('replace_viewport_master', 'Replace viewport master', 'Replace selection/master with lineage preserved', {
    lifecycleStatus: 'ADDED',
    introducedInVersion: 'design-workspace-feature-manifest-v1-r5f1',
  }),
  def('review_authority_pair', 'Review authority pair', 'Visual pair review when both promoted', {
    lifecycleStatus: 'ADDED',
    introducedInVersion: 'design-workspace-feature-manifest-v1-r5f1',
  }),
  def('lock_authority_pair', 'Lock authority pair', 'LOCK MOBILE + DESKTOP — no silent auto-lock', {
    lifecycleStatus: 'ADDED',
    introducedInVersion: 'design-workspace-feature-manifest-v1-r5f1',
  }),
  def('inspect_project_grounding', 'Inspect project grounding', 'Secondary grounding/provenance inspection'),
  def('inspect_blueprint', 'Inspect blueprint', 'Blueprint or NOT YET GENERATED / AWAITING LOCK'),
  def('inspect_overlay', 'Inspect overlay', 'Overlay inspection when available'),
  def('inspect_assets', 'Inspect assets', 'Canonical asset manifest — not random gallery'),
  def('inspect_function_mapping', 'Inspect function mapping', 'Host/client ownership mapping — recessed'),
  def('compiler_readiness', 'Compiler readiness', 'READY MISSING BLOCKED UNKNOWN STALE — no fake metrics'),
  def('move_to_build', 'Move to build', 'Blocked until gates pass'),
  def('technical_details', 'Technical details', 'Recessed bottom sheet / drawer'),
  def('design_history', 'Design history', 'Concepts selections promotions locks lineage'),
  def('feature_change_history', 'Feature change history', 'Immutable feature change lineage', {
    lifecycleStatus: 'ADDED',
    introducedInVersion: 'design-workspace-feature-manifest-v1-r5f1',
  }),
  def('master_amendment_status', 'Master amendment status', 'MASTER UPDATE REQUIRED when manifest stale', {
    lifecycleStatus: 'ADDED',
    introducedInVersion: 'design-workspace-feature-manifest-v1-r5f1',
  }),
  def('contextual_next_action', 'Contextual next action', 'One primary CTA from state'),
];

export const DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1 = DESIGN_WORKSPACE_FEATURE_DEFINITIONS_V1.filter(
  (f) => f.required,
).map((f) => f.featureId);
