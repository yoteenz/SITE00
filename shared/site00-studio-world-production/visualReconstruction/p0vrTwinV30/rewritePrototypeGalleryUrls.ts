import { DESIGN_PAGE_V3_R3_TERRITORY_PROTOTYPES } from './constants.js';
import type { DesignPageV3TerritoryId } from './hostProjectExpressionModel.js';
import type { DesignPageAuthorityReviewSession } from './types.js';
import { normalizeDesignPageAuthoritySession } from './designPageAuthorityTerritoryGallery.js';

/** Absolute image URL — fixes broken imgs on nested SPA routes (relative /site00 paths). */
export function normalizeDesignPageAuthorityVisualUrl(storageUrl: string, origin?: string): string {
  if (!storageUrl) return storageUrl;
  if (/^https?:\/\//i.test(storageUrl)) return storageUrl;
  const path = storageUrl.startsWith('/') ? storageUrl : `/${storageUrl.replace(/^\/+/, '')}`;
  if (origin) return `${origin.replace(/\/$/, '')}${path}`;
  return path;
}

export function isPublicPrototypeAuthorityPath(storageUrl: string): boolean {
  return storageUrl.includes('/twin-v3-design-page-authority/') && storageUrl.includes('.svg');
}

export function canonicalPublicPrototypePath(
  territoryId: DesignPageV3TerritoryId,
  viewport: 'mobile' | 'desktop',
): string {
  return DESIGN_PAGE_V3_R3_TERRITORY_PROTOTYPES[territoryId][viewport];
}

/** Replace /public prototype paths with browser-resolved bundled URLs. */
export function rewritePrototypeGalleryUrls(
  session: DesignPageAuthorityReviewSession,
  urls: Record<DesignPageV3TerritoryId, { mobile: string; desktop: string }>,
): DesignPageAuthorityReviewSession {
  const territoryGallery = { ...session.territoryGallery };
  for (const id of ['A', 'B', 'C'] as const) {
    territoryGallery[id] = territoryGallery[id].map((candidate) => {
      if (!candidate.mobile.representativePrototype) return candidate;
      const map = urls[id];
      return {
        ...candidate,
        mobile: { ...candidate.mobile, storageUrl: map.mobile },
        desktop: { ...candidate.desktop, storageUrl: map.desktop },
      };
    });
  }
  let lastResult = session.lastResult;
  if (lastResult?.territories?.length) {
    lastResult = {
      ...lastResult,
      territories: lastResult.territories.map((t) => {
        const map = urls[t.territoryId];
        const mobileProto = t.mobile.representativePrototype;
        const desktopProto = t.desktop.representativePrototype;
        if (!mobileProto && !desktopProto) return t;
        return {
          ...t,
          mobile: mobileProto ? { ...t.mobile, storageUrl: map.mobile } : t.mobile,
          desktop: desktopProto ? { ...t.desktop, storageUrl: map.desktop } : t.desktop,
        };
      }),
    };
  }
  return normalizeDesignPageAuthoritySession({
    ...session,
    territoryGallery,
    lastResult,
  });
}
