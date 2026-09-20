import { WORKSPACE_CONCEPT_SLOT_IDS } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/constants.js';
import type {
  WorkspaceConceptPipelineSlot,
  WorkspaceDiversityLedgerEntry,
  WorkspaceSelfCreativePipelineSet,
} from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/creativePipelineTypes.js';
import {
  WORKSPACE_SELF_NBP_MODEL,
  buildWorkspaceSelfGenerationPlan,
} from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/generationPlan.js';
import type {
  WorkspaceSelfGeneratedArtifact,
  WorkspaceSelfGenerationPlan,
  WorkspaceSelfGenerationRunResult,
} from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/generationTypes.js';
import type { WorkspaceSelfWorkflowState } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/types.js';
import { generateWorkspaceCreativeDirection } from './generateWorkspaceCreativeDirection.js';
import { generateWorkspaceSingleConcept } from './generateWorkspaceSingleConcept.js';
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

  const slots: WorkspaceConceptPipelineSlot[] = [];
  const completed: WorkspaceSelfGeneratedArtifact[] = [];
  const diversityLedger: WorkspaceDiversityLedgerEntry[] = [];

  const baseCtx = {
    functionContract: input.state.functionContract!,
    sourceRoute: plan.captureSetId,
    hostDesignSystemVersion: input.state.nbpPackage?.hostDesignSystemVersion ?? 'site00-host-v1',
    workspaceArchitectureVersion: input.state.nbpPackage?.workspaceArchitectureVersion ?? 'twin-opus-direct-v1',
    ...SHARED_CTX,
  };

  for (const conceptSlot of WORKSPACE_CONCEPT_SLOT_IDS) {
    const slotState: WorkspaceConceptPipelineSlot = {
      conceptSlot,
      direction: null,
      concept: null,
    };

    let direction = input.state.creativePipelineSet?.slots.find((s) => s.conceptSlot === conceptSlot)?.direction ?? null;
    let concept = input.state.creativePipelineSet?.slots.find((s) => s.conceptSlot === conceptSlot)?.concept ?? null;

    const slotRetry = isRetry && [...retrySet].some((id) => id.includes(conceptSlot));

    if (!isRetry || (slotRetry && !concept)) {
      try {
        direction = await generateWorkspaceCreativeDirection({
          conceptSlot,
          diversityLedger: [...diversityLedger],
          ...baseCtx,
        });
        slotState.direction = direction;
        concept = await generateWorkspaceSingleConcept({ direction, ...baseCtx });
        slotState.concept = concept;
        diversityLedger.push({
          conceptSlot,
          name: concept.name,
          spatialDirection: direction.spatialDirection,
          hierarchyPriority: direction.hierarchyPriority,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'CREATIVE_FAILED';
        if (message.includes('CGPT')) slotState.directionError = message;
        else slotState.conceptError = message;
        slots.push(slotState);
        continue;
      }
    } else {
      slotState.direction = direction;
      slotState.concept = concept;
    }

    slots.push(slotState);

    if (!concept || !direction) continue;

    for (const viewport of ['MOBILE', 'DESKTOP'] as const) {
      const artifactId = `wsga-${conceptSlot}-${viewport}`;
      if (isRetry && !retrySet.has(artifactId)) continue;

      const running: WorkspaceSelfGeneratedArtifact = {
        artifactId,
        conceptId: conceptSlot,
        territoryId: concept.gpt2ConceptId,
        viewport,
        captureSetId: plan.captureSetId,
        functionContractId: plan.functionContractId,
        creativeBriefSetId: `wsp-${plan.captureSetId}`,
        creativeDirectionId: direction.directionId,
        gpt2ConceptId: concept.gpt2ConceptId,
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
      };

      try {
        const ref =
          viewport === 'MOBILE' ? input.mobileCapture.artifactBase64 : input.desktopCapture.artifactBase64;
        const dims = viewport === 'MOBILE' ? input.mobileCapture : input.desktopCapture;
        const render = await renderWorkspaceNbpJob({
          concept,
          direction,
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
      } catch (err) {
        const message = err instanceof Error ? err.message : 'NBP_JOB_FAILED';
        const stage = viewport === 'MOBILE' ? 'NBP_MOBILE_FAILED' : 'NBP_DESKTOP_FAILED';
        completed.push({
          ...running,
          status: 'FAILED',
          failureReason: `${stage}: ${message}`,
        });
      }
    }
  }

  const pipelineSet: WorkspaceSelfCreativePipelineSet = {
    pipelineSetId: `wsp-${Date.now()}`,
    targetId: input.state.targetId,
    captureSetId: plan.captureSetId,
    functionContractId: plan.functionContractId,
    slots,
    createdAt: new Date().toISOString(),
  };

  return { plan, pipelineSet, jobs: completed };
}

export { WORKSPACE_CONCEPT_SLOT_IDS };
