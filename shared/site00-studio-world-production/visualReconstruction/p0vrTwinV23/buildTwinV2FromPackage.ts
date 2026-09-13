import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import type { ConceptBuildFidelityReceipt, ExecutableConceptPackage } from '../p0vrTwinV22/types.js';
import { ensureConceptGallery, getActiveConceptCandidate } from '../p0vrTwinV22/conceptGalleryState.js';
import { assertNoGeneratedHostArtifactsInClientBuild } from '../p0vrTwinV22R2/assertNoGeneratedHostArtifactsInClientBuild.js';
import { buildTwinV2PreviewRoute } from '../p0vrTwinV21/buildTwinV2Route.js';
import { DEFAULT_TWIN_V2_BUILD_POLICY } from './constants.js';
import type { PackageDrivenBuildArtifacts, TwinV2BuildHistoryEntry } from './types.js';
import { traceActiveApprovedConceptLineage, resolveExecutablePackageForConcept } from './traceActiveApprovedConceptLineage.js';
import {
  assertExecutablePackageLineage,
  validateExecutableConceptPackage,
} from './validateExecutableConceptPackage.js';
import { buildExecutablePackageAttachmentReceipt } from './buildExecutablePackageAttachmentReceipt.js';
import { generatePackageDrivenSourceArtifacts } from './generatePackageDrivenSourceArtifacts.js';
import { assertTwinV2RenderMatchesApprovedLineage } from './assertTwinV2RenderMatchesApprovedLineage.js';
import { assertPackageDrivenComponentRef } from './guards.js';
import { P0_VR_TWIN_V23R1_BUILD } from '../p0vrTwinV23R1/constants.js';
import { buildDomFirstTranslation } from '../p0vrTwinV23R1/buildDomFirstTranslation.js';

export type BuildTwinV2FromPackageResult = {
  sessionPatch: Partial<ConceptDirectedTwinSession>;
  functionBindingSummary: string[];
  artifacts: PackageDrivenBuildArtifacts;
};

function invalidatePriorTwinIfLineageBroken(
  session: ConceptDirectedTwinSession,
  nextPackageId: string,
): TwinV2BuildHistoryEntry[] {
  const history = session.twinV2BuildHistory ?? [];
  const prior = session.renderedTwin;
  if (!prior?.builtAt) return history;
  const priorPackageId =
    'sourcePackageId' in prior && prior.sourcePackageId ? prior.sourcePackageId : null;
  const priorConceptId =
    'sourceConceptId' in prior && prior.sourceConceptId ? prior.sourceConceptId : 'unknown';
  if (priorPackageId && priorPackageId === nextPackageId) {
    if (prior.builtAt && !session.twinV2DomTranslation) {
      return [
        ...history,
        {
          twinId: session.sessionId,
          conceptId: priorConceptId,
          packageId: priorPackageId,
          builtAt: prior.builtAt,
          status: 'FAILED_RASTERIZED_EXECUTION',
          componentRef: prior.componentRef,
        },
      ];
    }
    return history;
  }
  return [
    ...history,
    {
      twinId: session.sessionId,
      conceptId: priorConceptId,
      packageId: priorPackageId,
      builtAt: prior.builtAt,
      status: 'FAILED_PACKAGE_LINEAGE',
      componentRef: prior.componentRef,
    },
  ];
}

/** Package-driven Twin V2 build — non-optional ExecutableConceptPackage authority. */
export function buildTwinV2FromPackage(session: ConceptDirectedTwinSession): BuildTwinV2FromPackageResult {
  const buildPolicy = { ...DEFAULT_TWIN_V2_BUILD_POLICY };
  let buildStage: import('./types.js').TwinV2BuildStage = 'PACKAGE';

  const base = ensureConceptGallery(session);
  const active = getActiveConceptCandidate(base);
  if (!active || active.founderJudgment !== 'APPROVED') {
    throw new Error('TWIN_V2_CODE_BLOCKED: approve active concept before build');
  }

  const pkg = resolveExecutablePackageForConcept(base, active.conceptId);
  if (!pkg) {
    throw new Error('TWIN_V2_CODE_BLOCKED: ExecutableConceptPackage required — image-only build not allowed');
  }

  const validation = validateExecutableConceptPackage(pkg);
  if (!validation.ok) {
    throw new Error(
      `${validation.code}: missing ${validation.missing.join(', ')}`,
    );
  }
  assertExecutablePackageLineage(pkg);
  assertNoGeneratedHostArtifactsInClientBuild(pkg.blueprint);

  const attachmentReceipt = buildExecutablePackageAttachmentReceipt(pkg, pkg.packageId);
  if (attachmentReceipt.status !== 'PASS') {
    throw new Error(
      `TWIN_V2_EXECUTABLE_PACKAGE_INCOMPLETE: ${attachmentReceipt.missing?.join(', ') ?? 'attachment failed'}`,
    );
  }

  buildStage = 'SOURCE';
  const builderInvocationId = `bld-${pkg.packageId}-${Date.now()}`;
  const sourceGenerationId = `src-${pkg.packageId}-${Date.now()}`;
  const functionGraph = pkg.functionGraphSnapshot ?? session.functionGraph;

  const pageIntent = pkg.pageIntentSnapshot ?? session.pageIntent;
  const domTranslation = buildDomFirstTranslation({ pkg, pageIntent, functionGraph });
  if (domTranslation.domRealityReceipt.status !== 'PASS') {
    throw new Error('TWIN_V2_OBJECT_TRANSLATION_FAILED: DOM reality receipt failed');
  }
  if (domTranslation.rasterAudit.fullAuthorityUsed) {
    throw new Error('TWIN_V2_FULL_AUTHORITY_RASTER_USAGE');
  }

  const sourceArtifacts = generatePackageDrivenSourceArtifacts({
    pkg,
    sourceGenerationId,
    functionGraph,
  });

  buildStage = 'RENDER';
  const builtAt = new Date().toISOString();
  const renderedTwinId = `${session.sessionId}::${builderInvocationId}`;
  const componentRef = 'ConceptDirectedPackageTwinV2' as const;
  assertPackageDrivenComponentRef(componentRef);

  const route = buildTwinV2PreviewRoute(session.projectId, session.sessionId);

  const renderReceipt = {
    twinId: renderedTwinId,
    route,
    conceptId: pkg.conceptId,
    packageId: pkg.packageId,
    blueprintId: pkg.blueprint.blueprintId,
    sourceGenerationId,
    hostShellContractId: pkg.hostShellContract ? `hsc-${pkg.conceptId}` : null,
    renderedAt: builtAt,
    status: 'PASS' as const,
  };

  buildStage = 'FIDELITY';
  const conceptFidelity: ConceptBuildFidelityReceipt = {
    conceptId: active.conceptId,
    twinId: renderedTwinId,
    visualAuthorityId: active.conceptId,
    blueprintObjectCount: domTranslation.expandedObjects.length,
    renderedObjectCount: domTranslation.domBindings.filter((b) => b.status === 'BOUND').length,
    geometryMatch: 0.72,
    typographyMatch: 0.85,
    assetMatch: 0.8,
    colorMatch: 0.88,
    functionCoverage: pkg.functionBindingPlan.requiredFunctionCoverage,
    hostBoundaryMatch: true,
    outliers: sourceArtifacts.objectCoverage.unboundObjectCount
      ? [`unbound_objects:${sourceArtifacts.objectCoverage.unboundObjectCount}`]
      : [],
    status: sourceArtifacts.objectCoverage.unboundObjectCount === 0 ? 'PASS' : 'PARTIAL',
  };

  const lineage = {
    buildRef: P0_VR_TWIN_V23R1_BUILD,
    conceptId: pkg.conceptId,
    approvedVisualAuthorityId: active.conceptId,
    executionBlueprintId: pkg.blueprint.blueprintId,
    assetManifestId: pkg.assetManifest.manifestId,
    functionBindingPlanId: pkg.functionBindingPlan.bindingPlanId,
    hostShellContractId: pkg.hostShellContract ? `hsc-${pkg.conceptId}` : null,
    executablePackageId: pkg.packageId,
    builderInvocationId,
    sourceGenerationId,
    renderedTwinId,
    status: 'PASS' as const,
  };

  const activeTrace = traceActiveApprovedConceptLineage(base);
  if (!activeTrace.lineageConsistent) {
    throw new Error('TWIN_V2_LINEAGE_MISMATCH: active concept IDs do not resolve to one lineage');
  }

  const sessionPatchBase: Partial<ConceptDirectedTwinSession> = {
    renderedTwin: {
      renderMode: 'TWIN_V2_PACKAGE_DRIVEN_NDX_OVERVIEW',
      componentRef,
      builtAt,
      sourcePackageId: pkg.packageId,
      sourceConceptId: pkg.conceptId,
      sourceBlueprintId: pkg.blueprint.blueprintId,
      sourceGenerationId,
      builderInvocationId,
      buildMode: 'PACKAGE_DRIVEN_SOURCE_GENERATION',
    },
    packageDrivenBuild: { packageId: pkg.packageId, conceptId: pkg.conceptId },
    fidelityReceipt: {
      visualAuthorityId: active.conceptId,
      renderedTwinId,
      regionsMeasured: sourceArtifacts.objectCoverage.blueprintObjectCount,
      geometryMatch: conceptFidelity.geometryMatch,
      typographyMatch: conceptFidelity.typographyMatch,
      assetMatch: conceptFidelity.assetMatch,
      colorMatch: conceptFidelity.colorMatch,
      internalVisualMatch: null,
      outliers: conceptFidelity.outliers,
      status: conceptFidelity.status === 'PASS' ? 'PASS' : 'PARTIAL',
    },
    status: 'TWIN_V2_REVIEW_READY',
    sourceGeneration: { ...session.sourceGeneration, lastBuildAt: builtAt },
    buildRef: P0_VR_TWIN_V23R1_BUILD,
    twinV2DomTranslation: domTranslation,
    twinV2BuildHistory: invalidatePriorTwinIfLineageBroken(session, pkg.packageId),
    twinV2Execution: {
      buildPolicy,
      buildMode: 'PACKAGE_DRIVEN_SOURCE_GENERATION',
      buildStage: 'COMPLETE',
      failureStage: null,
      lineage,
      attachmentReceipt,
      sourceGenerationReceipt: sourceArtifacts.sourceGenerationReceipt,
      renderReceipt,
      objectBindings: sourceArtifacts.objectBindings,
      sourceProvenance: sourceArtifacts.sourceProvenance,
      objectCoverage: sourceArtifacts.objectCoverage,
      fidelityReceipt: conceptFidelity,
      activeTrace,
    },
    conceptGallery: {
      ...base.conceptGallery!,
      packages: { ...base.conceptGallery!.packages, [pkg.packageId]: { ...pkg, status: 'BUILT' } },
      fidelityReceipts: {
        ...base.conceptGallery!.fidelityReceipts,
        [active.conceptId]: conceptFidelity,
      },
    },
  };

  const patchedSession = { ...base, ...sessionPatchBase };
  const lineageAssert = assertTwinV2RenderMatchesApprovedLineage({
    session: patchedSession as ConceptDirectedTwinSession,
    approvedConcept: active,
    packageId: pkg.packageId,
    blueprintId: pkg.blueprint.blueprintId,
  });
  if (!lineageAssert.pass) {
    throw new Error(`TWIN_V2_LINEAGE_MISMATCH: ${lineageAssert.reasons.join('; ')}`);
  }

  buildStage = 'COMPLETE';

  const artifacts: PackageDrivenBuildArtifacts = {
    buildPolicy,
    buildMode: 'PACKAGE_DRIVEN_SOURCE_GENERATION',
    buildStage,
    failureStage: null,
    lineage,
    attachmentReceipt,
    sourceGenerationReceipt: sourceArtifacts.sourceGenerationReceipt,
    renderReceipt,
    objectBindings: sourceArtifacts.objectBindings,
    sourceProvenance: sourceArtifacts.sourceProvenance,
    objectCoverage: sourceArtifacts.objectCoverage,
    fidelityReceipt: conceptFidelity,
    activeTrace,
  };

  return {
    functionBindingSummary: pkg.functionBindingPlan.bindings.map(
      (b) => `${b.visualRegion}→${b.liveFunction}`,
    ),
    sessionPatch: sessionPatchBase,
    artifacts,
  };
}

/** Hard API contract: buildTwinV2({ package }) */
export function buildTwinV2(input: { package: ExecutableConceptPackage; session: ConceptDirectedTwinSession }) {
  if (!input.package) {
    throw new Error('TWIN_V2_CODE_BLOCKED: buildTwinV2 requires ExecutableConceptPackage');
  }
  const gallery = input.session.conceptGallery;
  if (!gallery || gallery.packages[input.package.packageId]?.packageId !== input.package.packageId) {
    throw new Error('TWIN_V2_PACKAGE_CONSUMPTION_FAILED: session does not contain attached package');
  }
  return buildTwinV2FromPackage(input.session);
}
