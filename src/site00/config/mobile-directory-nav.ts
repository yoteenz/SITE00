/**
 * SITE 00 mobile hamburger directory — deeper destinations (mobile-only).
 * Bottom nav handles ORIGIN, LOCATIONS, START BUILD; drawer is complementary.
 */

import { SITE00_ROUTES } from './routes';

export type Site00MobileDirectoryItem = {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
  /** Assistive label when abbreviated visual label differs (e.g. IDNTY → Identity). */
  ariaLabel?: string;
};

/** Primary informational directory group — exact order per approved IA. */
export const SITE00_MOBILE_DIRECTORY_PRIMARY: Site00MobileDirectoryItem[] = [
  { id: 'services', label: 'SERVICES', href: SITE00_ROUTES.services, enabled: true },
  { id: 'system', label: 'SYSTEM', href: SITE00_ROUTES.system, enabled: true },
  { id: 'about', label: 'ABOUT', href: SITE00_ROUTES.about, enabled: true },
  { id: 'journal', label: 'JOURNAL', href: SITE00_ROUTES.journal, enabled: true },
  {
    id: 'idnty',
    label: 'IDNTY',
    href: SITE00_ROUTES.idnty,
    enabled: true,
    ariaLabel: 'Identity',
  },
  {
    id: 'bldr',
    label: 'BLDR / START BUILD',
    href: SITE00_ROUTES.bldr,
    enabled: true,
    ariaLabel: 'Builder — Start Build',
  },
  {
    id: 'evolve',
    label: 'EVOLVE',
    href: SITE00_ROUTES.evolve,
    enabled: true,
    ariaLabel: 'Evolve — Transform what exists',
  },
];

/** Canonical customer account environment (CTRL ROOM). */
export const SITE00_CTRL_ROOM_PATH = '/control';

/** SITE 00 branded sign-in with return path. */
export function site00SignInHrefWithReturnTo(loc: { pathname: string; search?: string }): string {
  const path = `${loc.pathname}${loc.search || ''}`.slice(0, 1024);
  return `/origin/sign-in?returnTo=${encodeURIComponent(path)}`;
}

export function isSite00MobileDirectoryItemActive(pathname: string, item: Site00MobileDirectoryItem): boolean {
  if (item.id === 'idnty') {
    return pathname.startsWith(SITE00_ROUTES.idnty);
  }
  if (item.id === 'bldr') {
    return pathname.startsWith(SITE00_ROUTES.bldr);
  }
  if (item.id === 'evolve') {
    return pathname.startsWith(SITE00_ROUTES.evolve);
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function isSite00CtrlRoomActive(pathname: string): boolean {
  return pathname === SITE00_CTRL_ROOM_PATH || pathname.startsWith(`${SITE00_CTRL_ROOM_PATH}/`);
}
