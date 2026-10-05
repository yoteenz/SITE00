/**
 * Experiment D service tests — founder trigger, no auto-start.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../canonicalCarouselExpansion/canonicalCarouselExpansionService.js', () => ({
  getCanonicalCarouselExpansionRun: vi.fn().mockResolvedValue(null),
}));

vi.mock('../canonicalCreativeRange/canonicalCreativeRangeService.js', () => ({
  getCanonicalCreativeRangeRun: vi.fn().mockResolvedValue({
    directions: [{ comparisonIndex: 1, heroAsset: { storagePath: 'prev/hero.webp' } }],
  }),
}));

vi.mock('../creativeIntelligence/gptImage2VisualProviderAdapter.js', () => ({
  generateIdentityNativeImageFromBrief: vi.fn(),
}));

import {
  executeExperimentDHeroGeneration,
  formExperimentDTerritories,
  getSixConceptHeroRangeRun,
} from './experimentDService.js';
import { resetExperimentDMemory } from './storeAdapter.js';

describe('EXPERIMENT_D_NOT_AUTO_STARTED_TEST', () => {
  beforeEach(() => {
    resetExperimentDMemory();
  });

  it('does not auto-generate heroes on territory formation', async () => {
    const run = await formExperimentDTerritories();
    expect(run.generationStarted).toBe(false);
    expect(run.heroes.every((h) => !h.heroAsset)).toBe(true);
  });
});

describe('EXPERIMENT_D_FOUNDER_TRIGGER_REQUIRED_TEST', () => {
  beforeEach(() => {
    resetExperimentDMemory();
  });

  it('requires generationReady before execute', async () => {
    await expect(executeExperimentDHeroGeneration()).rejects.toThrow(/not generation-ready/);
  });
});

describe('EXPERIMENT_D_MAX_SIX_HERO_TEST', () => {
  beforeEach(async () => {
    resetExperimentDMemory();
    await formExperimentDTerritories();
  });

  it('generates at most six heroes under VITEST', async () => {
    const run = await executeExperimentDHeroGeneration();
    expect(run.heroes.filter((h) => h.heroAsset).length).toBeLessThanOrEqual(6);
    expect(run.generationStarted).toBe(true);
  });
});

describe('SAME_TOPIC_TEST', () => {
  beforeEach(() => {
    resetExperimentDMemory();
  });

  it('locks credit utilization topic', async () => {
    const run = await formExperimentDTerritories();
    expect(run.topicName).toBe('CREDIT UTILIZATION');
    expect(run.topicId).toBe('credit-utilization');
  });
});

describe('EXPERIMENT_D_GET', () => {
  beforeEach(() => {
    resetExperimentDMemory();
  });

  it('returns null before formation', async () => {
    expect(await getSixConceptHeroRangeRun()).toBeNull();
  });
});
