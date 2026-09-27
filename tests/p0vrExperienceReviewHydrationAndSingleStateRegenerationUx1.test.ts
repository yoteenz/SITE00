/**
 * P0.VR.EXPERIENCE-REVIEW-HYDRATION-AND-SINGLE-STATE-REGENERATION-UX1
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as falExec from '../api/_lib/site00PageConcept/executePageConceptExperienceExpressionFal.js';
import { executePageConceptExperienceExpressionStateRegeneration } from '../api/_lib/site00PageConcept/executePageConceptExperienceExpressionGeneration.js';
import { runPageConceptViewportFamilyAction } from '../api/_lib/site00PageConcept/runPageConceptViewportFamilyAction.js';
import type { ExperienceExpressionAuthority } from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceExpressionAuthority.js';
import {
  applyExperienceReviewHydrationToState,
  experiencePackageAuthorityStale,
  inferExperienceStateIdFromArtifactId,
  reconcileExperienceVisualStatesFromJobs,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceReviewHydration.js';
import {
  buildExperienceReviewPackageStatus,
  resolveExperienceReviewPanelMode,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceReviewPresentation.js';
import { pageConceptBeginExperienceExpressionGeneration } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportFamilyOrchestration.js';
import type { PageConceptGeneratedArtifact, PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { runPageConceptGeneration } from '../api/_lib/site00PageConcept/runPageConceptGeneration.js';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';

const PROJECT = 'ndxbook';

async function stateAfterMobileConfirmedOverview() {
  delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  process.env.SITE00_PAGE_CONCEPT_CGPT_QA_STOP = 'false';
  process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'false';
  const pageId = listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview')!.pageId;
  appendPageCapture({
    projectId: PROJECT,
    pageId,
    screenId: 'overview',
    route: '/projects/ndxbook/overview',
    timestamp: new Date().toISOString(),
    buildVersion: 'vitest',
    createdBy: 'vitest',
    source: 'LOCAL_FALLBACK',
    captureId: 'cap-exp-hydration',
    viewport: 'MOBILE',
    artifactPath: 'data:image/png;base64,aaaa',
  });
  let state = loadPageConceptGenerationState(PROJECT, pageId);
  const gen = await runPageConceptGeneration({
    state,
    founderConfirmedSpend: true,
    mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
    desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
  });
  state = {
    ...state,
    pipelineSet: gen.pipelineSet,
    generationJobs: [...gen.jobs],
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
  };
  const conceptId = gen.pipelineSet!.mobileConcepts![0]!.conceptId;
  let r = await runPageConceptViewportFamilyAction(state, { type: 'selectMobileConcept', conceptId });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'confirmMobileAuthority' });
  return r.state;
}

function authorityShell(partial: Partial<ExperienceExpressionAuthority> = {}): ExperienceExpressionAuthority {
  return {
    id: 'peea-ndxbook-overview-1',
    projectId: 'ndxbook',
    pageId: 'overview-page',
    sourceMobileAuthorityId: 'art-mobile',
    sourceMobileArtifactId: 'art-mobile',
    sourceConceptId: 'concept-a',
    status: 'GENERATING',
    patterns: [],
    behaviorContract: '',
    visualStateContract: '',
    responsiveRules: [],
    visualStates: [
      {
        stateId: 'base',
        label: 'BASE PAGE',
        patternType: 'BASE_PAGE',
        previewImageUri: 'data:image/png;base64,base',
        caption: 'base',
        sourceProvider: 'INHERITED_MOBILE',
      },
      {
        stateId: 'menu',
        label: 'MENU / EXPANDED NAV',
        patternType: 'MENU',
        previewImageUri: null,
        caption: 'menu pending',
        sourceProvider: 'FAL_EXPERIENCE',
      },
      {
        stateId: 'entry-detail',
        label: 'ENTRY DETAIL / PANEL',
        patternType: 'DRAWER',
        previewImageUri: null,
        caption: 'entry pending',
        sourceProvider: 'FAL_EXPERIENCE',
      },
      {
        stateId: 'project-access',
        label: 'PROJECT ACCESS / OVERLAY',
        patternType: 'OVERLAY',
        previewImageUri: null,
        caption: 'access pending',
        sourceProvider: 'FAL_EXPERIENCE',
      },
    ],
    packagingPlan: { groupedOutputs: [{}, {}, {}], totalPlannedOutputs: 3, packagingReasoning: 'test', candidatePrompts: [] } as never,
    ...partial,
  };
}

function falJob(stateId: string, artifactSuffix: string): PageConceptGeneratedArtifact {
  const artifactId = `pcga-EXP-${stateId.toUpperCase().replace(/-/g, '-')}-peea1`;
  return {
    artifactId,
    projectId: 'ndxbook',
    pageId: 'overview-page',
    renditionSlot: 'RENDITION_A',
    viewport: 'MOBILE',
    captureSetId: 'cap',
    projectContextVersion: '1',
    pageContextVersion: '1',
    functionContractId: 'fc',
    creativeInjectionId: 'inj',
    gpt2AuthorityConceptId: 'concept-a',
    renditionId: `pex-${stateId}`,
    provider: 'FAL_EXPERIENCE',
    model: 'vitest',
    providerJobId: `job-${stateId}`,
    promptVersion: 'v2',
    createdAt: new Date().toISOString(),
    status: 'READY',
    artifactPath: null,
    imageUri: `data:image/png;base64,${artifactSuffix}`,
    width: 780,
    height: 1688,
    displayTitle: stateId,
  };
}

describe('P0.VR.EXPERIENCE-REVIEW-HYDRATION-AND-SINGLE-STATE-REGENERATION-UX1', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('infers state id from experience artifact id', () => {
    expect(inferExperienceStateIdFromArtifactId('pcga-EXP-MENU-peea1')).toBe('menu');
    expect(inferExperienceStateIdFromArtifactId('pcga-EXP-ENTRY-DETAIL-peea1')).toBe('entry-detail');
  });

  it('reconciles persisted FAL jobs into empty visual state previews', () => {
    const authority = authorityShell();
    const reconciled = reconcileExperienceVisualStatesFromJobs({
      authority,
      pageJobs: [falJob('menu', 'm'), falJob('entry-detail', 'd'), falJob('project-access', 'o')],
    });
    expect(reconciled.visualStates.filter((v) => v.previewImageUri?.trim()).length).toBe(4);
    expect(reconciled.status).toBe('READY_FOR_REVIEW');
    const status = buildExperienceReviewPackageStatus(reconciled);
    expect(status.planned).toBe(4);
    expect(status.generated).toBe(4);
    expect(status.ready).toBe(4);
    expect(status.pending).toBe(0);
  });

  it('hydrates existing package from generation jobs when authority index is empty', () => {
    const state: PageConceptGenerationState = {
      projectId: 'ndxbook',
      pageId: 'overview-page',
      generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
      generationJobs: [falJob('menu', 'm'), falJob('drawer', 'd'), falJob('overlay', 'o')],
      pipelineSet: {
        viewportAuthorityFamily: {
          selectedMobileConceptId: 'concept-a',
          confirmedMobileConceptId: 'concept-a',
          mobileAuthorityStatus: 'CONFIRMED',
          experienceExpressionStatus: 'READY_FOR_REVIEW',
          status: 'MOBILE_CONFIRMED',
          updatedAt: new Date().toISOString(),
        },
        experienceExpressionAuthority: authorityShell({ status: 'GENERATING' }),
        mobileConcepts: [{ conceptId: 'concept-a', slot: 'MOBILE_CONCEPT_A', imageUri: 'data:image/png;base64,base', artifactId: 'art-mobile' }],
        creativeInjection: { injectionId: 'inj' } as never,
        cgptCreativeBrief: { interactionCharacter: 'test' } as never,
        captureSetId: 'cap',
      } as never,
      functionContract: { route: '/projects/ndxbook', contractId: 'fc', regions: [], interactions: [], immutableBehaviors: [] },
      projectContext: { contextVersion: '1' } as never,
      pageContext: { contextVersion: '1' } as never,
    };
    const { state: hydrated, receipt } = applyExperienceReviewHydrationToState(state);
    expect(receipt.persistedOutputsFound).toBe(4);
    expect(receipt.packageStatusAfterHydration.ready).toBe(4);
    expect(receipt.rootCauseOfZeroOutputPanel).toBeNull();
    expect(hydrated.pipelineSet?.experienceExpressionAuthority?.visualStates.every((v) => v.previewImageUri?.trim() || v.stateId === 'base')).toBe(true);
  });

  it('does not show EMPTY mode while hydrating flag is set', () => {
    expect(resolveExperienceReviewPanelMode(null, { hydrating: true })).toBe('HYDRATING');
    expect(resolveExperienceReviewPanelMode(authorityShell(), { hydrating: true })).toBe('HYDRATING');
  });

  it('reports partial package counts when only menu exists', () => {
    const partial = reconcileExperienceVisualStatesFromJobs({
      authority: authorityShell(),
      pageJobs: [falJob('menu', 'm')],
    });
    const status = buildExperienceReviewPackageStatus(partial);
    expect(status.planned).toBe(4);
    expect(status.ready).toBe(2);
    expect(status.pending).toBeGreaterThan(0);
    expect(resolveExperienceReviewPanelMode(partial)).toBe('PARTIAL');
  });

  it('single-state regeneration dispatches exactly one FAL call and preserves other outputs', async () => {
    vi.spyOn(falExec, 'renderExperienceExpressionFalTarget').mockImplementation(async (input) => ({
      stateId: input.target.stateId,
      label: input.target.label,
      artifactId: `pcga-EXP-${input.target.stateId.toUpperCase()}-new`,
      imageUri: `data:image/png;base64,${input.target.stateId}-new`,
      providerJobId: 'fal-1',
      model: 'vitest',
      job: falJob(input.target.stateId, 'new'),
    }));

    const state = await stateAfterMobileConfirmedOverview();
    let r = await runPageConceptViewportFamilyAction(state, { type: 'generateExperienceExpression', dryRun: true });
    const beforeMenu = r.state.pipelineSet!.experienceExpressionAuthority!.visualStates.find((v) => v.stateId === 'menu')!;
    const beforeEntry = r.state.pipelineSet!.experienceExpressionAuthority!.visualStates.find((v) => v.stateId === 'entry-detail')!;
    vi.mocked(falExec.renderExperienceExpressionFalTarget).mockClear();

    r = await runPageConceptViewportFamilyAction(r.state, {
      type: 'regenerateExperienceExpressionState',
      stateId: 'menu',
      dryRun: true,
    });

    const afterMenu = r.state.pipelineSet!.experienceExpressionAuthority!.visualStates.find((v) => v.stateId === 'menu')!;
    const afterEntry = r.state.pipelineSet!.experienceExpressionAuthority!.visualStates.find((v) => v.stateId === 'entry-detail')!;
    expect(afterEntry.previewImageUri).toBe(beforeEntry.previewImageUri);
    expect(falExec.renderExperienceExpressionFalTarget).toHaveBeenCalledTimes(1);
    expect(falExec.renderExperienceExpressionFalTarget).toHaveBeenCalledWith(
      expect.objectContaining({ target: expect.objectContaining({ stateId: 'menu' }) }),
    );
  });

  it('versions prior menu artifact as PRESERVED on regeneration', async () => {
    vi.spyOn(falExec, 'renderExperienceExpressionFalTarget').mockImplementation(async (input) => ({
      stateId: input.target.stateId,
      label: input.target.label,
      artifactId: `pcga-EXP-${input.target.stateId.toUpperCase()}-v2`,
      imageUri: 'data:image/png;base64,v2',
      providerJobId: 'fal-2',
      model: 'vitest',
      job: falJob(input.target.stateId, 'v2'),
    }));
    const state = await stateAfterMobileConfirmedOverview();
    const begun = pageConceptBeginExperienceExpressionGeneration(state);
    const withMenu = {
      ...begun.authority,
      visualStates: begun.authority.visualStates.map((v) =>
        v.stateId === 'menu' ?
          { ...v, previewImageUri: 'data:image/png;base64,v1', generatedArtifactId: 'pcga-EXP-MENU-v1' }
        : v,
      ),
    };
    const regen = await executePageConceptExperienceExpressionStateRegeneration({
      authority: withMenu,
      stateId: 'menu',
      mobileAuthorityImageUri: begun.mobileConcept.imageUri!,
      planMeta: {
        projectId: state.projectId,
        pageId: state.pageId,
        captureSetId: state.pipelineSet!.captureSetId,
        projectContextVersion: state.projectContext!.contextVersion,
        pageContextVersion: state.pageContext!.contextVersion,
        functionContractId: state.functionContract!.contractId,
        creativeInjectionId: state.pipelineSet!.creativeInjection!.injectionId,
        selectedMobileConceptId: withMenu.sourceConceptId,
      },
      functionContract: state.functionContract!,
      dryRun: true,
    });
    const jobs = regen.authority.generationJobs ?? [];
    expect(jobs.some((j) => j.stateId === 'menu' && j.status === 'PRESERVED')).toBe(true);
    expect(jobs.some((j) => j.stateId === 'menu' && j.status === 'READY' && j.previousArtifactId === 'pcga-EXP-MENU-v1')).toBe(true);
  });

  it('generate missing outputs skips states that already have previews', async () => {
    const state = await stateAfterMobileConfirmedOverview();
    const begun = pageConceptBeginExperienceExpressionGeneration(state);
    const withMenuReady = {
      ...begun.authority,
      visualStates: begun.authority.visualStates.map((v) =>
        v.stateId === 'menu' ?
          { ...v, previewImageUri: 'data:image/png;base64,menu-ready', materializationStatus: 'READY' as const }
        : v,
      ),
    };
    const { executePageConceptExperienceExpressionGeneration } = await import(
      '../api/_lib/site00PageConcept/executePageConceptExperienceExpressionGeneration.js'
    );
    const falSpy = vi.spyOn(falExec, 'renderExperienceExpressionFalTarget');
    falSpy.mockClear();
    await executePageConceptExperienceExpressionGeneration({
      authority: withMenuReady,
      mobileAuthorityImageUri: begun.mobileConcept.imageUri!,
      planMeta: {
        projectId: state.projectId,
        pageId: state.pageId,
        captureSetId: state.pipelineSet!.captureSetId,
        projectContextVersion: state.projectContext!.contextVersion,
        pageContextVersion: state.pageContext!.contextVersion,
        functionContractId: state.functionContract!.contractId,
        creativeInjectionId: state.pipelineSet!.creativeInjection!.injectionId,
        selectedMobileConceptId: withMenuReady.sourceConceptId,
      },
      functionContract: state.functionContract!,
      cgptBrief: state.pipelineSet!.cgptCreativeBrief!,
      injection: state.pipelineSet!.creativeInjection!,
      dryRun: true,
    });
    expect(falSpy.mock.calls.length).toBe(2);
    expect(falSpy.mock.calls.every((c) => c[0].target.stateId !== 'menu')).toBe(true);
  });

  it('marks package stale when confirmed mobile authority changes', () => {
    const authority = authorityShell({ sourceConceptId: 'concept-a' });
    const family = {
      selectedMobileConceptId: 'concept-b',
      confirmedMobileConceptId: 'concept-b',
      mobileAuthorityStatus: 'CONFIRMED' as const,
      experienceExpressionStatus: 'READY_FOR_REVIEW' as const,
      status: 'MOBILE_CONFIRMED' as const,
      updatedAt: new Date().toISOString(),
    };
    expect(experiencePackageAuthorityStale(family, authority)).toBe(true);
    const { receipt } = applyExperienceReviewHydrationToState({
      projectId: 'ndxbook',
      pageId: 'overview-page',
      generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
      generationJobs: [],
      pipelineSet: {
        viewportAuthorityFamily: family,
        experienceExpressionAuthority: authority,
      } as never,
    });
    expect(receipt.packageStale).toBe(true);
    expect(receipt.phase).toBe('STALE');
  });
});
