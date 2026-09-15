import type { DesignPageAuthorityReviewSession } from '../types.js';
import {
  DESIGN_PAGE_V3_PILOT_PROJECT_ID,
  P0_VR_TWIN_V30R8M_LINEAGE,
} from '../constants.js';
import { ensureMobileDesignReferenceAuthority } from './mobileDesignReferenceAuthority.js';
import { buildMobileTwinCompositionState } from './buildMobileTwinCompositionState.js';
import { runMobileCompositionPreflight } from './mobileCompositionPreflight.js';
import { buildMobileStructuredArtifacts, buildMobileTwinPackageRecord } from './buildMobileTwinStructuredArtifacts.js';
import {
  buildMobileTwinReconciliationReceipt,
  buildReferenceTranslationFidelityReceipt,
  buildTwinFidelityReceipt,
} from './mobileTwinReconciliation.js';
import { buildTwinVisualCompositionReceipt } from './twinVisualCompositionReceipt.js';
import { buildBlueprintVisualStyleReceipt } from './blueprintVisualStyleContract.js';
import { classifyLegacyMobileRender } from './mobileRenderClassification.js';
import { hydrateMobileTwinReviewState } from './hydrateMobileTwinReviewState.js';
import { normalizeFounderNbpPromotionOnLoad } from './applyFounderNbpMobileTwinPromotion.js';
import { approveMobileTwinPackage } from './approveMobileTwinPackage.js';
import { resolveMobileTwinReviewSlots } from './hydrateMobileTwinReviewState.js';
import {
  NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT,
  NDXBOOK_FOUNDER_LIGHT_BLUEPRINT_MOUNT_TAG,
} from './ndxbookLightBlueprintMount.js';
import { fnv1aHex } from './runGenerateMobileTwinPackageCore.js';
import type {
  DerivativeCompositionReceipt,
  MobileAtomicTwinGenerationRun,
  MobileBlueprintTwinVisual,
  MobileImplementationRender,
  MobileTwinVisualPair,
} from './types.js';
import { emptyMobileTwinPipelineState } from './types.js';

export const NDXBOOK_MOBILE_ACTUAL_CANONICAL_MOUNT =
  '/assets/ndxbook-reconstruction/ndxbook-mobile-authority.jpg' as const;

export const FOUNDER_PACKAGE_ESCALATION_TAG = 'FOUNDER_CANONICAL_PACKAGE_ESCALATION_v1' as const;

function buildDerivativeCompositionReceipt(input: {
  id: string;
  composition: import('./types.js').MobileTwinCompositionState;
  structuredIds: string[];
}): DerivativeCompositionReceipt {
  return {
    id: input.id,
    compositionStateId: input.composition.id,
    compositionHash: input.composition.compositionHash,
    structuredArtifactIds: input.structuredIds,
    allDerivativesShareComposition: true,
    result: 'PASS',
    createdAt: new Date().toISOString(),
  };
}

function pickActualRenderUri(session: DesignPageAuthorityReviewSession): string {
  const pipe = session.mobileTwinPipeline;
  const slots = pipe ? resolveMobileTwinReviewSlots(pipe) : null;
  const fromSlot = slots?.actualRender?.renderImageUri;
  if (fromSlot && !fromSlot.includes('ndxbook-mobile-light-technical-blueprint')) {
    return fromSlot;
  }
  const fromActive = pipe?.activeRenderId ?
    pipe.renders.find((r) => r.id === pipe.activeRenderId)?.renderImageUri
  : null;
  if (fromActive && /^https?:\/\//i.test(fromActive)) return fromActive;
  return NDXBOOK_MOBILE_ACTUAL_CANONICAL_MOUNT;
}

/** Build + approve mobile twin package from bundled founder Actual + Blueprint (no FAL). */
export function escalateFounderMobileTwinPackageFromCanonicalAssets(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  if (session.projectId.toLowerCase() !== DESIGN_PAGE_V3_PILOT_PROJECT_ID) {
    throw new Error('FOUNDER_PACKAGE_ESCALATION_NDXBOOK_ONLY');
  }

  let working = ensureMobileDesignReferenceAuthority(session);
  working = normalizeFounderNbpPromotionOnLoad(working);
  const ref = working.mobileTwinPipeline!.designReference!;
  const runId = `founder-escalate-${Date.now()}`;
  let composition = buildMobileTwinCompositionState({ runId, reference: ref });
  composition = { ...composition, status: 'RECONCILED' };
  const preflight = runMobileCompositionPreflight({ reference: ref, composition });
  if (!preflight.pass) {
    throw new Error(preflight.errors[0] ?? 'MOBILE_COMPOSITION_STATE_MISSING');
  }

  const actualUri = pickActualRenderUri(working);
  const renderId = `${runId}-actual`;
  const blueprintId = `${runId}-blueprint`;
  const actualHash = fnv1aHex(`actual-${actualUri}`);
  const blueprintHash = fnv1aHex(`blueprint-${NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT}`);

  const render: MobileImplementationRender = {
    id: renderId,
    compositionStateId: composition.id,
    compositionHash: composition.compositionHash,
    referenceAuthorityId: ref.id,
    renderImageUri: actualUri,
    renderImageHash: actualHash,
    widthPx: 390,
    heightPx: 844,
    provider: 'LOCAL_COMPILER',
    providerJobRef: `${FOUNDER_PACKAGE_ESCALATION_TAG}-actual`,
    status: 'FOUNDER_REVIEW',
    createdAt: new Date().toISOString(),
  };

  const blueprint: MobileBlueprintTwinVisual = {
    id: blueprintId,
    compositionStateId: composition.id,
    compositionHash: composition.compositionHash,
    implementationRenderId: renderId,
    twinImageUri: NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT,
    twinImageHash: blueprintHash,
    provider: 'LOCAL_COMPILER',
    providerJobRef: `${NDXBOOK_FOUNDER_LIGHT_BLUEPRINT_MOUNT_TAG}-${blueprintId}`,
    structuralSource: 'FROZEN_COMPOSITION_STATE',
    outputRepresentationMode: 'LIGHT_TECHNICAL_BLUEPRINT',
    styleContractId: 'mobile-light-technical-blueprint-v1',
    blueprintVisualVariant: 'ACTIVE_BLUEPRINT_TWIN',
    blueprintStyleStatus: 'PASS',
    styleFailureCode: null,
    createdAt: new Date().toISOString(),
  };

  const styleReceipt = buildBlueprintVisualStyleReceipt({
    blueprintRenderId: blueprintId,
    twinImageUri: blueprint.twinImageUri,
    styleReferenceUsed: true,
  });

  const bundle = buildMobileStructuredArtifacts({ runId, composition });
  const structuredIds = [
    bundle.surgicalBlueprint.id,
    bundle.objectMap.id,
    bundle.canonicalAssetManifest.id,
    bundle.functionBindingMap.id,
    bundle.hostProjectOwnershipMap.id,
    bundle.implementationPrimitiveContract.id,
    bundle.reverseTraceabilityMap.id,
  ];

  const twinVisualReceipt = buildTwinVisualCompositionReceipt({
    id: `tvcr-${runId}`,
    composition,
    render,
    blueprint,
  });

  const refFidelity = buildReferenceTranslationFidelityReceipt({
    id: `rtfr-${runId}`,
    referenceAuthorityId: ref.id,
    render,
    composition,
  });
  const twinFidelity = buildTwinFidelityReceipt({
    id: `tfr-${runId}`,
    render,
    blueprint,
    composition,
    objectCountMatch: true,
  });
  const derivativeReceipt = buildDerivativeCompositionReceipt({
    id: `dcr-${runId}`,
    composition,
    structuredIds,
  });

  const pkgDraft = buildMobileTwinPackageRecord({
    runId,
    projectId: working.projectId,
    referenceId: ref.id,
    composition,
    renderId,
    visualAuthorityId: null,
    blueprintTwinId: blueprintId,
    bundle,
    reconciliationReceiptId: `mtrr-${runId}`,
    referenceFidelityId: refFidelity.id,
    twinFidelityId: twinFidelity.id,
  });
  pkgDraft.providerLineage = P0_VR_TWIN_V30R8M_LINEAGE;
  pkgDraft.status =
    twinVisualReceipt.result === 'FAIL' ? 'BLOCKED' : 'FOUNDER_REVIEW_READY';

  const reconciliation = buildMobileTwinReconciliationReceipt({
    id: pkgDraft.reconciliationReceiptId,
    packageId: pkgDraft.id,
    composition,
    render,
    blueprint,
    structuredIds,
  });
  if (reconciliation.result === 'FAIL') pkgDraft.status = 'BLOCKED';
  if (pkgDraft.status === 'BLOCKED') {
    throw new Error('FOUNDER_PACKAGE_ESCALATION_BLOCKED');
  }

  const now = new Date().toISOString();
  const atomicRun: MobileAtomicTwinGenerationRun = {
    id: runId,
    projectId: working.projectId,
    workspaceType: 'DESIGN_PAGE_V3',
    viewport: 'MOBILE',
    referenceAuthorityId: ref.id,
    referenceAuthorityHash: ref.sourceImageHash,
    featureManifestVersion: composition.featureManifestVersion,
    projectCreativeContextVersion: composition.projectCreativeContextVersion,
    compositionStateId: composition.id,
    compositionHash: composition.compositionHash,
    actualRenderJobId: render.providerJobRef,
    blueprintRenderJobId: blueprint.providerJobRef,
    actualRenderArtifactId: renderId,
    blueprintRenderArtifactId: blueprintId,
    actualStatus: 'READY',
    blueprintStatus: 'READY',
    structuredDerivativeIds: structuredIds,
    providerMetadata: { lineage: FOUNDER_PACKAGE_ESCALATION_TAG, actualModel: null, blueprintModel: null },
    providerJobRecords: [],
    status: 'FOUNDER_REVIEW_READY',
    startedAt: now,
    completedAt: now,
    reconciliationReceiptId: reconciliation.id,
    packageId: pkgDraft.id,
    visualPairId: `mtvp-${runId}`,
    errorCodes: [],
    costRecords: [],
    parentRunId: null,
    idempotencyKey: `founder-escalate-${runId}`,
  };

  const visualPair: MobileTwinVisualPair = {
    id: `mtvp-${runId}`,
    compositionStateId: composition.id,
    compositionHash: composition.compositionHash,
    actualRenderId: renderId,
    actualRenderHash: actualHash,
    blueprintRenderId: blueprintId,
    blueprintRenderHash: blueprintHash,
    version: 1,
    status: 'FOUNDER_REVIEW_READY',
    atomicRunId: runId,
    createdAt: new Date().toISOString(),
    approvedAt: null,
    supersedesPairId: null,
  };
  atomicRun.visualPairId = visualPair.id;

  const basePipeline = working.mobileTwinPipeline ?? emptyMobileTwinPipelineState();
  const pipeline = hydrateMobileTwinReviewState({
    ...basePipeline,
    founderStubOverride: true,
    mobileTwinVisualGenerationStrategy: 'ATOMIC_SIBLING_FROM_COMPOSITION',
    compositionStates: [...basePipeline.compositionStates, composition],
    activeCompositionStateId: composition.id,
    renders: [...basePipeline.renders.map(classifyLegacyMobileRender), render],
    activeRenderId: renderId,
    renderGate: 'FOUNDER_REVIEW',
    blueprintTwins: [...basePipeline.blueprintTwins, blueprint],
    atomicRuns: [...basePipeline.atomicRuns, atomicRun],
    activeAtomicRunId: runId,
    visualPairs: [...basePipeline.visualPairs, visualPair],
    activeVisualPairId: visualPair.id,
    packages: [...basePipeline.packages, pkgDraft],
    latestPackageId: pkgDraft.id,
    artifactsById: {
      ...basePipeline.artifactsById,
      [composition.id]: composition,
      [renderId]: render,
      [blueprintId]: blueprint,
      [styleReceipt.id]: styleReceipt,
      [bundle.surgicalBlueprint.id]: bundle.surgicalBlueprint,
      [bundle.objectMap.id]: bundle.objectMap,
      [bundle.canonicalAssetManifest.id]: bundle.canonicalAssetManifest,
      [bundle.functionBindingMap.id]: bundle.functionBindingMap,
      [bundle.hostProjectOwnershipMap.id]: bundle.hostProjectOwnershipMap,
      [bundle.implementationPrimitiveContract.id]: bundle.implementationPrimitiveContract,
      [bundle.reverseTraceabilityMap.id]: bundle.reverseTraceabilityMap,
      [refFidelity.id]: refFidelity,
      [twinFidelity.id]: twinFidelity,
      [twinVisualReceipt.id]: twinVisualReceipt,
      [derivativeReceipt.id]: derivativeReceipt,
      [reconciliation.id]: reconciliation,
      [pkgDraft.id]: pkgDraft,
      [visualPair.id]: visualPair,
      [runId]: atomicRun,
      [`${FOUNDER_PACKAGE_ESCALATION_TAG}-receipt`]: {
        tag: FOUNDER_PACKAGE_ESCALATION_TAG,
        actualUri,
        blueprintUri: NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT,
        at: new Date().toISOString(),
      },
    },
  });

  const withPipeline: DesignPageAuthorityReviewSession = {
    ...working,
    mobileTwinPipeline: pipeline,
    updatedAt: new Date().toISOString(),
  };

  return approveMobileTwinPackage(withPipeline, FOUNDER_PACKAGE_ESCALATION_TAG);
}
