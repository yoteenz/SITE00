/**
 * Duplicate localStorage pageId buckets must not overwrite current generation gallery hydration.
 */

import { describe, expect, it, beforeEach, vi } from 'vitest';

import { resetPageConceptCandidatesForTests } from '../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';
import {
  consolidatePageConceptGenerationStateStorage,
  enumeratePageConceptGenerationStoragePageIds,
  loadPageConceptGenerationStateForDesignPage,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationStateDiscovery.js';
import { PAGE_CONCEPT_GENERATION_STORAGE_PREFIX, savePageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { pageConceptActiveServerRunStorageKey } from '../src/site00/services/pageConceptGenerationRunClient.js';

const PROJECT = 'ndxbook';
const REGISTRY_PAGE = 'ndxbook:overview';
const CANONICAL_ALIAS_PAGE = 'ndxbook:/projects/ndxbook';

function gpt2State(pageId: string, runId: string, createdAt: string, artifactPrefix: string): PageConceptGenerationState {
  return {
    targetType: 'PAGE',
    projectId: PROJECT,
    pageId,
    activeGenerationRunId: runId,
    activeReviewRunId: runId,
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
    pipelineSet: {
      pipelineSetId: `ps-${runId}`,
      pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
      mobileConcepts: [
        {
          conceptId: `${artifactPrefix}-mc-a`,
          slot: 'MOBILE_CONCEPT_A',
          artifactId: `${artifactPrefix}-art-a`,
          status: 'READY',
          createdAt,
        },
        {
          conceptId: `${artifactPrefix}-mc-b`,
          slot: 'MOBILE_CONCEPT_B',
          artifactId: `${artifactPrefix}-art-b`,
          status: 'READY',
          createdAt,
        },
        {
          conceptId: `${artifactPrefix}-mc-c`,
          slot: 'MOBILE_CONCEPT_C',
          artifactId: `${artifactPrefix}-art-c`,
          status: 'READY',
          createdAt,
        },
      ],
    } as PageConceptGenerationState['pipelineSet'],
    generationJobs: ['a', 'b', 'c'].map((suffix, i) => ({
      artifactId: `${artifactPrefix}-art-${suffix}`,
      provider: 'GPT2_MOBILE',
      status: 'READY',
      viewport: 'MOBILE',
      createdAt: new Date(Date.parse(createdAt) + i * 1000).toISOString(),
    })) as PageConceptGenerationState['generationJobs'],
  } as PageConceptGenerationState;
}

describe('page concept gallery storage consolidation', () => {
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
    resetPageConceptCandidatesForTests(PROJECT, REGISTRY_PAGE);
  });

  it('prefers active server run id over stale duplicate bucket with higher job volume', () => {
    const staleRun = 'pcgr-stale-many-jobs';
    const freshRun = 'pcgr-fresh-current';

    const stale = gpt2State(REGISTRY_PAGE, staleRun, '2026-09-20T12:00:00.000Z', 'stale');
    stale.generationJobs = [
      ...stale.generationJobs,
      ...stale.generationJobs.map((j, i) => ({ ...j, artifactId: `${j.artifactId}-dup-${i}` })),
    ];
    savePageConceptGenerationState(stale);
    savePageConceptGenerationState(
      gpt2State(CANONICAL_ALIAS_PAGE, freshRun, '2026-09-26T12:00:00.000Z', 'fresh'),
    );
    localStorage.setItem(pageConceptActiveServerRunStorageKey(PROJECT, REGISTRY_PAGE), freshRun);

    const loaded = loadPageConceptGenerationStateForDesignPage({
      projectSlug: PROJECT,
      pageId: REGISTRY_PAGE,
      screenId: 'overview',
    });

    expect(loaded.activeGenerationRunId).toBe(freshRun);
    expect(loaded.pipelineSet?.mobileConcepts?.[0]?.artifactId).toBe('fresh-art-a');
    expect(enumeratePageConceptGenerationStoragePageIds(PROJECT).includes(CANONICAL_ALIAS_PAGE)).toBe(false);
  });

  it('consolidate removes equivalent duplicate keys', () => {
    savePageConceptGenerationState(gpt2State(CANONICAL_ALIAS_PAGE, 'pcgr-x', '2026-09-26T12:00:00.000Z', 'x'));
    consolidatePageConceptGenerationStateStorage(
      { projectSlug: PROJECT, pageId: REGISTRY_PAGE, screenId: 'overview' },
      gpt2State(REGISTRY_PAGE, 'pcgr-x', '2026-09-26T12:00:00.000Z', 'x'),
    );
    expect(localStorage.getItem(`${PAGE_CONCEPT_GENERATION_STORAGE_PREFIX}${PROJECT}:${CANONICAL_ALIAS_PAGE}`)).toBeNull();
    expect(localStorage.getItem(`${PAGE_CONCEPT_GENERATION_STORAGE_PREFIX}${PROJECT}:${REGISTRY_PAGE}`)).toBeTruthy();
  });
});
