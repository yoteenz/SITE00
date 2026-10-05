/**
 * P0.VR.8R2 — Embedded FSBW repository legacy route audit snapshot.
 * Preserved as LEGACY_AUDIT_SNAPSHOT — not overwritten during reconciliation.
 */

import { PRODUCT_ASSET_FACTORY_ROUTE } from '../../productAssetFactory/p0paf1/constants.js';
import type { RecoveredRouteRecord } from './types.js';
import { LEGACY_AUDIT_SNAPSHOT_LABEL } from './constants.js';

const FSBW_AUDIT_ID = 'fsbw-legacy-route-audit:v1';
const FSBW_REPO = 'yoteenz/fsbw';

function route(
  projectId: string,
  routeId: string,
  path: string,
  pageName: string,
  sourceFile: string | null = null,
): RecoveredRouteRecord {
  return {
    routeId: `${projectId}:${routeId}`,
    repositoryId: FSBW_REPO,
    projectId,
    path,
    routePattern: path.replace(`/projects/${projectId}`, '/projects/:projectSlug'),
    pageName,
    module: routeId,
    sourceFile,
    parentRoute: null,
    childRoutes: [],
    dynamicParams: path.includes(':') ? ['projectSlug'] : [],
    visibility: 'ACTIVE',
    routeType: 'PAGE',
    lastAuditedAt: '2026-08-26T00:00:00.000Z',
    historicalCaptureIds: [],
    historicalReferenceIds: [],
    historicalCompletionState: null,
    screenId: routeId,
    sourceAuditId: FSBW_AUDIT_ID,
    routeCurrentness: 'ROUTE_STALE',
    captureCurrentness: 'CAPTURE_STALE',
    completionCurrentness: 'COMPLETION_STALE',
    referenceCurrentness: 'REFERENCE_MISSING',
  };
}

const GENERIC_BRAND_ROUTES = (projectId: string, displayName: string): RecoveredRouteRecord[] => [
  route(projectId, 'overview', `/projects/${projectId}`, `${displayName} Overview`),
  route(projectId, 'content-ops', `/projects/${projectId}/content-operations`, `${displayName} Content Ops`),
  route(projectId, 'experience-builder', `/projects/${projectId}/experience-builder`, `${displayName} Experience Builder`),
  route(projectId, 'production-hub', `/projects/${projectId}/production-hub`, `${displayName} Production Hub`),
  route(projectId, 'library', `/projects/${projectId}/library`, `${displayName} Library`),
];

const STUDIO_WORLD_WEBSITE_ROUTES: RecoveredRouteRecord[] = [
  route('studio-world', 'overview', '/projects/studio-world', 'Studio World Overview'),
  route('studio-world', 'studio-world-home', '/projects/studio-world', 'Studio World Home'),
  route('studio-world', 'studio-world-about', '/projects/studio-world/about', 'Studio World About'),
  route('studio-world', 'studio-world-work', '/projects/studio-world/work', 'Studio World Work'),
  route('studio-world', 'content-ops', '/projects/studio-world/content-operations', 'Studio World Content Ops'),
];

const FRONTAL_SLAYER_EXTRA: RecoveredRouteRecord[] = [
  route(
    'frontal-slayer',
    'product-assets',
    PRODUCT_ASSET_FACTORY_ROUTE,
    'Product Asset Factory',
    'shared/site00-studio-world-production/productAssetFactory/p0paf1/constants.ts',
  ),
];

/** @internal preserved snapshot */
export const FSBW_LEGACY_AUDIT_SNAPSHOT: RecoveredRouteRecord[] = [
  ...GENERIC_BRAND_ROUTES('frontal-slayer', 'FRONTAL SLAYER'),
  ...FRONTAL_SLAYER_EXTRA,
  ...GENERIC_BRAND_ROUTES('all-in-one-enterprises', 'ALL IN ONE ENTERPRISES'),
  ...STUDIO_WORLD_WEBSITE_ROUTES,
];

export function getFsbwLegacyAuditSnapshot(projectId: string): RecoveredRouteRecord[] {
  return FSBW_LEGACY_AUDIT_SNAPSHOT.filter((r) => r.projectId === projectId).map((r) => ({
    ...r,
    preservedLabel: LEGACY_AUDIT_SNAPSHOT_LABEL,
  })) as RecoveredRouteRecord[];
}

export function getFsbwLegacyAuditId(): string {
  return FSBW_AUDIT_ID;
}

export function getFsbwLegacyRouteCount(): number {
  return FSBW_LEGACY_AUDIT_SNAPSHOT.length;
}
