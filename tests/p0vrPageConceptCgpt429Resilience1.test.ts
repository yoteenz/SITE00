/**
 * P0.VR.PAGE-CONCEPT-CGPT-429-RESILIENCE1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLegacyPageConceptNbpPipeline } from './helpers/pageConceptLegacyNbpTestEnv.js';

import {
  clearAllPageConceptCgptStageLocks,
  tryBeginPageConceptCgptDispatch,
} from '../api/_lib/site00PageConcept/pageConceptCgptStageLock.js';
import { executePageConceptCgptStage } from '../api/_lib/site00PageConcept/executePageConceptCgptStage.js';
import * as gpt2 from '../api/_lib/site00PageConcept/generatePageGpt2AuthorityConcept.js';
import {
  clearPageConceptServerRuns,
  getPageConceptServerRun,
  patchPageConceptServerRun,
  putPageConceptServerRun,
} from '../api/_lib/site00PageConcept/pageConceptGenerationRunStore.js';
import type { PageConceptServerRun } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';
import { runPageConceptGeneration } from '../api/_lib/site00PageConcept/runPageConceptGeneration.js';
import {
  computeCgpt429BackoffMs,
  PAGE_CONCEPT_CGPT_MAX_429_ATTEMPTS,
  parseAnthropicRateLimitHeaders,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgpt429.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { buildCgptSynthesisParsedFixture } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeSynthesis.js';

const ROOT = join(import.meta.dirname, '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  const pages = listSiteDesignPagesForProject(PROJECT);
  return pages.find((p) => p.pageId === 'overview')?.pageId ?? pages[0]!.pageId;
}

function mock429Response(retryAfterSec: string, body: object): Response {
  const headers = new Headers({
    'retry-after': retryAfterSec,
    'anthropic-ratelimit-requests-limit': '50',
    'anthropic-ratelimit-requests-remaining': '0',
    'request-id': 'req_test_429',
  });
  return new Response(JSON.stringify(body), { status: 429, headers });
}

function mock200Response(json: object): Response {
  return new Response(JSON.stringify(json), {
    status: 200,
    headers: new Headers({ 'request-id': 'req_test_ok' }),
  });
}

describe('P0.VR.PAGE-CONCEPT-CGPT-429-RESILIENCE1', () => {
  useLegacyPageConceptNbpPipeline();
  beforeEach(() => {
    clearPageConceptServerRuns();
    clearAllPageConceptCgptStageLocks();
    vi.restoreAllMocks();
    process.env.ANTHROPIC_API_KEY = 'test-key';
  });

  it('parses anthropic rate-limit headers', () => {
    const headers = new Headers({
      'retry-after': '12',
      'anthropic-ratelimit-requests-limit': '50',
      'anthropic-ratelimit-requests-remaining': '0',
      'anthropic-ratelimit-tokens-limit': '80000',
      'anthropic-ratelimit-tokens-remaining': '1000',
    });
    const parsed = parseAnthropicRateLimitHeaders(headers);
    expect(parsed.retryAfterSec).toBe(12);
    expect(parsed.requestLimit).toBe('50');
    expect(parsed.tokenRemaining).toBe('1000');
  });

  it('honors Retry-After for backoff', () => {
    const ms = computeCgpt429BackoffMs({ attempt: 1, retryAfterSec: 18, random: () => 0.5 });
    expect(ms).toBe(18_000);
  });

  it('applies jitter when Retry-After missing', () => {
    const a = computeCgpt429BackoffMs({ attempt: 1, retryAfterSec: null, random: () => 0 });
    const b = computeCgpt429BackoffMs({ attempt: 1, retryAfterSec: null, random: () => 1 });
    expect(a).not.toBe(b);
  });

  it('429 retry wait transitions to success without immediate FAILED', async () => {
    const pageId = overviewPageId();
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const progress: string[] = [];
    let calls = 0;
    const fetchImpl = vi.fn(async () => {
      calls += 1;
      if (calls === 1) {
        return mock429Response('1', {
          error: { type: 'rate_limit_error', message: 'Rate limit exceeded' },
        });
      }
      const fixture = buildCgptSynthesisParsedFixture({
        projectContext: state.projectContext!,
        pageContext: state.pageContext!,
        functionContract: state.functionContract!,
      });
      return mock200Response({
        content: [{ type: 'text', text: JSON.stringify(fixture) }],
      });
    });

    const sleep = vi.fn(async () => undefined);
    const result = await executePageConceptCgptStage({
      runId: 'pcgr-test-429',
      input: {
        projectContext: state.projectContext!,
        pageContext: state.pageContext!,
        functionContract: state.functionContract!,
      },
      pipelineSetId: 'pps-test',
      dryRun: false,
      onProgress: (p) => {
        progress.push(`${p.generationStatus}:${p.cgptStatus}:${p.currentStage ?? ''}`);
      },
      sleep,
      random: () => 0.5,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(result.ok).toBe(true);
    expect(calls).toBe(2);
    expect(sleep).toHaveBeenCalledWith(1000);
    expect(progress.some((line) => line.includes('CGPT_RATE_LIMITED'))).toBe(true);
    expect(progress.some((line) => line.includes('RETRY_WAIT'))).toBe(true);
  });

  it('blocks duplicate concurrent CGPT dispatch for same run', async () => {
    expect(tryBeginPageConceptCgptDispatch('run-dup')).toBe(true);
    expect(tryBeginPageConceptCgptDispatch('run-dup')).toBe(false);
  });

  it('hard billing 429 does not loop retries', async () => {
    const pageId = overviewPageId();
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const fetchImpl = vi.fn(async () =>
      mock429Response('60', {
        error: { type: 'rate_limit_error', message: 'Your credit balance is too low' },
      }),
    );
    const result = await executePageConceptCgptStage({
      runId: 'pcgr-hard-quota',
      input: {
        projectContext: state.projectContext!,
        pageContext: state.pageContext!,
        functionContract: state.functionContract!,
      },
      pipelineSetId: 'pps-hard',
      dryRun: false,
      onProgress: () => undefined,
      sleep: async () => undefined,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe('CGPT_BILLING_USAGE_LIMIT');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('max 429 attempts yields CGPT_FAILED_RATE_LIMIT', async () => {
    const pageId = overviewPageId();
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const fetchImpl = vi.fn(async () =>
      mock429Response('1', {
        error: { type: 'rate_limit_error', message: 'Overloaded' },
      }),
    );
    const result = await executePageConceptCgptStage({
      runId: 'pcgr-max',
      input: {
        projectContext: state.projectContext!,
        pageContext: state.pageContext!,
        functionContract: state.functionContract!,
      },
      pipelineSetId: 'pps-max',
      dryRun: false,
      onProgress: () => undefined,
      sleep: async () => undefined,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe('CGPT_FAILED_RATE_LIMIT');
    expect(fetchImpl).toHaveBeenCalledTimes(PAGE_CONCEPT_CGPT_MAX_429_ATTEMPTS);
  });

  it('orchestrator dispatches exactly one CGPT call under vitest mock', async () => {
    const pageId = overviewPageId();
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const gpt2Spy = vi.spyOn(gpt2, 'generatePageGpt2AuthorityConcept');
    await runPageConceptGeneration({
      state,
      founderConfirmedSpend: true,
      mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
    });
    expect(gpt2Spy).toHaveBeenCalledTimes(1);
  });

  it('provider secrets are not logged from telemetry helper', () => {
    const src = read('shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgpt429.ts');
    expect(src).not.toContain('ANTHROPIC_API_KEY');
    expect(src).not.toContain('x-api-key');
  });

  it('UI exposes CGPT rate-limit progress and RETRY CGPT', () => {
    const overlay = read('src/site00/components/designBench/opusDirect/PageConceptGenerationOverlay.tsx');
    expect(overlay).toContain('CGPT_RATE_LIMITED');
    expect(overlay).toContain('RETRY CGPT');
    const hook = read('src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts');
    expect(hook).toContain('retryCgptOnly: true');
    expect(hook).toContain('resumeRunId');
  });

  it('persists cgptMeta on server run patches', async () => {
    const pageId = overviewPageId();
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const runId = 'pcgr-meta';
    const baseRun: PageConceptServerRun = {
      runId,
      projectId: PROJECT,
      pageId,
      founderEmail: 't@test.com',
      dryRun: false,
      status: 'CGPT_RUNNING',
      currentStage: 'CGPT_STARTING',
      cgptStatus: 'RUNNING',
      gpt2Status: 'PENDING',
      nbpStatus: 'PENDING',
      cgptMeta: null,
      panelProgress: null,
      cgptSubsteps: null,
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      error: null,
      plan: null,
      pipelineSet: null,
      jobs: [],
      generationStatus: 'CGPT_RUNNING',
      inputState: state,
    };
    putPageConceptServerRun(baseRun);

    const fetchImpl = vi.fn(async () =>
      mock429Response('1', { error: { type: 'rate_limit_error', message: 'wait' } }),
    );
    await executePageConceptCgptStage({
      runId,
      input: {
        projectContext: state.projectContext!,
        pageContext: state.pageContext!,
        functionContract: state.functionContract!,
      },
      pipelineSetId: 'pps-meta',
      dryRun: false,
      onProgress: (patch) => patchPageConceptServerRun(runId, patch),
      sleep: async () => undefined,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const snap = getPageConceptServerRun(runId);
    expect(snap?.cgptMeta?.attemptNumber).toBe(PAGE_CONCEPT_CGPT_MAX_429_ATTEMPTS);
    expect(snap?.cgptMeta?.lastProviderRequestId).toBe('req_test_429');
  });
});
