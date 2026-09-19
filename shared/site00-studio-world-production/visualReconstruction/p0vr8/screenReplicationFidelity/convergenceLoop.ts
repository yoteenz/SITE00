/**
 * P0.VR.8-SRF — Reference → blueprint → implement → capture → overlay → diff → correct loop.
 */

import { MAX_CONVERGENCE_PASSES } from './constants.js';
import { measureLiveRegionsAgainstBlueprint } from './fidelityScoring.js';
import { buildCaptureSet, runFullQaPass, runStructuralQaPass } from './structuralQa.js';
import { detectTemplateDrift, wholePageImageCheatDetected } from './templateDriftDetector.js';
import type {
  ScreenReplicationConvergenceState,
  ScreenReplicationFidelityContract,
  ScreenAuthorityBlueprint,
} from './types.js';

export function runScreenReplicationConvergence(input: {
  contract: ScreenReplicationFidelityContract;
  blueprint: ScreenAuthorityBlueprint;
  liveDomMarkers: string[];
  liveRegionPresence: Record<string, boolean>;
  passCount?: number;
}): ScreenReplicationConvergenceState {
  const passCount = input.passCount ?? 1;
  const template = detectTemplateDrift(input.liveDomMarkers);
  const structuralDiffs = measureLiveRegionsAgainstBlueprint({
    blueprint: input.blueprint,
    liveRegionPresence: input.liveRegionPresence,
    usesGenericTemplate: template.templateDrift,
  });
  const differences = [...template.differences, ...structuralDiffs];
  const structuralQa = runStructuralQaPass({ blueprint: input.blueprint, differences });
  const fullQa = runFullQaPass({ blueprint: input.blueprint, differences });
  const assetPendingCount = input.blueprint.regions.filter((r) => r.rebuildClass === 'ASSET_DEFERRED').length;
  const cheat = wholePageImageCheatDetected(input.liveDomMarkers);

  let status: ScreenReplicationConvergenceState['status'] = 'IN_PROGRESS';
  if (cheat) status = 'FAILED';
  else if (structuralQa.passed) status = 'STRUCTURAL_AUTHORITY_VERIFIED';
  else if (passCount >= MAX_CONVERGENCE_PASSES) status = 'BLOCKED';

  return {
    sessionId: `srf-session-${input.contract.contractId}`,
    contractId: input.contract.contractId,
    passCount,
    structuralQa,
    fullQa,
    captures: buildCaptureSet({
      referencePath: input.contract.referencePath,
      livePath: input.contract.route,
      viewportWidth: input.blueprint.pageBounds.width,
      viewportHeight: input.blueprint.pageBounds.height,
    }),
    status,
    assetPendingCount,
    templateDriftDetected: template.templateDrift,
    compositionCloningDetected: false,
    wholePageImageCheatDetected: cheat,
  };
}

export function shouldContinueConvergence(state: ScreenReplicationConvergenceState): boolean {
  return (
    state.status === 'IN_PROGRESS' &&
    state.passCount < MAX_CONVERGENCE_PASSES &&
    !state.wholePageImageCheatDetected
  );
}

export function mobilePassGate(state: ScreenReplicationConvergenceState): boolean {
  return state.status === 'STRUCTURAL_AUTHORITY_VERIFIED';
}

export function desktopIndependentAuthorityRequired(mobilePassed: boolean): boolean {
  return mobilePassed;
}
