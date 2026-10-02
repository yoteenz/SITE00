/**
 * Visual family model for SITE 00 / Studio OS assets.
 * Icon geometry for other families stays in their own registries.
 * This module records which family an asset belongs to and the rules a new asset must inherit.
 */

export const VISUAL_ASSET_CLASSES = [
  'LIVE_CODE_SVG',
  'BRAND_ICON',
  'SYSTEM_ICON',
  'NAV_ICON',
  'ACTION_ICON',
  'STATUS_ICON',
  'OBJECT_ICON',
  'PIPELINE_ICON',
  'MICRO_ASSET',
  'ILLUSTRATIVE_MICRO_ASSET',
  'TRANSPARENT_OBJECT',
  'FOREGROUND_IMAGE',
  'CARD_IMAGE',
  'ENVIRONMENT_IMAGE',
  'TEXTURE_MATERIAL',
  'PROJECT_MARK',
  'EXTERNAL_PLATFORM_ICON',
  'EXISTING_BRAND_ASSET',
] as const;

export type VisualAssetClass = (typeof VISUAL_ASSET_CLASSES)[number];

export const CANON_STATUSES = [
  'DRAFT',
  'CANDIDATE',
  'FOUNDER_REVIEW',
  'APPROVED',
  'CANONICAL',
  'SUPERSEDED',
  'ARCHIVED',
] as const;

export type CanonStatus = (typeof CANON_STATUSES)[number];

export type QaVerdict = 'PASS' | 'FAIL' | 'NEEDS_REVIEW';

export type VisualFamilySpec = {
  familyId: string;
  familyName: string;
  productOwner: string;
  surfaceScope: string;
  assetClass: VisualAssetClass;
  semanticPurpose: string;
  visualGrammar: string;
  geometricLanguage: string;
  materialLanguage: string;
  strokeRules: string;
  cornerRules: string;
  depthRules: string;
  lightingRules: string;
  colorRules: string;
  accentRules: string;
  negativeSpaceRules: string;
  boundingBoxRules: string;
  opticalScaleRules: string;
  activeStateRules: string;
  inactiveStateRules: string;
  hoverStateRules: string;
  alertStateRules: string;
  backgroundRules: string;
  transparencyRules: string;
  motionRules: string;
  referenceAssets: string[];
  canonicalExamples: string[];
  antiExamples: string[];
  version: string;
  status: CanonStatus;
  owner: string;
  lastApprovedAt: string | null;
  lineage: {
    primaryAuthority: string;
    secondaryAuthorities: string[];
    supersededExamples: string[];
    currentVersion: string;
  };
  geometryRules: {
    strokeWidth: number;
    linecap: 'butt' | 'round' | 'square';
    linejoin: 'miter' | 'round' | 'bevel';
    cornerMode: 'SHARP_MITER' | 'VOLUME_CAP' | 'PER_ICON_TRACE' | 'MIXED_UNRELATED';
    innerCoreRequired: boolean;
    bakedRed: boolean;
  };
  materialRules: string[];
  colorRulesList: string[];
  stateRules: string[];
  qaRules: string[];
};

export type VisualAssetMembership = {
  assetId: string;
  assetName: string;
  assetClass: VisualAssetClass;
  familyId: string;
  semanticRole: string;
  owner: string;
  source: string;
  authorityReference: string;
  derivedFrom: string | null;
  variantOf: string | null;
  state: 'BASE' | 'ACTIVE_HOST' | 'ALERT_HOST';
  viewportUsage: string;
  surfaceUsage: string;
  colorMode: 'CHARCOAL_MASTER' | 'HOST_TINT';
  canonStatus: CanonStatus;
  version: string;
  supersedes: string | null;
  supersededBy: string | null;
  file: string;
  notes: string;
};

export type FamilyQaCheck = {
  id: string;
  verdict: QaVerdict;
  detail: string;
};

export type IconInkMeasurement = {
  file: string;
  canvas: number;
  inkWidth: number;
  inkHeight: number;
  centerOfGravityX: number;
  centerOfGravityY: number;
  redPixels: number;
  occupancy: number;
};
