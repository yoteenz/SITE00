/**
 * P0.VR.AUTH.1 — Bounded preview load lifecycle (never UNKNOWN forever).
 */

import type { PreviewHealthStatus } from './types.js';

export const PREVIEW_HEALTH_LIFECYCLE_STATES = ['IDLE', 'LOADING', 'PASS', 'FAIL', 'TIMEOUT'] as const;
export type PreviewHealthLifecycleState = (typeof PREVIEW_HEALTH_LIFECYCLE_STATES)[number];

/** Static same-origin reference images — 10s bounded wait. */
export const PREVIEW_STATIC_IMAGE_TIMEOUT_MS = 10_000;

/** Supabase public objects on mobile preview hosts — allow slower networks. */
export const PREVIEW_REMOTE_STORAGE_TIMEOUT_MS = 28_000;

export function resolvePreviewLoadTimeoutMs(resolvedUrl: string | null): number {
  if (!resolvedUrl) return PREVIEW_STATIC_IMAGE_TIMEOUT_MS;
  if (resolvedUrl.includes('supabase.co/storage/') || resolvedUrl.includes('/storage/v1/object/public/')) {
    return PREVIEW_REMOTE_STORAGE_TIMEOUT_MS;
  }
  return PREVIEW_STATIC_IMAGE_TIMEOUT_MS;
}

/** Compare URLs ignoring cache-bust query params. */
export function normalizePreviewUrlForComparison(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('v');
    parsed.searchParams.delete('_cb');
    return parsed.toString();
  } catch {
    return url.split('?')[0] ?? url;
  }
}

export type PreviewHealthLifecycle = {
  state: PreviewHealthLifecycleState;
  retryCount: number;
  startedAt: number | null;
  resolvedUrl: string | null;
};

export function createPreviewHealthLifecycle(): PreviewHealthLifecycle {
  return { state: 'IDLE', retryCount: 0, startedAt: null, resolvedUrl: null };
}

export function startPreviewHealthLoading(
  lifecycle: PreviewHealthLifecycle,
  resolvedUrl: string | null,
): PreviewHealthLifecycle {
  return {
    state: 'LOADING',
    retryCount: lifecycle.retryCount,
    startedAt: Date.now(),
    resolvedUrl,
  };
}

export function markPreviewHealthPass(lifecycle: PreviewHealthLifecycle): PreviewHealthLifecycle {
  return { ...lifecycle, state: 'PASS', startedAt: null };
}

export function markPreviewHealthFail(lifecycle: PreviewHealthLifecycle): PreviewHealthLifecycle {
  return { ...lifecycle, state: 'FAIL', startedAt: null };
}

export function markPreviewHealthTimeout(lifecycle: PreviewHealthLifecycle): PreviewHealthLifecycle {
  return { ...lifecycle, state: 'TIMEOUT', startedAt: null };
}

export function retryPreviewHealthLifecycle(lifecycle: PreviewHealthLifecycle): PreviewHealthLifecycle {
  return {
    state: 'IDLE',
    retryCount: lifecycle.retryCount + 1,
    startedAt: null,
    resolvedUrl: null,
  };
}

export function previewHealthLifecycleLabel(state: PreviewHealthLifecycleState): string {
  switch (state) {
    case 'PASS':
      return 'PREVIEW READY ✓';
    case 'FAIL':
      return 'PREVIEW UNAVAILABLE';
    case 'TIMEOUT':
      return 'PREVIEW TOOK TOO LONG';
    case 'LOADING':
      return 'PREVIEW CHECKING…';
    default:
      return 'PREVIEW UNAVAILABLE';
  }
}

export function mapLifecycleToPreviewHealthStatus(state: PreviewHealthLifecycleState): PreviewHealthStatus {
  if (state === 'PASS') return 'PASS';
  if (state === 'LOADING' || state === 'IDLE') return 'UNKNOWN';
  return 'FAIL';
}

export function designAuthorityBlockReasonFromLifecycle(state: PreviewHealthLifecycleState): string | null {
  switch (state) {
    case 'PASS':
      return null;
    case 'LOADING':
    case 'IDLE':
      return 'DESIGN AUTHORITY PREVIEW LOADING';
    case 'TIMEOUT':
      return 'DESIGN AUTHORITY PREVIEW TIMED OUT';
    case 'FAIL':
      return 'DESIGN AUTHORITY PREVIEW FAILED';
    default:
      return 'DESIGN AUTHORITY PREVIEW REQUIRED';
  }
}

export function liveCaptureBlockReasonFromLifecycle(state: PreviewHealthLifecycleState): string | null {
  switch (state) {
    case 'PASS':
      return null;
    case 'LOADING':
    case 'IDLE':
      return 'LIVE CAPTURE PREVIEW LOADING';
    case 'TIMEOUT':
      return 'LIVE CAPTURE PREVIEW TIMED OUT';
    case 'FAIL':
      return 'LIVE CAPTURE PREVIEW FAILED';
    default:
      return 'LIVE CAPTURE PREVIEW REQUIRED';
  }
}

export function appendCacheBustQuery(url: string, nonce: string): string {
  if (!url || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(nonce)}`;
}
