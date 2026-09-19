import type { ConceptGeneratedAsset } from '../p0vrTwinV25/types.js';
import type { AssetGenerationContractSet, CanonicalAssetManifest } from './types.js';

export function buildCanonicalAssetManifestV27(input: {
  manifestId: string;
  compositionStateId: string;
  conceptId: string;
  conceptVersionId: string;
  contractSet: AssetGenerationContractSet;
  generatedAssets: ConceptGeneratedAsset[];
}): CanonicalAssetManifest {
  const contractBySlot = new Map(input.contractSet.contracts.map((c) => [c.assetSlotId, c]));
  const assets = input.generatedAssets.map((a) => {
    const contract = contractBySlot.get(a.assetSlotId);
    return {
      canonicalAssetId: contract?.canonicalAssetId ?? a.assetId,
      assetVersionId: `${a.assetId}-v1`,
      storageUrl: a.storageUrl,
      checksum: `sha256:${a.assetId}`,
      contentFingerprint: `fp-${a.blueprintObjectId}`,
      conceptId: input.conceptId,
      conceptVersionId: input.conceptVersionId,
      objectId: a.blueprintObjectId,
      assetSlotId: a.assetSlotId,
      generationContractId: contract?.assetGenerationContractId ?? null,
      transparentBackground: a.transparentBackground,
    };
  });

  const transparentAssetCount = assets.filter((a) => a.transparentBackground).length;
  return {
    manifestId: input.manifestId,
    conceptId: input.conceptId,
    conceptVersionId: input.conceptVersionId,
    compositionStateId: input.compositionStateId,
    assets,
    requiredAssetCount: input.contractSet.contracts.filter((c) => c.regenerationEligible).length,
    resolvedAssetCount: assets.length,
    regenerableAssetCount: input.contractSet.contracts.filter((c) => c.regenerationEligible).length,
    transparentAssetCount,
    status: assets.length >= input.contractSet.contracts.filter((c) => c.assetType.startsWith('GENERATED')).length ? 'PASS' : 'READY',
    checksum: `manifest-${input.conceptId}-${assets.length}`,
  };
}

export function simulateAssetRegenerationReceipt(input: {
  assetId: string;
  generationContractId: string;
}): import('./types.js').AssetRegenerationReceipt {
  return {
    assetId: input.assetId,
    oldAssetVersionId: `${input.assetId}-v1`,
    newAssetVersionId: `${input.assetId}-v2`,
    generationContractId: input.generationContractId,
    provider: 'fal',
    model: 'flux-pro',
    referenceInputs: [],
    visualSimilarity: 0.94,
    fingerprintMatch: true,
    purityStatus: 'PASS',
    accepted: true,
    status: 'PASS',
  };
}
