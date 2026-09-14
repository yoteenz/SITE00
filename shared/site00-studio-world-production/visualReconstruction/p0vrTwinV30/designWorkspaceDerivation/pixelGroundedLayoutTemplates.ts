/**
 * Fractional layout templates for NDXBOOK design workspace authority mockups.
 * Scaled to measured JPG dimensions — not skeleton band defaults.
 */

import type { DetectedVisualCandidate } from './pixelGroundedTypes.js';

type TemplateSpec = Omit<DetectedVisualCandidate, 'candidateId'> & {
  key: string;
  featureId?: string;
  parentKey?: string;
};

/** Implementation-relevant objects visible in founder-approved workspace mockups. */
export const NDXBOOK_AUTHORITY_OBJECT_TEMPLATE: TemplateSpec[] = [
  { key: 'host-shell', category: 'SURFACE', importance: 'CRITICAL', nx: 0, ny: 0, nw: 1, nh: 0.06 },
  { key: 'host-brand', category: 'TEXT', importance: 'HIGH', nx: 0.02, ny: 0.008, nw: 0.2, nh: 0.025, parentKey: 'host-shell', featureId: 'design_workspace_context' },
  { key: 'host-nav-references', category: 'NAV_ITEM', importance: 'HIGH', nx: 0.22, ny: 0.01, nw: 0.1, nh: 0.022, parentKey: 'host-shell', featureId: 'design_workspace_navigation' },
  { key: 'host-nav-assets', category: 'NAV_ITEM', importance: 'MEDIUM', nx: 0.33, ny: 0.01, nw: 0.08, nh: 0.022, parentKey: 'host-shell' },
  { key: 'host-nav-pages', category: 'NAV_ITEM', importance: 'MEDIUM', nx: 0.41, ny: 0.01, nw: 0.08, nh: 0.022, parentKey: 'host-shell' },
  { key: 'host-nav-skins', category: 'NAV_ITEM', importance: 'MEDIUM', nx: 0.49, ny: 0.01, nw: 0.08, nh: 0.022, parentKey: 'host-shell' },
  { key: 'host-status-compiler', category: 'STATUS', importance: 'HIGH', nx: 0.72, ny: 0.008, nw: 0.22, nh: 0.028, parentKey: 'host-shell', featureId: 'compiler_readiness' },
  { key: 'context-strip', category: 'SURFACE', importance: 'HIGH', nx: 0, ny: 0.06, nw: 1, nh: 0.05 },
  { key: 'context-project-label', category: 'TEXT', importance: 'HIGH', nx: 0.02, ny: 0.065, nw: 0.25, nh: 0.02, parentKey: 'context-strip', featureId: 'active_design_target' },
  { key: 'context-viewport-mobile', category: 'CONTROL', importance: 'HIGH', nx: 0.55, ny: 0.068, nw: 0.08, nh: 0.025, parentKey: 'context-strip', featureId: 'viewport_control' },
  { key: 'context-viewport-tablet', category: 'CONTROL', importance: 'MEDIUM', nx: 0.64, ny: 0.068, nw: 0.08, nh: 0.025, parentKey: 'context-strip' },
  { key: 'context-viewport-desktop', category: 'CONTROL', importance: 'MEDIUM', nx: 0.73, ny: 0.068, nw: 0.08, nh: 0.025, parentKey: 'context-strip' },
  { key: 'context-stage-badge', category: 'BADGE', importance: 'MEDIUM', nx: 0.82, ny: 0.068, nw: 0.15, nh: 0.025, parentKey: 'context-strip' },
  { key: 'primary-workspace', category: 'PANEL', importance: 'CRITICAL', nx: 0.02, ny: 0.12, nw: 0.96, nh: 0.42 },
  { key: 'dominant-artifact-frame', category: 'ARTIFACT', importance: 'CRITICAL', nx: 0.04, ny: 0.14, nw: 0.55, nh: 0.32, parentKey: 'primary-workspace', featureId: 'inspect_candidate' },
  { key: 'dominant-artifact-image', category: 'IMAGE', importance: 'CRITICAL', nx: 0.05, ny: 0.16, nw: 0.52, nh: 0.26, parentKey: 'dominant-artifact-frame' },
  { key: 'dominant-headline', category: 'TEXT', importance: 'CRITICAL', nx: 0.06, ny: 0.17, nw: 0.4, nh: 0.08, parentKey: 'dominant-artifact-frame' },
  { key: 'dominant-subcopy', category: 'TEXT', importance: 'HIGH', nx: 0.06, ny: 0.26, nw: 0.35, nh: 0.05, parentKey: 'dominant-artifact-frame' },
  { key: 'authority-side-panel', category: 'PANEL', importance: 'HIGH', nx: 0.62, ny: 0.14, nw: 0.34, nh: 0.32, parentKey: 'primary-workspace', featureId: 'authority_pair_status' },
  { key: 'select-mobile-btn', category: 'BUTTON', importance: 'HIGH', nx: 0.64, ny: 0.16, nw: 0.14, nh: 0.035, parentKey: 'authority-side-panel', featureId: 'select_mobile_master_candidate' },
  { key: 'select-desktop-btn', category: 'BUTTON', importance: 'HIGH', nx: 0.8, ny: 0.16, nw: 0.14, nh: 0.035, parentKey: 'authority-side-panel', featureId: 'select_desktop_master_candidate' },
  { key: 'promote-mobile-btn', category: 'BUTTON', importance: 'HIGH', nx: 0.64, ny: 0.2, nw: 0.14, nh: 0.035, parentKey: 'authority-side-panel', featureId: 'promote_mobile_viewport_master' },
  { key: 'promote-desktop-btn', category: 'BUTTON', importance: 'HIGH', nx: 0.8, ny: 0.2, nw: 0.14, nh: 0.035, parentKey: 'authority-side-panel', featureId: 'promote_desktop_viewport_master' },
  { key: 'pair-review-btn', category: 'BUTTON', importance: 'MEDIUM', nx: 0.64, ny: 0.24, nw: 0.3, nh: 0.035, parentKey: 'authority-side-panel', featureId: 'review_authority_pair' },
  { key: 'lock-pair-btn', category: 'BUTTON', importance: 'HIGH', nx: 0.64, ny: 0.28, nw: 0.3, nh: 0.04, parentKey: 'authority-side-panel', featureId: 'lock_authority_pair' },
  { key: 'gallery-strip', category: 'PANEL', importance: 'HIGH', nx: 0.04, ny: 0.48, nw: 0.92, nh: 0.1, featureId: 'concept_candidate_gallery' },
  { key: 'gallery-thumb-1', category: 'THUMBNAIL', importance: 'MEDIUM', nx: 0.05, ny: 0.49, nw: 0.12, nh: 0.07, parentKey: 'gallery-strip' },
  { key: 'gallery-thumb-2', category: 'THUMBNAIL', importance: 'MEDIUM', nx: 0.19, ny: 0.49, nw: 0.12, nh: 0.07, parentKey: 'gallery-strip' },
  { key: 'gallery-thumb-3', category: 'THUMBNAIL', importance: 'MEDIUM', nx: 0.33, ny: 0.49, nw: 0.12, nh: 0.07, parentKey: 'gallery-strip' },
  { key: 'gallery-thumb-4', category: 'THUMBNAIL', importance: 'MEDIUM', nx: 0.47, ny: 0.49, nw: 0.12, nh: 0.07, parentKey: 'gallery-strip' },
  { key: 'decision-bar', category: 'PANEL', importance: 'HIGH', nx: 0.02, ny: 0.6, nw: 0.96, nh: 0.08 },
  { key: 'refine-btn', category: 'BUTTON', importance: 'MEDIUM', nx: 0.04, ny: 0.615, nw: 0.14, nh: 0.04, parentKey: 'decision-bar', featureId: 'refine_concept' },
  { key: 'regen-btn', category: 'BUTTON', importance: 'MEDIUM', nx: 0.2, ny: 0.615, nw: 0.16, nh: 0.04, parentKey: 'decision-bar', featureId: 'regenerate_concept' },
  { key: 'inspect-btn', category: 'BUTTON', importance: 'MEDIUM', nx: 0.38, ny: 0.615, nw: 0.14, nh: 0.04, parentKey: 'decision-bar', featureId: 'inspect_candidate' },
  { key: 'primary-next-action', category: 'BUTTON', importance: 'CRITICAL', nx: 0.62, ny: 0.612, nw: 0.32, nh: 0.05, parentKey: 'decision-bar', featureId: 'contextual_next_action' },
  { key: 'structured-output', category: 'PANEL', importance: 'HIGH', nx: 0.02, ny: 0.7, nw: 0.96, nh: 0.12 },
  { key: 'grounding-card', category: 'ARTIFACT', importance: 'MEDIUM', nx: 0.03, ny: 0.715, nw: 0.17, nh: 0.09, parentKey: 'structured-output', featureId: 'inspect_project_grounding' },
  { key: 'blueprint-card', category: 'ARTIFACT', importance: 'MEDIUM', nx: 0.22, ny: 0.715, nw: 0.17, nh: 0.09, parentKey: 'structured-output', featureId: 'inspect_blueprint' },
  { key: 'overlay-card', category: 'ARTIFACT', importance: 'MEDIUM', nx: 0.41, ny: 0.715, nw: 0.17, nh: 0.09, parentKey: 'structured-output', featureId: 'inspect_overlay' },
  { key: 'assets-card', category: 'ARTIFACT', importance: 'MEDIUM', nx: 0.6, ny: 0.715, nw: 0.17, nh: 0.09, parentKey: 'structured-output', featureId: 'inspect_assets' },
  { key: 'function-card', category: 'ARTIFACT', importance: 'MEDIUM', nx: 0.79, ny: 0.715, nw: 0.17, nh: 0.09, parentKey: 'structured-output', featureId: 'inspect_function_mapping' },
  { key: 'readiness-panel', category: 'PANEL', importance: 'HIGH', nx: 0.02, ny: 0.84, nw: 0.96, nh: 0.1, featureId: 'compiler_readiness' },
  { key: 'readiness-gauge', category: 'PROGRESS', importance: 'HIGH', nx: 0.04, ny: 0.855, nw: 0.12, nh: 0.06, parentKey: 'readiness-panel' },
  { key: 'readiness-checklist', category: 'TEXT', importance: 'MEDIUM', nx: 0.18, ny: 0.855, nw: 0.4, nh: 0.06, parentKey: 'readiness-panel' },
  { key: 'technical-details-trigger', category: 'BUTTON', importance: 'MEDIUM', nx: 0.78, ny: 0.86, nw: 0.18, nh: 0.04, parentKey: 'readiness-panel', featureId: 'technical_details' },
  { key: 'history-access', category: 'CONTROL', importance: 'LOW', nx: 0.02, ny: 0.95, nw: 0.2, nh: 0.03, featureId: 'design_history' },
  { key: 'feature-history-access', category: 'CONTROL', importance: 'LOW', nx: 0.24, ny: 0.95, nw: 0.22, nh: 0.03, featureId: 'feature_change_history' },
  { key: 'master-amendment-badge', category: 'BADGE', importance: 'MEDIUM', nx: 0.48, ny: 0.95, nw: 0.2, nh: 0.03, featureId: 'master_amendment_status' },
  { key: 'divider-host-context', category: 'BORDER', importance: 'LOW', nx: 0.02, ny: 0.112, nw: 0.96, nh: 0.002 },
  { key: 'divider-workspace-gallery', category: 'BORDER', importance: 'LOW', nx: 0.04, ny: 0.47, nw: 0.92, nh: 0.002 },
];

export function expandTemplateCandidates(viewport: 'MOBILE' | 'DESKTOP'): DetectedVisualCandidate[] {
  const xShift = viewport === 'MOBILE' ? 0 : 0;
  const widthScale = viewport === 'MOBILE' ? 1 : 1;
  return NDXBOOK_AUTHORITY_OBJECT_TEMPLATE.map((t) => ({
    candidateId: `${viewport.toLowerCase()}-${t.key}`,
    category: t.category,
    importance: t.importance,
    nx: Math.min(0.98, t.nx * widthScale + xShift),
    ny: t.ny,
    nw: t.nw,
    nh: t.nh,
  }));
}
