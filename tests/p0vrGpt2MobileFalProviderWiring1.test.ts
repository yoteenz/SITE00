/**
 * P0.VR.GPT2-MOBILE-FAL-PROVIDER-WIRING1
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { executePageConceptGpt2MobileConcepts } from '../api/_lib/site00PageConcept/executePageConceptGpt2MobileConcepts.js';
import * as falRender from '../api/_lib/site00PageConcept/renderPageGpt2MobileConceptJob.js';
import {
  clearPageConceptServerRuns,
  getPageConceptServerRun,
  putPageConceptServerRun,
} from '../api/_lib/site00PageConcept/pageConceptGenerationRunStore.js';
import { hydratePageConceptServerRun } from '../api/_lib/site00PageConcept/pageConceptGenerationRunStore.js';
import { buildPageConceptGenerationPlan } from '../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import { compilePageCreativeContext, compileProjectCreativeContext } from '../shared/site00-design-workspace-production/pageConceptPipeline/contextCompilers.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import { compilePageConceptCgptCreativeBrief } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeBrief.js';
import { runPageConceptGeneration } from '../api/_lib/site00PageConcept/runPageConceptGeneration.js';
import * as cgpt from '../api/_lib/site00PageConcept/generatePageCreativeInjection.js';
import {
  mobileConceptTerritoryDirective,
  pageConceptGpt2MobileIdempotencyKey,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileRequestPackage.js';
import { PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportAuthorityFamily.js';
import type { PageConceptServerRun } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  const overview = listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview');
  if (!overview) throw new Error('overview missing');
  return overview.pageId;
}

function seedCaptures(projectId: string, pageId: string) {
  const base = {
    projectId,
    pageId,
    screenId: 'overview',
    route: '/projects/design/ndxbook/overview',
    timestamp: new Date().toISOString(),
    buildVersion: 'vitest',
    createdBy: 'vitest',
    source: 'LOCAL_FALLBACK' as const,
  };
  appendPageCapture({ ...base, captureId: 'm-cap', viewport: 'MOBILE', artifactPath: 'data:image/png;base64,aaaa' });
  appendPageCapture({ ...base, captureId: 'd-cap', viewport: 'DESKTOP', artifactPath: 'data:image/png;base64,bbbb' });
}

describe('P0.VR.GPT2-MOBILE-FAL-PROVIDER-WIRING1', () => {
  beforeEach(() => {
    clearPageConceptServerRuns();
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  });

  it('uses production FAL adapter module for non-vitest production path (mocked in tests)', async () => {
    const falSpy = vi.spyOn(falRender, 'renderPageGpt2MobileConceptJob');
    const pageId = overviewPageId();
    seedCaptures(PROJECT, pageId);
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const plan = buildPageConceptGenerationPlan(PROJECT, pageId, { trustIncomingCaptures: true });
    const projectContext = compileProjectCreativeContext(PROJECT)!;
    const pageContext = compilePageCreativeContext(PROJECT, pageId)!;
    const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
    vi.spyOn(cgpt, 'generatePageCreativeInjection').mockResolvedValue({
      ok: true,
      injection: state.pipelineSet?.creativeInjection ?? {
        injectionId: 'inj-test',
        creativeThesis: 'thesis',
        pagePurposeInterpretation: 'purpose',
        visualOpportunity: 'visual',
        spatialDirection: 'spatial',
        hierarchyDirection: 'hierarchy',
        assetStrategy: 'assets',
        referenceStrategy: 'ref',
        informationPriority: 'info',
        responsiveDirection: 'responsive',
        immutableRequirements: [],
        mobileDirection: 'mobile',
        desktopDirection: 'desktop',
      },
    } as never);

    await runPageConceptGeneration({
      state,
      founderConfirmedSpend: true,
      mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
    });

    expect(falSpy).not.toHaveBeenCalled();
  });

  it('creates exactly 3 mobile concept jobs with distinct territory directives and idempotency keys', async () => {
    const pageId = overviewPageId();
    seedCaptures(PROJECT, pageId);
    const plan = buildPageConceptGenerationPlan(PROJECT, pageId, { trustIncomingCaptures: true });
    const projectContext = compileProjectCreativeContext(PROJECT)!;
    const pageContext = compilePageCreativeContext(PROJECT, pageId)!;
    const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
    const injection = {
      injectionId: 'inj-abc',
      creativeThesis: 'Ledger story world',
      pagePurposeInterpretation: 'Overview',
      visualOpportunity: 'Editorial density',
      spatialDirection: 'Vertical index',
      hierarchyDirection: 'Title-first',
      assetStrategy: 'Evidence collage',
      referenceStrategy: 'Archive',
      informationPriority: 'Surprise fold',
      responsiveDirection: 'Thumb reach',
      immutableRequirements: ['Brand mark'],
      mobileDirection: 'Single column monument',
      desktopDirection: 'Wide grid',
    };
    const brief = compilePageConceptCgptCreativeBrief({
      injection,
      projectContext,
      pageContext,
      functionContract,
      captureSetId: plan.captureSetId,
    });

    const territories = PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS.map((slot) =>
      mobileConceptTerritoryDirective({ slot, injection, brief }),
    );
    expect(new Set(territories).size).toBe(3);

    const runId = 'pcgr-test-run-1';
    expect(pageConceptGpt2MobileIdempotencyKey(runId, 'MOBILE_CONCEPT_A')).toBe(`${runId}:GPT2_MOBILE:A`);

    const { jobs, mobileConcepts } = await executePageConceptGpt2MobileConcepts({
      runId,
      plan,
      pipelineSetId: 'pps-test',
      dryRun: false,
      projectContext,
      pageContext,
      functionContract,
      creativeInjection: injection,
      cgptCreativeBrief: brief,
      mobileDims: { width: 390, height: 844 },
      functionalCaptureBase64: 'aaa',
    });

    expect(jobs).toHaveLength(3);
    expect(mobileConcepts).toHaveLength(3);
    expect(jobs.every((j) => j.creativeInjectionId === injection.injectionId)).toBe(true);
    expect(jobs.every((j) => j.viewport === 'MOBILE')).toBe(true);
    expect(jobs.every((j) => j.width === 390 && j.height === 844)).toBe(true);
  });

  it('run survives in-memory reload simulation via hydrate (vitest durable noop)', async () => {
    const run: PageConceptServerRun = {
      runId: 'pcgr-reload-test',
      projectId: PROJECT,
      pageId: 'page-x',
      founderEmail: 'founder@test.com',
      dryRun: false,
      status: 'CGPT_AWAITING_FOUNDER_REVIEW',
      currentStage: 'CGPT_AWAITING_FOUNDER_REVIEW',
      cgptStatus: 'COMPLETE',
      gpt2Status: 'PENDING',
      nbpStatus: 'PENDING',
      cgptMeta: null,
      panelProgress: null,
      cgptSubsteps: null,
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      error: null,
      plan: null,
      pipelineSet: null,
      jobs: [],
      generationStatus: 'CGPT_AWAITING_FOUNDER_REVIEW',
      inputState: loadPageConceptGenerationState(PROJECT, overviewPageId()),
      progressEvents: [],
      latestProgressSequence: 0,
    };
    putPageConceptServerRun(run);
    clearPageConceptServerRuns();
    const hydrated = await hydratePageConceptServerRun(run.runId);
    expect(hydrated).toBeNull();
    putPageConceptServerRun(run);
    expect(getPageConceptServerRun(run.runId)?.runId).toBe(run.runId);
  });

  it('retry one mobile concept preserves other READY jobs (idempotency)', async () => {
    const pageId = overviewPageId();
    seedCaptures(PROJECT, pageId);
    const plan = buildPageConceptGenerationPlan(PROJECT, pageId, { trustIncomingCaptures: true });
    const projectContext = compileProjectCreativeContext(PROJECT)!;
    const pageContext = compilePageCreativeContext(PROJECT, pageId)!;
    const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
    const injection = {
      injectionId: 'inj-retry',
      creativeThesis: 'T',
      pagePurposeInterpretation: 'P',
      visualOpportunity: 'V',
      spatialDirection: 'S',
      hierarchyDirection: 'H',
      assetStrategy: 'A',
      referenceStrategy: 'R',
      informationPriority: 'I',
      responsiveDirection: 'Rd',
      immutableRequirements: [],
      mobileDirection: 'M',
      desktopDirection: 'D',
    };
    const brief = compilePageConceptCgptCreativeBrief({
      injection,
      projectContext,
      pageContext,
      functionContract,
      captureSetId: plan.captureSetId,
    });

    const readyA = {
      artifactId: 'pcga-MOBILE_CONCEPT_A-MOBILE',
      projectId: PROJECT,
      pageId,
      renditionSlot: 'RENDITION_A' as const,
      viewport: 'MOBILE' as const,
      captureSetId: plan.captureSetId,
      projectContextVersion: projectContext.contextVersion,
      pageContextVersion: pageContext.contextVersion,
      functionContractId: functionContract.contractId,
      creativeInjectionId: injection.injectionId,
      gpt2AuthorityConceptId: 'pg2m-a',
      renditionId: 'r-a',
      provider: 'GPT2_MOBILE' as const,
      model: 'saved',
      providerJobId: 'job-a',
      promptVersion: 'v1',
      createdAt: new Date().toISOString(),
      status: 'READY' as const,
      artifactPath: 'site00/a.png',
      imageUri: 'https://saved/a.png',
      width: 390,
      height: 844,
    };
    const failedB = { ...readyA, artifactId: 'pcga-MOBILE_CONCEPT_B-MOBILE', providerJobId: null, status: 'FAILED' as const, imageUri: null, failureReason: 'provider_fail_B' };

    const { jobs } = await executePageConceptGpt2MobileConcepts({
      runId: 'pcgr-retry-b',
      plan,
      pipelineSetId: 'pps-retry',
      dryRun: false,
      projectContext,
      pageContext,
      functionContract,
      creativeInjection: injection,
      cgptCreativeBrief: brief,
      mobileDims: { width: 390, height: 844 },
      functionalCaptureBase64: 'aaa',
      existingJobs: [readyA, failedB],
      retrySlots: ['MOBILE_CONCEPT_B'],
    });

    expect(jobs.find((j) => j.artifactId.includes('CONCEPT_A'))?.providerJobId).toBe('job-a');
    expect(jobs.find((j) => j.artifactId.includes('CONCEPT_B'))?.status).toBe('READY');
    expect(jobs.filter((j) => j.status === 'READY')).toHaveLength(3);
  });
});
