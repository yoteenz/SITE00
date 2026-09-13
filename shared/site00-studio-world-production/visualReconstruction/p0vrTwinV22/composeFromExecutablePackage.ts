import type { ConceptDirectedTwinSession, TwinV2FidelityReceipt } from '../p0vrTwinV21/types.js';
import { P0_VR_TWIN_V21_BUILD } from '../p0vrTwinV21/constants.js';
import type { ConceptBuildFidelityReceipt } from './types.js';
import { ensureConceptGallery, getActiveConceptCandidate } from './conceptGalleryState.js';
import { assertNoGeneratedHostArtifactsInClientBuild } from '../p0vrTwinV22R2/assertNoGeneratedHostArtifactsInClientBuild.js';

export type ConceptDirectedTwinV2ComposeFromPackageResult = {
  sessionPatch: Partial<ConceptDirectedTwinSession>;
  functionBindingSummary: string[];
  fidelityReceipt: ConceptBuildFidelityReceipt;
};

export function composeConceptDirectedTwinV2FromPackage(
  session: ConceptDirectedTwinSession,
): ConceptDirectedTwinV2ComposeFromPackageResult {
  const base = ensureConceptGallery(session);
  const gallery = base.conceptGallery!;
  const active = getActiveConceptCandidate(base);
  if (!active || active.founderJudgment !== 'APPROVED') {
    throw new Error('TWIN_V2_CODE_BLOCKED: approve active concept before build');
  }

  const pkg = Object.values(gallery.packages).find((p) => p.conceptId === active.conceptId);
  if (!pkg) {
    throw new Error('TWIN_V2_CODE_BLOCKED: ExecutableConceptPackage required — image-only build not allowed');
  }

  assertNoGeneratedHostArtifactsInClientBuild(pkg.blueprint);

  const builtAt = new Date().toISOString();
  const twinFidelity: TwinV2FidelityReceipt = {
    visualAuthorityId: active.conceptId,
    renderedTwinId: session.sessionId,
    regionsMeasured: pkg.blueprint.objects.length,
    geometryMatch: null,
    typographyMatch: null,
    assetMatch: null,
    colorMatch: null,
    internalVisualMatch: null,
    outliers: [],
    status: 'PENDING',
  };

  const conceptFidelity: ConceptBuildFidelityReceipt = {
    conceptId: active.conceptId,
    twinId: session.sessionId,
    visualAuthorityId: active.conceptId,
    blueprintObjectCount: pkg.blueprint.objects.length,
    renderedObjectCount: 0,
    geometryMatch: null,
    typographyMatch: null,
    assetMatch: null,
    colorMatch: null,
    functionCoverage: pkg.functionBindingPlan.requiredFunctionCoverage,
    outliers: [],
    status: 'PENDING',
  };

  return {
    functionBindingSummary: pkg.functionBindingPlan.bindings.map(
      (b) => `${b.visualRegion}→${b.liveFunction}`,
    ),
    fidelityReceipt: conceptFidelity,
    sessionPatch: {
      renderedTwin: {
        renderMode: 'TWIN_V2_CONCEPT_DIRECTED_NDX_OVERVIEW',
        componentRef: 'ConceptDirectedNdxOverviewTwinV2',
        builtAt,
      },
      fidelityReceipt: twinFidelity,
      status: 'TWIN_V2_REVIEW_READY',
      sourceGeneration: { ...session.sourceGeneration, lastBuildAt: builtAt },
      buildRef: P0_VR_TWIN_V21_BUILD,
      conceptGallery: {
        ...gallery,
        packages: { ...gallery.packages, [pkg.packageId]: { ...pkg, status: 'BUILT' } },
        fidelityReceipts: { ...gallery.fidelityReceipts, [active.conceptId]: conceptFidelity },
      },
    },
  };
}
