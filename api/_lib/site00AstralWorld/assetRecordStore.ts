/**
 * P0.E.FT4 — In-memory Astral World asset record store (server-side).
 * Persists to Supabase storage manifest when available; tests use reset().
 */

import type { AstralAssetRecord, AstralBatchStatus } from '../../../shared/site00-astral-world/generation/types.js';
import { AW_VISUAL_FOUNDATION_BATCH } from '../../../shared/site00-astral-world/generation/types.js';
import { getManifestContracts } from '../../../shared/site00-astral-world/generation/generationManifest.js';

const records = new Map<string, AstralAssetRecord>();
const activeJobs = new Set<string>();

export function resetAstralAssetStore(): void {
  records.clear();
  activeJobs.clear();
}

export function getAstralAssetStoreSnapshot(): Record<string, AstralAssetRecord> {
  return Object.fromEntries(records.entries());
}

export function getAstralAssetRecord(slotKey: string): AstralAssetRecord | null {
  return records.get(slotKey) ?? null;
}

export function upsertAstralAssetRecord(record: AstralAssetRecord): void {
  records.set(record.targetSlot, record);
}

export function hasActiveJobForSlot(slotKey: string): boolean {
  return activeJobs.has(slotKey);
}

export function markJobActive(slotKey: string): void {
  activeJobs.add(slotKey);
}

export function markJobInactive(slotKey: string): void {
  activeJobs.delete(slotKey);
}

export function initializeMissingContracts(): void {
  const now = new Date().toISOString();
  for (const contract of getManifestContracts()) {
    if (records.has(contract.targetSlot)) continue;
    records.set(contract.targetSlot, {
      assetContractId: contract.assetContractId,
      targetSlot: contract.targetSlot,
      status: 'CONTRACT_READY',
      version: 0,
      approvalState: 'GENERATED',
      canonState: 'FOUNDER_FAST_TRACK',
      outputUrl: null,
      storagePath: null,
      provider: null,
      model: null,
      requestId: null,
      generationReceipt: null,
      referenceCropKey: null,
      error: null,
      createdAt: now,
      updatedAt: now,
      supersededByVersion: null,
    });
  }
}

export function computeBatchStatus(): AstralBatchStatus {
  const all = [...records.values()];
  return {
    batchId: AW_VISUAL_FOUNDATION_BATCH,
    total: all.length,
    missing: all.filter((r) => r.status === 'MISSING' || r.status === 'CONTRACT_READY').length,
    queued: all.filter((r) => r.status === 'QUEUED').length,
    processing: all.filter((r) => r.status === 'PROCESSING').length,
    ready: all.filter((r) => r.status === 'READY').length,
    active: all.filter((r) => r.status === 'ACTIVE').length,
    failed: all.filter((r) => r.status === 'FAILED').length,
  };
}

export function supersedeRecord(slotKey: string, newVersion: number): void {
  const prev = records.get(slotKey);
  if (!prev) return;
  records.set(slotKey, {
    ...prev,
    status: 'SUPERSEDED',
    supersededByVersion: newVersion,
    updatedAt: new Date().toISOString(),
  });
}
