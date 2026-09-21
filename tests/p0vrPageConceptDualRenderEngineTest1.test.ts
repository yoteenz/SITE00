/**
 * P0.VR.PAGE-CONCEPT-DUAL-RENDER-ENGINE-TEST1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { executePageConceptGeneration } from '../api/_lib/site00PageConcept/executePageConceptGenerationRun.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import {
  dualRenderTestArtifactId,
  syncDualRenderLaneFromJobs,
  createInitialDualRenderTestRun,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptDualRenderTest.js';
import { buildPageGpt2DirectRenderPackage } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2DirectRenderPackage.js';
import { buildPageNbpRequestPackage } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptNbpRequestPackage.js';
import { compileProjectSkinContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const ROOT = join(import.meta.dirname, '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

function gpt2ReviewState(): PageConceptGenerationState {
  return {
    targetType: 'PAGE',
    projectId: 'ndxbook',
    pageId: 'page-overview',
    projectContext: null,
    pageContext: null,
    functionContract: null,
    pipelineSet: {
      pipelineSetId: 'pps-drt-1',
      projectId: 'ndxbook',
      pageId: 'page-overview',
      targetType: 'PAGE',
      captureSetId: 'cap-1',
      functionContractId: 'fc-1',
      creativeInjection: {
        injectionId: 'inj-drt',
        projectId: 'ndxbook',
        pageId: 'page-overview',
        projectContextVersion: 'v1',
        pageContextVersion: 'v1',
        functionContractVersion: 'fc-1',
        creativeThesis: 'Premise long enough for synthesis validation field',
        pagePurposeInterpretation: 'Purpose',
        visualOpportunity: 'Visual',
        hierarchyDirection: 'H',
        spatialDirection: 'C',
        informationPriority: 'I',
        imageDataBalance: 'B',
        responsiveDirection: 'R',
        mobileDirection: 'Mobile direction with enough characters for validation',
        desktopDirection: 'Desktop direction with enough characters for validation',
        creativeLatitude: 'Latitude',
        immutableRequirements: [],
        referenceStrategy: 'R',
        assetStrategy: 'A',
        createdAt: new Date().toISOString(),
        cgptProvider: 'test',
        cgptModel: 'test',
      },
      cgptCreativeBrief: null,
      gpt2AuthorityConcept: {
        conceptId: 'gpt2-drt',
        projectId: 'ndxbook',
        pageId: 'page-overview',
        injectionId: 'inj-drt',
        name: 'Authority',
        premise: 'P',
        hierarchyStrategy: 'H',
        compositionStrategy: 'C',
        visualLanguage: 'V',
        interactionPresentation: 'I',
        mobileIntent: 'M',
        desktopIntent: 'D',
        authorityArtifact: 'data:image/png;base64,authority-drt',
        gpt2Provider: 'test',
        gpt2Model: 'test',
        createdAt: new Date().toISOString(),
      },
      renditions: [],
      createdAt: new Date().toISOString(),
    },
    generationJobs: [],
    generationStatus: 'GPT2_AWAITING_FOUNDER_REVIEW',
    lastFailure: null,
    history: [],
    activeGenerationRunId: 'pcgr-drt',
    activeGenerationRunStartedAt: null,
    activeGenerationStage: null,
    liveProgress: null,
    cgptSubsteps: null,
    archivedRuns: [],
    activeReviewRunId: null,
    dualRenderTestRun: null,
  };
}

describe('P0.VR PAGE-CONCEPT DUAL RENDER ENGINE TEST', () => {
  it('dual render test creates exactly four lane jobs from same authority', async () => {
    process.env.SITE00_PAGE_CONCEPT_CGPT_QA_STOP = 'false';
    process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'false';
    const pageId =
      listSiteDesignPagesForProject('ndxbook').find((p) => p.pageId === 'overview')?.pageId ??
      listSiteDesignPagesForProject('ndxbook')[0]!.pageId;
    const base = loadPageConceptGenerationState('ndxbook', pageId);
    const review = gpt2ReviewState();
    const state = { ...base, pageId, pipelineSet: review.pipelineSet, generationStatus: review.generationStatus };
    const result = await executePageConceptGeneration(
      {
        founderConfirmedSpend: true,
        state,
        mobileCapture: { captureId: 'm', width: 390, height: 844, artifactBase64: 'm' },
        desktopCapture: { captureId: 'd', width: 1440, height: 900, artifactBase64: 'd' },
      },
      { dryRun: true, continueDualRenderTest: true },
    );
    const drtJobs = result.jobs.filter((j) => j.artifactId.includes('-DRT-'));
    expect(drtJobs).toHaveLength(4);
    expect(drtJobs.every((j) => j.gpt2AuthorityConceptId === 'gpt2-drt')).toBe(true);
    expect(drtJobs.filter((j) => j.provider === 'GPT2_DIRECT')).toHaveLength(2);
    expect(drtJobs.filter((j) => j.provider === 'NBP')).toHaveLength(2);
    expect(result.pipelineSet.renderMode).toBe('DUAL_RENDER_TEST');
  });

  it('lane regen preserves opposite lane artifacts', async () => {
    process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'false';
    const pageId =
      listSiteDesignPagesForProject('ndxbook').find((p) => p.pageId === 'overview')?.pageId ??
      listSiteDesignPagesForProject('ndxbook')[0]!.pageId;
    const base = loadPageConceptGenerationState('ndxbook', pageId);
    const review = gpt2ReviewState();
    const first = await executePageConceptGeneration(
      {
        founderConfirmedSpend: true,
        state: { ...base, pageId, pipelineSet: review.pipelineSet },
        mobileCapture: { captureId: 'm', width: 390, height: 844, artifactBase64: 'm' },
        desktopCapture: { captureId: 'd', width: 1440, height: 900, artifactBase64: 'd' },
      },
      { dryRun: true, continueDualRenderTest: true },
    );
    const regen = await executePageConceptGeneration(
      {
        founderConfirmedSpend: true,
        state: { ...base, pageId, pipelineSet: first.pipelineSet, generationJobs: first.jobs },
        mobileCapture: { captureId: 'm', width: 390, height: 844, artifactBase64: 'm' },
        desktopCapture: { captureId: 'd', width: 1440, height: 900, artifactBase64: 'd' },
      },
      { dryRun: true, regenerateDualRenderLane: 'NBP' },
    );
    const nbpIds = new Set([
      dualRenderTestArtifactId('NBP', 'MOBILE'),
      dualRenderTestArtifactId('NBP', 'DESKTOP'),
    ]);
    const gpt2Ready = regen.jobs.filter((j) => j.provider === 'GPT2_DIRECT' && j.status === 'READY');
    expect(gpt2Ready.length).toBe(2);
    expect(regen.jobs.filter((j) => nbpIds.has(j.artifactId) && j.status === 'READY')).toHaveLength(2);
  });

  it('both lane packages prioritize authority and skin grounding', () => {
    const pageId =
      listSiteDesignPagesForProject('ndxbook').find((p) => p.pageId === 'overview')?.pageId ??
      listSiteDesignPagesForProject('ndxbook')[0]!.pageId;
    const skin = compileProjectSkinContract('ndxbook');
    const fc = compilePageFunctionContract('ndxbook', pageId)!;
    const inj = gpt2ReviewState().pipelineSet!.creativeInjection!;
    const gpt2 = gpt2ReviewState().pipelineSet!.gpt2AuthorityConcept!;
    const gpt2Pkg = buildPageGpt2DirectRenderPackage({
      gpt2Authority: gpt2,
      creativeInjection: inj,
      functionContract: fc,
      skinContract: skin,
      viewport: 'MOBILE',
      currentImplementationBase64: null,
      pageContextSummary: 'ctx',
      authoritySourceRunId: 'run-1',
    });
    const nbpPkg = buildPageNbpRequestPackage({
      gpt2Authority: gpt2,
      creativeInjection: inj,
      functionContract: fc,
      skinContract: skin,
      renditionSlot: 'RENDITION_A',
      renditionDirective: 'test',
      viewport: 'MOBILE',
      currentImplementationBase64: null,
      pageContextSummary: 'ctx',
      authorityApprovalId: 'appr-1',
      renditionId: 'r1',
    });
    expect(gpt2Pkg.inspector.visualAuthorityPresent).toBe(true);
    expect(nbpPkg.inspector.visualAuthorityPresent).toBe(true);
    expect(gpt2Pkg.prompt).toContain('PRIORITY 1');
    expect(nbpPkg.imageInputs[0]?.role).toBe('VISUAL_AUTHORITY_GPT2');
  });

  it('syncDualRenderLaneFromJobs marks four complete outputs', () => {
    const run = createInitialDualRenderTestRun({
      testRunId: 't1',
      authorityApprovalId: 'a1',
      approvedAuthorityArtifactId: 'gpt2-drt',
      upstreamCgptRunId: 'inj',
      upstreamGpt2AuthorityRunId: 'gpt2-drt',
    });
    const jobs = (['GPT2_DIRECT', 'NBP'] as const).flatMap((lane) =>
      (['MOBILE', 'DESKTOP'] as const).map((viewport) => ({
        artifactId: dualRenderTestArtifactId(lane, viewport),
        projectId: 'ndxbook',
        pageId: 'overview',
        renditionSlot: 'RENDITION_A' as const,
        viewport,
        captureSetId: 'c',
        projectContextVersion: 'v1',
        pageContextVersion: 'v1',
        functionContractId: 'fc',
        creativeInjectionId: 'inj',
        gpt2AuthorityConceptId: 'gpt2-drt',
        renditionId: 'r',
        provider: lane === 'GPT2_DIRECT' ? ('GPT2_DIRECT' as const) : ('NBP' as const),
        model: 'test',
        providerJobId: 'p',
        promptVersion: 'v1',
        createdAt: new Date().toISOString(),
        status: 'READY' as const,
        artifactPath: null,
        imageUri: 'data:image/png;base64,x',
        width: 390,
        height: 844,
      })),
    );
    const synced = syncDualRenderLaneFromJobs(run, jobs);
    expect(synced.status).toBe('READY_FOR_REVIEW');
    expect(synced.gpt2Lane.status).toBe('READY');
    expect(synced.nbpLane.status).toBe('READY');
  });

  it('UI wires dual render gate and comparison panel', () => {
    expect(read('src/site00/components/designBench/opusDirect/PageConceptGenerationOverlay.tsx')).toContain(
      'RUN DUAL RENDER TEST',
    );
    expect(read('src/site00/components/designBench/pageConceptGenerator/PageConceptDualRenderReviewPanel.tsx')).toContain(
      'page-concept-dual-render-review',
    );
  });
});
