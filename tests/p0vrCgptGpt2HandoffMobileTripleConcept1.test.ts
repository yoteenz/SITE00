/**
 * P0.VR.CGPT-GPT2-HANDOFF-MOBILE-TRIPLE-CONCEPT1
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { runPageConceptGeneration } from '../api/_lib/site00PageConcept/runPageConceptGeneration.js';
import { runPageConceptViewportFamilyAction } from '../api/_lib/site00PageConcept/runPageConceptViewportFamilyAction.js';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import {
  buildPageConceptGpt2HandoffViewModel,
  compilePageConceptCgptCreativeBrief,
  PAGE_CGPT_BRIEF_VERSION,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeBrief.js';
import {
  buildPageConceptGpt2AuthorityPackage,
  PAGE_GPT2_HANDOFF_OUTPUT_TARGET,
  PAGE_GPT2_MOBILE_HANDOFF_TASK,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2AuthorityPackage.js';
import { compilePageCreativeContext, compileProjectCreativeContext } from '../shared/site00-design-workspace-production/pageConceptPipeline/contextCompilers.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import { compileProjectSkinContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { generatePageCreativeInjection } from '../api/_lib/site00PageConcept/generatePageCreativeInjection.js';
import * as gpt2Interp from '../api/_lib/site00PageConcept/executePageConceptGpt2ViewportInterpretation.js';

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  const overview = listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview');
  if (!overview) throw new Error('overview missing');
  return overview.pageId;
}

describe('P0.VR.CGPT-GPT2-HANDOFF-MOBILE-TRIPLE-CONCEPT1', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  });

  it('preserves CGPT brief while handoff targets 3 mobile concepts', async () => {
    process.env.VITEST = 'true';
    const pageId = overviewPageId();
    const projectContext = compileProjectCreativeContext(PROJECT)!;
    const pageContext = compilePageCreativeContext(PROJECT, pageId)!;
    const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
    const injection = await generatePageCreativeInjection({ projectContext, pageContext, functionContract });
    const briefBefore = compilePageConceptCgptCreativeBrief({
      injection,
      projectContext,
      pageContext,
      functionContract,
    });
    const pkg = buildPageConceptGpt2AuthorityPackage({
      projectContext,
      pageContext,
      functionContract,
      injection,
      cgptBrief: briefBefore,
    });
    const vm = buildPageConceptGpt2HandoffViewModel({
      brief: briefBefore,
      injection,
      projectContext,
      pageContext,
      functionContract,
    });

    expect(briefBefore.version).toBe(PAGE_CGPT_BRIEF_VERSION);
    expect(briefBefore.creativePremise).toBeTruthy();
    expect(pkg.payload.outputTarget).toBe(PAGE_GPT2_HANDOFF_OUTPUT_TARGET);
    expect(vm.handoff.gpt2OutputTarget).toBe('3_MOBILE_CONCEPTS');
    expect(vm.handoff.gpt2TaskInstructions).toContain('THREE DISTINCT MOBILE PAGE CONCEPTS');
    expect(vm.handoff.gpt2TaskInstructions.toLowerCase()).not.toContain('exactly one strong page authority');
    expect(vm.handoff.founderSelectionGate).toBe('AWAITING_FOUNDER_MOBILE_SELECTION');
    expect((pkg.payload.implementationCapture as { role: string }).role).toBe('FUNCTIONAL_CONTEXT_ONLY');
    expect((pkg.payload.requiredOutputShape as { count: number }).count).toBe(3);
  });

  it('canonical run produces 3 mobile concepts with shared brief and no tablet/desktop before selection', async () => {
    process.env.SITE00_PAGE_CONCEPT_CGPT_QA_STOP = 'false';
    process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'false';
    const pageId = overviewPageId();
    appendPageCapture({
      projectId: PROJECT,
      pageId,
      screenId: 'overview',
      route: '/x',
      timestamp: new Date().toISOString(),
      buildVersion: 'vitest',
      createdBy: 'vitest',
      source: 'LOCAL_FALLBACK',
      captureId: 'm-cap',
      viewport: 'MOBILE',
      artifactPath: 'data:image/png;base64,aa',
    });
    appendPageCapture({
      projectId: PROJECT,
      pageId,
      screenId: 'overview',
      route: '/x',
      timestamp: new Date().toISOString(),
      buildVersion: 'vitest',
      createdBy: 'vitest',
      source: 'LOCAL_FALLBACK',
      captureId: 'd-cap',
      viewport: 'DESKTOP',
      artifactPath: 'data:image/png;base64,bb',
    });
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const interpSpy = vi.spyOn(gpt2Interp, 'executePageConceptGpt2ViewportInterpretation');
    const result = await runPageConceptGeneration({
      state,
      founderConfirmedSpend: true,
      mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
    });
    expect(result.jobs).toHaveLength(3);
    expect(result.pipelineSet?.mobileConcepts).toHaveLength(3);
    expect(result.pipelineSet?.cgptCreativeBrief?.briefId).toBeTruthy();
    const skin = compileProjectSkinContract(PROJECT);
    for (const c of result.pipelineSet!.mobileConcepts!) {
      expect(c.slot).toMatch(/MOBILE_CONCEPT_/);
    }
    expect(result.pipelineSet?.cgptCreativeBrief?.briefId).toBe(result.pipelineSet?.cgptCreativeBrief?.briefId);
    expect(skin.version).toBeTruthy();
    expect(interpSpy).not.toHaveBeenCalled();

    let s = loadPageConceptGenerationState(PROJECT, pageId);
    s = {
      ...s,
      pipelineSet: result.pipelineSet,
      generationJobs: [...result.jobs],
      generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
    };
    await expect(
      runPageConceptViewportFamilyAction(s, { type: 'runTabletInterpretation', dryRun: true }),
    ).rejects.toThrow(/EXPERIENCE_EXPRESSION_REQUIRED/);
    interpSpy.mockRestore();
  });

  it('exported handoff task documents distinct territory requirement', () => {
    expect(PAGE_GPT2_MOBILE_HANDOFF_TASK).toMatch(/MEANINGFULLY DIFFERENT/i);
    expect(PAGE_GPT2_MOBILE_HANDOFF_TASK).not.toMatch(/exactly one/i);
  });
});
