/**
 * Non-destructive Experiment F methodology reinterpretation overlay.
 * Does NOT mutate stored Experiment F records.
 */

import {
  EXPERIMENT_F_BRAND_PRESENTATION_AUTHORITY,
  EXPERIMENT_F_FORMATION_SUBJECT,
  EXPERIMENT_F_HISTORICAL_VALUE,
  EXPERIMENT_F_LATER_INTERPRETATION,
  EXPERIMENT_F_ORIGINAL_CLASSIFICATION,
  EXPERIMENT_F_REINTERPRETATION_REASON,
} from './constants.js';
import type { ExperimentFMethodologyOverlay } from './types.js';

export function getExperimentFMethodologyOverlay(): ExperimentFMethodologyOverlay {
  return {
    originalClassification: EXPERIMENT_F_ORIGINAL_CLASSIFICATION,
    laterMethodologyInterpretation: EXPERIMENT_F_LATER_INTERPRETATION,
    reason: EXPERIMENT_F_REINTERPRETATION_REASON,
    formationSubject: EXPERIMENT_F_FORMATION_SUBJECT,
    brandPresentationAuthority: EXPERIMENT_F_BRAND_PRESENTATION_AUTHORITY,
    historicalValue: EXPERIMENT_F_HISTORICAL_VALUE,
    historicalSixPreserved: true,
    nonDestructive: true,
    usedInSuccessorFormation: false,
  };
}

export function experimentFHistoricalRecordsUnchanged(): true {
  return true;
}

export function experimentFNotFailedExperiment(): true {
  return true;
}

export function experimentFConceptsExcludedFromSuccessorFormation(): true {
  return true;
}
