/**
 * P0.VR.1D.7 — Scope target registry for NDX founder board extractions.
 */

import {
  NDX_DESKTOP_SCREEN_SPECS,
  NDX_MOBILE_SCREEN_SPECS,
} from '../../../site00-brand-lore/visualReconstruction/ndxProjectHubReferenceDecomposition.js';
import { NDX_DESKTOP_COMPOSITE_ROUTE, NDX_DESKTOP_SCOPE_ROOTS } from './constants.js';
import type { ScopedComparisonMode, ScopeTargetType, VisualReferenceScope } from './types.js';

export type ScopeTargetDefinition = {
  screenId: string;
  viewportClass: 'desktop' | 'mobile';
  scope: VisualReferenceScope;
  scopeTargetId: string;
  scopeTargetType: ScopeTargetType;
  route: string;
  standaloneRoute: string | null;
  rootSelector: string;
  scopeRootAttribute: string | null;
  comparisonMode: ScopedComparisonMode;
  panelClassHint?: string;
};

const DESKTOP_PANEL_REGISTRY: Record<string, Omit<ScopeTargetDefinition, 'screenId' | 'viewportClass'>> = {
  DESKTOP_COMPOSITE_OVERVIEW: {
    scope: 'FULL_SCREEN_REFERENCE',
    scopeTargetId: NDX_DESKTOP_SCOPE_ROOTS.overview,
    scopeTargetType: 'ROUTE',
    route: NDX_DESKTOP_COMPOSITE_ROUTE,
    standaloneRoute: NDX_DESKTOP_COMPOSITE_ROUTE,
    rootSelector: '.site00-fws-hub-board',
    scopeRootAttribute: NDX_DESKTOP_SCOPE_ROOTS.overview,
    comparisonMode: 'FULL_ROUTE',
    panelClassHint: 'site00-fws-hub-board',
  },
  DESKTOP_CAMPAIGN_BOARD: {
    scope: 'WORKSPACE_PANEL_REFERENCE',
    scopeTargetId: NDX_DESKTOP_SCOPE_ROOTS.campaignBoardPanel,
    scopeTargetType: 'CANONICAL_REGION',
    route: NDX_DESKTOP_COMPOSITE_ROUTE,
    standaloneRoute: '/projects/ndxbook/content-operations/campaign-board',
    rootSelector: `[data-vr-scope="${NDX_DESKTOP_SCOPE_ROOTS.campaignBoardPanel}"]`,
    scopeRootAttribute: NDX_DESKTOP_SCOPE_ROOTS.campaignBoardPanel,
    comparisonMode: 'SCOPED_REGION',
    panelClassHint: 'site00-fws-hub-tape--campaign',
  },
  DESKTOP_EXPERIMENT_01: {
    scope: 'WORKSPACE_PANEL_REFERENCE',
    scopeTargetId: NDX_DESKTOP_SCOPE_ROOTS.experimentPanel,
    scopeTargetType: 'CANONICAL_REGION',
    route: NDX_DESKTOP_COMPOSITE_ROUTE,
    standaloneRoute: '/projects/ndxbook/marketing-expression/experiment-01',
    rootSelector: `[data-vr-scope="${NDX_DESKTOP_SCOPE_ROOTS.experimentPanel}"]`,
    scopeRootAttribute: NDX_DESKTOP_SCOPE_ROOTS.experimentPanel,
    comparisonMode: 'SCOPED_REGION',
    panelClassHint: 'site00-fws-hub-tape--experiment',
  },
  DESKTOP_CONTENT_OPS: {
    scope: 'WORKSPACE_PANEL_REFERENCE',
    scopeTargetId: NDX_DESKTOP_SCOPE_ROOTS.contentOpsPanel,
    scopeTargetType: 'CANONICAL_REGION',
    route: NDX_DESKTOP_COMPOSITE_ROUTE,
    standaloneRoute: '/projects/ndxbook/content-operations',
    rootSelector: `[data-vr-scope="${NDX_DESKTOP_SCOPE_ROOTS.contentOpsPanel}"]`,
    scopeRootAttribute: NDX_DESKTOP_SCOPE_ROOTS.contentOpsPanel,
    comparisonMode: 'SCOPED_REGION',
    panelClassHint: 'site00-fws-hub-tape--content-ops',
  },
  DESKTOP_CULTURAL_INTELLIGENCE: {
    scope: 'MODULE_REFERENCE',
    scopeTargetId: NDX_DESKTOP_SCOPE_ROOTS.culturalIntelligencePanel,
    scopeTargetType: 'CANONICAL_REGION',
    route: NDX_DESKTOP_COMPOSITE_ROUTE,
    standaloneRoute: '/projects/ndxbook/cultural-intelligence',
    rootSelector: `[data-vr-scope="${NDX_DESKTOP_SCOPE_ROOTS.culturalIntelligencePanel}"]`,
    scopeRootAttribute: NDX_DESKTOP_SCOPE_ROOTS.culturalIntelligencePanel,
    comparisonMode: 'SCOPED_REGION',
    panelClassHint: 'site00-fws-hub-tape--cultural-intelligence',
  },
  DESKTOP_CHARACTER_LAB: {
    scope: 'WORKSPACE_PANEL_REFERENCE',
    scopeTargetId: NDX_DESKTOP_SCOPE_ROOTS.characterLabPanel,
    scopeTargetType: 'CANONICAL_REGION',
    route: NDX_DESKTOP_COMPOSITE_ROUTE,
    standaloneRoute: '/projects/ndxbook/character/discovery',
    rootSelector: `[data-vr-scope="${NDX_DESKTOP_SCOPE_ROOTS.characterLabPanel}"]`,
    scopeRootAttribute: NDX_DESKTOP_SCOPE_ROOTS.characterLabPanel,
    comparisonMode: 'SCOPED_REGION',
    panelClassHint: 'site00-fws-hub-tape--character-lab',
  },
};

function mobileRoute(projectSlug: string, routeSuffix: string): string {
  return `/projects/${projectSlug}${routeSuffix}`;
}

export function resolveScopeTargetDefinition(
  screenId: string,
  projectSlug = 'ndxbook',
): ScopeTargetDefinition | null {
  const desktop = DESKTOP_PANEL_REGISTRY[screenId];
  if (desktop) {
    return { screenId, viewportClass: 'desktop', ...desktop };
  }

  const mobileSpec = NDX_MOBILE_SCREEN_SPECS.find((s) => s.screenId === screenId);
  if (mobileSpec) {
    const route = mobileRoute(projectSlug, mobileSpec.routeSuffix);
    return {
      screenId,
      viewportClass: 'mobile',
      scope: 'FULL_SCREEN_REFERENCE',
      scopeTargetId: route,
      scopeTargetType: 'ROUTE',
      route,
      standaloneRoute: route,
      rootSelector: '.site00-fws-mobile-chrome',
      scopeRootAttribute: null,
      comparisonMode: 'FULL_ROUTE',
    };
  }

  return null;
}

export function allNdxScopeTargetDefinitions(projectSlug = 'ndxbook'): ScopeTargetDefinition[] {
  const desktop = NDX_DESKTOP_SCREEN_SPECS.map((spec) => resolveScopeTargetDefinition(spec.screenId, projectSlug)!);
  const mobile = NDX_MOBILE_SCREEN_SPECS.map((spec) => resolveScopeTargetDefinition(spec.screenId, projectSlug)!);
  return [...desktop, ...mobile];
}
