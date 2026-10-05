/**
 * Text density + feed rhythm governance.
 */

import type { TextDensityLevel, FeedDensityRhythm, FeedDensityRhythmTarget } from './types.js';
import { FEED_DENSITY_RHYTHM_TARGETS } from './constants.js';

export function buildFeedDensityRhythm(params: {
  boardId: string;
  artifactDensities: TextDensityLevel[];
}): FeedDensityRhythm {
  const targets = [...FEED_DENSITY_RHYTHM_TARGETS] as FeedDensityRhythmTarget[];
  const uniqueDensities = new Set(params.artifactDensities);
  const variationAdequate = uniqueDensities.size >= 2;

  let adjacentBalanced = true;
  for (let i = 0; i < params.artifactDensities.length - 1; i++) {
    const a = params.artifactDensities[i]!;
    const b = params.artifactDensities[i + 1]!;
    if (a === 'DENSE' && b === 'DENSE') adjacentBalanced = false;
    if (a === 'ARCHIVAL_DENSE' && b === 'ARCHIVAL_DENSE') adjacentBalanced = false;
  }

  return {
    boardId: params.boardId,
    targets,
    artifactDensities: params.artifactDensities,
    variationAdequate,
    adjacentIntensityBalanced: adjacentBalanced,
  };
}

export function feedBoardContainsDensityVariation(rhythm: FeedDensityRhythm): boolean {
  return rhythm.variationAdequate;
}

export function evaluateTextDensity(params: {
  level: TextDensityLevel;
  isFirstSlide: boolean;
  justification?: string | null;
}): { level: TextDensityLevel; justified: boolean; justification: string | null; firstSlideAllowed: boolean } {
  const firstSlideAllowed =
    params.isFirstSlide &&
    (params.level === 'SPARSE' || params.level === 'LIGHT' || params.level === 'MODERATE' ||
      (params.level === 'DENSE' && Boolean(params.justification)));

  if (params.isFirstSlide && params.level === 'ARCHIVAL_DENSE') {
    return { level: params.level, justified: false, justification: params.justification ?? null, firstSlideAllowed: false };
  }

  return {
    level: params.level,
    justified: params.level !== 'DENSE' || Boolean(params.justification),
    justification: params.justification ?? null,
    firstSlideAllowed,
  };
}

export function tooMuchSameDensityFails(rhythm: FeedDensityRhythm): boolean {
  const denseCount = rhythm.artifactDensities.filter((d) => d === 'DENSE' || d === 'ARCHIVAL_DENSE').length;
  return denseCount >= rhythm.artifactDensities.length;
}
