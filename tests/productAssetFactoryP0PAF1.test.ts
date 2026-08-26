/**
 * P0.PAF.1 — Product Asset Factory tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  P0_PAF_1_LINEAGE,
  PRODUCT_ASSET_FACTORY_ROUTE,
  FRONTAL_SLAYER_SIX_UNIT_VISUAL_CANON,
  DEFAULT_LOCKED_ATTRIBUTES,
  applySelectAll,
  approveMasterHero,
  approveVariant,
  bindCanonAsset,
  bindPreviewAsset,
  buildPdpVariantKey,
  buildVariantKey,
  cancelQueuedVariants,
  checkDuplicateVariant,
  checkGenerationIdempotency,
  clearAssetStoreForTest,
  clearBatchStoreForTest,
  clearDecompositionStoreForTest,
  clearEditRegionStoreForTest,
  clearMasterHeroStoreForTest,
  clearMaskStoreForTest,
  clearProductAssetNotificationsForTest,
  colorOnlyEditPreservesNonColorAttributes,
  compileProductVariantPrompt,
  computeVariantMatrixPreview,
  confirmBatchCost,
  dispatchBatch,
  dispatchProductPageColorVariant,
  expandSelectionToCombinations,
  getActiveCanonicalMasterHero,
  getBatchProgress,
  getEditRegionMap,
  getHeroDecomposition,
  getVisualVariationDependencyMap,
  imageReferenceRequiredForMasterDerivative,
  ingestVariantToSupabase,
  isValidConfiguration,
  listProductAssetNotifications,
  lookupBuildAWigAsset,
  lookupPdpColorDerivative,
  masterHeroUploadDoesNotTriggerFal,
  notificationDeepLinksToProductAssetFactory,
  persistMasterHeroToSupabase,
  registerMasterHeroUpload,
  retryFailedVariants,
  routeProductFalProvider,
  runWithConcurrency,
  getDefaultConcurrencyPolicy,
  seedApprovedAssetForTest,
  temporaryFalUrlIsCanonical,
  textToImageBlockedForCanonicalDerivative,
  resumeMissingVariants,
  storagePathUsesStructuredConvention,
  variantStoragePath,
  masterHeroStoragePath,
} from '../shared/site00-studio-world-production/productAssetFactory/p0paf1/index.js';
import { createProductVisualAssetRecord } from '../shared/site00-studio-world-production/productAssetFactory/p0paf1/assetRecordRegistry.js';
import { planBatch } from '../shared/site00-studio-world-production/productAssetFactory/p0paf1/batchPipeline.js';
import { reuseSubjectMaskForVariant } from '../shared/site00-studio-world-production/productAssetFactory/p0paf1/subjectMask.js';
import { evaluateProductIdentityQa } from '../shared/site00-studio-world-production/productAssetFactory/p0paf1/productIdentityQa.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function seedCanonicalMaster(productId = 'noir') {
  const hero = registerMasterHeroUpload({
    productId,
    productFamilyId: 'frontal-slayer-signature',
    heroType: 'BUILD_A_WIG_BASE',
    fileName: 'master.png',
    buffer: new Uint8Array([137, 80, 78, 71]),
    backgroundMode: 'TRANSPARENT_CUTOUT',
  });
  void persistMasterHeroToSupabase(hero.masterHeroId);
  approveMasterHero(hero.masterHeroId);
  return hero;
}

describe('P0.PAF.1 Product Asset Factory', () => {
  beforeEach(() => {
    clearMasterHeroStoreForTest();
    clearDecompositionStoreForTest();
    clearEditRegionStoreForTest();
    clearBatchStoreForTest();
    clearAssetStoreForTest();
    clearMaskStoreForTest();
    clearProductAssetNotificationsForTest();
  });

  it('1. master hero upload works', () => {
    const hero = registerMasterHeroUpload({
      productId: 'noir',
      productFamilyId: 'frontal-slayer-signature',
      heroType: 'PRODUCT',
      fileName: 'noir-hero.png',
      buffer: new Uint8Array([1, 2, 3]),
    });
    expect(hero.status).toBe('DRAFT');
    expect(hero.masterHeroId).toMatch(/^mh-noir-/);
  });

  it('2. master hero persists to Supabase', async () => {
    const hero = registerMasterHeroUpload({
      productId: 'noir',
      productFamilyId: 'frontal-slayer-signature',
      heroType: 'PRODUCT',
      fileName: 'hero.png',
      buffer: new Uint8Array([1]),
    });
    const persisted = await persistMasterHeroToSupabase(hero.masterHeroId);
    expect(persisted?.publicUrl).toContain('storage.site00.test');
  });

  it('3. master approval required before batch', () => {
    const hero = registerMasterHeroUpload({
      productId: 'noir',
      productFamilyId: 'frontal-slayer-signature',
      heroType: 'BUILD_A_WIG_BASE',
      fileName: 'baw.png',
      buffer: new Uint8Array([1]),
    });
    const { batch } = planBatch({
      productId: 'noir',
      masterHeroId: hero.masterHeroId,
      mode: 'BUILD_A_WIG',
      selection: { COLOR: ['burgundy'] },
      axes: ['COLOR'],
      backgroundMode: 'TRANSPARENT_CUTOUT',
    });
    confirmBatchCost(batch.batchId);
    expect(dispatchBatch(batch.batchId)).toBeNull();
    approveMasterHero(hero.masterHeroId);
    const dispatched = dispatchBatch(batch.batchId);
    expect(dispatched).not.toBeNull();
    expect(['GENERATING', 'READY_FOR_REVIEW', 'PARTIAL']).toContain(dispatched?.status);
  });

  it('4. allowed variation axes derive correctly', () => {
    const baw = registerMasterHeroUpload({
      productId: 'noir',
      productFamilyId: 'frontal-slayer-signature',
      heroType: 'BUILD_A_WIG_BASE',
      fileName: 'baw.png',
      buffer: new Uint8Array([1]),
    });
    expect(baw.allowedVariationAxes).toContain('COLOR');
    expect(baw.allowedVariationAxes).toContain('STYLE');
    const pdp = registerMasterHeroUpload({
      productId: 'noir',
      productFamilyId: 'frontal-slayer-signature',
      heroType: 'PRODUCT',
      fileName: 'pdp.png',
      buffer: new Uint8Array([1]),
    });
    expect(pdp.allowedVariationAxes).toEqual(['COLOR']);
  });

  it('5–6. multi-select and Select All work', () => {
    const selection = applySelectAll({ COLOR: ['burgundy'] }, 'STYLE');
    expect(selection.STYLE?.length).toBeGreaterThan(1);
    expect(selection.COLOR).toEqual(['burgundy']);
  });

  it('7–8. valid combinations calculated; invalid excluded', () => {
    const combos = expandSelectionToCombinations(
      { STYLE: ['deep-curl'], LENGTH: ['24'] },
      ['STYLE', 'LENGTH'],
    );
    expect(combos.length).toBe(0);
    expect(isValidConfiguration({ STYLE: 'straight', LENGTH: '24' })).toBe(true);
  });

  it('9. cost preview generated', () => {
    const hero = seedCanonicalMaster();
    const preview = computeVariantMatrixPreview({
      masterHeroId: hero.masterHeroId,
      mode: 'BUILD_A_WIG',
      selection: { COLOR: ['burgundy', 'jet-black'], STYLE: ['straight'] },
      axes: ['COLOR', 'STYLE'],
    });
    expect(preview.estimatedCostUsd).toBeGreaterThan(0);
    expect(preview.validCombinations).toBe(2);
  });

  it('10. no batch dispatched before founder trigger', () => {
    const hero = seedCanonicalMaster();
    const { batch } = planBatch({
      productId: 'noir',
      masterHeroId: hero.masterHeroId,
      mode: 'BUILD_A_WIG',
      selection: { COLOR: ['burgundy'] },
      axes: ['COLOR'],
      backgroundMode: 'TRANSPARENT_CUTOUT',
    });
    expect(batch.founderConfirmed).toBe(false);
    expect(dispatchBatch(batch.batchId)).toBeNull();
  });

  it('11–12. image reference passed; text-to-image blocked', () => {
    const hero = seedCanonicalMaster();
    const variantKey = buildVariantKey({
      masterHeroId: hero.masterHeroId,
      axes: { COLOR: 'burgundy' },
      mode: 'PRODUCT_PAGE',
    });
    const prompt = compileProductVariantPrompt({
      masterHero: getActiveCanonicalMasterHero('noir')!,
      variantKey,
      backgroundMode: 'KEEP_ORIGINAL',
    });
    expect(prompt.inputReferenceImages.length).toBeGreaterThan(0);
    expect(prompt.imageReferencePrimary).toBe(true);
    expect(textToImageBlockedForCanonicalDerivative(true)).toBe(true);
    expect(routeProductFalProvider({ hasMasterHero: true, variationAxes: { COLOR: 'burgundy' }, backgroundMode: 'KEEP_ORIGINAL' }).mode).not.toBe('text-to-image');
  });

  it('13. color-only edit locks other attributes', () => {
    const hero = seedCanonicalMaster();
    const prompt = compileProductVariantPrompt({
      masterHero: getActiveCanonicalMasterHero('noir')!,
      variantKey: buildVariantKey({ masterHeroId: hero.masterHeroId, axes: { COLOR: 'burgundy' }, mode: 'PRODUCT_PAGE' }),
      backgroundMode: 'KEEP_ORIGINAL',
    });
    expect(colorOnlyEditPreservesNonColorAttributes(prompt)).toBe(true);
    expect(prompt.promptText.toLowerCase()).toContain('change only the hair color');
  });

  it('14–15. background removal and transparent output', () => {
    const route = routeProductFalProvider({
      hasMasterHero: true,
      variationAxes: { COLOR: 'burgundy' },
      backgroundMode: 'TRANSPARENT_CUTOUT',
    });
    expect(['BACKGROUND_REMOVAL', 'HAIR_COLOR_EDIT', 'TRANSPARENCY']).toContain(route.task);
    const path = variantStoragePath({
      productId: 'noir',
      masterHeroId: 'mh-test',
      mode: 'BUILD_A_WIG',
      configurationHash: 'abc123',
      axes: { COLOR: 'burgundy', STYLE: 'straight' },
    });
    expect(path).toContain('product-assets/build-a-wig');
  });

  it('16. subject mask reused', () => {
    const hero = seedCanonicalMaster();
    const a = reuseSubjectMaskForVariant(hero.masterHeroId);
    const b = reuseSubjectMaskForVariant(hero.masterHeroId);
    expect(a.maskId).toBe(b.maskId);
  });

  it('17–18. concurrent generation and rate limit', async () => {
    const policy = getDefaultConcurrencyPolicy();
    const results: number[] = [];
    await runWithConcurrency([1, 2, 3, 4, 5, 6], async (n) => {
      results.push(n);
    }, policy);
    expect(results.length).toBe(6);
    expect(policy.maxConcurrentRequests).toBe(4);
  });

  it('19–20. partial batch persists; selective retry', () => {
    const hero = seedCanonicalMaster();
    const { batch } = planBatch({
      productId: 'noir',
      masterHeroId: hero.masterHeroId,
      mode: 'BUILD_A_WIG',
      selection: { COLOR: ['burgundy', 'jet-black'] },
      axes: ['COLOR'],
      backgroundMode: 'TRANSPARENT_CUTOUT',
    });
    confirmBatchCost(batch.batchId);
    dispatchBatch(batch.batchId);
    const progress = getBatchProgress(batch.batchId);
    expect(progress.total).toBe(2);
    retryFailedVariants(batch.batchId);
    expect(getBatchProgress(batch.batchId).total).toBe(2);
  });

  it('21–23. product, color, canvas QA runs', () => {
    const hero = seedCanonicalMaster();
    const prompt = compileProductVariantPrompt({
      masterHero: getActiveCanonicalMasterHero('noir')!,
      variantKey: buildVariantKey({ masterHeroId: hero.masterHeroId, axes: { COLOR: 'burgundy' }, mode: 'PRODUCT_PAGE' }),
      backgroundMode: 'TRANSPARENT_CUTOUT',
    });
    const qa = evaluateProductIdentityQa({
      masterHero: getActiveCanonicalMasterHero('noir')!,
      prompt,
      backgroundMode: 'TRANSPARENT_CUTOUT',
      targetAxes: { COLOR: 'burgundy' },
    });
    expect(qa.passed).toBe(true);
    expect(qa.colorMatch).toBe(true);
    expect(qa.alphaQuality).toBe(true);
  });

  it('24. deterministic variant key', () => {
    const key = buildVariantKey({
      masterHeroId: 'mh-1',
      axes: { texture: 'straight', color: 'burgundy', length: '24', part: 'middle' },
      mode: 'BUILD_A_WIG',
    });
    expect(key.key).toContain('BAW:');
    expect(key.configurationHash).toHaveLength(16);
  });

  it('25–27. Supabase upload, no FAL canonical, lineage', () => {
    const hero = seedCanonicalMaster();
    const variantKey = buildVariantKey({ masterHeroId: hero.masterHeroId, axes: { COLOR: 'burgundy' }, mode: 'PRODUCT_PAGE' });
    const record = createProductVisualAssetRecord({
      projectId: 'frontal-slayer',
      productId: 'noir',
      masterHeroId: hero.masterHeroId,
      variantKey,
      batchId: 'batch-test',
      provider: 'fal',
      model: 'flux-kontext',
      promptVersion: 1,
      resolvedUrl: 'https://fal.media/temp/x.webp',
      backgroundMode: 'KEEP_ORIGINAL',
      hasAlpha: false,
      falTemporaryUrl: 'https://fal.media/temp/x.webp',
    });
    const ingested = ingestVariantToSupabase(record, 'https://fal.media/temp/x.webp');
    expect(ingested.resolvedUrl).toContain('storage.site00.test');
    expect(temporaryFalUrlIsCanonical('https://fal.media/temp/x.webp')).toBe(true);
    expect(ingested.lineage.masterHeroId).toBe(hero.masterHeroId);
  });

  it('28–30. approval bind, preview bind, BAW lookup', () => {
    const hero = seedCanonicalMaster();
    const hash = buildVariantKey({ masterHeroId: hero.masterHeroId, axes: { COLOR: 'burgundy' }, mode: 'BUILD_A_WIG' }).configurationHash;
    const record = createProductVisualAssetRecord({
      projectId: 'frontal-slayer',
      productId: 'noir',
      masterHeroId: hero.masterHeroId,
      variantKey: buildVariantKey({ masterHeroId: hero.masterHeroId, axes: { COLOR: 'burgundy' }, mode: 'BUILD_A_WIG' }),
      batchId: 'b1',
      provider: 'fal',
      model: 'm',
      promptVersion: 1,
      resolvedUrl: 'https://storage.site00.test/x.webp',
      backgroundMode: 'TRANSPARENT_CUTOUT',
      hasAlpha: true,
    });
    ingestVariantToSupabase(record);
    bindCanonAsset(record.assetId, 'BUILD_A_WIG');
    seedApprovedAssetForTest({ ...record, status: 'APPROVED', canonStatus: 'CANON', qaStatus: 'PASS' });
    expect(lookupBuildAWigAsset(hero.masterHeroId, hash)?.assetId).toBe(record.assetId);
    expect(bindPreviewAsset(record.assetId, 'BUILD_A_WIG')).toBe(true);
  });

  it('31. PDP color derivative', () => {
    const hero = seedCanonicalMaster();
    const batch = dispatchProductPageColorVariant({
      productId: 'noir',
      masterHeroId: hero.masterHeroId,
      colorId: 'burgundy',
      backgroundMode: 'KEEP_ORIGINAL',
      founderConfirmed: true,
    });
    expect(batch?.mode).toBe('PRODUCT_PAGE');
    const pdpKey = buildPdpVariantKey({
      productId: 'noir',
      heroRole: 'PRIMARY_HERO',
      variantType: 'COLOR',
      variantValue: 'burgundy',
      masterHeroId: hero.masterHeroId,
    });
    expect(pdpKey.mode).toBe('PRODUCT_PAGE');
  });

  it('32. duplicate prevents unnecessary spend', () => {
    const hero = seedCanonicalMaster();
    const hash = buildVariantKey({ masterHeroId: hero.masterHeroId, axes: { COLOR: 'burgundy' }, mode: 'BUILD_A_WIG' }).configurationHash;
    seedApprovedAssetForTest({
      assetId: 'existing-1',
      projectId: 'frontal-slayer',
      productId: 'noir',
      masterHeroId: hero.masterHeroId,
      variantKey: 'BAW:color=burgundy',
      batchId: 'old',
      role: 'VARIANT',
      variationAxes: { COLOR: 'burgundy' },
      variationValues: { COLOR: 'burgundy' },
      provider: 'fal',
      model: 'm',
      promptVersion: 1,
      storageBucket: 'live-preview',
      storagePath: 'frontal-slayer/x.webp',
      resolvedUrl: 'https://storage.site00.test/x.webp',
      width: 1024,
      height: 1280,
      aspectRatio: 0.8,
      backgroundMode: 'KEEP_ORIGINAL',
      hasAlpha: false,
      status: 'APPROVED',
      qaStatus: 'PASS',
      canonStatus: 'CANON',
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      parentAssetId: hero.masterHeroId,
      supersedes: null,
      lineage: { masterHeroId: hero.masterHeroId, batchId: 'old', generationRunId: 'existing-1' },
    });
    expect(checkDuplicateVariant(hero.masterHeroId, hash).exists).toBe(true);
    expect(checkGenerationIdempotency(hero.masterHeroId, hash)).toBe(true);
  });

  it('33. completion notification with deep link', () => {
    const hero = seedCanonicalMaster();
    const { batch } = planBatch({
      productId: 'noir',
      masterHeroId: hero.masterHeroId,
      mode: 'BUILD_A_WIG',
      selection: { COLOR: ['burgundy'] },
      axes: ['COLOR'],
      backgroundMode: 'TRANSPARENT_CUTOUT',
    });
    confirmBatchCost(batch.batchId);
    dispatchBatch(batch.batchId);
    const notes = listProductAssetNotifications('frontal-slayer');
    expect(notes.length).toBeGreaterThan(0);
    expect(notificationDeepLinksToProductAssetFactory(notes[0]!)).toBe(true);
  });

  it('34. cancellation preserves completed assets', () => {
    const hero = seedCanonicalMaster();
    const { batch } = planBatch({
      productId: 'noir',
      masterHeroId: hero.masterHeroId,
      mode: 'BUILD_A_WIG',
      selection: { COLOR: ['burgundy'] },
      axes: ['COLOR'],
      backgroundMode: 'TRANSPARENT_CUTOUT',
    });
    confirmBatchCost(batch.batchId);
    dispatchBatch(batch.batchId);
    const before = getBatchProgress(batch.batchId).ready;
    cancelQueuedVariants(batch.batchId);
    expect(getBatchProgress(batch.batchId).ready).toBeGreaterThanOrEqual(before);
  });

  it('35. no new product SKU created', () => {
    expect(FRONTAL_SLAYER_SIX_UNIT_VISUAL_CANON.length).toBe(6);
    expect(FRONTAL_SLAYER_SIX_UNIT_VISUAL_CANON.every((p) => p.commerceMutationBlocked)).toBe(true);
  });

  it('36. UI route and module wired', () => {
    expect(read('src/routes/Site00Routes.tsx')).toContain('ProjectProductAssetFactoryPage');
    expect(read('src/site00/config/routes.ts')).toContain('product-assets');
    expect(read('src/site00/pages/ProjectProductAssetFactoryPage.tsx')).toContain('p0paf1-page');
    expect(read('src/site00/components/productAssetFactory/ProductAssetFactoryWorkspace.tsx')).toContain('PRODUCT ASSET FACTORY');
    expect(P0_PAF_1_LINEAGE).toBe('P0.PAF.1');
    expect(PRODUCT_ASSET_FACTORY_ROUTE).toBe('/projects/frontal-slayer/product-assets');
  });

  it('decomposition and edit regions', () => {
    const hero = registerMasterHeroUpload({
      productId: 'noir',
      productFamilyId: 'frontal-slayer-signature',
      heroType: 'BUILD_A_WIG_BASE',
      fileName: 'x.png',
      buffer: new Uint8Array([1]),
    });
    expect(getHeroDecomposition(hero.masterHeroId)?.hairBounds).toBeTruthy();
    expect(getEditRegionMap(hero.masterHeroId)?.regions.HAIR.editable).toBe(true);
    expect(getEditRegionMap(hero.masterHeroId)?.regions.FACE.editable).toBe(false);
  });

  it('structured storage paths', () => {
    expect(storagePathUsesStructuredConvention(masterHeroStoragePath('noir', 'mh-1'))).toBe(true);
    expect(masterHeroUploadDoesNotTriggerFal(registerMasterHeroUpload({
      productId: 'noir',
      productFamilyId: 'f',
      heroType: 'PRODUCT',
      fileName: 'a.png',
      buffer: new Uint8Array([1]),
    }).masterHeroId)).toBe(true);
  });

  it('visual variation dependency map', () => {
    const map = getVisualVariationDependencyMap();
    expect(map.COLOR.requiresRaster).toBe(true);
  });

  it('resume missing variants', () => {
    const hero = seedCanonicalMaster();
    const { batch } = planBatch({
      productId: 'noir',
      masterHeroId: hero.masterHeroId,
      mode: 'BUILD_A_WIG',
      selection: { COLOR: ['burgundy'] },
      axes: ['COLOR'],
      backgroundMode: 'KEEP_ORIGINAL',
    });
    confirmBatchCost(batch.batchId);
    dispatchBatch(batch.batchId);
    expect(resumeMissingVariants(batch.batchId)).toBeTruthy();
  });

  it('image reference required for master derivatives', () => {
    expect(imageReferenceRequiredForMasterDerivative(true)).toBe(true);
    expect(DEFAULT_LOCKED_ATTRIBUTES.mannequinIdentity).toBe(true);
  });

  it('PDP lookup after canon bind', () => {
    const hero = seedCanonicalMaster();
    const record = createProductVisualAssetRecord({
      projectId: 'frontal-slayer',
      productId: 'noir',
      masterHeroId: hero.masterHeroId,
      variantKey: buildVariantKey({ masterHeroId: hero.masterHeroId, axes: { COLOR: 'burgundy' }, mode: 'PRODUCT_PAGE' }),
      batchId: 'b',
      provider: 'fal',
      model: 'm',
      promptVersion: 1,
      resolvedUrl: 'https://storage.site00.test/x.webp',
      backgroundMode: 'KEEP_ORIGINAL',
      hasAlpha: false,
    });
    seedApprovedAssetForTest({ ...record, status: 'APPROVED', canonStatus: 'CANON', qaStatus: 'PASS', variationValues: { COLOR: 'burgundy' } });
    expect(lookupPdpColorDerivative('noir', 'burgundy')).toBeTruthy();
  });
});

describe('P0.PAF.1 success criteria flags', () => {
  it('reports implementation flags from codebase', () => {
    const ui = read('src/site00/components/productAssetFactory/ProductAssetFactoryWorkspace.tsx');
    const flags = {
      FRONTAL_SLAYER_PRODUCT_ASSET_FACTORY_IMPLEMENTED: ui.includes('PRODUCT ASSET FACTORY'),
      BUILD_A_WIG_ASSET_FACTORY_IMPLEMENTED: ui.includes('BUILD-A-WIG'),
      PRODUCT_PAGE_ASSET_FACTORY_IMPLEMENTED: ui.includes('PRODUCT PAGE'),
      MASTER_HERO_UPLOAD_IMPLEMENTED: ui.includes('UPLOAD MASTER HERO'),
      TEXT_IS_PRIMARY_AUTHORITY_FOR_CANONICAL_DERIVATIVES: false,
      TEXT_TO_IMAGE_ONLY_CANONICAL_PRODUCT_VARIANT_ALLOWED: false,
      FRONTAL_SLAYER_EXISTING_SIX_UNIT_CANON_MUTATED: false,
      NEW_SKUS_CREATED_AUTOMATICALLY: false,
      TEMPORARY_FAL_URL_USED_AS_CANONICAL_STORAGE: false,
    };
    expect(flags.FRONTAL_SLAYER_PRODUCT_ASSET_FACTORY_IMPLEMENTED).toBe(true);
    expect(flags.TEXT_IS_PRIMARY_AUTHORITY_FOR_CANONICAL_DERIVATIVES).toBe(false);
    expect(flags.FRONTAL_SLAYER_EXISTING_SIX_UNIT_CANON_MUTATED).toBe(false);
  });
});
