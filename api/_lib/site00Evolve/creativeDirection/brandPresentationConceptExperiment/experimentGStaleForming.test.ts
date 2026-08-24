import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as experimentGStore from './storeAdapter.js';
import {
  formSixBrandPresentationConcepts,
  getBrandPresentationConceptFormationRun,
  prepareExperimentGSnapshot,
  resetExperimentGFormationWorkers,
  resetExperimentGMemory,
  resetExperimentGStoreModeCache,
  setExperimentGConceptJudgment,
} from './experimentGService.js';

describe('Experiment G stale FORMING recovery', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-23T22:00:00.000Z'));
    process.env.SITE00_EXPERIMENT_G_USE_MEMORY = '1';
    resetExperimentGStoreModeCache();
    resetExperimentGMemory();
    resetExperimentGFormationWorkers();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete process.env.SITE00_EXPERIMENT_G_USE_MEMORY;
    resetExperimentGStoreModeCache();
    resetExperimentGMemory();
    resetExperimentGFormationWorkers();
  });

  it('reconciles stale FORMING to FAILED on get', async () => {
    const prepared = await prepareExperimentGSnapshot();
    await experimentGStore.saveBrandPresentationConceptFormationRun({
      ...prepared,
      status: 'FORMING',
      formationStartedAt: '2026-08-23T21:40:00.000Z',
      formationAttemptId: 'stale-attempt',
    });

    const run = await getBrandPresentationConceptFormationRun();
    expect(run?.status).toBe('FAILED');
    expect(run?.error).toMatch(/interrupted/i);
  });

  it('does not reconcile fresh FORMING on get', async () => {
    const prepared = await prepareExperimentGSnapshot();
    await experimentGStore.saveBrandPresentationConceptFormationRun({
      ...prepared,
      status: 'FORMING',
      formationStartedAt: '2026-08-23T21:55:00.000Z',
      formationAttemptId: 'fresh-attempt',
    });

    const run = await getBrandPresentationConceptFormationRun();
    expect(run?.status).toBe('FORMING');
  });

  it('blocks prepareSnapshot while formation is in progress', async () => {
    const prepared = await prepareExperimentGSnapshot();
    await experimentGStore.saveBrandPresentationConceptFormationRun({
      ...prepared,
      status: 'FORMING',
      formationStartedAt: '2026-08-23T21:55:00.000Z',
      formationAttemptId: 'fresh-attempt',
    });

    await expect(prepareExperimentGSnapshot()).rejects.toThrow(/SNAPSHOT_BLOCKED/i);
  });

  it('returns in-progress run without duplicate formation', async () => {
    const prepared = await prepareExperimentGSnapshot();
    await experimentGStore.saveBrandPresentationConceptFormationRun({
      ...prepared,
      status: 'FORMING',
      formationStartedAt: '2026-08-23T21:55:00.000Z',
      formationAttemptId: 'fresh-attempt',
    });

    const run = await formSixBrandPresentationConcepts();
    expect(run.status).toBe('FORMING');
    expect(run.concepts).toHaveLength(0);
    expect(run.formationAttemptId).toBe('fresh-attempt');
  });

  it('forceRetry supersedes fresh FORMING and completes formation', async () => {
    const prepared = await prepareExperimentGSnapshot();
    await experimentGStore.saveBrandPresentationConceptFormationRun({
      ...prepared,
      status: 'FORMING',
      formationStartedAt: '2026-08-23T21:55:00.000Z',
      formationAttemptId: 'stuck-attempt',
    });

    const run = await formSixBrandPresentationConcepts({ forceRetry: true });
    expect(run.status).not.toBe('FORMING');
    expect(run.concepts).toHaveLength(6);
    expect(run.formationAttemptId).toBeNull();
  });

  it('forceRetry completes formation after stalled FORMING', async () => {
    const prepared = await prepareExperimentGSnapshot();
    await experimentGStore.saveBrandPresentationConceptFormationRun({
      ...prepared,
      status: 'FORMING',
      formationStartedAt: '2026-08-23T21:40:00.000Z',
      formationAttemptId: 'stale-attempt',
    });

    const run = await formSixBrandPresentationConcepts({ forceRetry: true });
    expect(run.status).not.toBe('FORMING');
    expect(run.concepts).toHaveLength(6);
  });

  it('returns FORMING immediately and completes in background outside vitest', async () => {
    vi.useRealTimers();
    const originalVitest = process.env.VITEST;
    delete process.env.VITEST;
    process.env.SITE00_EXPERIMENT_G_USE_MEMORY = '1';
    resetExperimentGFormationWorkers();
    try {
      await prepareExperimentGSnapshot();
      const started = await formSixBrandPresentationConcepts();
      expect(started.status).toBe('FORMING');
      expect(started.concepts).toHaveLength(0);
      expect(started.formationAttemptId).toBeTruthy();

      await new Promise<void>((resolve) => {
        setImmediate(() => resolve());
      });
      await new Promise<void>((resolve) => {
        setImmediate(() => resolve());
      });

      const completed = await getBrandPresentationConceptFormationRun();
      expect(completed?.status).not.toBe('FORMING');
      expect(completed?.concepts).toHaveLength(6);
    } finally {
      process.env.VITEST = originalVitest;
      process.env.SITE00_EXPERIMENT_G_USE_MEMORY = '1';
      resetExperimentGFormationWorkers();
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-08-23T22:00:00.000Z'));
    }
  });

  it('re-enqueues background worker on get when FORMING has no active worker', async () => {
    vi.useRealTimers();
    const originalVitest = process.env.VITEST;
    delete process.env.VITEST;
    process.env.SITE00_EXPERIMENT_G_USE_MEMORY = '1';
    resetExperimentGFormationWorkers();
    try {
      const prepared = await prepareExperimentGSnapshot();
      const attemptId = 'orphaned-attempt';
      await experimentGStore.saveBrandPresentationConceptFormationRun({
        ...prepared,
        status: 'FORMING',
        formationStartedAt: new Date(Date.now() - 60_000).toISOString(),
        formationAttemptId: attemptId,
      });

      const resumed = await getBrandPresentationConceptFormationRun();
      expect(resumed?.status).toBe('FORMING');

      await new Promise<void>((resolve) => {
        setImmediate(() => resolve());
      });
      await new Promise<void>((resolve) => {
        setImmediate(() => resolve());
      });

      const completed = await getBrandPresentationConceptFormationRun();
      expect(completed?.status).not.toBe('FORMING');
      expect(completed?.concepts).toHaveLength(6);
    } finally {
      process.env.VITEST = originalVitest;
      process.env.SITE00_EXPERIMENT_G_USE_MEMORY = '1';
      resetExperimentGFormationWorkers();
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-08-23T22:00:00.000Z'));
    }
  });

  it('persists founder judgment on a concept and marks run FOUNDER_REVIEWED', async () => {
    const formed = await formSixBrandPresentationConcepts();
    expect(formed.concepts).toHaveLength(6);
    const conceptId = formed.concepts[0]!.id;

    const updated = await setExperimentGConceptJudgment({
      conceptId,
      judgment: 'LOVE_THE_CONCEPT',
    });

    expect(updated.status).toBe('FOUNDER_REVIEWED');
    const saved = updated.concepts.find((c) => c.id === conceptId);
    expect(saved?.founderJudgment).toBe('LOVE_THE_CONCEPT');

    const reloaded = await getBrandPresentationConceptFormationRun();
    expect(reloaded?.concepts.find((c) => c.id === conceptId)?.founderJudgment).toBe('LOVE_THE_CONCEPT');
  });
});
