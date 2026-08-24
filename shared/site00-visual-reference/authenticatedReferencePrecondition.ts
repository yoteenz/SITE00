/**
 * Authenticated reference precondition checks for private route preparation.
 */

import type { HostVisualMemory, VisualReferenceRecord, ViewportClass } from './types.js';
import { routeRequiresAuthentication } from './captureAuthTypes.js';
import { isReferenceQuarantinedForRoute } from './referenceQuarantine.js';

export type AuthenticatedReferenceStatus = {
  route: string;
  viewportClass: ViewportClass;
  status: 'VALID' | 'INVALID' | 'STALE' | 'MISSING';
  referenceId: string | null;
  surfaceIdentity: string | null;
  capturePrincipal: string | null;
};

export function evaluateAuthenticatedReferenceForRoute(
  references: VisualReferenceRecord[],
  route: string,
  viewportClass: ViewportClass,
): AuthenticatedReferenceStatus {
  const match = references.find((r) => r.route === route && r.viewportClass === viewportClass);
  if (!match) {
    return { route, viewportClass, status: 'MISSING', referenceId: null, surfaceIdentity: null, capturePrincipal: null };
  }

  if (isReferenceQuarantinedForRoute(match, route)) {
    return {
      route,
      viewportClass,
      status: 'INVALID',
      referenceId: match.id,
      surfaceIdentity: match.captureMetadata?.surfaceIdentity ?? 'UNKNOWN',
      capturePrincipal: match.captureMetadata?.capturePrincipal ?? null,
    };
  }

  if (match.captureMetadata?.surfaceIdentity !== 'VALID_TARGET_SURFACE') {
    return {
      route,
      viewportClass,
      status: 'INVALID',
      referenceId: match.id,
      surfaceIdentity: match.captureMetadata?.surfaceIdentity ?? 'UNKNOWN',
      capturePrincipal: match.captureMetadata?.capturePrincipal ?? null,
    };
  }

  if (match.stalenessState === 'STALE' || match.stalenessState === 'SUPERSEDED') {
    return {
      route,
      viewportClass,
      status: 'STALE',
      referenceId: match.id,
      surfaceIdentity: match.captureMetadata.surfaceIdentity,
      capturePrincipal: match.captureMetadata.capturePrincipal,
    };
  }

  return {
    route,
    viewportClass,
    status: 'VALID',
    referenceId: match.id,
    surfaceIdentity: match.captureMetadata?.surfaceIdentity ?? 'VALID_TARGET_SURFACE',
    capturePrincipal: match.captureMetadata?.capturePrincipal ?? null,
  };
}

export function assertAuthenticatedProjectsReferencesReady(
  host: HostVisualMemory,
  options?: { requireMobile?: boolean },
): void {
  const desktop = evaluateAuthenticatedReferenceForRoute(host.references, '/projects', 'DESKTOP');
  if (desktop.status === 'INVALID' || desktop.status === 'MISSING') {
    throw new Error(
      `AUTHENTICATED_REFERENCE_REQUIRED — Projects desktop capture ${desktop.status.toLowerCase()} (${desktop.surfaceIdentity ?? 'unknown surface'})`,
    );
  }

  if (options?.requireMobile) {
    const mobile = evaluateAuthenticatedReferenceForRoute(host.references, '/projects', 'MOBILE');
    if (mobile.status === 'INVALID' || mobile.status === 'MISSING') {
      throw new Error(
        `AUTHENTICATED_REFERENCE_REQUIRED — Projects mobile capture ${mobile.status.toLowerCase()}`,
      );
    }
  }
}

export function countValidHostReferences(host: HostVisualMemory): number {
  return host.references.filter(
    (r: VisualReferenceRecord) =>
      r.captureMetadata?.surfaceIdentity === 'VALID_TARGET_SURFACE' ||
      (!routeRequiresAuthentication(r.route) && !isReferenceQuarantinedForRoute(r, r.route)),
  ).length;
}
