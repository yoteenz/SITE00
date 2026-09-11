/**
 * P0.VR.CAPTURE.1R3A — Verify captured page matches target page identity.
 */

import type { CaptureNavigationReceipt } from './captureNavigationReceipt.js';

export type CapturedPageIdentityCheck = {
  projectId: string;
  pageId: string;
  screenId: string;
  requestedRoute: string;
  finalUrl: string;
  match: boolean;
  status: 'MATCH' | 'PAGE_MISMATCH' | 'AUTH_REDIRECT' | 'NOT_FOUND' | 'UNKNOWN';
  errorCode: 'CAPTURE_PAGE_MISMATCH' | 'AUTH_REQUIRED' | 'HTTP_404' | null;
};

const AUTH_PATH_MARKERS = ['/enter', '/sign-in', '/login', '/auth'];
const NOT_FOUND_MARKERS = ['/404', 'not-found'];

export function runCapturedPageIdentityCheck(input: {
  projectId: string;
  pageId: string;
  screenId: string;
  route: string;
  navigation: CaptureNavigationReceipt;
}): CapturedPageIdentityCheck {
  const finalUrl = input.navigation.finalUrl.toLowerCase();
  const requestedPath = input.route.split('?')[0]?.replace(/\/$/, '') || '/';

  if (AUTH_PATH_MARKERS.some((m) => finalUrl.includes(m))) {
    return {
      projectId: input.projectId,
      pageId: input.pageId,
      screenId: input.screenId,
      requestedRoute: input.route,
      finalUrl: input.navigation.finalUrl,
      match: false,
      status: 'AUTH_REDIRECT',
      errorCode: 'AUTH_REQUIRED',
    };
  }

  if (NOT_FOUND_MARKERS.some((m) => finalUrl.includes(m))) {
    return {
      projectId: input.projectId,
      pageId: input.pageId,
      screenId: input.screenId,
      requestedRoute: input.route,
      finalUrl: input.navigation.finalUrl,
      match: false,
      status: 'NOT_FOUND',
      errorCode: 'HTTP_404',
    };
  }

  const match =
    input.navigation.status === 'MATCH' ||
    normalize(finalUrl).endsWith(normalize(requestedPath)) ||
    normalize(input.navigation.finalUrl).includes(normalize(requestedPath));

  if (!match) {
    return {
      projectId: input.projectId,
      pageId: input.pageId,
      screenId: input.screenId,
      requestedRoute: input.route,
      finalUrl: input.navigation.finalUrl,
      match: false,
      status: 'PAGE_MISMATCH',
      errorCode: 'CAPTURE_PAGE_MISMATCH',
    };
  }

  return {
    projectId: input.projectId,
    pageId: input.pageId,
    screenId: input.screenId,
    requestedRoute: input.route,
    finalUrl: input.navigation.finalUrl,
    match: true,
    status: 'MATCH',
    errorCode: null,
  };
}

function normalize(value: string): string {
  try {
    if (value.startsWith('http')) return new URL(value).pathname.replace(/\/$/, '') || '/';
  } catch {
    /* ignore */
  }
  return value.split('?')[0]?.replace(/\/$/, '') || '/';
}
