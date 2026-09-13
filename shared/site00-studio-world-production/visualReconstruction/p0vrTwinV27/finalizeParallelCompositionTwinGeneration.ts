import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import { finalizeDualOutputConceptGeneration } from '../p0vrTwinV25/finalizeDualOutputConceptGeneration.js';
import { P0_VR_TWIN_V25_BUILD } from '../p0vrTwinV25/constants.js';
import { P0_VR_TWIN_V27_BUILD } from './constants.js';
import { buildCanonicalAssetManifestV27 } from './buildCanonicalAssetManifest.js';
import { compileSurgicalBlueprintToCode } from './blueprintToCodeCompiler.js';
import { assertBlueprintNotPostHocOnly } from './guards.js';
import { runTwinReconciliationPass } from './runTwinReconciliationPass.js';
import { buildRuntimeIndependenceReceipt, buildTwinFidelityReceipt } from './receipts.js';
import type { PendingParallelTwinGeneration } from './types.js';

export function finalizeParallelCompositionTwinGeneration(
  session: ConceptDirectedTwinSession,
  input: { imageUrl: string; imageStorageRef: string | null; legacyVersionId: string },
): ConceptDirectedTwinSession {
  const pending = session.conceptGallery?.pendingDualOutput as PendingParallelTwinGeneration | undefined;
  if (!pending || pending.buildRef !== P0_VR_TWIN_V27_BUILD || !pending.parallelTwin) {
    return finalizeDualOutputConceptGeneration(session, input);
  }

  assertBlueprintNotPostHocOnly({
    compositionStateCreatedAt: pending.parallelTwin.compositionState.createdAt,
    blueprintCreatedAt: pending.parallelTwin.surgicalBlueprintTwin.createdAt,
    authorityImageReceivedAt: new Date().toISOString(),
    blueprintSource: 'COMPOSITION_STATE',
  });

  const authorityVisual = {
    ...pending.parallelTwin.authorityVisual,
    imageUrl: input.imageUrl,
    status: 'RENDERED' as const,
  };

  const { receipt, surgicalBlueprintTwin } = runTwinReconciliationPass({
    compositionState: pending.parallelTwin.compositionState,
    authorityVisual,
    surgicalBlueprintTwin: pending.parallelTwin.surgicalBlueprintTwin,
    imageUrl: input.imageUrl,
  });

  const v25Session: ConceptDirectedTwinSession = {
    ...session,
    conceptGallery: {
      ...session.conceptGallery!,
      pendingDualOutput: { ...pending, buildRef: P0_VR_TWIN_V25_BUILD },
    },
  };
  let next = finalizeDualOutputConceptGeneration(v25Session, input);
  const gallery = next.conceptGallery!;
  const active = gallery.candidates.at(-1);
  if (!active) return next;

  const generatedAssets = gallery.generatedConceptAssets?.[active.conceptId] ?? [];
  const manifestV27 = buildCanonicalAssetManifestV27({
    manifestId: active.assetManifestId,
    compositionStateId: pending.parallelTwin.compositionState.compositionStateId,
    conceptId: active.conceptId,
    conceptVersionId: pending.versionId,
    contractSet: pending.parallelTwin.assetGenerationContractSet,
    generatedAssets,
  });

  const bindingPlan = gallery.bindingPlans[active.functionBindingPlanId];
  const compile =
    bindingPlan &&
    compileSurgicalBlueprintToCode({
      surgicalBlueprintTwin,
      canonicalAssetManifest: manifestV27,
      functionBindingPlan: bindingPlan,
    });

  return {
    ...next,
    conceptGallery: {
      ...gallery,
      compositionStates: {
        ...(gallery.compositionStates ?? {}),
        [pending.parallelTwin.compositionState.compositionStateId]: {
          ...pending.parallelTwin.compositionState,
          status: receipt.status === 'PASS' ? 'RECONCILED' : 'DRAFT',
        },
      },
      surgicalBlueprintTwins: {
        ...(gallery.surgicalBlueprintTwins ?? {}),
        [surgicalBlueprintTwin.blueprintTwinId]: surgicalBlueprintTwin,
      },
      authorityVisuals: {
        ...(gallery.authorityVisuals ?? {}),
        [authorityVisual.authorityVisualId]: authorityVisual,
      },
      twinReconciliationReceipts: {
        ...(gallery.twinReconciliationReceipts ?? {}),
        [active.conceptId]: receipt,
      },
      canonicalAssetManifestsV27: {
        ...(gallery.canonicalAssetManifestsV27 ?? {}),
        [manifestV27.manifestId]: manifestV27,
      },
      blueprintTranslationReceipts: compile
        ? { ...(gallery.blueprintTranslationReceipts ?? {}), [active.conceptId]: compile.translationReceipt }
        : gallery.blueprintTranslationReceipts,
      runtimeIndependenceReceipts: {
        ...(gallery.runtimeIndependenceReceipts ?? {}),
        [active.conceptId]: buildRuntimeIndependenceReceipt(),
      },
      twinFidelityReceipts: {
        ...(gallery.twinFidelityReceipts ?? {}),
        [active.conceptId]: buildTwinFidelityReceipt({}),
      },
      surgicalBlueprintCodeBindings: compile
        ? { ...(gallery.surgicalBlueprintCodeBindings ?? {}), [active.conceptId]: compile.bindings }
        : gallery.surgicalBlueprintCodeBindings,
    },
  };
}
