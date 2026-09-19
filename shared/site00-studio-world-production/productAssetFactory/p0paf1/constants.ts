/**
 * P0.PAF.1 — Product Asset Factory constants.
 */

import { P0_PAF_1_LINEAGE } from './types.js';

export { P0_PAF_1_LINEAGE };

export const PRODUCT_ASSET_FACTORY_ROUTE = '/projects/frontal-slayer/product-assets';

export const FRONTAL_SLAYER_PROJECT_ID = 'frontal-slayer';
export const FRONTAL_SLAYER_BRAND_ID = 'frontal-slayer';

/** Read-only six-unit visual canon — does NOT mutate commerce catalog. */
export const FRONTAL_SLAYER_SIX_UNIT_VISUAL_CANON = [
  { productId: 'noir', displayName: 'NOIR', familyId: 'frontal-slayer-signature', commerceMutationBlocked: true },
  { productId: 'signature-unit-02', displayName: 'SIGNATURE UNIT 02', familyId: 'frontal-slayer-signature', commerceMutationBlocked: true },
  { productId: 'signature-unit-03', displayName: 'SIGNATURE UNIT 03', familyId: 'frontal-slayer-signature', commerceMutationBlocked: true },
  { productId: 'signature-unit-04', displayName: 'SIGNATURE UNIT 04', familyId: 'frontal-slayer-signature', commerceMutationBlocked: true },
  { productId: 'signature-unit-05', displayName: 'SIGNATURE UNIT 05', familyId: 'frontal-slayer-signature', commerceMutationBlocked: true },
  { productId: 'signature-unit-06', displayName: 'SIGNATURE UNIT 06', familyId: 'frontal-slayer-signature', commerceMutationBlocked: true },
] as const;

export const DEFAULT_LOCKED_ATTRIBUTES = {
  mannequinIdentity: true,
  silhouette: true,
  density: true,
  laceArchitecture: true,
  capProportions: true,
  hairlinePosition: true,
  cameraAngle: true,
  cameraDistance: true,
  pose: true,
  framing: true,
  lightingFamily: true,
  shadowBehavior: true,
  productScale: true,
  background: true,
} as const;

export const BUILD_A_WIG_DEFAULT_AXES: readonly string[] = ['COLOR', 'STYLE', 'TEXTURE', 'PART', 'LENGTH', 'FINISH'];

export const FAL_PRODUCT_PROVIDER_CAPABILITIES = {
  hairColorEdit: { provider: 'fal', model: 'fal-ai/flux-pro/kontext', task: 'HAIR_COLOR_EDIT' },
  hairStyleEdit: { provider: 'fal', model: 'fal-ai/flux-pro/kontext', task: 'HAIR_STYLE_EDIT' },
  textureEdit: { provider: 'fal', model: 'fal-ai/flux-pro/kontext', task: 'TEXTURE_EDIT' },
  backgroundRemoval: { provider: 'fal', model: 'fal-ai/bria/background/remove', task: 'BACKGROUND_REMOVAL' },
  multiReferenceEdit: { provider: 'fal', model: 'fal-ai/flux-pro/kontext/max/multi', task: 'MULTI_REFERENCE_EDIT' },
  productFidelity: { provider: 'fal', model: 'fal-ai/flux-pro/kontext', task: 'PRODUCT_FIDELITY' },
  transparency: { provider: 'fal', model: 'fal-ai/bria/background/remove', task: 'TRANSPARENCY' },
} as const;

export const DEFAULT_CONCURRENCY_POLICY = {
  maxConcurrentRequests: 4,
  providerRateLimit: 10,
  projectBudgetLimitUsd: 50,
  retryLimit: 2,
  backoffMs: 1500,
  priority: 'NORMAL' as const,
};

export const ESTIMATED_COST_PER_VARIANT_USD = 0.06;
export const ESTIMATED_STORAGE_MB_PER_VARIANT = 2.5;
export const PROMPT_VERSION_CANON = 1;

export const CANVAS_LOCK = {
  width: 1024,
  height: 1280,
  subjectScale: 1,
  headPositionY: 0.22,
} as const;
