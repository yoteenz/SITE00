/**
 * P0.VR.DESIGN-WORKSPACE-CONCEPT-GALLERY-AND-GENERATOR-ENTRY-FIX1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  listPageConceptCandidates,
  resetPageConceptCandidatesForTests,
} from '../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';
import { buildPageConceptGallerySections } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryPresentation.js';
import {
  listPageConceptCandidatesHydrated,
  refreshPageConceptGalleryFromPersistedState,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryHydration.js';
import { resolvePageConceptGenerationConsoleLauncher } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationConsoleLauncher.js';
import {
  enumeratePageConceptGenerationStoragePageIds,
  loadPageConceptGenerationStateForDesignPage,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationStateDiscovery.js';
import { isCanonicalGpt2ViewportFamilyPipeline } from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyAuthorityRail.js';
import {
  PAGE_CONCEPT_GENERATION_STORAGE_PREFIX,
  savePageConceptGenerationState,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const ROOT = join(import.meta.dirname, '..');
const PROJECT = 'ndxbook';
const REGISTRY_PAGE = 'ndxbook:overview';
const CANONICAL_ALIAS_PAGE = 'ndxbook:/projects/ndxbook';

function gpt2State(pageId: string): PageConceptGenerationState {
  return {
    targetType: 'PAGE',
    projectId: PROJECT,
    pageId,
    projectContext: null,
    pageContext: null,
    functionContract: null,
    pipelineSet: {
      pipelineSetId: 'ps-fix1',
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
        {
          conceptId: 'mc-b',
          slot: 'MOBILE_CONCEPT_B',
          artifactId: 'art-b',
          imageUri: 'https://cdn.test/b.png',
          status: 'READY',
          createdAt: '2026-09-22T12:01:00.000Z',
        },
        {
          conceptId: 'mc-c',
          slot: 'MOBILE_CONCEPT_C',
          artifactId: 'art-c',
          imageUri: 'https://cdn.test/c.png',
          status: 'READY',
          createdAt: '2026-09-22T12:02:00.000Z',
        },
      ],
    },
    generationJobs: [
      {
        artifactId: 'art-a',
        projectId: PROJECT,
        pageId,
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
      {
        artifactId: 'art-b',
        projectId: PROJECT,
        pageId,
        renditionSlot: 'RENDITION_B',
        viewport: 'MOBILE',
        captureSetId: 'c',
        projectContextVersion: '1',
        pageContextVersion: '1',
        functionContractId: 'f',
        creativeInjectionId: 'i',
        gpt2AuthorityConceptId: 'mc-b',
        renditionId: 'art-b',
        provider: 'GPT2_MOBILE',
        model: 'gpt2',
        providerJobId: null,
        status: 'READY',
        imageUri: 'https://cdn.test/b.png',
        artifactPath: null,
        createdAt: '2026-09-22T12:01:00.000Z',
      },
      {
        artifactId: 'art-c',
        projectId: PROJECT,
        pageId,
        renditionSlot: 'RENDITION_C',
        viewport: 'MOBILE',
        captureSetId: 'c',
        projectContextVersion: '1',
        pageContextVersion: '1',
        functionContractId: 'f',
        creativeInjectionId: 'i',
        gpt2AuthorityConceptId: 'mc-c',
        renditionId: 'art-c',
        provider: 'GPT2_MOBILE',
        model: 'gpt2',
        providerJobId: null,
        status: 'READY',
        imageUri: 'https://cdn.test/c.png',
        artifactPath: null,
        createdAt: '2026-09-22T12:02:00.000Z',
      },
    ],
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
    lastFailure: null,
    history: [],
    activeReviewRunId: null,
    archivedRuns: [],
    activeGenerationRunId: 'run-fix1',
    activeGenerationRunStartedAt: '2026-09-22T12:00:00.000Z',
    activeGenerationStage: null,
    liveProgress: null,
    cgptSubsteps: null,
  };
}

describe('P0.VR.DESIGN-WORKSPACE-CONCEPT-GALLERY-AND-GENERATOR-ENTRY-FIX1', () => {
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
    resetPageConceptCandidatesForTests(PROJECT, CANONICAL_ALIAS_PAGE);
  });

  it('discovers persisted GPT2 state under canonical page id and hydrates gallery for registry page', () => {
    savePageConceptGenerationState(gpt2State(CANONICAL_ALIAS_PAGE));
    expect(enumeratePageConceptGenerationStoragePageIds(PROJECT)).toContain(CANONICAL_ALIAS_PAGE);

    refreshPageConceptGalleryFromPersistedState(PROJECT, REGISTRY_PAGE, { screenId: 'overview' });
    const sections = buildPageConceptGallerySections({
      projectId: PROJECT,
      pageId: REGISTRY_PAGE,
      viewport: 'MOBILE',
      galleryScope: { screenId: 'overview' },
    });

    expect(sections.current.map((c) => c.slotLabel)).toEqual(['A', 'B', 'C']);
    expect(listPageConceptCandidates(PROJECT, REGISTRY_PAGE).length).toBe(3);
  });

  it('loadPageConceptGenerationStateForDesignPage remaps storage to registry page id', () => {
    savePageConceptGenerationState(gpt2State(CANONICAL_ALIAS_PAGE));
    const loaded = loadPageConceptGenerationStateForDesignPage({
      projectSlug: PROJECT,
      pageId: REGISTRY_PAGE,
      screenId: 'overview',
    });
    expect(loaded.pageId).toBe(REGISTRY_PAGE);
    expect(loaded.pipelineSet?.mobileConcepts?.length).toBe(3);
  });

  it('gallery hydration survives reload-style second read without active in-memory run', () => {
    savePageConceptGenerationState(gpt2State(CANONICAL_ALIAS_PAGE));
    refreshPageConceptGalleryFromPersistedState(PROJECT, REGISTRY_PAGE, { screenId: 'overview' });
    resetPageConceptCandidatesForTests(PROJECT, REGISTRY_PAGE);
    const hydrated = listPageConceptCandidatesHydrated(PROJECT, REGISTRY_PAGE, { screenId: 'overview' });
    expect(hydrated.filter((c) => c.artifactStatus === 'READY').length).toBe(3);
  });

  it('generation console launcher exists in hero compare panel source', () => {
    const src = readFileSync(join(ROOT, 'src/site00/components/designBench/opusDirect/DesignHeroComparePanel.tsx'), 'utf8');
    expect(src).toContain('hero-generation-console');
    expect(src).toContain('generationConsoleLauncher');
  });

  it('canonical pipeline hides legacy select-for-desktop in canonical view', () => {
    const src = readFileSync(
      join(ROOT, 'src/site00/components/designBench/opusDirect/TwinOpusDirectCanonicalView.tsx'),
      'utf8',
    );
    expect(src).toContain('canonicalGpt2ViewportFamilyActive');
    expect(src).toContain('DesignViewportFamilyHeroRail');
    expect(src).toContain('viewportFamilyHeroRailStages');
    const rail = readFileSync(
      join(ROOT, 'src/site00/components/designBench/opusDirect/DesignViewportFamilyHeroRail.tsx'),
      'utf8',
    );
    expect(rail).toContain('data-testid="viewport-family-authority-rail"');
  });

  it('resolvePageConceptGenerationConsoleLauncher is contextual', () => {
    const state = gpt2State(REGISTRY_PAGE);
    expect(resolvePageConceptGenerationConsoleLauncher({ state, generating: false }).label).toMatch(/REVIEW|VIEW RUN/);
    expect(resolvePageConceptGenerationConsoleLauncher({ state: { ...state, generationJobs: [], pipelineSet: null }, generating: false }).label).toBe(
      'GENERATE',
    );
  });

  it('detects canonical GPT2 viewport family pipeline', () => {
    expect(isCanonicalGpt2ViewportFamilyPipeline(gpt2State(REGISTRY_PAGE).pipelineSet)).toBe(true);
  });

  it('does not leak concepts across pages', () => {
    savePageConceptGenerationState(gpt2State(CANONICAL_ALIAS_PAGE));
    refreshPageConceptGalleryFromPersistedState(PROJECT, REGISTRY_PAGE, { screenId: 'overview' });
    refreshPageConceptGalleryFromPersistedState(PROJECT, 'ndxbook:entry-001', { screenId: 'entry-001' });
    expect(listPageConceptCandidates(PROJECT, 'ndxbook:entry-001').length).toBe(0);
  });

  it('storage prefix remains v2 for discovery', () => {
    expect(PAGE_CONCEPT_GENERATION_STORAGE_PREFIX).toBe('site00:page-concept-generation:v2:');
  });
});
