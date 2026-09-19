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

export function evaluateNorthStarHumanMadeCalibrations(): {
  humanMark: import('./types.js').HumanMarkCalibration;
  limeIntervention: import('./types.js').LimeInterventionCalibration;
  makerAuthenticity: import('./types.js').MakerAuthenticityCalibration;
} {
  const now = new Date().toISOString();
  return {
    humanMark: {
      calibrationId: 'human-mark-calibration-v1',
      classification: 'HUMAN_MARK_CALIBRATION',
      handDrawnQuality: 'HIGH',
      makerTraces: 'HIGH',
      visualSpontaneity: 'MODERATE',
      evaluatedAt: now,
    },
    limeIntervention: {
      calibrationId: 'lime-intervention-calibration-v1',
      classification: 'LIME_INTERVENTION_CALIBRATION',
      visibility: 'MODERATE',
      appliedNotDecorative: true,
      evaluatedAt: now,
    },
    makerAuthenticity: {
      calibrationId: 'maker-authenticity-calibration-v1',
      classification: 'MAKER_AUTHENTICITY_CALIBRATION',
      humanAuthorship: 'HIGH',
      antiAiVectorGuard: 'HIGH',
      evaluatedAt: now,
    },
  };
}
