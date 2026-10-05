/**
 * P0.VR.CONCEPT-GALLERY-SYNC-AND-MOBILE-PANEL-COMPRESSION1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  listPageConceptCandidates,
  resetPageConceptCandidatesForTests,
} from '../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';
import {
  listPageConceptCandidatesHydrated,
  pageConceptGenerationStateHasReadyMobileArtifacts,
  refreshPageConceptGalleryFromPersistedState,
  resolvePageConceptGalleryEmptyPresentation,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryHydration.js';
import { syncPageConceptGalleryFromGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGallerySync.js';
import {
  pageConceptStageBodyCollapsed,
  resolveFocusedPageConceptStageId,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorStageAccordion.js';
import { buildCgptBriefDigest } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptFounderReviewPresentation.js';
import { PAGE_CONCEPT_MOBILE_PREVIEW_MAX_HEIGHT } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptImageContainment.js';
import { savePageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const ROOT = join(import.meta.dirname, '..');
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
    pipelineSet: {
      pipelineSetId: 'ps-1',
      pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
      mobileConcepts: [
        {
          conceptId: 'mc-a',
          slot: 'MOBILE_CONCEPT_A',
          artifactId: 'art-a',
          imageUri: 'https://cdn.test/a.png',
          status: 'READY',
          createdAt: '2026-09-22T12:00:00.000Z',
        },
      ],
    },
    generationJobs: [
      {
        artifactId: 'art-a',
        projectId: PROJECT,
        pageId: PAGE,
        renditionSlot: 'RENDITION_A',
        viewport: 'MOBILE',
        captureSetId: 'c',
        projectContextVersion: '1',
        pageContextVersion: '1',
        functionContractId: 'f',
        creativeInjectionId: 'i',
        gpt2AuthorityConceptId: 'mc-a',
        renditionId: 'art-a',
        provider: 'GPT2_MOBILE',
        model: 'gpt2',
        providerJobId: null,
        status: 'READY',
        imageUri: 'https://cdn.test/a.png',
        artifactPath: null,
        createdAt: '2026-09-22T12:00:00.000Z',
      },
    ],
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
    lastFailure: null,
    history: [],
    activeGenerationRunId: 'run-1',
    activeGenerationRunStartedAt: null,
    activeGenerationStage: null,
    liveProgress: null,
    cgptSubsteps: null,
  };
}

describe('P0.VR.CONCEPT-GALLERY-SYNC-AND-MOBILE-PANEL-COMPRESSION1', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    resetPageConceptCandidatesForTests(PROJECT, PAGE);
    storage.clear();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
    });
  });

  it('hydrates gallery from persisted generation state without pre-filled memory store', () => {
    expect(listPageConceptCandidates(PROJECT, PAGE)).toHaveLength(0);
    savePageConceptGenerationState(baseState());
    refreshPageConceptGalleryFromPersistedState(PROJECT, PAGE);
    const hydrated = listPageConceptCandidatesHydrated(PROJECT, PAGE);
    expect(hydrated.length).toBeGreaterThan(0);
    expect(hydrated[0]?.artifactId).toBe('art-a');
    expect(hydrated[0]?.conceptId).toBe('mc-a');
  });

  it('does not show empty gallery when artifacts exist in generation state', () => {
    savePageConceptGenerationState(baseState());
    const empty = resolvePageConceptGalleryEmptyPresentation(PROJECT, PAGE, 'MOBILE');
    expect(empty.message).toBeNull();
  });

  it('shows load failure only when artifacts exist in state but gallery sync yields none', async () => {
    const state = baseState();
    savePageConceptGenerationState(state);
    const syncMod = await import('../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGallerySync.js');
    const spy = vi.spyOn(syncMod, 'syncPageConceptGalleryFromGenerationState').mockImplementation(() => {});
    resetPageConceptCandidatesForTests(PROJECT, PAGE);
    expect(pageConceptGenerationStateHasReadyMobileArtifacts(state)).toBe(true);
    const empty = resolvePageConceptGalleryEmptyPresentation(PROJECT, PAGE, 'MOBILE');
    expect(empty.message).toBe('CONCEPTS COULD NOT BE LOADED');
    spy.mockRestore();
  });

  it('syncs jobs-only when mobileConcepts array is empty', () => {
    const state = {
      ...baseState(),
      pipelineSet: {
        pipelineSetId: 'ps-1',
        pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE' as const,
        mobileConcepts: [],
      },
    };
    syncPageConceptGalleryFromGenerationState(state);
    expect(listPageConceptCandidates(PROJECT, PAGE).length).toBe(1);
  });

  it('collapses completed CGPT when GPT2 is focused', () => {
    const focused = resolveFocusedPageConceptStageId({ CGPT: 'COMPLETE', GPT2: 'ACTIVE', NBP: 'PENDING' });
    expect(focused).toBe('GPT2');
    expect(
      pageConceptStageBodyCollapsed({
        stageId: 'CGPT',
        stageState: 'COMPLETE',
        focusedStageId: focused,
        accordionEnabled: true,
      }),
    ).toBe(true);
  });

  it('CGPT digest excludes page story and clamps main panel fields', () => {
    const digest = buildCgptBriefDigest({
      creativePremise: 'Premise '.repeat(20),
      pageStory: 'Story should not appear in digest',
      compositionStrategy: 'Grid',
      colorStrategy: 'Ink',
      materialStrategy: 'Paper',
      imageryStrategy: 'Archive',
      distinctiveMove: 'Move '.repeat(10),
    } as never);
    expect(digest.map((d) => d.id)).toEqual(['premise', 'visual-territory', 'distinctive-move']);
  });

  it('uses bounded mobile preview height constant', () => {
    expect(PAGE_CONCEPT_MOBILE_PREVIEW_MAX_HEIGHT).toContain('clamp(220px, 34vh, 340px)');
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-page-concept-generator.css'), 'utf8');
    expect(css).toContain('clamp(220px, 34vh, 340px)');
    expect(css).toContain('s00-pcg__mobileReviewActions--compact');
    expect(css).toContain('-webkit-line-clamp: 2');
  });
});
