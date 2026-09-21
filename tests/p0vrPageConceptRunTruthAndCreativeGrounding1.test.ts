/**
 * P0.VR.PAGE-CONCEPT-RUN-TRUTH-AND-CREATIVE-GROUNDING1
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLegacyPageConceptNbpPipeline } from './helpers/pageConceptLegacyNbpTestEnv.js';

import { executePageConceptGeneration } from '../api/_lib/site00PageConcept/executePageConceptGenerationRun.js';
import { buildRuntimePageGpt2AuthorityPackage } from '../api/_lib/site00PageConcept/generatePageGpt2AuthorityConcept.js';
import { clearPageConceptServerRuns } from '../api/_lib/site00PageConcept/pageConceptGenerationRunStore.js';
import { startPageConceptGenerationRun } from '../api/_lib/site00PageConcept/startPageConceptGenerationRun.js';
import { compilePageCreativeContext, compileProjectCreativeContext } from '../shared/site00-design-workspace-production/pageConceptPipeline/contextCompilers.js';
import { derivePageConceptGenerationBlockingState } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationBlockingState.js';
import { buildPageConceptGenerationEligibility } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationEligibility.js';
import {
  pageConceptRequiresGpt2FounderReview,
  validatePageConceptGpt2GroundingBeforeNbp,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2AuthorityPackage.js';
import { derivePageConceptRunHealth } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptRunHealth.js';
import { resolvePageConceptProjectVisualIdentity } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectVisualIdentity.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  const pages = listSiteDesignPagesForProject(PROJECT);
  return pages.find((p) => p.pageId === 'overview')?.pageId ?? pages[0]!.pageId;
}

describe('P0.VR.PAGE-CONCEPT-RUN-TRUTH-AND-CREATIVE-GROUNDING1', () => {
  useLegacyPageConceptNbpPipeline();

  beforeEach(() => {
    clearPageConceptServerRuns();
    vi.restoreAllMocks();
    process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'true';
  });

  it('does not show pre-start fatal error while NBP is running', () => {
    const pageId = overviewPageId();
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const eligibility = buildPageConceptGenerationEligibility({
      projectSlug: PROJECT,
      pageId,
      screenId: 'overview',
      sessionReady: true,
      hydrationStatus: 'ready',
    });
    const running = {
      ...state,
      generationStatus: 'NBP_RUNNING' as const,
      activeGenerationStage: 'NBP_RENDITION_A_MOBILE',
    };
    const health = derivePageConceptRunHealth({
      state: running,
      generating: true,
      executionError: 'GENERATION COULD NOT START · BLOCKED_MOBILE_SNAPSHOT_MISSING',
    });
    expect(health.blockingError).toBeNull();
    expect(health.historicalEvents.length).toBeGreaterThan(0);

    const blocking = derivePageConceptGenerationBlockingState({
      eligibility,
      executionError: 'GENERATION COULD NOT START · BLOCKED_MOBILE_SNAPSHOT_MISSING',
      mode: 'progress',
      generationState: running,
      generating: true,
    });
    expect(blocking.founderNotice).toBeNull();
  });

  it('NDXBOOK visual identity is present in GPT2 runtime package', () => {
    const pageId = overviewPageId();
    const projectContext = compileProjectCreativeContext(PROJECT)!;
    const pageContext = compilePageCreativeContext(PROJECT, pageId)!;
    const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
    const injection = {
      injectionId: 'test-inj',
      projectId: PROJECT,
      pageId,
      projectContextVersion: projectContext.contextVersion,
      pageContextVersion: pageContext.contextVersion,
      functionContractVersion: functionContract.version,
      creativeThesis: 'Editorial index premise',
      pagePurposeInterpretation: 'Overview intelligence',
      visualOpportunity: 'High contrast editorial field',
      hierarchyDirection: 'Evidence-first',
      spatialDirection: 'Asymmetric grid',
      informationPriority: 'Story over chrome',
      imageDataBalance: 'Image-led',
      responsiveDirection: 'Mobile-first editorial',
      mobileDirection: 'Stacked evidence',
      desktopDirection: 'Wide editorial plate',
      creativeLatitude: 'Strong redesign allowed',
      immutableRequirements: ['Preserve navigation function'],
      referenceStrategy: 'Archival plates',
      assetStrategy: 'Photographic evidence',
      createdAt: new Date().toISOString(),
      cgptProvider: 'test',
      cgptModel: 'test',
    };
    const pkg = buildRuntimePageGpt2AuthorityPackage({
      injection,
      functionContract,
      projectContext,
      pageContext,
    });
    const identity = resolvePageConceptProjectVisualIdentity(PROJECT);
    expect(identity?.forbiddenDrift.some((r) => /beige/i.test(r))).toBe(true);
    expect(JSON.stringify(pkg.payload)).toMatch(/#D8FF3E|lime/i);
    expect(pkg.currentCapturePriority).toBe(7);
    expect((pkg.payload.implementationCapture as { role: string }).role).toBe('FUNCTIONAL_CONTEXT_ONLY');
    const validation = validatePageConceptGpt2GroundingBeforeNbp({
      projectId: PROJECT,
      package: pkg,
      concept: {
        conceptId: 'c1',
        projectId: PROJECT,
        pageId,
        injectionId: injection.injectionId,
        name: 'Authority',
        premise: 'NDX editorial',
        hierarchyStrategy: 'x',
        compositionStrategy: 'x',
        visualLanguage: 'NDX lime editorial',
        interactionPresentation: 'x',
        mobileIntent: 'x',
        desktopIntent: 'x',
        authorityArtifact: null,
        gpt2Provider: 'test',
        gpt2Model: 'test',
        createdAt: new Date().toISOString(),
      },
    });
    expect(validation.ok).toBe(true);
  });

  it('production run stops after GPT2 when founder review is required', async () => {
    process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'true';
    const pageId = overviewPageId();
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const patches: { generationStatus?: string }[] = [];

    await executePageConceptGeneration(
      {
        state,
        founderConfirmedSpend: true,
        mobileCapture: { captureId: 'm', snapshotId: 'snap-m', width: 390, height: 844 },
        desktopCapture: { captureId: 'd', snapshotId: 'snap-d', width: 1440, height: 900 },
      },
      {
        dryRun: true,
        onProgress: (patch) => {
          patches.push({ generationStatus: patch.generationStatus });
        },
      },
    );

    expect(patches.some((p) => p.generationStatus === 'GPT2_AWAITING_FOUNDER_REVIEW')).toBe(true);
    expect(patches.some((p) => p.generationStatus === 'NBP_RUNNING')).toBe(false);
  });

  it('dry-run with review disabled can reach NBP', async () => {
    process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'false';
    const pageId = overviewPageId();
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const patches: { generationStatus?: string }[] = [];

    await executePageConceptGeneration(
      {
        state,
        founderConfirmedSpend: true,
        mobileCapture: { captureId: 'm', snapshotId: 'snap-m', width: 390, height: 844 },
        desktopCapture: { captureId: 'd', snapshotId: 'snap-d', width: 1440, height: 900 },
      },
      {
        dryRun: true,
        onProgress: (patch) => {
          patches.push({ generationStatus: patch.generationStatus });
        },
      },
    );

    expect(patches.some((p) => p.generationStatus === 'NBP_RUNNING')).toBe(true);
  });

  it('pageConceptRequiresGpt2FounderReview defaults true unless env false', () => {
    delete process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW;
    expect(pageConceptRequiresGpt2FounderReview()).toBe(true);
    process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'false';
    expect(pageConceptRequiresGpt2FounderReview()).toBe(false);
  });
});
