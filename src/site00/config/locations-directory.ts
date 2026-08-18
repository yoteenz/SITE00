/**
 * SITE 00 Screen 01 — Locations Directory (mobile-only).
 * Full PUBLIC WORLD + YOUR SPACE map per approved moodboard.
 */

import { SITE00_CTRL_ROOM_PATH, site00SignInHrefWithReturnTo } from './mobile-directory-nav';
import { SITE00_ROUTES, site00MobileBuildNavHref, site00MobileEvolveNavHref } from './routes';

export type LocationsDirectoryEntry = {
  id: string;
  index: string;
  title: string;
  descriptionLines: [string, string];
  href: string;
  enabled: boolean;
  /** When true, signed-out users see lock + sign-in treatment */
  requiresAuth?: boolean;
};

export type LocationsDirectorySection = {
  id: string;
  title: string;
  entries: LocationsDirectoryEntry[];
};

export const SITE00_LOCATIONS_BACKGROUND_PATH = '0E226A0B-7533-433F-A9D0-7DD5109D77AC.png';

export const SITE00_FAST_TRAVEL_ICON_PATH = '89815B1A-ACFF-474B-8AA3-E7B97E7B40F2.png';

const PUBLIC_WORLD: LocationsDirectoryEntry[] = [
  {
    id: 'bldr',
    index: '01',
    title: 'BLDR',
    descriptionLines: ['DEFINE WHAT', "WE'RE BUILDING."],
    href: SITE00_ROUTES.bldr,
    enabled: true,
  },
  {
    id: 'evolve',
    index: '02',
    title: 'EVOLVE',
    descriptionLines: ['TRANSFORM WHAT', 'ALREADY EXISTS.'],
    href: SITE00_ROUTES.evolve,
    enabled: true,
  },
  {
    id: 'sites',
    index: '03',
    title: 'SITES',
    descriptionLines: ["EXPLORE WHAT'S", 'ALREADY BUILT.'],
    href: SITE00_ROUTES.sites,
    enabled: true,
  },
  {
    id: 'services',
    index: '04',
    title: 'SERVICES',
    descriptionLines: ['WHAT WE', 'BUILD.'],
    href: SITE00_ROUTES.services,
    enabled: true,
  },
  {
    id: 'system',
    index: '05',
    title: 'SYSTEM',
    descriptionLines: ['HOW SITE 00', 'WORKS.'],
    href: SITE00_ROUTES.system,
    enabled: true,
  },
  {
    id: 'about',
    index: '06',
    title: 'ABOUT',
    descriptionLines: ['WHO WE ARE', '& WHY WE BUILD.'],
    href: SITE00_ROUTES.about,
    enabled: true,
  },
  {
    id: 'journal',
    index: '07',
    title: 'JOURNAL',
    descriptionLines: ['INSIGHTS &', 'UPDATES.'],
    href: SITE00_ROUTES.journal,
    enabled: true,
  },
];

const YOUR_SPACE: LocationsDirectoryEntry[] = [
  {
    id: 'idnty',
    index: '08',
    title: 'IDNTY',
    descriptionLines: ['YOUR ACCESS', 'STARTS HERE.'],
    href: SITE00_ROUTES.idnty,
    enabled: true,
  },
  {
    id: 'ctrl-room',
    index: '09',
    title: 'CTRL ROOM',
    descriptionLines: ['WHAT NEEDS YOUR', 'ATTENTION.'],
    href: SITE00_CTRL_ROOM_PATH,
    enabled: true,
    requiresAuth: true,
  },
  {
    id: 'projects',
    index: '10',
    title: 'PROJECTS',
    descriptionLines: ['WHAT ARE WE', 'BUILDING?'],
    href: SITE00_ROUTES.projects,
    enabled: true,
    requiresAuth: true,
  },
  {
    id: 'my-sites',
    index: '11',
    title: 'MY SITES',
    descriptionLines: ['WHAT HAS BEEN', 'BUILT?'],
    href: SITE00_ROUTES.controlSites,
    enabled: true,
    requiresAuth: true,
  },
];

export const SITE00_LOCATIONS_SECTIONS: LocationsDirectorySection[] = [
  { id: 'public-world', title: 'PUBLIC WORLD', entries: PUBLIC_WORLD },
  { id: 'your-space', title: 'YOUR SPACE', entries: YOUR_SPACE },
];

/** Flat list for spine/card count helpers */
export const SITE00_LOCATIONS_DIRECTORY: LocationsDirectoryEntry[] = [
  ...PUBLIC_WORLD,
  ...YOUR_SPACE,
];

export function resolveDirectoryEntryHref(
  entry: LocationsDirectoryEntry,
  pathname: string,
  isSignedIn: boolean,
): string {
  if (entry.id === 'bldr') {
    return site00MobileBuildNavHref(pathname);
  }
  if (entry.id === 'evolve') {
    return site00MobileEvolveNavHref(pathname);
  }
  if (entry.requiresAuth && !isSignedIn) {
    return site00SignInHrefWithReturnTo({ pathname: entry.href, search: '' });
  }
  return entry.href;
}

export type Site00MobileNavId = 'origin' | 'locations' | 'build';

export const SITE00_MOBILE_NAV: {
  id: Site00MobileNavId;
  topLabel: string;
  bottomLabel: string;
  href: string;
  icon?: 'locations-target';
}[] = [
  { id: 'origin', topLabel: '00', bottomLabel: 'ORIGIN', href: SITE00_ROUTES.originAlias },
  { id: 'locations', topLabel: '', bottomLabel: 'LOCATIONS', href: SITE00_ROUTES.locations, icon: 'locations-target' },
  { id: 'build', topLabel: 'START', bottomLabel: 'BUILD', href: SITE00_ROUTES.bldr },
];
