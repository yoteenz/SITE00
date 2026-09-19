import { DESIGN_PAGE_V3_R3_TERRITORY_PROTOTYPES } from './constants.js';
import type { DesignPageV3TerritoryId } from './hostProjectExpressionModel.js';
/** Absolute image URL — fixes broken imgs on nested SPA routes (relative /site00 paths). */
export function normalizeDesignPageAuthorityVisualUrl(storageUrl: string, origin?: string): string {
  if (!storageUrl) return storageUrl;
  if (/^data:/i.test(storageUrl) || /^blob:/i.test(storageUrl)) return storageUrl;
  const originPrefixedData = storageUrl.match(/^https?:\/\/[^/]+\/(data:.+)$/i);
  if (originPrefixedData) return originPrefixedData[1]!;
  if (/^https?:\/\//i.test(storageUrl)) {
    try {
      const u = new URL(storageUrl);
      if (u.pathname.includes('/twin-v3-design-page-authority/') && u.pathname.endsWith('.svg')) {
        return origin ? `${origin.replace(/\/$/, '')}${u.pathname}` : u.pathname;
      }
    } catch {
      /* ignore */
    }
    return storageUrl;
  }
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

