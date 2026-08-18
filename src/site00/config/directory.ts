/**
 * ENTER 00 / 00 Directory — editable content layer.
 * Environment is locked; this data drives the directory panel only.
 */

export type EnterMenuIconId = 'bldr-studio' | 'projects' | 'account' | 'support';

export type DirectoryRow = {
  id: string;
  number?: string;
  title: string;
  description: string;
  href: string;
  enabled: boolean;
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
        href: '/sites',
        enabled: false,
      },
      {
        id: 'explore-services',
        number: '02',
        title: 'SERVICES',
        description: 'WHAT SITE 00 DOES',
        href: '/services',
        enabled: false,
      },
      {
        id: 'explore-system',
        number: '03',
        title: 'SYSTEM',
        description: 'HOW THE SYSTEM WORKS',
        href: '/system',
        enabled: false,
      },
      {
        id: 'explore-about',
        number: '04',
        title: 'ABOUT',
        description: 'STUDIO AND METHODOLOGY',
        href: '/about',
        enabled: false,
      },
      {
        id: 'explore-journal',
        number: '05',
        title: 'JOURNAL',
        description: 'NOTES FROM THE FIELD',
        href: '/journal',
        enabled: false,
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
        href: '/bldr',
        enabled: true,
        enterIcon: 'bldr-studio',
      },
      {
        id: 'projects',
        title: 'PROJECTS',
        description: 'YOUR ACTIVE BUILDS',
        href: '/projects',
        enabled: false,
        enterIcon: 'projects',
      },
      {
        id: 'account',
        title: 'ACCOUNT',
        description: 'PROFILE & PREFERENCES',
        href: '/account',
        enabled: false,
        enterIcon: 'account',
      },
      {
        id: 'support',
        title: 'SUPPORT',
        description: 'HELP & RESOURCES',
        href: '/support',
        enabled: false,
        enterIcon: 'support',
      },
    ],
  },
];

export const SITE00_ENTER_COPY = {
  locationLabel: 'LOCATION / ENTER 00',
  welcomeNumber: '00',
  welcomeTitle: 'WELCOME TO 00',
  welcomeSubtitle: 'WHERE WOULD YOU LIKE TO GO?',
  welcomeBody: "TAKE A MOMENT. YOU'RE IN THE RIGHT PLACE.",
  statusStrip: "YOU'VE ENTERED SITE 00. ♦ CHOOSE YOUR DESTINATION. ♦ WE'LL HANDLE THE REST.",
} as const;
