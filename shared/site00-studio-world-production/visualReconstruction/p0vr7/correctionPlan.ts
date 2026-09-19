/**
 * P0.VR.7 — Visual correction plan from drift findings.
 */

import type { ReferenceVisualDriftFinding, VisualCorrectionPlan } from './types.js';

function correctionPlanId(): string {
  return `corr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildVisualCorrectionPlan(input: {
  contractId: string;
  findings: ReferenceVisualDriftFinding[];
}): VisualCorrectionPlan {
  const byRegion = new Map<string, string[]>();
  for (const f of input.findings) {
    const key = f.region;
    const list = byRegion.get(key) ?? [];
    list.push(f.description);
    byRegion.set(key, list);
  }

  return {
    planId: correctionPlanId(),
    contractId: input.contractId,
    findings: input.findings,
    targets: [...byRegion.entries()].map(([region, corrections]) => ({ region, corrections })),
    createdAt: new Date().toISOString(),
  };
}

export function shouldContinueCorrectionLoop(fidelityStatus: string): boolean {
  return fidelityStatus === 'MAJOR_DRIFT' || fidelityStatus === 'PARTIAL_MATCH';
}
