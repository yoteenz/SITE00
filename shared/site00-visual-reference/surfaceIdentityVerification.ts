/**
 * Verify captured screenshot represents the requested authenticated surface.
 */

import type { CapturePrincipal, SurfaceIdentityResult, VisualReferenceCaptureMetadata } from './captureAuthTypes.js';
import { ROUTE_SURFACE_ASSERTIONS, routeRequiresAuthentication } from './captureAuthTypes.js';

export type SurfaceIdentityVerificationInput = {
  requestedRoute: string;
  finalUrl: string;
  redirectChain: string[];
  capturePrincipal: CapturePrincipal;
  authenticated: boolean;
  domEvidence?: {
    hasRequiredSelectors: boolean;
    hasForbiddenSelectors: boolean;
    bodyTextSample?: string;
  };
};

function normalizePath(urlOrPath: string): string {
  try {
    const u = new URL(urlOrPath);
    return u.pathname.replace(/\/$/, '') || '/';
  } catch {
    return urlOrPath.split('?')[0]?.replace(/\/$/, '') || '/';
  }
}

function isSignInPath(path: string): boolean {
  return (
    path === '/origin/sign-in' ||
    path === '/sign-in' ||
    path.startsWith('/origin/sign-in/') ||
    path.includes('sign-in')
  );
}

export function verifyCapturedSurfaceIdentity(input: SurfaceIdentityVerificationInput): {
  surfaceIdentity: SurfaceIdentityResult;
  confidence: number;
  metadata: Pick<
    VisualReferenceCaptureMetadata,
    'surfaceIdentity' | 'surfaceIdentityConfidence' | 'invalidForTargetRoutes' | 'quarantineClassification'
  >;
} {
  const requestedPath = normalizePath(input.requestedRoute);
  const finalPath = normalizePath(input.finalUrl);
  const assertion = ROUTE_SURFACE_ASSERTIONS[requestedPath];

  if (routeRequiresAuthentication(requestedPath) && !input.authenticated) {
    return result('AUTHENTICATION_FAILED', 0.95, requestedPath, 'AUTH_REDIRECT_CAPTURE');
  }

  if (isSignInPath(finalPath) && requestedPath !== finalPath) {
    return result('AUTH_REDIRECT_DETECTED', 0.98, requestedPath, 'AUTH_REDIRECT_CAPTURE');
  }

  if (assertion?.requiredPathPrefix && !finalPath.startsWith(assertion.requiredPathPrefix)) {
    return result('WRONG_ROUTE_CAPTURED', 0.9, requestedPath, 'WRONG_SURFACE');
  }

  if (assertion?.forbiddenPathPrefixes?.some((p) => finalPath.startsWith(p))) {
    return result('AUTH_REDIRECT_DETECTED', 0.95, requestedPath, 'AUTH_REDIRECT_CAPTURE');
  }

  if (input.domEvidence?.hasForbiddenSelectors) {
    return result('AUTH_REDIRECT_DETECTED', 0.92, requestedPath, 'AUTH_REDIRECT_CAPTURE');
  }

  if (assertion?.requiredSelectors?.length && input.domEvidence && !input.domEvidence.hasRequiredSelectors) {
    if (requestedPath === '/projects') {
      return result('SURFACE_IDENTITY_AMBIGUOUS', 0.6, requestedPath, 'INVALID_FOR_TARGET_ROUTE');
    }
    return result('SURFACE_IDENTITY_AMBIGUOUS', 0.55, requestedPath, 'INVALID_FOR_TARGET_ROUTE');
  }

  if (requestedPath !== finalPath && !finalPath.startsWith(`${requestedPath}/`)) {
    return result('WRONG_ROUTE_CAPTURED', 0.85, requestedPath, 'WRONG_SURFACE');
  }

  return result('VALID_TARGET_SURFACE', 0.88, requestedPath, null);
}

function result(
  surfaceIdentity: SurfaceIdentityResult,
  confidence: number,
  requestedRoute: string,
  quarantine: 'AUTH_REDIRECT_CAPTURE' | 'WRONG_SURFACE' | 'INVALID_FOR_TARGET_ROUTE' | null,
): {
  surfaceIdentity: SurfaceIdentityResult;
  confidence: number;
  metadata: Pick<
    VisualReferenceCaptureMetadata,
    'surfaceIdentity' | 'surfaceIdentityConfidence' | 'invalidForTargetRoutes' | 'quarantineClassification'
  >;
} {
  const invalidForTargetRoutes =
    surfaceIdentity === 'VALID_TARGET_SURFACE' ? [] : [requestedRoute, '/projects'];
  return {
    surfaceIdentity,
    confidence,
    metadata: {
      surfaceIdentity,
      surfaceIdentityConfidence: confidence,
      invalidForTargetRoutes,
      quarantineClassification: quarantine,
    },
  };
}

export function signInCaptureMayRetainHostLightingAuthority(surfaceIdentity: SurfaceIdentityResult): boolean {
  return surfaceIdentity === 'AUTH_REDIRECT_DETECTED' || surfaceIdentity === 'VALID_TARGET_SURFACE';
}

export function signInCaptureMayProvideProjectsHierarchyAuthority(surfaceIdentity: SurfaceIdentityResult): boolean {
  return surfaceIdentity === 'VALID_TARGET_SURFACE';
}
