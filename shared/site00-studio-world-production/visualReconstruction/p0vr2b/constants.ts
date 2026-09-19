/**
 * P0.VR.2B — Design workspace rebuild constants.
 */

export { P0_VR_2B_LINEAGE } from './types.js';

export const SITE00_DESIGN_WORKSPACE_REFERENCE_PATH =
  '/visual-references/founder/site00/design-workspace-reference-p0vr2b.jpg';

export const SITE00_DESIGN_WORKSPACE_AUTHORITY_ID = 'SITE00_DESIGN_WORKSPACE_VISUAL_AUTHORITY' as const;

export const P0_VR_2B_FAILURE_CODES = [
  'FAIL_DESIGN_WORKSPACE_OLD_SHELL_PRESERVED',
  'FAIL_DESIGN_REFERENCE_NOT_FULL_WORKSPACE_AUTHORITY',
  'FAIL_SITE00_HOST_SHELL_NOT_USED',
  'FAIL_NDX_PROJECT_SHELL_USED_AS_HOST',
  'FAIL_DESIGN_DESKTOP_SIDEBAR_DRIFT',
  'FAIL_DESIGN_CONTROL_PANEL_GEOMETRY_DRIFT',
  'FAIL_COMPARE_LAYOUT_DRIFT',
  'FAIL_VISUAL_SCORE_PANEL_DRIFT',
  'FAIL_MISSING_ASSET_TABLE_DRIFT',
  'FAIL_MOBILE_CONTROL_STACK_DRIFT',
  'FAIL_MOBILE_COMPARE_DRIFT',
  'FAIL_SCREEN_MATRIX_DOMINATES_PRIMARY_WORKFLOW',
  'FAIL_TECHNICAL_INSPECT_DATA_EXPOSED_PRIMARY',
  'FAIL_DESKTOP_MOBILE_AUTHORITY_CONFLATED',
  'FAIL_OLD_DESIGN_LOADING_FLASH',
] as const;

export const SITE00_DESIGN_NAV_ITEMS = [
  { id: 'design', label: 'DESIGN', href: '/projects/site00/design', active: true },
  { id: 'projects', label: 'PROJECTS', href: '/projects' },
  { id: 'blueprints', label: 'BLUEPRINTS', href: '/blueprints' },
  { id: 'asset-vault', label: 'ASSET VAULT', href: '/assts' },
  { id: 'system', label: 'SYSTEM', href: '/control' },
  { id: 'guide', label: 'GUIDE', href: '/guide' },
  { id: 'sound', label: 'SOUND', href: '/sound' },
  { id: 'about', label: 'ABOUT', href: '/about' },
  { id: 'faq', label: 'FAQ', href: '/faq' },
  { id: 'contact', label: 'CONTACT', href: '/contact' },
] as const;

export const DESIGN_WORKSPACE_DESKTOP_SPEC = {
  sidebarWidth: 220,
  controlPanelRows: 2 as const,
  compareColumns: ['reference', 'implementation', 'visualMatch'] as const,
  defaultTab: 'COMPARE' as const,
};

export const DESIGN_WORKSPACE_MOBILE_SPEC = {
  compactTabBar: true,
  defaultTab: 'COMPARE' as const,
};

export const DESIGN_WORKSPACE_SUBTITLE =
  'REFERENCE IS DESIGN AUTHORITY. KEEP THE FUNCTION. REBUILD THE LOOK.';
