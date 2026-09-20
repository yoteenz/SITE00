/**
 * P0.VR.DESIGN-VISUAL-COMPARE-GROK1R1 — page-scoped implementation captures (design workspace).
 */

import type { PageViewportId } from './designProjectBinding/pageViewportAuthority.js';

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

export function loadPageCaptureHistory(
  projectId: string,
  pageId: string,
  viewport: PageViewportId,
): PageCaptureHistory {
  return readBucket(storageKey(projectId, pageId, viewport));
}

export function appendPageCapture(record: PageCaptureRecord, maxHistory = 20): PageCaptureRecord {
  const key = storageKey(record.projectId, record.pageId, record.viewport);
  const bucket = readBucket(key);
  const history = [record, ...bucket.history.filter((h) => h.captureId !== record.captureId)].slice(0, maxHistory);
  writeBucket(key, { latest: record, history });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(DESIGN_PAGE_CAPTURE_UPDATED_EVENT, {
        detail: { projectId: record.projectId, pageId: record.pageId, viewport: record.viewport },
      }),
    );
  }
  return record;
}

export function viewportToDesignViewportClass(viewport: PageViewportId): 'mobile' | 'tablet' | 'desktop' {
  if (viewport === 'TABLET') return 'tablet';
  if (viewport === 'DESKTOP') return 'desktop';
  return 'mobile';
}

const IMAGE_EXT = /\.(png|webp|jpg|jpeg|gif)(\?|#|$)/i;

/** True when artifactPath can be used as an img src (not a live route URL). */
export function isPageCaptureDisplayableArtifact(artifactPath: string | null | undefined): boolean {
  const path = artifactPath?.trim();
  if (!path) return false;
  if (path.startsWith('data:image/') || path.startsWith('blob:')) return true;
  if (path.startsWith('/visual-references/') || path.startsWith('/site00/')) return true;
  if (IMAGE_EXT.test(path)) return true;
  if (!path.startsWith('http://') && !path.startsWith('https://')) {
    return path.startsWith('/');
  }
  try {
    const url = new URL(path);
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
