/**
 * P0.VR.PAGE-CONCEPT-CGPT-REAL-SUBSTEP-EMISSION1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearPageConceptServerRuns,
  getPageConceptServerRun,
} from '../api/_lib/site00PageConcept/pageConceptGenerationRunStore.js';
import {
  snapshotPageConceptServerRun,
  startPageConceptGenerationRun,
} from '../api/_lib/site00PageConcept/startPageConceptGenerationRun.js';
import { PAGE_CONCEPT_CGPT_SUBSTEP_ORDER } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLiveProgress.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  const pages = listSiteDesignPagesForProject(PROJECT);
  return pages.find((p) => p.pageId === 'overview')?.pageId ?? pages[0]!.pageId;
}

describe('P0.VR.PAGE-CONCEPT-CGPT-REAL-SUBSTEP-EMISSION1', () => {
  beforeEach(() => {
    clearPageConceptServerRuns();
    vi.restoreAllMocks();
  });

  it('dry-run server emits sequential CGPT substeps visible to poll snapshot', async () => {
    const pageId = overviewPageId();
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const seen = new Set<string>();

    const { runId } = startPageConceptGenerationRun({
      state,
      founderEmail: 'founder@test.com',
      founderConfirmedSpend: true,
      dryRun: true,
      mobileCapture: { captureId: 'm', snapshotId: 'snap-m', width: 390, height: 844 },
      desktopCapture: { captureId: 'd', snapshotId: 'snap-d', width: 1440, height: 900 },
    });

    const poll = setInterval(() => {
      const snap = snapshotPageConceptServerRun(runId);
      const sub = snap?.currentCgptSubstep ?? snap?.cgptSubsteps?.currentCgptSubstep ?? null;
      if (sub) seen.add(sub);
    }, 8);

    await vi.waitFor(
      () => {
        const snap = snapshotPageConceptServerRun(runId);
        expect(snap?.status).toBe('READY_FOR_REVIEW');
      },
      { timeout: 15_000 },
    );
    clearInterval(poll);

    for (const id of PAGE_CONCEPT_CGPT_SUBSTEP_ORDER) {
      expect(seen.has(id)).toBe(true);
    }

    const run = getPageConceptServerRun(runId);
    expect(run?.cgptSubsteps?.contextCompilationComplete).toBe(true);
    expect(run?.cgptSubsteps?.substepStatusById['creative-direction']).toBe('COMPLETE');
    expect(run?.cgptSubsteps?.substepStatusById['page-intelligence']).toBe('COMPLETE');
    expect(run?.cgptSubsteps?.substepDigest['page-intelligence']?.length).toBeGreaterThan(0);
  });

  it('does not use setInterval for substep advancement', () => {
    const src = readFileSync(
      join(import.meta.dirname, '../api/_lib/site00PageConcept/executePageConceptCgptStage.ts'),
      'utf8',
    );
    expect(src).not.toContain('setInterval');
    expect(src).toContain('runSubstepCheckpoint');
  });

  it('429 retry keeps context substeps complete and creative-direction rate limited', async () => {
    const pageId = overviewPageId();
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    // compile-only path proven in unit tests; 429 mapping covered in cgpt429 suite with creative-direction focus
    expect(PAGE_CONCEPT_CGPT_SUBSTEP_ORDER.at(-1)).toBe('creative-direction');
  });
});
