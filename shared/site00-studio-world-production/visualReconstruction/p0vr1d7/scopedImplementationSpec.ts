/**
 * P0.VR.1D.7 — Scope-aware implementation spec bridge.
 */

import type { ScreenImplementationSpec } from '../p0vr1d1/types.js';
import type { ScopeAwareVisualAuthority, ScopedImplementationSpec } from './types.js';

export function buildScopedImplementationSpec(
  implementationSpec: ScreenImplementationSpec,
  scopeAuthority: ScopeAwareVisualAuthority,
): ScopedImplementationSpec {
  return {
    ...implementationSpec,
    route: scopeAuthority.route,
    referenceId: scopeAuthority.referenceId,
    scope: scopeAuthority.scope,
    scopeTargetId: scopeAuthority.scopeTargetId,
    scopeTargetType: scopeAuthority.scopeTargetType,
    rootSelector: scopeAuthority.rootSelector,
    scopeRootAttribute: scopeAuthority.scopeRootAttribute,
    comparisonMode: scopeAuthority.comparisonMode,
    targetBounds: { ...scopeAuthority.referenceBounds },
    fullRouteReferenceStatus: scopeAuthority.fullRouteReferenceStatus,
    viewportWidth: scopeAuthority.comparisonMode === 'SCOPED_REGION'
      ? scopeAuthority.referenceBounds.width
      : implementationSpec.viewportWidth,
    viewportHeight: scopeAuthority.comparisonMode === 'SCOPED_REGION'
      ? scopeAuthority.referenceBounds.height
      : implementationSpec.viewportHeight,
  };
}

export function scopeVisualScoreLabel(scopeAuthority: ScopeAwareVisualAuthority): string {
  if (scopeAuthority.scope === 'FULL_SCREEN_REFERENCE') {
    return `${scopeAuthority.screenId}_ROUTE_VISUAL_SCORE`;
  }
  if (scopeAuthority.scope === 'WORKSPACE_PANEL_REFERENCE') {
    return `${scopeAuthority.scopeTargetId}_PANEL_VISUAL_SCORE`;
  }
  if (scopeAuthority.scope === 'MODULE_REFERENCE') {
    return `${scopeAuthority.scopeTargetId}_MODULE_VISUAL_SCORE`;
  }
  return `${scopeAuthority.scopeTargetId}_SCOPED_VISUAL_SCORE`;
}

export function founderInspectScopeLabel(scope: ScopeAwareVisualAuthority['scope']): string {
  switch (scope) {
    case 'FULL_SCREEN_REFERENCE':
      return 'FULL SCREEN';
    case 'WORKSPACE_PANEL_REFERENCE':
      return 'PANEL';
    case 'MODULE_REFERENCE':
      return 'MODULE';
    case 'COMPONENT_REFERENCE':
      return 'COMPONENT';
    case 'INTERACTION_STATE_REFERENCE':
      return 'STATE';
    case 'ARTWORK_REFERENCE':
      return 'ARTWORK';
    default:
      return 'UNKNOWN';
  }
}

export function founderInspectTargetLabel(scopeAuthority: ScopeAwareVisualAuthority): string {
  if (scopeAuthority.scope === 'FULL_SCREEN_REFERENCE') {
    return scopeAuthority.route;
  }
  return scopeAuthority.scopeTargetId.replace(/^ndx\.desktop\./, '').replace(/-/g, ' ').toUpperCase();
}
