/**
 * P0.VR.2B — Design workspace full-screen reference rebuild types.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';

export const P0_VR_2B_LINEAGE = 'P0.VR.2B' as const;

export const DESIGN_WORKSPACE_TABS = [
  'REFERENCE',
  'IMPLEMENTATION',
  'COMPARE',
  'PAGES',
  'REVIEW',
  'HISTORY',
  'INSPECT',
] as const;

export type DesignWorkspaceTab = (typeof DESIGN_WORKSPACE_TABS)[number];

export const MOBILE_TAB_LABELS: Record<DesignWorkspaceTab, string> = {
  REFERENCE: 'REF',
  IMPLEMENTATION: 'IMPL',
  COMPARE: 'COMPARE',
  PAGES: 'PAGES',
  REVIEW: 'REV',
  HISTORY: 'HIST',
  INSPECT: 'INSP',
};

export type Site00DesignWorkspaceVisualAuthority = {
  authorityId: 'SITE00_DESIGN_WORKSPACE_VISUAL_AUTHORITY';
  scope: 'FULL_WORKSPACE_REFERENCE';
  storagePath: string;
  desktopViewport: { width: number; height: number };
  mobileViewport: { width: number; height: number };
  lineage: typeof P0_VR_2B_LINEAGE;
};

export type DesignWorkspaceDesktopVisualSpec = {
  sidebarWidth: number;
  controlPanelRows: 2;
  compareColumns: ['reference', 'implementation', 'visualMatch'];
  tabs: DesignWorkspaceTab[];
  defaultTab: 'COMPARE';
  missingAssetsLayout: 'table';
  footerSections: ['recentActivity', 'quickActions'];
};

export type DesignWorkspaceMobileVisualSpec = {
  headerStack: ['site00', 'project', 'breadcrumb', 'title', 'subtitle'];
  controlStack: 'vertical';
  tabs: DesignWorkspaceTab[];
  tabStyle: 'compact-icon-text';
  compareLayout: 'side-by-side-previews-then-score';
  missingAssetsLayout: 'cards';
};

export type VisualMatchBreakdown = {
  shell: number;
  layout: number;
  typography: number;
  spacing: number;
  assets: number;
  borders: number;
};

export type VisualMatchResult = {
  overall: number;
  statusLabel: string;
  summary: string;
  breakdown: VisualMatchBreakdown;
  deltaHighlights: string[];
};

export type DesignWorkspaceActivityEntry = {
  id: string;
  label: string;
  timestamp: string;
  actor: string;
  status: string;
};

export type DesignWorkspaceQuickAction = {
  id: string;
  title: string;
  subtitle: string;
  href?: string;
  onClick?: string;
};

export type DesignWorkspaceUrlState = {
  project: string;
  screen: string;
  viewport: DesignViewportClass;
  tab: DesignWorkspaceTab;
};

export type P0VR2BFailureCode =
  | 'FAIL_DESIGN_WORKSPACE_OLD_SHELL_PRESERVED'
  | 'FAIL_DESIGN_REFERENCE_NOT_FULL_WORKSPACE_AUTHORITY'
  | 'FAIL_SITE00_HOST_SHELL_NOT_USED'
  | 'FAIL_NDX_PROJECT_SHELL_USED_AS_HOST'
  | 'FAIL_DESIGN_DESKTOP_SIDEBAR_DRIFT'
  | 'FAIL_DESIGN_CONTROL_PANEL_GEOMETRY_DRIFT'
  | 'FAIL_COMPARE_LAYOUT_DRIFT'
  | 'FAIL_VISUAL_SCORE_PANEL_DRIFT'
  | 'FAIL_MISSING_ASSET_TABLE_DRIFT'
  | 'FAIL_MOBILE_CONTROL_STACK_DRIFT'
  | 'FAIL_MOBILE_COMPARE_DRIFT'
  | 'FAIL_SCREEN_MATRIX_DOMINATES_PRIMARY_WORKFLOW'
  | 'FAIL_TECHNICAL_INSPECT_DATA_EXPOSED_PRIMARY'
  | 'FAIL_DESKTOP_MOBILE_AUTHORITY_CONFLATED'
  | 'FAIL_OLD_DESIGN_LOADING_FLASH';
