/**
 * P0.VR.3E — Route representative resolution for dynamic routes.
 */

import { findDesignScreen, resolveDesignScreenRoute } from '../p0vr2/designScreenRegistry.js';
import type { DesignScreenDefinition } from '../p0vr2/types.js';
import { isComposerDraftImplementationRoute } from '../p0vr3h/composerDraftSnapshots.js';

const REPRESENTATIVE_OVERRIDES: Record<string, string> = {
  '/idnty/:stateSlug': '/idnty/starting-at-zero',
  '/bldr/:classSlug': '/bldr/starting-at-zero',
  '/evolve/:pathSlug': '/evolve/starting-at-zero',
  '/projects/:projectSlug': '/projects/ndxbook',
  '/product/:slug': '/product/noir',
};

export function resolveRepresentativeRoute(screen: DesignScreenDefinition, projectId: string): {
  templateRoute: string;
  representativeRoute: string;
} {
  const templateRoute = resolveDesignScreenRoute(screen, projectId);
  if (screen.absoluteRoute) {
    return { templateRoute, representativeRoute: templateRoute };
  }
  for (const [pattern, resolved] of Object.entries(REPRESENTATIVE_OVERRIDES)) {
    if (templateRoute.includes(pattern.replace(/:[^/]+/g, '')) || templateRoute === pattern) {
      return { templateRoute, representativeRoute: resolved };
    }
  }
  return {
    templateRoute,
    representativeRoute: templateRoute.replace(':projectSlug', projectId),
  };
}

export function isMissingImplementationRoute(screen: DesignScreenDefinition): boolean {
  if (screen.dependencyClosure === 'IMPLEMENTED_DRAFT') return false;
  if (screen.routePattern && isComposerDraftImplementationRoute(screen.routePattern)) return false;
  return (
    screen.recordKind === 'SITE00_REQUIRED_MISSING_ROUTE' ||
    screen.recordKind === 'SITE00_IMPLIED_REQUIRED_ROUTE' ||
    screen.dependencyClosure === 'MISSING_ROUTE'
  );
}

export function resolveCaptureTarget(input: {
  projectId: string;
  screenId: string;
  routeOverride?: string;
}): { screen: DesignScreenDefinition; route: string; skip: boolean; skipReason?: string } | null {
  const screen = findDesignScreen(input.projectId, input.screenId);
  if (!screen) return null;
  if (isMissingImplementationRoute(screen)) {
    return { screen, route: '', skip: true, skipReason: 'IMPLEMENTATION_MISSING' };
  }
  const { representativeRoute } = resolveRepresentativeRoute(screen, input.projectId);
  return {
    screen,
    route: input.routeOverride ?? representativeRoute,
    skip: false,
  };
}
