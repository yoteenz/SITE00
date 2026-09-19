/**
 * Authenticated visual capture — auth context, principals, surface identity.
 */

export type CapturePrincipal =
  | 'PUBLIC_GUEST'
  | 'PROJECT_OWNER'
  | 'SITE00_ADMIN'
  | 'CLIENT_USER'
  | 'INTERNAL_SYSTEM';

export type ReferenceAccessClassification =
  | 'PUBLIC_REFERENCE'
  | 'INTERNAL_REFERENCE'
  | 'PROJECT_PRIVATE_REFERENCE'
  | 'ADMIN_PRIVATE_REFERENCE';

export type SurfaceIdentityResult =
  | 'VALID_TARGET_SURFACE'
  | 'AUTH_REDIRECT_DETECTED'
  | 'WRONG_ROUTE_CAPTURED'
  | 'AUTHENTICATION_FAILED'
  | 'INSUFFICIENT_PERMISSION'
  | 'SURFACE_IDENTITY_AMBIGUOUS'
  | 'CAPTURE_FAILED';

export type ReferenceQuarantineClassification =
  | 'WRONG_SURFACE'
  | 'AUTH_REDIRECT_CAPTURE'
  | 'INVALID_FOR_TARGET_ROUTE';

export type VisualCaptureAuthContext = {
  contextId: string;
  principal: CapturePrincipal;
  mechanism: 'STORAGE_STATE' | 'SESSION_COOKIE' | 'VITEST_MOCK' | 'UNAUTHENTICATED';
  authContextVersion: string;
  projectScope: string | null;
  tenantScope: string | null;
  /** Playwright storageState JSON — never persist raw tokens in VisualReferenceRecord. */
  storageState?: { cookies: unknown[]; origins: unknown[] };
};

export type VisualReferenceCaptureMetadata = {
  requestedRoute: string;
  finalUrl: string;
  redirectChain: string[];
  capturePrincipal: CapturePrincipal;
  authenticated: boolean;
  surfaceIdentity: SurfaceIdentityResult;
  surfaceIdentityConfidence: number;
  authContextVersion: string | null;
  accessClassification: ReferenceAccessClassification;
  quarantineClassification?: ReferenceQuarantineClassification | null;
  /** Routes this reference must NOT provide layout/hierarchy authority for. */
  invalidForTargetRoutes?: string[];
};

export type RouteSurfaceAssertion = {
  route: string;
  requiredSelectors?: string[];
  forbiddenSelectors?: string[];
  forbiddenPathPrefixes?: string[];
  requiredPathPrefix?: string;
};

export const ROUTE_SURFACE_ASSERTIONS: Record<string, RouteSurfaceAssertion> = {
  '/projects': {
    route: '/projects',
    requiredSelectors: ['.site00-page--projects', '.site00-projects-header'],
    forbiddenSelectors: ['.site00-auth-shell', '[data-site00-surface="sign-in"]'],
    forbiddenPathPrefixes: ['/origin/sign-in', '/sign-in'],
    requiredPathPrefix: '/projects',
  },
  '/control': {
    route: '/control',
    forbiddenPathPrefixes: ['/origin/sign-in', '/sign-in'],
  },
  '/projects/ndxbook': {
    route: '/projects/ndxbook',
    forbiddenPathPrefixes: ['/origin/sign-in', '/sign-in'],
    requiredPathPrefix: '/projects',
  },
  '/account': {
    route: '/account',
    requiredSelectors: ['.site00-page--account', '[data-site00-surface="account"]'],
    forbiddenSelectors: ['[data-site00-surface="sign-in"]', '.site00-auth-shell'],
    forbiddenPathPrefixes: ['/origin/sign-in', '/sign-in'],
    requiredPathPrefix: '/account',
  },
};

export function routeRequiresAuthentication(route: string): boolean {
  const path = route.split('?')[0] ?? route;
  return path === '/projects' || path.startsWith('/projects/') || path.startsWith('/control') || path === '/account';
}

export function minimumCapturePrincipalForRoute(route: string): CapturePrincipal {
  const path = route.split('?')[0] ?? route;
  if (path === '/projects' || path.startsWith('/projects/')) return 'PROJECT_OWNER';
  if (path.startsWith('/control')) return 'SITE00_ADMIN';
  if (path === '/account') return 'CLIENT_USER';
  return 'PUBLIC_GUEST';
}
