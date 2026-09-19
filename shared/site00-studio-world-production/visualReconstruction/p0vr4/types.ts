/**
 * P0.VR.4 — Reference Asset Reconstruction Pipeline types.
 */

export const P0_VR_4_LINEAGE = 'P0.VR.4' as const;

export const DESIGN_RECONSTRUCTION_ASSET_TYPES = [
  'ICON',
  'NAV_ICON',
  'HERO_OBJECT',
  'DECORATIVE_OBJECT',
  'PROJECT_VISUAL',
  'ILLUSTRATION',
  'LOGO_MARK',
  'BADGE',
  'TEXTURE',
  'BACKGROUND_ELEMENT',
  'PRODUCT_VISUAL',
  'OTHER',
] as const;

export type DesignReconstructionAssetType = (typeof DESIGN_RECONSTRUCTION_ASSET_TYPES)[number];

export const DETECTION_CONFIDENCE_LEVELS = ['HIGH', 'MODERATE', 'LOW'] as const;
export type DetectionConfidenceLevel = (typeof DETECTION_CONFIDENCE_LEVELS)[number];

export const RECONSTRUCTION_ASSET_STATUSES = [
  'DETECTED',
  'SELECTED',
  'CROPPED',
  'CLASSIFIED',
  'READY_TO_GENERATE',
  'GENERATING',
  'GENERATED',
  'TRANSPARENCY_REVIEW',
  'BACKGROUND_REMOVAL',
  'QA_REQUIRED',
  'REVISION_REQUIRED',
  'AWAITING_FOUNDER_APPROVAL',
  'APPROVED',
  'PERSISTING',
  'PERSISTED',
  'BOUND',
  'LIVE_QA_REQUIRED',
  'VERIFIED',
  'REJECTED',
] as const;

export type ReconstructionAssetStatus = (typeof RECONSTRUCTION_ASSET_STATUSES)[number];

export const FOUNDER_JUDGMENT_VALUES = ['LOVE_IT', 'REGENERATE', 'REJECT', 'PENDING'] as const;
export type FounderJudgment = (typeof FOUNDER_JUDGMENT_VALUES)[number];

export const QA_VERDICTS = ['PASS', 'WARNING', 'FAIL'] as const;
export type QaVerdict = (typeof QA_VERDICTS)[number];

export const DESIGN_ASSET_RECONSTRUCTION_FAILURE_CLASSES = [
  'REFERENCE_CROP_INVALID',
  'ASSET_TYPE_AMBIGUOUS',
  'GENERATION_FAILED',
  'PROVIDER_UNAVAILABLE',
  'WRONG_SILHOUETTE',
  'WRONG_PROPORTIONS',
  'WRONG_COLOR',
  'WRONG_MATERIAL',
  'WRONG_ORIENTATION',
  'EXTRA_OBJECTS',
  'TEXT_CONTAMINATION',
  'BACKGROUND_PRESENT',
  'TRANSPARENCY_MISSING',
  'TRANSPARENT_MATERIAL_LOSS',
  'EDGE_EROSION',
  'GLOW_CLIPPING',
  'LIVE_BINDING_FAILED',
  'LIVE_CONTEXT_MISMATCH',
  'SUPABASE_UPLOAD_FAILED',
] as const;

export type DesignAssetReconstructionFailureClass = (typeof DESIGN_ASSET_RECONSTRUCTION_FAILURE_CLASSES)[number];

export const QA_DOMAINS = [
  'SILHOUETTE_MATCH',
  'PROPORTION_MATCH',
  'COLOR_MATCH',
  'MATERIAL_MATCH',
  'LIGHTING_MATCH',
  'ORIENTATION_MATCH',
  'DETAIL_MATCH',
  'EDGE_QUALITY',
  'TRANSPARENCY',
  'VISUAL_WEIGHT',
  'NO_EXTRA_OBJECTS',
  'NO_BACKGROUND',
  'NO_TEXT_CONTAMINATION',
  'REFERENCE_FIDELITY',
] as const;

export type QaDomain = (typeof QA_DOMAINS)[number];

export const CONTEXT_QA_DOMAINS = [
  'renderedSize',
  'position',
  'padding',
  'crop',
  'visualWeight',
  'contrast',
  'alignment',
  'referenceContextMatch',
  'mobileContextMatch',
  'desktopContextMatch',
] as const;

export type ContextQaDomain = (typeof CONTEXT_QA_DOMAINS)[number];

export const LIVE_UI_ROLES = [
  'PAGE_HEADER_HERO',
  'EVOLVE_TAB_ICON',
  'PROJECT_CARD_VISUAL',
  'NAV_ICON',
  'DECORATIVE',
  'OTHER',
] as const;

export type LiveUiRole = (typeof LIVE_UI_ROLES)[number];

export const DETECTION_CLASSIFICATIONS = [
  'ICON',
  'HERO_OBJECT',
  'DECORATIVE_OBJECT',
  'ILLUSTRATION',
  'PRODUCT_VISUAL',
  'PROJECT_VISUAL',
  'TEXTURE',
  'BACKGROUND_ELEMENT',
  'LOGO_MARK',
  'BADGE',
  '3D_OBJECT',
  'NAV_ICON',
  'DOM_UI',
  'DOM_TEXT',
  'OTHER',
] as const;

export type DetectionClassification = (typeof DETECTION_CLASSIFICATIONS)[number];

export type ApprovedScreenshotSource = {
  projectId: string;
  pageId: string;
  route: string;
  screenshotId: string;
  screenshotUrl: string;
  referenceVersion: string;
  approvedBy: string;
  approvalStatus: 'APPROVED' | 'DRAFT' | 'REJECTED';
};

export type ReferenceCropRegion = {
  sourceScreenshotId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  padding: number;
  cropUrl: string | null;
  cropVersion: number;
};

export type RawDetectionHint = {
  regionId: string;
  classification: DetectionClassification;
  bounds: { x: number; y: number; width: number; height: number };
  labelHint?: string;
  confidenceHint?: DetectionConfidenceLevel;
};

export type DetectedAssetRegion = {
  regionId: string;
  classification: DetectionClassification;
  confidence: DetectionConfidenceLevel;
  semanticName: string;
  bounds: { x: number; y: number; width: number; height: number };
  reconstructable: boolean;
  markedAsLiveUi: boolean;
  ignored: boolean;
};

export type TransparencyValidationResult = {
  alphaChannelPresent: boolean;
  backgroundConfidence: number;
  haloRisk: QaVerdict;
  edgeQuality: QaVerdict;
  semiTransparentMaterialPreserved: boolean;
  glowPreserved: boolean;
  transparentMaterialLoss: boolean;
  glowClipping: boolean;
  edgeErosion: boolean;
  chromeHalo: boolean;
  glassAlphaFailure: boolean;
  overallPass: boolean;
};

export type QaDomainResult = {
  domain: QaDomain;
  verdict: QaVerdict;
  score?: number;
  reason?: string;
  recommendedCorrection?: string;
};

export type DesignAssetReconstructionQA = {
  domains: QaDomainResult[];
  overallPass: boolean;
  revisionRequired: boolean;
  failureClasses: DesignAssetReconstructionFailureClass[];
};

export type ContextQaResult = {
  domain: ContextQaDomain;
  verdict: QaVerdict;
  reason?: string;
};

export type DesignAssetContextQA = {
  results: ContextQaResult[];
  overallPass: boolean;
};

export type PromptHistoryEntry = {
  promptVersion: number;
  promptText: string;
  founderEdit: boolean;
  qaCorrection: boolean;
  generationResult: 'SUCCESS' | 'FAIL' | 'PENDING';
  createdAt: string;
};

export type AssetStorageRecord = {
  bucket: string;
  path: string;
  mimeType: string;
  width: number;
  height: number;
  alpha: boolean;
  checksum: string;
  createdAt: string;
};

export type AssetVersionRecord = {
  versionId: string;
  versionNumber: number;
  supabaseUrl: string;
  storage: AssetStorageRecord;
  approvedAt: string;
  founderJudgment: FounderJudgment;
};

export type DesignAssetBinding = {
  bindingId: string;
  assetId: string;
  projectId: string;
  route: string;
  componentPath: string;
  componentName: string;
  assetSlot: string;
  previousAsset: string | null;
  currentAsset: string;
  bindingStatus: 'PENDING' | 'BOUND' | 'VERIFIED' | 'FAILED';
  boundAt: string | null;
  verifiedAt: string | null;
};

export type DesignReconstructionAsset = {
  assetId: string;
  projectId: string;
  pageId: string;
  route: string;
  semanticName: string;
  assetType: DesignReconstructionAssetType;
  liveUiRole: LiveUiRole | null;

  sourceDesignScreenshotId: string;
  referenceCropUrl: string | null;
  referenceCropRegion: ReferenceCropRegion | null;
  referenceVersion: string;

  reconstructionProvider: string;
  reconstructionModel: string;
  reconstructionPromptVersion: number;
  reconstructionRequestId: string | null;
  generatedAssetUrl: string | null;

  backgroundRemovalRequired: boolean;
  backgroundRemovalProvider: string | null;
  backgroundRemovalModel: string | null;
  backgroundRemovalRequestId: string | null;
  cleanedAssetUrl: string | null;

  status: ReconstructionAssetStatus;
  founderJudgment: FounderJudgment;

  qa: DesignAssetReconstructionQA | null;
  contextQa: DesignAssetContextQA | null;
  storage: AssetStorageRecord | null;
  binding: DesignAssetBinding | null;
  lineage: {
    sourceScreenshot: ApprovedScreenshotSource;
    promptHistory: PromptHistoryEntry[];
    dispatchCount: number;
    revisionCount: number;
  };

  createdAt: string;
  updatedAt: string;
};

export type DesignAssetRegistryEntry = {
  canonicalAssetId: string;
  projectId: string;
  pageId: string;
  route: string;
  semanticName: string;
  assetType: DesignReconstructionAssetType;
  currentVersion: number;
  versions: AssetVersionRecord[];
  supabaseUrl: string;
  sourceReference: ApprovedScreenshotSource;
  founderApproval: FounderJudgment;
  liveBindings: DesignAssetBinding[];
};

export type BulkQueueItem = {
  queueIndex: number;
  assetId: string;
  semanticName: string;
  assetType: DesignReconstructionAssetType;
  status: ReconstructionAssetStatus;
  ready: boolean;
};

export type ReconstructionDispatchResult = {
  assetId: string;
  status: ReconstructionAssetStatus;
  blocked: boolean;
  blockReason?: DesignAssetReconstructionFailureClass | string;
  dispatchCount: number;
  requestId: string | null;
  simulated: boolean;
};

export type SystemInspectorLineage = {
  referenceScreenshot: ApprovedScreenshotSource | null;
  crop: ReferenceCropRegion | null;
  assetType: DesignReconstructionAssetType | null;
  generationProvider: string | null;
  generationModel: string | null;
  generationRequestId: string | null;
  backgroundRemovalProvider: string | null;
  qa: DesignAssetReconstructionQA | null;
  founderJudgment: FounderJudgment | null;
  supabasePath: string | null;
  liveBinding: DesignAssetBinding | null;
  liveQa: DesignAssetContextQA | null;
  dispatchCount: number;
};
