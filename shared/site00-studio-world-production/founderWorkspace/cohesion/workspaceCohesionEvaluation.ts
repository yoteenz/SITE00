/**
 * P0.UI.2 — WorkspaceCohesionEvaluation + Canonical Route Gate
 */

import type { CohesionEvaluationDimension, CohesionEvaluationResult, CohesionFailureCode, NdxWorkspaceRouteEntry } from './types.js';
import { evaluateWorkspaceShellInheritance } from './shellInheritanceEvaluation.js';
import { evaluateLegacySurfaceDetection } from './legacySurfaceDetection.js';
import { evaluateRouteVisualAuthority } from './routeVisualAuthorityEvaluation.js';
import { evaluateWorkspaceNavigationCohesion } from './navigationCohesionEvaluation.js';
import { evaluateWorkspaceTransitionCohesion } from './transitionCohesionEvaluation.js';
import { evaluateWorkspaceScrollModel } from './scrollModelEvaluation.js';
import { routePassesVisualContract } from './visualContract.js';

const DIMENSION_WEIGHTS: Record<CohesionEvaluationDimension, number> = {
  shell: 0.15,
  palette: 0.1,
  projectPresence: 0.12,
  navigation: 0.12,
  typography: 0.06,
  surfaceVocabulary: 0.1,
  spacing: 0.05,
  responsiveBehavior: 0.08,
  loadingState: 0.08,
  inspectBehavior: 0.06,
  artworkAuthority: 0.04,
  legacySurfaceDetection: 0.14,
};

function scoreFromFailures(failures: CohesionFailureCode[], weight: number): number {
  if (failures.length === 0) return 1;
  const penalty = Math.min(failures.length * 0.25, 1);
  return Math.max(0, 1 - penalty) * weight;
}

export function evaluateWorkspaceCohesion(route: NdxWorkspaceRouteEntry): CohesionEvaluationResult {
  const shell = evaluateWorkspaceShellInheritance(route);
  const legacy = evaluateLegacySurfaceDetection({ ...route, limePresent: route.projectAccentSource === 'NDX_LIME' });
  const authority = evaluateRouteVisualAuthority(route);
  const nav = evaluateWorkspaceNavigationCohesion(route);
  const transition = evaluateWorkspaceTransitionCohesion(route);
  const scroll = evaluateWorkspaceScrollModel(route);

  const allFailures = [
    ...shell.failures,
    ...legacy.failures,
    ...authority.failures,
    ...nav.failures,
    ...transition.failures,
    ...scroll.failures,
  ];

  const dimensions: Record<CohesionEvaluationDimension, number> = {
    shell: scoreFromFailures(shell.failures, 1),
    palette: route.visualGeneration === 'FOUNDER_WORKSPACE_V1' ? 1 : 0.3,
    projectPresence: route.projectAccentSource === 'NDX_LIME' ? 1 : 0.2,
    navigation: scoreFromFailures(nav.failures, 1),
    typography: route.visualGeneration === 'FOUNDER_WORKSPACE_V1' ? 1 : 0.4,
    surfaceVocabulary: scoreFromFailures(legacy.failures.filter((f) => f.includes('LEGACY') || f.includes('CARD')), 1),
    spacing: route.responsiveModel === 'DESKTOP_RAIL_MOBILE_BOTTOM' ? 1 : 0.5,
    responsiveBehavior: route.responsiveModel === 'LEGACY_DOCUMENT' ? 0.3 : 0.9,
    loadingState: route.loadingState === 'WORKSPACE_NATIVE' ? 1 : 0.2,
    inspectBehavior: route.inspectSupport ? 1 : 0.6,
    artworkAuthority: route.primarySurface.includes('asset') || route.primarySurface.includes('board') || route.primarySurface.includes('campaign') ? 1 : 0.7,
    legacySurfaceDetection: scoreFromFailures(legacy.failures, 1),
  };

  let aggregateScore = 0;
  for (const [dim, weight] of Object.entries(DIMENSION_WEIGHTS)) {
    aggregateScore += (dimensions[dim as CohesionEvaluationDimension] ?? 0) * weight;
  }

  const canonicalEligible = evaluateCanonicalRouteGate(route, allFailures);

  return {
    routeId: route.routeId,
    migrationStatus: route.migrationStatus,
    failures: [...new Set(allFailures)],
    dimensions,
    aggregateScore: Math.round(aggregateScore * 100) / 100,
    canonicalEligible,
  };
}

export function evaluateCanonicalRouteGate(
  route: NdxWorkspaceRouteEntry,
  failures: CohesionFailureCode[] = [],
): boolean {
  if (!routePassesVisualContract(route)) return false;
  if (failures.length > 0) return false;
  if (route.migrationStatus !== 'CANONICAL') return false;
  return true;
}

export function evaluateAllRoutesCohesion(routes: NdxWorkspaceRouteEntry[]): CohesionEvaluationResult[] {
  return routes.map(evaluateWorkspaceCohesion);
}

export function aggregateCohesionScore(results: CohesionEvaluationResult[]): number {
  if (results.length === 0) return 0;
  const sum = results.reduce((acc, r) => acc + r.aggregateScore, 0);
  return Math.round((sum / results.length) * 100) / 100;
}

/** VR integration — cohesion failure taxonomy for P0.VR.1B */
export const WORKSPACE_COHESION_VR_FAILURES = [
  'FAIL_LEGACY_ROUTE_SURFACE',
  'FAIL_ROUTE_WORKSPACE_INHERITANCE',
  'FAIL_ROUTE_THEME_MISMATCH',
  'FAIL_ROUTE_NAV_MISMATCH',
  'FAIL_ROUTE_LOADING_BREAK',
  'FAIL_ROUTE_RESPONSIVE_MISMATCH',
] as const;

export function mapCohesionFailuresToVr(failures: CohesionFailureCode[]): string[] {
  const vr: string[] = [];
  for (const f of failures) {
    if (f.includes('LEGACY') || f.includes('CARD') || f.includes('DOCUMENT')) {
      vr.push('FAIL_LEGACY_ROUTE_SURFACE');
    }
    if (f.includes('SHELL') || f.includes('NESTED')) {
      vr.push('FAIL_ROUTE_WORKSPACE_INHERITANCE');
    }
    if (f.includes('ACCENT') || f.includes('RED') || f.includes('LIME')) {
      vr.push('FAIL_ROUTE_THEME_MISMATCH');
    }
    if (f.includes('NAV')) {
      vr.push('FAIL_ROUTE_NAV_MISMATCH');
    }
    if (f.includes('LOADING') || f.includes('FLASH') || f.includes('SKELETON')) {
      vr.push('FAIL_ROUTE_LOADING_BREAK');
    }
    if (f.includes('SCROLL') || f.includes('WIDTH') || f.includes('RESPONSIVE')) {
      vr.push('FAIL_ROUTE_RESPONSIVE_MISMATCH');
    }
  }
  return [...new Set(vr)];
}
