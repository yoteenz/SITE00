/**
 * Route-specific loader headline + stage subtitles.
 * Headline (black title) reflects the destination page; gray subtitle cycles
 * through stage copy that mirrors real preload work behind the overlay.
 *
 * Subtitle copy rule: max 3 words; 4 words only when every word is ≤3 letters.
 */

import type { Site00LoaderStage } from './site00LoaderConfig';
import { assertLoaderSubtitle } from './site00LoaderSubtitleCopy';

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
    { id: 'bootstrap', state: 'BOOTSTRAP', subtitle: assertLoaderSubtitle(subtitles.bootstrap), progress: 10 },
    { id: 'preparing', state: 'PREPARING', subtitle: assertLoaderSubtitle(subtitles.preparing), progress: 35 },
    { id: 'connect', state: 'CONNECTING', subtitle: assertLoaderSubtitle(subtitles.connect), progress: 58 },
    { id: 'assemble', state: 'ASSEMBLING', subtitle: assertLoaderSubtitle(subtitles.assemble), progress: 82 },
    { id: 'ready', state: 'READY', subtitle: assertLoaderSubtitle('FINALIZING'), progress: 100 },
  ];
}

const ROUTE_COPY: Array<{ match: (path: string) => boolean; copy: Site00LoaderRouteCopy }> = [
  {
    match: (path) => path.startsWith('/origin/locations'),
    copy: {
      experienceTitle: 'MAPPING LOCATIONS',
      completionMessage: 'LOCATIONS READY',
      stages: worldStages({
        bootstrap: 'BOOTING MARBLE',
        preparing: 'LOADING LOCATIONS',
        connect: 'MAPPING GRID',
        assemble: 'BUILDING GRID',
      }),
    },
  },
  {
    match: (path) => path === '/enter' || path.startsWith('/enter/'),
    copy: {
      experienceTitle: 'ENTERING SITE 00',
      completionMessage: 'ENTER READY',
      stages: worldStages({
        bootstrap: 'OPENING ENTER',
        preparing: 'LOADING MODULES',
        connect: 'OPENING GATE',
        assemble: 'BUILDING MENU',
      }),
    },
  },
  {
    match: (path) => path.startsWith('/idnty/state'),
    copy: {
      experienceTitle: 'PREPARING IDENTITY',
      completionMessage: 'IDENTITY READY',
      stages: worldStages({
        bootstrap: 'BOOTING WORKFLOW',
        preparing: 'LOADING MODULES',
        connect: 'LINKING IDNTY',
        assemble: 'BUILDING SELECTOR',
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
        bootstrap: 'BOOTING SUITE',
        preparing: 'LOADING MODULES',
        connect: 'READING STATE',
        assemble: 'BUILDING FLOW',
      }),
    },
  },
  {
    match: (path) => path.startsWith('/idnty'),
    copy: {
      experienceTitle: 'PREPARING IDENTITY',
      completionMessage: 'IDENTITY READY',
      stages: worldStages({
        bootstrap: 'BOOTING WORKFLOW',
        preparing: 'LOADING MODULES',
        connect: 'LINKING IDNTY',
        assemble: 'BUILDING SHELL',
      }),
    },
  },
  {
    match: (path) => path.startsWith('/bldr/state'),
    copy: {
      experienceTitle: 'PREPARING BUILDER',
      completionMessage: 'BUILDER READY',
      stages: worldStages({
        bootstrap: 'BOOTING BUILDER',
        preparing: 'LOADING MODULES',
        connect: 'LINKING BLDR',
        assemble: 'BUILDING SELECTOR',
      }),
    },
  },
  {
    match: (path) => path.startsWith('/bldr'),
    copy: {
      experienceTitle: 'ASSEMBLING BUILDER',
      completionMessage: 'BUILDER READY',
      stages: worldStages({
        bootstrap: 'BOOTING WORKSPACE',
        preparing: 'LOADING MODULES',
        connect: 'LINKING BLDR',
        assemble: 'BUILDING FLOW',
      }),
    },
  },
  {
    match: (path) => path.startsWith('/evolve/state'),
    copy: {
      experienceTitle: 'PREPARING EVOLUTION',
      completionMessage: 'EVOLUTION READY',
      stages: worldStages({
        bootstrap: 'BOOTING EVOLVE',
        preparing: 'LOADING MODULES',
        connect: 'LINKING EVOLVE',
        assemble: 'BUILDING SELECTOR',
      }),
    },
  },
  {
    match: (path) => path.startsWith('/evolve'),
    copy: {
      experienceTitle: 'ASSEMBLING EVOLUTION',
      completionMessage: 'EVOLUTION READY',
      stages: worldStages({
        bootstrap: 'BOOTING WORKSPACE',
        preparing: 'LOADING MODULES',
        connect: 'LINKING EVOLVE',
        assemble: 'BUILDING FLOW',
      }),
    },
  },
  {
    match: (path) => path === '/' || path === '/origin' || path.startsWith('/origin'),
    copy: {
      experienceTitle: 'ASSEMBLING ORIGIN',
      completionMessage: 'ORIGIN READY',
      stages: worldStages({
        bootstrap: 'BOOTING MARBLE',
        preparing: 'LOADING MODULES',
        connect: 'LINKING ORIGIN',
        assemble: 'BUILDING HOMEPAGE',
      }),
    },
  },
];

const DEFAULT_WORLD_COPY: Site00LoaderRouteCopy = {
  experienceTitle: 'ASSEMBLING SITE 00',
  stages: worldStages({
    bootstrap: 'BOOTING ENVIRONMENT',
    preparing: 'LOADING SYSTEMS',
    connect: 'LINKING ROUTE',
    assemble: 'BUILDING INTERFACE',
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
