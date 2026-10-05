/**
 * P0.E.FT4 — Astral World visual asset contract types.
 * Project-scoped; does not auto-promote canon.
 */

export const ASTRAL_WORLD_PROJECT_ID = 'astral-world' as const;
export const AW_VISUAL_FOUNDATION_BATCH = 'AW_VISUAL_FOUNDATION_V1' as const;

export type AstralAssetLifecycleStatus =
  | 'MISSING'
  | 'CONTRACT_READY'
  | 'QUEUED'
  | 'PROCESSING'
  | 'GENERATED'
  | 'VALIDATING'
  | 'READY'
  | 'ACTIVE'
  | 'FAILED'
  | 'REVISION_REQUESTED'
  | 'SUPERSEDED'
  | 'REJECTED';

export type AstralAssetType =
  | 'CINEMATIC_ENVIRONMENT'
  | 'CHARACTER_PORTRAIT'
  | 'PRODUCT_ARTIFACT'
  | 'TAROT_CARD'
  | 'SOCIAL_SCENE';

export type AstralGenerationMode = 'TEXT_TO_IMAGE' | 'IMAGE_REFERENCE_EDIT';

export type AstralApprovalState = 'GENERATED' | 'READY_FOR_VISUAL_REVIEW' | 'APPROVED' | 'REJECTED';

export type AstralCanonState = 'CREATIVE_EXPLORATION' | 'FOUNDER_FAST_TRACK' | 'CANON';

export type AstralAssetClass =
  | 'CINEMATIC_ENVIRONMENT'
  | 'CHARACTER_PORTRAIT'
  | 'PRODUCT_ARTIFACT'
  | 'TAROT_CARD'
  | 'IMAGE_EDIT'
  | 'UPSCALE';

export type AstralGenerationReceipt = {
  receiptId: string;
  provider: 'fal';
  model: string;
  prompt: string;
  promptVersion: string;
  promptHash: string;
  inputReferenceUrls: string[];
  requestId: string;
  generationSettings: Record<string, unknown>;
  generatedAt: string;
  costUsd: number | null;
  parentAssetVersion: number | null;
  targetSlot: string;
  projectId: typeof ASTRAL_WORLD_PROJECT_ID;
};

export type VisualAssetContract = {
  assetContractId: string;
  projectId: typeof ASTRAL_WORLD_PROJECT_ID;
  worldScope: 'astral-world';
  districtScope: string | null;
  destinationScope: string | null;
  assetKey: string;
  assetType: AstralAssetType;
  role: string;
  targetSlot: string;
  referenceSources: string[];
  promptTemplateId: string;
  promptVersion: string;
  negativeConstraints: string[];
  aspectRatio: string;
  widthTarget: number;
  heightTarget: number;
  focalPoint: string;
  safeZones: string[];
  mobileBehavior: 'MOBILE_NATIVE' | 'DESKTOP_ONLY' | 'SHARED';
  desktopBehavior: 'DESKTOP_NATIVE' | 'MOBILE_ONLY' | 'SHARED';
  generationMode: AstralGenerationMode;
  assetClass: AstralAssetClass;
  priority: 'P0' | 'P1' | 'P2';
  batchId: typeof AW_VISUAL_FOUNDATION_BATCH;
};

export type AstralAssetRecord = {
  assetContractId: string;
  targetSlot: string;
  status: AstralAssetLifecycleStatus;
  version: number;
  approvalState: AstralApprovalState;
  canonState: AstralCanonState;
  outputUrl: string | null;
  storagePath: string | null;
  provider: 'fal' | null;
  model: string | null;
  requestId: string | null;
  generationReceipt: AstralGenerationReceipt | null;
  referenceCropKey: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  supersededByVersion: number | null;
};

export type ResolvedAstralAsset = {
  slotKey: string;
  source: 'ACTIVE' | 'READY' | 'REFERENCE' | 'FALLBACK';
  url: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  aspectRatio?: string;
};

export type AstralBatchStatus = {
  batchId: typeof AW_VISUAL_FOUNDATION_BATCH;
  total: number;
  missing: number;
  queued: number;
  processing: number;
  ready: number;
  active: number;
  failed: number;
};
