/**
 * P0.VR.3A — SITE 00 reference discovery and quality evaluation (browser-safe).
 */

import type { DesignViewportClass, ReferenceQualityLabel } from '../p0vr2/types.js';
import { buildHostReferenceStoragePath } from '../../../site00-visual-reference/referenceStoragePaths.js';
import type { StudioWorldDesignRouteManifestEntry } from '../p0vr3/types.js';
import { listSite00DesignableScreens } from './site00RouteForensics.js';

/** Committed repo reference assets (public/). */
const KNOWN_SITE00_REFERENCE_PATHS = new Set([
  '/visual-references/founder/site00/design-workspace-reference-p0vr2b.jpg',
]);

export function resolveSite00ReferenceStoragePath(route: string, viewport: DesignViewportClass): string {
  if (viewport === 'tablet') {
    return `/visual-references/site00/host/tablet/${route === '/' ? 'origin' : route.replace(/^\//, '').replace(/\//g, '-')}.webp`;
  }
  const viewportClass = viewport === 'ultrawide' ? 'DESKTOP' : (viewport.toUpperCase() as 'MOBILE' | 'DESKTOP');
  const mapped = buildHostReferenceStoragePath(route, viewportClass as 'MOBILE' | 'DESKTOP');
  return mapped.startsWith('/') ? mapped : `/${mapped}`;
}

export function evaluateSite00ReferenceQuality(input: {
  storagePath: string | null;
  viewport: DesignViewportClass;
  route: string;
}): ReferenceQualityLabel {
  if (!input.storagePath) return 'MISSING';
  if (KNOWN_SITE00_REFERENCE_PATHS.has(input.storagePath)) return 'USABLE';
  if (input.storagePath.includes('design-workspace-reference')) return 'WRONG_SHELL';
  if (input.storagePath.includes('ndxbook')) return 'WRONG_SHELL';
  return 'MISSING';
}

export function auditSite00References(): Array<{
  screenId: string;
  route: string;
  viewport: DesignViewportClass;
  storagePath: string;
  quality: ReferenceQualityLabel;
}> {
  const screens = listSite00DesignableScreens(true);
  const viewports: DesignViewportClass[] = ['mobile', 'tablet', 'desktop'];
  const results: Array<{
    screenId: string;
    route: string;
    viewport: DesignViewportClass;
    storagePath: string;
    quality: ReferenceQualityLabel;
  }> = [];

  for (const screen of screens) {
    for (const viewport of viewports) {
      const storagePath = resolveSite00ReferenceStoragePath(screen.resolvedRoute, viewport);
      const quality = evaluateSite00ReferenceQuality({
        storagePath,
        viewport,
        route: screen.resolvedRoute,
      });
      results.push({
        screenId: screen.screenId,
        route: screen.resolvedRoute,
        viewport,
        storagePath,
        quality,
      });
    }
  }

  return results;
}

export function enrichRoutesWithReferenceCoverage(
  routes: StudioWorldDesignRouteManifestEntry[],
): StudioWorldDesignRouteManifestEntry[] {
  const audit = auditSite00References();
  return routes.map((route) => {
    const viewportCoverage = { ...route.viewportCoverage };
    for (const vp of ['mobile', 'tablet', 'desktop'] as const) {
      const hit = audit.find((a) => a.screenId === route.screenId && a.viewport === vp);
      viewportCoverage[vp] = {
        referenceQuality: hit?.quality ?? 'MISSING',
        implementationCoverage: hit?.quality === 'MISSING' ? 'MISSING' : 'PARTIAL',
        tabletReference: vp === 'tablet' ? hit?.storagePath ?? null : viewportCoverage.tablet?.tabletReference,
        tabletImplementation: vp === 'tablet' ? (hit?.quality === 'MISSING' ? 'MISSING' : 'PARTIAL') : undefined,
        tabletStatus: vp === 'tablet' ? hit?.quality : undefined,
      };
    }
    return { ...route, viewportCoverage };
  });
}

export function listSite00LockedBackgrounds(): string[] {
  return ['0E226A0B-7533-433F-A9D0-7DD5109D77AC.png'];
}

export function detectBackgroundAssetForRoute(route: string): {
  backgroundAssetId: string | null;
  backgroundStatus: 'LOCKED' | 'MISSING' | 'DRAFT' | null;
} {
  if (route === '/origin/locations') {
    return { backgroundAssetId: '0E226A0B-7533-433F-A9D0-7DD5109D77AC.png', backgroundStatus: 'LOCKED' };
  }
  if (route === '/' || route === '/enter') {
    return { backgroundAssetId: null, backgroundStatus: 'MISSING' };
  }
  return { backgroundAssetId: null, backgroundStatus: null };
}
