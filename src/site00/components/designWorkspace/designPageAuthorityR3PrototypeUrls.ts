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

const R3_FILENAME_TO_BUNDLED = new Map<string, string>([
  ['mobile-territory-a-r3.svg', mobileTerritoryA],
  ['desktop-territory-a-r3.svg', desktopTerritoryA],
  ['mobile-territory-b-r3.svg', mobileTerritoryB],
  ['desktop-territory-b-r3.svg', desktopTerritoryB],
  ['mobile-territory-c-r3.svg', mobileTerritoryC],
  ['desktop-territory-c-r3.svg', desktopTerritoryC],
]);

/** Map legacy /public paths and relative paths to bundled asset URLs (browser). */
export function resolveDesignPageAuthorityImageSrc(
  storageUrl: string,
  hint?: { territoryId: DesignPageV3TerritoryId; viewport: 'mobile' | 'desktop' },
): string {
  if (!storageUrl) return storageUrl;

  let url = repairAuthorityVisualStorageUrl(storageUrl, hint);

  if (/^data:/i.test(url) || /^blob:/i.test(url)) return url;
  if (/^https?:\/\//i.test(url)) {
    const canonicalFromFile = canonicalPrototypePathFromAuthorityStorageUrl(url);
    if (canonicalFromFile) url = canonicalFromFile;
    else return url;
  }

  const normalized = url.startsWith('/') ? url : `/${url.replace(/^\/+/, '')}`;
  const bundled = PUBLIC_PATH_TO_BUNDLED.get(normalized);
  if (bundled) return bundled;

  const file = normalized.split('/').pop();
  if (file) {
    const byName = R3_FILENAME_TO_BUNDLED.get(file);
    if (byName) return byName;
  }

  if (typeof window !== 'undefined') {
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    const path = normalized.startsWith(base + '/') ? normalized : `${base}${normalized}`;
    return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;
  }
  return normalized;
}

export { normalizeDesignPageAuthorityVisualUrl } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/rewritePrototypeGalleryUrls.js';
