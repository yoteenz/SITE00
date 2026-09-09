/**
 * P0.VR.4R1 — Material preservation QA for glass/chrome/glow assets.
 */

import type { MaterialPreservationQA } from './types.js';
import type { TransparencyValidationResult } from '../p0vr4/types.js';

export function evaluateMaterialPreservationQA(input: {
  transparency: TransparencyValidationResult;
  assetType: string;
}): MaterialPreservationQA {
  const isPlanet = input.assetType === 'HERO_OBJECT';
  const transparentMaterialLoss = input.transparency.transparentMaterialLoss;
  const glowClipping = input.transparency.glowClipping;
  const edgeErosion = input.transparency.edgeErosion;
  const chromeHalo = input.transparency.chromeHalo;
  const orbitBreakage = edgeErosion && isPlanet;

  return {
    transparentMaterialLoss,
    glowClipping,
    edgeErosion,
    chromeHalo,
    orbitBreakage,
    glassPreservation: !transparentMaterialLoss,
    glowPreservation: !glowClipping,
    orbitEdgePreservation: !orbitBreakage,
    overallPass: !transparentMaterialLoss && !glowClipping && !edgeErosion && !orbitBreakage,
  };
}

export function materialPreservationFailureClasses(qa: MaterialPreservationQA): string[] {
  const failures: string[] = [];
  if (qa.transparentMaterialLoss) failures.push('TRANSPARENT_MATERIAL_LOSS');
  if (qa.glowClipping) failures.push('GLOW_CLIPPING');
  if (qa.edgeErosion) failures.push('EDGE_EROSION');
  if (qa.chromeHalo) failures.push('CHROME_HALO');
  if (qa.orbitBreakage) failures.push('ORBIT_BREAKAGE');
  return failures;
}
