import { planPageNbpRenditions } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/renditionPlanner.js';
import {
  buildPageConceptGenerationPlan,
  PAGE_NBP_MODEL,
  PAGE_NBP_PROMPT_VERSION,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import type { PageConceptRunProgress } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';
import type {
  PageConceptGeneratedArtifact,
  PageConceptGenerationRunResult,
  PageConceptPipelineSet,
  PageConceptRendition,
  PageCreativeInjection,
  PageGPT2AuthorityConcept,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { PAGE_CONCEPT_TARGET_TYPE } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/constants.js';
import { executePageConceptCgptStage } from './executePageConceptCgptStage.js';
import {
  pageConceptProgressPatchForCgptFailure,
  pageConceptProgressPatchForCgptSubstep,
  pageConceptProgressPatchForGpt2,
  pageConceptProgressPatchForNbp,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLiveProgress.js';
import { clearPageConceptCgptStageLock } from './pageConceptCgptStageLock.js';
import {
  buildRuntimePageGpt2AuthorityPackage,
  generatePageGpt2AuthorityConcept,
} from './generatePageGpt2AuthorityConcept.js';
import {
  pageConceptRequiresGpt2FounderReview,
  validatePageConceptGpt2GroundingBeforeNbp,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2AuthorityPackage.js';
import { renderPageNbpJob } from './renderPageNbpJob.js';
import { resolvePageGenerationCaptureBase64 } from './resolvePageGenerationCapture.js';
import type { RunPageConceptGenerationInput } from './runPageConceptGeneration.js';
import { compileProjectSkinContract } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import { buildPageNbpRequestPackage } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptNbpRequestPackage.js';
import {
  createPageConceptAuthorityApprovalId,
  pageConceptNbpJobAllowedInQaMode,
  pageConceptNbpRequiresAuthorityApprovalId,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptNbpAuthorityPolicy.js';
import { pageContextForGpt2Package } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectVisualIdentity.js';
import {
  compilePageConceptCgptCreativeBrief,
  verifyGpt2HandoffContextIntegrity,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeBrief.js';
import type { PageConceptCgptCreativeBrief } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import {
  pageConceptCgptQaStopAfterCgpt,
  validateCgptCreativeSynthesis,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeSynthesis.js';
import { buildPageConceptGpt2AuthorityPackage } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2AuthorityPackage.js';
import { pageConceptCanonicalNbpDisabled } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCanonicalPipeline.js';
import { executePageConceptCanonicalMobileStage } from './executePageConceptCanonicalMobileStage.js';

export type ExecutePageConceptGenerationOptions = {
  runId?: string;
  dryRun?: boolean;
  retryCgptOnly?: boolean;
  retryGpt2Only?: boolean;
  regenerateNbpOnly?: boolean;
  continueGpt2AfterCgptReview?: boolean;
  continueNbpAfterGpt2Review?: boolean;
  onProgress?: (patch: PageConceptRunProgress) => void;
};

function emit(onProgress: ExecutePageConceptGenerationOptions['onProgress'], patch: PageConceptRunProgress): void {
  onProgress?.({ ...patch, updatedAt: new Date().toISOString() });
}

export async function executePageConceptGeneration(
  input: RunPageConceptGenerationInput,
  options: ExecutePageConceptGenerationOptions = {},
): Promise<PageConceptGenerationRunResult> {
  const dryRun = options.dryRun === true;
  const onProgress = options.onProgress;

  if (!input.founderConfirmedSpend && !dryRun) throw new Error('SPEND_GUARD: founder confirmation required');
  if (input.state.targetType !== PAGE_CONCEPT_TARGET_TYPE) throw new Error('PAGE_TARGET_REQUIRED');

  const plan = buildPageConceptGenerationPlan(input.state.projectId, input.state.pageId, {
    trustIncomingCaptures: true,
  });
  const projectContext = input.state.projectContext!;
  const pageContext = input.state.pageContext!;
  const functionContract = input.state.functionContract!;

  const continueNbpAfterGpt2Review = options.continueNbpAfterGpt2Review === true;
  const continueGpt2AfterCgptReview = options.continueGpt2AfterCgptReview === true;
  const retryGpt2Only = options.retryGpt2Only === true;
  const canonicalPipeline = pageConceptCanonicalNbpDisabled();
  const regenerateNbpOnly = options.regenerateNbpOnly === true;

  const mobileCaptureBase64 =
    dryRun ? 'dry-run-mobile' : (
      await resolvePageGenerationCaptureBase64(input.mobileCapture, { viewport: 'MOBILE' })
    );
  const desktopCaptureBase64 =
    dryRun ? 'dry-run-desktop' : (
      await resolvePageGenerationCaptureBase64(input.desktopCapture, { viewport: 'DESKTOP' })
    );

  let creativeInjection = input.state.pipelineSet?.creativeInjection ?? null;
  let cgptCreativeBrief: PageConceptCgptCreativeBrief | null =
    input.state.pipelineSet?.cgptCreativeBrief ?? null;
  let gpt2Authority = input.state.pipelineSet?.gpt2AuthorityConcept ?? null;
  let creativeInjectionError = input.state.pipelineSet?.creativeInjectionError;
  let gpt2AuthorityError = input.state.pipelineSet?.gpt2AuthorityError;

  let pipelineSetId = input.state.pipelineSet?.pipelineSetId ?? `pps-${Date.now()}`;
  if (regenerateNbpOnly) {
    pipelineSetId = `pps-nbp-${Date.now()}`;
  }
  const retryFailedOnly = input.retryFailedOnly === true;
  const retryCgptOnly = options.retryCgptOnly === true;
  const runId = options.runId ?? `pcgr-local-${pipelineSetId}`;

  if (retryCgptOnly) {
    clearPageConceptCgptStageLock(runId);
    creativeInjection = null;
    creativeInjectionError = undefined;
  }
  if (retryGpt2Only) {
    gpt2Authority = null;
    gpt2AuthorityError = undefined;
  }

  const skipCgpt =
    continueGpt2AfterCgptReview ||
    continueNbpAfterGpt2Review ||
    retryGpt2Only ||
    regenerateNbpOnly ||
    (retryFailedOnly && Boolean(creativeInjection) && !retryCgptOnly);
  const skipGpt2 =
    continueNbpAfterGpt2Review ||
    regenerateNbpOnly ||
    (retryFailedOnly && Boolean(creativeInjection) && Boolean(gpt2Authority) && !retryCgptOnly && !retryGpt2Only);

  if (continueNbpAfterGpt2Review && (!creativeInjection || !gpt2Authority)) {
    throw new Error('GPT2_REVIEW_CONTINUE_MISSING_PIPELINE');
  }
  if (continueGpt2AfterCgptReview && !creativeInjection) {
    throw new Error('CGPT_REVIEW_CONTINUE_MISSING_INJECTION');
  }

  if (!skipCgpt) {
    const cgptStart = pageConceptProgressPatchForCgptSubstep('page-intelligence');
    emit(onProgress, {
      status: 'CGPT_RUNNING',
      currentStage: cgptStart.currentStage,
      panelProgress: cgptStart.panelProgress,
      cgptStatus: 'RUNNING',
      gpt2Status: 'PENDING',
      nbpStatus: 'PENDING',
      generationStatus: 'CGPT_RUNNING',
      plan,
      error: null,
      completedAt: null,
    });
  }

  if (!skipCgpt && (!retryFailedOnly || !creativeInjection || retryCgptOnly)) {
    const cgptResult = await executePageConceptCgptStage({
      runId,
      input: { projectContext, pageContext, functionContract },
      pipelineSetId,
      dryRun,
      resetAttempts: retryCgptOnly,
      onProgress: (patch) => emit(onProgress, patch),
    });
    if (cgptResult.ok) {
      creativeInjection = cgptResult.injection;
      cgptCreativeBrief = compilePageConceptCgptCreativeBrief({
        injection: creativeInjection,
        projectContext,
        pageContext,
        functionContract,
        captureSetId: plan.captureSetId,
      });
      creativeInjectionError = undefined;
    } else {
      creativeInjectionError = `${cgptResult.founderMessage} · ${cgptResult.technicalDetails}`;
      creativeInjection = null;
    }
  }

  if (!creativeInjection) {
    const pipelineSet: PageConceptPipelineSet = {
      pipelineSetId,
      projectId: input.state.projectId,
      pageId: input.state.pageId,
      targetType: PAGE_CONCEPT_TARGET_TYPE,
      captureSetId: plan.captureSetId,
      functionContractId: functionContract.contractId,
      creativeInjection: null,
      cgptCreativeBrief: null,
      gpt2AuthorityConcept: null,
      renditions: [],
      creativeInjectionError,
      createdAt: new Date().toISOString(),
    };
    const cgptFail = pageConceptProgressPatchForCgptFailure('creative-direction');
    emit(onProgress, {
      status: 'FAILED',
      currentStage: cgptFail.currentStage,
      panelProgress: cgptFail.panelProgress,
      cgptStatus: 'FAILED',
      gpt2Status: 'PENDING',
      nbpStatus: 'PENDING',
      generationStatus: 'FAILED',
      pipelineSet,
      jobs: [],
      error: creativeInjectionError ?? 'CGPT_INJECTION_FAILED',
      completedAt: new Date().toISOString(),
    });
    return { plan, pipelineSet, jobs: [] };
  }

  if ((skipCgpt || skipGpt2) && !creativeInjection) {
    throw new Error('CGPT_INJECTION_MISSING');
  }

  if (creativeInjection && !cgptCreativeBrief) {
    cgptCreativeBrief = compilePageConceptCgptCreativeBrief({
      injection: creativeInjection,
      projectContext,
      pageContext,
      functionContract,
      captureSetId: plan.captureSetId,
    });
  }

  const nbpRetryOnly = (retryFailedOnly || regenerateNbpOnly) && skipCgpt && skipGpt2;

  const synthesisCheck = validateCgptCreativeSynthesis(creativeInjection);
  if (!synthesisCheck.ok && !dryRun && !nbpRetryOnly) {
    creativeInjectionError = `CGPT_SYNTHESIS_INCOMPLETE: ${synthesisCheck.missingFields.join(', ')}`;
    const pipelineSet: PageConceptPipelineSet = {
      pipelineSetId,
      projectId: input.state.projectId,
      pageId: input.state.pageId,
      targetType: PAGE_CONCEPT_TARGET_TYPE,
      captureSetId: plan.captureSetId,
      functionContractId: functionContract.contractId,
      creativeInjection: null,
      cgptCreativeBrief: null,
      gpt2AuthorityConcept: null,
      renditions: [],
      creativeInjectionError,
      createdAt: new Date().toISOString(),
    };
    const cgptFail = pageConceptProgressPatchForCgptFailure('creative-direction');
    emit(onProgress, {
      status: 'FAILED',
      currentStage: cgptFail.currentStage,
      panelProgress: cgptFail.panelProgress,
      cgptStatus: 'FAILED',
      gpt2Status: 'PENDING',
      nbpStatus: 'PENDING',
      generationStatus: 'FAILED',
      pipelineSet,
      jobs: [],
      error: creativeInjectionError,
      completedAt: new Date().toISOString(),
    });
    return { plan, pipelineSet, jobs: [] };
  }

  if (
    pageConceptCgptQaStopAfterCgpt() &&
    !continueGpt2AfterCgptReview &&
    !continueNbpAfterGpt2Review &&
    !retryFailedOnly
  ) {
    const reviewPipelineSet: PageConceptPipelineSet = {
      pipelineSetId,
      projectId: input.state.projectId,
      pageId: input.state.pageId,
      targetType: PAGE_CONCEPT_TARGET_TYPE,
      captureSetId: plan.captureSetId,
      functionContractId: functionContract.contractId,
      creativeInjection,
      cgptCreativeBrief,
      gpt2AuthorityConcept: null,
      renditions: [],
      creativeInjectionError,
      createdAt: new Date().toISOString(),
    };
    emit(onProgress, {
      status: 'CGPT_AWAITING_FOUNDER_REVIEW',
      currentStage: 'CGPT_AWAITING_FOUNDER_REVIEW',
      panelProgress: pageConceptProgressPatchForCgptSubstep('creative-direction').panelProgress,
      cgptStatus: 'COMPLETE',
      gpt2Status: 'PENDING',
      nbpStatus: 'PENDING',
      generationStatus: 'CGPT_AWAITING_FOUNDER_REVIEW',
      pipelineSet: reviewPipelineSet,
      jobs: [],
      error: null,
      completedAt: null,
    });
    return { plan, pipelineSet: reviewPipelineSet, jobs: [] };
  }

  if (canonicalPipeline) {
    if (regenerateNbpOnly || continueNbpAfterGpt2Review) {
      throw new Error('LEGACY_NBP_PATH_DISABLED: SET SITE00_PAGE_CONCEPT_LEGACY_NBP=true FOR LEGACY RUNS');
    }
    return executePageConceptCanonicalMobileStage({
      plan,
      pipelineSetId,
      dryRun,
      projectContext,
      pageContext,
      functionContract,
      creativeInjection: creativeInjection!,
      cgptCreativeBrief,
      creativeInjectionError,
      mobileDims: input.mobileCapture,
      onProgress,
    });
  }

  const preGpt2HandoffPackage = buildPageConceptGpt2AuthorityPackage({
    projectContext,
    pageContext,
    functionContract,
    injection: creativeInjection,
    cgptBrief: cgptCreativeBrief,
  });
  const handoffIntegrity = verifyGpt2HandoffContextIntegrity({
    brief: cgptCreativeBrief!,
    package: preGpt2HandoffPackage,
  });
  if (!handoffIntegrity.ok && !dryRun && !nbpRetryOnly) {
    const pipelineSet: PageConceptPipelineSet = {
      pipelineSetId,
      projectId: input.state.projectId,
      pageId: input.state.pageId,
      targetType: PAGE_CONCEPT_TARGET_TYPE,
      captureSetId: plan.captureSetId,
      functionContractId: functionContract.contractId,
      creativeInjection,
      cgptCreativeBrief,
      gpt2AuthorityConcept: null,
      renditions: [],
      creativeInjectionError: `GPT2_HANDOFF_CONTEXT_LOSS: ${handoffIntegrity.missing.join(', ')}`,
      createdAt: new Date().toISOString(),
    };
    emit(onProgress, {
      status: 'FAILED',
      currentStage: 'GPT2_HANDOFF_BLOCKED',
      cgptStatus: 'COMPLETE',
      gpt2Status: 'PENDING',
      nbpStatus: 'PENDING',
      generationStatus: 'FAILED',
      pipelineSet,
      jobs: [],
      error: pipelineSet.creativeInjectionError ?? 'GPT2_HANDOFF_CONTEXT_LOSS',
      completedAt: new Date().toISOString(),
    });
    return { plan, pipelineSet, jobs: [] };
  }

  if (!skipGpt2) {
    const gpt2Start = pageConceptProgressPatchForGpt2();
    emit(onProgress, {
      status: 'GPT2_RUNNING',
      currentStage: gpt2Start.currentStage,
      panelProgress: gpt2Start.panelProgress,
      cgptStatus: 'COMPLETE',
      gpt2Status: 'RUNNING',
      nbpStatus: 'PENDING',
      generationStatus: 'GPT2_RUNNING',
      pipelineSet: {
        pipelineSetId,
        projectId: input.state.projectId,
        pageId: input.state.pageId,
        targetType: PAGE_CONCEPT_TARGET_TYPE,
        captureSetId: plan.captureSetId,
        functionContractId: functionContract.contractId,
        creativeInjection,
        cgptCreativeBrief,
        gpt2AuthorityConcept: null,
        renditions: [],
        creativeInjectionError,
        createdAt: new Date().toISOString(),
      },
      jobs: [],
      error: null,
      completedAt: null,
    });
  }

  if (!skipGpt2 && (!gpt2Authority || !retryFailedOnly)) {
    try {
      if (dryRun) {
        await new Promise((r) => setTimeout(r, 50));
        gpt2Authority = {
          conceptId: `dry-gpt2-${pipelineSetId}`,
          projectId: input.state.projectId,
          pageId: input.state.pageId,
          injectionId: creativeInjection!.injectionId,
          name: 'DRY_RUN',
          premise: 'DRY_RUN',
          hierarchyStrategy: 'DRY_RUN',
          compositionStrategy: 'DRY_RUN',
          visualLanguage: 'DRY_RUN',
          interactionPresentation: 'DRY_RUN',
          mobileIntent: 'DRY_RUN',
          desktopIntent: 'DRY_RUN',
          authorityArtifact: `data:image/png;base64,${Buffer.from('dry-run-gpt2-authority', 'utf8').toString('base64')}`,
          gpt2Provider: 'dry-run',
          gpt2Model: 'dry-run',
          createdAt: new Date().toISOString(),
          conceptRationale: 'DRY_RUN',
          brandSignals: projectContext.brandTruth,
          groundingPackageVersion: 'page-gpt2-authority-v2-grounding',
          cgptBriefId: cgptCreativeBrief?.briefId,
          cgptBriefVersion: cgptCreativeBrief?.version,
        } satisfies PageGPT2AuthorityConcept;
      } else {
        gpt2Authority = await generatePageGpt2AuthorityConcept({
          injection: creativeInjection!,
          functionContract,
          projectContext,
          pageContext,
          cgptBrief: cgptCreativeBrief,
        });
      }
      gpt2AuthorityError = undefined;
    } catch (err) {
      gpt2AuthorityError = err instanceof Error ? err.message : 'GPT2_AUTHORITY_FAILED';
      gpt2Authority = null;
    }
  }

  if (!gpt2Authority) {
    const pipelineSet: PageConceptPipelineSet = {
      pipelineSetId,
      projectId: input.state.projectId,
      pageId: input.state.pageId,
      targetType: PAGE_CONCEPT_TARGET_TYPE,
      captureSetId: plan.captureSetId,
      functionContractId: functionContract.contractId,
      creativeInjection,
      cgptCreativeBrief,
      gpt2AuthorityConcept: null,
      renditions: [],
      creativeInjectionError,
      gpt2AuthorityError,
      createdAt: new Date().toISOString(),
    };
    emit(onProgress, {
      status: 'FAILED',
      currentStage: 'GPT2_FAILED',
      cgptStatus: 'COMPLETE',
      gpt2Status: 'FAILED',
      nbpStatus: 'PENDING',
      generationStatus: 'FAILED',
      pipelineSet,
      jobs: [],
      error: gpt2AuthorityError ?? 'GPT2_AUTHORITY_FAILED',
      completedAt: new Date().toISOString(),
    });
    return { plan, pipelineSet, jobs: [] };
  }

  const gpt2Package = buildRuntimePageGpt2AuthorityPackage({
    injection: creativeInjection,
    functionContract,
    projectContext,
    pageContext,
    cgptBrief: cgptCreativeBrief,
  });
  const grounding = validatePageConceptGpt2GroundingBeforeNbp({
    projectId: input.state.projectId,
    package: gpt2Package,
    concept: gpt2Authority,
  });
  if (!grounding.ok && !dryRun) {
    const pipelineSet: PageConceptPipelineSet = {
      pipelineSetId,
      projectId: input.state.projectId,
      pageId: input.state.pageId,
      targetType: PAGE_CONCEPT_TARGET_TYPE,
      captureSetId: plan.captureSetId,
      functionContractId: functionContract.contractId,
      creativeInjection,
      cgptCreativeBrief,
      gpt2AuthorityConcept: gpt2Authority,
      renditions: [],
      creativeInjectionError,
      gpt2AuthorityError: `${grounding.errorCode}: ${grounding.missing.join(', ')}`,
      createdAt: new Date().toISOString(),
    };
    emit(onProgress, {
      status: 'FAILED',
      currentStage: 'GPT2_GROUNDING_FAILED',
      cgptStatus: 'COMPLETE',
      gpt2Status: 'FAILED',
      nbpStatus: 'PENDING',
      generationStatus: 'FAILED',
      pipelineSet,
      jobs: [],
      error: pipelineSet.gpt2AuthorityError ?? 'GPT2_AUTHORITY_CONTEXT_INCOMPLETE',
      completedAt: new Date().toISOString(),
    });
    return { plan, pipelineSet, jobs: [] };
  }

  const skinContract = compileProjectSkinContract(input.state.projectId);
  const pageContextSummary = Object.values(pageContextForGpt2Package(pageContext)).join(' · ');

  const skipGpt2FounderReviewGate =
    continueNbpAfterGpt2Review || retryFailedOnly || regenerateNbpOnly;
  if (pageConceptRequiresGpt2FounderReview() && !skipGpt2FounderReviewGate) {
    const previewPkg = buildPageNbpRequestPackage({
      gpt2Authority,
      creativeInjection: creativeInjection!,
      functionContract,
      skinContract,
      renditionSlot: 'RENDITION_A',
      renditionDirective: 'Preview — authority-first package inspector',
      viewport: 'MOBILE',
      currentImplementationBase64: mobileCaptureBase64,
      pageContextSummary,
      authorityApprovalId: 'PENDING_FOUNDER_APPROVAL',
      renditionId: `prend-preview-${pipelineSetId}`,
    });
    const reviewPipelineSet: PageConceptPipelineSet = {
      pipelineSetId,
      projectId: input.state.projectId,
      pageId: input.state.pageId,
      targetType: PAGE_CONCEPT_TARGET_TYPE,
      captureSetId: plan.captureSetId,
      functionContractId: functionContract.contractId,
      creativeInjection,
      cgptCreativeBrief,
      gpt2AuthorityConcept: gpt2Authority,
      renditions: [],
      creativeInjectionError,
      nbpPreDispatchInspector: {
        ...previewPkg.inspector,
        authorityApprovalId: null,
      },
      createdAt: new Date().toISOString(),
    };
    emit(onProgress, {
      status: 'GPT2_AWAITING_FOUNDER_REVIEW',
      currentStage: 'GPT2_AWAITING_FOUNDER_REVIEW',
      panelProgress: pageConceptProgressPatchForGpt2().panelProgress,
      cgptStatus: 'COMPLETE',
      gpt2Status: 'COMPLETE',
      nbpStatus: 'PENDING',
      generationStatus: 'GPT2_AWAITING_FOUNDER_REVIEW',
      pipelineSet: reviewPipelineSet,
      jobs: [],
      error: null,
      completedAt: null,
    });
    return { plan, pipelineSet: reviewPipelineSet, jobs: [] };
  }

  let authorityApprovalId =
    input.state.pipelineSet?.nbpLineage?.authorityApprovalId ??
    (continueNbpAfterGpt2Review ? createPageConceptAuthorityApprovalId(runId) : null);

  if (!authorityApprovalId && !pageConceptRequiresGpt2FounderReview()) {
    authorityApprovalId = `pnaa-bypass-${pipelineSetId}`;
  }

  if (
    pageConceptNbpRequiresAuthorityApprovalId() &&
    pageConceptRequiresGpt2FounderReview() &&
    !authorityApprovalId &&
    !dryRun
  ) {
    throw new Error('NBP_BLOCKED: AUTHORITY_APPROVAL_ID_REQUIRED');
  }

  const frozenNbpLineage = {
    authorityApprovalId: authorityApprovalId!,
    cgptDirectionId: creativeInjection!.injectionId,
    gpt2AuthorityId: gpt2Authority.conceptId,
    gpt2AuthorityVersion: gpt2Authority.groundingPackageVersion ?? PAGE_NBP_PROMPT_VERSION,
    skinContractId: skinContract.contractId,
    skinContractVersion: skinContract.version,
  };

  const nbpStart = pageConceptProgressPatchForNbp('NBP_STARTING');
  emit(onProgress, {
    status: 'NBP_RUNNING',
    currentStage: nbpStart.currentStage,
    panelProgress: nbpStart.panelProgress,
    cgptStatus: 'COMPLETE',
    gpt2Status: 'COMPLETE',
    nbpStatus: 'RUNNING',
    generationStatus: 'NBP_RUNNING',
    error: null,
    completedAt: null,
  });

  const completed: PageConceptGeneratedArtifact[] =
    retryFailedOnly && !regenerateNbpOnly ?
      input.state.generationJobs.filter((j) => j.status === 'READY')
    : [];
  const nbpArtifactSuffix = regenerateNbpOnly ? pipelineSetId.slice(-10) : '';
  const renditions: PageConceptRendition[] = [];
  let anyNbpFailed = false;

  for (const rp of planPageNbpRenditions()) {
    const renditionId = `prend-${rp.slot}-${pipelineSetId}`;
    let mobileArtifactId: string | null = null;
    let desktopArtifactId: string | null = null;
    let failed = false;

    for (const viewport of ['MOBILE', 'DESKTOP'] as const) {
      if (!pageConceptNbpJobAllowedInQaMode(rp.slot, viewport)) {
        continue;
      }
      const artifactId =
        nbpArtifactSuffix ?
          `pcga-${rp.slot}-${viewport}-${nbpArtifactSuffix}`
        : `pcga-${rp.slot}-${viewport}`;
      const existing =
        regenerateNbpOnly ? undefined : input.state.generationJobs.find((j) => j.artifactId === artifactId);
      if (existing?.status === 'READY') {
        completed.push(existing);
        if (viewport === 'MOBILE') mobileArtifactId = artifactId;
        else desktopArtifactId = artifactId;
        continue;
      }

      const running: PageConceptGeneratedArtifact = {
        artifactId,
        projectId: input.state.projectId,
        pageId: input.state.pageId,
        renditionSlot: rp.slot,
        viewport,
        captureSetId: plan.captureSetId,
        projectContextVersion: projectContext.contextVersion,
        pageContextVersion: pageContext.contextVersion,
        functionContractId: functionContract.contractId,
        creativeInjectionId: creativeInjection.injectionId,
        gpt2AuthorityConceptId: gpt2Authority.conceptId,
        renditionId,
        provider: 'NBP',
        model: PAGE_NBP_MODEL,
        providerJobId: null,
        promptVersion: PAGE_NBP_PROMPT_VERSION,
        createdAt: new Date().toISOString(),
        status: 'RUNNING',
        artifactPath: null,
        imageUri: null,
        width: viewport === 'MOBILE' ? input.mobileCapture.width : input.desktopCapture.width,
        height: viewport === 'MOBILE' ? input.mobileCapture.height : input.desktopCapture.height,
      };

      completed.push(running);
      const nbpStage = `NBP_${rp.slot}_${viewport}`;
      const nbpPatch = pageConceptProgressPatchForNbp(nbpStage);
      emit(onProgress, {
        status: 'NBP_RUNNING',
        currentStage: nbpPatch.currentStage,
        panelProgress: nbpPatch.panelProgress,
        cgptStatus: 'COMPLETE',
        gpt2Status: 'COMPLETE',
        nbpStatus: 'RUNNING',
        generationStatus: 'NBP_RUNNING',
        jobs: [...completed],
        error: null,
        completedAt: null,
      });

      try {
        if (dryRun && process.env.VITEST !== 'true') {
          await new Promise((r) => setTimeout(r, 30));
          const done = {
            ...running,
            status: 'READY' as const,
            providerJobId: 'dry-run',
            imageUri: 'data:image/png;base64,iVBORw0KGgo=',
          };
          completed[completed.length - 1] = done;
        } else {
          const ref = viewport === 'MOBILE' ? mobileCaptureBase64 : desktopCaptureBase64;
          const dims = viewport === 'MOBILE' ? input.mobileCapture : input.desktopCapture;
          const nbpPackage = buildPageNbpRequestPackage({
            gpt2Authority,
            creativeInjection: creativeInjection!,
            functionContract,
            skinContract,
            renditionSlot: rp.slot,
            renditionDirective: rp.renditionDirective,
            viewport,
            currentImplementationBase64: ref,
            pageContextSummary,
            authorityApprovalId: authorityApprovalId!,
            renditionId,
          });
          const render = await renderPageNbpJob({
            package: nbpPackage,
            width: dims.width,
            height: dims.height,
          });
          completed[completed.length - 1] = {
            ...running,
            status: 'READY',
            providerJobId: render.providerJobId,
            imageUri: `data:image/png;base64,${render.imageBase64}`,
          };
        }
        if (viewport === 'MOBILE') mobileArtifactId = artifactId;
        else desktopArtifactId = artifactId;
      } catch (err) {
        failed = true;
        anyNbpFailed = true;
        completed[completed.length - 1] = {
          ...running,
          status: 'FAILED',
          failureReason: err instanceof Error ? err.message : 'NBP_FAILED',
        };
      }
    }

    renditions.push({
      renditionId,
      slot: rp.slot,
      sourceGpt2ConceptId: gpt2Authority.conceptId,
      mobileArtifactId,
      desktopArtifactId,
      status:
        mobileArtifactId && desktopArtifactId ? 'READY'
        : failed ? 'FAILED'
        : mobileArtifactId || desktopArtifactId ? 'PARTIAL'
        : 'PENDING',
      renditionDirective: rp.renditionDirective,
    });

    const pipelineSet: PageConceptPipelineSet = {
      pipelineSetId,
      projectId: input.state.projectId,
      pageId: input.state.pageId,
      targetType: PAGE_CONCEPT_TARGET_TYPE,
      captureSetId: plan.captureSetId,
      functionContractId: functionContract.contractId,
      creativeInjection,
      cgptCreativeBrief,
      gpt2AuthorityConcept: gpt2Authority,
      renditions,
      creativeInjectionError,
      gpt2AuthorityError,
      nbpLineage: frozenNbpLineage,
      nbpPreDispatchInspector: buildPageNbpRequestPackage({
        gpt2Authority,
        creativeInjection: creativeInjection!,
        functionContract,
        skinContract,
        renditionSlot: rp.slot,
        renditionDirective: rp.renditionDirective,
        viewport: 'MOBILE',
        currentImplementationBase64: mobileCaptureBase64,
        pageContextSummary,
        authorityApprovalId: authorityApprovalId!,
        renditionId,
      }).inspector,
      createdAt: new Date().toISOString(),
    };
    emit(onProgress, {
      status: 'NBP_RUNNING',
      currentStage: `NBP_${rp.slot}_DONE`,
      cgptStatus: 'COMPLETE',
      gpt2Status: 'COMPLETE',
      nbpStatus: anyNbpFailed ? 'PARTIAL' : 'RUNNING',
      generationStatus: 'NBP_RUNNING',
      pipelineSet,
      jobs: [...completed],
      error: null,
      completedAt: null,
    });
  }

  const pipelineSet: PageConceptPipelineSet = {
    pipelineSetId,
    projectId: input.state.projectId,
    pageId: input.state.pageId,
    targetType: PAGE_CONCEPT_TARGET_TYPE,
    captureSetId: plan.captureSetId,
    functionContractId: functionContract.contractId,
    creativeInjection,
    cgptCreativeBrief,
    gpt2AuthorityConcept: gpt2Authority,
    renditions,
    creativeInjectionError,
    gpt2AuthorityError,
    createdAt: new Date().toISOString(),
  };

  const readyCount = completed.filter((j) => j.status === 'READY').length;
  const terminalStatus = anyNbpFailed ? (readyCount > 0 ? 'PARTIAL' : 'FAILED') : 'READY_FOR_REVIEW';
  const generationStatus =
    anyNbpFailed && readyCount > 0 ? 'PARTIAL_GENERATION'
    : anyNbpFailed ? 'FAILED'
    : 'READY_FOR_FOUNDER_REVIEW';

  emit(onProgress, {
    status: terminalStatus,
    currentStage: 'COMPLETE',
    cgptStatus: 'COMPLETE',
    gpt2Status: 'COMPLETE',
    nbpStatus: anyNbpFailed ? (readyCount > 0 ? 'PARTIAL' : 'FAILED') : 'COMPLETE',
    generationStatus,
    pipelineSet,
    jobs: completed,
    error: null,
    completedAt: new Date().toISOString(),
  });

  return { plan, pipelineSet, jobs: completed };
}
