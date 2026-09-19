/**
 * Explainable lifecycle transitions — evidence, not canon.
 */

import type { CreativeValue, ProductionDestiny } from './assetLifecycleDimensions.js';

export const ASSET_LIFECYCLE_EVENT_KINDS = [
  'FOUNDER_LOVED_ASSET',
  'FOUNDER_REQUESTED_REVISION',
  'REVISION_SPEC_CREATED',
  'REVISION_SPEC_APPROVED',
  'REVISION_GENERATED',
  'REVISION_ACCEPTED',
  'ASSET_EXCLUDED_FROM_BRAND',
  'ASSET_MARKED_PRODUCTION_CANDIDATE',
  'ASSET_SELECTED_FOR_LAUNCH',
  'LAUNCH_SEED_REVIEW_REQUIRED',
  'WORLD_PROMOTED',
  'ASSET_TRANSLATED',
  'CONCEPT_SALVAGED',
  'FOUNDER_REJECTED_FOR_BRAND',
  'REVISION_CHILD_CREATED',
] as const;

export type AssetLifecycleEventKind = (typeof ASSET_LIFECYCLE_EVENT_KINDS)[number];

export type AssetLifecycleEvent = {
  eventId: string;
  assetId: string;
  brandSlug: string;
  kind: AssetLifecycleEventKind;
  creativeValue: CreativeValue | null;
  productionDestiny: ProductionDestiny | null;
  detail: string | null;
  createdAt: string;
};

export function eventKindForCreativeValue(value: CreativeValue): AssetLifecycleEventKind | null {
  if (value === 'LOVE_IT') return 'FOUNDER_LOVED_ASSET';
  if (value === 'PROMISING_REFINE' || value === 'REVISE') return 'FOUNDER_REQUESTED_REVISION';
  if (value === 'NOT_FOR_ME') return 'FOUNDER_REJECTED_FOR_BRAND';
  return null;
}
