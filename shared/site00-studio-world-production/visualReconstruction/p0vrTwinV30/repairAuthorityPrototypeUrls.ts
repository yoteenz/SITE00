import type { DesignPageV3TerritoryId } from './hostProjectExpressionModel.js';
import type {
  DesignPageAuthorityReviewSession,
  DesignPageAuthorityTerritoryGallery,
  DesignPageAuthorityVisualArtifact,
} from './types.js';
import { isPublicPrototypeAuthorityPath, canonicalPublicPrototypePath } from './rewritePrototypeGalleryUrls.js';

const R3_TERRITORY_IDS: DesignPageV3TerritoryId[] = ['A', 'B', 'C'];

/** Vite dev / old sessions persisted hashed `/assets/*-r3.svg` — breaks after every deploy. */
const R3_SVG_FILENAME =
  /(?:^|[/?])(mobile|desktop)-territory-(a|b|c)-r3(?:\.[A-Za-z0-9_-]+)?\.svg(?:\?|#|$)/i;

export function canonicalPrototypePathFromAuthorityStorageUrl(
  storageUrl: string,
): string | null {
  const m = storageUrl.match(R3_SVG_FILENAME);
  if (!m) return null;
  const viewport = m[1]!.toLowerCase() as 'mobile' | 'desktop';
  const territoryId = m[2]!.toUpperCase() as DesignPageV3TerritoryId;
  if (territoryId !== 'A' && territoryId !== 'B' && territoryId !== 'C') return null;
  return canonicalPublicPrototypePath(territoryId, viewport);
}

/** Hashed Vite /assets URLs 404 on cPanel + some dev reloads — treat as unviewable. */
export function isUnviewableAuthorityImageStorageUrl(storageUrl: string): boolean {
  if (!storageUrl?.trim()) return true;
  const url = storageUrl.trim();
  if (isBrokenPersistedAuthorityImageStorageUrl(url)) return true;
  if (/^\/assets\//i.test(url)) return true;
  if (/\/assets\/[^"'\s]*-territory-[abc]-r3/i.test(url)) return true;
  return false;
}

export function galleryHasUnviewableAuthorityImages(gallery: DesignPageAuthorityTerritoryGallery): boolean {
  for (const territoryId of R3_TERRITORY_IDS) {
    for (const c of gallery[territoryId]) {
      if (isUnviewableAuthorityImageStorageUrl(c.mobile.storageUrl)) return true;
      if (isUnviewableAuthorityImageStorageUrl(c.desktop.storageUrl)) return true;
    }
  }
  return false;
}

/** URLs that cannot load in `<img>` — repair to bundled /site00 R3 paths. */
export function isBrokenPersistedAuthorityImageStorageUrl(storageUrl: string): boolean {
  if (!storageUrl?.trim()) return true;
  const url = storageUrl.trim();
  if (/^vitest:\/\//i.test(url)) return true;
  if (/^https?:\/\/[^/]+\/(data:.+)$/i.test(url)) return true;
  if (/^data:/i.test(url)) return true;
  if (/^\/assets\//i.test(url)) return true;
  if (/\/assets\/[^"'\s]*-territory-[abc]-r3(?:\.[A-Za-z0-9_-]+)?\.svg/i.test(url)) return true;
  if (canonicalPrototypePathFromAuthorityStorageUrl(url)) {
    return !isPublicPrototypeAuthorityPath(url);
  }
  return false;
}

function territoryFromR3Filename(storageUrl: string): DesignPageV3TerritoryId | null {
  const m = storageUrl.match(/territory-([abc])/i);
  if (!m) return null;
  const id = m[1]!.toUpperCase();
  return id === 'A' || id === 'B' || id === 'C' ? id : null;
}

function viewportFromR3Filename(storageUrl: string): 'mobile' | 'desktop' | null {
  if (/\/mobile-territory-/i.test(storageUrl) || storageUrl.includes('mobile-territory-')) return 'mobile';
  if (/\/desktop-territory-/i.test(storageUrl) || storageUrl.includes('desktop-territory-')) return 'desktop';
  return null;
}

/** Fix broken persisted / mangled prototype URLs before display or storage. */
export function repairAuthorityVisualStorageUrl(
  storageUrl: string,
  hint?: { territoryId: DesignPageV3TerritoryId; viewport: 'mobile' | 'desktop' },
): string {
  if (!storageUrl?.trim()) return storageUrl;
  let url = storageUrl.trim();

  const originPrefixedData = url.match(/^https?:\/\/[^/]+\/(data:.+)$/i);
  if (originPrefixedData) url = originPrefixedData[1]!;

  const fromR3Filename = canonicalPrototypePathFromAuthorityStorageUrl(url);
  if (fromR3Filename && isBrokenPersistedAuthorityImageStorageUrl(url)) {
    url = fromR3Filename;
  }

  if (/^vitest:\/\//i.test(url) && hint) {
    return canonicalPublicPrototypePath(hint.territoryId, hint.viewport);
  }

  if (/^https?:\/\//i.test(url)) {
    try {
      const u = new URL(url);
      if (u.pathname.includes('/twin-v3-design-page-authority/') && u.pathname.endsWith('.svg')) {
        url = u.pathname;
      } else if (!u.pathname.includes('twin-v3-design-page-authority')) {
        return url;
      }
    } catch {
      return url;
    }
  }

  if (/^data:/i.test(url) || /^blob:/i.test(url)) {
    if (hint) return canonicalPublicPrototypePath(hint.territoryId, hint.viewport);
    const tid = territoryFromR3Filename(url);
    const vp = viewportFromR3Filename(url);
    if (tid && vp) return canonicalPublicPrototypePath(tid, vp);
    return url;
  }

  const tidFromFile = territoryFromR3Filename(url);
  const vpFromFile = viewportFromR3Filename(url);
  if (tidFromFile && vpFromFile && url.includes('r3.svg')) {
    return canonicalPublicPrototypePath(tidFromFile, vpFromFile);
  }

  if (hint && (isPublicPrototypeAuthorityPath(url) || url.includes('r3.svg'))) {
    return canonicalPublicPrototypePath(hint.territoryId, hint.viewport);
  }

  if (isPublicPrototypeAuthorityPath(url)) {
    return url.startsWith('/') ? url : `/${url.replace(/^\/+/, '')}`;
  }

  return url;
}

function repairArtifact(
  artifact: DesignPageAuthorityVisualArtifact,
  hint: { territoryId: DesignPageV3TerritoryId; viewport: 'mobile' | 'desktop' },
): DesignPageAuthorityVisualArtifact {
  let storageUrl = repairAuthorityVisualStorageUrl(artifact.storageUrl, hint);
  const wasBroken = isBrokenPersistedAuthorityImageStorageUrl(artifact.storageUrl);
  const stillBroken = isBrokenPersistedAuthorityImageStorageUrl(storageUrl);
  if (wasBroken || stillBroken || artifact.representativePrototype) {
    if (stillBroken || wasBroken) {
      storageUrl = canonicalPublicPrototypePath(hint.territoryId, hint.viewport);
    }
  }
  const isProto =
    artifact.representativePrototype ||
    isPublicPrototypeAuthorityPath(storageUrl) ||
    isPublicPrototypeAuthorityPath(artifact.storageUrl) ||
    /^data:image\/svg/i.test(artifact.storageUrl) ||
    wasBroken ||
    stillBroken;
  return {
    ...artifact,
    storageUrl,
    representativePrototype: isProto ? true : artifact.representativePrototype,
  };
}

/** Normalize gallery + masters to stable /site00/... R3 paths (never persist data: URLs). */
export function repairPrototypeGallerySession(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  const territoryGallery = { ...session.territoryGallery };
  for (const territoryId of R3_TERRITORY_IDS) {
    territoryGallery[territoryId] = territoryGallery[territoryId].map((candidate) => ({
      ...candidate,
      mobile: repairArtifact(candidate.mobile, { territoryId, viewport: 'mobile' }),
      desktop: repairArtifact(candidate.desktop, { territoryId, viewport: 'desktop' }),
    }));
  }

  let lastResult = session.lastResult;
  if (lastResult?.territories?.length) {
    lastResult = {
      ...lastResult,
      territories: lastResult.territories.map((t) => ({
        ...t,
        mobile: repairArtifact(t.mobile, { territoryId: t.territoryId, viewport: 'mobile' }),
        desktop: repairArtifact(t.desktop, { territoryId: t.territoryId, viewport: 'desktop' }),
      })),
    };
  }

  let authorityPipeline = session.authorityPipeline;
  if (authorityPipeline?.mobileMaster) {
    const m = authorityPipeline.mobileMaster;
    authorityPipeline = {
      ...authorityPipeline,
      mobileMaster: {
        ...m,
        authorityImageUri: repairAuthorityVisualStorageUrl(m.authorityImageUri, {
          territoryId: m.sourceTerritoryId,
          viewport: 'mobile',
        }),
      },
    };
  }
  if (authorityPipeline?.desktopMaster) {
    const d = authorityPipeline.desktopMaster;
    authorityPipeline = {
      ...authorityPipeline,
      desktopMaster: {
        ...d,
        authorityImageUri: repairAuthorityVisualStorageUrl(d.authorityImageUri, {
          territoryId: d.sourceTerritoryId,
          viewport: 'desktop',
        }),
      },
    };
  }

  return {
    ...session,
    territoryGallery,
    lastResult,
    authorityPipeline,
  };
}

/** @deprecated Prefer repairPrototypeGallerySession — do not inject Vite data: URLs into session state. */
export function rewritePrototypeGalleryUrls(
  session: DesignPageAuthorityReviewSession,
  _urls?: Record<DesignPageV3TerritoryId, { mobile: string; desktop: string }>,
): DesignPageAuthorityReviewSession {
  return repairPrototypeGallerySession(session);
}
