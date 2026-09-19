import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import { buildConceptCompositionState } from '../p0vrTwinV27/buildConceptCompositionState.js';
import {
  ATOMIC_PIPELINE_CALL_ORDER,
  GENERATION_BUNDLE_OUTPUT_TYPES,
  P0_VR_TWIN_V29_BUILD,
} from './constants.js';
import {
  buildAtomicAssetGenerationContractSet,
  listRequiredStandaloneAssetObjectIds,
} from './buildAtomicAssetContracts.js';
import { buildFunctionBindingMap } from './buildFunctionBindingMap.js';
import { buildSurgicalBlueprintData } from './buildSurgicalBlueprintData.js';
import {
  assertAtomicGenerationNotBlockedByV28,
  resolveV28CapabilityStatus,
} from './checkV28CapabilityGate.js';
import { dispatchAtomicFalVisuals, dispatchAtomicStandaloneAsset } from './dispatchAtomicFalVisuals.js';
import {
  buildGenerationBundleCompleteness,
  buildObjectConsistencyReceipts,
  registerAtomicBundle,
} from './reconcileAndRegisterAtomicBundle.js';
import type {
  AtomicCreativeGenerationResult,
  AtomicConceptGenerationBundle,
  AssetRegenerationCapabilityReceipt,
  GenerationBundleOutputType,
  StandaloneAssetGenerationReceipt,
  StandaloneAssetRender,
} from './types.js';

export async function runAtomicConceptGenerationBundle(input: {
  session: ConceptDirectedTwinSession;
  conceptId: string;
  conceptVersionId: string;
}): Promise<AtomicCreativeGenerationResult> {
  const v28Status = resolveV28CapabilityStatus(input.session);
  assertAtomicGenerationNotBlockedByV28(v28Status);

  const now = new Date().toISOString();
  const generationBundleId = `agb-${input.conceptId}`;
  const compositionState = buildConceptCompositionState({
    conceptId: input.conceptId,
    conceptVersionId: input.conceptVersionId,
    session: input.session,
  });

  const requiredOutputs = [...GENERATION_BUNDLE_OUTPUT_TYPES] as GenerationBundleOutputType[];
  const failedOutputs: GenerationBundleOutputType[] = [];
  const providerLineage: string[] = [`v28Capability:${v28Status}`];

  const surgicalBlueprintData = buildSurgicalBlueprintData({ generationBundleId, compositionState });
  const assetContractSet = buildAtomicAssetGenerationContractSet({ generationBundleId, compositionState });
  const functionBindingMap = buildFunctionBindingMap({
    generationBundleId,
    compositionState,
    surgicalData: surgicalBlueprintData,
  });

  if (functionBindingMap.status !== 'COMPLETE') {
    failedOutputs.push('FUNCTION_BINDING_MAP');
  }

  const pageIntentSummary = input.session.pageIntent?.summary ?? 'NDXBOOK overview mobile';
  let authorityArtifact;
  let blueprintTwinArtifact;
  try {
    const visuals = await dispatchAtomicFalVisuals({
      generationBundleId,
      compositionState,
      pageIntentSummary,
    });
    authorityArtifact = visuals.authority;
    blueprintTwinArtifact = visuals.blueprintTwin;
    providerLineage.push(...visuals.providerTrace);
  } catch {
    failedOutputs.push('AUTHORITY_VISUAL', 'BLUEPRINT_TWIN_VISUAL');
    throw new Error('INCOMPLETE_TWIN_GENERATION');
  }

  if (authorityArtifact.artifactId === blueprintTwinArtifact.artifactId) {
    failedOutputs.push('BLUEPRINT_TWIN_VISUAL');
    throw new Error('INCOMPLETE_TWIN_GENERATION');
  }

  const requiredAssetObjectIds = listRequiredStandaloneAssetObjectIds();
  const pilotAssetIds = requiredAssetObjectIds.filter((id) =>
    ['hero.ndxOverlay', 'hero.imageMain', 'masthead.projectMark'].includes(id),
  );
  const standaloneAssets: StandaloneAssetRender[] = [];
  const standaloneReceipts: StandaloneAssetGenerationReceipt[] = [];

  for (const objectId of pilotAssetIds) {
    const contract = assetContractSet.contracts.find((c) => c.objectId === objectId);
    if (!contract) continue;
    try {
      const rendered = await dispatchAtomicStandaloneAsset({
        generationBundleId,
        compositionState,
        objectId,
        assetSlotId: contract.assetSlotId,
        transparent: contract.transparentBackground,
      });
      standaloneAssets.push({
        artifactId: rendered.artifactId,
        generationBundleId,
        compositionStateId: compositionState.compositionStateId,
        objectId,
        assetSlotId: contract.assetSlotId,
        storageUrl: rendered.url,
        providerJobRef: rendered.jobRef,
        transparentBackground: contract.transparentBackground,
        assetVersionId: rendered.assetVersionId,
      });
      standaloneReceipts.push({
        generationBundleId,
        objectId,
        assetSlotId: contract.assetSlotId,
        generationContractId: contract.assetGenerationContractId,
        providerJobRef: rendered.jobRef,
        artifactId: rendered.artifactId,
        visualTargetId: contract.approvedVisualTarget ?? objectId,
        transparentBackground: contract.transparentBackground,
        similarityStatus: 'PENDING',
        status: 'PASS',
      });
      providerLineage.push(`standalone asset ${objectId} job ${rendered.jobRef}`);
    } catch {
      failedOutputs.push('STANDALONE_ASSET_RENDER');
    }
  }

  const completeness = buildGenerationBundleCompleteness({
    generationBundleId,
    authority: authorityArtifact,
    blueprintTwin: blueprintTwinArtifact,
    surgicalData: surgicalBlueprintData,
    contracts: assetContractSet,
    requiredAssetIds: pilotAssetIds,
    standaloneAssets,
    functionMap: functionBindingMap,
    failed: failedOutputs,
  });

  const objectConsistency = buildObjectConsistencyReceipts({
    compositionState,
    surgicalData: surgicalBlueprintData,
    standaloneAssets,
    functionMap: functionBindingMap,
  });

  const registration = registerAtomicBundle({
    generationBundleId,
    authority: authorityArtifact,
    blueprintTwin: blueprintTwinArtifact,
    surgicalData: surgicalBlueprintData,
    contracts: assetContractSet,
    standaloneAssets,
    functionMap: functionBindingMap,
  });

  const heroOverlay = assetContractSet.contracts.find((c) => c.objectId === 'hero.ndxOverlay');
  const assetRegenerationCapability: AssetRegenerationCapabilityReceipt = {
    objectId: 'hero.ndxOverlay',
    contractStored: Boolean(heroOverlay),
    referencesStored: Boolean(heroOverlay?.referenceVisualIds.length),
    regenerationCallable: Boolean(heroOverlay?.regenerationEligible),
    newVersionCreated: standaloneAssets.some((a) => a.objectId === 'hero.ndxOverlay'),
    visualTargetComparisonAvailable: Boolean(heroOverlay?.visualFingerprint),
    status: heroOverlay ? 'PASS' : 'PARTIAL',
  };

  const completedOutputs = requiredOutputs.filter((o) => !completeness.missingOutputs.includes(o));
  const bundleStatus =
    completeness.status === 'PASS'
      ? 'REGISTERED'
      : completeness.status === 'PARTIAL'
        ? 'FOUNDER_REVIEW'
        : 'FAILED';

  const bundle: AtomicConceptGenerationBundle = {
    buildRef: P0_VR_TWIN_V29_BUILD,
    generationBundleId,
    compositionStateId: compositionState.compositionStateId,
    conceptId: input.conceptId,
    conceptVersionId: input.conceptVersionId,
    projectId: input.session.projectId,
    pageId: input.session.pageId,
    viewport: 'mobile',
    authorityVisualId: authorityArtifact.artifactId,
    blueprintTwinVisualId: blueprintTwinArtifact.artifactId,
    surgicalBlueprintDataId: surgicalBlueprintData.surgicalBlueprintDataId,
    assetGenerationContractSetId: assetContractSet.contractSetId,
    assetManifestId: `cam-${generationBundleId}`,
    functionBindingMapId: functionBindingMap.functionBindingMapId,
    requiredOutputs,
    completedOutputs,
    failedOutputs,
    providerLineage,
    status: bundleStatus,
    createdAt: now,
    completedAt: now,
  };

  let classification: AtomicCreativeGenerationResult['classification'] = 'ATOMIC_CREATIVE_GENERATION_PARTIAL';
  if (completeness.status === 'PASS' && process.env.VITEST !== 'true' && process.env.FAL_KEY?.trim()) {
    classification = 'ATOMIC_CREATIVE_GENERATION_PROVEN';
  } else if (completeness.status === 'FAIL' || failedOutputs.length > 0) {
    classification = 'ATOMIC_CREATIVE_GENERATION_PARTIAL';
  }
  if (v28Status === 'FAL_PARALLEL_TWIN_CAPABILITY_FAILED') {
    classification = 'ATOMIC_CREATIVE_GENERATION_BLOCKED';
  }

  const approveEnabled = completeness.status === 'PASS' && failedOutputs.length === 0;

  return {
    pipelineCallOrder: ATOMIC_PIPELINE_CALL_ORDER,
    bundle,
    compositionState,
    authorityArtifact,
    blueprintTwinArtifact: blueprintTwinArtifact,
    surgicalBlueprintData,
    assetContractSet,
    standaloneAssets,
    functionBindingMap,
    completeness,
    objectConsistency,
    registration,
    assetRegenerationCapability,
    providerTrace: providerLineage,
    v28CapabilityStatus: v28Status,
    classification,
    failureCode: failedOutputs.length ? 'INCOMPLETE_ASSET_GENERATION' : null,
    approveEnabled,
  };
}
