/**
 * P0.VR.EXPERIENCE-EXPRESSION-FAL-GENERATION-REVIEW-AND-HANDOFF1
 * P0.VR.EXPERIENCE-PACKAGE-MULTI-OUTPUT-DISPATCH-AND-REVIEW-FIX1
 */

import { buildExperienceExpressionFalTargetsFromPlan } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptExperienceExpressionFalPlan.js';
import type { ExperienceExpressionAuthority } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/experienceExpressionAuthority.js';
import type { PageConceptGeneratedArtifact } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import {
  buildExperiencePackageMetadata,
  isNdxbookOverviewExperiencePage,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/ndxbookOverviewExperienceExpressionContentSpec.js';
import {
  validateExperiencePackageMaterialization,
  validateExperiencePackagePlan,
  type ExperienceGenerationJob,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/experiencePackageMaterialization.js';
import { renderExperienceExpressionFalTarget } from './executePageConceptExperienceExpressionFal.js';
import {
  enrichExperienceAuthorityThemeContinuity,
  themePromptBlockForMode,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/experienceThemeContinuity.js';
import {
  attachContentManifestFieldsToVisualStates,
  auditExperienceContentForAuthority,
  buildExperienceContentManifestsForPage,
  canonicalContentPromptBlock,
  experienceContentBlocksApproval,
  manifestForState,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/experienceContentManifest.js';
import {
  buildMenuExpandedNavHierarchyRefinementPromptBlock,
  buildNdxbookOverviewExpandedNavHierarchy,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/ndxbookExpandedNavHierarchy.js';

export function experienceExpressionFalOutputsReady(authority: ExperienceExpressionAuthority): boolean {
  return validateExperiencePackageMaterialization(authority).ok;
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
  /** When true, re-run FAL even if preview already exists (full package regen). */
  forceRegenerate?: boolean;
}): Promise<{
  authority: ExperienceExpressionAuthority;
  jobs: readonly PageConceptGeneratedArtifact[];
}> {
  const contentGate = experienceContentBlocksApproval(input.authority);
  if (contentGate.receipt.manifests.some((m) => m.provenanceStatus === 'UNDEFINED_BLOCKED')) {
    const blocked = contentGate.receipt.manifests.find((m) => m.undefinedRequirements.length > 0);
    throw new Error(
      `EXPERIENCE_CONTENT_UNDEFINED:${blocked?.expressionType ?? 'UNKNOWN'}:${(blocked?.undefinedRequirements ?? []).join(',')}`,
    );
  }

  const plan = input.authority.packagingPlan;
  validateExperiencePackagePlan({
    plan,
    projectId: input.planMeta.projectId,
    route: input.functionContract.route,
    pageId: input.planMeta.pageId,
  });
  if (!plan?.groupedOutputs.length) {
    throw new Error('EXPERIENCE_PACKAGING_PLAN_REQUIRED');
  }
  const targets = buildExperienceExpressionFalTargetsFromPlan(plan);
  const priorByStateId = new Map(input.authority.visualStates.map((v) => [v.stateId, v]));

  const jobs: PageConceptGeneratedArtifact[] = [];
  const generationJobs: ExperienceGenerationJob[] = [];
  const renderByStateId = new Map<string, { imageUri: string; artifactId: string }>();

  const planMeta = {
    ...input.planMeta,
    experienceAuthorityId: input.authority.id,
  };

  let dispatchFailureCount = 0;

  const dispatchOne = async (target: (typeof targets)[number]) => {
    const existing = priorByStateId.get(target.stateId);
    const expressionType = target.sourceExpressionTypes[0] ?? 'OVERLAY_OR_DETAIL_STATE';
    const jobId = `exp-job-${target.stateId}-${input.authority.id.slice(-8)}`;

    if (!input.forceRegenerate && existing?.previewImageUri?.trim()) {
      generationJobs.push({
        jobId,
        experiencePackageId: input.authority.id,
        expressionType,
        stateId: target.stateId,
        sourceAuthorityId: input.authority.sourceMobileArtifactId,
        promptId: target.sourcePromptIds[0] ?? null,
        provider: 'FAL_EXPERIENCE',
        providerRequestId: null,
        status: 'PRESERVED',
        artifactId: existing.generatedArtifactId ?? null,
        error: null,
      });
      renderByStateId.set(target.stateId, {
        imageUri: existing.previewImageUri,
        artifactId: existing.generatedArtifactId ?? `preserved-${target.stateId}`,
      });
      return;
    }

    generationJobs.push({
      jobId,
      experiencePackageId: input.authority.id,
      expressionType,
      stateId: target.stateId,
      sourceAuthorityId: input.authority.sourceMobileArtifactId,
      promptId: target.sourcePromptIds[0] ?? null,
      provider: 'FAL_EXPERIENCE',
      providerRequestId: null,
      status: 'GENERATING',
      artifactId: null,
      error: null,
    });

    try {
      const render = await renderExperienceExpressionFalTarget({
        target,
        mobileAuthorityImageUri: input.mobileAuthorityImageUri,
        planMeta,
        dryRun: input.dryRun,
      });
      jobs.push(render.job);
      renderByStateId.set(render.stateId, { imageUri: render.imageUri, artifactId: render.artifactId });
      const gj = generationJobs.find((g) => g.stateId === target.stateId);
      if (gj) {
        gj.status = 'READY';
        gj.artifactId = render.artifactId;
        gj.providerRequestId = render.providerJobId;
      }
    } catch (e) {
      dispatchFailureCount += 1;
      const msg = e instanceof Error ? e.message : 'FAL_EXPERIENCE_FAILED';
      const gj = generationJobs.find((g) => g.stateId === target.stateId);
      if (gj) {
        gj.status = 'FAILED';
        gj.error = msg;
      }
    }
  };

  await Promise.all(targets.map((target) => dispatchOne(target)));

  const inheritedJobs: ExperienceGenerationJob[] = input.authority.visualStates
    .filter((v) => v.sourceProvider === 'INHERITED_MOBILE')
    .map((v) => ({
      jobId: `exp-job-${v.stateId}-inherited`,
      experiencePackageId: input.authority.id,
      expressionType: 'BASE_PAGE_AT_REST',
      stateId: v.stateId,
      sourceAuthorityId: input.authority.sourceMobileArtifactId,
      promptId: null,
      provider: 'INHERITED_AUTHORITY',
      providerRequestId: null,
      status: 'READY',
      artifactId: v.generatedArtifactId ?? input.authority.sourceMobileArtifactId,
      error: null,
    }));

  const visualStates = input.authority.visualStates.map((state) => {
    if (state.sourceProvider === 'INHERITED_MOBILE') {
      return {
        ...state,
        materializationStatus: 'INHERITED' as const,
        previewImageUri: state.previewImageUri ?? input.mobileAuthorityImageUri,
        generatedArtifactId: state.generatedArtifactId ?? input.authority.sourceMobileArtifactId,
      };
    }
    const rendered = renderByStateId.get(state.stateId);
    const jobFailed = generationJobs.some((j) => j.stateId === state.stateId && j.status === 'FAILED');
    const failed = jobFailed;
    if (rendered) {
      return {
        ...state,
        previewImageUri: rendered.imageUri,
        generatedArtifactId: rendered.artifactId,
        materializationStatus: 'READY' as const,
        caption: `${state.label} · ${state.packagingMode ?? 'SINGLE'} — FAL expression anchored on approved mobile authority.`,
      };
    }
    if (failed) {
      return { ...state, materializationStatus: 'FAILED' as const };
    }
    return { ...state, materializationStatus: 'GENERATING' as const };
  });

  const falModel = jobs[0]?.model ?? input.authority.falModel ?? null;
  const now = new Date().toISOString();
  const outputLineage = targets.map((t) => t.lineage);
  const materialization = validateExperiencePackageMaterialization({
    ...input.authority,
    visualStates,
    generationJobs: [...inheritedJobs, ...generationJobs],
  });

  const anyFailed = dispatchFailureCount > 0;
  let status: ExperienceExpressionAuthority['status'] =
    materialization.ok ? 'READY_FOR_REVIEW' : anyFailed ? 'PARTIAL_FAILURE' : 'READY_FOR_REVIEW';

  if (anyFailed && !materialization.ok) {
    status = 'PARTIAL_FAILURE';
  }

  let authority: ExperienceExpressionAuthority = {
    ...input.authority,
    status,
    visualStates,
    expressionAssetIds: [
      ...new Set([
        ...(input.authority.expressionAssetIds ?? []),
        ...jobs.map((j) => j.artifactId),
        ...visualStates.map((v) => v.generatedArtifactId).filter(Boolean) as string[],
      ]),
    ],
    outputLineage,
    falModel,
    generatedAt: now,
    generationJobs: [...inheritedJobs, ...generationJobs],
  };

  authority = enrichExperienceAuthorityThemeContinuity(authority, {
    projectId: input.planMeta.projectId,
    route: input.functionContract.route,
    pageId: input.planMeta.pageId,
  });

  const manifests = input.authority.experienceContentManifests ?? contentGate.receipt.manifests;
  authority = {
    ...authority,
    experienceContentManifests: manifests,
    experienceContentAudit: auditExperienceContentForAuthority({ ...authority, experienceContentManifests: manifests }),
    visualStates: attachContentManifestFieldsToVisualStates({ ...authority, experienceContentManifests: manifests }, manifests),
  };

  if (
    isNdxbookOverviewExperiencePage({
      projectId: input.planMeta.projectId,
      route: input.functionContract.route,
      pageId: input.planMeta.pageId,
    })
  ) {
    authority = {
      ...authority,
      experiencePackageMetadata: buildExperiencePackageMetadata({
        authority,
        territoryId: input.authority.sourceConceptId,
      }),
    };
  }

  return { authority, jobs };
}

export async function executePageConceptExperienceExpressionStateRegeneration(input: {
  authority: ExperienceExpressionAuthority;
  stateId: string;
  mobileAuthorityImageUri: string;
  planMeta: Parameters<typeof executePageConceptExperienceExpressionGeneration>[0]['planMeta'];
  functionContract: Parameters<typeof executePageConceptExperienceExpressionGeneration>[0]['functionContract'];
  dryRun?: boolean;
  /** Re-run one state forcing INHERIT_AUTHORITY theme contract (localized contrast cleared). */
  forceInheritAuthorityTheme?: boolean;
}): Promise<{ authority: ExperienceExpressionAuthority; jobs: readonly PageConceptGeneratedArtifact[] }> {
  const plan = input.authority.packagingPlan;
  if (!plan) throw new Error('EXPERIENCE_PACKAGING_PLAN_REQUIRED');
  const targets = buildExperienceExpressionFalTargetsFromPlan(plan);
  const target = targets.find((t) => t.stateId === input.stateId);
  if (!target) throw new Error('EXPERIENCE_STATE_NOT_IN_PLAN');

  const inheritBlock = input.forceInheritAuthorityTheme ?
    `\n${themePromptBlockForMode('INHERIT_AUTHORITY', null)}`
  : '';

  const ndxOverview = isNdxbookOverviewExperiencePage({
    projectId: input.planMeta.projectId,
    route: input.functionContract.route,
    pageId: input.planMeta.pageId,
  });
  let prompt = `${target.prompt}${inheritBlock}`;
  let referenceImageUri: string | undefined;
  if (input.stateId === 'menu' && ndxOverview) {
    const hierarchy = buildNdxbookOverviewExpandedNavHierarchy(input.planMeta.projectId, input.planMeta.pageId);
    const manifests = buildExperienceContentManifestsForPage({
      projectId: input.planMeta.projectId,
      pageId: input.planMeta.pageId,
      route: input.functionContract.route,
      functionContract: input.functionContract,
    });
    const menuManifest = manifestForState(manifests, 'menu');
    if (menuManifest) {
      prompt = [
        target.prompt,
        inheritBlock,
        canonicalContentPromptBlock(menuManifest),
        buildMenuExpandedNavHierarchyRefinementPromptBlock({ hierarchyLines: hierarchy.hierarchyLines }),
      ].join('\n\n');
    }
    const existingMenu = input.authority.visualStates.find((s) => s.stateId === 'menu');
    if (existingMenu?.previewImageUri?.trim()) {
      referenceImageUri = existingMenu.previewImageUri.trim();
    }
  }

  const render = await renderExperienceExpressionFalTarget({
    target: { ...target, prompt },
    mobileAuthorityImageUri: input.mobileAuthorityImageUri,
    referenceImageUri,
    planMeta: { ...input.planMeta, experienceAuthorityId: input.authority.id },
    dryRun: input.dryRun,
  });

  const expressionPrompts =
    input.forceInheritAuthorityTheme ?
      (input.authority.expressionPrompts ?? []).map((p) =>
        p.stateId === input.stateId || (p.stateId == null && p.expressionType === target.sourceExpressionTypes[0]) ?
          { ...p, themeMode: 'INHERIT_AUTHORITY' as const, contrastRationale: null }
        : p,
      )
    : input.authority.expressionPrompts;

  const visualStates = input.authority.visualStates.map((state) => {
    if (state.stateId !== input.stateId) return state;
    return {
      ...state,
      previewImageUri: render.imageUri,
      generatedArtifactId: render.artifactId,
      materializationStatus: 'READY' as const,
      caption: `${state.label} — regenerated single expression state${input.forceInheritAuthorityTheme ? ' (authority theme inherit).' : '.'}`,
      themeMode: input.forceInheritAuthorityTheme ? ('INHERIT_AUTHORITY' as const) : state.themeMode,
      contrastRationale: input.forceInheritAuthorityTheme ? null : state.contrastRationale,
      outputThemeDominance: input.forceInheritAuthorityTheme ? ('LIGHT' as const) : state.outputThemeDominance,
    };
  });

  const priorAssets = input.authority.expressionAssetIds ?? [];
  const expressionAssetIds = [...new Set([...priorAssets.filter((id) => id !== render.artifactId), render.artifactId])];

  const retryJob: ExperienceGenerationJob = {
    jobId: `exp-job-retry-${input.stateId}-${Date.now()}`,
    experiencePackageId: input.authority.id,
    expressionType: target.sourceExpressionTypes[0] ?? 'OVERLAY_OR_DETAIL_STATE',
    stateId: input.stateId,
    sourceAuthorityId: input.authority.sourceMobileArtifactId,
    promptId: target.sourcePromptIds[0] ?? null,
    provider: 'FAL_EXPERIENCE',
    providerRequestId: render.providerJobId,
    status: 'READY',
    artifactId: render.artifactId,
    error: null,
  };

  let authority: ExperienceExpressionAuthority = {
    ...input.authority,
    status: validateExperiencePackageMaterialization({ ...input.authority, visualStates }).ok ?
        'READY_FOR_REVIEW'
      : 'PARTIAL_FAILURE',
    visualStates,
    expressionPrompts,
    expressionAssetIds,
    generatedAt: new Date().toISOString(),
    generationJobs: [...(input.authority.generationJobs ?? []).filter((j) => j.stateId !== input.stateId), retryJob],
  };

  authority = enrichExperienceAuthorityThemeContinuity(authority, {
    projectId: input.planMeta.projectId,
    route: input.functionContract.route,
    pageId: input.planMeta.pageId,
  });

  if (ndxOverview) {
    const manifests = buildExperienceContentManifestsForPage({
      projectId: input.planMeta.projectId,
      pageId: input.planMeta.pageId,
      route: input.functionContract.route,
      functionContract: input.functionContract,
    });
    authority = {
      ...authority,
      experienceContentManifests: manifests,
      experienceContentAudit: auditExperienceContentForAuthority({ ...authority, experienceContentManifests: manifests }),
      visualStates: attachContentManifestFieldsToVisualStates({ ...authority, experienceContentManifests: manifests }, manifests),
      experiencePackageMetadata: buildExperiencePackageMetadata({
        authority: { ...authority, experienceContentManifests: manifests },
        territoryId: input.authority.sourceConceptId,
      }),
    };
  }

  return { authority, jobs: [render.job] };
}
