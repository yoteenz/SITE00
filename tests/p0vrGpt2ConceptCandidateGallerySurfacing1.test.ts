/**
 * P0.VR.GPT2-CONCEPT-CANDIDATE-GALLERY-SURFACING1
 */

import { beforeEach, describe, expect, it } from 'vitest';

import {
  listPageConceptCandidates,
  resetPageConceptCandidatesForTests,
} from '../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';
import { mergePageConceptArtifactsIntoGallery } from '../shared/site00-design-workspace-production/pageConceptPipeline/generationWorkflow.js';
import { buildPageConceptGallerySections } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryPresentation.js';
import { syncPageConceptGalleryFromGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGallerySync.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const PROJECT = 'ndxbook';
const PAGE = 'page-overview';

function baseState(): PageConceptGenerationState {
  return {
    targetType: 'PAGE',
    projectId: PROJECT,
    pageId: PAGE,
    projectContext: null,
    pageContext: null,
    functionContract: null,
    pipelineSet: null,
    generationJobs: [],
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
    lastFailure: null,
    history: [],
    activeGenerationRunId: 'run-01',
    activeGenerationRunStartedAt: null,
    activeGenerationStage: null,
    liveProgress: null,
    cgptSubsteps: null,
  };
}

function mobileConcept(slot: 'A' | 'B' | 'C', artifactId: string, status: 'READY' | 'RUNNING' | 'PENDING' = 'READY') {
  return {
    conceptId: `mc-${slot.toLowerCase()}`,
    slot: `MOBILE_CONCEPT_${slot}` as const,
    artifactId,
    imageUri: `https://cdn.test/${artifactId}.png`,
    status,
    createdAt: '2026-09-22T12:00:00.000Z',
    territoryLabel: `Territory ${slot}`,
  };
}

function gpt2Job(artifactId: string, slot: 'RENDITION_A' | 'RENDITION_B' | 'RENDITION_C', status: 'READY' | 'RUNNING') {
  return {
    artifactId,
    projectId: PROJECT,
    pageId: PAGE,
    renditionSlot: slot,
    viewport: 'MOBILE' as const,
    captureSetId: 'cap',
    projectContextVersion: '1',
    pageContextVersion: '1',
    functionContractId: 'fc',
    creativeInjectionId: 'inj',
    gpt2AuthorityConceptId: 'auth',
    renditionId: artifactId,
    provider: 'GPT2_MOBILE' as const,
    model: 'gpt2',
    providerJobId: null,
    status,
    imageUri: `https://cdn.test/${artifactId}.png`,
    artifactPath: null,
    createdAt: '2026-09-22T12:00:00.000Z',
    displayTitle: slot,
  };
}

describe('P0.VR.GPT2-CONCEPT-CANDIDATE-GALLERY-SURFACING1', () => {
  beforeEach(() => {
    resetPageConceptCandidatesForTests(PROJECT, PAGE);
  });

  it('surfaces GPT2 mobile A/B/C incrementally with shared artifact ids', () => {
    let state = {
      ...baseState(),
      pipelineSet: {
        pipelineSetId: 'ps-1',
        pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE' as const,
        mobileConcepts: [mobileConcept('A', 'art-a', 'READY')],
      },
      generationJobs: [gpt2Job('art-a', 'RENDITION_A', 'READY')],
    };

    mergePageConceptArtifactsIntoGallery(state);
    expect(listPageConceptCandidates(PROJECT, PAGE)).toHaveLength(1);
    expect(listPageConceptCandidates(PROJECT, PAGE)[0]?.artifactId).toBe('art-a');
    expect(listPageConceptCandidates(PROJECT, PAGE)[0]?.conceptId).toBe('mc-a');

    state = {
      ...state,
      pipelineSet: {
        ...state.pipelineSet!,
        mobileConcepts: [mobileConcept('A', 'art-a', 'READY'), mobileConcept('B', 'art-b', 'READY')],
      },
      generationJobs: [...state.generationJobs, gpt2Job('art-b', 'RENDITION_B', 'READY')],
    };
    mergePageConceptArtifactsIntoGallery(state);
    expect(listPageConceptCandidates(PROJECT, PAGE).filter((c) => c.runGroup !== 'HISTORY')).toHaveLength(2);

    state = {
      ...state,
      pipelineSet: {
        ...state.pipelineSet!,
        mobileConcepts: [
          mobileConcept('A', 'art-a', 'READY'),
          mobileConcept('B', 'art-b', 'READY'),
          mobileConcept('C', 'art-c', 'READY'),
        ],
      },
      generationJobs: [...state.generationJobs, gpt2Job('art-c', 'RENDITION_C', 'READY')],
    };
    mergePageConceptArtifactsIntoGallery(state);
    const current = listPageConceptCandidates(PROJECT, PAGE).filter((c) => c.runGroup !== 'HISTORY');
    expect(current).toHaveLength(3);
    expect(current.map((c) => c.conceptId).sort()).toEqual(['mc-a', 'mc-b', 'mc-c']);
  });

  it('preserves history on new run and versions partial retry for slot B', () => {
    const run1 = 'run-01';
    let state = {
      ...baseState(),
      activeGenerationRunId: run1,
      pipelineSet: {
        pipelineSetId: 'ps-1',
        pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE' as const,
        mobileConcepts: [mobileConcept('B', 'art-b-v1', 'READY')],
      },
      generationJobs: [gpt2Job('art-b-v1', 'RENDITION_B', 'READY')],
    };
    syncPageConceptGalleryFromGenerationState(state);

    state = {
      ...state,
      activeGenerationRunId: run1,
      pipelineSet: {
        ...state.pipelineSet!,
        mobileConcepts: [mobileConcept('B', 'art-b-v2', 'READY')],
      },
      generationJobs: [gpt2Job('art-b-v2', 'RENDITION_B', 'READY')],
    };
    syncPageConceptGalleryFromGenerationState(state);

    const all = listPageConceptCandidates(PROJECT, PAGE);
    expect(all.some((c) => c.artifactId === 'art-b-v1' && c.runGroup === 'HISTORY')).toBe(true);
    expect(all.some((c) => c.artifactId === 'art-b-v2' && c.runGroup === 'CURRENT')).toBe(true);

    state = {
      ...state,
      activeGenerationRunId: 'run-02',
      pipelineSet: {
        pipelineSetId: 'ps-2',
        pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE' as const,
        mobileConcepts: [mobileConcept('A', 'art-a-run2', 'READY')],
      },
      generationJobs: [gpt2Job('art-a-run2', 'RENDITION_A', 'READY')],
    };
    syncPageConceptGalleryFromGenerationState(state);

    const sections = buildPageConceptGallerySections({
      projectId: PROJECT,
      pageId: PAGE,
      viewport: 'MOBILE',
      selectedMobileConceptId: null,
    });
    expect(sections.current.some((c) => c.artifactId === 'art-a-run2')).toBe(true);
    expect(sections.history.length).toBeGreaterThan(0);
  });

  it('marks selected mobile authority in gallery cards', () => {
    const state = {
      ...baseState(),
      pipelineSet: {
        pipelineSetId: 'ps-1',
        pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE' as const,
        selectedMobileConceptId: 'mc-b',
        viewportAuthorityFamily: {
          familyId: 'fam',
          cgptBriefId: 'brief',
          cgptBriefVersion: '1',
          selectedMobileConceptId: 'mc-b',
          selectedMobileVersion: null,
          mobileArtifactId: 'art-b',
          tabletInterpretationId: null,
          tabletArtifactId: null,
          tabletVersion: null,
          desktopInterpretationId: null,
          desktopArtifactId: null,
          desktopVersion: null,
          experienceExpressionContractId: null,
          experienceExpressionVersion: null,
          skinContractVersion: '1',
          skinContractId: null,
          status: 'MOBILE_SELECTED',
          viewportFamilyApprovalId: null,
          familyLockId: null,
          createdAt: '2026-09-22T12:00:00.000Z',
          updatedAt: '2026-09-22T12:00:00.000Z',
        },
        mobileConcepts: [mobileConcept('B', 'art-b', 'READY')],
      },
      generationJobs: [gpt2Job('art-b', 'RENDITION_B', 'READY')],
    };
    syncPageConceptGalleryFromGenerationState(state);
    const sections = buildPageConceptGallerySections({
      projectId: PROJECT,
      pageId: PAGE,
      viewport: 'MOBILE',
      selectedMobileConceptId: 'mc-b',
    });
    expect(sections.current[0]?.selectedMobileAuthority).toBe(true);
    expect(listPageConceptCandidates(PROJECT, PAGE)[0]?.status).toBe('SELECTED');
  });

  it('gallery cards expose preview src for contained mobile previews', () => {
    syncPageConceptGalleryFromGenerationState({
      ...baseState(),
      pipelineSet: {
        pipelineSetId: 'ps-1',
        pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE' as const,
        mobileConcepts: [mobileConcept('A', 'art-a', 'READY')],
      },
      generationJobs: [gpt2Job('art-a', 'RENDITION_A', 'READY')],
    });
    const card = buildPageConceptGallerySections({
      projectId: PROJECT,
      pageId: PAGE,
      viewport: 'MOBILE',
    }).current[0];
    expect(card?.previewSrc).toContain('art-a');
    expect(card?.pipelineLabel).toBe('GPT2 MOBILE');
  });
});
