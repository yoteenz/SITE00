/**
 * EVOLVE mobile property evolution — selection, path metadata, hero copy.
 * Paths and process steps remain in evolve.ts.
 */

import type { EvolvePathId } from './evolve';
import { evolveAssessmentPath } from './evolve-assessment';
import { site00EvolveAssessmentDesktopPath } from './routes';

export const EVOLVE_DEFAULT_PATH: EvolvePathId = 'refine';

export const EVOLVE_DIAGNOSTIC_STAGES = [
  {
    id: 'existing',
    title: 'EXISTING PROPERTY',
    body: 'Your digital place already exists.',
  },
  {
    id: 'assessment',
    title: 'ASSESSMENT',
    body: 'We evaluate your current foundation.',
  },
  {
    id: 'path',
    title: 'EVOLUTION PATH',
    body: 'Choose how deep we intervene.',
  },
] as const;

export const EVOLVE_SELECTION_HERO_COPY = {
  location: 'LOCATION / EVOLVE / 00',
  kicker: 'EVOLVE / PATH SELECTION',
  headlineLine1: 'CHOOSE YOUR',
  headlineLine2: 'EVOLUTION PATH.',
  subhead: 'HOW DEEPLY SHOULD SITE 00 INTERVENE IN YOUR EXISTING PROPERTY?',
} as const;

/** @deprecated Use EVOLVE_SELECTION_HERO_COPY */
export const EVOLVE_MOBILE_HERO_COPY = {
  kicker: EVOLVE_SELECTION_HERO_COPY.kicker,
  title: 'EVOLUTION PATH',
  headline: EVOLVE_SELECTION_HERO_COPY.headlineLine1,
  subhead: EVOLVE_SELECTION_HERO_COPY.subhead,
} as const;

export type EvolvePathSelectionCard = {
  pathId: EvolvePathId;
  num: string;
  modeLabel: string;
  description: string;
  capabilities: string[];
  selectCta: string;
};

export const EVOLVE_PATH_SELECTION_CARDS: readonly EvolvePathSelectionCard[] = [
  {
    pathId: 'refine',
    num: '01',
    modeLabel: 'OPTIMIZE',
    description: 'Improve what already exists — design, performance, experience, and conversion.',
    capabilities: ['UI/UX IMPROVEMENT', 'PERFORMANCE OPTIMIZATION', 'SEO & CONVERSION', 'CONTENT ENHANCEMENT'],
    selectCta: 'SELECT REFINE →',
  },
  {
    pathId: 'install',
    num: '02',
    modeLabel: 'EXPAND',
    description: 'Add powerful SITE 00 systems and capabilities to your current property.',
    capabilities: ['NEW FEATURES', 'INTEGRATIONS', 'AUTOMATION', 'THIRD-PARTY CONNECTIVITY'],
    selectCta: 'SELECT INSTALL →',
  },
  {
    pathId: 'transform',
    num: '03',
    modeLabel: 'REARCHITECT',
    description: 'Rearchitect, modernize, scale, and future-proof your entire digital foundation.',
    capabilities: ['SYSTEM MODERNIZATION', 'ARCHITECTURE OVERHAUL', 'SCALABILITY', 'NEW TECHNOLOGY STACK'],
    selectCta: 'SELECT TRANSFORM →',
  },
] as const;

export type EvolvePathLockedMeta = {
  propertyState: string;
  foundation: string;
  intervention: string;
  nextProtocol: string;
};

export const EVOLVE_PATH_LOCKED_META: Record<EvolvePathId, EvolvePathLockedMeta> = {
  refine: {
    propertyState: 'EXISTING',
    foundation: 'PRESERVED',
    intervention: 'TARGETED',
    nextProtocol: 'PROPERTY ASSESSMENT',
  },
  install: {
    propertyState: 'EXISTING',
    foundation: 'PRESERVED',
    intervention: 'EXPANSIVE',
    nextProtocol: 'SYSTEM ASSESSMENT',
  },
  transform: {
    propertyState: 'EXISTING',
    foundation: 'REASSESSED',
    intervention: 'DEEP',
    nextProtocol: 'ARCHITECTURE ASSESSMENT',
  },
};

export type EvolvePathScopeConfig = {
  title: string;
  categories: string[];
};

export const EVOLVE_PATH_SCOPE: Record<EvolvePathId, EvolvePathScopeConfig> = {
  refine: {
    title: 'YOUR REFINE SCOPE MAY INCLUDE',
    categories: ['EXPERIENCE', 'PERFORMANCE', 'ACCESSIBILITY', 'CONVERSION'],
  },
  install: {
    title: 'YOUR INSTALL SCOPE MAY INCLUDE',
    categories: ['OPERATIONS', 'COMMERCE', 'INTELLIGENCE', 'CONNECTIONS'],
  },
  transform: {
    title: 'YOUR TRANSFORM SCOPE MAY INCLUDE',
    categories: ['ARCHITECTURE', 'SYSTEMS', 'INFRASTRUCTURE', 'MIGRATION'],
  },
};

export const EVOLVE_OPERATING_PROCESS_COPY = {
  title: 'EVOLVE / OPERATING PROCESS',
  subtitle: 'EXISTING PROPERTY → STUDIO PRODUCTION',
} as const;

export const EVOLVE_CLOSING_COPY = {
  headlineLine1: "YOUR PROPERTY DOESN'T NEED",
  headlineLine2: 'TO START OVER.',
  subhead: 'IT NEEDS A DIRECTION.',
  pathSetLine1: 'YOUR PATH IS SET.',
  pathSetLine2: 'NOW WE ASSESS WHAT EXISTS.',
  ctaDefault: 'START EVOLVE →',
  ctaAssessment: 'BEGIN PROPERTY ASSESSMENT →',
} as const;

/** @deprecated Use EVOLVE_PATH_LOCKED_META */
export type EvolveSelectedPathMeta = {
  propertyStatus: string;
  interventionLevel: string;
  recommendedEntry: string;
};

/** @deprecated Use EVOLVE_PATH_LOCKED_META */
export const EVOLVE_SELECTED_PATH_META: Record<EvolvePathId, EvolveSelectedPathMeta> = {
  refine: {
    propertyStatus: 'PROPERTY STATE: EXISTING',
    interventionLevel: 'INTERVENTION: TARGETED',
    recommendedEntry: 'NEXT PROTOCOL: PROPERTY ASSESSMENT',
  },
  install: {
    propertyStatus: 'PROPERTY STATE: EXISTING',
    interventionLevel: 'INTERVENTION: EXPANSIVE',
    recommendedEntry: 'NEXT PROTOCOL: SYSTEM ASSESSMENT',
  },
  transform: {
    propertyStatus: 'PROPERTY STATE: EXISTING',
    interventionLevel: 'INTERVENTION: DEEP',
    recommendedEntry: 'NEXT PROTOCOL: ARCHITECTURE ASSESSMENT',
  },
};

export function getEvolvePathSelectionCard(pathId: EvolvePathId): EvolvePathSelectionCard | undefined {
  return EVOLVE_PATH_SELECTION_CARDS.find((card) => card.pathId === pathId);
}

/** Split path description into capability lines for legacy cards. */
export function evolvePathCapabilities(description: string): string[] {
  return description
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function resolveEvolveAssessmentDestination(
  pathId: EvolvePathId,
  isDesktopArtboard: boolean,
): string {
  const path = evolveAssessmentPath(pathId, 'property');
  return isDesktopArtboard ? site00EvolveAssessmentDesktopPath(path) : path;
}
