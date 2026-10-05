/**
 * P0.VR.6R9 — Visual convergence guards for Evolve + self-directed screens.
 */

import { evaluatePartialVisualImplementationGuard } from '../site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/partialVisualImplementationGuard.js';
import { evaluateVisualImplementationDelta } from '../site00-studio-world-production/visualReconstruction/p0vr6/visualImplementationNoOpGuard.js';
import type { EvolveSelfDirectedScreenQARow, ScreenQARegionDrift } from './types.js';

export const DESKTOP_STRETCH_FAILURE_CODE = 'DESKTOP_MOBILE_TRANSLATION_DRIFT' as const;
export const GENERIC_CHILD_UI_FAILURE_CODE = 'PAGE_CHILD_GENERIC_UI_FALLBACK' as const;

export function evaluateNoOpGuard(beforeDeltaRatio: number, afterDeltaRatio: number) {
  return evaluateVisualImplementationDelta({
    before: { label: 'before', deltaRatio: beforeDeltaRatio },
    after: { label: 'after', deltaRatio: afterDeltaRatio },
  });
}

export function evaluatePartialOpGuard(input: {
  totalSignificantMismatches: number;
  resolvedMismatches: number;
  claimsConvergenceComplete?: boolean;
}) {
  return evaluatePartialVisualImplementationGuard({
    totalSignificantMismatches: input.totalSignificantMismatches,
    resolvedMismatches: input.resolvedMismatches,
    claimsConvergenceComplete: input.claimsConvergenceComplete ?? true,
  });
}

/** Detect desktop layouts that are mobile stacks with wider width. */
export function evaluateDesktopStretchGuard(rows: EvolveSelfDirectedScreenQARow[]): {
  pass: boolean;
  failureCode: typeof DESKTOP_STRETCH_FAILURE_CODE | null;
  flaggedScreens: string[];
} {
  const flaggedScreens: string[] = [];

  for (const row of rows) {
    const desktopDrift = row.desktop.regionDrift;
    const mobileDrift = row.mobile.regionDrift;
    const desktopMajor = desktopDrift.filter((d) => d.driftLevel === 'MAJOR').length;
    const mobileMajor = mobileDrift.filter((d) => d.driftLevel === 'MAJOR').length;

    const navDesktop = desktopDrift.find((d) => d.region === 'NAV');
    const navMobile = mobileDrift.find((d) => d.region === 'NAV');

    const looksStretched =
      navDesktop?.notes.some((n) => n.includes('BOTTOM_NAV_ON_DESKTOP')) ||
      (desktopMajor > 0 && mobileMajor === 0 && row.desktop.status !== 'VERIFIED');

    if (looksStretched) {
      flaggedScreens.push(`${row.screenId}:DESKTOP`);
    }

    if (navDesktop?.driftLevel === 'MAJOR' && navMobile?.driftLevel === 'NONE' && navDesktop.notes.length === 0) {
      if (row.screenId !== 'EVOLVE_SERVICE') {
        flaggedScreens.push(`${row.screenId}:DESKTOP_NAV`);
      }
    }
  }

  return {
    pass: flaggedScreens.length === 0,
    failureCode: flaggedScreens.length > 0 ? DESKTOP_STRETCH_FAILURE_CODE : null,
    flaggedScreens,
  };
}

export function evaluateGenericChildUiGuard(flaggedSurfaces: string[]): {
  pass: boolean;
  failureCode: typeof GENERIC_CHILD_UI_FAILURE_CODE | null;
  flaggedSurfaces: string[];
} {
  return {
    pass: flaggedSurfaces.length === 0,
    failureCode: flaggedSurfaces.length > 0 ? GENERIC_CHILD_UI_FAILURE_CODE : null,
    flaggedSurfaces,
  };
}

export function defaultRegionDrift(partial: Partial<Record<string, ScreenQARegionDrift['driftLevel']>>): ScreenQARegionDrift[] {
  const regions: ScreenQARegionDrift['region'][] = [
    'ROOT',
    'HEADER',
    'NAV',
    'PRIMARY_CONTENT',
    'SECONDARY_CONTENT',
    'CTA',
    'FOOTER',
    'CHILD_SURFACE',
  ];
  return regions.map((region) => ({
    region,
    driftLevel: partial[region] ?? 'NONE',
    notes: [],
  }));
}
