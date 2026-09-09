/**
 * P0.VR.8 — Post-deploy convergence bridge for EXACT authorities.
 */

import { requiresVisualConvergence } from '../p0vr6r2/convergenceEngine.js';
import type { DesignReferenceFidelityContract } from '../p0vr7/types.js';

export function shouldTriggerConvergenceAfterCapture(input: {
  contract: DesignReferenceFidelityContract | null;
  captureSucceeded: boolean;
}): boolean {
  if (!input.captureSucceeded || !input.contract) return false;
  return (
    requiresVisualConvergence(input.contract) &&
    input.contract.authorityMode === 'DESIGN_AUTHORITY' &&
    input.contract.fidelityMode === 'EXACT'
  );
}

export function buildConvergenceTriggerPayload(input: {
  projectId: string;
  pageId: string;
  screenId: string;
  viewport: string;
  liveSnapshotUrl: string;
  referenceUrl: string;
}) {
  return {
    action: 'start_convergence',
    projectId: input.projectId,
    screenId: input.screenId,
    pageId: input.pageId,
    viewport: input.viewport,
    liveSnapshotUrl: input.liveSnapshotUrl,
    referenceUrl: input.referenceUrl,
  };
}
