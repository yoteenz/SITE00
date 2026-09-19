/**
 * B5.10 — Declared vs observed project state reconciliation.
 */

import type { ProjectStateReconciliation } from './types.js';

function normalizePhase(phase: string): string {
  return phase.toUpperCase().replace(/\s+/g, '_');
}

export function reconcileProjectState(args: {
  declaredPhase: string | null;
  observedSignals: {
    productionDeployed: boolean;
    ciPassing: boolean;
    domainActive: boolean;
    buildFailing: boolean;
    missingEnvVars: number;
  };
}): ProjectStateReconciliation {
  const declared = normalizePhase(args.declaredPhase ?? '');
  let observedPhase: string | null = null;

  if (args.observedSignals.productionDeployed && args.observedSignals.domainActive) {
    observedPhase = 'LAUNCHED';
  } else if (args.observedSignals.buildFailing) {
    observedPhase = 'BLOCKED';
  } else if (args.observedSignals.missingEnvVars > 0) {
    observedPhase = 'CONFIGURATION';
  } else if (args.observedSignals.ciPassing && !args.observedSignals.productionDeployed) {
    observedPhase = 'PRE_LAUNCH';
  }

  const mismatch =
    observedPhase != null &&
    declared.length > 0 &&
    declared !== observedPhase &&
    !(declared === 'PRE_LAUNCH' && observedPhase === 'PRE_LAUNCH');

  return {
    declaredPhase: declared || null,
    observedPhase,
    mismatch,
    mismatchClass: mismatch ? 'PROJECT_STATE_MISMATCH' : null,
    explanation: mismatch ? `DECLARED ${declared} BUT OBSERVED ${observedPhase}` : null,
  };
}
