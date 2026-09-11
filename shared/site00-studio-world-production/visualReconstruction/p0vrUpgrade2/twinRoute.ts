/**
 * P0.VR.UPGRADE.2 — Deterministic protected twin route.
 */

import { TWIN_ROUTE_PREFIX } from './constants.js';

export function encodePageScope(pageId: string): string {
  return pageId.replace(/[:/]/g, '--').replace(/^-+|-+$/g, '') || 'page';
}

export function buildTwinRoute(input: {
  projectId: string;
  pageId: string;
  sessionId: string;
}): string {
  const scope = encodePageScope(input.pageId);
  return `${TWIN_ROUTE_PREFIX}/${input.projectId}/debug/reconstruction/${scope}/${input.sessionId}`;
}

export function parseTwinRoute(pathname: string): {
  projectId: string;
  pageScope: string;
  sessionId: string;
} | null {
  const match = pathname.match(
    /^\/projects\/([^/]+)\/debug\/reconstruction\/([^/]+)\/([^/]+)\/?$/,
  );
  if (!match) return null;
  return { projectId: match[1]!, pageScope: match[2]!, sessionId: match[3]! };
}

export const TWIN_ROUTE_META = {
  noindex: true,
  nonCanonical: true,
  excludedFromSitemap: true,
  excludedFromPageFamily: true,
} as const;
