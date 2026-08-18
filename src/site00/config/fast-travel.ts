/**
 * SITE 00 Fast Travel — contextual destination engine (mobile-only).
 * Renders selective shortcuts from the active route; not a full directory.
 */

import { SITE00_CTRL_ROOM_PATH, site00SignInHrefWithReturnTo } from './mobile-directory-nav';
import { SITE00_ROUTES, site00MobileBuildNavHref } from './routes';

export type FastTravelWorld = 'public' | 'operating' | 'onboarding';

export type FastTravelLocation = {
  index?: string;
  title: string;
  descriptor: string;
  world: FastTravelWorld;
};

export type FastTravelDestination = {
  id: string;
  label: string;
  description?: string;
  getHref: (ctx: FastTravelContext) => string;
  requiresAuth?: boolean;
};

export type FastTravelSectionId = 'up-next' | 'quick-jump' | 'my-space' | 'return';

export type FastTravelSection = {
  id: FastTravelSectionId;
  title: string;
  destinations: FastTravelDestination[];
};

export type FastTravelContext = {
  pathname: string;
  isSignedIn: boolean;
};

type RouteProfile = {
  match: (pathname: string) => boolean;
  location: FastTravelLocation;
  sections: (ctx: FastTravelContext) => FastTravelSection[];
};

const d = (id: string, label: string, description: string, href: string | ((ctx: FastTravelContext) => string), requiresAuth?: boolean): FastTravelDestination => ({
  id,
  label,
  description,
  getHref: typeof href === 'function' ? href : () => href,
  requiresAuth,
});

const buildHref = (ctx: FastTravelContext) => site00MobileBuildNavHref(ctx.pathname);

const signIn = (path: string) => () =>
  site00SignInHrefWithReturnTo({ pathname: path, search: '' });

const authHref = (path: string) => (ctx: FastTravelContext) =>
  ctx.isSignedIn ? path : site00SignInHrefWithReturnTo({ pathname: path, search: '' });

function publicMySpace(_ctx: FastTravelContext): FastTravelSection {
  return {
    id: 'my-space',
    title: 'MY SPACE',
    destinations: [
      d('idnty', 'IDNTY', 'Access your account.', SITE00_ROUTES.idnty),
      d('ctrl-room', 'CTRL ROOM', 'Enter your operating environment.', authHref(SITE00_CTRL_ROOM_PATH), true),
    ],
  };
}

function publicReturn(): FastTravelSection {
  return {
    id: 'return',
    title: 'RETURN',
    destinations: [
      d('locations', 'LOCATIONS', 'Open the full directory.', SITE00_ROUTES.locations),
      d('origin', '00 ORIGIN', 'Return to the homepage.', SITE00_ROUTES.originAlias),
    ],
  };
}

function sitesProfile(): RouteProfile {
  return {
    match: (p) => p === SITE00_ROUTES.sites || p.startsWith(`${SITE00_ROUTES.sites}/`),
    location: { index: '02', title: 'SITES', descriptor: "EXPLORE WHAT'S ALREADY BUILT.", world: 'public' },
    sections: (ctx) => [
      {
        id: 'up-next',
        title: 'UP NEXT',
        destinations: [
          d('start-build', 'START A BUILD', 'Tell us what you are building.', buildHref),
          d('build-type', 'FIND MY BUILD TYPE', 'Not sure where to begin?', SITE00_ROUTES.bldrState),
        ],
      },
      {
        id: 'quick-jump',
        title: 'QUICK JUMP',
        destinations: [
          d('services', 'EXPLORE SERVICES', 'What we build.', SITE00_ROUTES.services),
          d('system', 'HOW SITE 00 WORKS', 'Operating architecture.', SITE00_ROUTES.system),
          d('journal', 'READ JOURNAL', 'Insights and updates.', SITE00_ROUTES.journal),
        ],
      },
      publicMySpace(ctx),
      publicReturn(),
    ],
  };
}

function servicesProfile(): RouteProfile {
  return {
    match: (p) => p === SITE00_ROUTES.services,
    location: { index: '03', title: 'SERVICES', descriptor: 'WHAT WE BUILD.', world: 'public' },
    sections: (ctx) => [
      {
        id: 'up-next',
        title: 'UP NEXT',
        destinations: [
          d('start-build', 'START A BUILD', 'Begin the BLDR flow.', buildHref),
          d('build-type', 'FIND MY BUILD TYPE', 'Discover your build class.', SITE00_ROUTES.bldrState),
        ],
      },
      {
        id: 'quick-jump',
        title: 'QUICK JUMP',
        destinations: [
          d('sites', 'VIEW SITES', 'Explore built work.', SITE00_ROUTES.sites),
          d('system', 'HOW SITE 00 WORKS', 'System overview.', SITE00_ROUTES.system),
          d('journal', 'READ JOURNAL', 'Latest transmissions.', SITE00_ROUTES.journal),
        ],
      },
      publicMySpace(ctx),
      publicReturn(),
    ],
  };
}

function systemProfile(): RouteProfile {
  return {
    match: (p) => p === SITE00_ROUTES.system,
    location: { index: '04', title: 'SYSTEM', descriptor: 'HOW SITE 00 WORKS.', world: 'public' },
    sections: (ctx) => [
      {
        id: 'up-next',
        title: 'UP NEXT',
        destinations: [
          d('build-type', 'FIND MY BUILD TYPE', 'Choose your path.', SITE00_ROUTES.bldrState),
          d('start-build', 'START A BUILD', 'Define what you are building.', buildHref),
        ],
      },
      {
        id: 'quick-jump',
        title: 'QUICK JUMP',
        destinations: [
          d('services', 'EXPLORE SERVICES', 'Capabilities index.', SITE00_ROUTES.services),
          d('sites', 'VIEW SITES', 'Public portfolio.', SITE00_ROUTES.sites),
          d('journal', 'READ JOURNAL', 'Insights and updates.', SITE00_ROUTES.journal),
        ],
      },
      publicMySpace(ctx),
      publicReturn(),
    ],
  };
}

function aboutProfile(): RouteProfile {
  return {
    match: (p) => p === SITE00_ROUTES.about,
    location: { index: '05', title: 'ABOUT', descriptor: 'WHO WE ARE & WHY WE BUILD.', world: 'public' },
    sections: (ctx) => [
      {
        id: 'up-next',
        title: 'UP NEXT',
        destinations: [
          d('services', 'EXPLORE SERVICES', 'What we build.', SITE00_ROUTES.services),
          d('start-build', 'START A BUILD', 'Begin your project.', buildHref),
        ],
      },
      {
        id: 'quick-jump',
        title: 'QUICK JUMP',
        destinations: [
          d('sites', 'VIEW SITES', 'Built work.', SITE00_ROUTES.sites),
          d('journal', 'READ JOURNAL', 'Latest updates.', SITE00_ROUTES.journal),
          d('system', 'HOW SITE 00 WORKS', 'Operating model.', SITE00_ROUTES.system),
        ],
      },
      publicMySpace(ctx),
      publicReturn(),
    ],
  };
}

function journalProfile(): RouteProfile {
  return {
    match: (p) => p === SITE00_ROUTES.journal || p.startsWith(`${SITE00_ROUTES.journal}/`),
    location: { index: '06', title: 'JOURNAL', descriptor: 'INSIGHTS & UPDATES.', world: 'public' },
    sections: (ctx) => [
      {
        id: 'up-next',
        title: 'UP NEXT',
        destinations: [
          d('services', 'EXPLORE SERVICES', 'Capabilities.', SITE00_ROUTES.services),
          d('start-build', 'START A BUILD', 'Define your build.', buildHref),
        ],
      },
      {
        id: 'quick-jump',
        title: 'QUICK JUMP',
        destinations: [
          d('sites', 'VIEW SITES', 'Portfolio.', SITE00_ROUTES.sites),
          d('system', 'HOW SITE 00 WORKS', 'Architecture.', SITE00_ROUTES.system),
          d('about', 'ABOUT SITE 00', 'Mission and principles.', SITE00_ROUTES.about),
        ],
      },
      publicMySpace(ctx),
      publicReturn(),
    ],
  };
}

function bldrProfile(): RouteProfile {
  return {
    match: (p) => p.startsWith(SITE00_ROUTES.bldr),
    location: { index: '01', title: 'BLDR', descriptor: "DEFINE WHAT WE'RE BUILDING.", world: 'onboarding' },
    sections: () => [
      {
        id: 'up-next',
        title: 'UP NEXT',
        destinations: [
          d('continue', 'CONTINUE BUILD', 'Resume your assessment.', (c) => c.pathname),
          d('bldr-state', 'BUILD CLASS SELECTION', 'Choose SITE, WORLD, or ENTERPRISE.', SITE00_ROUTES.bldrState),
        ],
      },
      {
        id: 'quick-jump',
        title: 'QUICK JUMP',
        destinations: [
          d('investment', 'BUILD INVESTMENT GUIDE', 'Scope and investment context.', SITE00_ROUTES.bldr),
          d('idnty', 'IDNTY', 'Identity and access.', SITE00_ROUTES.idnty),
        ],
      },
      {
        id: 'return',
        title: 'RETURN',
        destinations: [
          d('locations', 'LOCATIONS', 'Full directory.', SITE00_ROUTES.locations),
          d('origin', '00 ORIGIN', 'Homepage.', SITE00_ROUTES.originAlias),
        ],
      },
    ],
  };
}

function idntyProfile(): RouteProfile {
  return {
    match: (p) => p.startsWith(SITE00_ROUTES.idnty),
    location: { index: '07', title: 'IDNTY', descriptor: 'YOUR ACCESS STARTS HERE.', world: 'public' },
    sections: (ctx) => {
      if (!ctx.isSignedIn) {
        return [
          {
            id: 'up-next',
            title: 'UP NEXT',
            destinations: [
              d('sign-in', 'SIGN IN', 'Access your account.', signIn(ctx.pathname)),
              d('create', 'CREATE IDENTITY', 'Start your SITE 00 identity.', SITE00_ROUTES.idntyState),
            ],
          },
          {
            id: 'quick-jump',
            title: 'QUICK JUMP',
            destinations: [
              d('start-build', 'START BUILD', 'Define your build.', buildHref),
              d('services', 'EXPLORE SERVICES', 'What we build.', SITE00_ROUTES.services),
            ],
          },
          publicReturn(),
        ];
      }
      return [
        {
          id: 'up-next',
          title: 'UP NEXT',
          destinations: [
            d('ctrl-room', 'CTRL ROOM', 'Your operating environment.', SITE00_CTRL_ROOM_PATH),
            d('projects', 'PROJECTS', 'Active engagements.', SITE00_ROUTES.projects),
          ],
        },
        {
          id: 'quick-jump',
          title: 'QUICK JUMP',
          destinations: [
            d('my-sites', 'MY SITES', 'Built properties.', SITE00_ROUTES.controlSites),
            d('start-build', 'START BUILD', 'New build intake.', buildHref),
          ],
        },
        publicReturn(),
      ];
    },
  };
}

function ctrlRoomProfile(): RouteProfile {
  return {
    match: (p) => p.startsWith(SITE00_CTRL_ROOM_PATH),
    location: { index: '08', title: 'CTRL ROOM', descriptor: 'WHAT NEEDS YOUR ATTENTION.', world: 'operating' },
    sections: (ctx) => {
      if (!ctx.isSignedIn) {
        return [
          {
            id: 'up-next',
            title: 'UP NEXT',
            destinations: [d('sign-in', 'SIGN IN', 'Enter your operating environment.', signIn(SITE00_CTRL_ROOM_PATH))],
          },
          publicReturn(),
        ];
      }
      return [
        {
          id: 'up-next',
          title: 'UP NEXT',
          destinations: [
            d('projects', 'PROJECTS', 'Active work.', SITE00_ROUTES.projects),
            d('my-sites', 'MY SITES', 'Digital properties.', SITE00_ROUTES.controlSites),
          ],
        },
        {
          id: 'quick-jump',
          title: 'QUICK JUMP',
          destinations: [
            d('billing', 'BILLING', 'Account billing.', SITE00_ROUTES.controlBilling),
            d('settings', 'SETTINGS', 'Account settings.', SITE00_ROUTES.controlSettings),
            d('idnty', 'IDNTY', 'Identity profile.', SITE00_ROUTES.idnty),
          ],
        },
        publicReturn(),
      ];
    },
  };
}

function projectsProfile(): RouteProfile {
  return {
    match: (p) => p === SITE00_ROUTES.projects || p.startsWith(`${SITE00_ROUTES.projects}/`) || p.startsWith('/project/'),
    location: { index: '09', title: 'PROJECTS', descriptor: 'WHAT ARE WE BUILDING?', world: 'operating' },
    sections: () => [
      {
        id: 'up-next',
        title: 'UP NEXT',
        destinations: [
          d('ctrl-room', 'CTRL ROOM', 'Attention center.', authHref(SITE00_CTRL_ROOM_PATH), true),
          d('my-sites', 'MY SITES', 'Built outputs.', authHref(SITE00_ROUTES.controlSites), true),
        ],
      },
      {
        id: 'quick-jump',
        title: 'QUICK JUMP',
        destinations: [d('idnty', 'IDNTY', 'Account access.', SITE00_ROUTES.idnty)],
      },
      publicReturn(),
    ],
  };
}

function originProfile(): RouteProfile {
  return {
    match: (p) => p === '/' || p === SITE00_ROUTES.originAlias || p === SITE00_ROUTES.origin,
    location: { title: '00 ORIGIN', descriptor: 'WHERE SITE 00 BEGINS.', world: 'public' },
    sections: (ctx) => [
      {
        id: 'up-next',
        title: 'UP NEXT',
        destinations: [
          d('start-build', 'START A BUILD', 'Define your build.', buildHref),
          d('sites', 'EXPLORE SITES', 'See what is built.', SITE00_ROUTES.sites),
        ],
      },
      {
        id: 'quick-jump',
        title: 'QUICK JUMP',
        destinations: [
          d('services', 'EXPLORE SERVICES', 'Capabilities.', SITE00_ROUTES.services),
          d('system', 'HOW SITE 00 WORKS', 'System overview.', SITE00_ROUTES.system),
        ],
      },
      publicMySpace(ctx),
      publicReturn(),
    ],
  };
}

const ROUTE_PROFILES: RouteProfile[] = [
  ctrlRoomProfile(),
  projectsProfile(),
  bldrProfile(),
  idntyProfile(),
  sitesProfile(),
  servicesProfile(),
  systemProfile(),
  aboutProfile(),
  journalProfile(),
  originProfile(),
];

const FALLBACK_PROFILE: RouteProfile = {
  match: () => true,
  location: { title: 'SITE 00', descriptor: 'NAVIGATE THE ECOSYSTEM.', world: 'public' },
  sections: (ctx) => [publicMySpace(ctx), publicReturn()],
};

export function resolveFastTravel(pathname: string, isSignedIn: boolean): {
  location: FastTravelLocation;
  sections: FastTravelSection[];
} {
  const ctx: FastTravelContext = { pathname, isSignedIn };
  const profile = ROUTE_PROFILES.find((p) => p.match(pathname)) ?? FALLBACK_PROFILE;
  return {
    location: profile.location,
    sections: profile.sections(ctx),
  };
}

export function resolveFastTravelHref(dest: FastTravelDestination, ctx: FastTravelContext): string {
  if (dest.requiresAuth && !ctx.isSignedIn) {
    const target = dest.getHref({ ...ctx, isSignedIn: true });
    return site00SignInHrefWithReturnTo({ pathname: target, search: '' });
  }
  return dest.getHref(ctx);
}
