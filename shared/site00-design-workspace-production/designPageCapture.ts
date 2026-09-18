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

function readBucket(key: string): PageCaptureHistory {
  if (typeof window === 'undefined') return { latest: null, history: [] };
  try {
    const raw = window.localStorage.getItem(key);
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
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(bucket));
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
  return record;
}

export function viewportToDesignViewportClass(viewport: PageViewportId): 'mobile' | 'tablet' | 'desktop' {
  if (viewport === 'TABLET') return 'tablet';
  if (viewport === 'DESKTOP') return 'desktop';
  return 'mobile';
}
