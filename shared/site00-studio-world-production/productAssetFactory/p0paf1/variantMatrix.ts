/**
 * P0.PAF.1 — Product variant matrix + cost preview.
 */

import { ESTIMATED_COST_PER_VARIANT_USD, ESTIMATED_STORAGE_MB_PER_VARIANT } from './constants.js';
import { expandSelectionToCombinations } from './configurationGraph.js';
import { buildConfigurationHash } from './storagePaths.js';
import { checkDuplicateVariant } from './assetRecordRegistry.js';
import type {
  FactoryMode,
  ProductVariantKey,
  ProductVariantMatrixPreview,
  VariantSelection,
  VariationAxis,
} from './types.js';

export function buildVariantKey(input: {
  masterHeroId: string;
  axes: Record<string, string>;
  mode: FactoryMode;
}): ProductVariantKey {
  const configurationHash = buildConfigurationHash(input.axes);
  const keyParts = Object.keys(input.axes)
    .sort()
    .map((k) => `${k.toLowerCase()}=${input.axes[k]}`)
    .join(';');
  return {
    key: input.mode === 'BUILD_A_WIG' ? `BAW:${keyParts}` : `PDP:${keyParts}`,
    masterHeroId: input.masterHeroId,
    axes: input.axes,
    configurationHash,
    mode: input.mode,
  };
}

export function buildPdpVariantKey(input: {
  productId: string;
  heroRole: string;
  variantType: string;
  variantValue: string;
  masterHeroId: string;
}): ProductVariantKey {
  const axes = {
    productId: input.productId,
    heroRole: input.heroRole,
    variantType: input.variantType,
    variantValue: input.variantValue,
  };
  return buildVariantKey({ masterHeroId: input.masterHeroId, axes, mode: 'PRODUCT_PAGE' });
}

export function computeVariantMatrixPreview(input: {
  masterHeroId: string;
  mode: FactoryMode;
  selection: VariantSelection;
  axes: VariationAxis[];
  backgroundRemoval?: boolean;
}): ProductVariantMatrixPreview {
  const activeAxes = input.axes.filter((a) => (input.selection[a]?.length ?? 0) > 0);
  const combos = expandSelectionToCombinations(input.selection, activeAxes);
  const variants = combos.map((combo) =>
    buildVariantKey({ masterHeroId: input.masterHeroId, axes: combo, mode: input.mode }),
  );

  let duplicateCount = 0;
  for (const v of variants) {
    const dup = checkDuplicateVariant(input.masterHeroId, v.configurationHash);
    if (dup.exists) duplicateCount += 1;
  }

  const possible = cartesianCount(input.selection, activeAxes);
  const assetCount = variants.length - duplicateCount;
  const costMultiplier = input.backgroundRemoval ? 1.15 : 1;

  return {
    selectedAxes: activeAxes,
    possibleCombinations: possible,
    validCombinations: combos.length,
    duplicateCount,
    assetCount,
    variants,
    estimatedFalRequests: assetCount,
    estimatedCostUsd: Number((assetCount * ESTIMATED_COST_PER_VARIANT_USD * costMultiplier).toFixed(2)),
    estimatedStorageMb: Number((assetCount * ESTIMATED_STORAGE_MB_PER_VARIANT).toFixed(1)),
  };
}

function cartesianCount(selection: VariantSelection, axes: VariationAxis[]): number {
  if (axes.length === 0) return 0;
  return axes.reduce((acc, axis) => acc * (selection[axis]?.length ?? 0), 1);
}

export function formatVariantKeyForDisplay(variantKey: ProductVariantKey): string {
  return Object.entries(variantKey.axes)
    .map(([k, v]) => `${k}=${v}`)
    .join(' · ');
}
