/**
 * P0.VR.CAPTURE.1R3A — Capture navigation proof receipt.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';

export type CaptureNavigationReceipt = {
  jobId: string;
  requestedRoute: string;
  resolvedRuntimePath: string;
  finalUrl: string;
  httpStatus: number | null;
  redirected: boolean;
  redirectChain: string[];
  viewport: DesignViewportClass;
  status: 'MATCH' | 'REDIRECTED' | 'MISMATCH' | 'UNKNOWN';
};

export function buildCaptureNavigationReceipt(input: {
  jobId: string;
  requestedRoute: string;
  resolvedRuntimePath: string;
  finalUrl: string;
  httpStatus?: number | null;
  redirectChain?: string[];
  viewport: DesignViewportClass;
}): CaptureNavigationReceipt {
  const requestedPath = normalizeRoutePath(input.requestedRoute);
  const finalPath = normalizeRoutePath(input.finalUrl);
  const resolvedPath = normalizeRoutePath(input.resolvedRuntimePath);
  const redirected = input.redirectChain?.length ? input.redirectChain.length > 0 : finalPath !== resolvedPath;

  let status: CaptureNavigationReceipt['status'] = 'UNKNOWN';
  if (finalPath === requestedPath || finalPath === resolvedPath) status = 'MATCH';
  else if (redirected) status = 'REDIRECTED';
  else status = 'MISMATCH';

  return {
    jobId: input.jobId,
    requestedRoute: input.requestedRoute,
    resolvedRuntimePath: input.resolvedRuntimePath,
    finalUrl: input.finalUrl,
    httpStatus: input.httpStatus ?? null,
    redirected,
    redirectChain: input.redirectChain ?? [],
    viewport: input.viewport,
    status,
  };
}

function normalizeRoutePath(routeOrUrl: string): string {
  try {
    if (routeOrUrl.startsWith('http')) {
      const u = new URL(routeOrUrl);
      return u.pathname.replace(/\/$/, '') || '/';
    }
  } catch {
    /* fall through */
  }
  return routeOrUrl.split('?')[0]?.replace(/\/$/, '') || '/';
}
