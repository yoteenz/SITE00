/**
 * P0.VR.1D.7 — Reference scope awareness constants.
 */

export const P0_VR_1D7_LINEAGE = 'P0.VR.1D.7' as const;

export const P0_VR_1D7_REUSED_LINEAGE = [
  'P0.VR.1D',
  'P0.VR.1D.1',
  'P0.VR.1D.2',
  'P0.VR.1D.4',
  'P0.VR.1D.4A',
] as const;

export const VISUAL_REFERENCE_SCOPE_FAILURE_CODES = [
  'FAIL_REFERENCE_SCOPE_UNCLASSIFIED',
  'FAIL_PANEL_REFERENCE_USED_AS_FULL_ROUTE_AUTHORITY',
  'FAIL_MODULE_REFERENCE_USED_AS_FULL_SCREEN',
  'FAIL_FULL_SCREEN_REFERENCE_USED_AS_COMPONENT_ONLY',
  'FAIL_SCOPE_TARGET_MISSING',
  'FAIL_SCOPED_DOM_ROOT_MISSING',
  'FAIL_SCOPED_RENDER_CAPTURE_FAILED',
  'FAIL_SCOPE_MISMATCH_COMPARISON',
  'FAIL_INVALID_VISUAL_SCORE_SCOPE',
] as const;

export type VisualReferenceScopeFailureCode = (typeof VISUAL_REFERENCE_SCOPE_FAILURE_CODES)[number];

export const INVALID_SCOPE_COMPARISON_MARKER = 'INVALID_SCOPE_COMPARISON' as const;

export const NDX_DESKTOP_COMPOSITE_ROUTE = '/projects/ndxbook' as const;

export const NDX_DESKTOP_SCOPE_ROOTS = {
  overview: 'ndx.desktop.overview',
  campaignBoardPanel: 'ndx.desktop.campaign-board-panel',
  experimentPanel: 'ndx.desktop.experiment-panel',
  contentOpsPanel: 'ndx.desktop.content-ops-panel',
  culturalIntelligencePanel: 'ndx.desktop.cultural-intelligence-panel',
  characterLabPanel: 'ndx.desktop.character-lab-panel',
} as const;
