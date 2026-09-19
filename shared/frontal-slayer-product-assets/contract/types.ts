/**
 * Cross-repo Frontal Slayer visual asset contract types (P0.PAF.2).
 * Studio World writes; Frontal Slayer website reads ACTIVE approved bindings.
 */

import type { FsVisualAssetContractVersion } from './version.js';

export const FS_BINDING_SURFACES = [
  'PRODUCT_PAGE',
  'BUILD_A_WIG',
  'SHOWROOM',
  'MOBILE_APP',
  'DESKTOP_MANSION',
  'CAMPAIGN',
] as const;
export type FsBindingSurface = (typeof FS_BINDING_SURFACES)[number];

export const FS_BINDING_STATES = ['PREVIEW', 'ACTIVE', 'SUPERSEDED'] as const;
export type FsBindingState = (typeof FS_BINDING_STATES)[number];

export const FS_ASSET_ROLES = [
  'MASTER',
  'PRIMARY_HERO',
  'VARIANT',
  'DELIVERY',
  'THUMBNAIL',
] as const;
export type FsAssetRole = (typeof FS_ASSET_ROLES)[number];

export type FrontalSlayerMasterHero = {
  id: string;
  productId: string;
  sourceAssetId: string;
  storagePath: string;
  publicUrl: string;
  heroType: string;
  backgroundMode: string;
  width: number;
  height: number;
  aspectRatio: number;
  lockedAttributes: Record<string, boolean>;
  allowedVariationAxes: string[];
  status: string;
  canonStatus: string;
  createdAt: string;
  approvedAt: string | null;
  supersedesId: string | null;
};

export type FrontalSlayerVisualAsset = {
  id: string;
  productId: string;
  masterHeroId: string;
  batchId: string | null;
  variantKey: string;
  surface: FsBindingSurface | null;
  role: FsAssetRole;
  colorId: string | null;
  styleId: string | null;
  textureId: string | null;
  length: string | null;
  part: string | null;
  finish: string | null;
  storagePath: string;
  publicUrl: string;
  deliveryUrl: string | null;
  thumbnailUrl: string | null;
  width: number;
  height: number;
  aspectRatio: number;
  backgroundMode: string;
  hasAlpha: boolean;
  provider: string | null;
  model: string | null;
  promptVersion: number | null;
  qaStatus: string;
  status: string;
  canonStatus: string;
  parentAssetId: string | null;
  supersedesId: string | null;
  createdAt: string;
  approvedAt: string | null;
  contractVersion: FsVisualAssetContractVersion;
};

export type FrontalSlayerAssetBinding = {
  id: string;
  surface: FsBindingSurface;
  productId: string;
  slotId: string;
  variantKey: string;
  assetId: string;
  bindingState: FsBindingState;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  supersededById: string | null;
};

export type FrontalSlayerBuildAWigVisualVariant = {
  id: string;
  masterHeroId: string;
  variantKey: string;
  configurationJson: Record<string, string>;
  assetId: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FrontalSlayerVariantKey = {
  key: string;
  axes: Record<string, string>;
  configurationSlug: string;
};

export type ResolvedProductAsset = {
  asset: FrontalSlayerVisualAsset;
  binding: FrontalSlayerAssetBinding | null;
  source: 'ACTIVE_BINDING' | 'MASTER_FALLBACK' | 'LEGACY_FALLBACK';
  publicUrl: string;
};
