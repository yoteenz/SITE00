/**
 * P0.CGO.1 — Location story potential scoring.
 */

import type { LocationStoryPotential } from './types.js';

export function scoreLocationStoryPotential(location: string): LocationStoryPotential {
  const lower = location.toLowerCase();
  const isBackdropOnly = /lobby|hotel|studio backdrop|generic/i.test(lower) && !/platform|elevator|hall|vanity|rooftop|pool|table/i.test(lower);

  const shotVariety = isBackdropOnly ? 0.35 : /platform|elevator|hall|vanity|rooftop|pool|library/i.test(lower) ? 0.85 : 0.6;
  const humanAction = /platform|elevator|hall|pool|vanity|café|cafe/i.test(lower) ? 0.9 : 0.4;
  const productIntegration = isBackdropOnly ? 0.3 : 0.75;
  const motifOpportunities = /hall|library|elevator|vanity|platform/i.test(lower) ? 0.85 : 0.5;
  const lightTexture = 0.7;
  const productionEfficiency = /one location|single|elevator|vanity/i.test(lower) ? 0.9 : 0.65;
  const narrativeRange = shotVariety * 0.9;

  const overall =
    (shotVariety + humanAction + productIntegration + motifOpportunities + lightTexture + productionEfficiency + narrativeRange) / 7;

  return {
    location,
    shotVariety,
    humanAction,
    productIntegration,
    motifOpportunities,
    lightTexture,
    productionEfficiency,
    narrativeRange,
    overall: Math.round(overall * 100) / 100,
  };
}
