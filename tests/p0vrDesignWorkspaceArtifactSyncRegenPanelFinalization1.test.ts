import { describe, expect, it, beforeEach, vi } from 'vitest';

import {
  listPageConceptCandidates,
  resetPageConceptCandidatesForTests,
} from '../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';
import {
  buildMobileCandidatesFromGenerationJobs,
  parseMobileConceptSlotFromArtifactId,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCandidateReconciliation.js';
import { refreshPageConceptGalleryFromPersistedState } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryHydration.js';
import { syncPageConceptGalleryFromGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGallerySync.js';
import { pageConceptStageBodyCollapsed, resolveFocusedPageConceptStageId } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorStageAccordion.js';
import { PAGE_CONCEPT_DEFAULT_STAGE_STATE } from '../shared/site00-design-workspace-production/designPageConceptGeneratorShell.js';
import { pageConceptStageStatesFromPipeline } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';
import { PAGE_CONCEPT_MOBILE_PREVIEW_MAX_HEIGHT } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptImageContainment.js';
import { savePageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { mobileConceptRegenerationArtifactId } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportAuthorityFamily.js';

const PROJECT = 'ndxbook';
const PAGE = 'ndxbook:overview';

function mobileJob(slot: 'A' | 'B' | 'C', artifactSuffix = '') {
  const slotId = `MOBILE_CONCEPT_${slot}` as const;
  const artifactId = artifactSuffix ? `pcga-${slotId}-MOBILE-${artifactSuffix}` : `pcga-${slotId}-MOBILE`;
  return {
    artifactId,
    projectId: PROJECT,
    pageId: PAGE,
    renditionSlot: slot === 'A' ? 'RENDITION_A' : slot === 'B' ? 'RENDITION_B' : 'RENDITION_C',
    viewport: 'MOBILE' as const,
    captureSetId: 'cap-1',
    projectContextVersion: 'v1',
    pageContextVersion: 'v1',
    functionContractId: 'fc-1',
    creativeInjectionId: 'inj-1',
    gpt2AuthorityConceptId: `pg2m-page-${slotId}-ps1`,
    renditionId: `pg2m-page-${slotId}-ps1`,
    provider: 'GPT2_MOBILE' as const,
    model: 'test',
    providerJobId: 'job-1',
    promptVersion: 'v1',
    createdAt: '2026-09-22T12:00:00.000Z',
    status: 'READY' as const,
    artifactPath: null,
    imageUri: `data:image/png;base64,${slot}`,
    width: 768,
    height: 1376,
    displayTitle: `CONCEPT ${slot}`,
  };
}

function baseState(jobs: ReturnType<typeof mobileJob>[]): PageConceptGenerationState {
  return {
    targetType: 'PAGE',
    projectId: PROJECT,
    pageId: PAGE,
    projectContext: null,
    pageContext: null,
    functionContract: null,
    pipelineSet: {
      pipelineSetId: 'ps-1',
      projectId: PROJECT,
      pageId: PAGE,
      targetType: 'PAGE',
      captureSetId: 'cap-1',
      functionContractId: 'fc-1',
      creativeInjection: { injectionId: 'inj-1' } as never,
      cgptCreativeBrief: { briefId: 'brief-1' } as never,
      gpt2AuthorityConcept: null,
      renditions: [],
      pipelineLineage: null,
      mobileConcepts: [],
      createdAt: '2026-09-22T11:00:00.000Z',
    },
    generationJobs: jobs,
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
    lastFailure: null,
    history: [],
    archivedRuns: [],
    activeGenerationRunId: 'run-1',
    activeReviewRunId: null,
    activeGenerationStage: null,
    activeGenerationRunStartedAt: null,
    liveProgress: null,
    cgptSubsteps: null,
  };
}

describe('P0.VR.DESIGN-WORKSPACE-ARTIFACT-SYNC-REGEN-PANEL-FINALIZATION1', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      store: {} as Record<string, string>,
      getItem(key: string) {
        return this.store[key] ?? null;
      },
      setItem(key: string, value: string) {
        this.store[key] = value;
      },
      removeItem(key: string) {
        delete this.store[key];
      },
      key(index: number) {
        return Object.keys(this.store)[index] ?? null;
      },
      get length() {
        return Object.keys(this.store).length;
      },
    });
    resetPageConceptCandidatesForTests(PROJECT, PAGE);
  });

  it('reconciles orphan READY GPT2 mobile jobs without mobileConcepts rows', () => {
    const state = baseState([mobileJob('A'), mobileJob('B'), mobileJob('C')]);
    const built = buildMobileCandidatesFromGenerationJobs(state);
    expect(built.filter((c) => c.artifactStatus === 'READY')).toHaveLength(3);
    syncPageConceptGalleryFromGenerationState(state);
    const listed = listPageConceptCandidates(PROJECT, PAGE);
    expect(listed.filter((c) => c.conceptSlot === 'MOBILE_CONCEPT_A')).toHaveLength(1);
    expect(listed.filter((c) => c.artifactRole === 'MOBILE_CANDIDATE')).toHaveLength(3);
  });

  it('loads gallery from persisted generation state without active in-memory run', () => {
    const state = baseState([mobileJob('A'), mobileJob('B'), mobileJob('C')]);
    savePageConceptGenerationState(state);
    resetPageConceptCandidatesForTests(PROJECT, PAGE);
    refreshPageConceptGalleryFromPersistedState(PROJECT, PAGE);
    expect(listPageConceptCandidates(PROJECT, PAGE).length).toBeGreaterThanOrEqual(3);
  });

  it('preserves prior mobile artifact as history when a new version job exists', () => {
    const v1 = mobileJob('B');
    const v2 = mobileJob('B', 'v-2');
    v2.createdAt = '2026-09-22T13:00:00.000Z';
    const state = baseState([mobileJob('A'), v1, v2, mobileJob('C')]);
    syncPageConceptGalleryFromGenerationState(state);
    const listed = listPageConceptCandidates(PROJECT, PAGE).filter((c) => c.conceptSlot === 'MOBILE_CONCEPT_B');
    expect(listed.some((c) => c.runGroup === 'HISTORY')).toBe(true);
    expect(listed.some((c) => c.runGroup === 'CURRENT')).toBe(true);
  });

  it('uses versioned regeneration artifact ids', () => {
    const id = mobileConceptRegenerationArtifactId('MOBILE_CONCEPT_B', '169');
    expect(parseMobileConceptSlotFromArtifactId(id)).toBe('MOBILE_CONCEPT_B');
    expect(id).toContain('-v-');
  });

  it('collapses non-focused stages on mobile accordion', () => {
    const state = baseState([mobileJob('A')]);
    const states = pageConceptStageStatesFromPipeline(state);
    const focused = resolveFocusedPageConceptStageId(states);
    expect(
      pageConceptStageBodyCollapsed({
        stageId: 'CGPT',
        stageState: states.CGPT,
        focusedStageId: focused,
        accordionEnabled: true,
      }),
    ).toBe(true);
  });

  it('bounds mobile preview height contract', () => {
    expect(PAGE_CONCEPT_MOBILE_PREVIEW_MAX_HEIGHT).toBe('clamp(220px, 34vh, 340px)');
  });

  it('defaults stage map includes GPT2 focus when mobile awaiting selection', () => {
    const state = baseState([mobileJob('A')]);
    const states = pageConceptStageStatesFromPipeline(state);
    expect(states.GPT2).toBe('COMPLETE');
    expect(resolveFocusedPageConceptStageId({ ...PAGE_CONCEPT_DEFAULT_STAGE_STATE, ...states })).toBe('GPT2');
  });
});
