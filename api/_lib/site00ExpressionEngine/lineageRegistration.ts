/**
 * Expression Engine V0 — auto lineage registration (GenerationReceipt + CreativeAssetRecord link).
 */

import { randomUUID } from 'node:crypto';
import type {
  EntryFormat,
  GenerationReceipt,
  FounderJudgmentState,
  LineageTrackingState,
} from '../../../shared/site00-expression-engine/types.js';

const receiptStore = new Map<string, GenerationReceipt>();

export function resetLineageStore(): void {
  receiptStore.clear();
}

export function registerGeneration(params: {
  projectId: string;
  brandId: string;
  entryId: string;
  format: EntryFormat;
  territoryId?: string | null;
  worldId?: string | null;
  parentAssetId?: string | null;
  assetId?: string;
  provider: string;
  model: string;
  promptLineage?: string[];
  referenceLineage?: string[];
  trackingState?: LineageTrackingState;
}): GenerationReceipt {
  const receipt: GenerationReceipt = {
    receiptId: randomUUID(),
    projectId: params.projectId,
    brandId: params.brandId,
    entryId: params.entryId,
    format: params.format,
    territoryId: params.territoryId ?? null,
    worldId: params.worldId ?? null,
    parentAssetId: params.parentAssetId ?? null,
    assetId: params.assetId ?? randomUUID(),
    provider: params.provider,
    model: params.model,
    promptLineage: params.promptLineage ?? [],
    referenceLineage: params.referenceLineage ?? [],
    generatedAt: new Date().toISOString(),
    status: 'REGISTERED',
    judgmentState: 'UNREVIEWED',
    canonState: 'NON_CANON',
    trackingState: params.trackingState ?? 'TRACKED',
  };

  receiptStore.set(receipt.receiptId, receipt);
  return receipt;
}

export function getGenerationReceipt(receiptId: string): GenerationReceipt | null {
  return receiptStore.get(receiptId) ?? null;
}

export function listGenerationReceiptsForEntry(entryId: string): GenerationReceipt[] {
  return [...receiptStore.values()].filter((r) => r.entryId === entryId);
}

export function orphanAssetCannotReachProductionReady(receipt: GenerationReceipt | null): boolean {
  if (!receipt) return true;
  if (receipt.status === 'ORPHAN') return true;
  if (!receipt.assetId || !receipt.entryId) return true;
  return false;
}

export function markReceiptQA(receiptId: string, passed: boolean): GenerationReceipt | null {
  const receipt = receiptStore.get(receiptId);
  if (!receipt) return null;
  receipt.status = passed ? 'QA_PASS' : 'QA_FAIL';
  return receipt;
}

export function recordFounderJudgmentOnReceipt(
  receiptId: string,
  judgment: FounderJudgmentState,
): GenerationReceipt | null {
  const receipt = receiptStore.get(receiptId);
  if (!receipt) return null;
  receipt.judgmentState = judgment;
  if (judgment === 'NOT_FOR_ME') {
    receipt.canonState = 'NON_CANON';
  } else if (judgment === 'LOVE_IT') {
    receipt.canonState = 'PRODUCTION_CANDIDATE';
  }
  return receipt;
}

export function notForMeCannotBecomeCanon(receipt: GenerationReceipt): boolean {
  if (receipt.judgmentState !== 'NOT_FOR_ME') return false;
  return receipt.canonState === 'NON_CANON';
}

export function createLegacyUntrackedReceipt(params: {
  projectId: string;
  brandId: string;
  entryId: string;
  format: EntryFormat;
  assetId: string;
  notes: string;
}): GenerationReceipt {
  return registerGeneration({
    ...params,
    provider: 'LEGACY_MANUAL',
    model: 'LEGACY_UNTRACKED',
    promptLineage: [params.notes],
    referenceLineage: [],
    trackingState: 'LEGACY_UNTRACKED',
  });
}
