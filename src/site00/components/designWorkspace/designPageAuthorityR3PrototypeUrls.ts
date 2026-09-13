/**
 * Vite-resolved URLs for Twin V3 authority SVG prototypes (always in deploy bundle).
 */

import desktopTerritoryA from '../../assets/twin-v3-design-page-authority/desktop-territory-a-r3.svg?url';
import desktopTerritoryB from '../../assets/twin-v3-design-page-authority/desktop-territory-b-r3.svg?url';
import desktopTerritoryC from '../../assets/twin-v3-design-page-authority/desktop-territory-c-r3.svg?url';
import mobileTerritoryA from '../../assets/twin-v3-design-page-authority/mobile-territory-a-r3.svg?url';
import mobileTerritoryB from '../../assets/twin-v3-design-page-authority/mobile-territory-b-r3.svg?url';
import mobileTerritoryC from '../../assets/twin-v3-design-page-authority/mobile-territory-c-r3.svg?url';
import {
  canonicalPrototypePathFromAuthorityStorageUrl,
  isBrokenPersistedAuthorityImageStorageUrl,
  repairAuthorityVisualStorageUrl,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/repairAuthorityPrototypeUrls.js';
import type { DesignPageV3TerritoryId } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/hostProjectExpressionModel.js';

export const DESIGN_PAGE_AUTHORITY_R3_PROTOTYPE_URLS: Record<
  DesignPageV3TerritoryId,
  { mobile: string; desktop: string }
> = {
  A: { mobile: mobileTerritoryA, desktop: desktopTerritoryA },
  B: { mobile: mobileTerritoryB, desktop: desktopTerritoryB },
  C: { mobile: mobileTerritoryC, desktop: desktopTerritoryC },
};

const PUBLIC_PATH_TO_BUNDLED = new Map<string, string>([
  ['/site00/twin-v3-design-page-authority/mobile-territory-a-r3.svg', mobileTerritoryA],
  ['/site00/twin-v3-design-page-authority/desktop-territory-a-r3.svg', desktopTerritoryA],
  ['/site00/twin-v3-design-page-authority/mobile-territory-b-r3.svg', mobileTerritoryB],
  ['/site00/twin-v3-design-page-authority/desktop-territory-b-r3.svg', desktopTerritoryB],
  ['/site00/twin-v3-design-page-authority/mobile-territory-c-r3.svg', mobileTerritoryC],
  ['/site00/twin-v3-design-page-authority/desktop-territory-c-r3.svg', desktopTerritoryC],
]);

/** Stable paths shipped in public/ + cPanel ZIP (fallback when bundled URL unavailable). */
export function publicAuthorityPrototypeImageUrl(canonicalPath: string): string {
  const normalized = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath.replace(/^\/+/, '')}`;
  if (typeof window === 'undefined') return normalized;
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  return `${window.location.origin}${base}${normalized}`;
}

const R3_FILENAME_TO_BUNDLED = new Map<string, string>([
  ['mobile-territory-a-r3.svg', mobileTerritoryA],
  ['desktop-territory-a-r3.svg', desktopTerritoryA],
  ['mobile-territory-b-r3.svg', mobileTerritoryB],
  ['desktop-territory-b-r3.svg', desktopTerritoryB],
  ['mobile-territory-c-r3.svg', mobileTerritoryC],
  ['desktop-territory-c-r3.svg', desktopTerritoryC],
]);

function bundledPrototypeSrc(canonicalPath: string): string | null {
  const normalized = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath.replace(/^\/+/, '')}`;
  return PUBLIC_PATH_TO_BUNDLED.get(normalized) ?? null;
}

/** img src for R3 prototypes — prefer Vite-bundled URLs (data: or hashed /assets), not bare /site00 paths alone. */
export function resolveDesignPageAuthorityImageSrc(
  storageUrl: string,
  hint?: { territoryId: DesignPageV3TerritoryId; viewport: 'mobile' | 'desktop' },
): string {
  if (!storageUrl?.trim() && hint) {
    return DESIGN_PAGE_AUTHORITY_R3_PROTOTYPE_URLS[hint.territoryId][hint.viewport];
  }
  if (!storageUrl) return storageUrl;

  let url = repairAuthorityVisualStorageUrl(storageUrl, hint);
  if (isBrokenPersistedAuthorityImageStorageUrl(url) && hint) {
    url = `/site00/twin-v3-design-page-authority/${hint.viewport}-territory-${hint.territoryId.toLowerCase()}-r3.svg`;
  }

  if (/^data:/i.test(url) || /^blob:/i.test(url)) return url;
  if (/^https?:\/\//i.test(url)) {
    const canonicalFromFile = canonicalPrototypePathFromAuthorityStorageUrl(url);
    if (canonicalFromFile) {
      const bundled = bundledPrototypeSrc(canonicalFromFile);
      if (bundled) return bundled;
      return url;
    }
    return url;
  }

  const normalized = url.startsWith('/') ? url : `/${url.replace(/^\/+/, '')}`;
  const fromMap = bundledPrototypeSrc(normalized);
  if (fromMap) return fromMap;

  const file = normalized.split('/').pop();
  if (file) {
    const canonicalFromFile = canonicalPrototypePathFromAuthorityStorageUrl(`/${file}`);
    if (canonicalFromFile) {
      const bundled = bundledPrototypeSrc(canonicalFromFile);
      if (bundled) return bundled;
    }
    const byName = R3_FILENAME_TO_BUNDLED.get(file);
    if (byName) return byName;
  }

  if (hint) {
    return DESIGN_PAGE_AUTHORITY_R3_PROTOTYPE_URLS[hint.territoryId][hint.viewport];
  }

  if (typeof window !== 'undefined' && normalized.includes('/twin-v3-design-page-authority/')) {
    return publicAuthorityPrototypeImageUrl(normalized);
  }
  return normalized;
}

/** onError fallback — always use bundled prototype (never origin + broken path). */
export function authorityPrototypeBundledFallbackSrc(hint: {
  territoryId: DesignPageV3TerritoryId;
  viewport: 'mobile' | 'desktop';
}): string {
  return DESIGN_PAGE_AUTHORITY_R3_PROTOTYPE_URLS[hint.territoryId][hint.viewport];
}

export { normalizeDesignPageAuthorityVisualUrl } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/rewritePrototypeGalleryUrls.js';
