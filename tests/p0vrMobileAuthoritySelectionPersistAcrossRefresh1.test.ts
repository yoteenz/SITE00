/**
 * Mobile authority select/confirm must survive server gallery mount + navigation refresh.
 */

import { describe, expect, it } from 'vitest';

import {
  applyPageConceptServerRunSnapshotForGalleryMount,
  mergePageConceptGenerationStateWithServerRunSnapshot,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryServerHydration.js';
import {
  preserveLocalViewportAuthorityFamilyProgressAfterServerMerge,
  rehydrateViewportAuthorityFamilyFromPipelineSignals,
  shouldPreserveLocalViewportAuthorityFamilyProgress,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportAuthorityFamilyPersistence.js';
import { isMobileAuthorityConfirmed } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportFamilyState.js';
import { buildGpt2ViewportFamilyHeroRailStages } from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyAuthorityRail.js';
import { scorePageConceptGenerationStateForGalleryDiscovery } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationStateDiscovery.js';
import { pageConceptConfirmMobileAuthority, pageConceptSelectMobileConcept } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportFamilyOrchestration.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import type { PageConceptServerRunSnapshot } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';

function baseState(): PageConceptGenerationState {
  return {
    targetType: 'PAGE',
    projectId: 'ndxbook',
    pageId: 'page-overview',
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
    generationJobs: [
      {
        artifactId: 'job-a',
        projectId: 'ndxbook',
        pageId: 'page-overview',
        renditionSlot: 'RENDITION_A',
        viewport: 'MOBILE',
        captureSetId: 'cap',
        projectContextVersion: 'pcv1',
        pageContextVersion: 'pgv1',
        functionContractId: 'fc1',
        creativeInjectionId: 'inj1',
        gpt2AuthorityConceptId: 'gpt2-1',
        renditionId: 'r1',
        provider: 'GPT2_MOBILE',
        model: 'test',
        providerJobId: 'p1',
        promptVersion: 'v1',
        createdAt: '2026-09-27T12:00:00.000Z',
        status: 'READY',
        artifactPath: null,
        imageUri: 'data:image/png;base64,aaa',
        width: 390,
        height: 844,
        displayTitle: 'Concept A',
      },
    ],
    history: [],
    pipelineSet: {
      pipelineSetId: 'ps1',
      pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
      captureSetId: 'cap',
      cgptCreativeBrief: {
        briefId: 'b1',
        version: 'v1',
        interactionCharacter: 'editorial',
        narrativeHook: 'hook',
        visualTerritory: 'territory',
        primaryActions: [],
        secondaryActions: [],
        contentModules: [],
        toneNotes: '',
      },
      creativeInjection: {
        injectionId: 'inj1',
        version: 'v1',
        interactionCharacter: 'editorial',
        visualTerritory: 'territory',
        narrativeHook: 'hook',
        primaryActions: [],
        secondaryActions: [],
        contentModules: [],
        toneNotes: '',
      },
      mobileConcepts: [
        {
          conceptId: 'concept-a',
          artifactId: 'art-a',
          slot: 'MOBILE_CONCEPT_A',
          status: 'READY',
          imageUri: 'data:image/png;base64,aaa',
          territoryLabel: 'A',
          createdAt: '2026-09-27T12:00:00.000Z',
        },
        {
          conceptId: 'concept-b',
          artifactId: 'art-b',
          slot: 'MOBILE_CONCEPT_B',
          status: 'READY',
          imageUri: 'data:image/png;base64,bbb',
          territoryLabel: 'B',
          createdAt: '2026-09-27T12:00:00.000Z',
        },
      ],
      viewportAuthorityFamily: null,
    },
    activeGenerationRunId: 'run-123',
  };
}

describe('P0 mobile authority selection persist across refresh', () => {
  it('preserves confirmed mobile authority when server run snapshot lacks founder progress', () => {
    let state = baseState();
    state = pageConceptSelectMobileConcept(state, 'concept-a').state;
    state = pageConceptConfirmMobileAuthority(state).state;
    expect(state.pipelineSet?.viewportAuthorityFamily?.mobileAuthorityStatus).toBe('CONFIRMED');

    const serverRun: PageConceptServerRunSnapshot = {
      runId: 'run-123',
      projectId: 'ndxbook',
      pageId: 'page-overview',
      status: 'COMPLETED',
      generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
      currentStage: null,
      createdAt: '2026-09-27T12:00:00.000Z',
      updatedAt: '2026-09-27T12:00:00.000Z',
      completedAt: '2026-09-27T12:00:00.000Z',
      jobs: state.generationJobs,
      pipelineSet: {
        ...state.pipelineSet!,
        viewportAuthorityFamily: null,
        selectedMobileConceptId: undefined,
        experienceExpressionAuthority: null,
        experienceExpressionContract: null,
      },
      plan: null,
      cgptMeta: null,
      panelProgress: null,
      cgptSubsteps: null,
      progressEvents: [],
      latestProgressSequence: 0,
    };

    const merged = applyPageConceptServerRunSnapshotForGalleryMount(state, serverRun);
    expect(merged.pipelineSet?.viewportAuthorityFamily?.mobileAuthorityStatus).toBe('CONFIRMED');
    expect(merged.pipelineSet?.viewportAuthorityFamily?.confirmedMobileConceptId).toBe('concept-a');
    expect(merged.pipelineSet?.selectedMobileConceptId).toBe('concept-a');
  });

  it('prefers storage bucket with confirmed authority during discovery scoring', () => {
    const bare = baseState();
    let confirmed = baseState();
    confirmed = pageConceptSelectMobileConcept(confirmed, 'concept-a').state;
    confirmed = pageConceptConfirmMobileAuthority(confirmed).state;

    expect(scorePageConceptGenerationStateForGalleryDiscovery(confirmed)).toBeGreaterThan(
      scorePageConceptGenerationStateForGalleryDiscovery(bare),
    );
  });

  it('rehydrates confirmed mobile authority from server pipelineSet after cold browser (no local family)', () => {
    let confirmed = baseState();
    confirmed = pageConceptSelectMobileConcept(confirmed, 'concept-a').state;
    confirmed = pageConceptConfirmMobileAuthority(confirmed).state;
    const family = confirmed.pipelineSet!.viewportAuthorityFamily!;
    const auth = {
      id: 'exp-auth-1',
      projectId: 'ndxbook',
      pageId: 'page-overview',
      sourceMobileAuthorityId: family.mobileArtifactId!,
      sourceMobileArtifactId: family.mobileArtifactId!,
      sourceConceptId: 'concept-a',
      status: 'READY_FOR_REVIEW' as const,
      patterns: [],
      behaviorContract: 'test',
      visualStateContract: 'test',
      responsiveRules: [],
      visualStates: [{ stateId: 'base', label: 'BASE', patternType: 'BASE_PAGE' as const, previewImageUri: 'data:x', caption: 'x' }],
      generatedAt: '2026-09-27T12:00:00.000Z',
      approvedAt: null,
    };

    const coldServerMerged: PageConceptGenerationState = {
      ...baseState(),
      activeGenerationRunId: 'run-123',
      pipelineSet: {
        ...confirmed.pipelineSet!,
        viewportAuthorityFamily: null,
        selectedMobileConceptId: 'concept-a',
        experienceExpressionAuthority: auth,
      },
    };

    const rehydrated = rehydrateViewportAuthorityFamilyFromPipelineSignals(coldServerMerged);
    expect(isMobileAuthorityConfirmed(rehydrated.pipelineSet?.viewportAuthorityFamily)).toBe(true);
    expect(rehydrated.pipelineSet?.viewportAuthorityFamily?.confirmedMobileConceptId).toBe('concept-a');

    const experienceStage = buildGpt2ViewportFamilyHeroRailStages({
      pipelineSet: rehydrated.pipelineSet ?? null,
      selectedMobileConceptId: 'concept-a',
      selectedGalleryCandidateId: 'concept-a',
      selectedGalleryCandidateSlotLabel: 'CONCEPT A',
      generating: false,
      generationJobs: rehydrated.generationJobs,
      activeViewport: 'MOBILE',
      tabletInterpretationActive: false,
      desktopInterpretationActive: false,
    }).find((s) => s.id === 'experience');
    expect(experienceStage?.actions.some((a) => a.id === 'vf-review-experience' && !a.disabled)).toBe(true);
  });

  it('rehydrates via gallery mount when server run strips viewportAuthorityFamily but keeps selectedMobileConceptId', () => {
    let confirmed = baseState();
    confirmed = pageConceptConfirmMobileAuthority(pageConceptSelectMobileConcept(confirmed, 'concept-a').state).state;

    const serverRun: PageConceptServerRunSnapshot = {
      runId: 'run-123',
      projectId: 'ndxbook',
      pageId: 'page-overview',
      status: 'COMPLETED',
      generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
      currentStage: null,
      createdAt: '2026-09-27T12:00:00.000Z',
      updatedAt: '2026-09-27T12:00:00.000Z',
      completedAt: '2026-09-27T12:00:00.000Z',
      jobs: confirmed.generationJobs,
      pipelineSet: {
        ...confirmed.pipelineSet!,
        viewportAuthorityFamily: null,
        selectedMobileConceptId: 'concept-a',
        experienceExpressionAuthority: null,
        experienceExpressionContract: null,
      },
      plan: null,
      cgptMeta: null,
      panelProgress: null,
      cgptSubsteps: null,
      progressEvents: [],
      latestProgressSequence: 0,
    };

    const emptyLocal = baseState();
    const merged = applyPageConceptServerRunSnapshotForGalleryMount(emptyLocal, serverRun);
    expect(merged.pipelineSet?.viewportAuthorityFamily?.selectedMobileConceptId).toBe('concept-a');
    expect(merged.pipelineSet?.viewportAuthorityFamily?.mobileAuthorityStatus).toBe('SELECTED');
  });

  it('preserves mobile authority when poll-style server snapshot merge runs (applyServerRunSnapshotToState path)', () => {
    let local = baseState();
    local = pageConceptConfirmMobileAuthority(pageConceptSelectMobileConcept(local, 'concept-a').state).state;

    const serverRun: PageConceptServerRunSnapshot = {
      runId: 'run-123',
      projectId: 'ndxbook',
      pageId: 'page-overview',
      status: 'COMPLETED',
      generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
      currentStage: null,
      createdAt: '2026-09-27T12:00:00.000Z',
      updatedAt: '2026-09-27T11:00:00.000Z',
      completedAt: '2026-09-27T12:00:00.000Z',
      jobs: local.generationJobs,
      pipelineSet: {
        ...local.pipelineSet!,
        viewportAuthorityFamily: null,
        selectedMobileConceptId: undefined,
      },
      plan: null,
      cgptMeta: null,
      panelProgress: null,
      cgptSubsteps: null,
      progressEvents: [],
      latestProgressSequence: 0,
    };

    const merged = mergePageConceptGenerationStateWithServerRunSnapshot(local, serverRun, {
      mobileJobMode: 'merge',
      syncRunIdentity: true,
    });
    expect(merged.pipelineSet?.viewportAuthorityFamily?.mobileAuthorityStatus).toBe('CONFIRMED');
  });

  it('detects when local founder progress should win over server merge', () => {
    let local = baseState();
    local = pageConceptConfirmMobileAuthority(pageConceptSelectMobileConcept(local, 'concept-a').state).state;
    const merged = {
      ...local,
      pipelineSet: {
        ...local.pipelineSet!,
        viewportAuthorityFamily: null,
      },
    };
    expect(shouldPreserveLocalViewportAuthorityFamilyProgress(local, merged)).toBe(true);
    expect(
      preserveLocalViewportAuthorityFamilyProgressAfterServerMerge(local, merged).pipelineSet?.viewportAuthorityFamily
        ?.mobileAuthorityStatus,
    ).toBe('CONFIRMED');
  });
});
