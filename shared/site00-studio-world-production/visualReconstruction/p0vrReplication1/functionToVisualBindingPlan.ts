/**
 * P0.VR.REPLICATION.1 — FunctionGraph → VisualGraph slot bindings.
 */

import { buildAuthorityCompositionBlueprint } from '../p0vrRebuild1/authorityCompositionBlueprint.js';
import { buildFunctionalTransplantPlan } from '../p0vrRebuild1/functionalTransplantPlan.js';
import { buildCurrentPageFunctionalInventory } from '../p0vrRebuild1/currentPageFunctionalInventory.js';
import type { PageFunctionContract } from '../p0vrUpgrade2/types.js';
import type { DesignViewportClass } from '../p0vr2/types.js';
import type { FunctionToVisualBindingPlan, VisualPageBlueprint } from './types.js';

export function buildFunctionToVisualBindingPlan(input: {
  sessionId: string;
  contract: PageFunctionContract;
  blueprint: VisualPageBlueprint;
  viewport: DesignViewportClass;
}): FunctionToVisualBindingPlan {
  const inventory = buildCurrentPageFunctionalInventory({
    sessionId: input.sessionId,
    contract: input.contract,
  });
  const authorityBlueprint = buildAuthorityCompositionBlueprint({
    pageId: input.blueprint.pageId,
    viewport: input.viewport,
    authorityVersionId: input.blueprint.authorityVersionId,
  });
  const legacyPlan = buildFunctionalTransplantPlan({
    sessionId: input.sessionId,
    blueprint: authorityBlueprint,
    inventory,
  });

  return {
    planId: `fvb_${input.sessionId}`,
    bindings: legacyPlan.bindings.map((b) => ({
      bindingId: b.bindingId,
      functionNodeId: b.sourceFunctionId,
      sourceDataPath: b.sourceDataPath,
      targetRegionId: b.targetRegionId,
      targetSlotId: b.targetSlotId,
      bindingType: b.bindingType,
      status: b.status,
    })),
    status: legacyPlan.status,
  };
}
