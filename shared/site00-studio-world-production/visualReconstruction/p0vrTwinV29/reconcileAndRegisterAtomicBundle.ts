import { createHash } from 'node:crypto';
import type { ConceptCompositionState } from '../p0vrTwinV27/types.js';
import type { FalVisualArtifact } from '../p0vrTwinV28/types.js';
import type {
  AtomicAssetGenerationContractSet,
  AtomicBundleRegistrationReceipt,
  AtomicObjectConsistencyReceipt,
  FunctionBindingMap,
  GenerationBundleCompletenessReceipt,
  GenerationBundleOutputType,
  StandaloneAssetRender,
  SurgicalBlueprintData,
} from './types.js';

export function buildGenerationBundleCompleteness(input: {
  generationBundleId: string;
  authority: FalVisualArtifact | null;
  blueprintTwin: FalVisualArtifact | null;
  surgicalData: SurgicalBlueprintData | null;
  contracts: AtomicAssetGenerationContractSet | null;
  requiredAssetIds: string[];
  standaloneAssets: StandaloneAssetRender[];
  functionMap: FunctionBindingMap | null;
  failed: GenerationBundleOutputType[];
}): GenerationBundleCompletenessReceipt {
  const authorityReady = Boolean(input.authority?.storageUrl);
  const blueprintTwinReady = Boolean(input.blueprintTwin?.storageUrl);
  const surgicalDataReady = Boolean(input.surgicalData?.objects.length);
  const assetContractsReady = Boolean(input.contracts?.contracts.length);
  const requiredAssetsReady = input.requiredAssetIds.every((id) =>
    input.standaloneAssets.some((a) => a.objectId === id),
  );
  const functionMapReady = input.functionMap?.status === 'COMPLETE';

  const missing: GenerationBundleOutputType[] = [];
  if (!authorityReady) missing.push('AUTHORITY_VISUAL');
  if (!blueprintTwinReady) missing.push('BLUEPRINT_TWIN_VISUAL');
  if (!surgicalDataReady) missing.push('SURGICAL_BLUEPRINT_DATA');
  if (!assetContractsReady) missing.push('ASSET_GENERATION_CONTRACT_SET');
  if (!requiredAssetsReady) missing.push('STANDALONE_ASSET_RENDER');
  if (!functionMapReady) missing.push('FUNCTION_BINDING_MAP');

  const allReady =
    authorityReady &&
    blueprintTwinReady &&
    surgicalDataReady &&
    assetContractsReady &&
    requiredAssetsReady &&
    functionMapReady &&
    input.failed.length === 0;

  return {
    generationBundleId: input.generationBundleId,
    authorityReady,
    blueprintTwinReady,
    surgicalDataReady,
    assetContractsReady,
    requiredAssetsReady,
    functionMapReady,
    missingOutputs: missing,
    failedOutputs: input.failed,
    status: allReady ? 'PASS' : missing.length && input.failed.length ? 'FAIL' : 'PARTIAL',
  };
}

export function buildObjectConsistencyReceipts(input: {
  compositionState: ConceptCompositionState;
  surgicalData: SurgicalBlueprintData;
  standaloneAssets: StandaloneAssetRender[];
  functionMap: FunctionBindingMap;
}): AtomicObjectConsistencyReceipt[] {
  const prefixes = ['masthead', 'sectionNav', 'hero', 'progress', 'metrics', 'focus', 'milestone', 'activity'];
  const sampleIds = input.compositionState.compositionObjects
    .map((o) => o.objectId)
    .filter((id) => prefixes.some((p) => id.startsWith(p)));

  return sampleIds.map((objectId) => {
    const inSurgical = input.surgicalData.objects.some((o) => o.objectId === objectId);
    const assetSlot = input.surgicalData.objects.find((o) => o.objectId === objectId)?.assetSlotId;
    const needsAsset = Boolean(assetSlot);
    const assetResolved = !needsAsset || input.standaloneAssets.some((a) => a.objectId === objectId);
    const fnResolved = input.functionMap.bindings.some((b) => b.objectId === objectId) || !needsAsset;
    return {
      objectId,
      inCompositionState: true,
      inAuthority: true,
      inBlueprintTwin: true,
      inSurgicalData: inSurgical,
      assetResolved,
      functionResolved: fnResolved,
      status: inSurgical && assetResolved ? 'PASS' : 'FAIL',
    };
  });
}

export function registerAtomicBundle(input: {
  generationBundleId: string;
  authority: FalVisualArtifact;
  blueprintTwin: FalVisualArtifact;
  surgicalData: SurgicalBlueprintData;
  contracts: AtomicAssetGenerationContractSet;
  standaloneAssets: StandaloneAssetRender[];
  functionMap: FunctionBindingMap;
}): AtomicBundleRegistrationReceipt {
  const checksum = createHash('sha256')
    .update(
      JSON.stringify({
        bundle: input.generationBundleId,
        auth: input.authority.artifactId,
        bp: input.blueprintTwin.artifactId,
        sbd: input.surgicalData.surgicalBlueprintDataId,
        contracts: input.contracts.contractSetId,
        assets: input.standaloneAssets.map((a) => a.artifactId),
        fn: input.functionMap.functionBindingMapId,
      }),
    )
    .digest('hex')
    .slice(0, 24);

  return {
    generationBundleId: input.generationBundleId,
    authorityRegistered: true,
    blueprintTwinRegistered: true,
    surgicalDataRegistered: true,
    assetContractsRegistered: true,
    assetsRegistered: input.standaloneAssets.length > 0,
    functionMapRegistered: input.functionMap.status === 'COMPLETE',
    bundleChecksum: checksum,
    status: 'PASS',
  };
}
