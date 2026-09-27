/**
 * P0.VR.EXPERIENCE-EXPRESSION-FAL-GENERATION-REVIEW-AND-HANDOFF1
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as falExec from '../api/_lib/site00PageConcept/executePageConceptExperienceExpressionFal.js';
import { runPageConceptGeneration } from '../api/_lib/site00PageConcept/runPageConceptGeneration.js';
import { runPageConceptViewportFamilyAction } from '../api/_lib/site00PageConcept/runPageConceptViewportFamilyAction.js';
import { buildPageGpt2ViewportInterpretationPackage } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2ViewportInterpretationPackage.js';
import { buildGpt2ViewportFamilyHeroRailStages } from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyAuthorityRail.js';
import {
  buildExperienceExpressionFalTargetsFromPlan,
  experienceExpressionOutputCount,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptExperienceExpressionFalPlan.js';
import * as falPlan from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptExperienceExpressionFalPlan.js';
import { pageConceptBeginExperienceExpressionGeneration } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportFamilyOrchestration.js';
import { executePageConceptExperienceExpressionGeneration } from '../api/_lib/site00PageConcept/executePageConceptExperienceExpressionGeneration.js';
import { compileProjectSkinContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { pageContextForGpt2Package } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectVisualIdentity.js';
import * as nbp from '../api/_lib/site00PageConcept/renderPageNbpJob.js';

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
  appendPageCapture({ ...base, captureId: 'cap-mobile-vitest', viewport: 'MOBILE', artifactPath: 'data:image/png;base64,aaaa' });
  appendPageCapture({ ...base, captureId: 'cap-desktop-vitest', viewport: 'DESKTOP', artifactPath: 'data:image/png;base64,bbbb' });
}

async function stateAfterMobileConcepts() {
  delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  process.env.SITE00_PAGE_CONCEPT_CGPT_QA_STOP = 'false';
  process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'false';
  const pageId = overviewPageId();
  seedCaptures(PROJECT, pageId);
  const state = loadPageConceptGenerationState(PROJECT, pageId);
  const nbpSpy = vi.spyOn(nbp, 'renderPageNbpJob');
  const result = await runPageConceptGeneration({
    state,
    founderConfirmedSpend: true,
    mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
    desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
  });
  expect(result.jobs).toHaveLength(3);
  expect(nbpSpy).not.toHaveBeenCalled();
  let s = loadPageConceptGenerationState(PROJECT, pageId);
  s = {
    ...s,
    pipelineSet: result.pipelineSet,
    generationJobs: [...result.jobs],
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
  };
  return { s, pageId, concepts: result.pipelineSet!.mobileConcepts! };
}

describe('P0.VR.EXPERIENCE-EXPRESSION-FAL-GENERATION-REVIEW-AND-HANDOFF1', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  });

  it('generates all FAL experience targets in parallel on CREATE EXPERIENCE', async () => {
    let inFlight = 0;
    let maxConcurrent = 0;
    const original = falExec.renderExperienceExpressionFalTarget;
    vi.spyOn(falExec, 'renderExperienceExpressionFalTarget').mockImplementation(async (input) => {
      inFlight += 1;
      maxConcurrent = Math.max(maxConcurrent, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 15));
      inFlight -= 1;
      return original(input);
    });

    const { s, concepts } = await stateAfterMobileConcepts();
    let r = await runPageConceptViewportFamilyAction(s, {
      type: 'selectMobileConcept',
      conceptId: concepts[0]!.conceptId,
    });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'confirmMobileAuthority' });
    const begun = pageConceptBeginExperienceExpressionGeneration(r.state);
    const [baseTarget] = buildExperienceExpressionFalTargetsFromPlan(begun.authority.packagingPlan!);
    expect(baseTarget).toBeTruthy();
    const parallelTargets = ['parallel-a', 'parallel-b', 'parallel-c'].map((stateId, index) => ({
      ...baseTarget!,
      stateId,
      label: `PARALLEL STATE ${index + 1}` as typeof baseTarget.label,
    }));
    vi.spyOn(falPlan, 'buildExperienceExpressionFalTargetsFromPlan').mockReturnValue(parallelTargets);

    const rendered = await executePageConceptExperienceExpressionGeneration({
      authority: begun.authority,
      mobileAuthorityImageUri: 'data:image/png;base64,aaa',
      planMeta: {
        projectId: PROJECT,
        pageId: r.state.pageId,
        captureSetId: r.state.pipelineSet!.captureSetId,
        projectContextVersion: r.state.projectContext!.contextVersion,
        pageContextVersion: r.state.pageContext!.contextVersion,
        functionContractId: r.state.functionContract!.contractId,
        creativeInjectionId: r.state.pipelineSet!.creativeInjection!.injectionId,
        selectedMobileConceptId: concepts[0]!.conceptId,
      },
      functionContract: r.state.functionContract!,
      cgptBrief: r.state.pipelineSet!.cgptCreativeBrief!,
      injection: r.state.pipelineSet!.creativeInjection!,
      dryRun: true,
    });

    expect(rendered.jobs).toHaveLength(3);
    expect(maxConcurrent).toBeGreaterThan(1);
  });

  it('confirms mobile, generates FAL experience images, and approves for tablet handoff', async () => {
    const falSpy = vi.spyOn(falExec, 'renderExperienceExpressionFalTarget');
    const { s, concepts } = await stateAfterMobileConcepts();
    const conceptId = concepts[0]!.conceptId;

    let r = await runPageConceptViewportFamilyAction(s, { type: 'selectMobileConcept', conceptId });
    expect(r.state.pipelineSet?.viewportAuthorityFamily?.mobileAuthorityStatus).toBe('SELECTED');

    r = await runPageConceptViewportFamilyAction(r.state, { type: 'confirmMobileAuthority' });
    expect(r.state.pipelineSet?.viewportAuthorityFamily?.mobileAuthorityStatus).toBe('CONFIRMED');

    const expStageBefore = buildGpt2ViewportFamilyHeroRailStages({
      pipelineSet: r.state.pipelineSet ?? null,
      selectedMobileConceptId: conceptId,
      selectedGalleryCandidateId: conceptId,
      selectedGalleryCandidateSlotLabel: 'CONCEPT A',
      generating: false,
      generationJobs: [],
      activeViewport: 'MOBILE',
      tabletInterpretationActive: false,
      desktopInterpretationActive: false,
    }).find((x) => x.id === 'experience')!;
    expect(expStageBefore.statusLabel).toBe('NOT STARTED');
    expect(expStageBefore.actions.some((a) => a.id === 'vf-create-experience')).toBe(true);

    r = await runPageConceptViewportFamilyAction(r.state, { type: 'generateExperienceExpression', dryRun: true });
    expect(falSpy.mock.calls.length).toBeGreaterThan(0);
    expect(r.jobs?.every((j) => j.provider === 'FAL_EXPERIENCE')).toBe(true);
    expect(r.jobs?.every((j) => j.imageUri?.startsWith('data:image/'))).toBe(true);

    const authority = r.state.pipelineSet?.experienceExpressionAuthority!;
    expect(authority.status).toBe('READY_FOR_REVIEW');
    expect(authority.sourceConceptId).toBe(conceptId);
    expect(authority.provider).toBe('FAL');

    const falStates = authority.visualStates.filter((v) => v.sourceProvider === 'FAL_EXPERIENCE');
    expect(falStates.length).toBeGreaterThanOrEqual(1);
    expect(falStates.length).toBeLessThanOrEqual(4);
    expect(falStates.every((v) => v.previewImageUri?.startsWith('data:image/'))).toBe(true);
    expect(experienceExpressionOutputCount(authority.visualStates)).toBe(falStates.length + 1);

    const labels = authority.visualStates.map((v) => v.label);
    expect(labels).toContain('BASE PAGE');

    r = await runPageConceptViewportFamilyAction(r.state, { type: 'approveExperienceExpression' });
    expect(r.state.pipelineSet?.experienceExpressionAuthority?.status).toBe('APPROVED');

    const skin = compileProjectSkinContract(PROJECT);
    const family = r.state.pipelineSet!.viewportAuthorityFamily!;
    const mobile = r.state.pipelineSet!.mobileConcepts!.find((c) => c.conceptId === conceptId)!;
    const pkg = buildPageGpt2ViewportInterpretationPackage({
      target: 'TABLET',
      mobileAuthorityBase64: 'aaa',
      selectedMobileConceptId: conceptId,
      mobileArtifactId: mobile.artifactId,
      mobileRationale: 'test',
      tabletInterpretationId: null,
      tabletArtifactBase64: null,
      creativeInjection: r.state.pipelineSet!.creativeInjection!,
      cgptBrief: r.state.pipelineSet!.cgptCreativeBrief!,
      functionContract: r.state.functionContract!,
      skinContract: skin,
      experienceContract: r.state.pipelineSet!.experienceExpressionContract!,
      pageContextSummary: Object.values(pageContextForGpt2Package(r.state.pageContext!)).join(' · '),
      pageContentSummary: r.state.pipelineSet!.creativeInjection!.immutableRequirements.join(' · '),
    });
    expect(pkg.prompt).toContain('EXPERIENCE VISUAL PACKAGE');
    expect(pkg.lineage.experienceExpressionContractId).toBe(family.experienceExpressionContractId);

    const tabletRun = await runPageConceptViewportFamilyAction(r.state, { type: 'runTabletInterpretation', dryRun: true });
    expect(tabletRun.state.pipelineSet?.viewportAuthorityFamily?.tabletArtifactId).toBeTruthy();
  });

  it('does not approve when FAL images are missing', async () => {
    const { s, concepts } = await stateAfterMobileConcepts();
    let r = await runPageConceptViewportFamilyAction(s, { type: 'selectMobileConcept', conceptId: concepts[1]!.conceptId });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'confirmMobileAuthority' });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'generateExperienceExpression', dryRun: true });

    const authority = r.state.pipelineSet!.experienceExpressionAuthority!;
    const broken = {
      ...r.state,
      pipelineSet: {
        ...r.state.pipelineSet!,
        experienceExpressionAuthority: {
          ...authority,
          visualStates: authority.visualStates.map((v) =>
            v.sourceProvider === 'FAL_EXPERIENCE' ? { ...v, previewImageUri: null } : v,
          ),
        },
      },
    };
    await expect(runPageConceptViewportFamilyAction(broken, { type: 'approveExperienceExpression' })).rejects.toThrow(
      /EXPERIENCE_FAL_IMAGES_REQUIRED/,
    );
  });

  it('resolves HTTPS mobile authority URLs before FAL upload', async () => {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    );
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(png, { status: 200, headers: { 'content-type': 'image/png' } }),
    );
    const { resolvePageConceptAuthorityImageForFal } = await import(
      '../api/_lib/site00PageConcept/resolvePageConceptAuthorityImageForFal.js'
    );
    const resolved = await resolvePageConceptAuthorityImageForFal('https://cdn.example/authority.png');
    expect(resolved.bytes.length).toBeGreaterThan(8);
    expect(resolved.mime).toBe('image/png');
    fetchSpy.mockRestore();
  });

  it('marks FAILED instead of stuck GENERATING when FAL throws', async () => {
    vi.spyOn(falExec, 'renderExperienceExpressionFalTarget').mockRejectedValueOnce(new Error('FAL_DOWN'));
    const { s, concepts } = await stateAfterMobileConcepts();
    let r = await runPageConceptViewportFamilyAction(s, { type: 'selectMobileConcept', conceptId: concepts[2]!.conceptId });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'confirmMobileAuthority' });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'generateExperienceExpression', dryRun: true });
    expect(r.state.pipelineSet?.experienceExpressionAuthority?.status).toBe('FAILED');
    expect(r.state.pipelineSet?.viewportAuthorityFamily?.experienceExpressionStatus).toBe('FAILED');
  });
});
