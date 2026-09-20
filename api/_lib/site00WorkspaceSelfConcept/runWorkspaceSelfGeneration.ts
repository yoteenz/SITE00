import { WORKSPACE_CONCEPT_SLOT_IDS } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/constants.js';
import type {
  WorkspaceConceptRendition,
  WorkspaceSelfCreativePipelineSet,
} from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/creativePipelineTypes.js';
import { WORKSPACE_SELF_PIPELINE_SCHEMA_SINGLE } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/pipelineLegacy.js';
import {
  WORKSPACE_SELF_NBP_MODEL,
  buildWorkspaceSelfGenerationPlan,
} from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/generationPlan.js';
import { planWorkspaceNbpRenditions } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/renditionPlanner.js';
import type {
  WorkspaceSelfGeneratedArtifact,
  WorkspaceSelfGenerationPlan,
  WorkspaceSelfGenerationRunResult,
} from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/generationTypes.js';
import type { WorkspaceSelfWorkflowState } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/types.js';
import { generateWorkspaceCreativeContext } from './generateWorkspaceCreativeContext.js';
import { generateWorkspaceGpt2AuthorityConcept } from './generateWorkspaceGpt2AuthorityConcept.js';
import { renderWorkspaceNbpJob } from './renderWorkspaceNbpJob.js';

export type GenerationCapturePayload = {
  captureId: string;
  artifactBase64: string;
  width: number;
  height: number;
};

export type RunWorkspaceSelfGenerationInput = {
  state: WorkspaceSelfWorkflowState;
  mobileCapture: GenerationCapturePayload;
  desktopCapture: GenerationCapturePayload;
  founderConfirmedSpend: boolean;
  createdBy: string;
  retryArtifactIds?: string[];
};

const SHARED_CTX = {
  visualProblems: [
    'Information density in pipeline + concept rail competes with hero compare',
    'Mobile artboard needs clearer primary action hierarchy',
  ],
  opportunities: [
    'Stronger separation between CURRENT capture and concept candidates',
    'More editorial SITE 00 host tone in panel chrome',
  ],
};

export function planWorkspaceSelfGeneration(state: WorkspaceSelfWorkflowState): WorkspaceSelfGenerationPlan {
  return buildWorkspaceSelfGenerationPlan(state);
}

export async function runWorkspaceSelfGeneration(
  input: RunWorkspaceSelfGenerationInput,
): Promise<WorkspaceSelfGenerationRunResult> {
  if (!input.founderConfirmedSpend) throw new Error('SPEND_GUARD: founder confirmation required');
  const plan = buildWorkspaceSelfGenerationPlan(input.state);
  if (input.state.targetType !== 'WORKSPACE_SELF') throw new Error('WORKSPACE_SELF_TARGET_REQUIRED');

  const retrySet = new Set(input.retryArtifactIds ?? []);
  const isRetry = retrySet.size > 0;

  const completed: WorkspaceSelfGeneratedArtifact[] = [];
  const conceptSetId = input.state.conceptSet?.conceptSetId ?? `wscs-pending-${Date.now()}`;

  const baseCtx = {
    functionContract: input.state.functionContract!,
    sourceRoute: plan.captureSetId,
    hostDesignSystemVersion: input.state.nbpPackage?.hostDesignSystemVersion ?? 'site00-host-v1',
    workspaceArchitectureVersion: input.state.nbpPackage?.workspaceArchitectureVersion ?? 'twin-opus-direct-v1',
    ...SHARED_CTX,
  };

  let creativeContext = input.state.creativePipelineSet?.creativeContext ?? null;
  let gpt2Authority = input.state.creativePipelineSet?.gpt2AuthorityConcept ?? null;
  let creativeContextError = input.state.creativePipelineSet?.creativeContextError;
  let gpt2AuthorityError = input.state.creativePipelineSet?.gpt2AuthorityError;

  const pipelineSetId = input.state.creativePipelineSet?.pipelineSetId ?? `wsp-${Date.now()}`;

  const reusePipeline = input.state.creativePipelineSet?.schemaVersion === WORKSPACE_SELF_PIPELINE_SCHEMA_SINGLE;

  if (!isRetry || !reusePipeline || !creativeContext) {
    try {
      creativeContext = await generateWorkspaceCreativeContext({
        captureSetId: plan.captureSetId,
        ...baseCtx,
      });
      creativeContextError = undefined;
    } catch (err) {
      creativeContextError = err instanceof Error ? err.message : 'CGPT_CONTEXT_FAILED';
      creativeContext = null;
    }
  }

  if (creativeContext && !gpt2Authority && !gpt2AuthorityError) {
    if (!isRetry || !reusePipeline) {
      try {
        gpt2Authority = await generateWorkspaceGpt2AuthorityConcept({
          creativeContext,
          functionContract: input.state.functionContract!,
          sourceRoute: baseCtx.sourceRoute,
        });
        gpt2AuthorityError = undefined;
      } catch (err) {
        gpt2AuthorityError = err instanceof Error ? err.message : 'GPT2_AUTHORITY_FAILED';
        gpt2Authority = null;
      }
    } else {
      gpt2Authority = input.state.creativePipelineSet?.gpt2AuthorityConcept ?? null;
    }
  }

  const renditionPlans = planWorkspaceNbpRenditions();
  const renditions: WorkspaceConceptRendition[] = [];

  if (creativeContext && gpt2Authority) {
    for (const rp of renditionPlans) {
      const renditionId = `wrend-${rp.slot}-${pipelineSetId}`;
      let mobileArtifactId: string | null = null;
      let desktopArtifactId: string | null = null;
      let renditionFailed = false;

      for (const viewport of ['MOBILE', 'DESKTOP'] as const) {
        const artifactId = `wsga-${rp.slot}-${viewport}`;
        if (isRetry && !retrySet.has(artifactId)) {
          const existing = input.state.generationJobs.find((j) => j.artifactId === artifactId && j.status === 'READY');
          if (existing) {
            if (viewport === 'MOBILE') mobileArtifactId = artifactId;
            else desktopArtifactId = artifactId;
          }
          continue;
        }

        const running: WorkspaceSelfGeneratedArtifact = {
          artifactId,
          conceptId: rp.slot,
          renditionSlot: rp.slot,
          territoryId: gpt2Authority.conceptId,
          viewport,
          captureSetId: plan.captureSetId,
          functionContractId: plan.functionContractId,
          creativeBriefSetId: pipelineSetId,
          creativeContextId: creativeContext.creativeContextId,
          creativeDirectionId: creativeContext.creativeContextId,
          gpt2ConceptId: gpt2Authority.conceptId,
          sourceGpt2ConceptId: gpt2Authority.conceptId,
          provider: 'NBP',
          model: WORKSPACE_SELF_NBP_MODEL,
          providerJobId: null,
          promptVersion: plan.nbpPromptVersion,
          createdAt: new Date().toISOString(),
          status: 'RUNNING',
          artifactPath: null,
          imageUri: null,
          width: viewport === 'MOBILE' ? input.mobileCapture.width : input.desktopCapture.width,
          height: viewport === 'MOBILE' ? input.mobileCapture.height : input.desktopCapture.height,
          renditionDirective: rp.renditionDirective,
        };

        try {
          const ref =
            viewport === 'MOBILE' ? input.mobileCapture.artifactBase64 : input.desktopCapture.artifactBase64;
          const dims = viewport === 'MOBILE' ? input.mobileCapture : input.desktopCapture;
          const render = await renderWorkspaceNbpJob({
            gpt2Authority,
            creativeContext,
            renditionSlot: rp.slot,
            renditionDirective: rp.renditionDirective,
            viewport,
            referenceImageBase64: ref,
            width: dims.width,
            height: dims.height,
            functionContract: input.state.functionContract!,
          });
          completed.push({
            ...running,
            status: 'READY',
            providerJobId: render.providerJobId,
            imageUri: `data:image/png;base64,${render.imageBase64}`,
          });
          if (viewport === 'MOBILE') mobileArtifactId = artifactId;
          else desktopArtifactId = artifactId;
        } catch (err) {
          renditionFailed = true;
          const message = err instanceof Error ? err.message : 'NBP_JOB_FAILED';
          const stage = viewport === 'MOBILE' ? 'NBP_MOBILE_FAILED' : 'NBP_DESKTOP_FAILED';
          completed.push({
            ...running,
            status: 'FAILED',
            failureReason: `${stage}: ${message}`,
          });
        }
      }

      const readyBoth = Boolean(mobileArtifactId && desktopArtifactId);
      renditions.push({
        renditionId,
        conceptSetId,
        slot: rp.slot,
        sourceGpt2ConceptId: gpt2Authority.conceptId,
        mobileArtifactId,
        desktopArtifactId,
        status: readyBoth ? 'READY' : renditionFailed ? 'FAILED' : mobileArtifactId || desktopArtifactId ? 'PARTIAL' : 'PENDING',
        renditionDirective: rp.renditionDirective,
      });
    }
  }

  const pipelineSet: WorkspaceSelfCreativePipelineSet = {
    pipelineSetId,
    targetId: input.state.targetId,
    captureSetId: plan.captureSetId,
    functionContractId: plan.functionContractId,
    schemaVersion: WORKSPACE_SELF_PIPELINE_SCHEMA_SINGLE,
    creativeContext,
    gpt2AuthorityConcept: gpt2Authority,
    renditions,
    creativeContextError,
    gpt2AuthorityError,
    createdAt: new Date().toISOString(),
  };

  return { plan, pipelineSet, jobs: completed };
}

export { WORKSPACE_CONCEPT_SLOT_IDS };
