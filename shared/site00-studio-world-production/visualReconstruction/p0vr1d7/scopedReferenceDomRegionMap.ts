/**
 * P0.VR.1D.7 — Scope-aware reference ↔ DOM region mapping.
 */

import { buildReferenceDomRegionMap } from '../p0vr1d4/referenceDomRegionMap.js';
import type { ReferenceDomRegionMap } from '../p0vr1d4/types.js';
import { canonicalRegionIdsForScreen } from '../p0vr1d4/normalizeReferenceRegionId.js';
import type { ScopeAwareVisualAuthority } from './types.js';
import { INVALID_SCOPE_COMPARISON_MARKER } from './constants.js';

export function buildScopedReferenceDomRegionMap(input: {
  scopeAuthority: ScopeAwareVisualAuthority;
  referenceRegionIds: string[];
  domRegionIds: string[];
}): ReferenceDomRegionMap & {
  scopeRootSelector: string;
  comparisonScope: string;
  invalidScopeComparison: boolean;
} {
  const canonicalForScreen = new Set(canonicalRegionIdsForScreen(input.scopeAuthority.screenId));
  const isPanelOrModule =
    input.scopeAuthority.scope === 'WORKSPACE_PANEL_REFERENCE' ||
    input.scopeAuthority.scope === 'MODULE_REFERENCE' ||
    input.scopeAuthority.scope === 'COMPONENT_REFERENCE';

  const filteredDomIds = isPanelOrModule
    ? input.domRegionIds.filter((id) => {
        if (canonicalForScreen.has(id)) return true;
        return canonicalForScreen.size === 0 || id.includes('campaign') || id.includes('experiment') || id.includes('content-ops') || id.includes('cultural') || id.includes('character');
      })
    : input.domRegionIds;

  const base = buildReferenceDomRegionMap({
    screenId: input.scopeAuthority.screenId,
    route: input.scopeAuthority.route,
    referenceRegionIds: input.referenceRegionIds,
    domRegionIds: filteredDomIds,
  });

  const scopedEntries = base.entries.map((entry) => ({
    ...entry,
    domSelector: isPanelOrModule
      ? `${input.scopeAuthority.rootSelector} ${entry.domSelector}`
      : entry.domSelector,
    route: input.scopeAuthority.route,
  }));

  const invalidScopeComparison =
    isPanelOrModule &&
    input.scopeAuthority.standaloneRoute != null &&
    input.scopeAuthority.standaloneRoute !== input.scopeAuthority.route;

  return {
    ...base,
    entries: scopedEntries,
    scopeRootSelector: input.scopeAuthority.rootSelector,
    comparisonScope: isPanelOrModule ? input.scopeAuthority.scopeTargetId : input.scopeAuthority.route,
    invalidScopeComparison,
  };
}

export function panelReferenceUsedAsFullRouteAuthority(
  scopeAuthority: ScopeAwareVisualAuthority,
  comparedRoute: string,
): boolean {
  if (scopeAuthority.scope === 'FULL_SCREEN_REFERENCE') return false;
  return scopeAuthority.standaloneRoute === comparedRoute && comparedRoute !== scopeAuthority.route;
}

export function markComparisonScopeValidity(input: {
  scopeAuthority: ScopeAwareVisualAuthority;
  comparedRoute: string;
  comparisonMode: string;
}): typeof INVALID_SCOPE_COMPARISON_MARKER | 'VALID_SCOPE_COMPARISON' {
  if (panelReferenceUsedAsFullRouteAuthority(input.scopeAuthority, input.comparedRoute)) {
    return INVALID_SCOPE_COMPARISON_MARKER;
  }
  if (
    input.scopeAuthority.comparisonMode === 'SCOPED_REGION' &&
    input.comparisonMode === 'FULL_ROUTE'
  ) {
    return INVALID_SCOPE_COMPARISON_MARKER;
  }
  return 'VALID_SCOPE_COMPARISON';
}
