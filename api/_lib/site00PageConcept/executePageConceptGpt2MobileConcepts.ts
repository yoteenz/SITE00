import type {
  PageConceptGeneratedArtifact,
  PageConceptGenerationPlan,
  PageCreativeInjection,
  PageFunctionContract,
  PageCreativeContext,
  ProjectCreativeContext,
  PageConceptCgptCreativeBrief,
  PageConceptPageArchitectureBrief,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import {
  evaluateGpt2MobilePageArchitectureValidity,
  buildPageArchitectureFounderDebugLines,
  validatePageArchitectureBrief,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageArchitectureBrief.js';
import {
  mobileConceptArtifactId,
  PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS,
  type PageGpt2MobileConcept,
  type PageMobileConceptSlotId,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportAuthorityFamily.js';
import { PAGE_CONCEPT_CANONICAL_PIPELINE_ID } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCanonicalPipeline.js';
import { PAGE_GPT2_MOBILE_FAL_MODEL } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import { compileProjectSkinContract } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import { pageContextForGpt2Package } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectVisualIdentity.js';
import { buildPageGpt2MobileConceptRequestPackage } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileRequestPackage.js';
import {
  buildGpt2MobileArtifactDebug,
  gpt2MobileConceptRenditionSlot,
  PAGE_GPT2_MOBILE_PAGE_CONCEPT_PROMPT_VERSION,
  PAGE_GPT2_MOBILE_PAGE_SLOT_LABELS,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobilePageAuthority.js';
import { renderPageGpt2MobileConceptJob } from './renderPageGpt2MobileConceptJob.js';
import { persistPageConceptMobileArtifact } from './persistPageConceptMobileArtifact.js';
import { logPageConceptGpt2MobileEvent } from './pageConceptGpt2MobileObservability.js';
import {
  buildGpt2MobileProviderReferenceBundle,
  formatGpt2MobileReferenceAuthorityDebugLines,
  orderedProviderReferenceAssets,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileReferenceAuthority.js';
import {
  buildGpt2MobileConceptQualityDebugLines,
  evaluateGpt2MobileConceptHandoffValidity,
  validateGpt2MobileConceptQualityPrompt,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileConceptContracts.js';
import {
  buildGpt2MobileContinuityLockDebugLines,
  evaluateGpt2MobileBottomNavContinuityHandoffValidity,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileContinuityLock.js';

export type Gpt2MobileConceptsResult = {
  jobs: PageConceptGeneratedArtifact[];
  mobileConcepts: PageGpt2MobileConcept[];
  partialFailure: boolean;
};

function stripDataUrlPrefix(base64: string): string {
  const trimmed = base64.trim();
  if (trimmed.startsWith('data:')) {
    const comma = trimmed.indexOf(',');
    if (comma === -1) return trimmed;
    return trimmed.slice(comma + 1);
  }
  return trimmed;
}

async function renderMobileConceptSlot(input: {
  runId: string;
  slot: PageMobileConceptSlotId;
  dryRun: boolean;
  pipelineSetId: string;
  plan: PageConceptGenerationPlan;
  injection: PageCreativeInjection;
  cgptBrief: PageConceptCgptCreativeBrief | null;
  pageArchitectureBrief: PageConceptPageArchitectureBrief | null;
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
  mobileDims: { width: number; height: number };
  functionalCaptureBase64: string;
  existingJob?: PageConceptGeneratedArtifact;
  retrySlots?: readonly PageMobileConceptSlotId[] | null;
  forceRegenerate?: boolean;
  artifactIdOverride?: string;
}): Promise<{ concept: PageGpt2MobileConcept; job: PageConceptGeneratedArtifact }> {
  const artifactId = input.artifactIdOverride ?? mobileConceptArtifactId(input.slot);
  const conceptId = `pg2m-page-${input.slot}-${input.pipelineSetId}`;
  const renditionSlot = gpt2MobileConceptRenditionSlot(input.slot);
  const displayTitle = PAGE_GPT2_MOBILE_PAGE_SLOT_LABELS[input.slot];
  const now = new Date().toISOString();

  if (input.retrySlots && input.retrySlots.length > 0 && !input.retrySlots.includes(input.slot)) {
    if (input.existingJob?.status === 'READY') {
      return {
        concept: {
          conceptId,
          slot: input.slot,
          artifactId,
          imageUri: input.existingJob.imageUri,
          status: 'READY',
          createdAt: input.existingJob.createdAt,
        },
        job: input.existingJob,
      };
    }
  }

  if (
    !input.forceRegenerate &&
    input.existingJob?.status === 'READY' &&
    input.existingJob.providerJobId &&
    input.existingJob.imageUri
  ) {
    return {
      concept: {
        conceptId,
        slot: input.slot,
        artifactId,
        imageUri: input.existingJob.imageUri,
        status: 'READY',
        createdAt: input.existingJob.createdAt,
      },
      job: input.existingJob,
    };
  }

  if (input.dryRun || process.env.VITEST === 'true') {
    const concept: PageGpt2MobileConcept = {
      conceptId,
      slot: input.slot,
      artifactId,
      imageUri: `data:image/png;base64,${Buffer.from(`vitest-${input.slot}`, 'utf8').toString('base64')}`,
      status: 'READY',
      createdAt: now,
    };
    const job: PageConceptGeneratedArtifact = {
      artifactId,
      projectId: input.plan.projectId,
      pageId: input.plan.pageId,
      renditionSlot,
      viewport: 'MOBILE',
      captureSetId: input.plan.captureSetId,
      projectContextVersion: input.projectContext.contextVersion,
      pageContextVersion: input.pageContext.contextVersion,
      functionContractId: input.functionContract.contractId,
      creativeInjectionId: input.injection.injectionId,
      gpt2AuthorityConceptId: conceptId,
      renditionId: `pg2m-page-${input.slot}-${input.pipelineSetId}`,
      provider: 'GPT2_MOBILE',
      model: PAGE_GPT2_MOBILE_FAL_MODEL,
      providerJobId: input.dryRun ? 'dry-run' : `vitest-${input.slot}`,
      promptVersion: PAGE_GPT2_MOBILE_PAGE_CONCEPT_PROMPT_VERSION,
      displayTitle,
      createdAt: now,
      status: 'READY',
      artifactPath: null,
      imageUri: concept.imageUri,
      width: input.mobileDims.width,
      height: input.mobileDims.height,
    };
    return { concept, job };
  }

  const skinContract = compileProjectSkinContract(input.projectContext.projectId);
  const pageContextSummary = JSON.stringify(pageContextForGpt2Package(input.pageContext));
  const captureB64 = stripDataUrlPrefix(input.functionalCaptureBase64);

  const archCheck = validatePageArchitectureBrief(input.pageArchitectureBrief);
  if (!archCheck.ok && !input.dryRun && process.env.VITEST !== 'true') {
    throw new Error(`PAGE_ARCHITECTURE_INCOMPLETE: ${archCheck.missingSections.join(', ')}`);
  }

  const providerReferences = await buildGpt2MobileProviderReferenceBundle({
    captureSetId: input.plan.captureSetId,
    functionalCaptureBase64: captureB64,
    functionalAssetId: `${input.plan.captureSetId}:mobile-functional-page`,
    functionalSourcePath: `capture-set/${input.plan.captureSetId}/mobile-functional-page.png`,
    fallbackViewport: input.mobileDims,
  });

  const referenceDebugLines = formatGpt2MobileReferenceAuthorityDebugLines(providerReferences);
  const referenceInputs = orderedProviderReferenceAssets(providerReferences).map((asset) => ({
    role: asset.role,
    assetId: asset.assetId,
    sourcePath: asset.sourcePath,
    width: asset.width,
    height: asset.height,
  }));

  const pkg = buildPageGpt2MobileConceptRequestPackage({
    runId: input.runId,
    slot: input.slot,
    conceptId,
    projectContext: input.projectContext,
    pageContext: input.pageContext,
    functionContract: input.functionContract,
    injection: input.injection,
    cgptBrief: input.cgptBrief,
    pageArchitectureBrief: input.pageArchitectureBrief,
    skinContract,
    providerReferences,
    pageContextSummary,
    mobileViewport: input.mobileDims,
  });

  const runningJob: PageConceptGeneratedArtifact = {
    artifactId,
    projectId: input.plan.projectId,
    pageId: input.plan.pageId,
    renditionSlot,
    viewport: 'MOBILE',
    captureSetId: input.plan.captureSetId,
    projectContextVersion: input.projectContext.contextVersion,
    pageContextVersion: input.pageContext.contextVersion,
    functionContractId: input.functionContract.contractId,
    creativeInjectionId: input.injection.injectionId,
    gpt2AuthorityConceptId: conceptId,
    renditionId: `pg2m-page-${input.slot}-${input.pipelineSetId}`,
    provider: 'GPT2_MOBILE',
    model: PAGE_GPT2_MOBILE_FAL_MODEL,
    providerJobId: null,
    promptVersion: pkg.inspector.promptVersion,
    displayTitle,
    createdAt: now,
    status: 'RUNNING',
    artifactPath: null,
    imageUri: null,
    width: input.mobileDims.width,
    height: input.mobileDims.height,
  };

  try {
    const render = await renderPageGpt2MobileConceptJob({
      package: pkg,
      width: input.mobileDims.width,
      height: input.mobileDims.height,
    });
    const persisted = await persistPageConceptMobileArtifact({
      runId: input.runId,
      projectId: input.plan.projectId,
      pageId: input.plan.pageId,
      conceptSlot: input.slot,
      artifactId,
      providerJobId: render.providerJobId,
      imageBase64: render.imageBase64,
      cgptBriefId: input.injection.injectionId,
      skinVersion: skinContract.version,
    });

    const archEval = evaluateGpt2MobilePageArchitectureValidity({
      architectureBrief: input.pageArchitectureBrief,
      promptIncludedArchitecture: pkg.prompt.includes('PAGE REGIONS'),
      posterDriftHeuristic: false,
    });
    const conceptEval = evaluateGpt2MobileConceptHandoffValidity(pkg.prompt);
    const continuityEval = evaluateGpt2MobileBottomNavContinuityHandoffValidity(pkg.prompt);
    const qualityPrompt = validateGpt2MobileConceptQualityPrompt(pkg.prompt);
    const compiledMeta = pkg.inspector.compiledProviderPrompt;
    const manifest = providerReferences.authorityManifest;
    const conceptQualityDebug = buildGpt2MobileConceptQualityDebugLines({
      pageArchitectureBriefId: input.pageArchitectureBrief?.briefId ?? null,
      structuralAuthoritySource: 'FULL_PAGE_SOURCE_CAPTURE (Image A)',
      bottomContinuitySource: 'BOTTOM_HALF (B) + BOTTOM_NAV_AUTHORITY_CROP (C)',
      slot: input.slot,
      uppercaseContractApplied: qualityPrompt.ok,
      conceptDiversityContractApplied: qualityPrompt.ok,
      lightFamilyContractApplied: qualityPrompt.ok,
      bottomNavInherited: manifest.bottomNavAuthorityAttached,
      pageValidityPass: archEval.ok && conceptEval.ok && continuityEval.ok,
      posterRejectionPass: archEval.ok,
    });
    const debug = buildGpt2MobileArtifactDebug({
      slot: input.slot,
      territoryDirective: pkg.inspector.territoryDirective,
      bottomContinuityApplied: pkg.inspector.bottomContinuityApplied,
      pageValidityPass: archEval.ok && conceptEval.ok && continuityEval.ok,
      posterDriftWarning: !archEval.ok || !conceptEval.ok || !continuityEval.ok,
      screenshotOverreachWarning: false,
      pageArchitectureBriefId: input.pageArchitectureBrief?.briefId,
      regionMapVersion: input.pageArchitectureBrief?.regionMapVersion,
      bottomContinuityContractId: input.pageArchitectureBrief?.bottomContinuityContractId,
      navigationContractId: input.pageArchitectureBrief?.navigationContractId,
      scrollNarrativeId: input.pageArchitectureBrief?.scrollNarrativeId,
      pageArchitectureValidation: archEval.ok ? 'PASS' : 'PAGE_ARCHITECTURE_VALIDATION_FAILED',
      pageArchitectureDebugLines: [
        ...buildPageArchitectureFounderDebugLines(input.pageArchitectureBrief, archEval),
        ...referenceDebugLines,
        `PROVIDER PROMPT VERSION: ${pkg.inspector.compiledProviderPrompt.compiledPromptVersion}`,
        `PROVIDER PROMPT CHAR COUNT: ${pkg.inspector.compiledProviderPrompt.compiledPromptCharCount}`,
        `SAFE LIMIT: ${pkg.inspector.compiledProviderPrompt.safeLimit}`,
        `COMPILED PROMPT HASH: ${pkg.inspector.compiledProviderPrompt.compiledPromptHash}`,
        `SOURCE CGPT BRIEF: ${pkg.inspector.compiledProviderPrompt.sourceContractIds.cgptBriefId ?? '—'}`,
        `SOURCE PAGE ARCH: ${pkg.inspector.compiledProviderPrompt.sourceContractIds.pageArchitectureBriefId ?? '—'}`,
        `SOURCE SKIN: ${pkg.inspector.compiledProviderPrompt.sourceContractIds.skinContractId}`,
        `SOURCE FUNCTION: ${pkg.inspector.compiledProviderPrompt.sourceContractIds.functionContractId}`,
        ...buildGpt2MobileContinuityLockDebugLines(manifest),
        ...conceptQualityDebug,
        `BOTTOM NAV CONTINUITY VALIDATION: ${continuityEval.ok ? 'PASS' : continuityEval.failedChecks.join(',')}`,
      ],
      conceptTerritoryLabel: compiledMeta.conceptTerritoryLabel,
      conceptThemeClass: compiledMeta.conceptThemeClass,
      uppercaseContractApplied: compiledMeta.conceptQualityContractsApplied,
      conceptDiversityContractApplied: compiledMeta.conceptQualityContractsApplied,
      lightFamilyContractApplied: compiledMeta.conceptQualityContractsApplied,
      bottomNavInherited: manifest.bottomNavAuthorityAttached,
      bottomContinuityLockActive: manifest.bottomContinuityLockActive,
      bottomNavContinuityValidationPass: continuityEval.ok,
      sourceAuthorityManifest: {
        fullPageSourceAttached: manifest.fullPageSourceAttached,
        bottomHalfSourceAttached: manifest.bottomHalfSourceAttached,
        bottomNavAuthorityAttached: manifest.bottomNavAuthorityAttached,
        stitchedFallbackUsed: manifest.stitchedFallbackUsed,
      },
      compiledPromptVersion: pkg.inspector.compiledProviderPrompt.compiledPromptVersion,
      compiledPromptHash: pkg.inspector.compiledProviderPrompt.compiledPromptHash,
      compiledPromptCharCount: pkg.inspector.compiledProviderPrompt.compiledPromptCharCount,
      providerPromptSafeLimit: pkg.inspector.compiledProviderPrompt.safeLimit,
      compiledProviderPromptPreview: pkg.prompt.slice(0, 1200),
      providerReferenceInputs: referenceInputs,
      providerImageRoleSummary: providerReferences.imageRoleSummary,
    });
    const concept: PageGpt2MobileConcept = {
      conceptId,
      slot: input.slot,
      artifactId,
      imageUri: persisted.publicUrl,
      status: 'READY',
      createdAt: now,
      territoryLabel: displayTitle,
      gpt2MobileDebug: debug,
    };
    const job: PageConceptGeneratedArtifact = {
      ...runningJob,
      status: 'READY',
      providerJobId: render.providerJobId,
      model: render.model,
      artifactPath: persisted.storagePath,
      imageUri: persisted.publicUrl,
      gpt2MobileDebug: debug,
    };
    return { concept, job };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'GPT2_MOBILE_FAILED';
    logPageConceptGpt2MobileEvent('GPT2_MOBILE_PROVIDER_FAILED', {
      runId: input.runId,
      conceptSlot: input.slot,
      message,
    });
    const concept: PageGpt2MobileConcept = {
      conceptId,
      slot: input.slot,
      artifactId,
      imageUri: null,
      status: 'FAILED',
      createdAt: now,
    };
    const job: PageConceptGeneratedArtifact = {
      ...runningJob,
      status: 'FAILED',
      failureReason: message,
    };
    return { concept, job };
  }
}

export async function executePageConceptGpt2MobileConcepts(input: {
  runId: string;
  plan: PageConceptGenerationPlan;
  pipelineSetId: string;
  dryRun: boolean;
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
  creativeInjection: PageCreativeInjection;
  cgptCreativeBrief: PageConceptCgptCreativeBrief | null;
  pageArchitectureBrief?: PageConceptPageArchitectureBrief | null;
  mobileDims: { width: number; height: number };
  functionalCaptureBase64: string;
  existingJobs?: readonly PageConceptGeneratedArtifact[];
  retrySlots?: readonly PageMobileConceptSlotId[] | null;
  forceRegenerateSlots?: readonly PageMobileConceptSlotId[] | null;
  artifactIdForSlot?: (slot: PageMobileConceptSlotId) => string;
  onSlotUpdate?: (payload: { jobs: PageConceptGeneratedArtifact[]; mobileConcepts: PageGpt2MobileConcept[] }) => void;
}): Promise<Gpt2MobileConceptsResult> {
  const jobs: PageConceptGeneratedArtifact[] = [];
  const mobileConcepts: PageGpt2MobileConcept[] = [];
  const existingByArtifact = new Map(
    (input.existingJobs ?? []).map((j) => [j.artifactId, j] as const),
  );

  const tasks = PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS.map(async (slot) => {
    const defaultArtifactId = mobileConceptArtifactId(slot);
    const artifactId = input.artifactIdForSlot?.(slot) ?? defaultArtifactId;
    const forceRegenerate = input.forceRegenerateSlots?.includes(slot) === true;
    const existingJob =
      existingByArtifact.get(artifactId) ??
      (forceRegenerate ? undefined : existingByArtifact.get(defaultArtifactId));
    const result = await renderMobileConceptSlot({
      runId: input.runId,
      slot,
      dryRun: input.dryRun,
      pipelineSetId: input.pipelineSetId,
      plan: input.plan,
      injection: input.creativeInjection,
      cgptBrief: input.cgptCreativeBrief,
      pageArchitectureBrief: input.pageArchitectureBrief ?? null,
      projectContext: input.projectContext,
      pageContext: input.pageContext,
      functionContract: input.functionContract,
      mobileDims: input.mobileDims,
      functionalCaptureBase64: input.functionalCaptureBase64,
      existingJob,
      retrySlots: input.retrySlots,
      forceRegenerate,
      artifactIdOverride: artifactId !== defaultArtifactId ? artifactId : forceRegenerate ? artifactId : undefined,
    });
    return result;
  });

  const settled = await Promise.allSettled(tasks);
  for (const entry of settled) {
    if (entry.status === 'rejected') {
      continue;
    }
    mobileConcepts.push(entry.value.concept);
    jobs.push(entry.value.job);
    input.onSlotUpdate?.({ jobs: [...jobs], mobileConcepts: [...mobileConcepts] });
  }

  const partialFailure = jobs.some((j) => j.status === 'FAILED') && jobs.some((j) => j.status === 'READY');
  const allFailed = jobs.length > 0 && jobs.every((j) => j.status === 'FAILED');
  if (allFailed) {
    throw new Error('GPT2_MOBILE_CONCEPTS_FAILED');
  }

  return { jobs, mobileConcepts, partialFailure };
}

export function canonicalPipelineLineageMarker() {
  return PAGE_CONCEPT_CANONICAL_PIPELINE_ID;
}
