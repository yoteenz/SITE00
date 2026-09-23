/**
 * Concept gallery must mount latest canonical GPT2 mobile Fal artifacts (not stale buckets / cached URLs).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  listPageConceptCandidates,
  resetPageConceptCandidatesForTests,
} from '../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';
import {
  loadPageConceptGenerationStateForDesignPage,
  scorePageConceptGenerationStateForGalleryDiscovery,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationStateDiscovery.js';
import { resolvePageConceptArtifactDisplayUrl } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptArtifactDisplayUrl.js';
import { syncPageConceptGalleryFromGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGallerySync.js';
import { savePageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const PROJECT = 'ndxbook';
const REGISTRY_PAGE = 'page-overview';
const ALIAS_PAGE = 'ndxbook:overview';

function gpt2MobileState(input: {
  pageId: string;
  runLabel: string;
  imageSuffix: string;
  createdAt: string;
}): PageConceptGenerationState {
  const slots = ['MOBILE_CONCEPT_A', 'MOBILE_CONCEPT_B', 'MOBILE_CONCEPT_C'] as const;
  const jobs = slots.map((slot, i) => ({
    artifactId: `pcga-${slot}-MOBILE-${input.runLabel}`,
    projectId: PROJECT,
    pageId: input.pageId,
    renditionSlot: (['RENDITION_A', 'RENDITION_B', 'RENDITION_C'] as const)[i],
    viewport: 'MOBILE' as const,
    captureSetId: 'cap',
    projectContextVersion: '1',
    pageContextVersion: '1',
    functionContractId: 'fc',
    creativeInjectionId: 'inj',
    gpt2AuthorityConceptId: `pg2m-${slot}-${input.runLabel}`,
    renditionId: `pg2m-${slot}-${input.runLabel}`,
    provider: 'GPT2_MOBILE' as const,
    model: 'openai/gpt-image-2',
    providerJobId: `fal-${input.runLabel}-${slot}`,
    promptVersion: 'v4',
    status: 'READY' as const,
    imageUri: `https://cdn.test/${input.imageSuffix}-${slot}.png`,
    artifactPath: null,
    createdAt: input.createdAt,
    displayTitle: `Concept ${String.fromCharCode(65 + i)}`,
  }));
  return {
    targetType: 'PAGE',
    projectId: PROJECT,
    pageId: input.pageId,
    projectContext: null,
    pageContext: null,
    functionContract: null,
    pipelineSet: {
      pipelineSetId: `ps-${input.runLabel}`,
      projectId: PROJECT,
      pageId: input.pageId,
      targetType: 'PAGE',
      captureSetId: 'cap',
      functionContractId: 'fc',
      creativeInjection: null,
      cgptCreativeBrief: null,
      gpt2AuthorityConcept: null,
      renditions: [],
      mobileConcepts: slots.map((slot, i) => ({
        conceptId: `pg2m-${slot}-${input.runLabel}`,
        slot,
        artifactId: jobs[i]!.artifactId,
        imageUri: jobs[i]!.imageUri,
        status: 'READY' as const,
        createdAt: input.createdAt,
      })),
      pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
      createdAt: input.createdAt,
    },
    generationJobs: jobs,
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
    lastFailure: null,
    history: [],
    activeGenerationRunId: `run-${input.runLabel}`,
    activeGenerationRunStartedAt: input.createdAt,
    activeGenerationStage: null,
    liveProgress: null,
    cgptSubsteps: null,
  };
}

describe('concept gallery latest mobile mount', () => {
  beforeEach(() => {
    resetPageConceptCandidatesForTests(PROJECT, REGISTRY_PAGE);
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      key: (index: number) => Object.keys(store)[index] ?? null,
      get length() {
        return Object.keys(store).length;
      },
    });
  });

  it('prefers newer canonical GPT2 state over legacy bucket with more jobs', () => {
    const legacy = gpt2MobileState({
      pageId: ALIAS_PAGE,
      runLabel: 'legacy',
      imageSuffix: 'old',
      createdAt: '2026-09-20T12:00:00.000Z',
    });
    legacy.generationJobs.push(
      ...Array.from({ length: 3 }).map((_, i) => ({
        ...legacy.generationJobs[0]!,
        artifactId: `nbp-extra-${i}`,
        provider: 'NBP' as const,
        status: 'READY' as const,
      })),
    );

    const latest = gpt2MobileState({
      pageId: REGISTRY_PAGE,
      runLabel: 'latest',
      imageSuffix: 'new',
      createdAt: '2026-09-23T12:00:00.000Z',
    });

    expect(scorePageConceptGenerationStateForGalleryDiscovery(latest)).toBeGreaterThan(
      scorePageConceptGenerationStateForGalleryDiscovery(legacy),
    );

    savePageConceptGenerationState(legacy);
    savePageConceptGenerationState(latest);

    const loaded = loadPageConceptGenerationStateForDesignPage({
      projectSlug: PROJECT,
      pageId: REGISTRY_PAGE,
      screenId: 'overview',
    });
    expect(loaded.activeGenerationRunId).toBe('run-latest');
    syncPageConceptGalleryFromGenerationState(loaded);
    const rows = listPageConceptCandidates(PROJECT, REGISTRY_PAGE);
    expect(rows.filter((r) => r.runGroup === 'CURRENT')).toHaveLength(3);
    expect(rows.every((r) => r.mobileVisualReference?.includes('new-MOBILE'))).toBe(true);
  });

  it('cache-busts artifact display URLs when provider job id changes', () => {
    const url = resolvePageConceptArtifactDisplayUrl('https://cdn.test/a.png', 'fal-job-2');
    expect(url).toContain('artifact=fal-job-2');
  });
});
