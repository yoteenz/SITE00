/**
 * P0.VR.1D.7 — Classify extracted reference scope from evidence (not filename alone).
 */

import type { ExtractedScreenReference } from '../p0vr1d1/types.js';
import { resolveScopeTargetDefinition } from './scopeTargetRegistry.js';
import type { FullRouteReferenceStatus, ScopeAwareVisualAuthority, VisualReferenceScope } from './types.js';

export type ClassifyVisualReferenceScopeInput = {
  screenId: string;
  viewportClass: 'desktop' | 'mobile';
  cropWidth: number;
  cropHeight: number;
  boardWidth: number;
  boardHeight: number;
  surfaceType?: string;
  moduleLabel?: string;
  route?: string;
  projectSlug?: string;
  hasDeviceFrame?: boolean;
  hasGlobalNavigation?: boolean;
};

function cropCoverage(input: ClassifyVisualReferenceScopeInput): number {
  const boardArea = Math.max(input.boardWidth * input.boardHeight, 1);
  return (input.cropWidth * input.cropHeight) / boardArea;
}

function inferScopeFromEvidence(input: ClassifyVisualReferenceScopeInput): VisualReferenceScope {
  const registry = resolveScopeTargetDefinition(input.screenId, input.projectSlug);
  if (registry) return registry.scope;

  if (input.viewportClass === 'mobile' || input.hasDeviceFrame) {
    return 'FULL_SCREEN_REFERENCE';
  }

  const coverage = cropCoverage(input);
  if (coverage >= 0.85 && input.hasGlobalNavigation) {
    return 'FULL_SCREEN_REFERENCE';
  }
  if (coverage >= 0.35) {
    return 'WORKSPACE_PANEL_REFERENCE';
  }
  if (coverage >= 0.12) {
    return 'MODULE_REFERENCE';
  }
  if (coverage >= 0.04) {
    return 'COMPONENT_REFERENCE';
  }
  return 'ARTWORK_REFERENCE';
}

function resolveFullRouteStatus(scope: VisualReferenceScope, standaloneRoute: string | null): FullRouteReferenceStatus {
  if (scope === 'FULL_SCREEN_REFERENCE') return 'FULL_SCREEN';
  if (!standaloneRoute) return 'MISSING';
  return 'PARTIAL_AUTHORITY_ONLY';
}

export function classifyVisualReferenceScope(
  input: ClassifyVisualReferenceScopeInput,
): ScopeAwareVisualAuthority {
  const registry = resolveScopeTargetDefinition(input.screenId, input.projectSlug);
  const scope = inferScopeFromEvidence(input);
  const scopeTargetId = registry?.scopeTargetId ?? input.route ?? input.screenId;
  const scopeTargetType = registry?.scopeTargetType ?? (scope === 'FULL_SCREEN_REFERENCE' ? 'ROUTE' : 'CANONICAL_REGION');
  const route = registry?.route ?? input.route ?? `/projects/${input.projectSlug ?? 'ndxbook'}`;
  const rootSelector = registry?.rootSelector ?? '.site00-fws-canvas';
  const comparisonMode = registry?.comparisonMode ?? (scope === 'FULL_SCREEN_REFERENCE' ? 'FULL_ROUTE' : 'SCOPED_REGION');
  const standaloneRoute = registry?.standaloneRoute ?? null;
  const fullRouteReferenceStatus = resolveFullRouteStatus(scope, standaloneRoute);
  const pixelPassEligible = scope === 'FULL_SCREEN_REFERENCE' || comparisonMode === 'SCOPED_REGION';

  return {
    referenceId: input.screenId,
    screenId: input.screenId,
    scope,
    scopeTargetId,
    scopeTargetType,
    route,
    rootSelector,
    scopeRootAttribute: registry?.scopeRootAttribute ?? null,
    comparisonMode,
    referenceBounds: { width: input.cropWidth, height: input.cropHeight },
    fullRouteReferenceStatus,
    standaloneRoute,
    pixelPassEligible,
  };
}

export function classifyExtractedScreenReference(
  screen: ExtractedScreenReference,
  boardWidth: number,
  boardHeight: number,
  projectSlug = 'ndxbook',
): ScopeAwareVisualAuthority {
  const cropWidth = Math.round(screen.bounds.width * boardWidth);
  const cropHeight = Math.round(screen.bounds.height * boardHeight);
  const viewportClass: 'desktop' | 'mobile' = screen.viewportClass === 'mobile' ? 'mobile' : 'desktop';
  return classifyVisualReferenceScope({
    screenId: screen.screenId,
    viewportClass,
    cropWidth,
    cropHeight,
    boardWidth,
    boardHeight,
    surfaceType: screen.surfaceType,
    moduleLabel: screen.moduleLabel,
    route: screen.route,
    projectSlug,
    hasDeviceFrame: viewportClass === 'mobile',
    hasGlobalNavigation: screen.screenId === 'DESKTOP_COMPOSITE_OVERVIEW',
  });
}
