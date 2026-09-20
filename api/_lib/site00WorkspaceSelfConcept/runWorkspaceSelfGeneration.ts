import { WORKSPACE_CONCEPT_SLOT_IDS } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/constants.js';
import {
  WORKSPACE_SELF_CREATIVE_PROMPT_VERSION,
  WORKSPACE_SELF_NBP_MODEL,
  buildWorkspaceSelfGenerationPlan,
} from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/generationPlan.js';
import type {
  WorkspaceSelfCreativeBriefSet,
  WorkspaceSelfGeneratedArtifact,
  WorkspaceSelfGenerationPlan,
  WorkspaceSelfTerritoryBrief,
} from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/generationTypes.js';
import type { WorkspaceSelfWorkflowState } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/types.js';
import { generateWorkspaceSelfTerritories } from './generateWorkspaceTerritories.js';
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

export type RunWorkspaceSelfGenerationResult = import('../../../shared/site00-design-workspace-production/workspaceSelfConcept/generationTypes.js').WorkspaceSelfGenerationRunResult;

export function planWorkspaceSelfGeneration(state: WorkspaceSelfWorkflowState): WorkspaceSelfGenerationPlan {
  return buildWorkspaceSelfGenerationPlan(state);
}

export async function runWorkspaceSelfGeneration(
  input: RunWorkspaceSelfGenerationInput,
): Promise<RunWorkspaceSelfGenerationResult> {
  if (!input.founderConfirmedSpend) throw new Error('SPEND_GUARD: founder confirmation required');
  const plan = buildWorkspaceSelfGenerationPlan(input.state);
  if (input.state.targetType !== 'WORKSPACE_SELF') throw new Error('WORKSPACE_SELF_TARGET_REQUIRED');

  const { territories, provider, model } = await generateWorkspaceSelfTerritories({
    functionContract: input.state.functionContract!,
    sourceRoute: plan.captureSetId,
    hostDesignSystemVersion: input.state.nbpPackage?.hostDesignSystemVersion ?? 'site00-host-v1',
    workspaceArchitectureVersion: input.state.nbpPackage?.workspaceArchitectureVersion ?? 'twin-opus-direct-v1',
    visualProblems: [
      'Information density in pipeline + concept rail competes with hero compare',
      'Mobile artboard needs clearer primary action hierarchy',
    ],
    opportunities: [
      'Stronger separation between CURRENT capture and concept candidates',
      'More editorial SITE 00 host tone in panel chrome',
    ],
  });

  if (territories.length !== 3) throw new Error('CREATIVE_BRIEF_FAILED: expected 3 territories');

  const creativeBriefSet: WorkspaceSelfCreativeBriefSet = {
    creativeBriefSetId: `wscb-${Date.now()}`,
    targetId: input.state.targetId,
    captureSetId: plan.captureSetId,
    functionContractId: plan.functionContractId,
    creativeLayerModel: 'CGPT/GPT2',
    provider,
    territories,
    createdAt: new Date().toISOString(),
  };

  const retrySet = new Set(input.retryArtifactIds ?? []);
  const jobs = buildJobManifest(creativeBriefSet, territories, plan, retrySet);

  const completed: WorkspaceSelfGeneratedArtifact[] = [];

  for (const job of jobs) {
    if (retrySet.size > 0 && !retrySet.has(job.artifactId)) {
      continue;
    }
    const running = { ...job, status: 'RUNNING' as const };
    try {
      const territory = territories.find((t) => t.conceptSlotId === job.conceptId)!;
      const ref =
        job.viewport === 'MOBILE' ? input.mobileCapture.artifactBase64 : input.desktopCapture.artifactBase64;
      const dims = job.viewport === 'MOBILE' ? input.mobileCapture : input.desktopCapture;
      const render = await renderWorkspaceNbpJob({
        territory,
        viewport: job.viewport,
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
        artifactPath: null,
        failureReason: undefined,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'NBP_JOB_FAILED';
      completed.push({
        ...running,
        status: 'FAILED',
        failureReason: message,
      });
    }
  }

  return { plan, creativeBriefSet, jobs: completed };
}

function buildJobManifest(
  briefSet: WorkspaceSelfCreativeBriefSet,
  territories: readonly WorkspaceSelfTerritoryBrief[],
  plan: WorkspaceSelfGenerationPlan,
  retrySet: Set<string>,
): WorkspaceSelfGeneratedArtifact[] {
  const jobs: WorkspaceSelfGeneratedArtifact[] = [];
  for (const territory of territories) {
    for (const viewport of ['MOBILE', 'DESKTOP'] as const) {
      const artifactId = `wsga-${territory.conceptSlotId}-${viewport}`;
      jobs.push({
        artifactId,
        conceptId: territory.conceptSlotId,
        territoryId: territory.territoryId,
        viewport,
        captureSetId: plan.captureSetId,
        functionContractId: plan.functionContractId,
        creativeBriefSetId: briefSet.creativeBriefSetId,
        provider: 'NBP',
        model: WORKSPACE_SELF_NBP_MODEL,
        providerJobId: null,
        promptVersion: WORKSPACE_SELF_CREATIVE_PROMPT_VERSION,
        createdAt: new Date().toISOString(),
        status: retrySet.size > 0 && !retrySet.has(artifactId) ? 'READY' : 'PENDING',
        artifactPath: null,
        imageUri: null,
        width: viewport === 'MOBILE' ? 390 : 1440,
        height: viewport === 'MOBILE' ? 844 : 1024,
      });
    }
  }
  if (jobs.length !== 6) throw new Error('INTERNAL: expected 6 NBP jobs');
  return jobs;
}

export function assertNotPageConceptPath(): true {
  return true;
}

export { WORKSPACE_CONCEPT_SLOT_IDS };
