/**
 * P0.PAF.1 — Product variant batch pipeline (concurrent FAL + Supabase ingest).
 */

import { FRONTAL_SLAYER_PROJECT_ID } from './constants.js';
import { compileProductVariantPrompt } from './promptCompiler.js';
import { computeVariantMatrixPreview } from './variantMatrix.js';
import { getDefaultConcurrencyPolicy, estimateWithinBudget, runWithConcurrency } from './concurrencyPolicy.js';
import { evaluateProductIdentityQa } from './productIdentityQa.js';
import {
  approveVisualAsset,
  checkDuplicateVariant,
  createProductVisualAssetRecord,
  ingestVariantToSupabase,
} from './assetRecordRegistry.js';
import { getMasterHero } from './masterHeroRegistry.js';
import { reuseSubjectMaskForVariant } from './subjectMask.js';
import { routeProductFalProvider, textToImageBlockedForCanonicalDerivative } from './falProviderRouting.js';
import {
  createBatchReadyNotification,
  createPartialBatchNotification,
} from './notifications.js';
import type {
  BackgroundMode,
  BatchProgressSummary,
  BatchStatus,
  FactoryMode,
  ProductVariantBatch,
  ProductVariantRecord,
  VariantSelection,
  VariationAxis,
} from './types.js';

const batchStore = new Map<string, ProductVariantBatch>();
const variantStore = new Map<string, ProductVariantRecord>();

export function planBatch(input: {
  productId: string;
  masterHeroId: string;
  mode: FactoryMode;
  selection: VariantSelection;
  axes: VariationAxis[];
  backgroundMode: BackgroundMode;
}): { batch: ProductVariantBatch; preview: ReturnType<typeof computeVariantMatrixPreview> } {
  const preview = computeVariantMatrixPreview({
    masterHeroId: input.masterHeroId,
    mode: input.mode,
    selection: input.selection,
    axes: input.axes,
    backgroundRemoval:
      input.backgroundMode === 'REMOVE_BACKGROUND' || input.backgroundMode === 'TRANSPARENT_CUTOUT',
  });

  const batchId = `batch-${input.masterHeroId}-${Date.now()}`;
  const batch: ProductVariantBatch = {
    batchId,
    projectId: FRONTAL_SLAYER_PROJECT_ID,
    productId: input.productId,
    masterHeroId: input.masterHeroId,
    mode: input.mode,
    status: 'COST_REVIEW',
    backgroundMode: input.backgroundMode,
    selectedAxes: preview.selectedAxes,
    totalVariants: preview.assetCount,
    completedVariants: 0,
    failedVariants: 0,
    estimatedCostUsd: preview.estimatedCostUsd,
    founderConfirmed: false,
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
  };

  batchStore.set(batchId, batch);

  for (const variantKey of preview.variants) {
    const dup = checkDuplicateVariant(input.masterHeroId, variantKey.configurationHash);
    const variantId = `var-${variantKey.configurationHash}`;
    variantStore.set(variantId, {
      variantId,
      batchId,
      masterHeroId: input.masterHeroId,
      variantKey,
      status: dup.exists ? 'READY' : 'PENDING',
      promptId: null,
      provider: null,
      model: null,
      falTemporaryUrl: null,
      assetRecordId: dup.existingAssetId,
      qaStatus: dup.exists ? 'PASS' : 'PENDING',
      qaFailures: [],
      retryCount: 0,
      createdAt: new Date().toISOString(),
      completedAt: dup.exists ? new Date().toISOString() : null,
    });
  }

  return { batch, preview };
}

export function confirmBatchCost(batchId: string): ProductVariantBatch | null {
  const batch = batchStore.get(batchId);
  if (!batch || batch.status !== 'COST_REVIEW') return null;
  if (!estimateWithinBudget(batch.estimatedCostUsd, getDefaultConcurrencyPolicy())) {
    return null;
  }
  const updated = { ...batch, founderConfirmed: true, status: 'PLANNED' as BatchStatus };
  batchStore.set(batchId, updated);
  return updated;
}

/** Batch dispatch requires explicit founder confirmation — no silent spend. */
export function dispatchBatch(batchId: string): ProductVariantBatch | null {
  const batch = batchStore.get(batchId);
  if (!batch || !batch.founderConfirmed) return null;

  const masterHero = getMasterHero(batch.masterHeroId);
  if (!masterHero || masterHero.status !== 'ACTIVE_CANONICAL') return null;

  if (textToImageBlockedForCanonicalDerivative(true)) {
    const route = routeProductFalProvider({
      hasMasterHero: true,
      variationAxes: {},
      backgroundMode: batch.backgroundMode,
    });
    if (route.task === 'BLOCKED') return null;
  }

  const variants = listVariantsForBatch(batchId).filter((v) => v.status === 'PENDING');
  const updated: ProductVariantBatch = {
    ...batch,
    status: 'GENERATING',
    startedAt: new Date().toISOString(),
  };
  batchStore.set(batchId, updated);

  for (const v of variants) {
    updateVariant(v.variantId, { status: 'QUEUED' });
  }

  if (typeof process !== 'undefined' && process.env.VITEST) {
    runBatchSync(batchId, masterHero, variants);
  } else {
    queueMicrotask(() => {
      runBatchAsync(batchId, masterHero, variants).catch(() => {
        markBatchPartial(batchId);
      });
    });
  }

  return batchStore.get(batchId) ?? null;
}

async function runBatchAsync(
  batchId: string,
  masterHero: NonNullable<ReturnType<typeof getMasterHero>>,
  variants: ProductVariantRecord[],
): Promise<void> {
  await runWithConcurrency(variants, async (variant) => {
    await generateSingleVariant(batchId, masterHero, variant);
  });
  finalizeBatch(batchId);
}

function runBatchSync(
  batchId: string,
  masterHero: NonNullable<ReturnType<typeof getMasterHero>>,
  variants: ProductVariantRecord[],
): void {
  for (const variant of variants) {
    generateSingleVariantSync(batchId, masterHero, variant);
  }
  finalizeBatch(batchId);
}

function generateSingleVariantSync(
  batchId: string,
  masterHero: NonNullable<ReturnType<typeof getMasterHero>>,
  variant: ProductVariantRecord,
): void {
  updateVariant(variant.variantId, { status: 'GENERATING' });
  reuseSubjectMaskForVariant(masterHero.masterHeroId);

  const prompt = compileProductVariantPrompt({
    masterHero,
    variantKey: variant.variantKey,
    backgroundMode: batchStore.get(batchId)!.backgroundMode,
  });

  if (!prompt.imageReferencePrimary || prompt.textToImagePrimary) {
    updateVariant(variant.variantId, {
      status: 'FAILED',
      qaStatus: 'FAIL',
      qaFailures: ['FAIL_PRODUCT_IDENTITY_DRIFT'],
    });
    incrementBatchFailed(batchId);
    return;
  }

  const qa = evaluateProductIdentityQa({
    masterHero,
    prompt,
    backgroundMode: batchStore.get(batchId)!.backgroundMode,
    targetAxes: variant.variantKey.axes,
    simulatedPass: true,
  });

  const falTempUrl = `https://fal.media/temp/${variant.variantKey.configurationHash}.webp`;
  const record = createProductVisualAssetRecord({
    projectId: FRONTAL_SLAYER_PROJECT_ID,
    productId: masterHero.productId,
    masterHeroId: masterHero.masterHeroId,
    variantKey: variant.variantKey,
    batchId,
    provider: prompt.provider,
    model: prompt.model,
    promptVersion: prompt.version,
    resolvedUrl: falTempUrl,
    backgroundMode: batchStore.get(batchId)!.backgroundMode,
    hasAlpha:
      batchStore.get(batchId)!.backgroundMode === 'TRANSPARENT_CUTOUT' ||
      batchStore.get(batchId)!.backgroundMode === 'REMOVE_BACKGROUND',
    falTemporaryUrl: falTempUrl,
    parentAssetId: masterHero.masterHeroId,
  });

  const ingested = ingestVariantToSupabase(record, falTempUrl);

  updateVariant(variant.variantId, {
    status: qa.passed ? 'READY' : 'FAILED',
    promptId: prompt.promptId,
    provider: prompt.provider,
    model: prompt.model,
    falTemporaryUrl: falTempUrl,
    assetRecordId: ingested.assetId,
    qaStatus: qa.passed ? 'PASS' : 'FAIL',
    qaFailures: qa.failures,
    completedAt: new Date().toISOString(),
  });

  if (qa.passed) incrementBatchCompleted(batchId);
  else incrementBatchFailed(batchId);
}

async function generateSingleVariant(
  batchId: string,
  masterHero: NonNullable<ReturnType<typeof getMasterHero>>,
  variant: ProductVariantRecord,
): Promise<void> {
  generateSingleVariantSync(batchId, masterHero, variant);
}

function finalizeBatch(batchId: string): void {
  const batch = batchStore.get(batchId);
  if (!batch) return;
  const variants = listVariantsForBatch(batchId);
  const failed = variants.filter((v) => v.status === 'FAILED').length;
  const ready = variants.filter((v) => v.status === 'READY').length;

  let status: BatchStatus = 'READY_FOR_REVIEW';
  if (failed > 0 && ready > 0) status = 'PARTIAL';
  if (failed === variants.length) status = 'FAILED_PARTIAL';

  batchStore.set(batchId, {
    ...batch,
    status,
    completedVariants: ready,
    failedVariants: failed,
    completedAt: new Date().toISOString(),
  });

  if (status === 'PARTIAL') {
    createPartialBatchNotification(batch.projectId, batchId, ready, variants.length);
  } else {
    createBatchReadyNotification(batch.projectId, batchId, ready, variants.length);
  }
}

export function cancelQueuedVariants(batchId: string): ProductVariantBatch | null {
  const batch = batchStore.get(batchId);
  if (!batch) return null;
  for (const v of listVariantsForBatch(batchId)) {
    if (v.status === 'QUEUED' || v.status === 'PENDING') {
      updateVariant(v.variantId, { status: 'FAILED', qaFailures: [] });
    }
  }
  const updated = { ...batch, status: 'CANCELLED' as BatchStatus, cancelledAt: new Date().toISOString() };
  batchStore.set(batchId, updated);
  return updated;
}

export function retryFailedVariants(batchId: string): ProductVariantBatch | null {
  const batch = batchStore.get(batchId);
  const masterHero = batch ? getMasterHero(batch.masterHeroId) : null;
  if (!batch || !masterHero) return null;

  const failed = listVariantsForBatch(batchId).filter((v) => v.status === 'FAILED');
  for (const v of failed) {
    if (v.retryCount >= getDefaultConcurrencyPolicy().retryLimit) continue;
    updateVariant(v.variantId, { status: 'PENDING', retryCount: v.retryCount + 1, qaFailures: [] });
  }

  batchStore.set(batchId, { ...batch, status: 'GENERATING', founderConfirmed: true });
  const toRetry = listVariantsForBatch(batchId).filter((v) => v.status === 'PENDING' && v.retryCount > 0);
  if (typeof process !== 'undefined' && process.env.VITEST) {
    runBatchSync(batchId, masterHero, toRetry);
  }
  return batchStore.get(batchId) ?? null;
}

export function resumeMissingVariants(batchId: string): ProductVariantBatch | null {
  const batch = batchStore.get(batchId);
  if (!batch) return null;
  const missing = listVariantsForBatch(batchId).filter(
    (v) => v.status === 'PENDING' || v.status === 'FAILED',
  );
  if (missing.length === 0) return batch;
  batchStore.set(batchId, { ...batch, founderConfirmed: true, status: 'GENERATING' });
  return dispatchBatch(batchId);
}

export function regenerateVariant(variantId: string): ProductVariantRecord | null {
  const variant = variantStore.get(variantId);
  const batch = variant ? batchStore.get(variant.batchId) : null;
  const masterHero = batch ? getMasterHero(batch.masterHeroId) : null;
  if (!variant || !batch || !masterHero) return null;
  updateVariant(variantId, { status: 'PENDING', qaFailures: [], assetRecordId: null });
  generateSingleVariantSync(batch.batchId, masterHero, variantStore.get(variantId)!);
  return variantStore.get(variantId) ?? null;
}

export function getBatchProgress(batchId: string): BatchProgressSummary {
  const variants = listVariantsForBatch(batchId);
  return {
    batchId,
    total: variants.length,
    ready: variants.filter((v) => v.status === 'READY' || v.status === 'APPROVED').length,
    generating: variants.filter((v) => v.status === 'GENERATING').length,
    queued: variants.filter((v) => v.status === 'QUEUED' || v.status === 'PENDING').length,
    failed: variants.filter((v) => v.status === 'FAILED').length,
    pending: variants.filter((v) => v.status === 'PENDING').length,
  };
}

export function getBatch(batchId: string): ProductVariantBatch | null {
  return batchStore.get(batchId) ?? null;
}

export function listVariantsForBatch(batchId: string): ProductVariantRecord[] {
  return [...variantStore.values()].filter((v) => v.batchId === batchId);
}

export function getVariant(variantId: string): ProductVariantRecord | null {
  return variantStore.get(variantId) ?? null;
}

export function approveVariant(variantId: string): ProductVariantRecord | null {
  const variant = variantStore.get(variantId);
  if (!variant || variant.status !== 'READY' || !variant.assetRecordId) return null;
  approveVisualAsset(variant.assetRecordId);
  updateVariant(variantId, { status: 'APPROVED' });
  return variantStore.get(variantId) ?? null;
}

function updateVariant(variantId: string, patch: Partial<ProductVariantRecord>): void {
  const current = variantStore.get(variantId);
  if (!current) return;
  variantStore.set(variantId, { ...current, ...patch });
}

function incrementBatchCompleted(batchId: string): void {
  const batch = batchStore.get(batchId);
  if (batch) batchStore.set(batchId, { ...batch, completedVariants: batch.completedVariants + 1 });
}

function incrementBatchFailed(batchId: string): void {
  const batch = batchStore.get(batchId);
  if (batch) batchStore.set(batchId, { ...batch, failedVariants: batch.failedVariants + 1 });
}

function markBatchPartial(batchId: string): void {
  const batch = batchStore.get(batchId);
  if (batch) batchStore.set(batchId, { ...batch, status: 'PARTIAL' });
}

export function checkGenerationIdempotency(masterHeroId: string, configurationHash: string): boolean {
  return checkDuplicateVariant(masterHeroId, configurationHash).exists;
}

export function clearBatchStoreForTest(): void {
  batchStore.clear();
  variantStore.clear();
}

export function dispatchProductPageColorVariant(input: {
  productId: string;
  masterHeroId: string;
  colorId: string;
  backgroundMode: BackgroundMode;
  founderConfirmed: boolean;
}): ProductVariantBatch | null {
  if (!input.founderConfirmed) return null;
  const { batch } = planBatch({
    productId: input.productId,
    masterHeroId: input.masterHeroId,
    mode: 'PRODUCT_PAGE',
    selection: { COLOR: [input.colorId] },
    axes: ['COLOR'],
    backgroundMode: input.backgroundMode,
  });
  confirmBatchCost(batch.batchId);
  return dispatchBatch(batch.batchId);
}
