/**
 * Quarantine invalid visual references — preserve history, remove false authority.
 */

import type { VisualReferenceRecord } from './types.js';
import type { ReferenceQuarantineClassification, VisualReferenceCaptureMetadata } from './captureAuthTypes.js';
import { signInCaptureMayProvideProjectsHierarchyAuthority } from './surfaceIdentityVerification.js';

export function isReferenceQuarantinedForRoute(ref: VisualReferenceRecord, targetRoute: string): boolean {
  const meta = ref.captureMetadata;
  if (!meta) return false;
  if (meta.surfaceIdentity !== 'VALID_TARGET_SURFACE') {
    if (targetRoute === '/projects' || targetRoute.startsWith('/projects')) return true;
  }
  if (meta.invalidForTargetRoutes?.includes(targetRoute)) return true;
  if (meta.quarantineClassification === 'AUTH_REDIRECT_CAPTURE' && targetRoute === '/projects') return true;
  return false;
}

export function applyQuarantineToReference(
  ref: VisualReferenceRecord,
  classification: ReferenceQuarantineClassification,
  invalidForRoutes: string[],
): VisualReferenceRecord {
  const captureMetadata: VisualReferenceCaptureMetadata = {
    ...(ref.captureMetadata ?? {
      requestedRoute: ref.route,
      finalUrl: ref.sourceUrl ?? ref.route,
      redirectChain: [],
      capturePrincipal: 'PUBLIC_GUEST',
      authenticated: false,
      surfaceIdentity: 'CAPTURE_FAILED',
      surfaceIdentityConfidence: 0,
      authContextVersion: null,
      accessClassification: 'PUBLIC_REFERENCE',
    }),
    quarantineClassification: classification,
    invalidForTargetRoutes: [...new Set([...(ref.captureMetadata?.invalidForTargetRoutes ?? []), ...invalidForRoutes])],
  };

  const downgradedAuthority = { ...ref.authority };
  if (classification === 'AUTH_REDIRECT_CAPTURE') {
    downgradedAuthority.LAYOUT = 'NONE';
    downgradedAuthority.HIERARCHY = 'NONE';
    downgradedAuthority.NAVIGATION = 'INSPIRATIONAL';
  }

  return {
    ...ref,
    captureMetadata,
    authority: downgradedAuthority,
    stalenessState: 'STALE',
    notes: ref.notes ? `${ref.notes} · QUARANTINED:${classification}` : `QUARANTINED:${classification}`,
    updatedAt: new Date().toISOString(),
  };
}

export function quarantineExistingInvalidReferences(references: VisualReferenceRecord[]): VisualReferenceRecord[] {
  return references.map((ref) => {
    const meta = ref.captureMetadata;
    if (meta?.quarantineClassification) return ref;

    const looksLikeSignIn =
      ref.route === '/projects' &&
      (ref.notes?.toLowerCase().includes('sign-in') ||
        ref.sourceUrl?.includes('sign-in') ||
        (ref.referenceRoles.includes('CURRENT_FUNCTIONAL_SURFACE') &&
          !signInCaptureMayProvideProjectsHierarchyAuthority(meta?.surfaceIdentity ?? 'CAPTURE_FAILED')));

    if (ref.route === '/projects' && !meta) {
      return applyQuarantineToReference(ref, 'AUTH_REDIRECT_CAPTURE', ['/projects']);
    }

    if (meta && meta.surfaceIdentity !== 'VALID_TARGET_SURFACE' && ref.route === '/projects') {
      return applyQuarantineToReference(
        ref,
        meta.quarantineClassification ?? 'INVALID_FOR_TARGET_ROUTE',
        meta.invalidForTargetRoutes ?? ['/projects'],
      );
    }

    if (looksLikeSignIn) {
      return applyQuarantineToReference(ref, 'AUTH_REDIRECT_CAPTURE', ['/projects']);
    }

    return ref;
  });
}

export function referenceEligibleForPackageSelection(
  ref: VisualReferenceRecord,
  targetRoute: string,
  desiredRoles: string[],
): boolean {
  if (isReferenceQuarantinedForRoute(ref, targetRoute)) return false;
  if (
    ref.referenceRoles.includes('CURRENT_FUNCTIONAL_SURFACE') &&
    !signInCaptureMayProvideProjectsHierarchyAuthority(ref.captureMetadata?.surfaceIdentity ?? 'VALID_TARGET_SURFACE')
  ) {
    return false;
  }
  if (desiredRoles.includes('CURRENT_FUNCTIONAL_SURFACE') && ref.route !== '/projects') {
    if (ref.captureMetadata?.surfaceIdentity && ref.captureMetadata.surfaceIdentity !== 'VALID_TARGET_SURFACE') {
      return false;
    }
  }
  return true;
}
