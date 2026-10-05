/**
 * P0.FILM.1 — Cinematography bible.
 */

import type { BrandCinematographyBible } from '../types.js';

export function buildBrandCinematographyBible(params: {
  brandId: string;
  overrides?: Partial<BrandCinematographyBible>;
}): BrandCinematographyBible {
  const base: BrandCinematographyBible = {
    brandId: params.brandId,
    primaryPrinciple: 'The camera observes her life. It does not constantly present her to us.',
    cameraDistancePreference: ['medium-wide', 'medium', 'table-level'],
    subjectProminence: 'character exists inside environment',
    environmentVisibility: 'high — world is part of story',
    framingBias: ['off-center', 'observational', 'environmental'],
    lensRange: '24-50mm equivalent naturalistic',
    cameraStability: 'mostly stable with handheld tolerance',
    handheldTolerance: 'moderate — social-native not shaky',
    focusBehavior: 'subject sharp, environment readable',
    motionBehavior: 'follow behind, table-level, caught-not-presented',
    directCameraFrequency: 'rare — meaningful when used',
    avoid: [
      'centered influencer framing',
      'constant close-ups',
      'slow cinematic orbit',
      'fashion runway walking',
      'overuse shallow DOF',
    ],
  };
  return { ...base, ...params.overrides };
}
