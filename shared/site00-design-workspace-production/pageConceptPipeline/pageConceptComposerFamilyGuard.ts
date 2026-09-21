/**
 * P0.VR.PAGE-FAMILY-SKIN-BEHAVIOR-CONTRACT1 — Composer must not invent family patterns.
 */

import type { PageFamilyComponentExpressionMap, PageFamilyComponentKey } from './pageConceptPageFamilyComponentExpression.js';
import { findComponentExpression } from './pageConceptPageFamilyComponentExpression.js';
import type { PageFamilySkinBehaviorContract } from './pageConceptPageFamilySkinBehavior.js';
import { assertComposerPreFinalTargetSurface } from './pageConceptTwinLiveFirewall.js';

export function assertComposerFamilyContractPresent(contract: PageFamilySkinBehaviorContract | null | undefined): void {
  if (!contract?.approvedAt) {
    throw new Error('COMPOSER_FAMILY_CONTRACT_REQUIRED');
  }
}

export function assertComposerFamilyPatternDefined(input: {
  patternKey: PageFamilyComponentKey | string;
  contract: PageFamilySkinBehaviorContract;
  componentMap: PageFamilyComponentExpressionMap;
  approvedExtensions?: readonly { patternKey: string; approvedAt: string | null }[];
}): void {
  assertComposerPreFinalTargetSurface('TWIN');
  assertComposerFamilyContractPresent(input.contract);

  const asComponent = input.patternKey as PageFamilyComponentKey;
  const fromMap = findComponentExpression(input.componentMap, asComponent);
  if (fromMap) return;

  const ext = input.approvedExtensions?.find((e) => e.patternKey === input.patternKey && e.approvedAt);
  if (ext) return;

  throw new Error(`PAGE_FAMILY_PATTERN_UNDEFINED:${input.patternKey}`);
}

export function assertDivergenceWithinBudget(input: {
  level: 'LOCKED' | 'LOW' | 'MODERATE' | 'HIGH';
  requested: 'LOCKED' | 'LOW' | 'MODERATE' | 'HIGH';
  pageTier: 'parent' | 'child' | 'grandchild';
}): void {
  const order = ['LOCKED', 'LOW', 'MODERATE', 'HIGH'] as const;
  const maxIdx = order.indexOf(input.level);
  const reqIdx = order.indexOf(input.requested);
  if (reqIdx > maxIdx) {
    throw new Error(`DESIGN_DIVERGENCE_EXCEEDED:${input.pageTier}:${input.requested}>${input.level}`);
  }
}
