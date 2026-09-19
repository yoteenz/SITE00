/**
 * P0.VR.2A — Composer brief asset slot contracts extension.
 */

import type { VisualReconstructionComposerBrief } from '../p0vr2/types.js';
import type { AssetSlotContract, ReferenceVisualAssetSlot } from './types.js';
import { getCompiledPrompt } from './assetGenerationPipeline.js';

export type VisualReconstructionComposerBriefWithAssets = VisualReconstructionComposerBrief & {
  assetSlotContracts: AssetSlotContract[];
  shellBlocksOnAssetGeneration: false;
  concurrentPipeline: true;
};

export function buildAssetSlotContracts(slots: ReferenceVisualAssetSlot[]): AssetSlotContract[] {
  return slots.map((slot) => ({
    slotId: slot.slotId,
    role: slot.assetRole,
    bounds: slot.targetBounds,
    assetStatus: slot.assetStatus,
    resolvedAssetUrl: slot.resolvedAssetUrl,
    prompt: slot.promptId ? getCompiledPrompt(slot.promptId) : null,
    cropContract: slot.cropContract,
    safeArea: slot.safeArea,
    falStatus: slot.generationStatus,
  }));
}

export function extendComposerBriefWithAssetSlots(
  brief: VisualReconstructionComposerBrief,
  slots: ReferenceVisualAssetSlot[],
): VisualReconstructionComposerBriefWithAssets {
  return {
    ...brief,
    assetSlotContracts: buildAssetSlotContracts(slots),
    shellBlocksOnAssetGeneration: false,
    concurrentPipeline: true,
  };
}

export function composerBriefIncludesAssetSlotContracts(
  brief: VisualReconstructionComposerBriefWithAssets,
): boolean {
  return Array.isArray(brief.assetSlotContracts) && brief.assetSlotContracts.length >= 0;
}

export function finalQaShouldRerunAfterAssetBind(allSlotsReady: boolean): boolean {
  return allSlotsReady;
}
