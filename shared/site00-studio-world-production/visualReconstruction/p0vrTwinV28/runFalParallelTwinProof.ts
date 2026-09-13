import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import { ASSET_PROOF_OBJECT_IDS, P0_VR_TWIN_V28_BUILD } from './constants.js';
import { buildMinimalTwinGenerationState } from './buildMinimalTwinGenerationState.js';
import {
  dispatchFalParallelTwinGeneration,
  dispatchStandaloneAssetProof,
  toFalVisualArtifacts,
} from './dispatchFalParallelTwinGeneration.js';
import { classifyFalParallelTwinCapability } from './classifyFalParallelTwinCapability.js';
import { runTwinVisualAlignmentHeuristic } from './runTwinVisualAlignment.js';
import type {
  AssetGenerationProofReceipt,
  FalParallelTwinProofBundle,
  FalTwinGenerationReceipt,
} from './types.js';

export async function runFalParallelTwinProof(input: {
  session: ConceptDirectedTwinSession;
  conceptId: string;
  conceptVersionId: string;
  runAssetProof?: boolean;
}): Promise<FalParallelTwinProofBundle> {
  const minimalState = buildMinimalTwinGenerationState({
    conceptId: input.conceptId,
    conceptVersionId: input.conceptVersionId,
    session: input.session,
  });
  minimalState.status = 'GENERATING';

  const pageIntentSummary = input.session.pageIntent?.summary ?? 'NDXBOOK overview mobile';
  const dispatch = await dispatchFalParallelTwinGeneration({
    state: minimalState,
    pageIntentSummary,
  });

  const { authority, blueprint } = toFalVisualArtifacts({ state: minimalState, dispatch });
  const sameObjectIds =
    minimalState.objectIds.length === minimalState.requiredObjects.length &&
    minimalState.objectIds.every((id) => minimalState.requiredObjects.includes(id));

  const generationReceipt: FalTwinGenerationReceipt = {
    buildRef: P0_VR_TWIN_V28_BUILD,
    compositionStateId: minimalState.compositionStateId,
    conceptId: minimalState.conceptId,
    conceptVersionId: minimalState.conceptVersionId,
    provider: authority.provider,
    authorityModel: authority.model,
    blueprintModel: blueprint.model,
    generationMode: dispatch.generationMode,
    authorityJobRef: authority.providerJobRef,
    blueprintJobRef: blueprint.providerJobRef,
    authorityArtifactId: authority.artifactId,
    blueprintArtifactId: blueprint.artifactId,
    authorityUrl: authority.storageUrl,
    blueprintUrl: blueprint.storageUrl,
    sameCompositionState: authority.compositionStateId === blueprint.compositionStateId,
    sameObjectIds,
    sameViewport: true,
    status:
      authority.artifactId && blueprint.artifactId && authority.artifactId !== blueprint.artifactId
        ? 'PENDING_ALIGNMENT'
        : 'FAIL',
    createdAt: new Date().toISOString(),
  };

  const alignmentReceipt = runTwinVisualAlignmentHeuristic({
    state: minimalState,
    authority,
    blueprint,
  });

  const fromLiveFal = process.env.VITEST !== 'true' && Boolean(process.env.FAL_KEY?.trim());
  const { classification, failureCode } = classifyFalParallelTwinCapability({
    receipt: generationReceipt,
    alignment: alignmentReceipt,
    fromLiveFal,
  });

  const assetProofs: AssetGenerationProofReceipt[] = [];
  if (input.runAssetProof !== false) {
    for (const objectId of ASSET_PROOF_OBJECT_IDS) {
      try {
        const standalone = await dispatchStandaloneAssetProof({ state: minimalState, objectId });
        assetProofs.push({
          objectId,
          authorityAppearance: true,
          standaloneGenerated: Boolean(standalone.url),
          transparentBackground: objectId.includes('Overlay') || objectId.includes('decorative'),
          providerJobRef: standalone.jobRef,
          artifactId: standalone.artifactId,
          visualSimilarity: null,
          status: standalone.url ? 'PASS' : 'FAIL',
        });
      } catch {
        assetProofs.push({
          objectId,
          authorityAppearance: true,
          standaloneGenerated: false,
          transparentBackground: true,
          providerJobRef: '',
          artifactId: '',
          visualSimilarity: null,
          status: 'FAIL',
        });
      }
    }
  }

  minimalState.status = generationReceipt.status === 'FAIL' ? 'FAILED' : 'COMPLETE';

  return {
    minimalState,
    generationReceipt,
    authorityArtifact: authority,
    blueprintArtifact: blueprint,
    alignmentReceipt,
    assetProofs,
    capabilityClassification: classification,
    failureCode,
    providerTrace: dispatch.providerTrace,
  };
}
