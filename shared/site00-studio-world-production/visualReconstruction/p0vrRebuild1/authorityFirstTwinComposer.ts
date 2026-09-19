/**
 * P0.VR.REBUILD.1 — Compose fresh authority-shaped twin (manifest for React surface).
 */

import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import { P0_VR_REBUILD_1_BUILD } from './constants.js';
import { buildAuthorityCompositionBlueprint } from './authorityCompositionBlueprint.js';
import { buildCurrentPageFunctionalInventory } from './currentPageFunctionalInventory.js';
import { buildFunctionalTransplantPlan } from './functionalTransplantPlan.js';
import { resolveReconstructionStrategy } from './reconstructionStrategyResolver.js';
import type {
  AuthorityCompositionBlueprint,
  FunctionalTransplantPlan,
  ReconstructionStrategy,
  TwinCompositionVersion,
} from './types.js';

export type AuthorityFirstTwinCompositionResult = {
  strategy: ReconstructionStrategy;
  blueprint: AuthorityCompositionBlueprint;
  transplantPlan: FunctionalTransplantPlan;
  compositionVersion: TwinCompositionVersion;
  renderMode: 'AUTHORITY_FIRST_NDX_OVERVIEW';
  buildDetail: string;
};

export function composeAuthorityFirstTwin(session: ReconstructionTwinSession): AuthorityFirstTwinCompositionResult {
  const { strategy } = resolveReconstructionStrategy({
    pageId: session.pageId,
    viewport: session.viewport,
    pageArchetype: 'ndxbook-overview-mobile',
    screenId: 'overview',
  });

  if (strategy !== 'REBUILD_FROM_AUTHORITY') {
    throw new Error(`AUTHORITY_REBUILD_FAILED: strategy ${strategy} — explicit rebuild required for this page`);
  }

  const blueprint = buildAuthorityCompositionBlueprint({
    pageId: session.pageId,
    viewport: session.viewport,
    authorityVersionId: session.authorityVersionId,
    pageArchetype: 'ndxbook-overview-mobile',
    screenId: 'overview',
  });

  const inventory = buildCurrentPageFunctionalInventory({
    sessionId: session.sessionId,
    contract: session.functionContract,
  });
  const transplantPlan = buildFunctionalTransplantPlan({
    sessionId: session.sessionId,
    blueprint,
    inventory,
  });

  if (transplantPlan.status === 'FAILED') {
    throw new Error('AUTHORITY_REBUILD_FAILED: functional transplant plan failed');
  }

  const compositionVersion: TwinCompositionVersion = {
    versionId: `tcv_${session.sessionId}_${Date.now()}`,
    sessionId: session.sessionId,
    strategy: 'REBUILD_FROM_AUTHORITY',
    blueprintVersionId: blueprint.blueprintId,
    functionalTransplantPlanId: transplantPlan.planId,
    buildRef: P0_VR_REBUILD_1_BUILD,
    createdAt: new Date().toISOString(),
    status: 'READY',
  };

  return {
    strategy,
    blueprint,
    transplantPlan,
    compositionVersion,
    renderMode: 'AUTHORITY_FIRST_NDX_OVERVIEW',
    buildDetail: `Authority-first composition ${compositionVersion.versionId} — ${blueprint.regionOrder.length} regions`,
  };
}
