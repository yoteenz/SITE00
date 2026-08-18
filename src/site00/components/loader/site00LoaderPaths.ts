/** SITE 00 routes that use the immersive geometry loader (boot shell + cinematic gate). */

import { SITE00_ROUTES } from '../../config/routes';
import { isSite00PublicDesktopPath, site00PublicMobilePath } from '../../config/site00-public-pages';

const SITE00_IMMERSIVE_PREFIXES = [
  '/origin',
  '/enter',
  '/idnty',
  '/bldr',
  '/assts',
  '/bluprint',
  '/build',
  '/control',
  '/live',
] as const;

/** Public hub/marketing routes — skip cinematic cold-start loader. */
const SITE00_PUBLIC_SKIP_LOADER_PATHS = [
  SITE00_ROUTES.sites,
  SITE00_ROUTES.services,
  SITE00_ROUTES.system,
  SITE00_ROUTES.about,
  SITE00_ROUTES.journal,
  SITE00_ROUTES.support,
  SITE00_ROUTES.projects,
  SITE00_ROUTES.idnty,
  SITE00_ROUTES.idntySignInSecurity,
  SITE00_ROUTES.bldr,
  SITE00_ROUTES.bldrTemplates,
  SITE00_ROUTES.bldrStart,
] as const;

/** Designated desktop artboard routes — skip mobile loader; force desktop composition. */
export function isSite00DesktopArtboardPath(pathname: string): boolean {
  if (!pathname) return false;
  if (isSite00PublicDesktopPath(pathname)) return true;
  const prefixes = [SITE00_ROUTES.originDesktop, SITE00_ROUTES.idntyStateDesktop, SITE00_ROUTES.bldrStateDesktop] as const;
  return prefixes.some((base) => pathname === base || pathname.startsWith(`${base}/`));
}

/** Sign-in is a focused auth surface — skip cinematic cold-start loader. */
export function isSite00SignInPath(pathname: string): boolean {
  if (!pathname) return false;
  return pathname === SITE00_ROUTES.signIn || pathname.startsWith(`${SITE00_ROUTES.signIn}/`);
}

export function isSite00PublicHubPath(pathname: string): boolean {
  if (!pathname) return false;
  const mobilePath = site00PublicMobilePath(pathname);
  return SITE00_PUBLIC_SKIP_LOADER_PATHS.some(
    (base) => mobilePath === base || mobilePath.startsWith(`${base}/`),
  );
}

export function isSite00ImmersivePath(pathname: string): boolean {
  if (isSite00DesktopArtboardPath(pathname)) return false;
  if (isSite00SignInPath(pathname)) return false;
  if (isSite00PublicHubPath(pathname)) return false;
  if (!pathname) return false;
  if (pathname === '/' && import.meta.env.VITE_SITE00_ROOT === '1') return true;
  return SITE00_IMMERSIVE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Boot script mirror — keep in sync with `public/site00-assts-boot-gate.js`. */
export const SITE00_IMMERSIVE_BOOT_PREFIXES = SITE00_IMMERSIVE_PREFIXES;
