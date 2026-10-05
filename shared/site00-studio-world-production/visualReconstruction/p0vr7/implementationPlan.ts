/**
 * P0.VR.7 — Reference implementation plan builder.
 */

import { IMPLEMENTATION_ORDER } from './constants.js';
import type {
  DesignReferenceDecomposition,
  FidelityMode,
  ReferenceImplementationPlan,
} from './types.js';

function planId(): string {
  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildReferenceImplementationPlan(input: {
  contractId: string;
  fidelityMode: FidelityMode;
  decomposition: DesignReferenceDecomposition;
}): ReferenceImplementationPlan {
  const { decomposition } = input;
  const regions = [...new Set(decomposition.components.map((c) => c.semanticRole))];

  return {
    planId: planId(),
    contractId: input.contractId,
    referenceAuthority: input.fidelityMode,
    regions,
    assetsDetected: decomposition.assetManifest.length,
    liveUiRegions: decomposition.liveUiRegionCount,
    currentVisualsToReplace: decomposition.components.filter((c) => c.classification === 'LIVE_DOM_UI').length,
    functionalComponentsToPreserve: decomposition.liveUiRegionCount,
    implementationOrder: [...IMPLEMENTATION_ORDER],
    createdAt: new Date().toISOString(),
  };
}

export function formatInterpretationSummary(plan: ReferenceImplementationPlan): {
  pageType: string;
  authority: string;
  primaryRegions: number;
  soloAssets: number;
  liveUi: boolean;
  preserve: string;
  rebuild: string;
} {
  return {
    pageType: 'DESIGN RECONSTRUCTION',
    authority: `${plan.referenceAuthority} DESIGN`,
    primaryRegions: plan.regions.length,
    soloAssets: plan.assetsDetected,
    liveUi: plan.liveUiRegions > 0,
    preserve: 'ROUTING · DATA · INTERACTIONS',
    rebuild: 'VISUAL IMPLEMENTATION',
  };
}
