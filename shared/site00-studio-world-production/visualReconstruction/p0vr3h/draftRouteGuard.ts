/**
 * P0.VR.3H — Draft route guard (preview-only, production nav blocked).
 */

import { COMPOSER_DRAFT_ROUTES, PRODUCTION_NAV_BLOCKED_ROUTES } from './constants.js';
import type { DraftRouteGuardResult } from './types.js';

export function isComposerDraftRoute(route: string): boolean {
  const normalized = route.replace(/\/$/, '') || '/';
  return (COMPOSER_DRAFT_ROUTES as readonly string[]).includes(normalized);
}

export function isProductionNavBlockedRoute(route: string): boolean {
  const normalized = route.replace(/\/$/, '') || '/';
  return (PRODUCTION_NAV_BLOCKED_ROUTES as readonly string[]).includes(normalized);
}

export function evaluateDraftRouteGuard(route: string): DraftRouteGuardResult {
  const blocked = isProductionNavBlockedRoute(route);
  return {
    route,
    previewOnly: true,
    productionNavBlocked: blocked,
    publishStatus: 'PREVIEW_ONLY',
    publiclyNavigable: false,
  };
}

export function requiresPreviewQueryParam(route: string): boolean {
  return isComposerDraftRoute(route);
}

/** Draft pages require ?preview=1 or designPreview=1 for direct access outside design workspace. */
export function isDraftRouteAccessible(pathname: string, searchParams: URLSearchParams): boolean {
  if (!isComposerDraftRoute(pathname)) return true;
  return searchParams.get('preview') === '1' || searchParams.get('designPreview') === '1';
}
