import { planPageNbpRenditions } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/renditionPlanner.js';
import {
  buildPageConceptGenerationPlan,
  PAGE_NBP_MODEL,
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

export type ExecutePageConceptGenerationOptions = {
  runId?: string;
  dryRun?: boolean;
  retryCgptOnly?: boolean;
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

  const mobileCaptureBase64 =
    dryRun ? 'dry-run-mobile' : (
      await resolvePageGenerationCaptureBase64(input.mobileCapture, { viewport: 'MOBILE' })
    );
  const desktopCaptureBase64 =
    dryRun ? 'dry-run-desktop' : (
      await resolvePageGenerationCaptureBase64(input.desktopCapture, { viewport: 'DESKTOP' })
    );

  let creativeInjection = input.state.pipelineSet?.creativeInjection ?? null;
  let gpt2Authority = input.state.pipelineSet?.gpt2AuthorityConcept ?? null;
  let creativeInjectionError = input.state.pipelineSet?.creativeInjectionError;
  let gpt2AuthorityError = input.state.pipelineSet?.gpt2AuthorityError;

  const pipelineSetId = input.state.pipelineSet?.pipelineSetId ?? `pps-${Date.now()}`;
  const retryFailedOnly = input.retryFailedOnly === true;
  const retryCgptOnly = options.retryCgptOnly === true;
  const runId = options.runId ?? `pcgr-local-${pipelineSetId}`;

  if (retryCgptOnly) {
    clearPageConceptCgptStageLock(runId);
    creativeInjection = null;
    creativeInjectionError = undefined;
  }

  const skipCgptGpt2 =
    continueNbpAfterGpt2Review ||
    (retryFailedOnly && Boolean(creativeInjection) && Boolean(gpt2Authority) && !retryCgptOnly);

  if (continueNbpAfterGpt2Review && (!creativeInjection || !gpt2Authority)) {
    throw new Error('GPT2_REVIEW_CONTINUE_MISSING_PIPELINE');
  }

  if (!skipCgptGpt2) {
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

  if (!skipCgptGpt2 && (!retryFailedOnly || !creativeInjection || retryCgptOnly)) {
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

  if (skipCgptGpt2 && !creativeInjection) {
    throw new Error('CGPT_INJECTION_MISSING');
  }

  if (!skipCgptGpt2) {
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

  if (!skipCgptGpt2 && (!gpt2Authority || !retryFailedOnly)) {
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
          authorityArtifact: null,
          gpt2Provider: 'dry-run',
          gpt2Model: 'dry-run',
          createdAt: new Date().toISOString(),
          conceptRationale: 'DRY_RUN',
          brandSignals: projectContext.brandTruth,
          groundingPackageVersion: 'page-gpt2-authority-v2-grounding',
        } satisfies PageGPT2AuthorityConcept;
      } else {
        gpt2Authority = await generatePageGpt2AuthorityConcept({
          injection: creativeInjection!,
          functionContract,
          projectContext,
          pageContext,
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

  const skipGpt2FounderReviewGate = continueNbpAfterGpt2Review || retryFailedOnly;
  if (pageConceptRequiresGpt2FounderReview() && !skipGpt2FounderReviewGate) {
    const reviewPipelineSet: PageConceptPipelineSet = {
      pipelineSetId,
      projectId: input.state.projectId,
      pageId: input.state.pageId,
      targetType: PAGE_CONCEPT_TARGET_TYPE,
      captureSetId: plan.captureSetId,
      functionContractId: functionContract.contractId,
      creativeInjection,
      gpt2AuthorityConcept: gpt2Authority,
      renditions: [],
      creativeInjectionError,
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
    retryFailedOnly ? input.state.generationJobs.filter((j) => j.status === 'READY') : [];
  const renditions: PageConceptRendition[] = [];
  let anyNbpFailed = false;

  for (const rp of planPageNbpRenditions()) {
    const renditionId = `prend-${rp.slot}-${pipelineSetId}`;
    let mobileArtifactId: string | null = null;
    let desktopArtifactId: string | null = null;
    let failed = false;

    for (const viewport of ['MOBILE', 'DESKTOP'] as const) {
      const artifactId = `pcga-${rp.slot}-${viewport}`;
      const existing = input.state.generationJobs.find((j) => j.artifactId === artifactId);
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
        promptVersion: 'page-nbp-v1',
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
        if (dryRun) {
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
          const render = await renderPageNbpJob({
            gpt2Authority,
            creativeInjection,
            renditionSlot: rp.slot,
            renditionDirective: rp.renditionDirective,
            viewport,
            referenceImageBase64: ref,
            width: dims.width,
            height: dims.height,
            functionContract,
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
      gpt2AuthorityConcept: gpt2Authority,
      renditions,
      creativeInjectionError,
      gpt2AuthorityError,
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
