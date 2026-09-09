/**
 * Approved canonical SKINS asset bindings — separate from source crops.
 */

import type { SkinsAssetSlot, SkinsViewportClass } from './skinsReferenceFidelity.js';

export type SkinsCanonicalBinding = {
  viewport: SkinsViewportClass;
  assetSlot: SkinsAssetSlot;
  canonicalAssetId: string;
  canonicalUrl: string;
  bindingId: string;
  provider: string;
  model: string;
  approvalStatus: 'LOVE_IT';
  qaStatus: 'PASS';
  reconstructedAt: string;
};

/** Founder-approved canonical bindings (distinct from sourceCropUrl). */
export const SKINS_APPROVED_CANONICAL_BINDINGS: SkinsCanonicalBinding[] = [
  {
    viewport: 'MOBILE',
    assetSlot: 'BRAND_FAMILY_NDXBOOK',
    canonicalAssetId: 'can-ndxbook-mobile-v1',
    canonicalUrl: '/site00/skins/canonical/mobile/brand_family_ndxbook.webp',
    bindingId: 'bind-ndxbook-mobile-family-thumb-v1',
    provider: 'fal',
    model: 'openai/gpt-image-2/edit',
    approvalStatus: 'LOVE_IT',
    qaStatus: 'PASS',
    reconstructedAt: '2026-09-09T14:20:00.000Z',
  },
];

export function getSkinsCanonicalBinding(
  viewport: SkinsViewportClass,
  assetSlot: SkinsAssetSlot,
): SkinsCanonicalBinding | null {
  return (
    SKINS_APPROVED_CANONICAL_BINDINGS.find((b) => b.viewport === viewport && b.assetSlot === assetSlot) ?? null
  );
}

export function approvedVisualAssetExists(viewport: SkinsViewportClass, assetSlot: SkinsAssetSlot): boolean {
  return Boolean(getSkinsCanonicalBinding(viewport, assetSlot));
}
