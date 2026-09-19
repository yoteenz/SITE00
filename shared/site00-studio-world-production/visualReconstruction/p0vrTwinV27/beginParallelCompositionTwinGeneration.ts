import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import { emptyConceptGallery, ensureConceptGallery } from '../p0vrTwinV22/conceptGalleryState.js';
import type { ConceptGenerationType } from '../p0vrTwinV22/types.js';
import {
  buildCompositionPlan,
  buildConceptAssetPlan,
  buildConceptFunctionTargetPlan,
  buildConceptVisualBlueprint,
} from '../p0vrTwinV25/buildDualOutputPreGeneration.js';
import { P0_VR_TWIN_V25_BUILD } from '../p0vrTwinV25/constants.js';
import type { PairedConceptArtifact, PendingDualOutputGeneration } from '../p0vrTwinV25/types.js';
import { VISUAL_GENERATION_CORE_INSTRUCTION } from '../p0vrTwinV25/visualGenerationInstruction.js';
import {
  assertConceptGenerationPreflight,
  runConceptGenerationPreflight,
} from '../p0vrTwinV26/runConceptGenerationPreflight.js';
import { P0_VR_TWIN_V27_BUILD } from './constants.js';
import {
  assertSharedCompositionLineage,
  runParallelTwinGenerationFromCompositionState,
} from './runParallelTwinGeneration.js';
import type { PendingParallelTwinGeneration } from './types.js';

export function beginParallelCompositionTwinGeneration(
  session: ConceptDirectedTwinSession,
  input: {
    generationType: ConceptGenerationType;
    parentConceptId?: string | null;
    founderInstruction?: string | null;
  },
): { session: ConceptDirectedTwinSession; pending: PendingParallelTwinGeneration } {
  if (!session.creativeDirection) {
    throw new Error('TWIN_V27: creative direction required');
  }
  const baseSession = ensureConceptGallery(session);
  const gallery = baseSession.conceptGallery ?? emptyConceptGallery();
  const versionNumber = (gallery?.candidates.length ?? 0) + 1;
  const conceptId = `cc-${session.sessionId}-v${versionNumber}-${Date.now()}`;
  const versionId = `vc-${session.sessionId}-${Date.now()}`;
  const now = new Date().toISOString();

  const parallelTwin = runParallelTwinGenerationFromCompositionState({
    conceptId,
    conceptVersionId: versionId,
    session,
  });
  assertSharedCompositionLineage(parallelTwin);

  const compositionPlan = buildCompositionPlan({ conceptId, versionId, session });
  const visualBlueprint = buildConceptVisualBlueprint({ conceptId, versionId, compositionPlan });
  const assetPlan = buildConceptAssetPlan({ conceptId, versionId, visualBlueprint });
  const functionTargetPlan = buildConceptFunctionTargetPlan({ conceptId, versionId, visualBlueprint, session });

  const paired: PairedConceptArtifact = {
    conceptId,
    versionId,
    sessionId: session.sessionId,
    projectId: session.projectId,
    pageId: session.pageId,
    viewport: 'mobile',
    creativeDirectionId: session.creativeDirection.creativePremise.slice(0, 48),
    compositionPlanId: parallelTwin.compositionState.compositionStateId,
    visualAssetId: null,
    conceptVisualBlueprintId: parallelTwin.surgicalBlueprintTwin.blueprintTwinId,
    reconciliationReceiptId: null,
    assetManifestId: `cam-${conceptId}`,
    functionBindingPlanId: functionTargetPlan.bindingPlanId,
    status: 'VISUAL_GENERATING',
    conceptOrigin: 'DUAL_OUTPUT_PAIRED',
    createdAt: now,
    updatedAt: now,
  };

  const visualGenerationInstruction = [
    VISUAL_GENERATION_CORE_INSTRUCTION,
    `compositionStateId: ${parallelTwin.compositionState.compositionStateId}`,
    `Surgical object count: ${parallelTwin.surgicalBlueprintTwin.objects.length}`,
    `Relationship count: ${parallelTwin.surgicalBlueprintTwin.relationships.length}`,
    `Asset contracts: ${parallelTwin.assetGenerationContractSet.contracts.length}`,
    `Object IDs: ${parallelTwin.compositionState.compositionObjects.map((o) => o.objectId).join(', ')}`,
    input.founderInstruction ? `Refinement: ${input.founderInstruction}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const v25Pending: PendingDualOutputGeneration = {
    buildRef: P0_VR_TWIN_V25_BUILD,
    conceptId,
    versionId,
    generationType:
      input.generationType === 'REFINED'
        ? 'REFINED'
        : input.generationType === 'REGENERATED'
          ? 'REGENERATED'
          : 'INITIAL',
    parentConceptId: input.parentConceptId ?? null,
    founderInstruction: input.founderInstruction ?? null,
    paired,
    compositionPlan,
    visualBlueprint,
    assetPlan,
    functionTargetPlan,
    visualGenerationInstruction,
    startedAt: now,
  };

  const preflight = runConceptGenerationPreflight(baseSession, v25Pending);
  assertConceptGenerationPreflight(preflight);

  const pending: PendingParallelTwinGeneration = {
    ...v25Pending,
    buildRef: P0_VR_TWIN_V27_BUILD,
    parallelTwin,
  };

  return {
    session: {
      ...baseSession,
      conceptGallery: {
        ...gallery,
        pendingDualOutput: pending,
        compositionPlans: {
          ...(gallery?.compositionPlans ?? {}),
          [compositionPlan.compositionPlanId]: compositionPlan,
        },
        visualBlueprints: { ...(gallery?.visualBlueprints ?? {}), [visualBlueprint.blueprintId]: visualBlueprint },
        assetPlans: { ...(gallery?.assetPlans ?? {}), [conceptId]: assetPlan },
        functionTargetPlans: {
          ...(gallery?.functionTargetPlans ?? {}),
          [functionTargetPlan.bindingPlanId]: functionTargetPlan,
        },
        pairedArtifacts: { ...(gallery?.pairedArtifacts ?? {}), [conceptId]: paired },
        compositionStates: {
          ...(gallery?.compositionStates ?? {}),
          [parallelTwin.compositionState.compositionStateId]: parallelTwin.compositionState,
        },
        surgicalBlueprintTwins: {
          ...(gallery?.surgicalBlueprintTwins ?? {}),
          [parallelTwin.surgicalBlueprintTwin.blueprintTwinId]: parallelTwin.surgicalBlueprintTwin,
        },
        assetGenerationContractSets: {
          ...(gallery?.assetGenerationContractSets ?? {}),
          [parallelTwin.assetGenerationContractSet.contractSetId]: parallelTwin.assetGenerationContractSet,
        },
        authorityVisuals: {
          ...(gallery?.authorityVisuals ?? {}),
          [parallelTwin.authorityVisual.authorityVisualId]: parallelTwin.authorityVisual,
        },
      },
      updatedAt: now,
    },
    pending,
  };
}
