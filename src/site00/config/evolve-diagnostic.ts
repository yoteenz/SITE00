/**
 * EVOLVE mobile property evolution — selected-path metadata and hero copy.
 * Paths and process steps remain in evolve.ts.
 */

import type { EvolvePathId } from './evolve';
import { evolveAssessmentPath } from './evolve-assessment';
import { site00EvolveAssessmentDesktopPath } from './routes';

export const EVOLVE_DEFAULT_PATH: EvolvePathId = 'refine';

export const EVOLVE_MOBILE_HERO_COPY = {
  kicker: 'EVOLVE /',
  title: 'PROPERTY EVOLUTION',
  headline: 'WHAT DOES YOUR DIGITAL PROPERTY NEED NEXT?',
  subhead: 'REFINE WHAT EXISTS, INSTALL NEW CAPABILITIES, OR TRANSFORM THE FOUNDATION.',
} as const;

export type EvolveSelectedPathMeta = {
  propertyStatus: string;
  interventionLevel: string;
  recommendedEntry: string;
};

export const EVOLVE_SELECTED_PATH_META: Record<EvolvePathId, EvolveSelectedPathMeta> = {
  refine: {
    propertyStatus: 'EXISTING PROPERTY: PRESERVED',
    interventionLevel: 'INTERVENTION LEVEL: TARGETED',
    recommendedEntry: 'RECOMMENDED ENTRY: PROPERTY ASSESSMENT',
  },
  install: {
    propertyStatus: 'EXISTING PROPERTY: EXTENDED',
    interventionLevel: 'INTERVENTION LEVEL: MODULAR',
    recommendedEntry: 'RECOMMENDED ENTRY: PROPERTY ASSESSMENT',
  },
  transform: {
    propertyStatus: 'EXISTING PROPERTY: RESTRUCTURED',
    interventionLevel: 'INTERVENTION LEVEL: DEEP',
    recommendedEntry: 'RECOMMENDED ENTRY: PROPERTY ASSESSMENT',
  },
};

export const EVOLVE_CLOSING_COPY = {
  headline: "YOUR PROPERTY DOESN'T START OVER.",
  title: 'IT MOVES FORWARD.',
  body: "SITE 00 EVOLVES WHAT EXISTS INTO WHAT'S NEXT.",
  ctaLabel: 'READY TO EVOLVE?',
  cta: 'BEGIN PROPERTY ASSESSMENT →',
} as const;

/** Split path description into capability lines for diagnostic cards. */
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
