import { mergeVisualConceptApiResult } from '../p0vrTwinV21/orchestrateTwinV2VisualConcept.js';
import { createConceptDirectedTwinSession } from '../p0vrTwinV21/index.js';
import { ensureConceptGallery } from '../p0vrTwinV22/conceptGalleryState.js';
import { assertV1Isolation } from '../p0vrTwinV21/index.js';
import { simulateAssetRegenerationReceipt } from './buildCanonicalAssetManifest.js';
import { P0_VR_TWIN_V27_BUILD } from './constants.js';
import { beginParallelCompositionTwinGeneration } from './beginParallelCompositionTwinGeneration.js';
import { PARALLEL_TWIN_PIPELINE_CALL_ORDER } from './runParallelTwinGeneration.js';
import type { NdxOverviewTwinV27PilotResult } from './types.js';

/** First pilot: one NDXBOOK overview mobile concept through parallel composition pipeline. */
export function runNdxOverviewTwinV27Pilot(): NdxOverviewTwinV27PilotResult {
  let session = createConceptDirectedTwinSession({
    projectId: 'ndxbook',
    pageId: 'overview',
    sessionId: 'twin-v27-pilot',
  });
  session = ensureConceptGallery(session);
  assertV1Isolation();

  const { pending, session: withPending } = beginParallelCompositionTwinGeneration(session, {
    generationType: 'INITIAL',
  });
  const { parallelTwin } = pending;

  session = mergeVisualConceptApiResult(withPending, {
    action: 'generate',
    imageUrl: '/concept-v27-pilot.jpg',
    imageStorageRef: 'ref-v27-pilot',
  });

  const gallery = session.conceptGallery!;
  const active = gallery.candidates.at(-1)!;
  const reconciliation = gallery.twinReconciliationReceipts?.[active.conceptId]!;
  const manifest = Object.values(gallery.canonicalAssetManifestsV27 ?? {})[0]!;
  const translation = gallery.blueprintTranslationReceipts?.[active.conceptId]!;
  const generatedAssets = gallery.generatedConceptAssets?.[active.conceptId] ?? [];

  const textObj = parallelTwin.surgicalBlueprintTwin.objects.find((o) => o.objectId === 'hero.headline')!;
  const dividerObj = parallelTwin.surgicalBlueprintTwin.objects.find((o) => o.objectId === 'hero.dividerLime')!;
  const imageObj = parallelTwin.surgicalBlueprintTwin.objects.find((o) => o.objectId === 'hero.imageMain')!;
  const sampleContract = parallelTwin.assetGenerationContractSet.contracts[0]!;

  simulateAssetRegenerationReceipt({
    assetId: sampleContract.canonicalAssetId ?? 'ca-test',
    generationContractId: sampleContract.assetGenerationContractId,
  });

  return {
    pipelineCallOrder: [...PARALLEL_TWIN_PIPELINE_CALL_ORDER],
    compositionState: parallelTwin.compositionState,
    compositionObjectCount: parallelTwin.compositionState.compositionObjects.length,
    compositionRelationshipCount: parallelTwin.compositionState.compositionRelationships.length,
    authorityVisual: gallery.authorityVisuals?.[parallelTwin.authorityVisual.authorityVisualId] ?? parallelTwin.authorityVisual,
    surgicalBlueprintTwin: gallery.surgicalBlueprintTwins?.[parallelTwin.surgicalBlueprintTwin.blueprintTwinId] ?? parallelTwin.surgicalBlueprintTwin,
    sharedCompositionStateId: parallelTwin.compositionState.compositionStateId,
    surgicalObjectCount: parallelTwin.surgicalBlueprintTwin.objects.length,
    sampleTextObject: textObj,
    sampleDividerObject: dividerObj,
    sampleImageObject: imageObj,
    sampleRelationship: parallelTwin.surgicalBlueprintTwin.relationships[0]!,
    assetGenerationContractSet: parallelTwin.assetGenerationContractSet,
    generatedAssetCount: generatedAssets.length,
    canonicalAssetCount: manifest.resolvedAssetCount,
    transparentAssetCount: manifest.transparentAssetCount,
    sampleAssetGenerationContract: sampleContract,
    twinReconciliationReceipt: reconciliation,
    canonicalAssetManifest: manifest,
    blueprintTranslationReceipt: translation,
    runtimeIndependenceReceipt: gallery.runtimeIndependenceReceipts?.[active.conceptId]!,
    twinFidelityReceipt: gallery.twinFidelityReceipts?.[active.conceptId]!,
    machinePassStatus: reconciliation?.status === 'PASS' && translation?.status === 'PASS' ? 'PASS' : 'FAIL',
    founderReviewStatus: 'PENDING',
    buildRef: P0_VR_TWIN_V27_BUILD,
  };
}
