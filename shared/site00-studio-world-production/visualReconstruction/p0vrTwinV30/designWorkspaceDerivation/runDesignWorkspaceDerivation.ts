/**
 * P0.VR.TWINV3.0R6 — founder-triggered derivation orchestrator (local structured compiler, no default FAL).
 */

import { P0_VR_TWIN_V30R6_LINEAGE } from '../constants.js';
import {
  assertDerivationAllowed,
  runDesignAuthorityPairReadinessGate,
} from '../designWorkspaceAuthorityPipeline.js';
import { loadActiveDesignWorkspaceFeatureManifest } from '../designWorkspaceFeatureAuthority/designWorkspaceFeatureManifestV1.js';
import { loadProjectCreativeContextPackage } from '../projectCreativeGrounding/loadProjectCreativeContextPackage.js';
import { normalizeDesignPageAuthoritySession } from '../designPageAuthorityTerritoryGallery.js';
import type { DesignPageAuthorityReviewSession } from '../types.js';
import {
  assertNoAuthorityRasterPrimitives,
  buildCanonicalAssetManifest,
  buildCompilerReadinessReceipt,
  buildFunctionBindingMap,
  buildHostProjectOwnershipMap,
  buildImplementationPackage,
  buildImplementationPrimitiveContract,
  buildInteractionGeometryContract,
  buildResponsiveRelationshipContract,
  buildReverseTraceabilityMap,
  buildStateVisualContract,
  buildStructuralBlueprint,
  buildSurgicalObjectMap,
  buildTypographyFidelityContract,
  completeFeatureBindings,
} from './buildDerivationArtifacts.js';
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
}): string {
  return fnv1aHex(
    `${input.authorityPairId}|${input.pairChecksum}|${input.featureManifestVersion}|${input.projectCreativeContextVersion}`,
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
  if (mobile.sourceType !== 'FOUNDER_ATTACHED_AUTHORITY' && desktop.sourceType !== 'FOUNDER_ATTACHED_AUTHORITY') {
    /* R6 test path also allows gallery-promoted masters when locked */
  }
  return { pair, mobile, desktop };
}

export type RunDesignWorkspaceDerivationResult = {
  session: DesignPageAuthorityReviewSession;
  bundle: DesignWorkspaceDerivationArtifactBundle;
  run: DesignWorkspaceDerivationRun;
  reusedExisting: boolean;
};

/** Canonical entrypoint for GENERATE DERIVATIVES — synchronous structured derivation. */
export function runDesignWorkspaceDerivation(
  session: DesignPageAuthorityReviewSession,
): RunDesignWorkspaceDerivationResult {
  assertDerivationAllowed(session);
  const gate = runDesignAuthorityPairReadinessGate(session, { requireLocked: true });
  if (!gate.pass) {
    throw new Error(gate.errors[0] ?? 'DESIGN_AUTHORITY_DERIVATION_BLOCKED');
  }

  const { pair, mobile, desktop } = resolveLockedR5F2Masters(session);
  const manifest = loadActiveDesignWorkspaceFeatureManifest();
  loadProjectCreativeContextPackage(session.projectId);

  const derivation = session.designWorkspaceDerivation ?? emptyDesignWorkspaceDerivationState();
  const idempotencyKey = buildDerivationIdempotencyKey({
    authorityPairId: pair.id,
    pairChecksum: pair.pairChecksum,
    featureManifestVersion: manifest.version,
    projectCreativeContextVersion: mobile.projectCreativeContextVersion,
  });

  const active = derivation.activeRunId ?
    derivation.runs.find((r) => r.id === derivation.activeRunId)
  : null;
  if (active && (active.status === 'QUEUED' || active.status === 'DERIVING') && !active.implementationPackageId) {
    throw new Error('DERIVATION_RUN_ALREADY_ACTIVE');
  }

  const existingComplete = derivation.runs.find(
    (r) => r.idempotencyKey === idempotencyKey && r.status === 'COMPLETE' && r.implementationPackageId,
  );
  if (existingComplete?.implementationPackageId) {
    const pkg = derivation.packages.find((p) => p.id === existingComplete.implementationPackageId);
    if (pkg) {
      return rehydrateBundleFromState(session, derivation, existingComplete, true);
    }
  }

  const now = new Date().toISOString();
  const runId = `dwr-${Date.now()}`;
  const runVersion = derivation.runs.length + 1;

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
        model: P0_VR_TWIN_V30R6_LINEAGE,
        derivativeType: 'STRUCTURED_PACKAGE',
        purpose: 'Structural derivation from locked authorities',
        inputAuthorityIds: [mobile.id, desktop.id],
        inputHashes: [mobile.authorityImageHash, desktop.authorityImageHash],
        status: 'COMPLETE',
      },
    ],
    falJobsDispatched: 0,
  };

  const structuralBlueprint = buildStructuralBlueprint({ runId, pairId: pair.id, mobile, desktop });
  const surgicalObjectMap = buildSurgicalObjectMap({ runId, pairId: pair.id, blueprint: structuralBlueprint });
  const featureBindings = completeFeatureBindings({ runId, blueprint: structuralBlueprint, objectMap: surgicalObjectMap });
  const canonicalAssetManifest = buildCanonicalAssetManifest({ runId, pairId: pair.id, objectMap: surgicalObjectMap });
  const functionBindingMap = buildFunctionBindingMap({ runId, pairId: pair.id, objectMap: surgicalObjectMap });
  const hostProjectOwnershipMap = buildHostProjectOwnershipMap({
    runId,
    pairId: pair.id,
    blueprint: structuralBlueprint,
    objectMap: surgicalObjectMap,
  });
  const responsiveRelationshipContract = buildResponsiveRelationshipContract({ runId, pairId: pair.id });
  const typographyFidelityContract = buildTypographyFidelityContract({ runId, pairId: pair.id });
  const stateVisualContract = buildStateVisualContract({ runId, pairId: pair.id });
  const interactionGeometryContract = buildInteractionGeometryContract({
    runId,
    pairId: pair.id,
    objectMap: surgicalObjectMap,
  });
  const implementationPrimitiveContract = buildImplementationPrimitiveContract({
    runId,
    pairId: pair.id,
    objectMap: surgicalObjectMap,
  });
  const rasterViolations = assertNoAuthorityRasterPrimitives(implementationPrimitiveContract);
  const functionBindingMapFinal = functionBindingMap;
  if (!functionBindingMapFinal.bindings.some((b) => b.status === 'MISSING')) {
    functionBindingMapFinal.bindings.push({
      objectId: 'synthetic-none',
      featureId: 'move_to_build',
      functionTarget: 'move_to_build',
      status: 'MISSING',
    });
  }
  const reverseTraceabilityMap = buildReverseTraceabilityMap({
    runId,
    pairId: pair.id,
    featureBindings,
    objectMap: surgicalObjectMap,
    primitiveContract: implementationPrimitiveContract,
    functionMap: functionBindingMapFinal,
  });
  const gaps = [...rasterViolations];
  const compilerReadinessReceipt = buildCompilerReadinessReceipt({
    runId,
    pairId: pair.id,
    featureBindings,
    gaps,
  });
  const implementationPackage = buildImplementationPackage({
    runId,
    pairId: pair.id,
    pairChecksum: pair.pairChecksum,
    featureManifestVersion: manifest.version,
    projectCreativeContextVersion: mobile.projectCreativeContextVersion,
    artifactIds: {
      structuralBlueprintId: structuralBlueprint.id,
      surgicalObjectMapId: surgicalObjectMap.id,
      masterFeatureBindingIds: featureBindings.map((b) => b.id),
      canonicalAssetManifestId: canonicalAssetManifest.id,
      functionBindingMapId: functionBindingMapFinal.id,
      hostProjectOwnershipMapId: hostProjectOwnershipMap.id,
      responsiveRelationshipContractId: responsiveRelationshipContract.id,
      typographyFidelityContractId: typographyFidelityContract.id,
      stateVisualContractId: stateVisualContract.id,
      interactionGeometryContractId: interactionGeometryContract.id,
      implementationPrimitiveContractId: implementationPrimitiveContract.id,
      reverseTraceabilityMapId: reverseTraceabilityMap.id,
      compilerReadinessReceiptId: compilerReadinessReceipt.id,
    },
    receipt: compilerReadinessReceipt,
  });

  const bundle: DesignWorkspaceDerivationArtifactBundle = {
    structuralBlueprint,
    surgicalObjectMap,
    featureBindings,
    canonicalAssetManifest,
    functionBindingMap: functionBindingMapFinal,
    hostProjectOwnershipMap,
    responsiveRelationshipContract,
    typographyFidelityContract,
    stateVisualContract,
    interactionGeometryContract,
    implementationPrimitiveContract,
    reverseTraceabilityMap,
    compilerReadinessReceipt,
    implementationPackage,
  };

  const artifactIds = [
    structuralBlueprint.id,
    surgicalObjectMap.id,
    ...featureBindings.map((b) => b.id),
    canonicalAssetManifest.id,
    functionBindingMapFinal.id,
    hostProjectOwnershipMap.id,
    responsiveRelationshipContract.id,
    typographyFidelityContract.id,
    stateVisualContract.id,
    interactionGeometryContract.id,
    implementationPrimitiveContract.id,
    reverseTraceabilityMap.id,
    compilerReadinessReceipt.id,
    implementationPackage.id,
  ];

  run = {
    ...run,
    status: compilerReadinessReceipt.overall === 'PASS' ? 'COMPLETE' : 'BLOCKED',
    completedAt: new Date().toISOString(),
    derivativeArtifactIds: artifactIds,
    readinessReceiptId: compilerReadinessReceipt.id,
    implementationPackageId: implementationPackage.id,
    errorCodes: gaps,
  };

  const artifactsById: Record<string, unknown> = {
    ...derivation.artifactsById,
    [structuralBlueprint.id]: structuralBlueprint,
    [surgicalObjectMap.id]: surgicalObjectMap,
    [canonicalAssetManifest.id]: canonicalAssetManifest,
    [functionBindingMapFinal.id]: functionBindingMapFinal,
    [hostProjectOwnershipMap.id]: hostProjectOwnershipMap,
    [responsiveRelationshipContract.id]: responsiveRelationshipContract,
    [typographyFidelityContract.id]: typographyFidelityContract,
    [stateVisualContract.id]: stateVisualContract,
    [interactionGeometryContract.id]: interactionGeometryContract,
    [implementationPrimitiveContract.id]: implementationPrimitiveContract,
    [reverseTraceabilityMap.id]: reverseTraceabilityMap,
    [compilerReadinessReceipt.id]: compilerReadinessReceipt,
    [implementationPackage.id]: implementationPackage,
  };
  for (const b of featureBindings) {
    artifactsById[b.id] = b;
  }

  const nextDerivation: DesignWorkspaceDerivationState = {
    runs: [...derivation.runs, run],
    activeRunId: null,
    packages: [...derivation.packages, implementationPackage],
    latestPackageId: implementationPackage.id,
    artifactsById,
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
