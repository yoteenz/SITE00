/**
 * P0.VR.GPT2-VIEWPORT-FAMILY-TWIN-ORCHESTRATION1
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { runPageConceptGeneration } from '../api/_lib/site00PageConcept/runPageConceptGeneration.js';
import { runPageConceptViewportFamilyAction } from '../api/_lib/site00PageConcept/runPageConceptViewportFamilyAction.js';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { computePageConceptLiveImplementationHash } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLiveRouteHash.js';
import {
  assertComposerPreFinalTargetSurface,
  assertOpusShellTargetSurface,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptTwinLiveFirewall.js';
import { buildPageGpt2ViewportInterpretationPackage } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2ViewportInterpretationPackage.js';
import { compileProjectSkinContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import { pageConceptLockViewportFamily } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportFamilyOrchestration.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import * as nbp from '../api/_lib/site00PageConcept/renderPageNbpJob.js';
import * as gpt2Interp from '../api/_lib/site00PageConcept/executePageConceptGpt2ViewportInterpretation.js';

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
  return { s, pageId, concepts: result.pipelineSet.mobileConcepts! };
}

describe('P0.VR.GPT2-VIEWPORT-FAMILY-TWIN-ORCHESTRATION1', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  });

  it('full founder path through TwinImplementationPackage with live hash unchanged', async () => {
    const { s: initial, concepts } = await stateAfterMobileConcepts();
    const liveBefore = computePageConceptLiveImplementationHash(initial);

    const selected = concepts[1]!;
    let r = await runPageConceptViewportFamilyAction(initial, {
      type: 'selectMobileConcept',
      conceptId: selected.conceptId,
    });
    expect(r.state.pipelineSet?.viewportAuthorityFamily?.status).toBe('MOBILE_SELECTED');
    expect(r.state.pipelineSet?.selectedMobileConceptId).toBe(selected.conceptId);

    r = await runPageConceptViewportFamilyAction(r.state, { type: 'approveExperienceExpression' });
    expect(r.state.pipelineSet?.experienceExpressionContract?.approvedAt).toBeTruthy();
    expect(r.state.pipelineSet?.viewportAuthorityFamily?.status).toBe('EXPERIENCE_DEFINED');

    r = await runPageConceptViewportFamilyAction(r.state, { type: 'runTabletInterpretation', dryRun: true });
    expect(r.jobs?.[0]?.provider).toBe('GPT2_TABLET');
    expect(r.state.pipelineSet?.viewportAuthorityFamily?.tabletArtifactId).toBeTruthy();

    r = await runPageConceptViewportFamilyAction(r.state, { type: 'runDesktopInterpretation', dryRun: true });
    expect(r.jobs?.[0]?.provider).toBe('GPT2_DESKTOP');
    expect(r.state.pipelineSet?.viewportAuthorityFamily?.desktopArtifactId).toBeTruthy();

    r = await runPageConceptViewportFamilyAction(r.state, { type: 'approveViewportFamily' });
    expect(r.state.pipelineSet?.viewportAuthorityFamily?.viewportFamilyApprovalId).toBeTruthy();

    r = await runPageConceptViewportFamilyAction(r.state, { type: 'lockViewportFamily' });
    expect(r.state.pipelineSet?.viewportAuthorityFamilyLock?.lockId).toBeTruthy();

    r = await runPageConceptViewportFamilyAction(r.state, { type: 'createTwinImplementationPackage' });
    const pkg = r.state.pipelineSet?.twinImplementationPackage;
    expect(pkg?.targetSurface).toBe('TWIN');
    expect(pkg?.packageId).toBeTruthy();

    const liveAfter = computePageConceptLiveImplementationHash(r.state);
    expect(liveAfter).toBe(liveBefore);

    for (const vp of ['MOBILE', 'TABLET', 'DESKTOP'] as const) {
      r = await runPageConceptViewportFamilyAction(r.state, {
        type: 'captureTwinViewport',
        viewport: vp,
        imageUri: `data:image/png;base64,twin-${vp.toLowerCase()}`,
      });
    }
    expect(r.state.twinCaptures?.length).toBe(3);
    assertOpusShellTargetSurface('TWIN');
    assertComposerPreFinalTargetSurface('TWIN');
    expect(() => assertOpusShellTargetSurface('LIVE')).toThrow(/OPUS_SHELL_BLOCKED/);
    expect(() => assertComposerPreFinalTargetSurface('LIVE')).toThrow(/COMPOSER_IMPLEMENTATION_BLOCKED/);
  });

  it('blocks tablet before experience expression', async () => {
    const { s, concepts } = await stateAfterMobileConcepts();
    let r = await runPageConceptViewportFamilyAction(s, {
      type: 'selectMobileConcept',
      conceptId: concepts[0]!.conceptId,
    });
    await expect(
      runPageConceptViewportFamilyAction(r.state, { type: 'runTabletInterpretation', dryRun: true }),
    ).rejects.toThrow(/EXPERIENCE_EXPRESSION_REQUIRED/);
  });

  it('tablet provider receives selected mobile authority and desktop uses tablet', async () => {
    const { s, concepts } = await stateAfterMobileConcepts();
    const interpSpy = vi.spyOn(gpt2Interp, 'executePageConceptGpt2ViewportInterpretation');
    let r = await runPageConceptViewportFamilyAction(s, {
      type: 'selectMobileConcept',
      conceptId: concepts[2]!.conceptId,
    });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'approveExperienceExpression' });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'runTabletInterpretation', dryRun: true });
    expect(interpSpy.mock.calls[0]?.[0].pkg.mobileAuthorityBase64).toBeTruthy();
    expect(interpSpy.mock.calls[0]?.[0].pkg.target).toBe('TABLET');
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'runDesktopInterpretation', dryRun: true });
    expect(interpSpy.mock.calls[1]?.[0].pkg.target).toBe('DESKTOP');
    expect(r.state.pipelineSet?.viewportAuthorityFamily?.tabletInterpretationId).toBeTruthy();
    interpSpy.mockRestore();
  });

  it('lock and twin package require approval and lock respectively', async () => {
    const { s, concepts } = await stateAfterMobileConcepts();
    let r = await runPageConceptViewportFamilyAction(s, {
      type: 'selectMobileConcept',
      conceptId: concepts[0]!.conceptId,
    });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'approveExperienceExpression' });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'runTabletInterpretation', dryRun: true });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'runDesktopInterpretation', dryRun: true });
    expect(() => pageConceptLockViewportFamily(r.state)).toThrow(/FAMILY_APPROVAL_REQUIRED/);
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'approveViewportFamily' });
    await expect(
      runPageConceptViewportFamilyAction(r.state, { type: 'createTwinImplementationPackage' }),
    ).rejects.toThrow(/AUTHORITY_LOCK_REQUIRED/);
  });

  it('interpretation package encodes skin, experience, and drift rules', () => {
    const skin = compileProjectSkinContract(PROJECT);
    const pkg = buildPageGpt2ViewportInterpretationPackage({
      target: 'TABLET',
      mobileAuthorityBase64: 'aaa',
      selectedMobileConceptId: 'mc-1',
      mobileArtifactId: 'art-m',
      mobileRationale: 'rationale',
      tabletInterpretationId: null,
      tabletArtifactBase64: null,
      creativeInjection: {
        injectionId: 'inj',
        immutableRequirements: ['req-a'],
        mutableHints: [],
        createdAt: new Date().toISOString(),
      },
      cgptBrief: {
        briefId: 'brief-1',
        version: 'v1',
        directionSummary: 'dir',
        creativeTerritory: 'territory',
        visualMood: 'mood',
        layoutPhilosophy: 'layout',
        createdAt: new Date().toISOString(),
      },
      functionContract: {
        contractId: 'fn-1',
        route: '/x',
        regions: ['header', 'body'],
        interactions: ['tap'],
        version: 'v1',
      },
      skinContract: skin,
      experienceContract: {
        contractId: 'exp-1',
        projectId: PROJECT,
        pageId: 'p1',
        selectedMobileConceptId: 'mc-1',
        skinContractVersion: skin.version,
        cgptBriefId: 'brief-1',
        overlayPatterns: ['drawer'],
        version: 'v1',
        approvedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      pageContextSummary: 'ctx',
      pageContentSummary: 'content',
    });
    expect(pkg.prompt).toMatch(/TABLET/i);
    expect(pkg.prompt).toMatch(/do not/i);
    expect(pkg.lineage.mobileArtifactId).toBe('art-m');
  });

  it('desktop regeneration does not invoke NBP', async () => {
    const { s, concepts } = await stateAfterMobileConcepts();
    const nbpSpy = vi.spyOn(nbp, 'renderPageNbpJob');
    let r = await runPageConceptViewportFamilyAction(s, {
      type: 'selectMobileConcept',
      conceptId: concepts[1]!.conceptId,
    });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'approveExperienceExpression' });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'runTabletInterpretation', dryRun: true });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'runDesktopInterpretation', dryRun: true });
    await runPageConceptViewportFamilyAction(r.state, { type: 'regenerateDesktop', dryRun: true });
    expect(nbpSpy).not.toHaveBeenCalled();
  });

  it('tablet regeneration invalidates prior family approval', async () => {
    const { s, concepts } = await stateAfterMobileConcepts();
    let r = await runPageConceptViewportFamilyAction(s, {
      type: 'selectMobileConcept',
      conceptId: concepts[0]!.conceptId,
    });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'approveExperienceExpression' });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'runTabletInterpretation', dryRun: true });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'runDesktopInterpretation', dryRun: true });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'approveViewportFamily' });
    const approval = r.state.pipelineSet?.viewportAuthorityFamily?.viewportFamilyApprovalId;
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'regenerateTablet', dryRun: true });
    expect(r.state.pipelineSet?.viewportAuthorityFamily?.viewportFamilyApprovalId).not.toBe(approval);
  });
});
