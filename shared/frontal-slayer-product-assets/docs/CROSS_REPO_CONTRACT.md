# Frontal Slayer Visual Asset Cross-Repo Contract

**Version:** `FS_VISUAL_ASSET_CONTRACT_VERSION = v1`

## Architecture

```
Studio World (SITE00)  →  generate + approve + bind
Supabase (shared)      →  store + organize + bind records
Frontal Slayer (fsbw)  →  resolve ACTIVE bindings + render
```

## Shared types (no code package required)

Both repos must conform to:

- `FrontalSlayerMasterHero`
- `FrontalSlayerVisualAsset`
- `FrontalSlayerAssetBinding`
- `FrontalSlayerBuildAWigVisualVariant`
- `FrontalSlayerVariantKey` via `buildDeterministicVariantKey()`

Source of truth in SITE00: `shared/frontal-slayer-product-assets/contract/`

## Supabase tables

- `fs_product_master_heroes`
- `fs_product_visual_assets`
- `fs_product_asset_bindings`
- `fs_build_a_wig_visual_variants`

## Storage namespace

Root: `frontal-slayer/product-assets/`

## Runtime service (Frontal Slayer website)

Implement using `shared/frontal-slayer-product-assets/runtime/productVisualAssets.ts` as reference:

- `getProductMasterHero(productId)`
- `getProductAssetBinding(surface, productId, slotId, variantKey)`
- `getBuildAWigVisualAsset(configuration)`
- `getProductVariantAsset(productId, variantKey, role)`

**No FAL at runtime.** Read ACTIVE approved bindings only.

## Binding states

- `PREVIEW` — Studio World preview only
- `ACTIVE` — customer-facing surfaces
- `SUPERSEDED` — history preserved

## Variant key format

Normalized pipe-delimited: `color=burgundy|length=24|part=middle|style=straight`
