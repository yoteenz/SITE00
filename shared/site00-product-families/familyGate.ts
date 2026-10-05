/**
 * Family implementation gate + completeness contract.
 *
 * SCREEN_COMPLETE != FAMILY_COMPLETE. A family is implementation-gated on screens, states, interactions,
 * components, responsive targets, a resolved asset policy and QA; it is complete only with founder approval.
 */

import { isAssetPolicyResolved } from './assetFirstPolicy.js';
import type { FamilyProductionContract } from './familyProductionContract.js';

export const FAMILY_IMPLEMENTATION_GATE_KEYS = [
  'SCREENS_READY',
  'STATES_READY',
  'INTERACTIONS_READY',
  'COMPONENTS_READY',
  'RESPONSIVE_READY',
  'ASSET_POLICY_RESOLVED',
  'QA_READY',
] as const;
export type FamilyGateKey = (typeof FAMILY_IMPLEMENTATION_GATE_KEYS)[number];
export type FamilyGateValue = 'PASS' | 'FAIL' | 'LEGACY_EXCEPTION';

export type RuntimeCoverage = {
  /** Screen ids the project runtime can render. */
  screens: readonly string[];
  /** State ids the runtime can render (`?state=`). */
  states: readonly string[];
  /** Interaction ids bound to a runtime trigger. */
  interactions: readonly string[];
  /** Component refs that resolve to a runtime component. */
  components: readonly string[];
  /** Responsive targets verified (MOBILE / TABLET / DESKTOP). */
  responsive: readonly string[];
};

export type FamilyGateResult = {
  familyId: string;
  gate: Record<FamilyGateKey, FamilyGateValue>;
  missing: Partial<Record<FamilyGateKey, string[]>>;
  /** Every gate key passes (LEGACY_EXCEPTION counts as resolved). */
  implementationReady: boolean;
  /** Screens exist, but that alone never completes a family. */
  screenComplete: boolean;
  familyComplete: boolean;
};

export function evaluateFamilyGate(contract: FamilyProductionContract, coverage: RuntimeCoverage): FamilyGateResult {
  const missing: FamilyGateResult['missing'] = {};
  const need = (key: FamilyGateKey, wanted: readonly string[], have: readonly string[]): FamilyGateValue => {
    const gap = wanted.filter((w) => !have.includes(w));
    if (gap.length) missing[key] = gap;
    return gap.length ? 'FAIL' : 'PASS';
  };
  const componentRefs = [...new Set(contract.interactions.map((i) => i.componentRef))];
  const gate: Record<FamilyGateKey, FamilyGateValue> = {
    SCREENS_READY: need('SCREENS_READY', contract.screens.map((s) => s.id), coverage.screens),
    STATES_READY: need('STATES_READY', contract.states.map((s) => s.id), coverage.states),
    INTERACTIONS_READY: need('INTERACTIONS_READY', contract.interactions.map((i) => i.id), coverage.interactions),
    COMPONENTS_READY: need('COMPONENTS_READY', componentRefs, coverage.components),
    RESPONSIVE_READY: need('RESPONSIVE_READY', contract.responsive.map((r) => r.id), coverage.responsive),
    ASSET_POLICY_RESOLVED:
      contract.assetPolicy.resolution === 'LEGACY_EXCEPTION' && isAssetPolicyResolved(contract.assetPolicy) ? 'LEGACY_EXCEPTION'
      : isAssetPolicyResolved(contract.assetPolicy) ? 'PASS'
      : 'FAIL',
    QA_READY: contract.qaStatus === 'LIVE_PASS' ? 'PASS' : 'FAIL',
  };
  if (gate.QA_READY === 'FAIL') missing.QA_READY = [`qaStatus=${contract.qaStatus}`];
  const implementationReady = FAMILY_IMPLEMENTATION_GATE_KEYS.every((k) => gate[k] !== 'FAIL');
  return {
    familyId: contract.familyId,
    gate,
    missing,
    implementationReady,
    screenComplete: gate.SCREENS_READY === 'PASS',
    familyComplete: implementationReady && contract.founderApproval.approved,
  };
}

/** The 16-point family completeness contract (what "complete" means beyond screens). */
export const FAMILY_COMPLETENESS_CONTRACT = [
  'PRODUCT_PURPOSE',
  'SCREEN_TREE',
  'PARENT_AUTHORITY',
  'CHILDREN',
  'GRANDCHILDREN_WHERE_REQUIRED',
  'STATE_AUTHORITIES',
  'INTERACTION_INVENTORY',
  'INTERACTION_AUTHORITIES',
  'COMPONENT_MAPPING',
  'ASSET_CONTRACT',
  'ICON_CONTRACT',
  'RESPONSIVE_BEHAVIOR',
  'DATA_DEPENDENCIES',
  'IMPLEMENTATION',
  'LIVE_QA',
  'FOUNDER_APPROVAL',
] as const;
export type FamilyCompletenessItem = (typeof FAMILY_COMPLETENESS_CONTRACT)[number];

export function evaluateFamilyCompleteness(
  c: FamilyProductionContract,
  gate: FamilyGateResult,
): Record<FamilyCompletenessItem, boolean> {
  return {
    PRODUCT_PURPOSE: !!c.purpose,
    SCREEN_TREE: c.screens.length > 0,
    PARENT_AUTHORITY: c.screens.some((s) => s.id === c.parentScreen && s.role === 'PARENT' && !!s.authorityFile),
    CHILDREN: c.screens.some((s) => s.role === 'CHILD'),
    // Grandchildren are only required when a child declares them; F01-style flat families pass.
    GRANDCHILDREN_WHERE_REQUIRED: c.screens.filter((s) => s.role === 'GRANDCHILD').every((g) => c.screens.some((s) => s.id === g.parentId)),
    STATE_AUTHORITIES: c.states.length > 0,
    INTERACTION_INVENTORY: c.interactions.length > 0,
    INTERACTION_AUTHORITIES: c.interactions.every((i) => !!i.authorityFile),
    COMPONENT_MAPPING: gate.gate.COMPONENTS_READY === 'PASS',
    ASSET_CONTRACT: gate.gate.ASSET_POLICY_RESOLVED !== 'FAIL',
    ICON_CONTRACT: c.iconRequirements.length > 0,
    RESPONSIVE_BEHAVIOR: gate.gate.RESPONSIVE_READY === 'PASS',
    DATA_DEPENDENCIES: c.dataObjects.length > 0,
    IMPLEMENTATION: gate.gate.SCREENS_READY === 'PASS' && gate.gate.INTERACTIONS_READY === 'PASS',
    LIVE_QA: c.qaStatus === 'LIVE_PASS',
    FOUNDER_APPROVAL: c.founderApproval.approved,
  };
}
