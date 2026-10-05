/**
 * Restore mobile gallery from archive + normalize stale CGPT after server merge.
 */

import { describe, expect, it } from 'vitest';

import { mergePageConceptGenerationStateWithServerRunSnapshot } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryServerHydration.js';
import {
  collectPageConceptRestoreRunIdCandidates,
  restorePageConceptMobileGalleryFromArchivedRuns,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptMobileGalleryRestore.js';
import { shouldReplaceLocalPageConceptStateWithServerRun } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryServerHydration.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import type { PageConceptServerRunSnapshot } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';

function archivedMobileState(): PageConceptGenerationState {
  const pipelineSet = {
    pipelineSetId: 'ps-archived',
    pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE' as const,
    captureSetId: 'cap',
    creativeInjection: {
      injectionId: 'inj1',
      projectId: 'ndxbook',
      pageId: 'page-overview',
      projectContextVersion: '1',
      pageContextVersion: '1',
      functionContractVersion: '1',
      creativeThesis: 't',
      pagePurposeInterpretation: 'overview',
      visualOpportunity: 'v',
      hierarchyDirection: 'h',
      spatialDirection: 's',
      informationPriority: 'i',
      imageDataBalance: 'b',
      responsiveDirection: 'r',
      mobileDirection: 'm',
      desktopDirection: 'd',
      creativeLatitude: 'l',
      immutableRequirements: [],
      referenceStrategy: 'ref',
      assetStrategy: 'assets',
      createdAt: '2026-09-27T12:00:00.000Z',
      cgptProvider: 'anthropic',
      cgptModel: 'claude',
    },
    mobileConcepts: [
      {
        conceptId: 'concept-b',
        slot: 'MOBILE_CONCEPT_B' as const,
        artifactId: 'pcga-MOBILE_CONCEPT_B',
        imageUri: 'data:image/png;base64,bbb',
        status: 'READY' as const,
        createdAt: '2026-09-27T12:00:00.000Z',
      },
    ],
  };
  const generationJobs = [
    {
      artifactId: 'pcga-MOBILE_CONCEPT_B',
      projectId: 'ndxbook',
      pageId: 'page-overview',
      renditionSlot: 'RENDITION_B' as const,
      viewport: 'MOBILE' as const,
      captureSetId: 'cap',
      projectContextVersion: '1',
      pageContextVersion: '1',
      functionContractId: 'fc',
      creativeInjectionId: 'inj',
      gpt2AuthorityConceptId: 'concept-b',
      renditionId: 'r2',
      provider: 'GPT2_MOBILE' as const,
      model: 'm',
      providerJobId: 'p2',
      promptVersion: 'v1',
      createdAt: '2026-09-27T12:00:00.000Z',
      status: 'READY' as const,
      artifactPath: null,
      imageUri: 'data:image/png;base64,bbb',
      width: 390,
      height: 844,
    },
  ];
  return {
    targetType: 'PAGE',
    projectId: 'ndxbook',
    pageId: 'page-overview',
    generationStatus: 'PLANNED',
    generationJobs: [],
    pipelineSet: null,
    history: [],
    archivedRuns: [
      {
        archiveId: 'pcar-ps-archived',
        runId: 'run-good',
        pipelineSetId: 'ps-archived',
        archivedAt: '2026-09-27T13:00:00.000Z',
        label: 'RUN 01',
        reason: 'new_generation',
        generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
        pipelineSet,
        generationJobs,
      },
    ],
  };
}

describe('P0 page concept mobile gallery restore', () => {
  it('restores READY mobile concepts from archivedRuns after branch reset', () => {
    const restored = restorePageConceptMobileGalleryFromArchivedRuns(archivedMobileState());
    expect(restored).not.toBeNull();
    expect(restored!.generationStatus).toBe('GPT2_MOBILE_AWAITING_SELECTION');
    expect(restored!.pipelineSet?.mobileConcepts?.some((c) => c.conceptId === 'concept-b')).toBe(true);
    expect(restored!.generationJobs.some((j) => j.provider === 'GPT2_MOBILE' && j.status === 'READY')).toBe(true);
  });

  it('collects archived and active run ids for restore retry', () => {
    const state = archivedMobileState();
    state.archivedRuns = archivedMobileState().archivedRuns;
    const ids = collectPageConceptRestoreRunIdCandidates({
      ...state,
      activeGenerationRunId: 'run-active',
    });
    expect(ids).toContain('run-active');
    expect(ids).toContain('run-good');
  });

  it('forceGalleryRestore applies server run when local gallery is empty', () => {
    const local: PageConceptGenerationState = {
      targetType: 'PAGE',
      projectId: 'ndxbook',
      pageId: 'page-overview',
      generationStatus: 'PLANNED',
      generationJobs: [],
      pipelineSet: null,
      history: [],
    };
    const run = {
      runId: 'run-good',
      projectId: 'ndxbook',
      pageId: 'ndxbook:overview',
      status: 'COMPLETED' as const,
      generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION' as const,
      currentStage: null,
      createdAt: '2026-09-27T12:00:00.000Z',
      updatedAt: '2026-09-27T12:00:00.000Z',
      completedAt: '2026-09-27T12:00:00.000Z',
      jobs: archivedMobileState().archivedRuns![0]!.generationJobs,
      pipelineSet: archivedMobileState().archivedRuns![0]!.pipelineSet,
      plan: null,
      cgptMeta: null,
      panelProgress: null,
      cgptSubsteps: null,
      latestProgressSequence: 0,
      progressEventsAfterSequence: [],
    };
    expect(
      shouldReplaceLocalPageConceptStateWithServerRun(local, run, {
        preferServerGallery: true,
        forceGalleryRestore: true,
      }),
    ).toBe(true);
  });

  it('server gallery merge clears stale CGPT_RUNNING when mobile artifacts exist', () => {
    const local: PageConceptGenerationState = {
      targetType: 'PAGE',
      projectId: 'ndxbook',
      pageId: 'page-overview',
      generationStatus: 'CGPT_RUNNING',
      activeGenerationStage: 'PAGE_INTELLIGENCE',
      generationJobs: [],
      pipelineSet: null,
      history: [],
    };
    const run: PageConceptServerRunSnapshot = {
      runId: 'run-good',
      projectId: 'ndxbook',
      pageId: 'page-overview',
      status: 'COMPLETED',
      generationStatus: 'CGPT_RUNNING',
      currentStage: 'PAGE_INTELLIGENCE',
      createdAt: '2026-09-27T12:00:00.000Z',
      updatedAt: '2026-09-27T12:00:00.000Z',
      completedAt: '2026-09-27T12:00:00.000Z',
      jobs: archivedMobileState().archivedRuns![0]!.generationJobs,
      pipelineSet: archivedMobileState().archivedRuns![0]!.pipelineSet,
      plan: null,
      cgptMeta: null,
      panelProgress: null,
      cgptSubsteps: null,
      latestProgressSequence: 0,
      progressEventsAfterSequence: [],
    };
    const merged = mergePageConceptGenerationStateWithServerRunSnapshot(local, run, {
      mobileJobMode: 'replace',
      syncRunIdentity: true,
      hasFounderRunSession: false,
    });
    expect(merged.generationStatus).toBe('GPT2_MOBILE_AWAITING_SELECTION');
    expect(merged.activeGenerationStage).toBeNull();
  });
});
