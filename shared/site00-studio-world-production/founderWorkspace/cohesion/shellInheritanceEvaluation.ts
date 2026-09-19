/**
 * P0.UI.2 — WorkspaceShellInheritanceEvaluation
 */

import type { CohesionFailureCode, NdxWorkspaceRouteEntry } from './types.js';

export type ShellInheritanceInput = Pick<
  NdxWorkspaceRouteEntry,
  'routeId' | 'workspaceShell' | 'parentLayout' | 'localNav' | 'migrationStatus' | 'isNested'
>;

export type ShellInheritanceResult = {
  routeId: string;
  passed: boolean;
  failures: CohesionFailureCode[];
};

export function evaluateWorkspaceShellInheritance(route: ShellInheritanceInput): ShellInheritanceResult {
  const failures: CohesionFailureCode[] = [];

  if (route.migrationStatus === 'CANONICAL' || route.migrationStatus === 'PARTIAL') {
    if (route.workspaceShell === 'EcosystemShell' || route.workspaceShell === 'NONE') {
      failures.push('FAIL_MISSING_FOUNDER_WORKSPACE_SHELL');
    }
    if (route.workspaceShell === 'CONDITIONAL') {
      failures.push('FAIL_ROUTE_SHELL_INCONSISTENCY');
    }
    if (route.localNav === 'DUPLICATE') {
      failures.push('FAIL_DUPLICATE_WORKSPACE_SHELL');
    }
  }

  if (route.migrationStatus === 'LEGACY' && route.isNested) {
    failures.push('FAIL_NESTED_ROUTE_ESCAPES_SHELL');
    failures.push('FAIL_LEGACY_PAGE_OUTSIDE_WORKSPACE');
  }

  if (route.localNav === 'DUPLICATE') {
    failures.push('FAIL_DUPLICATE_LOCAL_NAV');
  }

  return { routeId: route.routeId, passed: failures.length === 0, failures };
}

export function evaluateAllShellInheritance(routes: ShellInheritanceInput[]): ShellInheritanceResult[] {
  return routes.map(evaluateWorkspaceShellInheritance);
}
