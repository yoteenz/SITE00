/**
 * P0.VR.3B — Normalize raw implementation routes into DesignScreenRecords.
 */

import type { RouteFamily, Site00RouteClassification } from '../p0vr2/types.js';
import type { DesignScreenRecord, ImplementationRouteRecord } from './types.js';

function normalizePath(path: string): string {
  let p = path.replace(/\/desktop(\/|\*|$)/, '$1').replace(/\/+$/, '') || '/';
  p = p.replace(/\/:projectSlug/g, '/:project');
  p = p.replace(/\/:batchId/g, '/:id');
  p = p.replace(/\/:assetId/g, '/:id');
  p = p.replace(/\/:credentialId/g, '/:id');
  p = p.replace(/\/:replayId/g, '/:id');
  p = p.replace(/\/:stepId/g, '/:id');
  return p;
}

function classifyRoute(normalizedPath: string): Site00RouteClassification {
  if (normalizedPath.startsWith('/studio-world/design')) return 'HOST_INTERNAL';
  if (normalizedPath.startsWith('/assts') || normalizedPath.startsWith('/admin')) return 'SYSTEM_INTERNAL';
  if (normalizedPath.startsWith('/projects/') || normalizedPath.startsWith('/studio/')) return 'FOUNDER_WORKSPACE';
  if (normalizedPath.startsWith('/control') || normalizedPath.startsWith('/account')) return 'CLIENT_WORKFLOW';
  if (
    normalizedPath.startsWith('/idnty') ||
    normalizedPath.startsWith('/bldr') ||
    normalizedPath.startsWith('/evolve') ||
    normalizedPath.includes('/marketing/')
  ) {
    return 'CLIENT_WORKFLOW';
  }
  if (normalizedPath.startsWith('/validation/')) return 'DEV_ONLY';
  return 'CUSTOMER_FACING';
}

function inferRouteFamily(normalizedPath: string): RouteFamily {
  if (normalizedPath === '/' || normalizedPath.startsWith('/origin')) return 'ORIGIN';
  if (normalizedPath === '/enter') return 'WAITING_ROOM';
  if (normalizedPath.startsWith('/idnty')) return 'IDENTITY';
  if (normalizedPath.startsWith('/bldr')) return 'BUILDER';
  if (normalizedPath.startsWith('/evolve')) return 'EVOLVE';
  if (normalizedPath.startsWith('/system')) return 'SYSTEM';
  if (normalizedPath.includes('/blueprint')) return 'BLUEPRINT';
  if (normalizedPath.startsWith('/assts')) return 'ASSET_VAULT';
  if (normalizedPath.startsWith('/origin/sign') || normalizedPath.startsWith('/account') || normalizedPath.startsWith('/control')) {
    return 'ACCOUNT';
  }
  if (['/about', '/journal', '/support', '/services', '/sites'].some((p) => normalizedPath.startsWith(p))) {
    return 'INFORMATION';
  }
  return 'OTHER';
}

function genericFamily(family: RouteFamily): string {
  switch (family) {
    case 'IDENTITY':
    case 'BUILDER':
    case 'EVOLVE':
      return 'ONBOARDING';
    case 'ACCOUNT':
      return 'AUTH_ACCOUNT';
    case 'INFORMATION':
      return 'INFORMATION';
    case 'BLUEPRINT':
      return 'BLUEPRINT';
    case 'ASSET_VAULT':
      return 'PRODUCTION';
    default:
      return family;
  }
}

function displayNameFromPath(normalizedPath: string): string {
  if (normalizedPath === '/') return 'Homepage';
  const tail = normalizedPath.split('/').filter(Boolean).pop() ?? 'root';
  return tail.replace(/-/g, ' ').replace(/:project|:id|:token/g, '').trim().toUpperCase() || 'ROOT';
}

function designableByDefault(classification: Site00RouteClassification, normalizedPath: string): boolean {
  if (classification === 'HOST_INTERNAL' || classification === 'DEV_ONLY') return false;
  if (classification === 'FOUNDER_WORKSPACE') return false;
  if (classification === 'SYSTEM_INTERNAL') return normalizedPath.startsWith('/assts');
  return true;
}

export function normalizeImplementationRoutesToDesignScreens(
  rawRoutes: ImplementationRouteRecord[],
): { screens: DesignScreenRecord[]; linkedRaw: ImplementationRouteRecord[] } {
  const groups = new Map<string, ImplementationRouteRecord[]>();

  for (const route of rawRoutes) {
    if (route.isRedirect || !route.reachable) continue;
    const key = normalizePath(route.pathPattern);
    const bucket = groups.get(key) ?? [];
    bucket.push(route);
    groups.set(key, bucket);
  }

  const screens: DesignScreenRecord[] = [];
  const linkedRaw: ImplementationRouteRecord[] = [];

  for (const [normalizedPath, routes] of groups) {
    const classification = classifyRoute(normalizedPath);
    const routeFamily = inferRouteFamily(normalizedPath);
    const designScreenId = `screen:${normalizedPath.replace(/^\//, '').replace(/\//g, '-').replace(/:/g, '') || 'root'}`;

    for (const r of routes) {
      r.designScreenId = designScreenId;
      linkedRaw.push(r);
    }

    screens.push({
      designScreenId,
      displayName: displayNameFromPath(normalizedPath),
      normalizedPath,
      routeFamily,
      genericRouteFamily: genericFamily(routeFamily),
      implementationRouteIds: routes.map((r) => r.implementationRouteId),
      componentName: routes.find((r) => r.componentHint)?.componentHint ?? null,
      classification,
      designableByDefault: designableByDefault(classification, normalizedPath),
      orphan: false,
      viewportCoverage: {
        mobile: { pageReferenceStatus: 'MISSING', backgroundAssetStatus: 'NOT_APPLICABLE', implementationCoverage: 'UNKNOWN' },
        tablet: { pageReferenceStatus: 'MISSING', backgroundAssetStatus: 'NOT_APPLICABLE', implementationCoverage: 'UNKNOWN' },
        desktop: { pageReferenceStatus: 'MISSING', backgroundAssetStatus: 'NOT_APPLICABLE', implementationCoverage: 'UNKNOWN' },
      },
    });
  }

  return { screens, linkedRaw };
}

export function normalizePathKey(path: string): string {
  return normalizePath(path);
}
