/**
 * SITE 00 Composer public pages — semantic base paths + legacy `/desktop` redirects.
 * Preview device mode is global state (Site00Context), not a separate route tree.
 */

export const SITE00_PUBLIC_PAGE_BASES = [
  '/sites',
  '/services',
  '/system',
  '/about',
  '/journal',
  '/support',
  '/idnty',
  '/idnty/sign-in-security',
  '/bldr',
  '/bldr/templates',
  '/projects',
] as const;

export type Site00PublicPageBase = (typeof SITE00_PUBLIC_PAGE_BASES)[number];

export function site00PublicDesktopPath(basePath: string): string {
  const normalized = basePath.replace(/\/$/, '');
  if (normalized.endsWith('/desktop')) return normalized;
  return `${normalized}/desktop`;
}

export function site00PublicMobilePath(pathname: string): string {
  if (!pathname.endsWith('/desktop')) return pathname;
  const mobile = pathname.slice(0, -'/desktop'.length);
  return mobile || '/';
}

export function isSite00PublicDesktopPath(pathname: string): boolean {
  return SITE00_PUBLIC_PAGE_BASES.some((base) => {
    const desktop = site00PublicDesktopPath(base);
    return pathname === desktop || pathname.startsWith(`${desktop}/`);
  });
}

/** Exact public base path (not /desktop, not a sub-route like /idnty/state). */
export function isSite00PublicPageBasePath(pathname: string): boolean {
  return SITE00_PUBLIC_PAGE_BASES.some((base) => pathname === base);
}

export function site00PublicPageDesktopRedirectTarget(pathname: string): string | null {
  if (isSite00PublicDesktopPath(pathname)) return null;
  if (!SITE00_PUBLIC_PAGE_BASES.some((base) => pathname === base)) return null;
  return site00PublicDesktopPath(pathname);
}

/** Preserve desktop preview when navigating — uses shared preview mode, not URL suffix. */
export function site00PublicNavHref(targetHref: string, _currentPathname: string): string {
  return targetHref.replace(/\/$/, '').replace(/\/desktop$/, '') || '/';
}
