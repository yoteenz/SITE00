/**
 * P0.VR.7 — Multi-viewport reference authority.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import type { ReferenceViewportAuthority } from './types.js';

export function mergeViewportAuthorities(
  existing: ReferenceViewportAuthority[],
  incoming: ReferenceViewportAuthority,
): ReferenceViewportAuthority[] {
  const filtered = existing.filter((v) => v.viewport !== incoming.viewport);
  return [...filtered, incoming];
}

export function getViewportAuthority(
  authorities: ReferenceViewportAuthority[],
  viewport: DesignViewportClass,
): ReferenceViewportAuthority | null {
  return authorities.find((a) => a.viewport === viewport) ?? null;
}

export function inferMissingViewportAuthority(
  supplied: DesignViewportClass[],
  target: DesignViewportClass,
): ReferenceViewportAuthority | null {
  if (supplied.includes(target)) return null;
  const mobile = supplied.includes('mobile');
  if (!mobile) return null;
  return {
    viewport: target,
    referenceId: `inferred-${target}`,
    authorityStatus: 'INFERRED',
    geometryProfile: {
      referenceWidth: target === 'desktop' ? 1280 : 768,
      referenceHeight: target === 'desktop' ? 900 : 1024,
      contentWidth: target === 'desktop' ? 1200 : 720,
      contentX: 16,
      contentY: 120,
      topMargin: 12,
      bottomMargin: 12,
      leftMargin: 16,
      rightMargin: 16,
      headerHeight: 64,
      heroHeight: 96,
      primaryNavY: 48,
      contentStartY: 160,
      footerY: 800,
      bottomNavHeight: 0,
      normalized: {
        contentWidthRatio: 0.92,
        headerHeightRatio: 0.08,
        heroHeightRatio: 0.11,
        bottomNavHeightRatio: 0,
      },
    },
    assetManifest: [],
  };
}

export function desktopAndMobileAreIndependentAuthorities(
  authorities: ReferenceViewportAuthority[],
): boolean {
  const mobile = authorities.find((a) => a.viewport === 'mobile' && a.authorityStatus === 'EXACT');
  const desktop = authorities.find((a) => a.viewport === 'desktop' && a.authorityStatus === 'EXACT');
  return Boolean(mobile && desktop);
}
