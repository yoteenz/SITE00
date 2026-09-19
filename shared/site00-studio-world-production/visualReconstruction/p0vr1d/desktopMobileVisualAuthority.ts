/**
 * Desktop / mobile separate visual authorities — no blind geometry sharing.
 */

import type {
  DesktopVisualReferenceAuthority,
  MobileVisualReferenceAuthority,
  ResponsiveAuthorityMode,
  WebVisualReferenceAuthority,
} from './types.js';

export function createDesktopVisualAuthority(
  authority: WebVisualReferenceAuthority,
): DesktopVisualReferenceAuthority {
  return { ...authority, endpoint: 'desktop' };
}

export function createMobileVisualAuthority(
  authority: WebVisualReferenceAuthority,
): MobileVisualReferenceAuthority {
  return { ...authority, endpoint: 'mobile' };
}

export function resolveResponsiveAuthorityMode(input: {
  desktop: WebVisualReferenceAuthority | null;
  mobile: WebVisualReferenceAuthority | null;
}): ResponsiveAuthorityMode {
  if (input.desktop && input.mobile) return 'REFERENCE_LOCKED';
  return 'INFERRED_RESPONSIVE';
}

export function desktopMobileGeometryIndependent(
  desktop: DesktopVisualReferenceAuthority | null,
  mobile: MobileVisualReferenceAuthority | null,
): boolean {
  if (!desktop || !mobile) return true;
  return (
    desktop.viewportWidth !== mobile.viewportWidth ||
    desktop.viewportHeight !== mobile.viewportHeight ||
    desktop.referenceAssetId !== mobile.referenceAssetId
  );
}

export function interpolationAllowedAfterEndpointMatch(input: {
  desktopMatch: boolean;
  mobileMatch: boolean;
}): boolean {
  return input.desktopMatch && input.mobileMatch;
}

export function preserveUltrawideViewport(authority: WebVisualReferenceAuthority): boolean {
  return authority.viewportClass === 'ultrawide';
}
