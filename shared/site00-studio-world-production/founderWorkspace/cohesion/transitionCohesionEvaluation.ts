/**
 * P0.UI.2 — WorkspaceTransitionCohesionEvaluation
 */

import type { CohesionFailureCode, NdxWorkspaceRouteEntry } from './types.js';

export type TransitionCohesionInput = Pick<
  NdxWorkspaceRouteEntry,
  'routeId' | 'loadingState' | 'workspaceShell' | 'migrationStatus'
> & {
  whiteFlashDetected?: boolean;
  legacyShellFlash?: boolean;
  staleAccent?: boolean;
  layoutShift?: boolean;
  navDisappears?: boolean;
  duplicateShellDuringTransition?: boolean;
};

export type TransitionCohesionResult = {
  routeId: string;
  passed: boolean;
  failures: CohesionFailureCode[];
};

export function evaluateWorkspaceTransitionCohesion(route: TransitionCohesionInput): TransitionCohesionResult {
  const failures: CohesionFailureCode[] = [];

  if (route.loadingState === 'RAW_TEXT' && route.migrationStatus === 'CANONICAL') {
    failures.push('FAIL_LOADING_STATE_VISUAL_BREAK');
    failures.push('FAIL_INCONSISTENT_ROUTE_SKELETON');
  }

  if (route.whiteFlashDetected) failures.push('FAIL_WHITE_FLASH');
  if (route.legacyShellFlash) failures.push('FAIL_LEGACY_SHELL_FLASH');
  if (route.staleAccent) failures.push('FAIL_STALE_PROJECT_ACCENT');
  if (route.layoutShift) failures.push('FAIL_LAYOUT_SHIFT');
  if (route.navDisappears) failures.push('FAIL_NAV_DISAPPEARS_DURING_LOAD');
  if (route.duplicateShellDuringTransition) failures.push('FAIL_DUPLICATE_SHELL_DURING_TRANSITION');

  if (route.migrationStatus === 'CANONICAL' && route.workspaceShell !== 'FounderWorkspaceShell') {
    failures.push('FAIL_ROUTE_LOADING_BREAK');
  }

  return { routeId: route.routeId, passed: failures.length === 0, failures };
}

export function transitionPreservesWorkspace(route: TransitionCohesionInput): boolean {
  return evaluateWorkspaceTransitionCohesion(route).passed;
}
