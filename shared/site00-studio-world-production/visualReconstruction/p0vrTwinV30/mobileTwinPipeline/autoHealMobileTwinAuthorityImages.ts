import { applyMobileTwinAuthorityImageSnapshot, readMobileTwinAuthorityImageSnapshot } from './mobileTwinAuthorityImageSnapshot.js';
import { resolveMobileTwinReviewSlots } from './hydrateMobileTwinReviewState.js';
import {
  readMobileTwinPipelineFromBrowser,
  restoreMobileTwinPipelineFromBrowserStore,
  writeMobileTwinPipelineToBrowser,
} from './mobileTwinPipelinePersistence.js';
import { reconcileMobileTwinPipelineState } from './reconcileMobileTwinPipelineState.js';
import { rehydrateMobileTwinVisualArtifactsFromStore } from './rehydrateMobileTwinVisualArtifacts.js';
import type { MobileTwinPipelineState } from './types.js';

export function mobileTwinAuthorityImagesReady(
  pipeline: MobileTwinPipelineState,
  projectId?: string,
): boolean {
  const reconciled = reconcileMobileTwinPipelineState(pipeline, projectId);
  const slots = resolveMobileTwinReviewSlots(reconciled);
  return Boolean(slots.actualRender?.renderImageUri && slots.blueprintTwin?.twinImageUri);
}

function healPass(pipeline: MobileTwinPipelineState, projectId: string): MobileTwinPipelineState {
  let next = rehydrateMobileTwinVisualArtifactsFromStore(pipeline);
  next = applyMobileTwinAuthorityImageSnapshot(next, projectId);
  next = reconcileMobileTwinPipelineState(next, projectId);
  return next;
}

/** Best-effort remount of Actual + Blueprint from dedicated LS, backup, and URI snapshot. */
export function autoHealMobileTwinAuthorityImages(
  pipeline: MobileTwinPipelineState,
  projectId: string,
): MobileTwinPipelineState {
  let best = healPass(pipeline, projectId);
  if (mobileTwinAuthorityImagesReady(best, projectId)) return best;

  const restored = restoreMobileTwinPipelineFromBrowserStore(projectId, best);
  if (restored) {
    best = healPass(restored, projectId);
    if (mobileTwinAuthorityImagesReady(best, projectId)) return best;
  }

  const stored = readMobileTwinPipelineFromBrowser(projectId);
  if (stored) {
    best = healPass(stored, projectId);
    if (mobileTwinAuthorityImagesReady(best, projectId)) return best;
  }

  const snap = readMobileTwinAuthorityImageSnapshot(projectId);
  if (snap?.actualRenderUri || snap?.blueprintTwinUri) {
    best = healPass({ ...best, renders: [], blueprintTwins: [] }, projectId);
  }

  if (mobileTwinAuthorityImagesReady(best)) {
    writeMobileTwinPipelineToBrowser(projectId, best);
  }
  return best;
}

export function authorityImagesRecoverableOffDevice(projectId: string): boolean {
  if (readMobileTwinAuthorityImageSnapshot(projectId)) return true;
  const stored = readMobileTwinPipelineFromBrowser(projectId);
  if (!stored) return false;
  const healed = rehydrateMobileTwinVisualArtifactsFromStore(stored);
  return healed.renders.some((r) => r.renderImageUri) || healed.blueprintTwins.some((b) => b.twinImageUri);
}
