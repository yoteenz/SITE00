/**
 * Route-specific loader headline + stage subtitles.
 * Headline (black title) reflects the destination page; gray subtitle cycles
 * every 2s through plain-language copy for that page (max 3 words per line).
 *
 * Never use "assembling" in subtitles — that label lives above the progress bar.
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
  ready?: string;
}): Site00LoaderStage[] {
  return [
    { id: 'bootstrap', state: 'BOOTSTRAP', subtitle: assertLoaderSubtitle(subtitles.bootstrap), progress: 10 },
    { id: 'preparing', state: 'PREPARING', subtitle: assertLoaderSubtitle(subtitles.preparing), progress: 35 },
    { id: 'connect', state: 'CONNECTING', subtitle: assertLoaderSubtitle(subtitles.connect), progress: 58 },
    { id: 'assemble', state: 'ASSEMBLING', subtitle: assertLoaderSubtitle(subtitles.assemble), progress: 82 },
    {
      id: 'ready',
      state: 'READY',
      subtitle: assertLoaderSubtitle(subtitles.ready ?? 'PAGE IS READY'),
      progress: 100,
    },
  ];
}

/** More specific routes first — `/origin/locations` before `/origin`. */
const ROUTE_COPY: Array<{ match: (path: string) => boolean; copy: Site00LoaderRouteCopy }> = [
  {
    match: (path) => path.startsWith('/origin/locations'),
    copy: {
      experienceTitle: 'MAPPING LOCATIONS',
      completionMessage: 'LOCATIONS READY',
      stages: worldStages({
        bootstrap: 'WAKING MARBLE HALL',
        preparing: 'LOADING LOCATION LIST',
        connect: 'OPENING THE MAP',
        assemble: 'BUILDING THE GRID',
        ready: 'LOCATIONS ARE READY',
      }),
    },
  },
  {
    match: (path) => path === '/enter' || path.startsWith('/enter/'),
    copy: {
      experienceTitle: 'ENTERING SITE 00',
      completionMessage: 'ENTER READY',
      stages: worldStages({
        bootstrap: 'WAKING WAIT ROOM',
        preparing: 'LOADING ENTER PAGE',
        connect: 'OPENING THE GATE',
        assemble: 'BUILDING THE MENU',
        ready: 'ENTER IS READY',
      }),
    },
  },
  {
    match: (path) => path.startsWith('/idnty/state'),
    copy: {
      experienceTitle: 'PREPARING IDENTITY',
      completionMessage: 'IDENTITY READY',
      stages: worldStages({
        bootstrap: 'WAKING IDENTITY HALL',
        preparing: 'LOADING STATE PAGE',
        connect: 'OPENING THE HALL',
        assemble: 'BUILDING STATE VIEW',
        ready: 'IDENTITY IS READY',
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
        bootstrap: 'WAKING THE SUITE',
        preparing: 'LOADING YOUR QUESTIONS',
        connect: 'READING YOUR BRAND',
        assemble: 'BUILDING YOUR FLOW',
        ready: 'ASSESSMENT IS READY',
      }),
    },
  },
  {
    match: (path) => path.startsWith('/idnty'),
    copy: {
      experienceTitle: 'PREPARING IDENTITY',
      completionMessage: 'IDENTITY READY',
      stages: worldStages({
        bootstrap: 'WAKING IDENTITY HALL',
        preparing: 'LOADING IDENTITY PAGE',
        connect: 'OPENING THE HALL',
        assemble: 'BUILDING THE SHELL',
        ready: 'IDENTITY IS READY',
      }),
    },
  },
  {
    match: (path) => path.startsWith('/bldr/state'),
    copy: {
      experienceTitle: 'PREPARING BUILDER',
      completionMessage: 'BUILDER READY',
      stages: worldStages({
        bootstrap: 'WAKING BUILDER HALL',
        preparing: 'LOADING CLASS PAGE',
        connect: 'OPENING THE HALL',
        assemble: 'BUILDING CLASS VIEW',
        ready: 'BUILDER IS READY',
      }),
    },
  },
  {
    match: (path) => path.startsWith('/bldr'),
    copy: {
      experienceTitle: 'ASSEMBLING BUILDER',
      completionMessage: 'BUILDER READY',
      stages: worldStages({
        bootstrap: 'WAKING WORKSPACE',
        preparing: 'LOADING BUILDER PAGE',
        connect: 'OPENING BUILDER HALL',
        assemble: 'BUILDING THE FLOW',
        ready: 'BUILDER IS READY',
      }),
    },
  },
  {
    match: (path) => path.startsWith('/evolve/state'),
    copy: {
      experienceTitle: 'PREPARING EVOLUTION',
      completionMessage: 'EVOLUTION READY',
      stages: worldStages({
        bootstrap: 'WAKING EVOLVE HALL',
        preparing: 'LOADING PATH PAGE',
        connect: 'OPENING THE HALL',
        assemble: 'BUILDING PATH VIEW',
        ready: 'EVOLUTION IS READY',
      }),
    },
  },
  {
    match: (path) => path.startsWith('/evolve'),
    copy: {
      experienceTitle: 'ASSEMBLING EVOLUTION',
      completionMessage: 'EVOLUTION READY',
      stages: worldStages({
        bootstrap: 'WAKING WORKSPACE',
        preparing: 'LOADING EVOLVE PAGE',
        connect: 'OPENING EVOLVE HALL',
        assemble: 'BUILDING THE FLOW',
        ready: 'EVOLUTION IS READY',
      }),
    },
  },
  {
    match: (path) => path === '/' || path === '/origin' || path.startsWith('/origin'),
    copy: {
      experienceTitle: 'ASSEMBLING ORIGIN',
      completionMessage: 'ORIGIN READY',
      stages: worldStages({
        bootstrap: 'WAKING MARBLE HALL',
        preparing: 'LOADING ORIGIN HOME',
        connect: 'OPENING ORIGIN HALL',
        assemble: 'BUILDING HOMEPAGE',
        ready: 'ORIGIN IS READY',
      }),
    },
  },
];

const DEFAULT_WORLD_COPY: Site00LoaderRouteCopy = {
  experienceTitle: 'ASSEMBLING SITE 00',
  completionMessage: 'SITE 00 READY',
  stages: worldStages({
    bootstrap: 'WAKING THE HALL',
    preparing: 'LOADING YOUR PAGE',
    connect: 'OPENING THE HALL',
    assemble: 'BUILDING THE VIEW',
    ready: 'SITE IS READY',
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
