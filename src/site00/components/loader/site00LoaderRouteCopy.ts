/**
 * Route-specific loader headline + stage subtitles.
 * Headline (black title) reflects the destination page; gray subtitle cycles
 * through stage copy that mirrors real preload work behind the overlay.
 */

import type { Site00LoaderStage } from './site00LoaderConfig';

export type Site00LoaderRouteCopy = {
  experienceTitle: string;
  completionMessage?: string;
  stages: Site00LoaderStage[];
};

function worldStages(subtitles: {
  bootstrap: string;
  preparing: string;
  connect: string;
  assemble: string;
}): Site00LoaderStage[] {
  return [
    { id: 'bootstrap', state: 'BOOTSTRAP', subtitle: subtitles.bootstrap, progress: 10 },
    { id: 'preparing', state: 'PREPARING', subtitle: subtitles.preparing, progress: 35 },
    { id: 'connect', state: 'CONNECTING', subtitle: subtitles.connect, progress: 58 },
    { id: 'assemble', state: 'ASSEMBLING', subtitle: subtitles.assemble, progress: 82 },
    { id: 'ready', state: 'READY', subtitle: 'FINALIZING', progress: 100 },
  ];
}

const ROUTE_COPY: Array<{ match: (path: string) => boolean; copy: Site00LoaderRouteCopy }> = [
  {
    match: (path) => path.startsWith('/origin/locations'),
    copy: {
      experienceTitle: 'MAPPING LOCATIONS',
      completionMessage: 'LOCATIONS READY',
      stages: worldStages({
        bootstrap: 'INITIALIZING MARBLE ENVIRONMENT',
        preparing: 'LOADING LOCATION DATA',
        connect: 'MAPPING COORDINATES',
        assemble: 'ASSEMBLING LOCATION GRID',
      }),
    },
  },
  {
    match: (path) => path === '/enter' || path.startsWith('/enter/'),
    copy: {
      experienceTitle: 'ENTERING SITE 00',
      completionMessage: 'ENTER READY',
      stages: worldStages({
        bootstrap: 'INITIALIZING WAITING ROOM',
        preparing: 'LOADING ENTER MODULES',
        connect: 'OPENING SITE 00 GATE',
        assemble: 'ASSEMBLING MENU SYSTEM',
      }),
    },
  },
  {
    match: (path) => path.startsWith('/idnty/state'),
    copy: {
      experienceTitle: 'PREPARING IDENTITY',
      completionMessage: 'IDENTITY READY',
      stages: worldStages({
        bootstrap: 'INITIALIZING WORKFLOW HALL',
        preparing: 'LOADING IDENTITY MODULES',
        connect: 'CONNECTING TO IDNTY',
        assemble: 'ASSEMBLING STATE SELECTOR',
      }),
    },
  },
  {
    match: (path) =>
      path.startsWith('/idnty/starting-at-zero') ||
      path.startsWith('/idnty/some-pieces-exist') ||
      path.startsWith('/idnty/needs-cohesion') ||
      path.startsWith('/idnty/ready-for-evolution') ||
      path.startsWith('/idnty/build-ready'),
    copy: {
      experienceTitle: 'BUILDING YOUR IDENTITY',
      completionMessage: 'ASSESSMENT READY',
      stages: worldStages({
        bootstrap: 'INITIALIZING ASSESSMENT SUITE',
        preparing: 'LOADING DIAGNOSTIC MODULES',
        connect: 'RESOLVING BRAND STATE',
        assemble: 'ASSEMBLING ASSESSMENT FLOW',
      }),
    },
  },
  {
    match: (path) => path.startsWith('/idnty'),
    copy: {
      experienceTitle: 'PREPARING IDENTITY',
      completionMessage: 'IDENTITY READY',
      stages: worldStages({
        bootstrap: 'INITIALIZING WORKFLOW HALL',
        preparing: 'LOADING IDENTITY MODULES',
        connect: 'CONNECTING TO IDNTY',
        assemble: 'ASSEMBLING IDENTITY SHELL',
      }),
    },
  },
  {
    match: (path) => path.startsWith('/bldr/state'),
    copy: {
      experienceTitle: 'PREPARING BUILDER',
      completionMessage: 'BUILDER READY',
      stages: worldStages({
        bootstrap: 'INITIALIZING BUILDER HALL',
        preparing: 'LOADING BUILDER MODULES',
        connect: 'CONNECTING TO BLDR',
        assemble: 'ASSEMBLING CLASS SELECTOR',
      }),
    },
  },
  {
    match: (path) => path.startsWith('/bldr'),
    copy: {
      experienceTitle: 'ASSEMBLING BUILDER',
      completionMessage: 'BUILDER READY',
      stages: worldStages({
        bootstrap: 'INITIALIZING BUILDER WORKSPACE',
        preparing: 'LOADING BUILDER MODULES',
        connect: 'CONNECTING TO BLDR',
        assemble: 'ASSEMBLING BUILDER FLOW',
      }),
    },
  },
  {
    match: (path) => path.startsWith('/evolve/state'),
    copy: {
      experienceTitle: 'PREPARING EVOLUTION',
      completionMessage: 'EVOLUTION READY',
      stages: worldStages({
        bootstrap: 'INITIALIZING EVOLVE HALL',
        preparing: 'LOADING EVOLUTION MODULES',
        connect: 'CONNECTING TO EVOLVE',
        assemble: 'ASSEMBLING PATH SELECTOR',
      }),
    },
  },
  {
    match: (path) => path.startsWith('/evolve'),
    copy: {
      experienceTitle: 'ASSEMBLING EVOLUTION',
      completionMessage: 'EVOLUTION READY',
      stages: worldStages({
        bootstrap: 'INITIALIZING EVOLVE WORKSPACE',
        preparing: 'LOADING EVOLUTION MODULES',
        connect: 'CONNECTING TO EVOLVE',
        assemble: 'ASSEMBLING EVOLUTION FLOW',
      }),
    },
  },
  {
    match: (path) => path === '/' || path === '/origin' || path.startsWith('/origin'),
    copy: {
      experienceTitle: 'ASSEMBLING ORIGIN',
      completionMessage: 'ORIGIN READY',
      stages: worldStages({
        bootstrap: 'INITIALIZING MARBLE ENVIRONMENT',
        preparing: 'LOADING ORIGIN MODULES',
        connect: 'CONNECTING TO ORIGIN',
        assemble: 'ASSEMBLING HOMEPAGE',
      }),
    },
  },
];

const DEFAULT_WORLD_COPY: Site00LoaderRouteCopy = {
  experienceTitle: 'ASSEMBLING SITE 00',
  stages: worldStages({
    bootstrap: 'INITIALIZING ENVIRONMENT',
    preparing: 'LOADING CORE SYSTEMS',
    connect: 'CONNECTING TO DESTINATION',
    assemble: 'ASSEMBLING INTERFACE',
  }),
};

/** Resolve destination headline + stage subtitles for world routes. */
export function resolveSite00LoaderRouteCopy(pathname: string): Site00LoaderRouteCopy {
  const path = pathname || '/';
  for (const entry of ROUTE_COPY) {
    if (entry.match(path)) return entry.copy;
  }
  return DEFAULT_WORLD_COPY;
}
