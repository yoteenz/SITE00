/**
 * B5.6R1 — Unified campaign package store (Supabase canonical, memory for tests).
 */

import type {
  CampaignPackageAuditEvent,
  CampaignPackageMigrationReceipt,
  CampaignPackageSnapshot,
} from '../../../shared/site00-campaign-package/types.js';
import * as mem from './memoryStore.js';
import {
  appendAuditEventToSupabase,
  campaignPackageSchemaExists,
  getCampaignPackageSnapshotFromSupabase,
  upsertCampaignPackageSnapshotToSupabase,
} from './supabaseStore.js';
import { resolveCampaignPackageStoreMode, type CampaignPackageStoreMode } from './storeAdapter.js';

export type { CampaignPackageStoreMode };

export async function getStoreMode(): Promise<CampaignPackageStoreMode> {
  return resolveCampaignPackageStoreMode();
}

export async function getCampaignPackageSnapshot(packageKey: string): Promise<CampaignPackageSnapshot | null> {
  const mode = await resolveCampaignPackageStoreMode();
  if (mode === 'SUPABASE') {
    return getCampaignPackageSnapshotFromSupabase(packageKey);
  }
  return mem.getCampaignPackageSnapshot(packageKey);
}

export async function upsertCampaignPackageSnapshot(
  snapshot: CampaignPackageSnapshot,
): Promise<CampaignPackageSnapshot> {
  const mode = await resolveCampaignPackageStoreMode();
  if (mode === 'SUPABASE') {
    return upsertCampaignPackageSnapshotToSupabase(snapshot);
  }
  return mem.upsertCampaignPackageSnapshot(snapshot);
}

export async function appendAuditEvent(event: CampaignPackageAuditEvent): Promise<void> {
  const mode = await resolveCampaignPackageStoreMode();
  if (mode === 'SUPABASE') {
    await appendAuditEventToSupabase(event);
    return;
  }
  mem.appendAuditEvent(event);
}

export async function appendMigrationReceipt(receipt: CampaignPackageMigrationReceipt): Promise<void> {
  mem.appendMigrationReceipt(receipt);
}

export function resetCampaignPackageStore(): void {
  mem.resetCampaignPackageMemoryStore();
}

export async function isProductionStoreAvailable(): Promise<boolean> {
  if (process.env.VITEST === 'true') return false;
  return campaignPackageSchemaExists();
}
