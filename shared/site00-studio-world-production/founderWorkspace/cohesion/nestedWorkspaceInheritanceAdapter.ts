/**
 * P0.UI.2 — NestedWorkspaceInheritanceAdapter
 */

import type { NdxWorkspaceRouteEntry } from './types.js';
import { evaluateWorkspaceShellInheritance } from './shellInheritanceEvaluation.js';
import { evaluateLegacySurfaceDetection } from './legacySurfaceDetection.js';
import { evaluateRouteVisualAuthority } from './routeVisualAuthorityEvaluation.js';
import { evaluateWorkspaceNavigationCohesion } from './navigationCohesionEvaluation.js';

export type NestedInheritanceConfig = {
  inheritShell: boolean;
  inheritBackground: boolean;
  inheritAccent: boolean;
  inheritNav: boolean;
  inheritInspect: boolean;
  inheritLoadingState: boolean;
  allowFullScreenMode: boolean;
};

export const DEFAULT_NESTED_INHERITANCE: NestedInheritanceConfig = {
  inheritShell: true,
  inheritBackground: true,
  inheritAccent: true,
  inheritNav: true,
  inheritInspect: true,
  inheritLoadingState: true,
  allowFullScreenMode: false,
};

export type NestedInheritanceResult = {
  routeId: string;
  isNested: boolean;
  inherits: NestedInheritanceConfig;
  shellPassed: boolean;
  accentPassed: boolean;
  navPassed: boolean;
  legacyPassed: boolean;
  ready: boolean;
};

export function adaptNestedWorkspaceInheritance(
  route: NdxWorkspaceRouteEntry,
  config: NestedInheritanceConfig = DEFAULT_NESTED_INHERITANCE,
): NestedInheritanceResult {
  const shell = evaluateWorkspaceShellInheritance(route);
  const legacy = evaluateLegacySurfaceDetection({ ...route, limePresent: route.projectAccentSource === 'NDX_LIME' });
  const authority = evaluateRouteVisualAuthority(route);
  const nav = evaluateWorkspaceNavigationCohesion(route);

  const shellPassed = config.inheritShell ? shell.passed : true;
  const accentPassed = config.inheritAccent ? authority.failures.length === 0 : true;
  const navPassed = config.inheritNav ? nav.passed : true;
  const legacyPassed = legacy.passed;

  return {
    routeId: route.routeId,
    isNested: Boolean(route.isNested),
    inherits: config,
    shellPassed,
    accentPassed,
    navPassed,
    legacyPassed,
    ready: shellPassed && accentPassed && navPassed && legacyPassed,
  };
}

export function evaluateAllNestedRoutes(routes: NdxWorkspaceRouteEntry[]): NestedInheritanceResult[] {
  return routes.filter((r) => r.isNested).map((r) => adaptNestedWorkspaceInheritance(r));
}
