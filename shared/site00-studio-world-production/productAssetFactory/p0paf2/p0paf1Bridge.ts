/**
 * P0.PAF.2 — Bridge P0.PAF.1 approval flow → Supabase canon + bindings store.
 */

import { approveVisualAsset, getVisualAsset as getP0paf1Asset } from '../p0paf1/assetRecordRegistry.js';
import type { ProductMasterHero, ProductVisualAssetRecord } from '../p0paf1/types.js';
import { ingestApprovedAssetToSupabase, ingestMasterHeroToSupabase } from './ingestPipeline.js';
import { bindAssetAs } from './bindingService.js';
import { buildDeterministicVariantKey } from '../../../frontal-slayer-product-assets/contract/variantKey.js';
import type { FsBindingSurface } from '../../../frontal-slayer-product-assets/contract/types.js';

export function onMasterHeroApproved(hero: ProductMasterHero, supabasePublicUrl: string): void {
  ingestMasterHeroToSupabase(hero, supabasePublicUrl);
}

export function onVariantApproved(input: {
  assetId: string;
  supabasePublicUrl: string;
  autoBind?: { surface: FsBindingSurface; slotId: string };
}): { asset: ReturnType<typeof ingestApprovedAssetToSupabase>['asset']; bindingId?: string } {
  approveVisualAsset(input.assetId);
  const record = getP0paf1Asset(input.assetId);
  if (!record) throw new Error('FAIL_PRODUCT_ASSET_NOT_PERSISTED');

  const { asset } = ingestApprovedAssetToSupabase({ record, supabasePublicUrl: input.supabasePublicUrl });

  let bindingId: string | undefined;
  if (input.autoBind) {
    const binding = bindAssetAs({
      assetId: asset.id,
      surface: input.autoBind.surface,
      productId: asset.productId,
      slotId: input.autoBind.slotId,
      variantKey: asset.variantKey,
    });
    bindingId = binding.id;
  }

  return { asset, bindingId };
}

export function syncP0paf1RecordToFsCanon(record: ProductVisualAssetRecord, supabasePublicUrl: string) {
  return ingestApprovedAssetToSupabase({ record, supabasePublicUrl });
}

export function defaultSlotForSurface(surface: FsBindingSurface): string {
  switch (surface) {
    case 'PRODUCT_PAGE':
      return 'PRIMARY_HERO';
    case 'BUILD_A_WIG':
      return 'CONFIG';
    default:
      return 'DEFAULT';
  }
}

export function variantKeyFromRecord(record: ProductVisualAssetRecord): string {
  return buildDeterministicVariantKey(record.variationValues as Record<string, string>);
}
