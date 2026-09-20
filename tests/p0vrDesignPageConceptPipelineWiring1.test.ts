/**
 * P0.VR.DESIGN-PAGE-CONCEPT-PIPELINE-WIRING1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { compilePageCreativeContext, compileProjectCreativeContext } from '../shared/site00-design-workspace-production/pageConceptPipeline/contextCompilers.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import { buildPageConceptGenerationPlan } from '../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import { planPageNbpRenditions } from '../shared/site00-design-workspace-production/pageConceptPipeline/renditionPlanner.js';
import {
  evaluatePageConceptReadiness,
  pageConceptBlockedReason,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/readiness.js';
import {
  loadPageConceptGenerationState,
  savePageConceptGenerationState,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { PAGE_CONCEPT_TARGET_TYPE } from '../shared/site00-design-workspace-production/pageConceptPipeline/constants.js';
import * as cgpt from '../api/_lib/site00PageConcept/generatePageCreativeInjection.js';
import * as gpt2 from '../api/_lib/site00PageConcept/generatePageGpt2AuthorityConcept.js';
import * as nbp from '../api/_lib/site00PageConcept/renderPageNbpJob.js';
import { runPageConceptGeneration } from '../api/_lib/site00PageConcept/runPageConceptGeneration.js';
import { buildOpusPageContextContract } from '../shared/site00-design-workspace-production/designProjectBinding/pageContext.js';

const ROOT = join(import.meta.dirname, '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  key(index: number) {
    return [...this.store.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  const overview = listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview');
  if (!overview) throw new Error('overview missing');
  return overview.pageId;
}

function seedMobileDesktopCaptures(projectId: string, pageId: string) {
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
  appendPageCapture({
    ...base,
    captureId: 'cap-mobile-vitest',
    viewport: 'MOBILE',
    artifactPath: 'data:image/png;base64,aaaa',
  });
  appendPageCapture({
    ...base,
    captureId: 'cap-desktop-vitest',
    viewport: 'DESKTOP',
    artifactPath: 'data:image/png;base64,bbbb',
  });
}

describe('P0.VR.DESIGN-PAGE-CONCEPT-PIPELINE-WIRING1', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    vi.stubGlobal('window', { localStorage, dispatchEvent: () => undefined });
  });

  it('button has real handler wired from workspace (not empty stub)', () => {
    const workspace = read('src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts');
    expect(workspace).toContain('generatePageConcepts: () => {');
    expect(workspace).toContain('pageConceptGeneration.openGenerationConfirm');
    expect(workspace).not.toMatch(/generatePageConcepts:\s*\(\)\s*=>\s*\{\s*\/\* empty stub \*\//);
    const canonical = read('src/site00/components/designBench/opusDirect/TwinOpusDirectCanonicalView.tsx');
    expect(canonical).toContain('data-interaction-id="generate-page-concepts"');
    expect(canonical).toContain('actions.generatePageConcepts()');
  });

  it('button becomes enabled when readiness passes', () => {
    const pageId = overviewPageId();
    expect(evaluatePageConceptReadiness(PROJECT, pageId)).toBe('BLOCKED_NO_SOURCE_CAPTURE');
    seedMobileDesktopCaptures(PROJECT, pageId);
    expect(evaluatePageConceptReadiness(PROJECT, pageId)).toBe('READY_FOR_CREATIVE_INJECTION');
    const workspace = read('src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts');
    expect(workspace).toContain('galleryGenerateDisabled: !pageConceptGeneration.ready');
  });

  it('blocked button exposes exact reason copy', () => {
    const pageId = overviewPageId();
    const reason = pageConceptBlockedReason(evaluatePageConceptReadiness(PROJECT, pageId));
    expect(reason).toContain('Implementation source capture missing');
    const canonical = read('src/site00/components/designBench/opusDirect/TwinOpusDirectCanonicalView.tsx');
    expect(canonical).toContain('generate-page-concepts-blocked-reason');
    expect(canonical).toContain('galleryGenerateBlockedReason');
  });

  it('click path resolves active project and page via hook', () => {
    const hook = read('src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts');
    expect(hook).toContain('usePageConceptGeneration(projectId: string, pageId: string, screenId: string)');
    const workspace = read('src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts');
    expect(workspace).toContain('pageTarget.screenId');
    expect(workspace).toContain('useHydrateDesignPageCaptures(projectSlug, pageTarget.pageId, pageTarget.screenId)');
  });

  it('PAGE target never routes into WORKSPACE_SELF generation API', () => {
    const client = read('src/site00/services/pageConceptGenerationClient.ts');
    expect(client).toContain('/api/site00/page-concept-generation');
    expect(client).not.toContain('workspace-self-concept-generation');
    expect(client).not.toContain('WORKSPACE_SELF');
    const api = read('api/site00/page-concept-generation.ts');
    expect(api).toContain("targetType !== 'PAGE'");
  });

  it('project and page intelligence are compiled for CGPT input', () => {
    const pageId = overviewPageId();
    seedMobileDesktopCaptures(PROJECT, pageId);
    const projectContext = compileProjectCreativeContext(PROJECT);
    const pageContext = compilePageCreativeContext(PROJECT, pageId);
    expect(projectContext?.projectId).toBe(PROJECT);
    expect(pageContext?.pageId).toBe(pageId);
    expect(pageContext?.currentCaptureSummary).toContain('cap-mobile-vitest');
  });

  it('generation plan: 1 CGPT, 1 GPT2, 3 renditions, 6 NBP outputs', () => {
    const pageId = overviewPageId();
    seedMobileDesktopCaptures(PROJECT, pageId);
    const plan = buildPageConceptGenerationPlan(PROJECT, pageId);
    expect(plan.targetType).toBe(PAGE_CONCEPT_TARGET_TYPE);
    expect(plan.cgptCalls).toBe(1);
    expect(plan.gpt2Calls).toBe(1);
    expect(plan.nbpRenditions).toBe(3);
    expect(plan.nbpJobs).toBe(6);
    expect(planPageNbpRenditions()).toHaveLength(3);
  });

  it('orchestrator: CGPT×1, GPT2×1, NBP×6; renditions share gpt2AuthorityConceptId', async () => {
    const pageId = overviewPageId();
    seedMobileDesktopCaptures(PROJECT, pageId);
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const cgptSpy = vi.spyOn(cgpt, 'generatePageCreativeInjection');
    const gpt2Spy = vi.spyOn(gpt2, 'generatePageGpt2AuthorityConcept');
    const nbpSpy = vi.spyOn(nbp, 'renderPageNbpJob');

    const result = await runPageConceptGeneration({
      state,
      founderConfirmedSpend: true,
      mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
    });

    expect(cgptSpy).toHaveBeenCalledTimes(1);
    expect(gpt2Spy).toHaveBeenCalledTimes(1);
    expect(nbpSpy).toHaveBeenCalledTimes(6);
    const gpt2Id = result.pipelineSet.gpt2AuthorityConcept!.conceptId;
    expect(result.pipelineSet.renditions).toHaveLength(3);
    for (const r of result.pipelineSet.renditions) {
      expect(r.sourceGpt2ConceptId).toBe(gpt2Id);
    }
    for (const job of result.jobs) {
      expect(job.gpt2AuthorityConceptId).toBe(gpt2Id);
      expect(job.creativeInjectionId).toBe(result.pipelineSet.creativeInjection!.injectionId);
    }
  });

  it('generation requires explicit confirmation — spend guard blocks dispatch', async () => {
    const pageId = overviewPageId();
    seedMobileDesktopCaptures(PROJECT, pageId);
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    await expect(
      runPageConceptGeneration({
        state,
        founderConfirmedSpend: false,
        mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
        desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
      }),
    ).rejects.toThrow(/SPEND_GUARD/);
  });

  it('confirmation UI is mounted on DESIGN shell', () => {
    const screen = read('src/site00/components/designBench/opusDirect/TwinOpusDirectScreen.tsx');
    expect(screen).toContain('PageConceptGenerationOverlay');
    expect(screen).toContain('pageConceptGeneration.cancelGeneration');
    const overlay = read('src/site00/components/designBench/opusDirect/PageConceptGenerationOverlay.tsx');
    expect(overlay).toContain('data-testid="page-concept-generation-overlay"');
    expect(overlay).toContain('confirmReady');
    expect(overlay).toContain('PHASE 1');
    expect(overlay).toContain('CGPT Creative Injection');
    expect(overlay).toContain('GPT2 Authority Concept');
    expect(overlay).toContain('NBP Renditions');
  });

  it('client confirm path passes founderConfirmedSpend only on generate action', () => {
    const hook = read('src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts');
    expect(hook).toContain('openGenerationConfirm');
    expect(hook).toContain('cancelGeneration');
    expect(hook).toContain('founderConfirmedSpend: true');
    const client = read('src/site00/services/pageConceptGenerationClient.ts');
    expect(client).toContain("action: 'plan'");
    expect(client).toContain("action: 'generate'");
  });

  it('Mobile/Desktop founder selection remains independent in production state', () => {
    const workspace = read('src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts');
    expect(workspace).toContain('preferredMobileConceptId');
    expect(workspace).toContain('preferredDesktopConceptId');
    expect(workspace).toContain('promotedMobileConceptId');
    expect(workspace).toContain('promotedDesktopConceptId');
    const canonical = read('src/site00/components/designBench/opusDirect/TwinOpusDirectCanonicalView.tsx');
    expect(canonical).toContain('preferredMobileConceptId');
    expect(canonical).toContain('selectForDesktop');
  });

  it('Opus handoff does not activate before page authority selection', () => {
    const pageId = overviewPageId();
    const contract = buildOpusPageContextContract(PROJECT, pageId);
    expect(contract?.selectedPageConceptId).toBeNull();
    const ctx = read('shared/site00-design-workspace-production/designProjectBinding/pageContext.ts');
    expect(ctx).toContain('selectedPageConceptId');
  });

  it('production page registry is not mutated by generation workflow module', () => {
    const workflow = read('shared/site00-design-workspace-production/pageConceptPipeline/generationWorkflow.ts');
    expect(workflow).not.toContain('registerDesignBoundPage');
    expect(workflow).not.toContain('writeDesignPageTarget');
  });

  it('refresh preserves staged generation state in localStorage', () => {
    const pageId = overviewPageId();
    seedMobileDesktopCaptures(PROJECT, pageId);
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    savePageConceptGenerationState({ ...state, generationStatus: 'PLANNED' });
    const reloaded = loadPageConceptGenerationState(PROJECT, pageId);
    expect(reloaded.generationStatus).toBe('PLANNED');
    expect(reloaded.targetType).toBe('PAGE');
    expect(reloaded.functionContract?.contractId).toBe(compilePageFunctionContract(PROJECT, pageId)?.contractId);
  });

  it('gallery copy uses rendition terminology', () => {
    const content = read('src/site00/components/designBench/opusDirect/twinOpusDirectContent.ts');
    expect(content).toContain('COMPARE RENDITIONS');
  });
});
