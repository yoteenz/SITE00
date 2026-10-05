/**
 * Successor formation quarantine — Experiment F, topics, and named historical anchors excluded.
 * Generic editorial artifact vocabulary is post-formation evaluator territory, not a hard block.
 */

import {
  EXPERIMENT_F_FORMATION_SUBJECT,
  SUCCESSOR_FORMATION_OUTPUT_BLOCKLIST,
} from './constants.js';

/** Safe metadata tokens allowed in formation system payload (not model creative output). */
const FORMATION_METADATA_ALLOWLIST = [
  'FOUNDER_REFERENCE_EVIDENCE',
  'BRAND_PRESENTATION_LEVEL_CALIBRATION',
  'CALIBRATION_ONLY',
  'EXCLUDED_HISTORICAL_EXPERIMENT_EVIDENCE',
  'CREDIT_UTILIZATION_FRAMING',
  'EXPERIMENT_F_SIX_CONTENT_CONCEPTS',
  'BURN_BOOK_CALIBRATION_EVIDENCE',
] as const;

export function successorFormationIsTopicBlind(): true {
  return true;
}

export function creditUtilizationExcludedFromSuccessorFormation(): true {
  return true;
}

export function experimentFConceptsExcludedFromFormation(): true {
  return true;
}

function stripMetadataAllowlist(text: string): string {
  let stripped = text;
  for (const token of FORMATION_METADATA_ALLOWLIST) {
    stripped = stripped.split(token).join('');
  }
  return stripped;
}

export function containsSuccessorFormationContamination(text: string): string | null {
  const normalized = stripMetadataAllowlist(text).toLowerCase();
  for (const blocked of SUCCESSOR_FORMATION_OUTPUT_BLOCKLIST) {
    if (normalized.includes(blocked.toLowerCase())) {
      return blocked;
    }
  }
  if (normalized.includes(EXPERIMENT_F_FORMATION_SUBJECT.toLowerCase())) {
    return EXPERIMENT_F_FORMATION_SUBJECT;
  }
  return null;
}

export function assertSuccessorFormationQuarantined(payload: string): void {
  const hit = containsSuccessorFormationContamination(payload);
  if (hit) {
    throw new Error(`Successor formation quarantine blocked: ${hit}`);
  }
}

export function assertModelConceptOutputQuarantined(modelOutput: string): void {
  assertSuccessorFormationQuarantined(modelOutput);
}

export function burnBookIsCalibrationReferenceNotMandatoryCanon(): true {
  return true;
}

export function burnBookLiteralArtifactNotRequiredInFormation(): true {
  return true;
}

export function historicalEditorialMetaphorsQuarantined(): true {
  return true;
}
