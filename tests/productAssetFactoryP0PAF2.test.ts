/**
 * P0.PAF.2 — Shared Supabase delivery, bindings, runtime resolver tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import { FS_VISUAL_ASSET_CONTRACT_VERSION } from '../shared/frontal-slayer-product-assets/contract/version.js';
import { buildDeterministicVariantKey, buildConfigurationSlug } from '../shared/frontal-slayer-product-assets/contract/variantKey.js';
import { clearProductVisualAssetsCache } from '../shared/frontal-slayer-product-assets/runtime/productVisualAssets.js';
import {
  P0_PAF_2_LINEAGE,
  FS_SHARED_SUPABASE_PROJECT_ID,
  FS_STORAGE_ROOT,
  FS_NAMESPACE_SEGMENTS,
  masterHeroOriginalPath,
  buildAWigVariantPaths,
  pdpColorVariantPaths,
  storagePathIsHumanReadable,
  archivePath,
  clearBindingStoreForTest,
  bindAssetAs,
  unbindAsset,
  rebindAsset,
  getLiveBindingPanel,
  previewBatchBindApprovedVariants,
  batchBindApprovedVariants,
  uniqueActiveBindingEnforced,
  canDeleteAsset,
  buildAssetLibraryTree,
  getAssetDetail,
  falUrlIsCanonical,
  ingestApprovedAssetToSupabase,
  ingestMasterHeroToSupabase,
  onVariantApproved,
  createStudioWorldRuntimeReader,
  runResolverTest,
  upsertVisualAssetRecord,
  upsertMasterHeroRecord,
  getActiveBinding,
} from '../shared/site00-studio-world-production/productAssetFactory/p0paf2/index.js';
import type { FrontalSlayerVisualAsset } from '../shared/frontal-slayer-product-assets/contract/types.js';
import {
  clearAssetStoreForTest,
  createProductVisualAssetRecord,
  buildVariantKey,
} from '../shared/site00-studio-world-production/productAssetFactory/p0paf1/index.js';
import {
  registerMasterHeroUpload,
  approveMasterHero,
  persistMasterHeroToSupabase,
  clearMasterHeroStoreForTest,
} from '../shared/site00-studio-world-production/productAssetFactory/p0paf1/masterHeroRegistry.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function seedApprovedFsAsset(input: Partial<FrontalSlayerVisualAsset> & { variantKey: string; productId: string }) {
  const asset: FrontalSlayerVisualAsset = {
    id: input.id ?? 'fs-asset-1',
    productId: input.productId,
    masterHeroId: input.masterHeroId ?? 'mh-noir-1',
    batchId: input.batchId ?? 'batch-1',
    variantKey: input.variantKey,
    surface: input.surface ?? 'BUILD_A_WIG',
    role: input.role ?? 'VARIANT',
    colorId: input.colorId ?? 'burgundy',
    styleId: input.styleId ?? 'straight',
    textureId: null,
    length: input.length ?? '24',
    part: input.part ?? 'middle',
    finish: null,
    storagePath:
      input.storagePath ??
      buildAWigVariantPaths({
        masterHeroId: input.masterHeroId ?? 'mh-noir-1',
        axes: { color: 'burgundy', style: 'straight', length: '24', part: 'middle' },
      }).deliveryWebp,
    publicUrl: input.publicUrl ?? 'https://storage.supabase.co/frontal-slayer/product-assets/test.webp',
    deliveryUrl: input.deliveryUrl ?? 'https://storage.supabase.co/frontal-slayer/product-assets/test.webp',
    thumbnailUrl: null,
    width: 1024,
    height: 1280,
    aspectRatio: 0.8,
    backgroundMode: 'TRANSPARENT_CUTOUT',
    hasAlpha: true,
    provider: 'fal',
    model: 'kontext',
    promptVersion: 1,
    qaStatus: input.qaStatus ?? 'PASS',
    status: input.status ?? 'APPROVED',
    canonStatus: input.canonStatus ?? 'CANON',
    parentAssetId: input.masterHeroId ?? 'mh-noir-1',
    supersedesId: null,
    createdAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    contractVersion: FS_VISUAL_ASSET_CONTRACT_VERSION,
  };
  upsertVisualAssetRecord(asset);
  return asset;
}

describe('P0.PAF.2 Supabase delivery + bindings', () => {
  beforeEach(() => {
    clearBindingStoreForTest();
    clearAssetStoreForTest();
    clearMasterHeroStoreForTest();
    clearProductVisualAssetsCache();
  });

  it('1–2. uses existing shared Supabase project; no second project', () => {
    expect(FS_SHARED_SUPABASE_PROJECT_ID).toBe('hyycomvcaqxxvyrfupes');
    expect(read('supabase/migrations/20260826031500_fs_product_visual_assets.sql')).toContain('fs_product_visual_assets');
  });

  it('3–6. Frontal Slayer storage namespace + deterministic paths', () => {
    expect(FS_STORAGE_ROOT).toBe('frontal-slayer/product-assets');
    expect(FS_NAMESPACE_SEGMENTS.masters).toContain('masters');
    expect(masterHeroOriginalPath('noir', 'mh-1')).toContain('masters/noir/mh-1/original');
    const baw = buildAWigVariantPaths({
      masterHeroId: 'mh-1',
      axes: { color: 'burgundy', style: 'straight', length: '24', part: 'middle' },
    });
    expect(baw.folderPath).toContain('color-burgundy_style-straight');
    expect(pdpColorVariantPaths({ productId: 'noir', colorSlug: 'burgundy' }).primaryWebp).toContain('burgundy');
    expect(storagePathIsHumanReadable(baw.deliveryWebp)).toBe(true);
  });

  it('7–10. database tables + bindings', () => {
    const sql = read('supabase/migrations/20260826031500_fs_product_visual_assets.sql');
    expect(sql).toContain('fs_product_master_heroes');
    expect(sql).toContain('fs_product_asset_bindings');
    expect(sql).toContain('fs_build_a_wig_visual_variants');
  });

  it('11–12. FAL ingest to Supabase; FAL URL not canonical', () => {
    expect(falUrlIsCanonical('https://fal.media/temp/x.webp')).toBe(true);
    const hero = registerMasterHeroUpload({
      productId: 'noir',
      productFamilyId: 'f',
      heroType: 'PRODUCT',
      fileName: 'h.png',
      buffer: new Uint8Array([1]),
    });
    approveMasterHero(hero.masterHeroId);
    ingestMasterHeroToSupabase(hero, 'https://storage.supabase.co/frontal-slayer/product-assets/masters/noir/x/original/noir-master-v1.png');
    const vk = buildVariantKey({ masterHeroId: hero.masterHeroId, axes: { COLOR: 'burgundy' }, mode: 'PRODUCT_PAGE' });
    const record = createProductVisualAssetRecord({
      projectId: 'frontal-slayer',
      productId: 'noir',
      masterHeroId: hero.masterHeroId,
      variantKey: vk,
      batchId: 'b1',
      provider: 'fal',
      model: 'm',
      promptVersion: 1,
      resolvedUrl: 'https://fal.media/temp/x.webp',
      backgroundMode: 'KEEP_ORIGINAL',
      hasAlpha: false,
    });
    const { asset } = ingestApprovedAssetToSupabase({
      record,
      supabasePublicUrl: 'https://storage.supabase.co/frontal-slayer/product-assets/products/noir/color-variants/burgundy/noir-primary-hero-burgundy-v1.webp',
    });
    expect(asset.storagePath).toContain('frontal-slayer/product-assets');
    expect(asset.publicUrl).not.toContain('fal.media');
  });

  it('13–15. preview + active binding; unique active enforced', () => {
    const variantKey = buildDeterministicVariantKey({ color: 'burgundy', style: 'straight', length: '24', part: 'middle' });
    const asset = seedApprovedFsAsset({ variantKey, productId: 'noir' });
    bindAssetAs({ assetId: asset.id, surface: 'BUILD_A_WIG', productId: 'noir', slotId: 'CONFIG', variantKey, preview: true });
    expect(getActiveBinding('BUILD_A_WIG', 'noir', 'CONFIG', variantKey, true)?.bindingState).toBe('PREVIEW');
    bindAssetAs({ assetId: asset.id, surface: 'BUILD_A_WIG', productId: 'noir', slotId: 'CONFIG', variantKey });
    expect(uniqueActiveBindingEnforced('BUILD_A_WIG', 'noir', 'CONFIG', variantKey)).toBe(true);
  });

  it('16–19. runtime resolver BAW + PDP', () => {
    const variantKey = buildDeterministicVariantKey({ color: 'burgundy', style: 'straight', length: '24', part: 'middle' });
    const asset = seedApprovedFsAsset({ variantKey, productId: 'noir' });
    bindAssetAs({ assetId: asset.id, surface: 'BUILD_A_WIG', productId: 'noir', slotId: 'CONFIG', variantKey });
    const runtime = createStudioWorldRuntimeReader();
    expect(runtime.getBuildAWigVisualAsset({ color: 'burgundy', style: 'straight', length: '24', part: 'middle' })?.source).toBe('ACTIVE_BINDING');
    const pdpKey = buildDeterministicVariantKey({ color: 'burgundy' });
    const pdpAsset = seedApprovedFsAsset({ id: 'pdp-1', variantKey: pdpKey, productId: 'noir', styleId: null, length: null, part: null, surface: 'PRODUCT_PAGE' });
    bindAssetAs({ assetId: pdpAsset.id, surface: 'PRODUCT_PAGE', productId: 'noir', slotId: 'PRIMARY_HERO', variantKey: pdpKey });
    expect(runtime.getProductVariantAsset('noir', pdpKey, 'PRIMARY_HERO')?.asset.id).toBe('pdp-1');
  });

  it('20–21. master fallback', () => {
    upsertMasterHeroRecord({
      id: 'mh-noir-1',
      productId: 'noir',
      sourceAssetId: 's',
      storagePath: masterHeroOriginalPath('noir', 'mh-noir-1'),
      publicUrl: 'https://storage.supabase.co/master.png',
      heroType: 'PRODUCT',
      backgroundMode: 'KEEP_ORIGINAL',
      width: 1024,
      height: 1280,
      aspectRatio: 0.8,
      lockedAttributes: {},
      allowedVariationAxes: ['COLOR'],
      status: 'ACTIVE_CANONICAL',
      canonStatus: 'CANON',
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      supersedesId: null,
    });
    const runtime = createStudioWorldRuntimeReader();
    expect(runtime.getBuildAWigVisualAsset({ color: 'jet-black', style: 'straight', length: '24', part: 'middle' })?.source).toBe('MASTER_FALLBACK');
  });

  it('22–24. batch bind + rebind history', () => {
    const vk1 = buildDeterministicVariantKey({ color: 'burgundy' });
    seedApprovedFsAsset({ id: 'a1', variantKey: vk1, productId: 'noir' });
    seedApprovedFsAsset({ id: 'a2', variantKey: buildDeterministicVariantKey({ color: 'jet-black' }), productId: 'noir', qaStatus: 'FAIL', status: 'GENERATED', canonStatus: 'GENERATED' });
    const preview = previewBatchBindApprovedVariants({ productId: 'noir', surface: 'PRODUCT_PAGE', slotId: 'PRIMARY_HERO' });
    expect(preview.willActivate).toBe(1);
    expect(batchBindApprovedVariants({ productId: 'noir', surface: 'PRODUCT_PAGE', slotId: 'PRIMARY_HERO', founderConfirmed: true }).length).toBe(1);
    const vk = buildDeterministicVariantKey({ color: 'burgundy' });
    const v1 = seedApprovedFsAsset({ id: 'v1', variantKey: vk, productId: 'noir' });
    const v2 = seedApprovedFsAsset({ id: 'v2', variantKey: vk, productId: 'noir', publicUrl: 'https://storage.supabase.co/v2.webp', deliveryUrl: 'https://storage.supabase.co/v2.webp' });
    const b1 = bindAssetAs({ assetId: v1.id, surface: 'PRODUCT_PAGE', productId: 'noir', slotId: 'PRIMARY_HERO', variantKey: vk });
    rebindAsset({ assetId: v2.id, surface: 'PRODUCT_PAGE', productId: 'noir', slotId: 'PRIMARY_HERO', variantKey: vk, supersedeBindingId: b1.id });
    expect(getActiveBinding('PRODUCT_PAGE', 'noir', 'PRIMARY_HERO', vk)?.assetId).toBe('v2');
  });

  it('25–31. security, library, UI, canon', () => {
    expect(read('supabase/migrations/20260826031500_fs_product_visual_assets.sql')).toContain('row level security');
    const vk = buildDeterministicVariantKey({ color: 'burgundy' });
    const asset = seedApprovedFsAsset({ variantKey: vk, productId: 'noir' });
    bindAssetAs({ assetId: asset.id, surface: 'BUILD_A_WIG', productId: 'noir', slotId: 'CONFIG', variantKey: vk });
    expect(buildAssetLibraryTree({ productId: 'noir' }).BUILD_A_WIG.length).toBeGreaterThan(0);
    expect(canDeleteAsset(asset.id).allowed).toBe(false);
    expect(read('src/site00/components/productAssetFactory/LiveBindingsPanel.tsx')).toContain('LIVE BINDINGS');
    expect(P0_PAF_2_LINEAGE).toBe('P0.PAF.2');
    expect(buildDeterministicVariantKey({ color: 'burgundy', length: '24' })).toBe(buildDeterministicVariantKey({ length: '24', color: 'burgundy' }));
    expect(buildConfigurationSlug({ color: 'burgundy', style: 'straight' })).toContain('color-burgundy');
  });

  it('unapproved cannot bind live', () => {
    const asset = seedApprovedFsAsset({ variantKey: 'color=burgundy', productId: 'noir', canonStatus: 'GENERATED', status: 'GENERATED' });
    expect(() => bindAssetAs({ assetId: asset.id, surface: 'PRODUCT_PAGE', productId: 'noir', slotId: 'PRIMARY_HERO', variantKey: 'color=burgundy' })).toThrow();
  });
});
