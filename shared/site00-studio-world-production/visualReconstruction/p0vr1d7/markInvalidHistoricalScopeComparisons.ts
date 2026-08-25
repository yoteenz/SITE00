/**
 * P0.VR.1D.7 — Preserve and mark invalid historical panel-vs-page comparisons.
 */

import { INVALID_SCOPE_COMPARISON_MARKER } from './constants.js';
import type { ExtractedScreenSummary } from '../p0vr1d4a/types.js';
import { panelReferenceUsedAsFullRouteAuthority } from './scopedReferenceDomRegionMap.js';
import { classifyVisualReferenceScope } from './classifyVisualReferenceScope.js';

export type HistoricalScopeComparisonRecord = ExtractedScreenSummary & {
  scopeComparisonMarker: typeof INVALID_SCOPE_COMPARISON_MARKER | 'VALID_SCOPE_COMPARISON';
  previousComparison: string;
  scope: string;
  scopeTargetId: string;
};

export function markInvalidHistoricalScopeComparisons(
  screens: ExtractedScreenSummary[],
  projectSlug = 'ndxbook',
): HistoricalScopeComparisonRecord[] {
  return screens.map((screen) => {
    const authority = classifyVisualReferenceScope({
      screenId: screen.screenId,
      viewportClass: screen.viewportClass,
      cropWidth: screen.viewport.width,
      cropHeight: screen.viewport.height,
      boardWidth: 1672,
      boardHeight: 941,
      route: screen.route,
      projectSlug,
      hasDeviceFrame: screen.viewportClass === 'mobile',
      hasGlobalNavigation: screen.screenId === 'DESKTOP_COMPOSITE_OVERVIEW',
    });

    const usedPanelAsFullRoute = panelReferenceUsedAsFullRouteAuthority(authority, screen.route);
    const previousComparison =
      screen.viewportClass === 'desktop' && authority.scope !== 'FULL_SCREEN_REFERENCE'
        ? `${screen.screenId} panel crop vs full route ${screen.route} @ ${screen.viewport.width}×${screen.viewport.height}`
        : `${screen.screenId} full-screen vs ${screen.route}`;

    return {
      ...screen,
      scopeComparisonMarker: usedPanelAsFullRoute ? INVALID_SCOPE_COMPARISON_MARKER : 'VALID_SCOPE_COMPARISON',
      previousComparison,
      scope: authority.scope,
      scopeTargetId: authority.scopeTargetId,
    };
  });
}

export function countInvalidHistoricalScopeComparisons(records: HistoricalScopeComparisonRecord[]): number {
  return records.filter((r) => r.scopeComparisonMarker === INVALID_SCOPE_COMPARISON_MARKER).length;
}
