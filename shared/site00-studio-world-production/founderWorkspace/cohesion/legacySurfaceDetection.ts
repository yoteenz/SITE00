/**
 * P0.UI.2 — LegacySurfaceDetectionEvaluation
 */

import type { CohesionFailureCode, NdxWorkspaceRouteEntry } from './types.js';
import { NDX_FOUNDER_WORKSPACE_VISUAL_CONTRACT } from './visualContract.js';

export type LegacySurfaceInput = Pick<
  NdxWorkspaceRouteEntry,
  'routeId' | 'primarySurface' | 'visualGeneration' | 'legacyDependencies' | 'migrationStatus' | 'scrollModel'
> & {
  cssClasses?: string[];
  hostRedRatio?: number;
  limePresent?: boolean;
};

export type LegacySurfaceResult = {
  routeId: string;
  passed: boolean;
  failures: CohesionFailureCode[];
};

const LEGACY_SURFACE_MARKERS = new Set([
  'site00-project-lore-calibration',
  'site00-experiment-g__panel',
  'site00-label-red',
  'ProjectExperimentsHubNav',
]);

export function evaluateLegacySurfaceDetection(route: LegacySurfaceInput): LegacySurfaceResult {
  const failures: CohesionFailureCode[] = [];
  const deps = [...route.legacyDependencies, ...(route.cssClasses ?? [])];

  if (route.visualGeneration === 'LEGACY_LORE_CALIBRATION') {
    failures.push('FAIL_LEGACY_NDX_PAGE_LAYOUT');
  }

  if (route.primarySurface === 'site00-project-lore-calibration' || deps.includes('site00-project-lore-calibration')) {
    if (route.migrationStatus === 'CANONICAL') {
      failures.push('FAIL_LEGACY_NDX_PAGE_LAYOUT');
    } else if (route.migrationStatus !== 'LEGACY') {
      failures.push('FAIL_LEGACY_NDX_PAGE_LAYOUT');
    }
  }

  if (deps.some((d) => d.includes('site00-experiment-g__panel'))) {
    failures.push('FAIL_OLD_CARD_PRIMITIVE');
  }

  if (deps.includes('site00-label-red') && route.migrationStatus !== 'LEGACY') {
    failures.push('FAIL_OLD_SITE00_RED_DOMINANCE');
  }

  if (route.migrationStatus === 'CANONICAL' && route.limePresent === false) {
    failures.push('FAIL_NDX_LIME_MISSING');
  }

  if (route.hostRedRatio != null && route.hostRedRatio > 0.15 && route.migrationStatus === 'CANONICAL') {
    failures.push('FAIL_OLD_SITE00_RED_DOMINANCE');
  }

  if (route.scrollModel === 'NATIVE_DOCUMENT' && route.migrationStatus === 'CANONICAL') {
    failures.push('FAIL_ENDLESS_DOCUMENT_SCROLL');
  }

  if (route.primarySurface === 'site00-projects' && route.migrationStatus === 'CANONICAL') {
    failures.push('FAIL_GENERIC_WHITE_DOCUMENT_SURFACE');
  }

  // Intentional minimal editorial surfaces pass when using FWS panel
  if (
    route.primarySurface.startsWith('site00-fws') &&
    !deps.some((d) => LEGACY_SURFACE_MARKERS.has(d))
  ) {
    // no legacy failures from surface alone
  }

  const prohibited = NDX_FOUNDER_WORKSPACE_VISUAL_CONTRACT.surfaceVocabulary.prohibited;
  if (route.migrationStatus === 'CANONICAL' && deps.some((d) => (prohibited as readonly string[]).includes(d))) {
    failures.push('FAIL_LEGACY_NDX_PAGE_LAYOUT');
  }

  return { routeId: route.routeId, passed: failures.length === 0, failures };
}

export function detectLegacyDependencies(classNames: string[]): string[] {
  return classNames.filter((c) => LEGACY_SURFACE_MARKERS.has(c) || c.startsWith('site00-project-lore-calibration'));
}
