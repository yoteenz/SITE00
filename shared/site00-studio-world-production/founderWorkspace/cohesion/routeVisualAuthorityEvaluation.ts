/**
 * P0.UI.2 — RouteVisualAuthorityEvaluation (host vs project accent)
 */

import { NDX_WORKSPACE_TOKENS } from '../../../site00-brand-lore/visualReconstruction/ndxVisualReconstructionAdapter.js';
import type { CohesionFailureCode, NdxWorkspaceRouteEntry } from './types.js';

export type RouteVisualAuthorityInput = Pick<
  NdxWorkspaceRouteEntry,
  'routeId' | 'projectAccentSource' | 'migrationStatus' | 'legacyDependencies'
> & {
  accentColors?: string[];
  hostRedDominant?: boolean;
};

export type RouteVisualAuthorityResult = {
  routeId: string;
  projectPresence: boolean;
  hostCanonical: boolean;
  failures: CohesionFailureCode[];
};

const BLOCKED_ACCENT_COLORS = ['#0066cc', '#007bff', '#3b82f6', '#2563eb'];

export function evaluateRouteVisualAuthority(route: RouteVisualAuthorityInput): RouteVisualAuthorityResult {
  const failures: CohesionFailureCode[] = [];

  if (route.migrationStatus === 'CANONICAL' || route.migrationStatus === 'PARTIAL') {
    if (route.projectAccentSource === 'MISSING' || route.projectAccentSource === 'MIXED') {
      failures.push('FAIL_PROJECT_ACCENT_MISSING');
    }
    if (route.hostRedDominant) {
      failures.push('FAIL_HOST_ACCENT_LEAKAGE');
    }
  }

  if (route.legacyDependencies.includes('site00-label-red') && route.migrationStatus === 'CANONICAL') {
    failures.push('FAIL_HOST_ACCENT_LEAKAGE');
  }

  for (const color of route.accentColors ?? []) {
    if (BLOCKED_ACCENT_COLORS.includes(color.toLowerCase())) {
      failures.push('FAIL_RANDOM_ROUTE_ACCENT');
    }
    if (color.toLowerCase() === NDX_WORKSPACE_TOKENS.hostRed.toLowerCase() && route.migrationStatus === 'CANONICAL') {
      if (!route.legacyDependencies.includes('site00-label-red')) {
        // host red in non-system role
        failures.push('FAIL_PROJECT_ACCENT_BLEED');
      }
    }
  }

  return {
    routeId: route.routeId,
    projectPresence: route.projectAccentSource === 'NDX_LIME',
    hostCanonical: !failures.includes('FAIL_HOST_ACCENT_LEAKAGE'),
    failures,
  };
}

export function ndxCanonicalLime(): string {
  return NDX_WORKSPACE_TOKENS.lime;
}
