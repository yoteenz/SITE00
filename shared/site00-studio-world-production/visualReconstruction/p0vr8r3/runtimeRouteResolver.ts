/**
 * P0.VR.8R3R2 — Resolve display routes to navigable runtime capture URLs.
 */

import { findDesignScreen, resolveDesignScreenRoute } from '../p0vr2/designScreenRegistry.js';
import { resolveRepresentativeRoute } from '../p0vr3e/routeRepresentativeResolver.js';
import type { ProjectPageRecord } from '../p0vr8/types.js';
import type { PageRouteIdentity, RouteResolutionReceipt } from './pageRouteIdentity.js';

const LEGACY_DISPLAY_ALIASES: Record<string, string> = {
  '/OVERVIEW': '/projects/:projectSlug/overview',
  '/overview': '/projects/:projectSlug/overview',
};

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return '/';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function slugForProject(projectId: string): string {
  return projectId.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

function expandPattern(pattern: string, projectId: string): string {
  const slug = slugForProject(projectId);
  return pattern
    .replace(/:projectSlug/g, slug)
    .replace(/:slug/g, slug)
    .replace(/:stateSlug/g, 'starting-at-zero')
    .replace(/:classSlug/g, 'starting-at-zero')
    .replace(/:pathSlug/g, 'starting-at-zero');
}

function isAbsoluteRuntimePath(path: string): boolean {
  return path.startsWith('/projects/') || path.startsWith('/idnty/') || path.startsWith('/bldr/') || path.startsWith('/evolve/');
}

export function resolveRuntimeRouteForPage(
  page: ProjectPageRecord,
  options?: { baseUrl?: string | null },
): PageRouteIdentity {
  const displayRoute = normalizePath(page.route || page.normalizedRoute || '/');
  const baseUrl = options?.baseUrl?.replace(/\/$/, '') ?? null;

  let routePattern: string | null = page.routeSource ?? null;
  let resolvedRuntimePath: string | null = null;
  let resolutionSource: string | null = null;
  let resolutionConfidence: PageRouteIdentity['resolutionConfidence'] = 'NONE';
  let resolutionEvidence: string | null = null;

  const legacyAliasPattern =
    LEGACY_DISPLAY_ALIASES[displayRoute] ?? LEGACY_DISPLAY_ALIASES[displayRoute.toUpperCase()];
  if (legacyAliasPattern) {
    routePattern = legacyAliasPattern;
    resolvedRuntimePath = normalizePath(expandPattern(legacyAliasPattern, page.projectId));
    resolutionSource = 'legacyDisplayAlias';
    resolutionConfidence = 'HIGH';
    resolutionEvidence = `${displayRoute}→${legacyAliasPattern}`;
  }

  if (!resolvedRuntimePath && page.representativeRoute && isAbsoluteRuntimePath(page.representativeRoute)) {
    resolvedRuntimePath = normalizePath(page.representativeRoute);
    resolutionSource = 'representativeRoute';
    resolutionConfidence = 'HIGH';
    resolutionEvidence = 'page.representativeRoute';
  }

  const screen = findDesignScreen(page.projectId, page.screenId);
  if (!resolvedRuntimePath && screen) {
    routePattern = screen.routePattern;
    const { representativeRoute, templateRoute } = resolveRepresentativeRoute(screen, page.projectId);
    resolvedRuntimePath = normalizePath(representativeRoute || resolveDesignScreenRoute(screen, page.projectId));
    resolutionSource = 'designScreenRegistry';
    resolutionConfidence = 'HIGH';
    resolutionEvidence = `screen:${screen.screenId};template:${templateRoute}`;
  }

  if (!resolvedRuntimePath && routePattern) {
    resolvedRuntimePath = normalizePath(expandPattern(routePattern, page.projectId));
    resolutionSource = 'routePatternExpansion';
    resolutionConfidence = 'MEDIUM';
    resolutionEvidence = routePattern;
  }

  if (!resolvedRuntimePath && isAbsoluteRuntimePath(displayRoute)) {
    resolvedRuntimePath = displayRoute;
    resolutionSource = 'displayRouteAbsolute';
    resolutionConfidence = 'LOW';
    resolutionEvidence = displayRoute;
  }

  if (!resolvedRuntimePath && page.normalizedRoute && isAbsoluteRuntimePath(page.normalizedRoute)) {
    resolvedRuntimePath = normalizePath(page.normalizedRoute);
    resolutionSource = 'normalizedRoute';
    resolutionConfidence = 'MEDIUM';
    resolutionEvidence = page.normalizedRoute;
  }

  if (!resolvedRuntimePath && screen?.routePattern) {
    resolvedRuntimePath = normalizePath(expandPattern(screen.routePattern, page.projectId));
    resolutionSource = 'screenPatternFallback';
    resolutionConfidence = 'MEDIUM';
    resolutionEvidence = screen.routePattern;
  }

  const routeValid = Boolean(resolvedRuntimePath && resolvedRuntimePath.startsWith('/'));
  const captureUrl = routeValid && baseUrl ? `${baseUrl}${resolvedRuntimePath}` : resolvedRuntimePath;

  return {
    projectId: page.projectId,
    pageId: page.pageId,
    displayRoute,
    routePattern,
    resolvedRuntimePath: routeValid ? resolvedRuntimePath : null,
    captureUrl: routeValid ? captureUrl : null,
    sourceComponent: page.sourceFile ?? page.sharedComponentPaths?.[0] ?? null,
    routeParams: routePattern?.includes(':') ? ['slug'] : [],
    routeValid,
    resolutionSource,
    resolutionConfidence: routeValid ? resolutionConfidence : 'NONE',
    resolutionEvidence,
  };
}

export function buildRouteResolutionReceipt(identity: PageRouteIdentity): RouteResolutionReceipt {
  return {
    pageId: identity.pageId,
    displayRoute: identity.displayRoute,
    resolvedRuntimePath: identity.resolvedRuntimePath,
    captureUrl: identity.captureUrl,
    resolutionSource: identity.resolutionSource,
    valid: identity.routeValid,
    error: identity.routeValid ? null : 'RUNTIME_URL_UNRESOLVED',
  };
}

export function resolveRuntimeRoutesForProject(
  pages: ProjectPageRecord[],
  options?: { baseUrl?: string | null },
): { identities: PageRouteIdentity[]; receipts: RouteResolutionReceipt[]; resolvedCount: number; unresolvedCount: number } {
  const activePages = pages.filter((p) => p.isActive && p.status !== 'ROUTE_MISSING' && p.status !== 'REMOVED');
  const identities = activePages.map((page) => resolveRuntimeRouteForPage(page, options));
  const receipts = identities.map(buildRouteResolutionReceipt);
  const resolvedCount = receipts.filter((r) => r.valid).length;
  return {
    identities,
    receipts,
    resolvedCount,
    unresolvedCount: activePages.length - resolvedCount,
  };
}
