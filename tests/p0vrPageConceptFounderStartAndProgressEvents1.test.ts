/**
 * P0.VR.PAGE-CONCEPT-FOUNDER-START-AND-PROGRESS-EVENTS1
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
import { normalizePageConceptStateOnPanelMount } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptHydrationNormalize.js';
import {
  pageConceptProgressEventsAfterSequence,
  type PageConceptProgressEvent,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProgressEvents.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { presentPageConceptProgressEvents } from '../src/site00/services/pageConceptProgressEventPresentation.js';
import { emptyPresentedSubstepState } from '../src/site00/services/pageConceptProgressEventPresentation.js';

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  const pages = listSiteDesignPagesForProject(PROJECT);
  return pages.find((p) => p.pageId === 'overview')?.pageId ?? pages[0]!.pageId;
}

describe('P0.VR.PAGE-CONCEPT-FOUNDER-START-AND-PROGRESS-EVENTS1', () => {
  beforeEach(() => {
    clearPageConceptServerRuns();
    vi.restoreAllMocks();
    process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'false';
  });

  it('panel mount normalizes stale in-flight local state without founder session', () => {
    const pageId = overviewPageId();
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const stale = {
      ...state,
      generationStatus: 'CGPT_RUNNING' as const,
      activeGenerationStage: 'CGPT_SUB:creative-direction',
      liveProgress: {
        currentStage: 'CGPT' as const,
        currentSubstep: 'creative-direction' as const,
        stageStatusById: { CGPT: 'ACTIVE' as const, GPT2: 'PENDING' as const, NBP: 'PENDING' as const },
        substepStatusById: Object.fromEntries(
          PAGE_CONCEPT_CGPT_SUBSTEP_ORDER.map((id) => [id, id === 'creative-direction' ? 'ACTIVE' : 'COMPLETE']),
        ),
        nbpActiveLabel: null,
        updatedAt: new Date().toISOString(),
        failureStage: null,
        failureSubstep: null,
      },
    };
    const normalized = normalizePageConceptStateOnPanelMount(stale, false);
    expect(normalized.generationStatus).not.toBe('CGPT_RUNNING');
    expect(normalized.liveProgress).toBeNull();
  });

  it('does not auto-resume polling from localStorage alone', () => {
    const hook = readFileSync(
      join(import.meta.dirname, '../src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts'),
      'utf8',
    );
    expect(hook).toContain('loadPageConceptFounderRunSession');
    expect(hook).not.toMatch(
      /loadPageConceptActiveServerRunId\(projectId, pageId\);\s*\n\s*if \(!runId \|\| generating\)/,
    );
  });

  it('append-only progress events and afterSequence cursor on GET snapshot', async () => {
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
        expect(run?.status).toBe('READY_FOR_REVIEW');
        expect((run?.progressEvents?.length ?? 0) > 8).toBe(true);
      },
      { timeout: 15_000 },
    );

    const run = getPageConceptServerRun(runId)!;
    const all = run.progressEvents ?? [];
    const mid = Math.floor(all.length / 2);
    const afterSeq = all[mid]!.sequence;
    const slice = pageConceptProgressEventsAfterSequence(all, afterSeq);
    expect(slice.every((e) => e.sequence > afterSeq)).toBe(true);
    expect(slice.length).toBe(all.length - mid - 1);

    const snap = snapshotPageConceptServerRun(runId, afterSeq);
    expect(snap?.progressEventsAfterSequence?.length).toBe(slice.length);
    expect(snap?.latestProgressSequence).toBe(run.latestProgressSequence);
  });

  it('client presents unseen COMPLETE events in order without dropping', async () => {
    const runId = 'pcgr-test-events';
    const now = new Date().toISOString();
    const events: PageConceptProgressEvent[] = [];
    let seq = 0;
    for (const substepId of PAGE_CONCEPT_CGPT_SUBSTEP_ORDER) {
      seq += 1;
      events.push({
        eventId: `e-${seq}`,
        sequence: seq,
        runId,
        stage: 'CGPT',
        substep: substepId,
        status: 'RUNNING',
        timestamp: now,
      });
      seq += 1;
      events.push({
        eventId: `e-${seq}`,
        sequence: seq,
        runId,
        stage: 'CGPT',
        substep: substepId,
        status: substepId === 'creative-direction' ? 'RUNNING' : 'COMPLETE',
        timestamp: now,
      });
    }

    const seen: string[] = [];
    const finalMap = await presentPageConceptProgressEvents({
      events,
      initialMap: emptyPresentedSubstepState(),
      dwellMs: 0,
      sleep: async () => {},
      onMapUpdate: (map) => {
        for (const id of PAGE_CONCEPT_CGPT_SUBSTEP_ORDER) {
          if (map[id] === 'COMPLETE' && !seen.includes(id)) seen.push(id);
        }
      },
    });
    expect(seen.length).toBe(4);
    expect(finalMap['creative-direction']).toBe('ACTIVE');
  });
});
