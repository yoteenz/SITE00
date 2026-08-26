/**
 * P0.PAF.1 — Product visual asset records + lineage + duplicate detection.
 */

import { PROMPT_VERSION_CANON } from './constants.js';
import { variantStoragePath, colorSlugFromId, buildConfigurationHash } from './storagePaths.js';
import type {
  BackgroundMode,
  DuplicateAssetCheck,
  ProductVariantKey,
  ProductVisualAssetRecord,
} from './types.js';

const assetStore = new Map<string, ProductVisualAssetRecord>();
const approvedByConfig = new Map<string, string>();

function configLookupKey(masterHeroId: string, configurationHash: string): string {
  return `${masterHeroId}:${configurationHash}:v${PROMPT_VERSION_CANON}`;
}

function hashFromRecord(record: ProductVisualAssetRecord): string {
  return buildConfigurationHash(record.variationValues as Record<string, string>);
}

export function checkDuplicateVariant(masterHeroId: string, configurationHash: string): DuplicateAssetCheck {
  const key = configLookupKey(masterHeroId, configurationHash);
  const existingAssetId = approvedByConfig.get(key) ?? null;
  return {
    exists: Boolean(existingAssetId),
    existingAssetId,
    variantKey: configurationHash,
    canUseExisting: Boolean(existingAssetId),
  };
}

export function createProductVisualAssetRecord(input: {
  projectId: string;
  productId: string;
  masterHeroId: string;
  variantKey: ProductVariantKey;
  batchId: string;
  provider: string;
  model: string;
  promptVersion: number;
  resolvedUrl: string;
  backgroundMode: BackgroundMode;
  hasAlpha: boolean;
  falTemporaryUrl?: string | null;
  parentAssetId?: string | null;
}): ProductVisualAssetRecord {
  const storagePath = variantStoragePath({
    productId: input.productId,
    masterHeroId: input.masterHeroId,
    mode: input.variantKey.mode,
    configurationHash: input.variantKey.configurationHash,
    colorSlug: input.variantKey.axes.COLOR ? colorSlugFromId(input.variantKey.axes.COLOR) : undefined,
    ext: input.hasAlpha ? 'png' : 'webp',
  });

  const assetId = `pva-${input.variantKey.configurationHash}-${Date.now()}`;
  const record: ProductVisualAssetRecord = {
    assetId,
    projectId: input.projectId,
    productId: input.productId,
    masterHeroId: input.masterHeroId,
    variantKey: input.variantKey.key,
    batchId: input.batchId,
    role: 'VARIANT',
    variationAxes: input.variantKey.axes,
    variationValues: input.variantKey.axes,
    provider: input.provider,
    model: input.model,
    promptVersion: input.promptVersion,
    storageBucket: 'live-preview',
    storagePath,
    resolvedUrl: input.resolvedUrl,
    width: 1024,
    height: 1280,
    aspectRatio: 0.8,
    backgroundMode: input.backgroundMode,
    hasAlpha: input.hasAlpha,
    status: 'GENERATED',
    qaStatus: 'PENDING',
    canonStatus: 'PREVIEW',
    createdAt: new Date().toISOString(),
    approvedAt: null,
    parentAssetId: input.parentAssetId ?? input.masterHeroId,
    supersedes: null,
    lineage: {
      masterHeroId: input.masterHeroId,
      batchId: input.batchId,
      generationRunId: assetId,
    },
  };

  assetStore.set(assetId, record);
  return record;
}

export function ingestVariantToSupabase(
  record: ProductVisualAssetRecord,
  falTemporaryUrl?: string | null,
): ProductVisualAssetRecord {
  // Canonical storage is Supabase path — never FAL temp URL
  const canonicalUrl = `https://storage.site00.test/${record.storagePath}`;
  const updated: ProductVisualAssetRecord = {
    ...record,
    resolvedUrl: canonicalUrl,
    lineage: { ...record.lineage, generationRunId: record.assetId },
  };
  assetStore.set(record.assetId, updated);
  if (falTemporaryUrl && !updated.resolvedUrl.includes('storage.site00.test')) {
    throw new Error('FAL temporary URL must not become canonical storage');
  }
  return updated;
}

export function approveVisualAsset(assetId: string): ProductVisualAssetRecord | null {
  const record = assetStore.get(assetId);
  if (!record || record.qaStatus === 'FAIL') return null;
  const approved: ProductVisualAssetRecord = {
    ...record,
    status: 'APPROVED',
    qaStatus: 'PASS',
    canonStatus: 'CANON',
    approvedAt: new Date().toISOString(),
  };
  assetStore.set(assetId, approved);
  approvedByConfig.set(configLookupKey(record.masterHeroId, hashFromRecord(record)), assetId);
  return approved;
}

export function approveAllPassing(batchId: string): ProductVisualAssetRecord[] {
  const approved: ProductVisualAssetRecord[] = [];
  for (const record of assetStore.values()) {
    if (record.batchId === batchId && record.qaStatus === 'PASS' && record.status !== 'APPROVED') {
      const a = approveVisualAsset(record.assetId);
      if (a) approved.push(a);
    }
  }
  return approved;
}

export function getVisualAsset(assetId: string): ProductVisualAssetRecord | null {
  return assetStore.get(assetId) ?? null;
}

export function lookupBuildAWigAsset(masterHeroId: string, configurationHash: string): ProductVisualAssetRecord | null {
  const dup = checkDuplicateVariant(masterHeroId, configurationHash);
  if (!dup.existingAssetId) return null;
  return assetStore.get(dup.existingAssetId) ?? null;
}

export function lookupPdpColorDerivative(productId: string, colorId: string): ProductVisualAssetRecord | null {
  for (const record of assetStore.values()) {
    if (
      record.productId === productId &&
      record.canonStatus === 'CANON' &&
      (record.variationValues.COLOR === colorId || record.variationValues.variantValue === colorId)
    ) {
      return record;
    }
  }
  return null;
}

export function bindPreviewAsset(assetId: string, _target: 'BUILD_A_WIG' | 'PDP'): boolean {
  const record = assetStore.get(assetId);
  if (!record) return false;
  record.canonStatus = 'PREVIEW';
  assetStore.set(assetId, record);
  return true;
}

export function bindCanonAsset(assetId: string, _target: 'BUILD_A_WIG' | 'PDP'): ProductVisualAssetRecord | null {
  return approveVisualAsset(assetId);
}

export function listAssetsForBatch(batchId: string): ProductVisualAssetRecord[] {
  return [...assetStore.values()].filter((a) => a.batchId === batchId);
}

export function clearAssetStoreForTest(): void {
  assetStore.clear();
  approvedByConfig.clear();
}

export function seedApprovedAssetForTest(record: ProductVisualAssetRecord): void {
  assetStore.set(record.assetId, record);
  approvedByConfig.set(configLookupKey(record.masterHeroId, hashFromRecord(record)), record.assetId);
}
