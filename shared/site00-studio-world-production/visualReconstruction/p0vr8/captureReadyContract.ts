/**
 * P0.VR.8 — PageCaptureReadyContract — block half-loaded captures.
 */

import type { PageCaptureReadyContract } from './types.js';

export function evaluatePageCaptureReady(input: Partial<PageCaptureReadyContract>): PageCaptureReadyContract {
  const documentReady = input.documentReady ?? true;
  const appHydrated = input.appHydrated ?? true;
  const fontsLoaded = input.fontsLoaded ?? true;
  const criticalImagesLoaded = input.criticalImagesLoaded ?? true;
  const layoutStable = input.layoutStable ?? true;
  const projectReadyMarker = input.projectReadyMarker ?? true;

  const checks = [
    { ok: documentReady, reason: 'document not ready' },
    { ok: appHydrated, reason: 'app not hydrated' },
    { ok: fontsLoaded, reason: 'fonts not loaded' },
    { ok: criticalImagesLoaded, reason: 'critical images not loaded' },
    { ok: layoutStable, reason: 'layout not stable' },
    { ok: projectReadyMarker, reason: 'project ready marker missing' },
  ];
  const failed = checks.find((c) => !c.ok);

  return {
    documentReady,
    appHydrated,
    fontsLoaded,
    criticalImagesLoaded,
    layoutStable,
    projectReadyMarker,
    ready: !failed,
    blockReason: failed?.reason ?? null,
  };
}

export function isRouteCaptureError(input: {
  httpStatus?: number | null;
  is404?: boolean;
  isErrorBoundary?: boolean;
  unexpectedLoginRedirect?: boolean;
}): boolean {
  if (input.is404) return true;
  if (input.isErrorBoundary) return true;
  if (input.httpStatus != null && input.httpStatus >= 400) return true;
  if (input.unexpectedLoginRedirect) return true;
  return false;
}
