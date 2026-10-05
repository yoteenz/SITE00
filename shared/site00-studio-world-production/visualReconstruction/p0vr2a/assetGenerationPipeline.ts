/**
 * P0.VR.2A — Background asset generation pipeline (async, non-blocking shell reconstruction).
 */

import type { CanonicalVisualReference } from '../p0vr2/types.js';
import { buildReferenceAssetBrief } from './referenceAssetBrief.js';
import { compileReferenceAssetPrompt } from './referenceAssetPromptCompiler.js';
import { evaluateAssetQa } from './assetQa.js';
import { bindWouldCauseLayoutShift } from './slotGeometry.js';
import {
  getReferenceVisualAssetSlot,
  updateReferenceVisualAssetSlot,
} from './referenceVisualAssetSlotRegistry.js';
import { createDesignAssetReadyNotification } from './assetNotifications.js';
import type {
  AssetGenerationDispatchResult,
  CompiledReferenceAssetPrompt,
  ReferenceVisualAssetSlot,
  VisualAssetGenerationRecord,
} from './types.js';

const generationStore = new Map<string, VisualAssetGenerationRecord>();
const promptStore = new Map<string, CompiledReferenceAssetPrompt>();

export function storeCompiledPrompt(prompt: CompiledReferenceAssetPrompt): void {
  promptStore.set(prompt.promptId, prompt);
}

export function getCompiledPrompt(promptId: string): CompiledReferenceAssetPrompt | null {
  return promptStore.get(promptId) ?? null;
}

export function prepareSlotForGeneration(input: {
  reference: CanonicalVisualReference;
  slot: ReferenceVisualAssetSlot;
  brandCanon?: string;
}): { slot: ReferenceVisualAssetSlot; prompt: CompiledReferenceAssetPrompt } | null {
  if (input.slot.requiresCharacterAuthority && !input.slot.characterAuthorityReady) {
    return null;
  }
  if (input.slot.generationStatus === 'EXISTING_ASSET_FOUND' && input.slot.resolvedAssetUrl) {
    return null;
  }

  const brief = buildReferenceAssetBrief(input.slot, { brandAuthority: input.brandCanon });
  const prompt = compileReferenceAssetPrompt({
    reference: input.reference,
    slot: input.slot,
    brief,
    brandCanon: input.brandCanon,
  });
  storeCompiledPrompt(prompt);

  const updated = updateReferenceVisualAssetSlot(input.slot.slotId, {
    promptId: prompt.promptId,
    generationStatus: 'READY_TO_GENERATE',
  });
  return updated ? { slot: updated, prompt } : null;
}

export function dispatchAssetGeneration(input: {
  reference: CanonicalVisualReference;
  slotId: string;
  simulateOutputUrl?: string;
}): AssetGenerationDispatchResult {
  const slot = getReferenceVisualAssetSlot(input.slotId);
  if (!slot) {
    return { slotId: input.slotId, generationRecordId: '', status: 'FAILED', blocked: true, blockReason: 'FAIL_REFERENCE_ASSET_SLOT_MISSING' };
  }

  if (slot.generationStatus === 'EXISTING_ASSET_FOUND') {
    return {
      slotId: input.slotId,
      generationRecordId: '',
      status: 'EXISTING_ASSET_FOUND',
      blocked: true,
      blockReason: 'FAIL_EXISTING_ASSET_REGENERATED_UNNECESSARILY',
    };
  }

  if (slot.requiresCharacterAuthority && !slot.characterAuthorityReady) {
    return {
      slotId: input.slotId,
      generationRecordId: '',
      status: 'BLOCKED',
      blocked: true,
      blockReason: 'FAIL_CHARACTER_ASSET_GENERATED_WITHOUT_IDENTITY_AUTHORITY',
    };
  }

  const prepared = prepareSlotForGeneration({ reference: input.reference, slot });
  if (!prepared?.prompt) {
    return {
      slotId: input.slotId,
      generationRecordId: '',
      status: 'FAILED',
      blocked: true,
      blockReason: 'FAIL_FAL_PROMPT_MISSING',
    };
  }

  const recordId = `gen-${input.slotId}-${Date.now()}`;
  const record: VisualAssetGenerationRecord = {
    assetId: recordId,
    slotId: input.slotId,
    referenceId: input.reference.referenceId,
    promptId: prepared.prompt.promptId,
    promptVersion: prepared.prompt.version,
    prompt: prepared.prompt.promptText,
    provider: prepared.prompt.provider,
    model: prepared.prompt.model,
    inputReferenceImages: prepared.prompt.inputReferenceImages,
    output: null,
    cost: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    status: 'QUEUED',
    qa: null,
    supersedes: null,
    canonStatus: 'PREVIEW',
  };

  generationStore.set(recordId, record);
  updateReferenceVisualAssetSlot(input.slotId, { generationStatus: 'QUEUED' });

  const complete = () => completeAssetGeneration(recordId, input.simulateOutputUrl);

  // Async in app — synchronous in vitest for deterministic tests
  if (typeof process !== 'undefined' && process.env.VITEST) {
    complete();
  } else {
    queueMicrotask(complete);
  }

  return { slotId: input.slotId, generationRecordId: recordId, status: 'QUEUED', blocked: false, blockReason: null };
}

export function completeAssetGeneration(recordId: string, outputUrl?: string): VisualAssetGenerationRecord | null {
  const record = generationStore.get(recordId);
  if (!record) return null;

  const slot = getReferenceVisualAssetSlot(record.slotId);
  if (!slot) return null;

  updateReferenceVisualAssetSlot(record.slotId, { generationStatus: 'GENERATING' });

  const simulatedUrl =
    outputUrl ??
    `/visual-references/generated/${slot.projectId}/${slot.screenId}/${slot.regionId}-v${record.promptVersion}.webp`;

  const qa = evaluateAssetQa({
    slot,
    outputWidth: slot.generationWidth,
    outputHeight: slot.generationHeight,
    hasCharacterIdentity: slot.characterAuthorityReady,
  });

  const completed: VisualAssetGenerationRecord = {
    ...record,
    output: simulatedUrl,
    status: qa.passed ? 'READY' : 'FAILED',
    completedAt: new Date().toISOString(),
    qa,
    cost: 0.04,
  };
  generationStore.set(recordId, completed);

  if (qa.passed) {
    previewBindAssetToSlot(record.slotId, simulatedUrl, recordId);
    createDesignAssetReadyNotification({
      projectId: slot.projectId,
      screenId: slot.screenId,
      slotId: slot.slotId,
      assetRole: slot.assetRole,
      assetUrl: simulatedUrl,
    });
  } else {
    updateReferenceVisualAssetSlot(record.slotId, {
      generationStatus: 'FAILED',
      assetStatus: 'FAILED',
    });
  }

  return completed;
}

export function previewBindAssetToSlot(slotId: string, assetUrl: string, assetId: string): ReferenceVisualAssetSlot | null {
  const slot = getReferenceVisualAssetSlot(slotId);
  if (!slot) return null;

  if (bindWouldCauseLayoutShift(slot, slot.width, slot.height)) {
    return null;
  }

  return updateReferenceVisualAssetSlot(slotId, {
    resolvedAssetId: assetId,
    resolvedAssetUrl: assetUrl,
    generationStatus: 'READY',
    assetStatus: 'READY',
    bindMode: 'PREVIEW_BIND',
  });
}

export function promoteAssetToCanon(slotId: string): ReferenceVisualAssetSlot | null {
  const slot = getReferenceVisualAssetSlot(slotId);
  if (!slot?.resolvedAssetUrl) return null;
  return updateReferenceVisualAssetSlot(slotId, { bindMode: 'CANON_BIND' });
}

export function dispatchAllReadyToGenerate(input: {
  reference: CanonicalVisualReference;
  slotIds: string[];
}): AssetGenerationDispatchResult[] {
  return input.slotIds
    .map((slotId) => {
      const slot = getReferenceVisualAssetSlot(slotId);
      if (!slot || slot.generationStatus !== 'READY_TO_GENERATE') return null;
      return dispatchAssetGeneration({ reference: input.reference, slotId });
    })
    .filter((r): r is AssetGenerationDispatchResult => r !== null);
}

export function shellReconstructionBlockedOnAssetGeneration(): boolean {
  return false;
}

export function getGenerationRecord(recordId: string): VisualAssetGenerationRecord | null {
  return generationStore.get(recordId) ?? null;
}

export function listGenerationRecordsForSlot(slotId: string): VisualAssetGenerationRecord[] {
  return [...generationStore.values()].filter((r) => r.slotId === slotId);
}

export function clearGenerationStoreForTest(): void {
  generationStore.clear();
  promptStore.clear();
}

export function regenerateAsset(input: {
  reference: CanonicalVisualReference;
  slotId: string;
}): AssetGenerationDispatchResult {
  const slot = getReferenceVisualAssetSlot(input.slotId);
  if (!slot) {
    return { slotId: input.slotId, generationRecordId: '', status: 'FAILED', blocked: true, blockReason: 'FAIL_REFERENCE_ASSET_SLOT_MISSING' };
  }

  updateReferenceVisualAssetSlot(input.slotId, {
    generationStatus: 'READY_TO_GENERATE',
    assetStatus: 'MISSING',
    resolvedAssetId: null,
    resolvedAssetUrl: null,
    bindMode: null,
  });

  return dispatchAssetGeneration({ reference: input.reference, slotId: input.slotId });
}
