/**
 * P0.VR.3H — NDXBOOK missing route discovery (conservative).
 */

import { NDX_DESIGN_SCREENS } from '../p0vr2/ndxPilotRegistration.js';
import { NDX_WORKSPACE_ROUTE_INVENTORY } from '../../founderWorkspace/cohesion/routeInventory.js';
import type { MissingPagePlanEntry } from './types.js';
import { P0_VR_3H_LINEAGE, COMPOSER_PAGE_AUTHORSHIP } from './constants.js';
import { classifyMissingPageCompletionMode } from './classifier.js';

const NDXBOOK_SLUG = 'ndxbook';

/** Canonical routes with implementations but missing from design pilot — not new router work. */
export function buildNdxbookMissingRoutes(): Omit<MissingPagePlanEntry, 'entryId'>[] {
  const pilotRoutes = new Set(
    NDX_DESIGN_SCREENS.map((s) => s.routePattern.replace(':projectSlug', NDXBOOK_SLUG)),
  );
  const inventory = [...NDX_WORKSPACE_ROUTE_INVENTORY];
  const canonicalOrPartial = inventory.filter(
    (r) => r.migrationStatus === 'CANONICAL' || r.migrationStatus === 'PARTIAL',
  );

  const gaps = canonicalOrPartial.filter((r) => {
    const ndxPath = r.path.replace(':projectSlug', NDXBOOK_SLUG);
    return !pilotRoutes.has(ndxPath) && !pilotRoutes.has(r.path);
  });

  return gaps.map((route) => {
    const ndxPath = route.path.replace(':projectSlug', NDXBOOK_SLUG);
    const mode = classifyMissingPageCompletionMode({
      projectId: 'NDXBOOK',
      screenId: `ndxbook-gap-${route.routeId}`,
      route: ndxPath,
      existingImplementationPath: `src/site00/pages/${route.component}.tsx`,
    });

    return {
      projectId: 'NDXBOOK' as const,
      sourceRepo: 'SITE00_REPO' as const,
      screenId: `ndxbook-gap-${route.routeId}`,
      displayName: route.routeId.replace(/-/g, ' ').toUpperCase(),
      route: ndxPath,
      family: 'NDXBOOK_WORKSPACE' as const,
      completionMode: mode,
      authorType: COMPOSER_PAGE_AUTHORSHIP.authorType,
      createdBySprint: P0_VR_3H_LINEAGE,
      reviewStatus: COMPOSER_PAGE_AUTHORSHIP.reviewStatus,
      publishStatus: COMPOSER_PAGE_AUTHORSHIP.publishStatus,
      contentProvenance: ['SOURCE_EXISTING_ROUTE'] as const,
      implementationStatus: 'BLOCKED' as const,
      reviewDimensions: ['VISUAL', 'FUNCTION'] as const,
      creativeDirectionRequired: mode === 'CREATIVE_COMPLEX',
      functionalReviewRequired: mode === 'FUNCTIONAL_COMPLEX' || mode === 'STRUCTURAL_COMPLEX',
      existingImplementationPath: `src/site00/pages/${route.component}.tsx`,
      blockedReason: 'EXISTING_IMPLEMENTATION — design pilot gap only; do not overwrite page.',
      sourceEvidence: ['shared/.../cohesion/routeInventory.ts', 'shared/.../p0vr2/ndxPilotRegistration.ts'],
    };
  });
}
