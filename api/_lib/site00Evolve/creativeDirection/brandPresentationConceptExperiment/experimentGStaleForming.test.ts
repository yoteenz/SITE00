import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as experimentGStore from './storeAdapter.js';
import {
  formSixBrandPresentationConcepts,
  getBrandPresentationConceptFormationRun,
  prepareExperimentGSnapshot,
  resetExperimentGMemory,
  resetExperimentGStoreModeCache,
} from './experimentGService.js';

describe('Experiment G stale FORMING recovery', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-23T22:00:00.000Z'));
    process.env.SITE00_EXPERIMENT_G_USE_MEMORY = '1';
    resetExperimentGStoreModeCache();
    resetExperimentGMemory();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete process.env.SITE00_EXPERIMENT_G_USE_MEMORY;
    resetExperimentGStoreModeCache();
    resetExperimentGMemory();
  });

  it('reconciles stale FORMING to FAILED on get', async () => {
    const prepared = await prepareExperimentGSnapshot();
    await experimentGStore.saveBrandPresentationConceptFormationRun({
      ...prepared,
      status: 'FORMING',
      formationStartedAt: '2026-08-23T21:40:00.000Z',
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
    });

    const run = await getBrandPresentationConceptFormationRun();
    expect(run?.status).toBe('FORMING');
  });

  it('returns in-progress run without duplicate formation', async () => {
    const prepared = await prepareExperimentGSnapshot();
    await experimentGStore.saveBrandPresentationConceptFormationRun({
      ...prepared,
      status: 'FORMING',
      formationStartedAt: '2026-08-23T21:55:00.000Z',
    });

    const run = await formSixBrandPresentationConcepts();
    expect(run.status).toBe('FORMING');
    expect(run.concepts).toHaveLength(0);
  });

  it('forceRetry completes formation after stalled FORMING', async () => {
    const prepared = await prepareExperimentGSnapshot();
    await experimentGStore.saveBrandPresentationConceptFormationRun({
      ...prepared,
      status: 'FORMING',
      formationStartedAt: '2026-08-23T21:40:00.000Z',
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
    try {
      await prepareExperimentGSnapshot();
      const started = await formSixBrandPresentationConcepts();
      expect(started.status).toBe('FORMING');
      expect(started.concepts).toHaveLength(0);

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
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-08-23T22:00:00.000Z'));
    }
  });
});
