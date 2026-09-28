/**
 * P0.VR.MOBILE-AUTHORITY-CONFIRM-AND-EXPERIENCE-EXPRESSION-STAGE-FIX1
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { runPageConceptGeneration } from '../api/_lib/site00PageConcept/runPageConceptGeneration.js';
import { runPageConceptViewportFamilyAction } from '../api/_lib/site00PageConcept/runPageConceptViewportFamilyAction.js';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { buildGpt2ViewportFamilyHeroRailStages } from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyAuthorityRail.js';
import { pageConceptStageStatesFromPipeline } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';
import {
  resolveFounderFooterCtaHint,
  resolveFounderFooterPhase,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptFounderReviewPresentation.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
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

async function selectConfirmGenerateApprove(
  state: import('../shared/site00-design-workspace-production/pageConceptPipeline/types.js').PageConceptGenerationState,
  conceptId: string,
) {
  let r = await runPageConceptViewportFamilyAction(state, { type: 'selectMobileConcept', conceptId });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'confirmMobileAuthority' });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'generateExperienceExpression' });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'approveExperienceExpression' });
  return r;
}

describe('P0.VR.MOBILE-AUTHORITY-CONFIRM-AND-EXPERIENCE-EXPRESSION-STAGE-FIX1', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  });

  it('confirming mobile sets CONFIRMED and hides confirm rail action', async () => {
    const { s, concepts } = await stateAfterMobileConcepts();
    const selected = concepts[1]!;
    let r = await runPageConceptViewportFamilyAction(s, { type: 'selectMobileConcept', conceptId: selected.conceptId });
    expect(r.state.pipelineSet?.viewportAuthorityFamily?.mobileAuthorityStatus).toBe('SELECTED');

    r = await runPageConceptViewportFamilyAction(r.state, { type: 'confirmMobileAuthority' });
    const family = r.state.pipelineSet?.viewportAuthorityFamily;
    expect(family?.mobileAuthorityStatus).toBe('CONFIRMED');
    expect(family?.confirmedMobileConceptId).toBe(selected.conceptId);
    expect(family?.mobileAuthorityConfirmedByFounder).toBe(true);

    const stages = buildGpt2ViewportFamilyHeroRailStages({
      pipelineSet: r.state.pipelineSet ?? null,
      selectedMobileConceptId: selected.conceptId,
      selectedGalleryCandidateId: selected.conceptId,
      selectedGalleryCandidateSlotLabel: 'CONCEPT B',
      generating: false,
      generationJobs: [],
      activeViewport: 'MOBILE',
      tabletInterpretationActive: false,
      desktopInterpretationActive: false,
    });
    const mobileStage = stages.find((x) => x.id === 'mobile-authority')!;
    expect(mobileStage.statusLabel).toBe('CONFIRMED');
    const confirm = mobileStage.actions.find((a) => a.id === 'vf-confirm-mobile');
    expect(confirm).toBeTruthy();
    expect(confirm?.disabled).toBe(true);
  });

  it('experience READY_FOR_REVIEW requires artifact; tablet blocked until approval', async () => {
    const { s, concepts } = await stateAfterMobileConcepts();
    let r = await runPageConceptViewportFamilyAction(s, { type: 'selectMobileConcept', conceptId: concepts[0]!.conceptId });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'confirmMobileAuthority' });

    const stagesBefore = buildGpt2ViewportFamilyHeroRailStages({
      pipelineSet: r.state.pipelineSet ?? null,
      selectedMobileConceptId: concepts[0]!.conceptId,
      selectedGalleryCandidateId: concepts[0]!.conceptId,
      selectedGalleryCandidateSlotLabel: 'CONCEPT A',
      generating: false,
      generationJobs: [],
      activeViewport: 'MOBILE',
      tabletInterpretationActive: false,
      desktopInterpretationActive: false,
    });
    const expBefore = stagesBefore.find((x) => x.id === 'experience')!;
    expect(expBefore.statusLabel).not.toBe('READY FOR REVIEW');

    await expect(
      runPageConceptViewportFamilyAction(r.state, { type: 'runTabletInterpretation', dryRun: true }),
    ).rejects.toThrow(/EXPERIENCE_EXPRESSION_APPROVAL_REQUIRED/);

    r = await runPageConceptViewportFamilyAction(r.state, { type: 'generateExperienceExpression' });
    expect(r.state.pipelineSet?.experienceExpressionAuthority?.status).toBe('READY_FOR_REVIEW');
    expect(r.state.pipelineSet?.experienceExpressionAuthority?.visualStates.length).toBeGreaterThan(0);

    const tabletAction = buildGpt2ViewportFamilyHeroRailStages({
      pipelineSet: r.state.pipelineSet ?? null,
      selectedMobileConceptId: concepts[0]!.conceptId,
      selectedGalleryCandidateId: concepts[0]!.conceptId,
      selectedGalleryCandidateSlotLabel: 'CONCEPT A',
      generating: false,
      generationJobs: [],
      activeViewport: 'TABLET',
      tabletInterpretationActive: false,
      desktopInterpretationActive: false,
    })
      .find((x) => x.id === 'viewport-interpretations')!
      .actions.find((a) => a.id === 'vf-run-tablet');
    expect(tabletAction?.disabled).toBe(true);
    expect(tabletAction?.disabledReason).toMatch(/approve experience/i);
  });

  it('experience approval unlocks tablet and desktop generation', async () => {
    const { s, concepts } = await stateAfterMobileConcepts();
    const r = await selectConfirmGenerateApprove(s, concepts[2]!.conceptId);
    const tabletAction = buildGpt2ViewportFamilyHeroRailStages({
      pipelineSet: r.state.pipelineSet ?? null,
      selectedMobileConceptId: concepts[2]!.conceptId,
      selectedGalleryCandidateId: concepts[2]!.conceptId,
      selectedGalleryCandidateSlotLabel: 'CONCEPT C',
      generating: false,
      generationJobs: [],
      activeViewport: 'TABLET',
      tabletInterpretationActive: false,
      desktopInterpretationActive: false,
    })
      .find((x) => x.id === 'viewport-interpretations')!
      .actions.find((a) => a.id === 'vf-run-tablet');
    expect(tabletAction?.disabled).toBe(false);

    const runTablet = await runPageConceptViewportFamilyAction(r.state, { type: 'runTabletInterpretation', dryRun: true });
    expect(runTablet.state.pipelineSet?.viewportAuthorityFamily?.tabletArtifactId).toBeTruthy();
  });

  it('page concept panel stages complete after mobile confirmation (no NBP running)', async () => {
    const { s, concepts } = await stateAfterMobileConcepts();
    let r = await runPageConceptViewportFamilyAction(s, { type: 'selectMobileConcept', conceptId: concepts[0]!.conceptId });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'confirmMobileAuthority' });
    const confirmedState = {
      ...r.state,
      liveProgress: null,
      activeGenerationStage: null,
    };
    const chips = pageConceptStageStatesFromPipeline(confirmedState);
    expect(chips.NBP).toBe('PENDING');
    expect(chips.GPT2).toBe('COMPLETE');
  });

  it('footer selected line binds to confirmed concept', async () => {
    const { s, concepts } = await stateAfterMobileConcepts();
    let r = await runPageConceptViewportFamilyAction(s, { type: 'selectMobileConcept', conceptId: concepts[1]!.conceptId });
    const hintSelected = resolveFounderFooterCtaHint(r.state);
    expect(hintSelected.statusLine).toContain('B');

    r = await runPageConceptViewportFamilyAction(r.state, { type: 'confirmMobileAuthority' });
    expect(resolveFounderFooterPhase(r.state)).toBe('EXPERIENCE_REVIEW');
  });

  it('changing mobile selection invalidates experience artifact', async () => {
    const { s, concepts } = await stateAfterMobileConcepts();
    let r = await selectConfirmGenerateApprove(s, concepts[0]!.conceptId);
    expect(r.state.pipelineSet?.experienceExpressionAuthority?.status).toBe('APPROVED');

    r = await runPageConceptViewportFamilyAction(r.state, { type: 'selectMobileConcept', conceptId: concepts[1]!.conceptId });
    expect(r.state.pipelineSet?.experienceExpressionAuthority).toBeNull();
    expect(r.state.pipelineSet?.viewportAuthorityFamily?.mobileAuthorityStatus).toBe('SELECTED');
  });

  it('approve experience without artifact fails', async () => {
    const { s, concepts } = await stateAfterMobileConcepts();
    let r = await runPageConceptViewportFamilyAction(s, { type: 'selectMobileConcept', conceptId: concepts[0]!.conceptId });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'confirmMobileAuthority' });
    await expect(
      runPageConceptViewportFamilyAction(r.state, { type: 'approveExperienceExpression' }),
    ).rejects.toThrow(/EXPERIENCE_ARTIFACT_REQUIRED/);
  });
});
