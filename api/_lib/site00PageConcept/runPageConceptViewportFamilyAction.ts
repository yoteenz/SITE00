import { compileProjectSkinContract } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import { compilePageExperienceExpressionContract } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptExperienceExpressionCompile.js';
import { buildPageGpt2ViewportInterpretationPackage } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2ViewportInterpretationPackage.js';
import { computePageConceptLiveImplementationHash } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLiveRouteHash.js';
import {
  pageConceptApplyDesktopInterpretation,
  pageConceptApplyTabletInterpretation,
  pageConceptApproveExperienceExpression,
  pageConceptApproveViewportFamily,
  pageConceptApprovePageFamilySkinBehavior,
  pageConceptCreateTwinImplementationPackage,
  pageConceptDesktopArtifactIdForFamily,
  pageConceptLockViewportFamily,
  pageConceptMarkOpusRepresentativeShellsReady,
  pageConceptRecordTwinCapture,
  pageConceptSelectMobileConcept,
  pageConceptTabletArtifactIdForFamily,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportFamilyOrchestration.js';
import type { PageConceptGenerationState } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { pageContextForGpt2Package } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectVisualIdentity.js';
import { executePageConceptGpt2ViewportInterpretation } from './executePageConceptGpt2ViewportInterpretation.js';
import {
  allMobileConceptSlots,
  executePageConceptRegenerateMobileConcepts,
  resolveRegenerateMobileSlotsFromConceptId,
} from './executePageConceptRegenerateMobile.js';
import { mergePageConceptArtifactsIntoGallery } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/generationWorkflow.js';

export type PageConceptViewportFamilyAction =
  | { type: 'selectMobileConcept'; conceptId: string }
  | { type: 'approveExperienceExpression' }
  | { type: 'runTabletInterpretation'; dryRun?: boolean }
  | { type: 'runDesktopInterpretation'; dryRun?: boolean }
  | { type: 'regenerateTablet'; dryRun?: boolean }
  | { type: 'regenerateDesktop'; dryRun?: boolean }
  | { type: 'approveViewportFamily' }
  | { type: 'approvePageFamilySkinBehavior' }
  | { type: 'markOpusRepresentativeShellsReady' }
  | { type: 'lockViewportFamily' }
  | { type: 'createTwinImplementationPackage' }
  | { type: 'captureTwinViewport'; viewport: 'MOBILE' | 'TABLET' | 'DESKTOP'; imageUri: string }
  | { type: 'regenerateMobileConcept'; conceptId: string; mobileCaptureBase64: string; dryRun?: boolean }
  | { type: 'regenerateAllMobileConcepts'; mobileCaptureBase64: string; dryRun?: boolean };

export type PageConceptViewportFamilyActionResult = {
  state: PageConceptGenerationState;
  jobs?: readonly import('../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js').PageConceptGeneratedArtifact[];
};

function mobileAuthorityFromState(state: PageConceptGenerationState): { b64: string; rationale: string } {
  const family = state.pipelineSet?.viewportAuthorityFamily;
  const conceptId = family?.selectedMobileConceptId;
  const mobile = state.pipelineSet?.mobileConcepts?.find((c) => c.conceptId === conceptId);
  const job = state.generationJobs.find((j) => j.artifactId === family?.mobileArtifactId);
  const imageUri = mobile?.imageUri ?? job?.imageUri ?? null;
  if (!imageUri) throw new Error('MOBILE_AUTHORITY_IMAGE_MISSING');
  const m = imageUri.match(/^data:image\/[^;]+;base64,(.+)$/);
  const b64 = m?.[1] ?? imageUri;
  return { b64, rationale: `Selected mobile concept ${conceptId}` };
}

function tabletImageFromState(state: PageConceptGenerationState): string | null {
  const id = state.pipelineSet?.viewportAuthorityFamily?.tabletArtifactId;
  const job = state.generationJobs.find((j) => j.artifactId === id);
  return job?.imageUri ?? null;
}

export async function runPageConceptViewportFamilyAction(
  state: PageConceptGenerationState,
  action: PageConceptViewportFamilyAction,
): Promise<PageConceptViewportFamilyActionResult> {
  if (action.type === 'selectMobileConcept') {
    const r = pageConceptSelectMobileConcept(state, action.conceptId);
    const hash = computePageConceptLiveImplementationHash(r.state);
    const ps = r.state.pipelineSet!;
    return {
      state: {
        ...r.state,
        pipelineSet: {
          ...ps,
          liveRouteHashBefore: ps.liveRouteHashBefore ?? {
            liveRoute: state.functionContract?.route ?? '',
            hash,
            capturedAt: new Date().toISOString(),
          },
        },
      },
    };
  }

  if (action.type === 'approveExperienceExpression') {
    const ps = state.pipelineSet!;
    const family = ps.viewportAuthorityFamily!;
    const injection = ps.creativeInjection!;
    const brief = ps.cgptCreativeBrief!;
    const skin = compileProjectSkinContract(state.projectId);
    const contract = compilePageExperienceExpressionContract({
      projectId: state.projectId,
      pageId: state.pageId,
      selectedMobileConceptId: family.selectedMobileConceptId!,
      skinContract: skin,
      cgptBrief: brief,
      injection,
      functionContract: state.functionContract!,
    });
    return pageConceptApproveExperienceExpression(state, contract);
  }

  if (action.type === 'runTabletInterpretation' || action.type === 'regenerateTablet') {
    const family = state.pipelineSet?.viewportAuthorityFamily;
    if (!family?.experienceExpressionContractId) throw new Error('EXPERIENCE_EXPRESSION_REQUIRED');
    const { b64, rationale } = mobileAuthorityFromState(state);
    const skin = compileProjectSkinContract(state.projectId);
    const pkg = buildPageGpt2ViewportInterpretationPackage({
      target: 'TABLET',
      mobileAuthorityBase64: b64,
      selectedMobileConceptId: family.selectedMobileConceptId!,
      mobileArtifactId: family.mobileArtifactId!,
      mobileRationale: rationale,
      tabletInterpretationId: null,
      tabletArtifactBase64: null,
      creativeInjection: state.pipelineSet!.creativeInjection!,
      cgptBrief: state.pipelineSet!.cgptCreativeBrief!,
      functionContract: state.functionContract!,
      skinContract: skin,
      experienceContract: state.pipelineSet!.experienceExpressionContract!,
      pageContextSummary: Object.values(pageContextForGpt2Package(state.pageContext!)).join(' · '),
      pageContentSummary: state.pipelineSet!.creativeInjection!.immutableRequirements.join(' · '),
    });
    const interpretationId = `pg2t-${family.familyId}-${Date.now()}`;
    const version = `v1-${interpretationId.slice(-8)}`;
    const render = await executePageConceptGpt2ViewportInterpretation({
      pkg,
      artifactId: pageConceptTabletArtifactIdForFamily(family.familyId),
      interpretationId,
      version,
      planMeta: {
        projectId: state.projectId,
        pageId: state.pageId,
        captureSetId: state.pipelineSet!.captureSetId,
        projectContextVersion: state.projectContext!.contextVersion,
        pageContextVersion: state.pageContext!.contextVersion,
        functionContractId: state.functionContract!.contractId,
        creativeInjectionId: state.pipelineSet!.creativeInjection!.injectionId,
        selectedMobileConceptId: family.selectedMobileConceptId!,
      },
      width: 834,
      height: 1194,
      dryRun: action.dryRun ?? process.env.VITEST === 'true',
    });
    const applied = pageConceptApplyTabletInterpretation(state, {
      job: render.job,
      interpretationId,
      version,
    });
    return { state: applied.state, jobs: applied.jobs };
  }

  if (action.type === 'runDesktopInterpretation' || action.type === 'regenerateDesktop') {
    const family = state.pipelineSet?.viewportAuthorityFamily;
    if (!family?.tabletArtifactId) throw new Error('TABLET_REQUIRED');
    const { b64, rationale } = mobileAuthorityFromState(state);
    const tabletB64 = tabletImageFromState(state);
    const skin = compileProjectSkinContract(state.projectId);
    const pkg = buildPageGpt2ViewportInterpretationPackage({
      target: 'DESKTOP',
      mobileAuthorityBase64: b64,
      selectedMobileConceptId: family.selectedMobileConceptId!,
      mobileArtifactId: family.mobileArtifactId!,
      mobileRationale: rationale,
      tabletInterpretationId: family.tabletInterpretationId,
      tabletArtifactBase64: tabletB64,
      creativeInjection: state.pipelineSet!.creativeInjection!,
      cgptBrief: state.pipelineSet!.cgptCreativeBrief!,
      functionContract: state.functionContract!,
      skinContract: skin,
      experienceContract: state.pipelineSet!.experienceExpressionContract!,
      pageContextSummary: Object.values(pageContextForGpt2Package(state.pageContext!)).join(' · '),
      pageContentSummary: state.pipelineSet!.creativeInjection!.immutableRequirements.join(' · '),
    });
    const interpretationId = `pg2d-${family.familyId}-${Date.now()}`;
    const version = `v1-${interpretationId.slice(-8)}`;
    const render = await executePageConceptGpt2ViewportInterpretation({
      pkg,
      artifactId: pageConceptDesktopArtifactIdForFamily(family.familyId),
      interpretationId,
      version,
      planMeta: {
        projectId: state.projectId,
        pageId: state.pageId,
        captureSetId: state.pipelineSet!.captureSetId,
        projectContextVersion: state.projectContext!.contextVersion,
        pageContextVersion: state.pageContext!.contextVersion,
        functionContractId: state.functionContract!.contractId,
        creativeInjectionId: state.pipelineSet!.creativeInjection!.injectionId,
        selectedMobileConceptId: family.selectedMobileConceptId!,
      },
      width: 1440,
      height: 1024,
      dryRun: action.dryRun ?? process.env.VITEST === 'true',
    });
    const applied = pageConceptApplyDesktopInterpretation(state, {
      job: render.job,
      interpretationId,
      version,
    });
    return { state: applied.state, jobs: applied.jobs };
  }

  if (action.type === 'approveViewportFamily') {
    return pageConceptApproveViewportFamily(state);
  }

  if (action.type === 'approvePageFamilySkinBehavior') {
    return pageConceptApprovePageFamilySkinBehavior(state);
  }

  if (action.type === 'markOpusRepresentativeShellsReady') {
    return pageConceptMarkOpusRepresentativeShellsReady(state);
  }

  if (action.type === 'lockViewportFamily') {
    return pageConceptLockViewportFamily(state);
  }

  if (action.type === 'createTwinImplementationPackage') {
    return pageConceptCreateTwinImplementationPackage(state);
  }

  if (action.type === 'regenerateMobileConcept' || action.type === 'regenerateAllMobileConcepts') {
    const slots =
      action.type === 'regenerateAllMobileConcepts' ?
        allMobileConceptSlots()
      : [resolveRegenerateMobileSlotsFromConceptId(state, action.conceptId)];
    const runId = state.activeGenerationRunId ?? `pcgr-regen-${Date.now()}`;
    const result = await executePageConceptRegenerateMobileConcepts({
      state,
      slots,
      dryRun: action.dryRun ?? process.env.VITEST === 'true',
      mobileCaptureBase64: action.mobileCaptureBase64,
      mobileDims: { width: 768, height: 1376 },
      runId,
    });
    mergePageConceptArtifactsIntoGallery(result.state);
    return { state: result.state, jobs: result.jobs };
  }

  if (action.type === 'captureTwinViewport') {
    const pkg = state.pipelineSet?.twinImplementationPackage;
    if (!pkg) throw new Error('TWIN_PACKAGE_REQUIRED');
    const authorityId =
      action.viewport === 'MOBILE' ? pkg.mobile.artifactId
      : action.viewport === 'TABLET' ? pkg.tablet.artifactId
      : pkg.desktop.artifactId;
    return pageConceptRecordTwinCapture(state, {
      viewport: action.viewport,
      twinBuildId: pkg.twinBuildId,
      authorityArtifactId: authorityId,
      imageUri: action.imageUri,
    });
  }

  throw new Error('UNKNOWN_VIEWPORT_FAMILY_ACTION');
}
