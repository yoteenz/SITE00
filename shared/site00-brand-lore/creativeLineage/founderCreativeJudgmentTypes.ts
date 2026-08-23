/**
 * Founder creative judgment — durable events + brand-scoped disposition.
 */

export const FOUNDER_CREATIVE_ACTIONS = ['LOVE_IT', 'PROMISING_REFINE', 'REVISE', 'NOT_FOR_ME'] as const;
export type FounderCreativeAction = (typeof FOUNDER_CREATIVE_ACTIONS)[number];

/** Legacy alias — maps to PROMISING_REFINE creative value */
export type FounderCreativeActionInput = FounderCreativeAction | null;

export function normalizeFounderAction(action: FounderCreativeActionInput | 'NOT_NDXBOOK'): FounderCreativeAction | null {
  if (action === 'NOT_NDXBOOK') return 'NOT_FOR_ME';
  return action;
}

export function isRevisionCreativeAction(action: FounderCreativeAction | null): boolean {
  return action === 'PROMISING_REFINE' || action === 'REVISE';
}

export const BRAND_ASSET_DISPOSITIONS = [
  'ACTIVE',
  'LOVED',
  'REVISION_PENDING',
  'REJECTED_FOR_BRAND',
  'RETIRED_FOR_BRAND',
  'CANON_CANDIDATE',
] as const;
export type BrandAssetDisposition = (typeof BRAND_ASSET_DISPOSITIONS)[number];

export const CROSS_BRAND_REUSE_ELIGIBILITIES = [
  'NOT_EVALUATED',
  'IDEA_POTENTIAL',
  'VISUAL_DEVICE_POTENTIAL',
  'COMPOSITION_POTENTIAL',
  'MOTION_POTENTIAL',
  'NOT_REUSABLE',
] as const;
export type CrossBrandReuseEligibility = (typeof CROSS_BRAND_REUSE_ELIGIBILITIES)[number];

export type FounderJudgmentHistoryEntry = {
  judgmentId: string;
  founderAction: FounderCreativeAction;
  previousJudgment: FounderCreativeAction | null;
  judgmentReason: string | null;
  createdAt: string;
};

export type FounderCreativeJudgment = {
  judgmentId: string;
  assetId: string;
  brandSlug: string;
  projectId: string;
  directionId: string;
  worldId: string;
  founderAction: FounderCreativeAction;
  previousJudgment: FounderCreativeAction | null;
  judgmentReason: string | null;
  judgmentHistory: FounderJudgmentHistoryEntry[];
  createdAt: string;
  updatedAt: string;
};

export type BrandAssetDispositionRecord = {
  dispositionId: string;
  assetId: string;
  brandSlug: string;
  projectId: string;
  brandDisposition: BrandAssetDisposition;
  crossBrandReuseEligibility: CrossBrandReuseEligibility;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
};

export function dispositionForAction(action: FounderCreativeAction): BrandAssetDisposition {
  if (action === 'LOVE_IT') return 'LOVED';
  if (isRevisionCreativeAction(action)) return 'REVISION_PENDING';
  return 'REJECTED_FOR_BRAND';
}

export function crossBrandEligibilityForAction(action: FounderCreativeAction): CrossBrandReuseEligibility {
  if (action === 'NOT_FOR_ME') return 'NOT_EVALUATED';
  return 'NOT_EVALUATED';
}
