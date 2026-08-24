/**
 * North-star art-board materiality calibration (CALIBRATION_ONLY).
 */

import type { ArtBoardMaterialityCalibration } from './types.js';

export function evaluateNorthStarArtBoardMateriality(): ArtBoardMaterialityCalibration {
  return {
    calibrationId: 'art-board-materiality-calibration-v1',
    northStarId: 'founder-marketing-north-star-ndxbook',
    surfaceTactility: 'HIGH',
    artifactConstruction: 'HIGH',
    handledObjectFeel: 'HIGH',
    imperfectCanvas: 'HIGH',
    specificPaperType: 'LOW',
    tornEdgeRequirement: 'NONE',
    tapeRequirement: 'NONE',
    notebookRequirement: 'NONE',
    classification: 'ART_BOARD_MATERIALITY_CALIBRATION',
    identityAuthority: 'NONE',
    evaluatedAt: new Date().toISOString(),
  };
}

export function northStarMaterialNotIdentityPromotion(): true {
  return true;
}
