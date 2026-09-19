/**
 * P0.VR.4 — Founder approval gate.
 */

import type { DesignReconstructionAsset, FounderJudgment } from './types.js';
import { setFounderJudgment, updateReconstructionAsset } from './assetStore.js';

export function approveAssetLoveIt(assetId: string): DesignReconstructionAsset | null {
  return setFounderJudgment(assetId, 'LOVE_IT');
}

export function rejectAsset(assetId: string): DesignReconstructionAsset | null {
  return setFounderJudgment(assetId, 'REJECT');
}

export function founderApprovalGatePassed(asset: DesignReconstructionAsset): boolean {
  return asset.founderJudgment === 'LOVE_IT' && asset.status === 'APPROVED';
}

export function onlyApprovedAssetsBecomeCanonical(asset: DesignReconstructionAsset): boolean {
  return asset.founderJudgment !== 'LOVE_IT';
}

export function requestRegenerate(assetId: string): DesignReconstructionAsset | null {
  return updateReconstructionAsset(assetId, {
    founderJudgment: 'REGENERATE' as FounderJudgment,
    status: 'READY_TO_GENERATE',
  });
}

export function markAwaitingFounderApproval(assetId: string): DesignReconstructionAsset | null {
  return updateReconstructionAsset(assetId, { status: 'AWAITING_FOUNDER_APPROVAL' });
}
