/**
 * P0.VR.4R1 — Live acceptance types.
 */

export const P0_VR_4R1_LINEAGE = 'P0.VR.4R1' as const;

export const LIVE_ACCEPTANCE_FAILURE_CLASSES = [
  'LIVE_FAL_PROVIDER_BLOCKED',
  'LIVE_GENERATION_FAILED',
  'REFERENCE_NOT_SENT_TO_PROVIDER',
  'TRANSPARENCY_FAILED',
  'BACKGROUND_REMOVAL_FAILED',
  'MATERIAL_LOSS',
  'FOUNDER_APPROVAL_MISSING',
  'SUPABASE_UPLOAD_FAILED',
  'CANONICAL_REGISTRY_UPDATE_FAILED',
  'PROJECTS_HEADER_BIND_FAILED',
  'TEMP_PROVIDER_URL_IN_LIVE_UI',
  'LIVE_ASSET_NOT_RENDERING',
  'LIVE_CONTEXT_MISMATCH',
  'AUTH_UI_QA_BLOCKED',
] as const;

export type LiveAcceptanceFailureClass = (typeof LIVE_ACCEPTANCE_FAILURE_CLASSES)[number];

export type GenerationReceipt = {
  requestId: string;
  provider: string;
  model: string;
  startedAt: string;
  completedAt: string;
  dispatchCount: number;
  status: 'COMPLETED' | 'FAILED';
  outputUrl: string;
  promptVersion: number;
  referenceCropUrl: string;
  referenceCropChecksum?: string;
  gptImage2EditUsed: boolean;
  referencePassedToProvider: boolean;
};

export type BackgroundRemovalReceipt = {
  required: boolean;
  provider: string | null;
  model: string | null;
  requestId: string | null;
  resultUrl: string | null;
  reason: string;
};

export type MaterialPreservationQA = {
  transparentMaterialLoss: boolean;
  glowClipping: boolean;
  edgeErosion: boolean;
  chromeHalo: boolean;
  orbitBreakage: boolean;
  glassPreservation: boolean;
  glowPreservation: boolean;
  orbitEdgePreservation: boolean;
  overallPass: boolean;
};

export type LiveBindingSlotRecord = {
  slotId: string;
  projectId: string;
  pageId: string;
  route: string;
  componentPath: string;
  componentName: string;
  assetSlot: string;
  currentVersion: number;
  currentAssetUrl: string;
  currentStoragePath?: string;
  previousAssetUrl: string | null;
  previousStoragePath?: string | null;
  assetId: string;
  versions: Array<{
    version: number;
    url: string;
    storagePath?: string;
    assetId: string;
    boundAt: string;
  }>;
  updatedAt: string;
};

/** Persisted to repo — storage paths only (no host URLs in git). */
export type PersistedLiveBindingSlot = Omit<
  LiveBindingSlotRecord,
  'currentAssetUrl' | 'previousAssetUrl' | 'versions'
> & {
  currentStoragePath: string;
  previousStoragePath: string | null;
  versions: Array<{
    version: number;
    storagePath: string;
    assetId: string;
    boundAt: string;
  }>;
};

export type GoldenAcceptanceConditions = {
  referenceCropCreated: boolean;
  liveFalDispatch: boolean;
  gptImage2EditUsed: boolean;
  referencePassedToProvider: boolean;
  transparentAssetProduced: boolean;
  backgroundRemovalHandled: boolean;
  qaCompleted: boolean;
  founderApprovalRequired: boolean;
  supabaseUploadCompleted: boolean;
  canonicalRegistryUpdated: boolean;
  projectsHeaderBindingCompleted: boolean;
  liveProjectsPageUsesCanonicalAsset: boolean;
  liveScreenshotCaptured: boolean;
  contextQaCompleted: boolean;
  verified: boolean;
};

export type LiveAcceptanceResult = {
  passed: boolean;
  blocked: boolean;
  blocker: string | null;
  assetId: string | null;
  conditions: GoldenAcceptanceConditions;
  generationReceipt: GenerationReceipt | null;
  backgroundRemovalReceipt: BackgroundRemovalReceipt | null;
  materialQa: MaterialPreservationQA | null;
  supabasePath: string | null;
  canonicalUrl: string | null;
  binding: LiveBindingSlotRecord | null;
};
