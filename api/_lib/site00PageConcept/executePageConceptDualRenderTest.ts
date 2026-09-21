import {
  PAGE_NBP_MODEL,
  PAGE_NBP_PROMPT_VERSION,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import { buildPageGpt2DirectRenderPackage } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2DirectRenderPackage.js';
import { buildPageNbpRequestPackage } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptNbpRequestPackage.js';
import {
  buildRenderGroundingMeta,
  createInitialDualRenderTestRun,
  dualRenderTestArtifactId,
  syncDualRenderLaneFromJobs,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptDualRenderTest.js';
import type {
  PageConceptDualRenderTestRun,
  PageConceptGeneratedArtifact,
  PageConceptGenerationPlan,
  PageConceptPipelineSet,
  PageConceptRenderLaneType,
  PageCreativeInjection,
  PageFunctionContract,
  PageGPT2AuthorityConcept,
  PageCreativeContext,
  ProjectCreativeContext,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import type { ProjectSkinContract } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import { renderPageGpt2DirectJob } from './renderPageGpt2DirectJob.js';
import { renderPageNbpJob } from './renderPageNbpJob.js';

export type DualRenderTestContext = {
  plan: PageConceptGenerationPlan;
  pipelineSetId: string;
  runId: string;
  dryRun: boolean;
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
  creativeInjection: PageCreativeInjection;
  gpt2Authority: PageGPT2AuthorityConcept;
  skinContract: ProjectSkinContract;
  pageContextSummary: string;
  mobileCaptureBase64: string;
  desktopCaptureBase64: string;
  mobileDims: { width: number; height: number };
  desktopDims: { width: number; height: number };
  authorityApprovalId: string;
  existingJobs: readonly PageConceptGeneratedArtifact[];
  existingDualRun: PageConceptDualRenderTestRun | null | undefined;
  regenerateLane: PageConceptRenderLaneType | null;
};

export type DualRenderTestEmit = (patch: Record<string, unknown>) => void;

async function runOneDualRenderJob(
  ctx: DualRenderTestContext,
  lane: PageConceptRenderLaneType,
  viewport: 'MOBILE' | 'DESKTOP',
): Promise<PageConceptGeneratedArtifact> {
  const artifactId = dualRenderTestArtifactId(lane, viewport);
  const existing = ctx.existingJobs.find((j) => j.artifactId === artifactId);
  if (existing?.status === 'READY' && ctx.regenerateLane !== lane) {
    return existing;
  }

  const captureRef = viewport === 'MOBILE' ? ctx.mobileCaptureBase64 : ctx.desktopCaptureBase64;
  const dims = viewport === 'MOBILE' ? ctx.mobileDims : ctx.desktopDims;
  const renditionId = `pdrt-${lane}-${viewport}-${ctx.pipelineSetId}`;

  const groundingBase = {
    renderMode: 'DUAL_RENDER_TEST' as const,
    authoritySourceRunId: ctx.runId,
    authorityArtifactId: ctx.gpt2Authority.conceptId,
    implementationCaptureRole:
      captureRef && !ctx.dryRun ? ('FUNCTIONAL_REFERENCE_ONLY' as const) : ('OMITTED' as const),
    skinGroundingPresent: true,
    identityGroundingPresent: Boolean(ctx.projectContext.brandTruth?.trim()),
    functionContractPresent: true,
  };

  const running: PageConceptGeneratedArtifact = {
    artifactId,
    projectId: ctx.plan.projectId,
    pageId: ctx.plan.pageId,
    renditionSlot: 'RENDITION_A',
    viewport,
    captureSetId: ctx.plan.captureSetId,
    projectContextVersion: ctx.projectContext.contextVersion,
    pageContextVersion: ctx.pageContext.contextVersion,
    functionContractId: ctx.functionContract.contractId,
    creativeInjectionId: ctx.creativeInjection.injectionId,
    gpt2AuthorityConceptId: ctx.gpt2Authority.conceptId,
    renditionId,
    provider: lane === 'GPT2_DIRECT' ? 'GPT2_DIRECT' : 'NBP',
    model: lane === 'GPT2_DIRECT' ? 'gpt2-direct' : PAGE_NBP_MODEL,
    providerJobId: null,
    promptVersion: lane === 'GPT2_DIRECT' ? 'page-gpt2-direct-render-v1-dual-test' : PAGE_NBP_PROMPT_VERSION,
    createdAt: new Date().toISOString(),
    status: 'RUNNING',
    artifactPath: null,
    imageUri: null,
    width: dims.width,
    height: dims.height,
    renderGrounding: buildRenderGroundingMeta({ ...groundingBase, lane }),
  };

  try {
    if (ctx.dryRun && process.env.VITEST !== 'true') {
      await new Promise((r) => setTimeout(r, 10));
      return {
        ...running,
        status: 'READY',
        providerJobId: 'dry-run',
        imageUri: 'data:image/png;base64,iVBORw0KGgo=',
      };
    }

    if (lane === 'GPT2_DIRECT') {
      const pkg = buildPageGpt2DirectRenderPackage({
        gpt2Authority: ctx.gpt2Authority,
        creativeInjection: ctx.creativeInjection,
        functionContract: ctx.functionContract,
        skinContract: ctx.skinContract,
        viewport,
        currentImplementationBase64: captureRef,
        pageContextSummary: ctx.pageContextSummary,
        authoritySourceRunId: ctx.runId,
      });
      const render = await renderPageGpt2DirectJob({
        package: pkg,
        width: dims.width,
        height: dims.height,
      });
      return {
        ...running,
        status: 'READY',
        providerJobId: render.providerJobId,
        imageUri: `data:image/png;base64,${render.imageBase64}`,
        model: render.model,
      };
    }

    const nbpPackage = buildPageNbpRequestPackage({
      gpt2Authority: ctx.gpt2Authority,
      creativeInjection: ctx.creativeInjection,
      functionContract: ctx.functionContract,
      skinContract: ctx.skinContract,
      renditionSlot: 'RENDITION_A',
      renditionDirective: 'Dual render test — faithful authority-first reconstruction (lane B).',
      viewport,
      currentImplementationBase64: captureRef,
      pageContextSummary: ctx.pageContextSummary,
      authorityApprovalId: ctx.authorityApprovalId,
      renditionId,
    });
    const render = await renderPageNbpJob({
      package: nbpPackage,
      width: dims.width,
      height: dims.height,
    });
    return {
      ...running,
      status: 'READY',
      providerJobId: render.providerJobId,
      imageUri: `data:image/png;base64,${render.imageBase64}`,
    };
  } catch (err) {
    return {
      ...running,
      status: 'FAILED',
      failureReason: err instanceof Error ? err.message : 'DUAL_RENDER_JOB_FAILED',
    };
  }
}

export async function executePageConceptDualRenderTest(
  ctx: DualRenderTestContext,
  emit: DualRenderTestEmit,
): Promise<{
  jobs: PageConceptGeneratedArtifact[];
  dualRenderTestRun: PageConceptDualRenderTestRun;
  pipelineSet: PageConceptPipelineSet;
  generationStatus: 'DUAL_RENDER_TEST_RUNNING' | 'DUAL_RENDER_TEST_REVIEW' | 'FAILED';
}> {
  const testRunId = ctx.existingDualRun?.id ?? `pdrt-${ctx.pipelineSetId}`;
  let dualRun =
    ctx.existingDualRun ??
    createInitialDualRenderTestRun({
      testRunId,
      authorityApprovalId: ctx.authorityApprovalId,
      approvedAuthorityArtifactId: ctx.gpt2Authority.conceptId,
      upstreamCgptRunId: ctx.creativeInjection.injectionId,
      upstreamGpt2AuthorityRunId: ctx.gpt2Authority.conceptId,
    });

  const lanesToRun: PageConceptRenderLaneType[] =
    ctx.regenerateLane ? [ctx.regenerateLane] : ['GPT2_DIRECT', 'NBP'];

  const preserved = ctx.existingJobs.filter((j) => {
    if (!j.artifactId.includes('-DRT-')) return false;
    if (ctx.regenerateLane === 'GPT2_DIRECT' && j.provider === 'GPT2_DIRECT') return false;
    if (ctx.regenerateLane === 'NBP' && j.provider === 'NBP') return false;
    return j.status === 'READY';
  });

  const specs: { lane: PageConceptRenderLaneType; viewport: 'MOBILE' | 'DESKTOP' }[] = [];
  for (const lane of lanesToRun) {
    for (const viewport of ['MOBILE', 'DESKTOP'] as const) {
      specs.push({ lane, viewport });
    }
  }

  emit({
    generationStatus: 'DUAL_RENDER_TEST_RUNNING',
    currentStage: 'DUAL_RENDER_TEST',
    cgptStatus: 'COMPLETE',
    gpt2Status: 'COMPLETE',
    nbpStatus: 'RUNNING',
  });

  const results = await Promise.all(specs.map((s) => runOneDualRenderJob(ctx, s.lane, s.viewport)));
  const jobs = [...preserved.filter((p) => !results.some((r) => r.artifactId === p.artifactId)), ...results];

  dualRun = syncDualRenderLaneFromJobs(dualRun, jobs);

  const anyFailed = results.some((j) => j.status === 'FAILED');
  const allReady = jobs.filter((j) => j.artifactId.includes('-DRT-')).every((j) => j.status === 'READY');
  const generationStatus =
    allReady && !anyFailed ? 'DUAL_RENDER_TEST_REVIEW'
    : anyFailed && jobs.some((j) => j.status === 'READY') ? 'DUAL_RENDER_TEST_REVIEW'
    : anyFailed ? 'FAILED'
    : 'DUAL_RENDER_TEST_REVIEW';

  dualRun = {
    ...dualRun,
    status: generationStatus === 'FAILED' ? 'FAILED' : 'READY_FOR_REVIEW',
  };

  const pipelineSet: PageConceptPipelineSet = {
    pipelineSetId: ctx.pipelineSetId,
    projectId: ctx.plan.projectId,
    pageId: ctx.plan.pageId,
    targetType: 'PAGE',
    captureSetId: ctx.plan.captureSetId,
    functionContractId: ctx.functionContract.contractId,
    creativeInjection: ctx.creativeInjection,
    cgptCreativeBrief: null,
    gpt2AuthorityConcept: ctx.gpt2Authority,
    renditions: [],
    renderMode: 'DUAL_RENDER_TEST',
    nbpLineage: {
      authorityApprovalId: ctx.authorityApprovalId,
      cgptDirectionId: ctx.creativeInjection.injectionId,
      gpt2AuthorityId: ctx.gpt2Authority.conceptId,
      gpt2AuthorityVersion: ctx.gpt2Authority.groundingPackageVersion ?? PAGE_NBP_PROMPT_VERSION,
      skinContractId: ctx.skinContract.contractId,
      skinContractVersion: ctx.skinContract.version,
    },
    createdAt: new Date().toISOString(),
  };

  emit({
    generationStatus,
    currentStage: generationStatus === 'DUAL_RENDER_TEST_REVIEW' ? 'DUAL_RENDER_TEST_COMPLETE' : 'DUAL_RENDER_TEST',
    cgptStatus: 'COMPLETE',
    gpt2Status: 'COMPLETE',
    nbpStatus: allReady ? 'COMPLETE' : anyFailed ? 'PARTIAL' : 'RUNNING',
    pipelineSet,
    jobs,
    dualRenderTestRun: dualRun,
    completedAt: generationStatus !== 'DUAL_RENDER_TEST_RUNNING' ? new Date().toISOString() : null,
  });

  return { jobs, dualRenderTestRun: dualRun, pipelineSet, generationStatus };
}
