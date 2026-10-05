/**
 * P0.VR.8-SRF — Template drift + composition cloning detectors.
 */

import type { ScreenReplicationDifference } from './types.js';

export const GENERIC_PROJECT_OVERVIEW_MARKERS = [
  'site00-pov',
  'site00-pov-hero',
  'site00-pov-signals',
  'site00-pov-tactical',
] as const;

export const AUTHORITY_OVERVIEW_MARKERS = [
  'site00-fws-mobile-overview',
  'site00-fws-hub-kpis--mobile',
  'site00-fws-hub-carousel--mobile-row',
  'site00-fws-mobile-shell-screen--overview',
] as const;

export function detectTemplateDrift(liveDomMarkers: string[]): {
  templateDrift: boolean;
  differences: ScreenReplicationDifference[];
} {
  const usesGeneric = GENERIC_PROJECT_OVERVIEW_MARKERS.every((m) => liveDomMarkers.includes(m));
  const usesAuthority = AUTHORITY_OVERVIEW_MARKERS.some((m) => liveDomMarkers.includes(m));

  if (usesGeneric && !usesAuthority) {
    return {
      templateDrift: true,
      differences: [
        {
          differenceId: 'template-drift-generic-pov',
          regionId: null,
          differenceClass: 'TEMPLATE_DRIFT',
          severity: 'BLOCKING',
          description: 'Generic site00-pov template composition detected instead of authority layout',
          masked: false,
        },
      ],
    };
  }

  return { templateDrift: false, differences: [] };
}

export function detectCompositionCloning(input: {
  authorityA: string;
  authorityB: string;
  domFingerprintA: string;
  domFingerprintB: string;
}): ScreenReplicationDifference | null {
  if (input.authorityA === input.authorityB) return null;
  if (input.domFingerprintA !== input.domFingerprintB) return null;
  return {
    differenceId: 'composition-cloning',
    regionId: null,
    differenceClass: 'COMPOSITION_CLONING',
    severity: 'BLOCKING',
    description: 'Different authorities share identical DOM composition fingerprint',
    masked: false,
  };
}

export function wholePageImageCheatDetected(liveDomMarkers: string[]): boolean {
  return liveDomMarkers.includes('data-whole-page-image-cheat') || liveDomMarkers.includes('site00-srf-image-cheat');
}
