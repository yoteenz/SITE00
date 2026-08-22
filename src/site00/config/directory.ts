/**
 * ENTER 00 / 00 Directory — editable content layer.
 * Environment is locked; this data drives the directory panel only.
 */

import { SITE00_CTRL_ROOM_PATH, site00SignInHrefWithReturnTo } from './mobile-directory-nav';
import { SITE00_ROUTES } from './routes';

export type EnterMenuIconId = 'bldr-studio' | 'projects' | 'account' | 'support';

export type DirectoryRow = {
  id: string;
  number?: string;
  title: string;
  description: string;
  href: string;
  enabled: boolean;
  /** When true, signed-out users route to sign-in with return path */
  requiresAuth?: boolean;
  /** YOUR SPACE — production line-icon slot */
  enterIcon?: EnterMenuIconId;
};

export type DirectorySection = {
  id: string;
  heading: string;
  rows: DirectoryRow[];
};

export const SITE00_DIRECTORY_SECTIONS: DirectorySection[] = [
  {
    id: 'explore',
    heading: 'EXPLORE',
    rows: [
      {
        id: 'explore-sites',
        number: '01',
        title: 'SITES',
        description: 'EXPLORE DIGITAL PLACES',
        href: SITE00_ROUTES.sites,
        enabled: true,
      },
      {
        id: 'explore-services',
        number: '02',
        title: 'SERVICES',
        description: 'WHAT SITE 00 DOES',
        href: SITE00_ROUTES.services,
        enabled: true,
      },
      {
        id: 'explore-system',
        number: '03',
        title: 'SYSTEM',
        description: 'HOW THE SYSTEM WORKS',
        href: SITE00_ROUTES.system,
        enabled: true,
      },
      {
        id: 'explore-about',
        number: '04',
        title: 'ABOUT',
        description: 'STUDIO AND METHODOLOGY',
        href: SITE00_ROUTES.about,
        enabled: true,
      },
      {
        id: 'explore-journal',
        number: '05',
        title: 'JOURNAL',
        description: 'NOTES FROM THE FIELD',
        href: SITE00_ROUTES.journal,
        enabled: true,
      },
    ],
  },
  {
    id: 'your-space',
    heading: 'YOUR SPACE',
    rows: [
      {
        id: 'bldr-studio',
        title: 'BLDR STUDIO',
        description: 'CREATE & DEPLOY',
        href: SITE00_ROUTES.bldr,
        enabled: true,
        enterIcon: 'bldr-studio',
      },
      {
        id: 'projects',
        title: 'PROJECTS',
        description: 'YOUR ACTIVE BUILDS',
        href: SITE00_ROUTES.projects,
        enabled: true,
        requiresAuth: true,
        enterIcon: 'projects',
      },
      {
        id: 'account',
        title: 'ACCOUNT',
        description: 'PROFILE & PREFERENCES',
        href: SITE00_CTRL_ROOM_PATH,
        enabled: true,
        requiresAuth: true,
        enterIcon: 'account',
      },
      {
        id: 'support',
        title: 'SUPPORT',
        description: 'HELP & RESOURCES',
        href: SITE00_ROUTES.support,
        enabled: true,
        enterIcon: 'support',
      },
    ],
  },
];

export function resolveEnterDirectoryRowHref(
  href: string,
  requiresAuth: boolean | undefined,
  isSignedIn: boolean,
): string {
  if (requiresAuth && !isSignedIn) {
    return site00SignInHrefWithReturnTo({ pathname: href, search: '' });
  }
  return href;
}

export const SITE00_ENTER_COPY = {
  locationLabel: 'LOCATION / ENTER 00',
  welcomeNumber: '00',
  welcomeTitle: 'WELCOME TO 00',
  welcomeSubtitle: 'WHERE WOULD YOU LIKE TO GO?',
  welcomeBody: "TAKE A MOMENT. YOU'RE IN THE RIGHT PLACE.",
  statusStrip: "YOU'VE ENTERED SITE 00. ♦ CHOOSE YOUR DESTINATION. ♦ WE'LL HANDLE THE REST.",
} as const;
