/**
 * P0.VR.2B — Desktop/mobile implementation specs from reference.
 */

import { DESIGN_WORKSPACE_DESKTOP_SPEC } from './constants.js';
import type { DesignWorkspaceDesktopVisualSpec, DesignWorkspaceMobileVisualSpec } from './types.js';

export function getDesignWorkspaceDesktopImplementationSpec(): DesignWorkspaceDesktopVisualSpec {
  return {
    sidebarWidth: DESIGN_WORKSPACE_DESKTOP_SPEC.sidebarWidth,
    controlPanelRows: DESIGN_WORKSPACE_DESKTOP_SPEC.controlPanelRows,
    compareColumns: [...DESIGN_WORKSPACE_DESKTOP_SPEC.compareColumns],
    tabs: ['REFERENCE', 'IMPLEMENTATION', 'COMPARE', 'HISTORY', 'INSPECT'],
    defaultTab: 'COMPARE',
    missingAssetsLayout: 'table',
    footerSections: ['recentActivity', 'quickActions'],
  };
}

export function getDesignWorkspaceMobileImplementationSpec(): DesignWorkspaceMobileVisualSpec {
  return {
    headerStack: ['site00', 'project', 'breadcrumb', 'title', 'subtitle'],
    controlStack: 'vertical',
    tabs: ['REFERENCE', 'IMPLEMENTATION', 'COMPARE', 'HISTORY', 'INSPECT'],
    tabStyle: 'compact-icon-text',
    compareLayout: 'side-by-side-previews-then-score',
    missingAssetsLayout: 'cards',
  };
}
