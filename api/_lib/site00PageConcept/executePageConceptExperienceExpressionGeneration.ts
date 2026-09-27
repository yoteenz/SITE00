/**
 * P0.VR.EXPERIENCE-EXPRESSION-FAL-GENERATION-REVIEW-AND-HANDOFF1
 */

import { buildExperienceExpressionFalTargetsFromPlan } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptExperienceExpressionFalPlan.js';
import type { ExperienceExpressionAuthority } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/experienceExpressionAuthority.js';
import type { PageConceptGeneratedArtifact } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { renderExperienceExpressionFalTarget } from './executePageConceptExperienceExpressionFal.js';

export function experienceExpressionFalOutputsReady(authority: ExperienceExpressionAuthority): boolean {
  const falStates = authority.visualStates.filter((v) => v.sourceProvider === 'FAL_EXPERIENCE');
  if (falStates.length === 0) return false;
  return falStates.every((v) => Boolean(v.previewImageUri?.trim()));
}

export async function executePageConceptExperienceExpressionGeneration(input: {
  authority: ExperienceExpressionAuthority;
  mobileAuthorityImageUri: string;
  planMeta: {
    projectId: string;
    pageId: string;
    captureSetId: string;
    projectContextVersion: string;
    pageContextVersion: string;
    functionContractId: string;
    creativeInjectionId: string;
    selectedMobileConceptId: string;
  };
  functionContract: import('../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js').PageFunctionContract;
  cgptBrief: import('../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js').PageConceptCgptCreativeBrief;
  injection: import('../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js').PageCreativeInjection;
  dryRun?: boolean;
}): Promise<{
  authority: ExperienceExpressionAuthority;
  jobs: readonly PageConceptGeneratedArtifact[];
}> {
  const plan = input.authority.packagingPlan;
  if (!plan?.groupedOutputs.length) {
    throw new Error('EXPERIENCE_PACKAGING_PLAN_REQUIRED');
  }
  const targets = buildExperienceExpressionFalTargetsFromPlan(plan);

  const jobs: PageConceptGeneratedArtifact[] = [];
  const renderByStateId = new Map<string, { imageUri: string; artifactId: string }>();

  for (const target of targets) {
    const render = await renderExperienceExpressionFalTarget({
      target,
      mobileAuthorityImageUri: input.mobileAuthorityImageUri,
      planMeta: {
        ...input.planMeta,
        experienceAuthorityId: input.authority.id,
      },
      dryRun: input.dryRun,
    });
    jobs.push(render.job);
    renderByStateId.set(render.stateId, { imageUri: render.imageUri, artifactId: render.artifactId });
  }

  const visualStates = input.authority.visualStates.map((state) => {
    if (state.sourceProvider !== 'FAL_EXPERIENCE') return state;
    const rendered = renderByStateId.get(state.stateId);
    if (!rendered) return state;
    return {
      ...state,
      previewImageUri: rendered.imageUri,
      generatedArtifactId: rendered.artifactId,
      caption: `${state.label} · ${state.packagingMode ?? 'SINGLE'} — FAL expression anchored on approved mobile authority.`,
    };
  });

  const falModel = jobs[0]?.model ?? null;
  const now = new Date().toISOString();
  const outputLineage = targets.map((t) => t.lineage);

  const authority: ExperienceExpressionAuthority = {
    ...input.authority,
    status: 'READY_FOR_REVIEW',
    visualStates,
    expressionAssetIds: jobs.map((j) => j.artifactId),
    outputLineage,
    falModel,
    generatedAt: now,
  };

  return { authority, jobs };
}
