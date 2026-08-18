export type AssetStatus =
  | 'QUEUED'
  | 'GENERATING'
  | 'NEEDS_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'REGENERATING'
  | 'VARIANT_REQUESTED'
  | 'LOCKED'
  | 'FAILED';

export type BatchStatus =
  | 'DRAFT'
  | 'QUEUED'
  | 'GENERATING'
  | 'IN_REVIEW'
  | 'PARTIALLY_APPROVED'
  | 'READY_TO_LOCK'
  | 'LOCKED'
  | 'FAILED';

export type ReviewAction =
  | 'GENERATED'
  | 'APPROVE'
  | 'REJECT'
  | 'REGENERATE'
  | 'REQUEST_VARIANT'
  | 'NOTE'
  | 'LOCK'
  | 'BATCH_LOCKED';

export type CorrectionCategory = 'GEOMETRY' | 'CAMERA' | 'LIGHTING' | 'MATERIAL' | 'COLOR' | 'DETAIL' | 'OTHER';

export type Site00BatchManifest = {
  batchKey: string;
  displayName: string;
  description?: string;
  category: string;
  masterPrompt: string;
  promptVersion: string;
  aspectRatio: string;
  outputFormat: 'webp' | 'png';
  model?: string;
  assets: Site00ManifestAsset[];
  /** Sequential vault lineage: library master → reference-conditioned children. */
  useVaultLineage?: boolean;
  /** All derivatives reference locked founder canonical master PNG — no T2I fallback. */
  useCanonicalReference?: boolean;
  worldIdentity?: string;
  /** Always queue new versions (replacement batch). */
  forceNewVersion?: boolean;
  replacementBatch?: boolean;
};

export type Site00ManifestAsset = {
  assetKey: string;
  displayName: string;
  semanticSlotKey: string;
  compositionPrompt: string;
  required: boolean;
  variant?: string;
  view?: string;
  generationOrder?: number;
  environmentRole?: 'library' | 'batchReview' | 'inspection';
  environmentRoleLabel?: string;
  environmentRoleSublabel?: string;
  canonicalSlotAlias?: string;
  requiresVaultReference?: boolean;
  requiresCanonicalReference?: boolean;
  viewType?: 'libraryHero' | 'batchReview' | 'inspectionBay' | string;
};

export type ProductionAssetResolution = {
  slotKey: string;
  source: 'locked' | 'fallback';
  url: string | null;
  thumbnailUrl?: string | null;
  versionId?: string;
  assetId?: string;
};
