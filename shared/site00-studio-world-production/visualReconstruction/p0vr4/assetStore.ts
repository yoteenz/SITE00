/**
 * P0.VR.4 — In-memory asset store for reconstruction pipeline.
 */

import type {
  ApprovedScreenshotSource,
  DesignReconstructionAsset,
  DetectedAssetRegion,
  FounderJudgment,
  ReconstructionAssetStatus,
} from './types.js';

const assetStore = new Map<string, DesignReconstructionAsset>();

export function clearReconstructionAssetStoreForTest(): void {
  assetStore.clear();
}

export function getReconstructionAsset(assetId: string): DesignReconstructionAsset | null {
  return assetStore.get(assetId) ?? null;
}

export function listReconstructionAssets(filter?: {
  projectId?: string;
  pageId?: string;
  status?: ReconstructionAssetStatus;
}): DesignReconstructionAsset[] {
  let items = [...assetStore.values()];
  if (filter?.projectId) items = items.filter((a) => a.projectId === filter.projectId);
  if (filter?.pageId) items = items.filter((a) => a.pageId === filter.pageId);
  if (filter?.status) items = items.filter((a) => a.status === filter.status);
  return items;
}

export function upsertReconstructionAsset(asset: DesignReconstructionAsset): DesignReconstructionAsset {
  assetStore.set(asset.assetId, asset);
  return asset;
}

export function updateReconstructionAsset(
  assetId: string,
  patch: Partial<DesignReconstructionAsset>,
): DesignReconstructionAsset | null {
  const existing = assetStore.get(assetId);
  if (!existing) return null;
  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  assetStore.set(assetId, updated);
  return updated;
}

export function setFounderJudgment(assetId: string, judgment: FounderJudgment): DesignReconstructionAsset | null {
  const asset = assetStore.get(assetId);
  if (!asset) return null;
  const status: ReconstructionAssetStatus =
    judgment === 'LOVE_IT' ? 'APPROVED' : judgment === 'REJECT' ? 'REJECTED' : asset.status;
  return updateReconstructionAsset(assetId, { founderJudgment: judgment, status });
}

export function createAssetFromDetection(input: {
  source: ApprovedScreenshotSource;
  region: DetectedAssetRegion;
  assetType: DesignReconstructionAsset['assetType'];
  liveUiRole: DesignReconstructionAsset['liveUiRole'];
  crop: DesignReconstructionAsset['referenceCropRegion'];
}): DesignReconstructionAsset {
  const now = new Date().toISOString();
  const asset: DesignReconstructionAsset = {
    assetId: `dra-${input.source.projectId}-${input.region.regionId}-${Date.now()}`,
    projectId: input.source.projectId,
    pageId: input.source.pageId,
    route: input.source.route,
    semanticName: input.region.semanticName,
    assetType: input.assetType,
    liveUiRole: input.liveUiRole,
    sourceDesignScreenshotId: input.source.screenshotId,
    referenceCropUrl: input.crop?.cropUrl ?? null,
    referenceCropRegion: input.crop,
    referenceVersion: input.source.referenceVersion,
    reconstructionProvider: 'fal',
    reconstructionModel: 'openai/gpt-image-2/edit',
    reconstructionPromptVersion: 1,
    reconstructionRequestId: null,
    generatedAssetUrl: null,
    backgroundRemovalRequired: false,
    backgroundRemovalProvider: null,
    backgroundRemovalModel: null,
    backgroundRemovalRequestId: null,
    cleanedAssetUrl: null,
    status: input.crop ? 'CROPPED' : 'DETECTED',
    founderJudgment: 'PENDING',
    qa: null,
    contextQa: null,
    storage: null,
    binding: null,
    lineage: {
      sourceScreenshot: input.source,
      promptHistory: [],
      dispatchCount: 0,
      revisionCount: 0,
    },
    createdAt: now,
    updatedAt: now,
  };
  return upsertReconstructionAsset(asset);
}
