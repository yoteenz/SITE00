/**
 * Historical evidence quarantine — Experiment D withheld from blind formation.
 */

import {
  EXPERIMENT_D_HISTORICAL_SIX_NAMES,
  EXPERIMENT_D_TERRITORY_EVIDENCE_POLICY,
  FORMATION_CONTAMINATION_BLOCKLIST,
} from './constants.js';
import type { ExperimentEvidencePolicy } from './constants.js';

export function experimentDQuarantinePolicy(): ExperimentEvidencePolicy {
  return EXPERIMENT_D_TERRITORY_EVIDENCE_POLICY;
}

export function oldSixAvailableToFormation(): false {
  return false;
}

export function oldSixAvailableForPostFormationComparison(): true {
  return true;
}

export function containsQuarantinedExperimentDContent(text: string): boolean {
  const normalized = text.toLowerCase();
  return EXPERIMENT_D_HISTORICAL_SIX_NAMES.some((name) => normalized.includes(name.toLowerCase()));
}

export function containsFormationContamination(text: string): string | null {
  const normalized = text.toLowerCase();
  for (const blocked of FORMATION_CONTAMINATION_BLOCKLIST) {
    if (normalized.includes(blocked.toLowerCase())) {
      return blocked;
    }
  }
  return null;
}

export function assertFormationPromptQuarantined(promptPayload: string): void {
  const hit = containsFormationContamination(promptPayload);
  if (hit) {
    throw new Error(`Formation contamination blocked: ${hit}`);
  }
}

export function filterFormationInputEvidence<T extends { policy: ExperimentEvidencePolicy }>(
  items: T[],
): T[] {
  return items.filter((item) => item.policy === 'FORMATION_INPUT');
}

export function excludePostFormationComparisonFromFormation<T extends { policy: ExperimentEvidencePolicy }>(
  items: T[],
): T[] {
  return items.filter((item) => item.policy !== 'POST_FORMATION_COMPARISON');
}
