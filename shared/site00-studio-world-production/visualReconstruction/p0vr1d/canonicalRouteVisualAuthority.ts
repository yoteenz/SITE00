/**
 * CanonicalRouteVisualAuthority — per-route desktop/mobile reference binding.
 */

import type {
  CanonicalRouteVisualAuthority,
  CanonicalRouteVisualStatus,
  WebVisualReferenceAuthority,
} from './types.js';
import { interpolationAllowedAfterEndpointMatch } from './desktopMobileVisualAuthority.js';

export function createCanonicalRouteVisualAuthority(input: {
  route: string;
  projectSlug: string;
  desktopRef?: WebVisualReferenceAuthority | null;
  mobileRef?: WebVisualReferenceAuthority | null;
  approvedVersion?: string | null;
}): CanonicalRouteVisualAuthority {
  const desktopRef = input.desktopRef ?? null;
  const mobileRef = input.mobileRef ?? null;
  let status: CanonicalRouteVisualStatus = 'NO_REFERENCE';
  if (desktopRef || mobileRef) status = 'REFERENCE_READY';
  return {
    route: input.route,
    projectSlug: input.projectSlug,
    desktopRef,
    mobileRef,
    approvedVersion: input.approvedVersion ?? null,
    status,
    interpolationAllowed: false,
  };
}

export function updateRouteAuthorityStatus(
  authority: CanonicalRouteVisualAuthority,
  status: CanonicalRouteVisualStatus,
): CanonicalRouteVisualAuthority {
  return { ...authority, status };
}

export function enableResponsiveInterpolation(
  authority: CanonicalRouteVisualAuthority,
  desktopMatch: boolean,
  mobileMatch: boolean,
): CanonicalRouteVisualAuthority {
  return {
    ...authority,
    interpolationAllowed: interpolationAllowedAfterEndpointMatch({ desktopMatch, mobileMatch }),
  };
}

export function websiteReconstructionSeparatedFromDesignGeneration(
  workflowMode: 'WEBSITE_RECONSTRUCTION' | 'WEBSITE_DESIGN_GENERATION',
): boolean {
  return workflowMode === 'WEBSITE_RECONSTRUCTION' || workflowMode === 'WEBSITE_DESIGN_GENERATION';
}
