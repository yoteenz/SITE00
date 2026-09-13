import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import { applyBlueprintOwnershipTags } from '../p0vrTwinV22R2/applyBlueprintOwnershipTags.js';
import { sanitizeConceptForHostBoundary } from '../p0vrTwinV22R2/sanitizeConceptForHostBoundary.js';
import { buildHostBoundarySanitizationReceipt } from '../p0vrTwinV22R2/buildHostBoundarySanitizationReceipt.js';
import { computeConceptBuildReadiness } from '../p0vrTwinV22/computeConceptBuildReadiness.js';
import { reconcileConceptBlueprint } from '../p0vrTwinV22/reconcileConceptBlueprint.js';
import type { ConceptCandidate, ConceptGalleryState } from '../p0vrTwinV22/types.js';
import { PAIRED_CONCEPT_COVERAGE_MIN, P0_VR_TWIN_V25_BUILD } from './constants.js';
import { convertVisualBlueprintToConceptBlueprint } from './convertVisualBlueprintToConceptBlueprint.js';
import { materializeStandaloneConceptAssets } from './materializeStandaloneConceptAssets.js';
import { buildFunctionBindingPlanFromTargets } from './buildFunctionBindingPlanFromTargets.js';
import { buildAssetManifestFromPairedGeneration } from './buildAssetManifestFromPairedGeneration.js';
import { reconcileVisualBlueprintToImage } from './reconcileVisualBlueprintToImage.js';
export function finalizeDualOutputConceptGeneration(
  session: ConceptDirectedTwinSession,
  input: { imageUrl: string; imageStorageRef: string | null; legacyVersionId: string },
): ConceptDirectedTwinSession {
  const pending = session.conceptGallery?.pendingDualOutput;
  if (!pending || pending.buildRef !== P0_VR_TWIN_V25_BUILD) {
    throw new Error('TWIN_V25: no pending dual-output generation');
  }

  const {
    paired,
    compositionPlan,
    visualBlueprint,
    assetPlan,
    functionTargetPlan,
  } = pending;

  const reconciliation = reconcileVisualBlueprintToImage({
    conceptId: paired.conceptId,
    versionId: paired.versionId,
    visualBlueprint,
    imageUrl: input.imageUrl,
  });

  let reconciledBlueprint = reconciliation.reconciledBlueprint;
  const materialized = materializeStandaloneConceptAssets({
    conceptId: paired.conceptId,
    versionId: paired.versionId,
    sourceVisualId: input.imageStorageRef ?? input.imageUrl,
    assetPlan,
    visualBlueprint: reconciledBlueprint,
  });
  const { generatedAssets, purityReceipts, assetCoverage } = materialized;
  reconciledBlueprint = materialized.visualBlueprint as typeof reconciledBlueprint;

  const conceptBlueprint = convertVisualBlueprintToConceptBlueprint(reconciledBlueprint);
  conceptBlueprint.status = 'RECONCILED';

  const manifest = buildAssetManifestFromPairedGeneration({
    conceptId: paired.conceptId,
    manifestId: paired.assetManifestId,
    assetPlan,
    generatedAssets,
  });

  const bindingPlan = buildFunctionBindingPlanFromTargets({
    conceptId: paired.conceptId,
    bindingPlanId: paired.functionBindingPlanId,
    functionTargetPlan,
    functionGraph: session.functionGraph,
  });

  const blueprintTagged = applyBlueprintOwnershipTags(conceptBlueprint, {
    fullPageConceptImage: false,
  });

  const boundary = sanitizeConceptForHostBoundary({
    conceptId: paired.conceptId,
    pageId: session.pageId,
    blueprint: blueprintTagged,
    originalConceptImageUrl: input.imageUrl,
  });

  const legacyReconciliation = reconcileConceptBlueprint({
    conceptId: paired.conceptId,
    plannedDirection: session.creativeDirection!,
    blueprint: blueprintTagged,
  });

  const now = new Date().toISOString();
  const coveragePass =
    reconciliation.visualCoverage.coveragePercent >= PAIRED_CONCEPT_COVERAGE_MIN &&
    assetCoverage.status === 'PASS';

  let candidate: ConceptCandidate = {
    conceptId: paired.conceptId,
    sessionId: session.sessionId,
    projectId: session.projectId,
    pageId: session.pageId,
    viewport: 'mobile',
    versionNumber: session.conceptGallery!.candidates.length + 1,
    parentConceptId: pending.parentConceptId,
    generationType:
      pending.generationType === 'REFINED'
        ? 'REFINED'
        : pending.generationType === 'REGENERATED'
          ? 'REGENERATED'
          : 'INITIAL',
    visualAsset: input.imageStorageRef,
    visualAssetUrl: input.imageUrl,
    creativeDirection: session.creativeDirection!,
    founderInstruction: pending.founderInstruction,
    pageIntentSnapshot: session.pageIntent,
    functionGraphSnapshot: session.functionGraph,
    brandContextSnapshot: session.brandContext,
    blueprintGrammarSnapshot: session.blueprintGrammar,
    conceptBlueprintId: conceptBlueprint.blueprintId,
    originalBlueprintId: conceptBlueprint.blueprintId,
    executionBlueprintId: boundary.sanitizedBlueprintId,
    assetManifestId: manifest.manifestId,
    functionBindingPlanId: bindingPlan.bindingPlanId,
    buildReadiness: {
      visualReady: true,
      blueprintReady: true,
      assetsReady: assetCoverage.status === 'PASS',
      functionsReady: bindingPlan.status === 'COMPLETE',
      shellReady: true,
      hostBoundaryReady: false,
      responsiveReady: true,
      unresolved: coveragePass ? [] : ['reconciliation'],
      status: coveragePass ? 'READY_TO_BUILD' : 'BLUEPRINT_INCOMPLETE',
    },
    founderJudgment: 'NONE',
    visualAuthorityStatus: 'OPEN',
    status: 'DRAFT',
    legacyVersionId: input.legacyVersionId,
    conceptOrigin: 'DUAL_OUTPUT_PAIRED',
    pairedConceptStatus: coveragePass ? 'PAIRED_READY' : 'RECONCILIATION_REQUIRED',
    createdAt: now,
    updatedAt: now,
  };

  const buildReadiness = computeConceptBuildReadiness({
    candidate,
    blueprint: boundary.sanitizedBlueprint,
    manifest,
    bindingPlan,
    hostBoundary: boundary,
  });
  candidate = { ...candidate, buildReadiness };

  const hostReceipt = buildHostBoundarySanitizationReceipt({
    conceptId: paired.conceptId,
    originalBlueprint: blueprintTagged,
    executionBlueprint: boundary.sanitizedBlueprint,
    generatedHostArtifacts: boundary.generatedHostArtifacts,
    hostShellContract: boundary.hostShellContract,
    hostBoundaryReady: buildReadiness.hostBoundaryReady,
  });

  const updatedPaired = {
    ...paired,
    visualAssetId: input.legacyVersionId,
    reconciliationReceiptId: reconciliation.reconciliation.reconciliationId,
    status: coveragePass ? ('PAIRED_READY' as const) : ('RECONCILIATION_REQUIRED' as const),
    updatedAt: now,
  };

  const gallery = session.conceptGallery!;
  const nextGallery: ConceptGalleryState = {
    ...gallery,
    buildRef: gallery.buildRef,
    candidates: [...gallery.candidates, candidate],
    activeConceptId: candidate.conceptId,
    lastActiveConceptId: candidate.conceptId,
    blueprints: { ...gallery.blueprints, [conceptBlueprint.blueprintId]: blueprintTagged },
    manifests: { ...gallery.manifests, [manifest.manifestId]: manifest },
    bindingPlans: { ...gallery.bindingPlans, [bindingPlan.bindingPlanId]: bindingPlan },
    reconciliations: {
      ...gallery.reconciliations,
      [legacyReconciliation.reconciliationId]: legacyReconciliation,
    },
    sanitizedBlueprints: {
      ...gallery.sanitizedBlueprints,
      [boundary.sanitizedBlueprintId]: boundary.sanitizedBlueprint,
    },
    generatedHostArtifacts: {
      ...gallery.generatedHostArtifacts,
      [candidate.conceptId]: boundary.generatedHostArtifacts,
    },
    ownershipReceipts: { ...gallery.ownershipReceipts, [candidate.conceptId]: boundary.ownershipReceipt },
    canvasBoundaries: { ...gallery.canvasBoundaries, [candidate.conceptId]: boundary.canvasBoundary },
    hostShellContracts: { ...gallery.hostShellContracts, [candidate.conceptId]: boundary.hostShellContract },
    compositePreviews: { ...gallery.compositePreviews, [candidate.conceptId]: boundary.compositePreview },
    clientCanvasBoundaries: {
      ...(gallery.clientCanvasBoundaries ?? {}),
      [candidate.conceptId]: boundary.clientCanvasBoundary,
    },
    clientCanvasTrimReceipts: {
      ...(gallery.clientCanvasTrimReceipts ?? {}),
      [candidate.conceptId]: boundary.clientCanvasTrimReceipt,
    },
    clientCanvasTopReceipts: {
      ...(gallery.clientCanvasTopReceipts ?? {}),
      [candidate.conceptId]: boundary.clientCanvasTopReceipt,
    },
    hostBoundarySanitizationReceipts: {
      ...(gallery.hostBoundarySanitizationReceipts ?? {}),
      [candidate.conceptId]: {
        ...hostReceipt,
        hostBoundaryReady: buildReadiness.hostBoundaryReady,
        status: buildReadiness.hostBoundaryReady ? 'SANITIZED' : 'INCOMPLETE',
      },
    },
    compositionPlans: { ...(gallery.compositionPlans ?? {}), [compositionPlan.compositionPlanId]: compositionPlan },
    visualBlueprints: {
      ...(gallery.visualBlueprints ?? {}),
      [reconciledBlueprint.blueprintId]: reconciledBlueprint,
    },
    reconciledVisualBlueprints: {
      ...(gallery.reconciledVisualBlueprints ?? {}),
      [reconciledBlueprint.blueprintId]: reconciledBlueprint,
    },
    assetPlans: { ...(gallery.assetPlans ?? {}), [candidate.conceptId]: assetPlan },
    generatedConceptAssets: {
      ...(gallery.generatedConceptAssets ?? {}),
      [candidate.conceptId]: generatedAssets,
    },
    assetPurityReceipts: {
      ...(gallery.assetPurityReceipts ?? {}),
      ...Object.fromEntries(purityReceipts.map((r) => [r.assetId, r])),
    },
    visualBlueprintReconciliations: {
      ...(gallery.visualBlueprintReconciliations ?? {}),
      [reconciliation.reconciliation.reconciliationId]: reconciliation.reconciliation,
    },
    blueprintVisualCoverage: {
      ...(gallery.blueprintVisualCoverage ?? {}),
      [candidate.conceptId]: reconciliation.visualCoverage,
    },
    assetCoverage: { ...(gallery.assetCoverage ?? {}), [candidate.conceptId]: assetCoverage },
    pairedArtifacts: { ...(gallery.pairedArtifacts ?? {}), [candidate.conceptId]: updatedPaired },
    pendingDualOutput: null,
  };

  return {
    ...session,
    conceptGallery: nextGallery,
    status: 'TWIN_V2_CONCEPT_READY',
    updatedAt: now,
  };
}
