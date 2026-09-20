/**
 * P0.VR.DESIGN-VISUAL-COMPARE-GROK1R1 — page-scoped implementation captures (design workspace).
 */

import type { PageViewportId } from './designProjectBinding/pageViewportAuthority.js';
import { getDesignBoundPage } from './designProjectBinding/designPageRegistry.js';
import { migrateHistoricalRootCapturePageId } from '../site00-studio-world-production/pageFamilyWorkspace/pageFamilyRootTarget.js';

export type PageCaptureRecord = {
  captureId: string;
  projectId: string;
  pageId: string;
  screenId: string;
  viewport: PageViewportId;
  route: string;
  timestamp: string;
  buildVersion: string | null;
  artifactPath: string;
  createdBy: string;
  source: 'IMPLEMENTATION_SNAPSHOT_API' | 'LOCAL_FALLBACK';
};

export type PageCaptureHistory = {
  latest: PageCaptureRecord | null;
  history: readonly PageCaptureRecord[];
};

const STORAGE_PREFIX = 'site00:design-page-capture:v1:';

function storageKey(projectId: string, pageId: string, viewport: PageViewportId): string {
  return `${STORAGE_PREFIX}${projectId}:${pageId}:${viewport}`;
}

function captureStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof globalThis.localStorage !== 'undefined') return globalThis.localStorage;
  return null;
}

export const DESIGN_PAGE_CAPTURE_UPDATED_EVENT = 'site00:design-page-capture-updated';

function readBucket(key: string): PageCaptureHistory {
  const storage = captureStorage();
  if (!storage) return { latest: null, history: [] };
  try {
    const raw = storage.getItem(key);
    if (!raw) return { latest: null, history: [] };
    const parsed = JSON.parse(raw) as PageCaptureHistory;
    return {
      latest: parsed.latest ?? null,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return { latest: null, history: [] };
  }
}

function writeBucket(key: string, bucket: PageCaptureHistory): void {
  const storage = captureStorage();
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(bucket));
  } catch {
    /* quota */
  }
}

export function canonicalDesignPageCapturePageId(projectId: string, pageId: string): string {
  return migrateHistoricalRootCapturePageId(projectId, pageId);
}

export function loadPageCaptureHistory(
  projectId: string,
  pageId: string,
  viewport: PageViewportId,
): PageCaptureHistory {
  const canonical = canonicalDesignPageCapturePageId(projectId, pageId);
  const primary = readBucket(storageKey(projectId, canonical, viewport));
  if (primary.latest?.artifactPath?.trim()) return primary;
  if (canonical !== pageId) {
    const legacy = readBucket(storageKey(projectId, pageId, viewport));
    if (legacy.latest?.artifactPath?.trim()) return legacy;
  }
  return primary;
}

/** Latest displayable Mobile + Desktop captures for page concept pipeline (aliases + screenId scan). */
export function getPageConceptSourceCaptures(
  projectId: string,
  pageId: string,
): { mobile: PageCaptureRecord | null; desktop: PageCaptureRecord | null } {
  const canonical = canonicalDesignPageCapturePageId(projectId, pageId);
  const page = getDesignBoundPage(projectId, canonical) ?? getDesignBoundPage(projectId, pageId);
  const screenId = page?.screenId ?? null;

  const pick = (viewport: PageViewportId): PageCaptureRecord | null => {
    const tryIds = [...new Set([canonical, pageId])];
    for (const id of tryIds) {
      const latest = loadPageCaptureHistory(projectId, id, viewport).latest;
      if (latest && isPageCaptureDisplayableArtifact(latest.artifactPath)) return latest;
    }
    const storage = captureStorage();
    if (!storage || !screenId) return null;
    let fallback: PageCaptureRecord | null = null;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key?.startsWith(`${STORAGE_PREFIX}${projectId}:`) || !key.endsWith(`:${viewport}`)) continue;
      const latest = readBucket(key).latest;
      if (!latest || latest.screenId !== screenId) continue;
      if (!isPageCaptureDisplayableArtifact(latest.artifactPath)) continue;
      fallback = latest;
      if (latest.pageId === canonical || latest.pageId === pageId) return latest;
    }
    return fallback;
  };

  return { mobile: pick('MOBILE'), desktop: pick('DESKTOP') };
}

export function appendPageCapture(record: PageCaptureRecord, maxHistory = 20): PageCaptureRecord {
  const pageId = canonicalDesignPageCapturePageId(record.projectId, record.pageId);
  const normalized = pageId === record.pageId ? record : { ...record, pageId };
  const key = storageKey(normalized.projectId, normalized.pageId, normalized.viewport);
  const bucket = readBucket(key);
  const history = [normalized, ...bucket.history.filter((h) => h.captureId !== normalized.captureId)].slice(
    0,
    maxHistory,
  );
  writeBucket(key, { latest: normalized, history });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(DESIGN_PAGE_CAPTURE_UPDATED_EVENT, {
        detail: { projectId: normalized.projectId, pageId: normalized.pageId, viewport: normalized.viewport },
      }),
    );
  }
  return normalized;
}

export function viewportToDesignViewportClass(viewport: PageViewportId): 'mobile' | 'tablet' | 'desktop' {
  if (viewport === 'TABLET') return 'tablet';
  if (viewport === 'DESKTOP') return 'desktop';
  return 'mobile';
}

const IMAGE_EXT = /\.(png|webp|jpg|jpeg|gif)(\?|#|$)/i;

/** App routes saved by mistake from failed snapshots — not image artifacts. */
const SPA_ROUTE_PREFIXES = [
  '/projects/',
  '/services/',
  '/control/',
  '/origin/',
  '/studio-world/',
  '/admin/',
  '/app/',
  '/assts/',
  '/sign-in',
  '/register',
  '/create-account',
] as const;

function pathnameLooksLikeSpaRoute(pathname: string): boolean {
  const p = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return SPA_ROUTE_PREFIXES.some((prefix) => p.startsWith(prefix) || p === prefix.replace(/\/$/, ''));
}

/** True when artifactPath can be used as an img src (not a live route URL). */
export function isPageCaptureDisplayableArtifact(artifactPath: string | null | undefined): boolean {
  const path = artifactPath?.trim();
  if (!path) return false;
  if (path.startsWith('data:image/') || path.startsWith('blob:')) return true;
  if (path.startsWith('/visual-references/') || path.startsWith('/site00/')) return true;
  if (IMAGE_EXT.test(path)) return true;
  if (!path.startsWith('http://') && !path.startsWith('https://')) {
    if (pathnameLooksLikeSpaRoute(path.split('?')[0] ?? path)) return false;
    return path.startsWith('/') && IMAGE_EXT.test(path);
  }
  try {
    const url = new URL(path);
    if (pathnameLooksLikeSpaRoute(url.pathname)) return false;
    if (IMAGE_EXT.test(url.pathname)) return true;
    if (url.hostname.includes('cdn.site00.com')) return true;
    if (url.hostname.includes('supabase.co') && url.pathname.includes('/storage/')) return true;
    if (url.pathname.includes('/object/public/')) return true;
  } catch {
    return false;
  }
  return false;
}

/** Safe img src for CURRENT capture pane; null hides broken route URLs from failed snapshots. */
export function pageCaptureDisplaySrc(artifactPath: string | null | undefined): string | null {
  if (!isPageCaptureDisplayableArtifact(artifactPath)) return null;
  return artifactPath!.trim();
}
