/**
 * P0.PAF.1 — Product Asset Factory types (Frontal Slayer master hero + variant matrix).
 */

export const P0_PAF_1_LINEAGE = 'P0.PAF.1' as const;

export const MASTER_HERO_TYPES = [
  'MANNEQUIN',
  'PRODUCT',
  'MODEL',
  'BUILD_A_WIG_BASE',
] as const;
export type MasterHeroType = (typeof MASTER_HERO_TYPES)[number];

export const MASTER_HERO_STATUSES = [
  'DRAFT',
  'ACTIVE_CANONICAL',
  'SUPERSEDED',
  'HISTORICAL',
] as const;
export type MasterHeroStatus = (typeof MASTER_HERO_STATUSES)[number];

export const BACKGROUND_MODES = [
  'KEEP_ORIGINAL',
  'REMOVE_BACKGROUND',
  'TRANSPARENT_CUTOUT',
  'WHITE_STUDIO',
] as const;
export type BackgroundMode = (typeof BACKGROUND_MODES)[number];

export const EDIT_REGIONS = [
  'HAIR',
  'LACE',
  'HAIRLINE',
  'FACE',
  'BODY',
  'OUTFIT',
  'BACKGROUND',
  'SHADOW',
  'ACCESSORIES',
] as const;
export type EditRegion = (typeof EDIT_REGIONS)[number];

export const VARIATION_AXES = ['COLOR', 'STYLE', 'TEXTURE', 'PART', 'LENGTH', 'FINISH'] as const;
export type VariationAxis = (typeof VARIATION_AXES)[number];

export const FACTORY_MODES = ['BUILD_A_WIG', 'PRODUCT_PAGE'] as const;
export type FactoryMode = (typeof FACTORY_MODES)[number];

export const BATCH_STATUSES = [
  'PLANNED',
  'COST_REVIEW',
  'QUEUED',
  'GENERATING',
  'PARTIAL',
  'READY_FOR_REVIEW',
  'APPROVED',
  'FAILED_PARTIAL',
  'CANCELLED',
] as const;
export type BatchStatus = (typeof BATCH_STATUSES)[number];

export const VARIANT_STATUSES = [
  'PENDING',
  'QUEUED',
  'GENERATING',
  'QA',
  'READY',
  'APPROVED',
  'REJECTED',
  'RETRYING',
  'FAILED',
] as const;
export type VariantStatus = (typeof VARIANT_STATUSES)[number];

export const QA_FAIL_CODES = [
  'FAIL_PRODUCT_IDENTITY_DRIFT',
  'FAIL_MANNEQUIN_DRIFT',
  'FAIL_CAMERA_DRIFT',
  'FAIL_SILHOUETTE_DRIFT',
  'FAIL_LACE_DRIFT',
  'FAIL_HAIRLINE_DRIFT',
  'FAIL_DENSITY_DRIFT',
  'FAIL_LENGTH_DRIFT',
  'FAIL_UNREQUESTED_STYLE_CHANGE',
  'FAIL_UNREQUESTED_COLOR_CHANGE',
  'FAIL_BACKGROUND_DRIFT',
  'FAIL_OUTFIT_DRIFT',
  'FAIL_VARIANT_TARGET_MISSED',
  'FAIL_ALPHA_HALO',
  'FAIL_HAIR_STRAND_CUTOUT',
  'FAIL_VARIANT_CANVAS_MISALIGNMENT',
  'FAIL_COLOR_BLEED',
  'FAIL_STRAND_DETAIL_LOST',
] as const;
export type QaFailCode = (typeof QA_FAIL_CODES)[number];

export type LockedAttributes = {
  mannequinIdentity: boolean;
  silhouette: boolean;
  density: boolean;
  laceArchitecture: boolean;
  capProportions: boolean;
  hairlinePosition: boolean;
  cameraAngle: boolean;
  cameraDistance: boolean;
  pose: boolean;
  framing: boolean;
  lightingFamily: boolean;
  shadowBehavior: boolean;
  productScale: boolean;
  background: boolean;
};

export type ProductMasterHero = {
  masterHeroId: string;
  projectId: string;
  brandId: string;
  productId: string;
  productFamilyId: string;
  sourceAssetId: string;
  storagePath: string;
  publicUrl: string;
  heroType: MasterHeroType;
  orientation: string;
  cameraAngle: string;
  crop: string;
  aspectRatio: number;
  backgroundMode: BackgroundMode;
  lockedAttributes: LockedAttributes;
  allowedVariationAxes: VariationAxis[];
  status: MasterHeroStatus;
  createdAt: string;
  approvedAt: string | null;
  supersedes: string | null;
};

export type ProductHeroDecomposition = {
  decompositionId: string;
  masterHeroId: string;
  subjectBounds: { x: number; y: number; width: number; height: number };
  hairBounds: { x: number; y: number; width: number; height: number };
  mannequinBounds: { x: number; y: number; width: number; height: number };
  background: string;
  camera: string;
  crop: string;
  lighting: string;
  shadow: string;
  hairLength: string;
  visibleTexture: string;
  visibleColor: string;
  parting: string;
  silhouette: string;
  occlusionZones: string[];
  safeEditingRegions: EditRegion[];
  derivedAt: string;
};

export type ProductEditRegionMap = {
  masterHeroId: string;
  regions: Record<
    EditRegion,
    {
      editable: boolean;
      lockedReason: string | null;
    }
  >;
};

export type ProductSubjectMask = {
  maskId: string;
  masterHeroId: string;
  storagePath: string;
  publicUrl: string;
  region: 'SUBJECT' | 'HAIR';
  reusedFromMaster: boolean;
  createdAt: string;
};

export type VariantSelection = Partial<Record<VariationAxis, string[]>>;

export type ProductVariantKey = {
  key: string;
  masterHeroId: string;
  axes: Record<string, string>;
  configurationHash: string;
  mode: FactoryMode;
};

export type ProductVariantMatrixPreview = {
  selectedAxes: VariationAxis[];
  possibleCombinations: number;
  validCombinations: number;
  duplicateCount: number;
  assetCount: number;
  variants: ProductVariantKey[];
  estimatedFalRequests: number;
  estimatedCostUsd: number;
  estimatedStorageMb: number;
};

export type CompiledProductVariantPrompt = {
  promptId: string;
  masterHeroId: string;
  variantKey: string;
  version: number;
  provider: string;
  model: string;
  promptText: string;
  inputReferenceImages: string[];
  imageReferencePrimary: boolean;
  textToImagePrimary: boolean;
  styleReferenceUrl: string | null;
  backgroundMode: BackgroundMode;
  lockedAttributes: LockedAttributes;
  targetVariation: Record<string, string>;
  compiledAt: string;
};

export type ProductVariantBatch = {
  batchId: string;
  projectId: string;
  productId: string;
  masterHeroId: string;
  mode: FactoryMode;
  status: BatchStatus;
  backgroundMode: BackgroundMode;
  selectedAxes: VariationAxis[];
  totalVariants: number;
  completedVariants: number;
  failedVariants: number;
  estimatedCostUsd: number;
  founderConfirmed: boolean;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
};

export type ProductVariantRecord = {
  variantId: string;
  batchId: string;
  masterHeroId: string;
  variantKey: ProductVariantKey;
  status: VariantStatus;
  promptId: string | null;
  provider: string | null;
  model: string | null;
  falTemporaryUrl: string | null;
  assetRecordId: string | null;
  qaStatus: 'PASS' | 'FAIL' | 'PENDING';
  qaFailures: QaFailCode[];
  retryCount: number;
  createdAt: string;
  completedAt: string | null;
};

export type ProductVisualAssetRecord = {
  assetId: string;
  projectId: string;
  productId: string;
  masterHeroId: string;
  variantKey: string;
  batchId: string;
  role: 'MASTER' | 'VARIANT' | 'DELIVERY_DERIVATIVE';
  variationAxes: Record<string, string>;
  variationValues: Record<string, string>;
  provider: string;
  model: string;
  promptVersion: number;
  storageBucket: string;
  storagePath: string;
  resolvedUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  backgroundMode: BackgroundMode;
  hasAlpha: boolean;
  status: 'GENERATED' | 'APPROVED' | 'REJECTED';
  qaStatus: 'PASS' | 'FAIL' | 'PENDING';
  canonStatus: 'PREVIEW' | 'CANON' | 'SUPERSEDED';
  createdAt: string;
  approvedAt: string | null;
  parentAssetId: string | null;
  supersedes: string | null;
  lineage: {
    masterHeroId: string;
    batchId: string;
    generationRunId: string;
  };
};

export type VariantGenerationConcurrencyPolicy = {
  maxConcurrentRequests: number;
  providerRateLimit: number;
  projectBudgetLimitUsd: number;
  retryLimit: number;
  backoffMs: number;
  priority: 'NORMAL' | 'HIGH';
};

export type ProductIdentityQaResult = {
  passed: boolean;
  failures: QaFailCode[];
  checks: Record<string, boolean>;
  colorMatch?: boolean;
  strandDetailPreserved?: boolean;
  alphaQuality?: boolean;
  canvasAligned?: boolean;
};

export type BatchProgressSummary = {
  batchId: string;
  total: number;
  ready: number;
  generating: number;
  queued: number;
  failed: number;
  pending: number;
};

export type DuplicateAssetCheck = {
  exists: boolean;
  existingAssetId: string | null;
  variantKey: string;
  canUseExisting: boolean;
};

export type ProductAssetFactoryNotification = {
  id: string;
  projectId: string;
  batchId: string;
  title: string;
  message: string;
  actionTarget: string;
  createdAt: string;
  partialFailure: boolean;
};
