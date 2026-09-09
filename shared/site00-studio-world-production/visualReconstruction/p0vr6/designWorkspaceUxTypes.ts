/**
 * P0.VR.6 — Design workspace UX reconstruction (11-reference sprint).
 * Primary IA: REFERENCES · ASSETS · PAGES · SKINS · HISTORY · MORE
 */

import type { DesignViewportClass } from '../p0vr2/types.js';

export const P0_VR_6_LINEAGE = 'P0.VR.6' as const;

export const DESIGN_WORKSPACE_PRIMARY_TABS = [
  'REFERENCES',
  'ASSETS',
  'PAGES',
  'SKINS',
  'HISTORY',
  'MORE',
] as const;

export type DesignWorkspacePrimaryTab = (typeof DESIGN_WORKSPACE_PRIMARY_TABS)[number];

export const PRIMARY_TAB_LABELS: Record<DesignWorkspacePrimaryTab, string> = {
  REFERENCES: 'REFERENCES',
  ASSETS: 'ASSETS',
  PAGES: 'PAGES',
  SKINS: 'SKINS',
  HISTORY: 'HISTORY',
  MORE: 'MORE',
};

export const DESIGN_SKINS_FAILURE_CODES = [
  'DESIGN_SKINS_TAB_MISSING',
  'DESIGN_SKINS_STILL_NESTED_UNDER_MORE',
  'DESIGN_MORE_CONTENT_REGRESSION',
  'DESIGN_SKINS_MOBILE_AUTHORITY_DRIFT',
  'DESIGN_SKINS_DESKTOP_AUTHORITY_DRIFT',
  'DESIGN_SKINS_DESKTOP_STRETCHED_MOBILE',
  'DESIGN_SKINS_STATIC_SCREEN_COUNT',
  'DESIGN_SKINS_AUTHORITY_ACTION_DISCONNECTED',
  'DESIGN_SKINS_PROJECT_SCOPE_STALE',
  'DESIGN_SKINS_TYPOGRAPHY_FIREWALL_BREACH',
  'DESIGN_SKINS_REFERENCE_QA_SKIPPED',
] as const;

/** Map legacy P0.VR.2B tabs → primary tabs for URL backward compatibility. */
export const LEGACY_TAB_TO_PRIMARY: Record<string, DesignWorkspacePrimaryTab> = {
  REFERENCE: 'REFERENCES',
  IMPLEMENTATION: 'REFERENCES',
  COMPARE: 'REFERENCES',
  REVIEW: 'MORE',
  MISSING: 'MORE',
  INSPECT: 'MORE',
  PAGES: 'PAGES',
  ASSETS: 'ASSETS',
  SKINS: 'SKINS',
  EXPERIENCE_SKIN: 'SKINS',
  'EXPERIENCE SKIN': 'SKINS',
  HISTORY: 'HISTORY',
  REFERENCES: 'REFERENCES',
  MORE: 'MORE',
};

export function normalizeDesignWorkspacePrimaryTab(
  tab: string | undefined | null,
  fallback: DesignWorkspacePrimaryTab = 'ASSETS',
): DesignWorkspacePrimaryTab {
  const key = tab?.toUpperCase() ?? '';
  const mapped = LEGACY_TAB_TO_PRIMARY[key];
  if (mapped) return mapped;
  if (DESIGN_WORKSPACE_PRIMARY_TABS.includes(key as DesignWorkspacePrimaryTab)) {
    return key as DesignWorkspacePrimaryTab;
  }
  return fallback;
}

export type DesignWorkspacePrimaryUrlState = {
  project: string;
  screen: string;
  viewport: DesignViewportClass;
  tab: DesignWorkspacePrimaryTab;
  /** Optional assets pipeline step deep-link */
  assetStep?: string;
};

export const REFERENCE_FILTER_CHIPS = ['ALL', 'CANONICAL', 'RECENT', 'MOBILE', 'DESKTOP'] as const;
export type ReferenceFilterChip = (typeof REFERENCE_FILTER_CHIPS)[number];

export const PAGE_STATUS_FILTERS = [
  'ALL PAGES',
  'MISSING REF',
  'REFERENCE READY',
  'IMPLEMENTING',
  'VISUAL QA',
  'DRIFT',
  'HIGH MATCH',
  'VERIFIED',
  'BLOCKED',
] as const;
export type PageStatusFilter = (typeof PAGE_STATUS_FILTERS)[number];

export const HISTORY_FILTERS = ['ALL', 'TODAY', 'THIS WEEK', 'APPROVALS', 'REPLACEMENTS'] as const;
export type HistoryFilter = (typeof HISTORY_FILTERS)[number];

export const P0_VR_6_FAILURE_CODES = [
  'DESIGN_ACTIVITY_DOMINATES_VIEWPORT',
  'DESIGN_TEXT_DENSITY_TOO_HIGH',
  'DESIGN_ASSETS_STAGE_STACKING',
  'DESIGN_MOBILE_OVERFLOW',
  'DESIGN_TAB_VISUAL_DRIFT',
  'DESIGN_REFERENCE_LIBRARY_DRIFT',
  'DESIGN_PAGES_LAYOUT_DRIFT',
  'DESIGN_HISTORY_LAYOUT_DRIFT',
  'DESIGN_MORE_LAYOUT_DRIFT',
  'DESIGN_PROGRESSIVE_DISCLOSURE_MISSING',
  'DESIGN_ACTIVITY_NOT_COLLAPSIBLE',
  'DESIGN_QUICK_ACTIONS_NOT_COLLAPSIBLE',
  'DESIGN_REFERENCE_FIDELITY_NOT_VERIFIED',
  'REFERENCE_FIDELITY_SHELL_DRIFT',
  'REFERENCE_FIDELITY_GEOMETRY_DRIFT',
  'REFERENCE_FIDELITY_TYPOGRAPHY_DRIFT',
  'REFERENCE_FIDELITY_SPACING_DRIFT',
  'REFERENCE_FIDELITY_CARD_DRIFT',
  'REFERENCE_FIDELITY_STEPPER_DRIFT',
  'REFERENCE_FIDELITY_ASSET_DRIFT',
  'REFERENCE_FIDELITY_PAGES_DRIFT',
  'REFERENCE_FIDELITY_HISTORY_DRIFT',
  'REFERENCE_FIDELITY_MORE_DRIFT',
  'REFERENCE_FIDELITY_MOBILE_OVERFLOW',
  'REFERENCE_FIDELITY_NOT_VISUALLY_VERIFIED',
] as const;

export type P0VR6FailureCode = (typeof P0_VR_6_FAILURE_CODES)[number];

export const ASSET_PIPELINE_STEP_LABELS: Record<string, string> = {
  UPLOAD: '01 SOURCE',
  INSTRUCT: '02 INSTRUCT',
  DETECT: '03 DETECT',
  CONFIRM_CROP: '04 CROP',
  RECONSTRUCT: '05 RECONSTRUCT',
  APPROVE: '06 QA · APPROVE',
  REPLACE: '07 LIVE',
};

export const REFERENCE_ASSET_EXTENDED_STEP_LABELS: Record<string, string> = {
  SOURCE: '01 SOURCE',
  CROP: '02 CROP',
  RECONSTRUCT: '03 RECONSTRUCT',
  BACKGROUND: '04 BACKGROUND',
  QA: '05 QA',
  APPROVE: '06 APPROVE',
  LIVE: '07 LIVE',
};
