/**
 * P0.VR.DESIGN-ASSET-MANAGEMENT1 — active page asset manifest, versioning, regenerate/replace (fixture Grok).
 */

import {
  approveGrokStagedAsset,
  createFixtureGrokStagedAsset,
  listApprovedGrokAssets,
  listStagedGrokAssets,
  type GrokStagedAsset,
} from './designGrokAssetModel.js';

export type PageAssetOrigin =
  | 'GROK'
  | 'FOUNDER_UPLOAD'
  | 'PROJECT'
  | 'LEGACY'
  | 'OTHER_APPROVED_SOURCE';

export type PageAssetLifecycleStatus =
  | 'STAGED'
  | 'APPROVED'
  | 'IMPLEMENTED'
  | 'REPLACED'
  | 'ARCHIVED';

export type PageAssetVersionRecord = {
  versionId: string;
  assetId: string;
  versionNumber: number;
  slot: string;
  displayName: string;
  origin: PageAssetOrigin;
  status: PageAssetLifecycleStatus;
  format: string;
  width: number;
  height: number;
  previewDataUrl: string;
  projectId: string;
  pageId: string;
  runId: string | null;
  lineageFromAssetId: string | null;
  createdAt: string;
  isActiveForSlot: boolean;
};

export type PageAssetHistoryEventType =
  | 'asset_regeneration_requested'
  | 'asset_regenerated'
  | 'asset_replacement_uploaded'
  | 'asset_replacement_approved'
  | 'asset_version_activated'
  | 'asset_version_replaced';

export type PageAssetHistoryEvent = {
  id: string;
  type: PageAssetHistoryEventType;
  projectId: string;
  pageId: string;
  slot: string;
  assetId: string;
  versionId: string;
  timestamp: string;
  detail: string;
};

export type PageAssetUploadValidation = {
  ok: boolean;
  warnings: string[];
  errors: string[];
  format: string | null;
  width: number | null;
  height: number | null;
  byteSize: number | null;
};

export type PageAssetRegenerateConfirmModel = {
  asset: PageAssetVersionRecord;
  slot: string;
  currentVersionLabel: string;
  action: 'REGENERATE SIMILAR ASSET';
  model: 'GROK';
  estimatedCostUsd: number;
  defaultInstruction: string;
  eligibilityBlocked: boolean;
  blockReason: string | null;
};

const MANIFEST_KEY = 'site00:design-page-active-asset-manifest:v1';
const HISTORY_KEY = 'site00:design-page-asset-history:v1';
const PENDING_REGEN_KEY = 'site00:design-page-asset-pending-regen:v1';

const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function storage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof globalThis.localStorage !== 'undefined') return globalThis.localStorage;
  return null;
}

function readJson<T>(key: string, fallback: T): T {
  const s = storage();
  if (!s) return fallback;
  try {
    const raw = s.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

function grokToOrigin(origin: GrokStagedAsset['origin']): PageAssetOrigin {
  return origin === 'GROK' ? 'GROK' : 'OTHER_APPROVED_SOURCE';
}

function grokToStatus(status: GrokStagedAsset['status'], active: boolean): PageAssetLifecycleStatus {
  if (status === 'REJECTED') return 'ARCHIVED';
  if (status === 'STAGED') return 'STAGED';
  return active ? 'APPROVED' : 'REPLACED';
}

function versionFromGrok(asset: GrokStagedAsset, versionNumber: number, active: boolean): PageAssetVersionRecord {
  return {
    versionId: `ver-${asset.assetId}`,
    assetId: asset.assetId,
    versionNumber,
    slot: asset.slot,
    displayName: asset.slot.replace(/_/g, ' ').toUpperCase(),
    origin: grokToOrigin(asset.origin),
    status: grokToStatus(asset.status, active),
    format: asset.format,
    width: asset.width,
    height: asset.height,
    previewDataUrl: asset.previewDataUrl,
    projectId: asset.projectId,
    pageId: asset.pageId,
    runId: asset.runId,
    lineageFromAssetId: null,
    createdAt: asset.createdAt,
    isActiveForSlot: active,
  };
}

function appendHistory(event: Omit<PageAssetHistoryEvent, 'id' | 'timestamp'> & { timestamp?: string }): void {
  const all = readJson<PageAssetHistoryEvent[]>(HISTORY_KEY, []);
  const row: PageAssetHistoryEvent = {
    ...event,
    id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: event.timestamp ?? new Date().toISOString(),
  };
  writeJson(HISTORY_KEY, [row, ...all].slice(0, 200));
}

export function listPageAssetHistory(projectId: string, pageId: string, slot?: string): PageAssetHistoryEvent[] {
  const all = readJson<PageAssetHistoryEvent[]>(HISTORY_KEY, []);
  return all.filter((e) => e.projectId === projectId && e.pageId === pageId && (!slot || e.slot === slot));
}

export function listPageAssetVersionHistory(
  projectId: string,
  pageId: string,
  slot: string,
): PageAssetVersionRecord[] {
  const manifest = readJson<PageAssetVersionRecord[]>(MANIFEST_KEY, []);
  return manifest
    .filter((v) => v.projectId === projectId && v.pageId === pageId && v.slot === slot)
    .sort((a, b) => b.versionNumber - a.versionNumber);
}

/** Sync Grok storage into manifest rows (page-scoped). */
export function syncActivePageAssetManifest(projectId: string, pageId: string): PageAssetVersionRecord[] {
  const approved = listApprovedGrokAssets(projectId, pageId);
  const staged = listStagedGrokAssets(projectId, pageId);
  const existing = readJson<PageAssetVersionRecord[]>(MANIFEST_KEY, []);
  const pageRows = existing.filter((v) => v.projectId === projectId && v.pageId === pageId);
  const other = existing.filter((v) => v.projectId !== projectId || v.pageId !== pageId);

  const bySlotActive = new Map<string, PageAssetVersionRecord>();
  for (const row of pageRows) {
    if (row.isActiveForSlot) bySlotActive.set(row.slot, row);
  }

  const nextPageRows: PageAssetVersionRecord[] = [...pageRows];
  const upsert = (asset: GrokStagedAsset, active: boolean) => {
    const idx = nextPageRows.findIndex((v) => v.assetId === asset.assetId);
    const versionNumber =
      idx >= 0 ? nextPageRows[idx]!.versionNumber
      : (nextPageRows.filter((v) => v.slot === asset.slot).reduce((m, v) => Math.max(m, v.versionNumber), 0) || 0) + 1;
    const row = versionFromGrok(asset, versionNumber, active);
    if (idx >= 0) nextPageRows[idx] = row;
    else nextPageRows.push(row);
    if (active) {
      for (let i = 0; i < nextPageRows.length; i++) {
        const v = nextPageRows[i]!;
        if (v.slot === asset.slot && v.assetId !== asset.assetId && v.isActiveForSlot) {
          nextPageRows[i] = { ...v, isActiveForSlot: false, status: 'REPLACED' };
        }
      }
      bySlotActive.set(asset.slot, row);
    }
  };

  for (const a of approved) upsert(a, true);
  for (const a of staged) upsert(a, !bySlotActive.has(a.slot));

  writeJson(MANIFEST_KEY, [...other, ...nextPageRows]);
  return pickActivePageAssetsFromManifest([...other, ...nextPageRows], projectId, pageId);
}

function pickActivePageAssetsFromManifest(
  manifest: PageAssetVersionRecord[],
  projectId: string,
  pageId: string,
): PageAssetVersionRecord[] {
  const active = manifest.filter(
    (v) => v.projectId === projectId && v.pageId === pageId && v.isActiveForSlot && v.status !== 'ARCHIVED',
  );
  const seen = new Set<string>();
  const deduped: PageAssetVersionRecord[] = [];
  for (const row of active) {
    if (seen.has(row.slot)) continue;
    seen.add(row.slot);
    deduped.push(row);
  }
  return deduped.sort((a, b) => a.slot.localeCompare(b.slot));
}

export function listActivePageAssets(projectId: string, pageId: string): PageAssetVersionRecord[] {
  return syncActivePageAssetManifest(projectId, pageId);
}

export function getPageAssetById(
  projectId: string,
  pageId: string,
  assetId: string,
): PageAssetVersionRecord | null {
  const manifest = readJson<PageAssetVersionRecord[]>(MANIFEST_KEY, []);
  const hit = manifest.find((v) => v.projectId === projectId && v.pageId === pageId && v.assetId === assetId);
  if (hit) return hit;
  syncActivePageAssetManifest(projectId, pageId);
  const refreshed = readJson<PageAssetVersionRecord[]>(MANIFEST_KEY, []);
  return refreshed.find((v) => v.projectId === projectId && v.pageId === pageId && v.assetId === assetId) ?? null;
}

export type PendingRegeneration = {
  pendingId: string;
  projectId: string;
  pageId: string;
  slot: string;
  sourceAssetId: string;
  stagedAssetId: string;
  instruction: string;
  createdAt: string;
};

export function getPendingRegeneration(projectId: string, pageId: string, slot: string): PendingRegeneration | null {
  const all = readJson<PendingRegeneration[]>(PENDING_REGEN_KEY, []);
  return all.find((p) => p.projectId === projectId && p.pageId === pageId && p.slot === slot) ?? null;
}

export function clearPendingRegeneration(projectId: string, pageId: string, slot: string): void {
  const all = readJson<PendingRegeneration[]>(PENDING_REGEN_KEY, []);
  writeJson(
    PENDING_REGEN_KEY,
    all.filter((p) => !(p.projectId === projectId && p.pageId === pageId && p.slot === slot)),
  );
}

/** Fixture Grok regeneration — same slot, staged until founder approves. */
export function requestFixtureAssetRegeneration(input: {
  projectId: string;
  pageId: string;
  sourceAssetId: string;
  instruction?: string;
  runId?: string;
}): { staged: GrokStagedAsset; pending: PendingRegeneration } | null {
  const source = getPageAssetById(input.projectId, input.pageId, input.sourceAssetId);
  if (!source) return null;
  const runId = input.runId ?? `regen-fixture-${Date.now()}`;
  const instruction = (input.instruction?.trim() || 'SAME_ASSET_BETTER').slice(0, 2000);

  appendHistory({
    type: 'asset_regeneration_requested',
    projectId: input.projectId,
    pageId: input.pageId,
    slot: source.slot,
    assetId: source.assetId,
    versionId: source.versionId,
    detail: instruction,
  });

  const lineageAsset = createFixtureGrokStagedAsset({
    projectId: input.projectId,
    pageId: input.pageId,
    slot: source.slot,
    runId,
  });

  const manifest = readJson<PageAssetVersionRecord[]>(MANIFEST_KEY, []);
  const versionNumber =
    manifest.filter((v) => v.projectId === input.projectId && v.pageId === input.pageId && v.slot === source.slot)
      .reduce((m, v) => Math.max(m, v.versionNumber), 0) + 1;
  const stagedVersion: PageAssetVersionRecord = {
    versionId: `ver-${lineageAsset.assetId}`,
    assetId: lineageAsset.assetId,
    versionNumber,
    slot: source.slot,
    displayName: source.displayName,
    origin: 'GROK',
    status: 'STAGED',
    format: lineageAsset.format,
    width: lineageAsset.width,
    height: lineageAsset.height,
    previewDataUrl: lineageAsset.previewDataUrl,
    projectId: input.projectId,
    pageId: input.pageId,
    runId: lineageAsset.runId,
    lineageFromAssetId: source.assetId,
    createdAt: lineageAsset.createdAt,
    isActiveForSlot: false,
  };
  writeJson(MANIFEST_KEY, [...manifest, stagedVersion]);

  appendHistory({
    type: 'asset_regenerated',
    projectId: input.projectId,
    pageId: input.pageId,
    slot: source.slot,
    assetId: lineageAsset.assetId,
    versionId: stagedVersion.versionId,
    detail: `Fixture regeneration for ${source.slot}`,
  });

  const pending: PendingRegeneration = {
    pendingId: `pend-${Date.now()}`,
    projectId: input.projectId,
    pageId: input.pageId,
    slot: source.slot,
    sourceAssetId: source.assetId,
    stagedAssetId: lineageAsset.assetId,
    instruction,
    createdAt: new Date().toISOString(),
  };
  const pendAll = readJson<PendingRegeneration[]>(PENDING_REGEN_KEY, []);
  writeJson(PENDING_REGEN_KEY, [pending, ...pendAll.filter((p) => p.slot !== source.slot || p.pageId !== input.pageId)]);

  return { staged: lineageAsset, pending };
}

export function approveRegeneratedAsset(projectId: string, pageId: string, stagedAssetId: string): PageAssetVersionRecord | null {
  const approvedGrok = approveGrokStagedAsset(stagedAssetId);
  if (!approvedGrok) return null;

  const manifest = readJson<PageAssetVersionRecord[]>(MANIFEST_KEY, []);
  const target = manifest.find(
    (v) => v.projectId === projectId && v.pageId === pageId && v.assetId === stagedAssetId,
  );
  if (!target) return null;
  const activated: PageAssetVersionRecord = { ...target, status: 'APPROVED', isActiveForSlot: true };
  const next = manifest.map((v) => {
    if (v.projectId !== projectId || v.pageId !== pageId) return v;
    if (v.assetId === stagedAssetId) return activated;
    if (v.slot === activated.slot && v.isActiveForSlot) {
      return { ...v, isActiveForSlot: false, status: 'REPLACED' as const };
    }
    return v;
  });
  writeJson(MANIFEST_KEY, next);

  appendHistory({
    type: 'asset_replacement_approved',
    projectId,
    pageId,
    slot: activated.slot,
    assetId: activated.assetId,
    versionId: activated.versionId,
    detail: 'Regenerated asset approved',
  });
  appendHistory({
    type: 'asset_version_activated',
    projectId,
    pageId,
    slot: activated.slot,
    assetId: activated.assetId,
    versionId: activated.versionId,
    detail: 'Active manifest pointer updated',
  });

  clearPendingRegeneration(projectId, pageId, activated.slot);
  syncActivePageAssetManifest(projectId, pageId);
  return activated;
}

export function validatePageAssetUpload(input: {
  mimeType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  slotFormat: string;
  slotWidth: number;
  slotHeight: number;
}): PageAssetUploadValidation {
  const warnings: string[] = [];
  const errors: string[] = [];
  if (!ALLOWED_MIME.has(input.mimeType)) {
    errors.push('FILE TYPE NOT ALLOWED FOR THIS SLOT');
  }
  if (input.byteSize > MAX_UPLOAD_BYTES) {
    errors.push('FILE EXCEEDS MAX SIZE (8MB)');
  }
  const format = input.mimeType.split('/')[1]?.toUpperCase() ?? null;
  if (format && input.slotFormat && format !== input.slotFormat && !(format === 'SVG+XML' && input.slotFormat === 'SVG')) {
    warnings.push(`FORMAT ${format} DIFFERS FROM SLOT DEFAULT ${input.slotFormat}`);
  }
  if (input.width && input.height && input.slotWidth && input.slotHeight) {
    const slotRatio = input.slotWidth / input.slotHeight;
    const fileRatio = input.width / input.height;
    if (Math.abs(slotRatio - fileRatio) > 0.15) {
      warnings.push('ASPECT RATIO DIFFERS FROM SLOT — REVIEW BEFORE CONFIRM');
    }
  }
  return {
    ok: errors.length === 0,
    warnings,
    errors,
    format,
    width: input.width,
    height: input.height,
    byteSize: input.byteSize,
  };
}

export function stageFounderUploadReplacement(input: {
  projectId: string;
  pageId: string;
  sourceAssetId: string;
  previewDataUrl: string;
  format: string;
  width: number;
  height: number;
  byteSize: number;
}): PageAssetVersionRecord | null {
  const source = getPageAssetById(input.projectId, input.pageId, input.sourceAssetId);
  if (!source) return null;

  appendHistory({
    type: 'asset_replacement_uploaded',
    projectId: input.projectId,
    pageId: input.pageId,
    slot: source.slot,
    assetId: source.assetId,
    versionId: source.versionId,
    detail: `Upload ${input.format} ${input.width}x${input.height}`,
  });

  const assetId = `founder-upload-${Date.now()}`;
  const manifest = readJson<PageAssetVersionRecord[]>(MANIFEST_KEY, []);
  const versionNumber =
    manifest.filter((v) => v.projectId === input.projectId && v.pageId === input.pageId && v.slot === source.slot)
      .reduce((m, v) => Math.max(m, v.versionNumber), 0) + 1;

  const staged: PageAssetVersionRecord = {
    versionId: `ver-${assetId}`,
    assetId,
    versionNumber,
    slot: source.slot,
    displayName: source.displayName,
    origin: 'FOUNDER_UPLOAD',
    status: 'STAGED',
    format: input.format,
    width: input.width,
    height: input.height,
    previewDataUrl: input.previewDataUrl,
    projectId: input.projectId,
    pageId: input.pageId,
    runId: null,
    lineageFromAssetId: source.assetId,
    createdAt: new Date().toISOString(),
    isActiveForSlot: false,
  };
  writeJson(MANIFEST_KEY, [...manifest, staged]);
  return staged;
}

export function approveFounderUploadReplacement(
  projectId: string,
  pageId: string,
  stagedAssetId: string,
): PageAssetVersionRecord | null {
  const manifest = readJson<PageAssetVersionRecord[]>(MANIFEST_KEY, []);
  const target = manifest.find(
    (v) => v.projectId === projectId && v.pageId === pageId && v.assetId === stagedAssetId,
  );
  if (!target) return null;
  const activated: PageAssetVersionRecord = { ...target, status: 'APPROVED', isActiveForSlot: true };
  const next = manifest.map((v) => {
    if (v.projectId !== projectId || v.pageId !== pageId) return v;
    if (v.assetId === stagedAssetId) return activated;
    if (v.slot === activated.slot && v.isActiveForSlot) {
      return { ...v, isActiveForSlot: false, status: 'REPLACED' as const };
    }
    return v;
  });
  writeJson(MANIFEST_KEY, next);

  appendHistory({
    type: 'asset_replacement_approved',
    projectId,
    pageId,
    slot: activated.slot,
    assetId: activated.assetId,
    versionId: activated.versionId,
    detail: 'Founder upload approved',
  });
  appendHistory({
    type: 'asset_version_replaced',
    projectId,
    pageId,
    slot: activated.slot,
    assetId: activated.assetId,
    versionId: activated.versionId,
    detail: 'Previous version archived in history',
  });
  appendHistory({
    type: 'asset_version_activated',
    projectId,
    pageId,
    slot: activated.slot,
    assetId: activated.assetId,
    versionId: activated.versionId,
    detail: 'Manifest pointer updated — READY FOR IMPLEMENTATION',
  });

  return activated;
}

export const PAGE_ASSET_REGENERATE_ESTIMATED_COST_USD = 0.42;

export function buildRegenerateConfirmModel(
  asset: PageAssetVersionRecord,
  eligibilityBlocked: boolean,
  blockReason: string | null,
): PageAssetRegenerateConfirmModel {
  return {
    asset,
    slot: asset.slot,
    currentVersionLabel: `v${asset.versionNumber}`,
    action: 'REGENERATE SIMILAR ASSET',
    model: 'GROK',
    estimatedCostUsd: PAGE_ASSET_REGENERATE_ESTIMATED_COST_USD,
    defaultInstruction: 'SAME_ASSET_BETTER',
    eligibilityBlocked,
    blockReason,
  };
}

export const PAGE_ASSET_POST_APPROVAL_CAPTURE_HINT =
  'CAPTURE SCREEN AGAIN — replacement is in manifest; confirm visual convergence on twin.';
