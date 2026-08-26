import {
  NDX_RECONSTRUCTED_MOBILE_SCREEN_IDS,
  NDX_RECONSTRUCTED_ROUTE_PATTERNS,
  type NdxReconstructedMobileScreenId,
} from './constants.js';

export function isNdxReconstructedRoute(pathname: string): boolean {
  const normalized = (pathname || '').replace(/\/+$/, '') || '/';
  return NDX_RECONSTRUCTED_ROUTE_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function extractProjectSlugFromPath(pathname: string): string | null {
  const match = (pathname || '').match(/^\/projects\/([^/]+)/);
  return match?.[1] ?? null;
}

/** Map pathname to reconstructed mobile screen id (sync, no fetch). */
export function resolveReconstructedScreenIdFromPath(pathname: string, projectSlug: string): NdxReconstructedMobileScreenId | null {
  const normalized = pathname.replace(/\/+$/, '');
  const base = `/projects/${projectSlug}`;
  if (normalized === base) return 'overview';
  if (normalized.includes('/content-operations/campaign-board')) return 'campaign-board';
  if (normalized.includes('/marketing-expression/experiment-01')) return 'experiment-01';
  if (normalized.includes('/content-operations')) return 'content-ops';
  if (normalized.includes('/cultural-intelligence')) return 'cultural-intelligence';
  if (normalized.includes('/character/')) return 'character-lab';
  return null;
}

export function isReconstructedMobileScreenId(screenId: string): screenId is NdxReconstructedMobileScreenId {
  return (NDX_RECONSTRUCTED_MOBILE_SCREEN_IDS as readonly string[]).includes(screenId);
}

/** Route-based shell eligibility — shell must not wait for experiment/campaign fetch. */
export function shouldUseReferenceShellFirst(pathname: string, projectSlug: string): boolean {
  return projectSlug === 'ndxbook' && isNdxReconstructedRoute(pathname);
}
