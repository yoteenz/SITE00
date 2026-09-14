/**
 * P0.VR.TWINV3.0R6F1 — founder-triggered derivation (pixel-grounded measurement, no default FAL).
 */

import { P0_VR_TWIN_V30R6F1_LINEAGE } from '../constants.js';
import {
  assertDerivationAllowed,
  runDesignAuthorityPairReadinessGate,
} from '../designWorkspaceAuthorityPipeline.js';
import { loadActiveDesignWorkspaceFeatureManifest } from '../designWorkspaceFeatureAuthority/designWorkspaceFeatureManifestV1.js';
import { loadProjectCreativeContextPackage } from '../projectCreativeGrounding/loadProjectCreativeContextPackage.js';
import { normalizeDesignPageAuthoritySession } from '../designPageAuthorityTerritoryGallery.js';
import type { DesignPageAuthorityReviewSession } from '../types.js';
import { buildPixelGroundedDerivationBundle } from './runPixelGroundedDerivation.js';
import { DERIVATION_ALGORITHM_R6F1 } from './pixelGroundedTypes.js';
import type {
  DesignWorkspaceDerivationArtifactBundle,
  DesignWorkspaceDerivationRun,
  DesignWorkspaceDerivationState,
} from './types.js';

function fnv1aHex(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function buildDerivationIdempotencyKey(input: {
  authorityPairId: string;
  pairChecksum: string;
  featureManifestVersion: string;
  projectCreativeContextVersion: string;
  derivationAlgorithm?: string;
  derivationVersion?: number;
}): string {
  return fnv1aHex(
    `${input.authorityPairId}|${input.pairChecksum}|${input.featureManifestVersion}|${input.projectCreativeContextVersion}|${input.derivationAlgorithm ?? DERIVATION_ALGORITHM_R6F1}|v${input.derivationVersion ?? 1}`,
  );
}

export function markDerivationRunActive(
  session: DesignPageAuthorityReviewSession,
  status: 'QUEUED' | 'DERIVING' = 'DERIVING',
): DesignPageAuthorityReviewSession {
  const derivation = session.designWorkspaceDerivation ?? emptyDesignWorkspaceDerivationState();
  const pair = session.authorityPipeline?.authorityPair;
  const mobile = session.authorityPipeline?.mobileMaster;
  if (!pair || !mobile) return session;
  const runId = `dwr-active-${Date.now()}`;
  const run: DesignWorkspaceDerivationRun = {
    id: runId,
    projectId: session.projectId,
    workspaceType: 'DESIGN_PAGE_V3',
    authorityPairId: pair.id,
    authorityPairVersion: pair.pairVersion,
    pairChecksum: pair.pairChecksum,
    mobileAuthorityId: mobile.id,
    mobileAuthorityHash: mobile.authorityImageHash,
    desktopAuthorityId: session.authorityPipeline!.desktopMaster!.id,
    desktopAuthorityHash: session.authorityPipeline!.desktopMaster!.authorityImageHash,
    featureManifestVersion: mobile.designWorkspaceFeatureManifestVersion,
    projectCreativeContextVersion: mobile.projectCreativeContextVersion,
    executionIntent: 'TRANSLATION',
    inventionBudget: 'NONE',
    status,
    startedAt: new Date().toISOString(),
    completedAt: null,
    derivativeArtifactIds: [],
    readinessReceiptId: null,
    implementationPackageId: null,
    errorCodes: [],
    version: derivation.runs.length + 1,
    idempotencyKey: buildDerivationIdempotencyKey({
      authorityPairId: pair.id,
      pairChecksum: pair.pairChecksum,
      featureManifestVersion: mobile.designWorkspaceFeatureManifestVersion,
      projectCreativeContextVersion: mobile.projectCreativeContextVersion,
      derivationVersion: derivation.runs.length + 1,
    }),
    providerDispatches: [],
    falJobsDispatched: 0,
  };
  return {
    ...session,
    designWorkspaceDerivation: {
      ...derivation,
      runs: [...derivation.runs, run],
      activeRunId: runId,
    },
  };
}

export function emptyDesignWorkspaceDerivationState(): DesignWorkspaceDerivationState {
  return {
    runs: [],
    activeRunId: null,
    packages: [],
    latestPackageId: null,
    artifactsById: {},
  };
}

function resolveLockedR5F2Masters(session: DesignPageAuthorityReviewSession) {
  const pair = session.authorityPipeline?.authorityPair;
  const mobile = session.authorityPipeline?.mobileMaster;
  const desktop = session.authorityPipeline?.desktopMaster;
  if (!pair || pair.status !== 'PAIR_LOCKED') throw new Error('AUTHORITY_PAIR_NOT_LOCKED');
  if (pair.derivationStatus === 'STALE') throw new Error('DESIGN_AUTHORITY_DERIVATION_STALE');
  if (!mobile || !desktop) throw new Error('DESIGN_AUTHORITY_PAIR_NOT_READY');
  return { pair, mobile, desktop };
}

export type RunDesignWorkspaceDerivationResult = {
  session: DesignPageAuthorityReviewSession;
  bundle: DesignWorkspaceDerivationArtifactBundle;
  run: DesignWorkspaceDerivationRun;
  reusedExisting: boolean;
};

/** Canonical entrypoint for GENERATE DERIVATIVES — async pixel-grounded derivation. */
export async function runDesignWorkspaceDerivation(
  session: DesignPageAuthorityReviewSession,
): Promise<RunDesignWorkspaceDerivationResult> {
  assertDerivationAllowed(session);
  const gate = runDesignAuthorityPairReadinessGate(session, { requireLocked: true });
  if (!gate.pass) {
    throw new Error(gate.errors[0] ?? 'DESIGN_AUTHORITY_DERIVATION_BLOCKED');
  }

  const { pair, mobile, desktop } = resolveLockedR5F2Masters(session);
  const manifest = loadActiveDesignWorkspaceFeatureManifest();
  loadProjectCreativeContextPackage(session.projectId);

  const derivation = session.designWorkspaceDerivation ?? emptyDesignWorkspaceDerivationState();
  const runVersion = derivation.runs.length + 1;
  const correctionRequested = Boolean(derivation.correctionRequested);
  const translationApproved = derivation.translationReview?.founderDecision === 'APPROVE_TRANSLATION';

  const idempotencyKey = buildDerivationIdempotencyKey({
    authorityPairId: pair.id,
    pairChecksum: pair.pairChecksum,
    featureManifestVersion: manifest.version,
    projectCreativeContextVersion: mobile.projectCreativeContextVersion,
    derivationVersion: correctionRequested ? runVersion : 1,
  });

  const active = derivation.activeRunId ? derivation.runs.find((r) => r.id === derivation.activeRunId) : null;
  if (active && (active.status === 'QUEUED' || active.status === 'DERIVING') && !active.implementationPackageId) {
    throw new Error('DERIVATION_RUN_ALREADY_ACTIVE');
  }

  if (!correctionRequested) {
    const existingComplete = derivation.runs.find(
      (r) => r.idempotencyKey === idempotencyKey && r.status === 'COMPLETE' && r.implementationPackageId,
    );
    if (existingComplete?.implementationPackageId) {
      const pkg = derivation.packages.find((p) => p.id === existingComplete.implementationPackageId);
      if (pkg?.derivationAlgorithm === 'R6F1') {
        return rehydrateBundleFromState(session, derivation, existingComplete, true);
      }
    }
  }

  const now = new Date().toISOString();
  const runId = `dwr-${Date.now()}`;

  let run: DesignWorkspaceDerivationRun = {
    id: runId,
    projectId: session.projectId,
    workspaceType: 'DESIGN_PAGE_V3',
    authorityPairId: pair.id,
    authorityPairVersion: pair.pairVersion,
    pairChecksum: pair.pairChecksum,
    mobileAuthorityId: mobile.id,
    mobileAuthorityHash: mobile.authorityImageHash,
    desktopAuthorityId: desktop.id,
    desktopAuthorityHash: desktop.authorityImageHash,
    featureManifestVersion: manifest.version,
    projectCreativeContextVersion: mobile.projectCreativeContextVersion,
    executionIntent: 'TRANSLATION',
    inventionBudget: 'NONE',
    status: 'DERIVING',
    startedAt: now,
    completedAt: null,
    derivativeArtifactIds: [],
    readinessReceiptId: null,
    implementationPackageId: null,
    errorCodes: [],
    version: runVersion,
    idempotencyKey,
    providerDispatches: [
      {
        id: `pdd-${runId}-local`,
        provider: 'LOCAL_COMPILER',
        model: P0_VR_TWIN_V30R6F1_LINEAGE,
        derivativeType: 'STRUCTURED_PACKAGE',
        purpose: 'Pixel-grounded derivation from locked authorities',
        inputAuthorityIds: [mobile.id, desktop.id],
        inputHashes: [mobile.authorityImageHash, desktop.authorityImageHash],
        status: 'COMPLETE',
      },
    ],
    falJobsDispatched: 0,
  };

  const pixel = await buildPixelGroundedDerivationBundle({
    runId,
    pairId: pair.id,
    pairChecksum: pair.pairChecksum,
    mobile,
    desktop,
    featureManifestVersion: manifest.version,
    projectCreativeContextVersion: mobile.projectCreativeContextVersion,
    translationApproved,
    mobileGranularityId: `ogr-${runId}-mobile`,
    desktopGranularityId: `ogr-${runId}-desktop`,
    mobileCoverageId: `avcr-${runId}-mobile`,
    desktopCoverageId: `avcr-${runId}-desktop`,
    mobileWeightedId: `wacr-${runId}-mobile`,
    desktopWeightedId: `wacr-${runId}-desktop`,
    visualClusterMapId: `vcm-${runId}`,
    responsiveObjectCorrespondenceMapId: `rocm-${runId}`,
  });

  const bundle = pixel.bundle;
  const gaps = pixel.visualCoverageGatePass ? [] : ['AUTHORITY_VISUAL_COVERAGE_INCOMPLETE'];

  const artifactIds = [
    bundle.structuralBlueprint.id,
    bundle.surgicalObjectMap.id,
    ...bundle.featureBindings.map((b) => b.id),
    bundle.canonicalAssetManifest.id,
    bundle.functionBindingMap.id,
    bundle.hostProjectOwnershipMap.id,
    bundle.responsiveRelationshipContract.id,
    bundle.typographyFidelityContract.id,
    bundle.stateVisualContract.id,
    bundle.interactionGeometryContract.id,
    bundle.implementationPrimitiveContract.id,
    bundle.reverseTraceabilityMap.id,
    bundle.compilerReadinessReceipt.id,
    bundle.implementationPackage.id,
    ...Object.keys(pixel.artifactExtras),
  ];

  run = {
    ...run,
    status: pixel.visualCoverageGatePass && bundle.compilerReadinessReceipt.overall === 'PASS' ? 'COMPLETE' : 'BLOCKED',
    completedAt: new Date().toISOString(),
    derivativeArtifactIds: artifactIds,
    readinessReceiptId: bundle.compilerReadinessReceipt.id,
    implementationPackageId: bundle.implementationPackage.id,
    errorCodes: gaps,
  };

  const artifactsById: Record<string, unknown> = {
    ...derivation.artifactsById,
    [bundle.structuralBlueprint.id]: bundle.structuralBlueprint,
    [bundle.surgicalObjectMap.id]: bundle.surgicalObjectMap,
    [bundle.canonicalAssetManifest.id]: bundle.canonicalAssetManifest,
    [bundle.functionBindingMap.id]: bundle.functionBindingMap,
    [bundle.hostProjectOwnershipMap.id]: bundle.hostProjectOwnershipMap,
    [bundle.responsiveRelationshipContract.id]: bundle.responsiveRelationshipContract,
    [bundle.typographyFidelityContract.id]: bundle.typographyFidelityContract,
    [bundle.stateVisualContract.id]: bundle.stateVisualContract,
    [bundle.interactionGeometryContract.id]: bundle.interactionGeometryContract,
    [bundle.implementationPrimitiveContract.id]: bundle.implementationPrimitiveContract,
    [bundle.reverseTraceabilityMap.id]: bundle.reverseTraceabilityMap,
    [bundle.compilerReadinessReceipt.id]: bundle.compilerReadinessReceipt,
    [bundle.implementationPackage.id]: bundle.implementationPackage,
    ...pixel.artifactExtras,
  };
  for (const b of bundle.featureBindings) {
    artifactsById[b.id] = b;
  }

  const nextDerivation: DesignWorkspaceDerivationState = {
    runs: [...derivation.runs, run],
    activeRunId: null,
    packages: [...derivation.packages, bundle.implementationPackage],
    latestPackageId: bundle.implementationPackage.id,
    artifactsById,
    correctionRequested: false,
    translationReview: correctionRequested ?
      {
        id: `trr-pending-${runId}`,
        derivationRunId: runId,
        authorityPairId: pair.id,
        packageId: bundle.implementationPackage.id,
        founderDecision: 'PENDING',
        reviewNotes: '',
        requestedCorrections: [],
        approvedAt: null,
        rejectedAt: null,
        reviewedBy: null,
      }
    : derivation.translationReview,
  };

  const pipeline = session.authorityPipeline!;
  const nextSession = normalizeDesignPageAuthoritySession({
    ...session,
    designWorkspaceDerivation: nextDerivation,
    authorityPipeline: {
      ...pipeline,
      authorityPair: {
        ...pair,
        derivationStatus: run.status === 'COMPLETE' ? 'COMPLETE' : 'BLOCKED',
        status: pair.status,
      },
    },
    updatedAt: new Date().toISOString(),
  });

  return { session: nextSession, bundle, run, reusedExisting: false };
}

function rehydrateBundleFromState(
  session: DesignPageAuthorityReviewSession,
  derivation: DesignWorkspaceDerivationState,
  run: DesignWorkspaceDerivationRun,
  reusedExisting: boolean,
): RunDesignWorkspaceDerivationResult {
  const pkg = derivation.packages.find((p) => p.id === run.implementationPackageId)!;
  const get = <T,>(id: string): T => derivation.artifactsById[id] as T;
  const bundle: DesignWorkspaceDerivationArtifactBundle = {
    structuralBlueprint: get(pkg.structuralBlueprintId),
    surgicalObjectMap: get(pkg.surgicalObjectMapId),
    featureBindings: pkg.masterFeatureBindingIds.map((id) => get(id)),
    canonicalAssetManifest: get(pkg.canonicalAssetManifestId),
    functionBindingMap: get(pkg.functionBindingMapId),
    hostProjectOwnershipMap: get(pkg.hostProjectOwnershipMapId),
    responsiveRelationshipContract: get(pkg.responsiveRelationshipContractId),
    typographyFidelityContract: get(pkg.typographyFidelityContractId),
    stateVisualContract: get(pkg.stateVisualContractId),
    interactionGeometryContract: get(pkg.interactionGeometryContractId),
    implementationPrimitiveContract: get(pkg.implementationPrimitiveContractId),
    reverseTraceabilityMap: get(pkg.reverseTraceabilityMapId),
    compilerReadinessReceipt: get(pkg.compilerReadinessReceiptId),
    implementationPackage: pkg,
  };
  return { session, bundle, run, reusedExisting };
}

/** Marks package FEATURE_STALE when manifest version diverges. */
export function refreshImplementationPackageStaleState(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  const derivation = session.designWorkspaceDerivation;
  if (!derivation?.latestPackageId) return session;
  const manifest = loadActiveDesignWorkspaceFeatureManifest();
  const pkg = derivation.packages.find((p) => p.id === derivation.latestPackageId);
  if (!pkg || pkg.featureManifestVersion === manifest.version) return session;
  const updated = derivation.packages.map((p) =>
    p.id === pkg.id ? { ...p, status: 'FEATURE_STALE' as const } : p,
  );
  return { ...session, designWorkspaceDerivation: { ...derivation, packages: updated } };
}
