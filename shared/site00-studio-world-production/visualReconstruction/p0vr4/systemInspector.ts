/**
 * P0.VR.4 — System Inspector lineage exposure.
 */

import { getReconstructionAsset } from './assetStore.js';
import { getDesignAssetRegistryEntry } from './designAssetRegistry.js';
import type { SystemInspectorLineage } from './types.js';

export function buildSystemInspectorLineage(assetId: string): SystemInspectorLineage {
  const asset = getReconstructionAsset(assetId);
  const registry = getDesignAssetRegistryEntry(assetId);

  if (!asset) {
    return {
      referenceScreenshot: null,
      crop: null,
      assetType: null,
      generationProvider: null,
      generationModel: null,
      generationRequestId: null,
      backgroundRemovalProvider: null,
      qa: null,
      founderJudgment: null,
      supabasePath: registry?.versions[registry.versions.length - 1]?.storage.path ?? null,
      liveBinding: null,
      liveQa: null,
      dispatchCount: 0,
    };
  }

  return {
    referenceScreenshot: asset.lineage.sourceScreenshot,
    crop: asset.referenceCropRegion,
    assetType: asset.assetType,
    generationProvider: asset.reconstructionProvider,
    generationModel: asset.reconstructionModel,
    generationRequestId: asset.reconstructionRequestId,
    backgroundRemovalProvider: asset.backgroundRemovalProvider,
    qa: asset.qa,
    founderJudgment: asset.founderJudgment,
    supabasePath: asset.storage?.path ?? registry?.versions[registry.versions.length - 1]?.storage.path ?? null,
    liveBinding: asset.binding,
    liveQa: asset.contextQa,
    dispatchCount: asset.lineage.dispatchCount,
  };
}

export function systemInspectorExposesLineage(assetId: string): boolean {
  const lineage = buildSystemInspectorLineage(assetId);
  return (
    lineage.referenceScreenshot !== undefined &&
    lineage.dispatchCount !== undefined &&
    'generationModel' in lineage
  );
}
