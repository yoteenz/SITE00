/**
 * P0.PAF.2 — Resolver test before ACTIVE binding activation.
 */

import { getVisualAssetRecord } from './bindingStore.js';
import type { FsBindingSurface } from '../../../frontal-slayer-product-assets/contract/types.js';
import { P0_PAF_2_FAILURE_CODES } from './constants.js';

export type ResolverTestResult = {
  passed: boolean;
  expectedAssetId: string;
  resolvedAssetId: string | null;
  failureCode: string | null;
};

export function runResolverTest(input: {
  surface: FsBindingSurface;
  productId: string;
  slotId: string;
  variantKey: string;
  expectedAssetId: string;
}): ResolverTestResult {
  const asset = getVisualAssetRecord(input.expectedAssetId);
  if (!asset) {
    return {
      passed: false,
      expectedAssetId: input.expectedAssetId,
      resolvedAssetId: null,
      failureCode: 'FAIL_PRODUCT_ASSET_NOT_PERSISTED',
    };
  }

  if (asset.productId !== input.productId) {
    return {
      passed: false,
      expectedAssetId: input.expectedAssetId,
      resolvedAssetId: asset.id,
      failureCode: 'FAIL_VARIANT_KEY_RESOLUTION',
    };
  }

  if (asset.variantKey !== input.variantKey) {
    return {
      passed: false,
      expectedAssetId: input.expectedAssetId,
      resolvedAssetId: asset.id,
      failureCode: 'FAIL_VARIANT_KEY_RESOLUTION',
    };
  }

  if (asset.publicUrl.includes('fal.media') || asset.publicUrl.includes('fal.ai')) {
    return {
      passed: false,
      expectedAssetId: input.expectedAssetId,
      resolvedAssetId: asset.id,
      failureCode: 'FAIL_FAL_URL_USED_AS_CANONICAL_ASSET',
    };
  }

  if (asset.canonStatus !== 'CANON' && asset.status !== 'APPROVED') {
    return {
      passed: false,
      expectedAssetId: input.expectedAssetId,
      resolvedAssetId: asset.id,
      failureCode: 'FAIL_UNAPPROVED_ASSET_BOUND_LIVE',
    };
  }

  return {
    passed: true,
    expectedAssetId: input.expectedAssetId,
    resolvedAssetId: asset.id,
    failureCode: null,
  };
}

export function resolverFailureCodes(): readonly string[] {
  return P0_PAF_2_FAILURE_CODES;
}
