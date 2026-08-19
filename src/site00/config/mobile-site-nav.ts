/**
 * Canonical SITE 00 mobile bottom navigation — five equal architectural bays.
 * Order: ORIGIN → IDNTY → LOCATIONS → PROJECTS → CTRL ROOM
 */

import { SITE00_ROUTES } from './routes';
import { SITE00_CTRL_ROOM_PATH, isSite00CtrlRoomActive } from './mobile-directory-nav';

export type MobileSiteNavId = 'origin' | 'idnty' | 'locations' | 'projects' | 'control';

export type MobileSiteNavIconId = 'origin-mark' | 'idnty' | 'locations-target' | 'projects' | 'ctrl-room';

export type MobileSiteNavItem = {
  id: MobileSiteNavId;
  topLabel: string;
  bottomLabel: string;
  href: string;
  icon: MobileSiteNavIconId;
  /** Route guard redirects unauthenticated users to sign-in. */
  requiresAuth?: boolean;
};

/** Fixed bay order — LOCATIONS is the literal center (index 2). */
export const MOBILE_SITE_NAV: MobileSiteNavItem[] = [
  {
    id: 'origin',
    topLabel: '',
    bottomLabel: 'ORIGIN',
    href: SITE00_ROUTES.originAlias,
    icon: 'origin-mark',
  },
  {
    id: 'idnty',
    topLabel: '',
    bottomLabel: 'IDNTY',
    href: SITE00_ROUTES.idntyState,
    icon: 'idnty',
  },
  {
    id: 'locations',
    topLabel: '',
    bottomLabel: 'LOCATIONS',
    href: SITE00_ROUTES.locations,
    icon: 'locations-target',
  },
  {
    id: 'projects',
    topLabel: '',
    bottomLabel: 'PROJECTS',
    href: SITE00_ROUTES.projects,
    icon: 'projects',
    requiresAuth: true,
  },
  {
    id: 'control',
    topLabel: 'CTRL',
    bottomLabel: 'ROOM',
    href: SITE00_CTRL_ROOM_PATH,
    icon: 'ctrl-room',
    requiresAuth: true,
  },
];

/** Route-derived active bay — null when no primary destination matches (e.g. BLDR workflow). */
export function resolveMobileSiteNavId(pathname: string): MobileSiteNavId | null {
  const normalized = pathname.replace(/\/desktop(\/|$)/, (_, slash) => slash || '');

  if (normalized.startsWith(SITE00_ROUTES.projects) || normalized.startsWith('/project/')) {
    return 'projects';
  }
  if (isSite00CtrlRoomActive(normalized)) {
    return 'control';
  }
  if (normalized.startsWith(SITE00_ROUTES.locations)) {
    return 'locations';
  }
  if (normalized.startsWith(SITE00_ROUTES.idnty)) {
    return 'idnty';
  }
  if (
    normalized === '/' ||
    normalized === SITE00_ROUTES.originAlias ||
    normalized.startsWith(`${SITE00_ROUTES.originAlias}/sign-in`) ||
    normalized.startsWith(SITE00_ROUTES.enter)
  ) {
    return 'origin';
  }

  return null;
}

export function isMobileSiteNavActive(pathname: string, id: MobileSiteNavId): boolean {
  return resolveMobileSiteNavId(pathname) === id;
}
