/**
 * P0.CGO.1 — Association domain constants.
 */

import type { AssociationDomain } from './types.js';

export const ALL_ASSOCIATION_DOMAINS: AssociationDomain[] = [
  'PRODUCT',
  'BODY_RELATIONSHIP',
  'HUMAN_GESTURE',
  'HUMAN_BEHAVIOR',
  'RITUAL',
  'SOCIAL_SITUATION',
  'OBJECT',
  'PROP',
  'ENVIRONMENT',
  'OCCUPATION',
  'GAME',
  'COMPETITION',
  'RISK',
  'REWARD',
  'IDIOM',
  'PHRASE',
  'LANGUAGE',
  'NUMBER',
  'GEOMETRY',
  'SHAPE',
  'COLOR',
  'MATERIAL',
  'TEXTURE',
  'SOUND',
  'MOTION',
  'ERA',
  'CULTURAL_REFERENCE',
  'MEMORY',
  'STATUS',
  'DESIRE',
  'TENSION',
  'CONTRADICTION',
  'HUMOR',
  'SYMBOL',
  'METAPHOR',
  'TRANSFORMATION',
];

export const PREFERRED_DISTANCES = ['LATERAL', 'UNEXPECTED'] as const;
