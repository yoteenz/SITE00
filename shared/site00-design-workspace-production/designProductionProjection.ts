import type { DesignProductionState, DesignReadinessReceipt } from './types.js';
import { computeDesignReadiness } from './designReadinessEngine.js';

export type TwinOpusReadinessPresentation = {
  percent: number;
  state: string;
  compilerState: string;
  statusRows: readonly { id: string; label: string; value: string }[];
  checks: readonly { id: string; label: string; state: 'pass' | 'fail' | 'pending' }[];
  pairStatusLabel: string;
  stageAuthorityValue: string;
  workflowStage: string;
  buildEligible: boolean;
  receipt: DesignReadinessReceipt;
};

export function pairStatusLabel(state: DesignProductionState): string {
  if (state.pairLockedAt) return `PAIR: LOCKED · ${state.mobileVersion}`;
  if (state.authorityReviewDecision === 'APPROVE') return 'PAIR: APPROVED · AWAITING LOCK';
  if (state.pairReviewOpenedAt) return 'PAIR: UNDER REVIEW';
  return 'PAIR: UNLOCKED';
}

export function projectDesignProductionProjection(state: DesignProductionState): TwinOpusReadinessPresentation {
  const receipt = computeDesignReadiness(state);
  const pending = receipt.checks.filter(
    (c) => c.result === 'BLOCKED' || c.result === 'FAIL',
  ).length;

  return {
    percent: receipt.readinessPercent,
    state: receipt.readyLabel,
    compilerState: receipt.buildEligible ? 'BUILD_ELIGIBLE' : receipt.readyLabel,
    statusRows: [
      { id: 'approved', label: 'APPROVED ELEMENTS', value: String(receipt.passedGates) },
      { id: 'pending', label: 'PENDING DECISIONS', value: String(pending) },
      { id: 'blockers', label: 'BLOCKERS', value: String(receipt.blockers.length) },
      { id: 'warnings', label: 'WARNINGS', value: String(receipt.warnings.length) },
    ],
    checks: receipt.checks
      .filter((c) => c.result !== 'NOT_APPLICABLE')
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        label: c.label.toUpperCase(),
        state: c.result === 'PASS' ? 'pass' : c.result === 'FAIL' ? 'fail' : 'pending',
      })),
    pairStatusLabel: pairStatusLabel(state),
    stageAuthorityValue: pairStatusLabel(state),
    workflowStage: state.workflowStage,
    buildEligible: receipt.buildEligible,
    receipt,
  };
}
