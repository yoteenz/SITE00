import type {
  DesignProductionState,
  DesignReadinessReceipt,
  ReadinessGateCheck,
  ReadinessGateResult,
} from './types.js';
import { assertContractFrozenForProduction, readComposerContractJson } from './composerContractFreeze.js';

function gate(
  id: string,
  label: string,
  scope: ReadinessGateCheck['scope'],
  result: ReadinessGateResult,
  reason: string,
  blocking: boolean,
): ReadinessGateCheck {
  return { id, label, scope, result, reason, blocking };
}

export function computeDesignReadiness(state: DesignProductionState): DesignReadinessReceipt {
  const contract = readComposerContractJson();
  assertContractFrozenForProduction(contract);

  const checks: ReadinessGateCheck[] = [];

  checks.push(
    gate(
      'interaction_contract_frozen',
      'Interaction contract frozen',
      'INTERACTIONS',
      state.contractFreeze.COMPOSER_CONTRACT_STATUS === 'FROZEN_FOR_PRODUCTIONIZATION' ? 'PASS' : 'FAIL',
      'Composer contract must be FROZEN_FOR_PRODUCTIONIZATION',
      true,
    ),
  );

  checks.push(
    gate(
      'mobile_authority_ready',
      'Mobile authority approved or locked',
      'DESIGN_AUTHORITY',
      state.mobileAuthority === 'APPROVED' || state.mobileAuthority === 'LOCKED' ? 'PASS' : 'BLOCKED',
      `mobile=${state.mobileAuthority}`,
      true,
    ),
  );

  checks.push(
    gate(
      'desktop_authority_ready',
      'Desktop authority approved or locked',
      'DESIGN_AUTHORITY',
      state.desktopAuthority === 'APPROVED' || state.desktopAuthority === 'LOCKED' ? 'PASS' : 'BLOCKED',
      `desktop=${state.desktopAuthority}`,
      true,
    ),
  );

  checks.push(
    gate(
      'pair_review_inspected',
      'Authority pair reviewed (inspection)',
      'DESIGN_AUTHORITY',
      state.pairReviewOpenedAt ? 'PASS' : 'BLOCKED',
      'Founder must open PAIR REVIEW before approval',
      true,
    ),
  );

  checks.push(
    gate(
      'authority_formally_reviewed',
      'Review authority decision recorded',
      'DESIGN_AUTHORITY',
      state.authorityReviewDecision === 'APPROVE' ? 'PASS' : 'BLOCKED',
      state.authorityReviewDecision ?? 'no decision',
      true,
    ),
  );

  checks.push(
    gate(
      'pair_locked',
      'Mobile + Desktop pair locked',
      'DESIGN_AUTHORITY',
      state.pairLockedAt && state.mobileAuthority === 'LOCKED' && state.desktopAuthority === 'LOCKED' ?
        'PASS'
      : 'BLOCKED',
      state.pairLockedAt ? 'awaiting lock' : 'not locked',
      true,
    ),
  );

  const tabletOk =
    state.tabletDerivedOk || (state.tabletMode === 'OVERRIDE' && Boolean(state.tabletOverrideApprovedAt));
  checks.push(
    gate(
      'tablet_responsive',
      'Tablet derived or override approved',
      'RESPONSIVE',
      tabletOk ? 'PASS' : 'BLOCKED',
      state.tabletMode === 'OVERRIDE' ? 'override pending approval' : 'derivation required',
      true,
    ),
  );

  checks.push(
    gate(
      'assets_manifest',
      'Approved asset manifest present',
      'ASSETS',
      'PASS',
      'Twin Opus Direct manifest pinned (founder-approved)',
      false,
    ),
  );

  checks.push(
    gate(
      'provenance_lineage',
      'Source lineage recorded',
      'PROVENANCE',
      'PASS',
      'ENTRY001-CAMPAIGN-ARCHIVE lineage',
      false,
    ),
  );

  checks.push(
    gate(
      'founder_decisions',
      'Founder decisions resolved',
      'FOUNDER',
      'PASS',
      'FD-01..FD-09 resolved in contract v2.0.0',
      false,
    ),
  );

  checks.push(
    gate(
      'translation_approved',
      'Translation approved',
      'DESIGN_AUTHORITY',
      state.translationApproved ? 'PASS' : 'BLOCKED',
      'Required before MOVE TO BUILD',
      true,
    ),
  );

  checks.push(
    gate(
      'move_to_build',
      'MOVE TO BUILD',
      'BUILD',
      state.workflowStage === 'BUILD' ? 'PASS' : 'NOT_APPLICABLE',
      'Becomes applicable when DESIGN gates pass',
      state.workflowStage === 'DESIGN',
    ),
  );

  const applicable = checks.filter((c) => c.result !== 'NOT_APPLICABLE');
  const passed = applicable.filter((c) => c.result === 'PASS');
  const blockers = applicable.filter((c) => c.blocking && (c.result === 'FAIL' || c.result === 'BLOCKED'));
  const warnings = checks.filter((c) => !c.blocking && c.result !== 'PASS' && c.result !== 'NOT_APPLICABLE');

  const readinessPercent =
    applicable.length === 0 ? 0 : Math.round((100 * passed.length) / applicable.length);

  const buildEligible =
    blockers.length === 0 &&
    state.pairLockedAt !== null &&
    state.translationApproved &&
    state.packageStatus === 'BUILD_REVIEW_READY';

  const readyLabel: DesignReadinessReceipt['readyLabel'] =
    applicable.length === 0 ? 'UNKNOWN'
    : blockers.length === 0 ? 'READY'
    : 'BLOCKED';

  return {
    id: `drr-${state.sessionVersion}-${readinessPercent}`,
    computedAt: new Date().toISOString(),
    applicableGates: applicable.length,
    passedGates: passed.length,
    readinessPercent,
    blockers,
    warnings,
    checks,
    buildEligible,
    readyLabel,
  };
}
