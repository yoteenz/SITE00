import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import type { PageConceptServerRunSnapshot } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';
import { savePageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { loadPageConceptGenerationStateForDesignPage } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationStateDiscovery.js';
vi.mock('../src/site00/services/pageConceptApiSession.js', () => ({
  ensurePageConceptApiAccessToken: vi.fn(),
}));

vi.mock('../src/site00/services/pageConceptGenerationRunClient.js', () => ({
  fetchLatestPageConceptGenerationRunForDesignPage: vi.fn(),
  fetchPageConceptGenerationRunApi: vi.fn(),
  savePageConceptActiveServerRunId: vi.fn(),
}));

describe('pageConceptGalleryServerMountClient', () => {
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
      key(i: number) {
        return Object.keys(this.store)[i] ?? null;
      },
      get length() {
        return Object.keys(this.store).length;
      },
    });
    vi.stubGlobal('window', {
      dispatchEvent: vi.fn(),
      location: { hostname: 'site00.fsbw-dev.com' },
    });
    vi.stubGlobal('document', {
      querySelector: () => null,
    });
  });

  it('persists mounted server run without reloading stale empty state', async () => {
    const { mountPageConceptGalleryFromServer } = await import(
      '../src/site00/services/pageConceptGalleryServerMountClient.js'
    );
    const { ensurePageConceptApiAccessToken } = await import(
      '../src/site00/services/pageConceptApiSession.js'
    );
    const { fetchLatestPageConceptGenerationRunForDesignPage } = await import(
      '../src/site00/services/pageConceptGenerationRunClient.js'
    );

    vi.mocked(ensurePageConceptApiAccessToken).mockResolvedValue('token');
    const run: PageConceptServerRunSnapshot = {
      runId: 'pcgr-mount-test',
      projectId: 'ndxbook',
      pageId: 'overview',
      status: 'READY_FOR_REVIEW',
      currentStage: null,
      cgptStatus: 'COMPLETE',
      gpt2Status: 'COMPLETE',
      nbpStatus: 'COMPLETE',
      cgptMeta: null,
      panelProgress: null,
      cgptSubsteps: null,
      dryRun: false,
      error: null,
      generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
      plan: null,
      pipelineSet: null,
      jobs: [
        {
          artifactId: 'gpt2-a',
          provider: 'GPT2_MOBILE',
          status: 'READY',
          createdAt: '2026-09-25T23:00:00.000Z',
          viewport: 'MOBILE',
        } as PageConceptServerRunSnapshot['jobs'][number],
      ],
      updatedAt: '2026-09-25T23:00:00.000Z',
      completedAt: '2026-09-25T23:00:00.000Z',
      latestProgressSequence: 0,
    };
    vi.mocked(fetchLatestPageConceptGenerationRunForDesignPage).mockResolvedValue({
      run,
      progressEvents: [],
      latestSequence: 0,
    });

    const persist = vi.fn((fn: (s: PageConceptGenerationState) => PageConceptGenerationState) => {
      const base = loadPageConceptGenerationStateForDesignPage({
        projectSlug: 'ndxbook',
        pageId: 'overview',
        screenId: 'overview',
      });
      savePageConceptGenerationState(fn(base));
    });

    const trace = await mountPageConceptGalleryFromServer({
      projectId: 'ndxbook',
      pageId: 'overview',
      screenId: 'overview',
      persist,
    });

    expect(trace.phase).toBe('applied');
    const saved = loadPageConceptGenerationStateForDesignPage({
      projectSlug: 'ndxbook',
      pageId: 'overview',
      screenId: 'overview',
    });
    expect(saved.activeGenerationRunId).toBe('pcgr-mount-test');
    expect(saved.generationJobs.some((j) => j.provider === 'GPT2_MOBILE' && j.status === 'READY')).toBe(true);
    expect(persist).toHaveBeenCalled();
  });

  it('applies server run when authed even if local same runId looks fresher', async () => {
    const { mountPageConceptGalleryFromServer } = await import(
      '../src/site00/services/pageConceptGalleryServerMountClient.js'
    );
    const { ensurePageConceptApiAccessToken } = await import(
      '../src/site00/services/pageConceptApiSession.js'
    );
    const { fetchLatestPageConceptGenerationRunForDesignPage } = await import(
      '../src/site00/services/pageConceptGenerationRunClient.js'
    );
    vi.mocked(ensurePageConceptApiAccessToken).mockResolvedValue('token');

    const staleLocal: PageConceptGenerationState = {
      projectId: 'ndxbook',
      pageId: 'overview',
      generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
      activeGenerationRunId: 'pcgr-same-run',
      activeGenerationStage: null,
      activeReviewRunId: null,
      generationJobs: [
        {
          artifactId: 'local-stale',
          provider: 'GPT2_MOBILE',
          status: 'READY',
          createdAt: '2026-09-27T12:00:00.000Z',
          viewport: 'MOBILE',
          imageUri: 'https://old-cache.example/stale.png',
        } as PageConceptGenerationState['generationJobs'][number],
      ],
      pipelineSet: null,
      archivedRuns: [],
      cgptSubsteps: null,
      liveProgress: null,
      lastFailure: null,
    };
    savePageConceptGenerationState(staleLocal);

    const run: PageConceptServerRunSnapshot = {
      runId: 'pcgr-same-run',
      projectId: 'ndxbook',
      pageId: 'overview',
      status: 'READY_FOR_REVIEW',
      currentStage: null,
      cgptStatus: 'COMPLETE',
      gpt2Status: 'COMPLETE',
      nbpStatus: 'COMPLETE',
      cgptMeta: null,
      panelProgress: null,
      cgptSubsteps: null,
      dryRun: false,
      error: null,
      generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
      plan: null,
      pipelineSet: null,
      jobs: [
        {
          artifactId: 'server-fresh',
          provider: 'GPT2_MOBILE',
          status: 'READY',
          createdAt: '2026-09-25T23:00:00.000Z',
          viewport: 'MOBILE',
          imageUri: 'https://supabase.example/fresh.png',
        } as PageConceptServerRunSnapshot['jobs'][number],
      ],
      updatedAt: '2026-09-25T23:00:00.000Z',
      completedAt: '2026-09-25T23:00:00.000Z',
      latestProgressSequence: 0,
    };
    vi.mocked(fetchLatestPageConceptGenerationRunForDesignPage).mockResolvedValue({
      run,
      progressEvents: [],
      latestSequence: 0,
    });

    const trace = await mountPageConceptGalleryFromServer({
      projectId: 'ndxbook',
      pageId: 'overview',
      screenId: 'overview',
      persist: vi.fn(),
    });

    expect(trace.phase).toBe('applied');
    expect(trace.reason).toBeUndefined();
  });
});
