/**
 * P0.VR.PAGE-CONCEPT-FETCH-ABORT-ASYNC-RUN1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as cgpt from '../api/_lib/site00PageConcept/generatePageCreativeInjection.js';
import {
  clearPageConceptServerRuns,
  getPageConceptServerRun,
} from '../api/_lib/site00PageConcept/pageConceptGenerationRunStore.js';
import {
  snapshotPageConceptServerRun,
  startPageConceptGenerationRun,
} from '../api/_lib/site00PageConcept/startPageConceptGenerationRun.js';
import {
  PAGE_CONCEPT_POLL_TIMEOUT_MS,
  PAGE_CONCEPT_START_TIMEOUT_MS,
  PAGE_CONCEPT_SYNC_GENERATE_TIMEOUT_MS,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptApiTimeouts.js';
import {
  estimatePageConceptCapturePayloadBytes,
  estimatePageConceptGenerationRequestBytes,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCapturePayloadBytes.js';
import { pageConceptServerRunIsTerminal } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';

const ROOT = join(import.meta.dirname, '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  const pages = listSiteDesignPagesForProject(PROJECT);
  return pages.find((p) => p.pageId === 'overview')?.pageId ?? pages[0]!.pageId;
}

describe('P0.VR.PAGE-CONCEPT-FETCH-ABORT-ASYNC-RUN1', () => {
  beforeEach(() => {
    clearPageConceptServerRuns();
    vi.restoreAllMocks();
  });

  it('documents abort origin: captureApiFetch AbortController client timeout', () => {
    const fetchWrapper = read('src/site00/services/captureApiFetch.ts');
    expect(fetchWrapper).toContain('AbortController');
    expect(fetchWrapper).toContain('controller.abort()');
    const runClient = read('src/site00/services/pageConceptGenerationRunClient.ts');
    expect(runClient).toContain('PAGE_CONCEPT_START_TIMEOUT_MS');
    expect(runClient).toContain('PAGE_CONCEPT_POLL_TIMEOUT_MS');
  });

  it('snapshotId transport keeps request body bounded vs base64', () => {
    const snap = {
      captureId: 'snap-ndxbook-overview-mobile-1',
      snapshotId: 'snap-ndxbook-overview-mobile-1',
      width: 390,
      height: 844,
    };
    const b64 = {
      captureId: 'local-cap',
      artifactBase64: 'A'.repeat(2_000_000),
      width: 390,
      height: 844,
    };
    expect(estimatePageConceptCapturePayloadBytes(snap)).toBeLessThan(500);
    expect(estimatePageConceptCapturePayloadBytes(b64)).toBeGreaterThan(1_000_000);
  });

  it('start returns runId before provider completion (dry run)', async () => {
    const pageId = overviewPageId();
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const cgptSpy = vi.spyOn(cgpt, 'generatePageCreativeInjection');

    const t0 = Date.now();
    const { runId } = startPageConceptGenerationRun({
      state,
      founderEmail: 'founder@test.com',
      founderConfirmedSpend: true,
      dryRun: true,
      mobileCapture: {
        captureId: 'm1',
        snapshotId: 'snap-m1',
        width: 390,
        height: 844,
      },
      desktopCapture: {
        captureId: 'd1',
        snapshotId: 'snap-d2',
        width: 1440,
        height: 900,
      },
    });
    const elapsed = Date.now() - t0;
    expect(elapsed).toBeLessThan(500);
    expect(runId).toMatch(/^pcgr-/);
    expect(cgptSpy).not.toHaveBeenCalled();

    await vi.waitFor(
      () => {
        const snap = snapshotPageConceptServerRun(runId);
        expect(snap?.status).toBe('READY_FOR_REVIEW');
      },
      { timeout: 10_000 },
    );
    expect(cgptSpy).not.toHaveBeenCalled();
  });

  it('server run persists after start — not tied to client fetch', async () => {
    const pageId = overviewPageId();
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const { runId } = startPageConceptGenerationRun({
      state,
      founderEmail: 'founder@test.com',
      founderConfirmedSpend: true,
      dryRun: true,
      mobileCapture: { captureId: 'm', snapshotId: 'snap-m', width: 390, height: 844 },
      desktopCapture: { captureId: 'd', snapshotId: 'snap-d', width: 1440, height: 900 },
    });
    await vi.waitFor(
      () => {
        const run = getPageConceptServerRun(runId);
        expect(run && pageConceptServerRunIsTerminal(run.status)).toBe(true);
      },
      { timeout: 10_000 },
    );
    expect(getPageConceptServerRun(runId)?.jobs.filter((j) => j.status === 'READY').length).toBe(6);
  });

  it('API handler exposes GET run status and POST start 202', () => {
    const api = read('api/site00/page-concept-generation.ts');
    expect(api).toContain("action === 'start'");
    expect(api).toContain('status(202)');
    expect(api).toContain('req.method === \'GET\'');
    expect(api).toContain('runId');
  });

  it('client uses start + poll instead of long generate fetch', () => {
    const hook = read('src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts');
    expect(hook).toContain('startPageConceptGenerationRunApi');
    expect(hook).toContain('pollPageConceptGenerationRunUntilTerminal');
    expect(hook).not.toContain('runPageConceptGenerationApi');
  });

  it('timeout constants separate start from legacy sync generate', () => {
    expect(PAGE_CONCEPT_START_TIMEOUT_MS).toBe(45_000);
    expect(PAGE_CONCEPT_POLL_TIMEOUT_MS).toBe(30_000);
    expect(PAGE_CONCEPT_SYNC_GENERATE_TIMEOUT_MS).toBe(90_000);
  });

  it('estimated full request with snapshot refs stays under 64kb state+json', () => {
    const pageId = overviewPageId();
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const bytes = estimatePageConceptGenerationRequestBytes({
      state,
      mobileCapture: { captureId: 'm', snapshotId: 'snap-m', width: 390, height: 844 },
      desktopCapture: { captureId: 'd', snapshotId: 'snap-d', width: 1440, height: 900 },
    });
    expect(bytes).toBeLessThan(64_000);
  });
});
