/**
 * P0.UI.2 — WorkspaceNavigationCohesionEvaluation
 */

import type { CohesionFailureCode, NdxWorkspaceRouteEntry } from './types.js';

export type NavigationCohesionInput = Pick<
  NdxWorkspaceRouteEntry,
  'routeId' | 'localNav' | 'workspaceShell' | 'migrationStatus' | 'visualGeneration'
>;

export type NavigationCohesionResult = {
  routeId: string;
  passed: boolean;
  failures: CohesionFailureCode[];
};

export function evaluateWorkspaceNavigationCohesion(route: NavigationCohesionInput): NavigationCohesionResult {
  const failures: CohesionFailureCode[] = [];

  if (route.migrationStatus === 'CANONICAL') {
    if (route.localNav !== 'WORKSPACE_RAIL') {
      failures.push('FAIL_NAV_VISUAL_GENERATION_MISMATCH');
    }
    if (route.localNav === 'ProjectExperimentsHubNav' || route.localNav === 'DUPLICATE') {
      failures.push('FAIL_DUPLICATE_LOCAL_NAV');
      failures.push('FAIL_MULTIPLE_PRIMARY_NAVS');
    }
  }

  if (route.migrationStatus === 'PARTIAL' && route.localNav === 'DUPLICATE') {
    failures.push('FAIL_DUPLICATE_LOCAL_NAV');
  }

  if (route.migrationStatus === 'LEGACY' && route.localNav === 'ProjectExperimentsHubNav') {
    failures.push('FAIL_LEGACY_BLUE_LINK_NAV');
    failures.push('FAIL_NAV_VISUAL_GENERATION_MISMATCH');
  }

  if (route.visualGeneration === 'LEGACY_LORE_CALIBRATION' && route.workspaceShell === 'FounderWorkspaceShell') {
    failures.push('FAIL_NAV_ROUTE_STATE_MISMATCH');
  }

  return { routeId: route.routeId, passed: failures.length === 0, failures };
}
