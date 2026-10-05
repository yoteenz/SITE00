/**
 * Responsive inference — separate from reference-constrained truth.
 */

import type { NormalizedVisualReference, ResponsiveInferenceEvaluation } from '../types.js';

export function evaluateResponsiveInference(reference: NormalizedVisualReference): ResponsiveInferenceEvaluation {
  const mobileAuthoritative = reference.detectedDeviceClass === 'mobile';
  const notes: string[] = [];

  if (mobileAuthoritative) {
    notes.push('Mobile reference is pixel-authoritative for this reconstruction.');
    notes.push('Desktop layout inferred from FounderWorkspaceShell grid rules.');
  } else {
    notes.push('Desktop reference authoritative; mobile behavior inferred from SITE 00 shell.');
  }

  return {
    confidence: mobileAuthoritative ? 0.88 : 0.75,
    mobileAuthoritative,
    desktopInferred: mobileAuthoritative,
    tabletInferred: true,
    notes,
  };
}
