/**
 * P0.E.FT4/FT5.1 — Astral World asset record store with Supabase persistence.
 */

import type { AstralAssetRecord, AstralBatchStatus } from '../../../shared/site00-astral-world/generation/types.js';
import { AW_VISUAL_FOUNDATION_BATCH } from '../../../shared/site00-astral-world/generation/types.js';
import { getManifestContracts } from '../../../shared/site00-astral-world/generation/generationManifest.js';
import { P0_SLOT_KEYS, P1_SLOT_KEYS, P2_SLOT_KEYS } from '../../../shared/site00-astral-world/generation/assetSlotRegistry.js';
import { hydrateAstralAssetStore, saveAstralAssetManifest } from './assetManifestPersistence.js';

const records = new Map<string, AstralAssetRecord>();
const activeJobs = new Set<string>();
let hydrated = false;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

export function resetAstralAssetStore(): void {
  records.clear();
  activeJobs.clear();
  hydrated = false;
}

export function getAstralAssetStoreSnapshot(): Record<string, AstralAssetRecord> {
  return Object.fromEntries(records.entries());
}

export function getAstralAssetRecord(slotKey: string): AstralAssetRecord | null {
  return records.get(slotKey) ?? null;
}

function schedulePersist(): void {
  if (process.env.VITEST === 'true') return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    void saveAstralAssetManifest(getAstralAssetStoreSnapshot()).catch(() => {
      /* non-fatal — in-memory store remains source during request */
    });
  }, 250);
}

export function upsertAstralAssetRecord(record: AstralAssetRecord): void {
  records.set(record.targetSlot, record);
  schedulePersist();
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

export function countActiveJobs(): number {
  return activeJobs.size;
}

export async function ensureAstralAssetStoreHydrated(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  if (process.env.VITEST === 'true') return;
  await hydrateAstralAssetStore(records);
}

export function initializeMissingContracts(): void {
  void ensureAstralAssetStoreHydrated();
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
  schedulePersist();
}

export function countByPriorityStatus(): {
  p0: Record<string, number>;
  p1: Record<string, number>;
  p2: Record<string, number>;
} {
  const tally = (slots: string[]) => {
    const out: Record<string, number> = {
      active: 0,
      ready: 0,
      processing: 0,
      queued: 0,
      failed: 0,
      missing: 0,
    };
    for (const slot of slots) {
      const r = records.get(slot);
      if (!r || r.status === 'CONTRACT_READY' || r.status === 'MISSING') out.missing += 1;
      else if (r.status === 'ACTIVE') out.active += 1;
      else if (r.status === 'READY') out.ready += 1;
      else if (r.status === 'PROCESSING') out.processing += 1;
      else if (r.status === 'QUEUED') out.queued += 1;
      else if (r.status === 'FAILED') out.failed += 1;
    }
    return out;
  };
  return {
    p0: tally(P0_SLOT_KEYS),
    p1: tally(P1_SLOT_KEYS),
    p2: tally(P2_SLOT_KEYS),
  };
}
