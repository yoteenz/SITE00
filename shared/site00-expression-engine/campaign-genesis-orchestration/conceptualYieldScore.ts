/**
 * P0.CGO.1 — Conceptual yield scoring + weak concept detection.
 */

import type {
  ConceptualConvergenceMap,
  ConceptualYieldScore,
  ConvergenceDimension,
} from './types.js';

const ALL_DIMENSIONS: ConvergenceDimension[] = [
  'SETTING',
  'TITLE',
  'COPY',
  'PROP_SYSTEM',
  'PRODUCT_ROLE',
  'BODY_INTERACTION',
  'HUMAN_BEHAVIOR',
  'WARDROBE',
  'NAILS',
  'HAIR',
  'MAKEUP',
  'GRAPHIC_LANGUAGE',
  'COLOR',
  'MOTION',
  'SHOT_VARIETY',
  'TEASER_POTENTIAL',
  'REVEAL_POTENTIAL',
  'CHANNEL_ADAPTATION',
];

const WEAK_CONCEPT_PATTERNS = [
  /^luxury$/i,
  /^glam$/i,
  /^futuristic$/i,
  /^cool hotel$/i,
  /^stylish location$/i,
  /^beautiful woman/i,
  /^product in a/i,
];

export function buildConceptualConvergenceMap(input: {
  centralIdea: string;
  dimensions: Partial<Record<ConvergenceDimension, string>>;
}): ConceptualConvergenceMap {
  const filled = Object.entries(input.dimensions).filter(([, v]) => v && v.trim());
  return {
    centralIdea: input.centralIdea,
    dimensions: input.dimensions,
    convergenceCount: filled.length,
  };
}

export function computeConceptualYieldScore(map: ConceptualConvergenceMap): ConceptualYieldScore {
  const dimensionsCovered = ALL_DIMENSIONS.filter((d) => map.dimensions[d]?.trim());
  const dimensionCount = dimensionsCovered.length;
  const overall = Math.round((dimensionCount / ALL_DIMENSIONS.length) * 100) / 100;

  let classification: ConceptualYieldScore['classification'] = 'HIGH_YIELD';
  if (overall < 0.35 || isWeakConcept(map.centralIdea)) {
    classification = 'LOW_CONCEPTUAL_YIELD';
  } else if (overall < 0.55) {
    classification = 'MEDIUM_YIELD';
  }

  return {
    overall,
    dimensionsCovered,
    dimensionCount,
    classification,
  };
}

export function isWeakConcept(centralIdea: string): boolean {
  const trimmed = centralIdea.trim();
  if (trimmed.split(/\s+/).length <= 2 && /luxury|glam|cool|stylish|beautiful/i.test(trimmed)) {
    return true;
  }
  return WEAK_CONCEPT_PATTERNS.some((p) => p.test(trimmed));
}

export function compareYield(a: ConceptualYieldScore, b: ConceptualYieldScore): number {
  return b.overall - a.overall;
}
