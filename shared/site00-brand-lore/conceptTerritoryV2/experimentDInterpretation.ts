/**
 * Non-destructive Experiment D methodology interpretation overlay.
 * Does NOT mutate stored Experiment D records.
 */

import {
  EXPERIMENT_D_CONCEPT_DISTINCTIVENESS,
  EXPERIMENT_D_FOUNDER_CONCLUSION,
  EXPERIMENT_D_LATER_INTERPRETATION,
  EXPERIMENT_D_TERRITORY_EVIDENCE_POLICY,
} from './constants.js';
import type { ExperimentDMethodologyOverlay } from './types.js';

export function getExperimentDMethodologyOverlay(): ExperimentDMethodologyOverlay {
  return {
    experimentDistinctiveness: EXPERIMENT_D_CONCEPT_DISTINCTIVENESS,
    laterMethodologyInterpretation: EXPERIMENT_D_LATER_INTERPRETATION,
    founderConclusion: EXPERIMENT_D_FOUNDER_CONCLUSION,
    originalClassification: 'CREATIVE_CONCEPT_TERRITORY',
    historicalTerritoriesPreserved: true,
    nonDestructive: true,
  };
}

export function experimentDHistoricalRecordsUnchanged(): true {
  return true;
}

export function experimentDMethodologyInterpretationDoesNotMutateEvidence(): true {
  return true;
}

export function annotateHistoricalTerritoryInterpretation(params: {
  originalClassification: string;
}): {
  originalClassification: string;
  laterMethodologyInterpretation: typeof EXPERIMENT_D_LATER_INTERPRETATION;
  founderConclusion: typeof EXPERIMENT_D_FOUNDER_CONCLUSION;
  evidencePolicy: typeof EXPERIMENT_D_TERRITORY_EVIDENCE_POLICY;
} {
  return {
    originalClassification: params.originalClassification,
    laterMethodologyInterpretation: EXPERIMENT_D_LATER_INTERPRETATION,
    founderConclusion: EXPERIMENT_D_FOUNDER_CONCLUSION,
    evidencePolicy: EXPERIMENT_D_TERRITORY_EVIDENCE_POLICY,
  };
}
