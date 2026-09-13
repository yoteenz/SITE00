import { buildNdxOverviewVisualObjectCatalog } from '../p0vrTwinV25/ndxOverviewObjectCatalog.js';
import { buildAssetGenerationContractSet } from '../p0vrTwinV27/buildAssetGenerationContractSet.js';
import type { ConceptCompositionState } from '../p0vrTwinV27/types.js';
import type { AtomicAssetGenerationContractSet } from './types.js';

export function buildAtomicAssetGenerationContractSet(input: {
  generationBundleId: string;
  compositionState: ConceptCompositionState;
}): AtomicAssetGenerationContractSet {
  const catalog = buildNdxOverviewVisualObjectCatalog();
  const base = buildAssetGenerationContractSet({
    compositionState: input.compositionState,
    assetObjects: catalog,
  });

  return {
    contractSetId: `aagcs-${input.generationBundleId}`,
    generationBundleId: input.generationBundleId,
    compositionStateId: input.compositionState.compositionStateId,
    conceptId: input.compositionState.conceptId,
    conceptVersionId: input.compositionState.conceptVersionId,
    contracts: base.contracts.map((c) => ({
      ...c,
      generationBundleId: input.generationBundleId,
      referenceVisualIds: [input.generationBundleId],
      approvedVisualTarget: c.objectId,
      visualFingerprint: `fp-${c.objectId}-v1`,
      cameraIntent: null,
    })),
    status: 'READY',
  };
}

/** Objects that require standalone FAL file renders (not DOM/CSS). */
export function listRequiredStandaloneAssetObjectIds(): string[] {
  return buildNdxOverviewVisualObjectCatalog()
    .filter((o) => o.assetSlotId && o.sourceType.startsWith('GENERATED'))
    .map((o) => o.objectId);
}
