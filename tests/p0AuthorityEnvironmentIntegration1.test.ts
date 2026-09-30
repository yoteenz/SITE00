/**
 * P0.SITE00.AUTHORITY-ENVIRONMENT-FAMILY-LIVE-INTEGRATION1
 */
import { describe, expect, it } from 'vitest';
import { hubAssetUrl } from '../shared/site00-production-hub/assets.js';
import { HUB_ASSET_RECEIPTS } from '../shared/site00-production-hub/assetReceipts.js';
import { characterAssetUrl, CF_FABRICATION_ENV_SLOT, CF_SIMULATION_ENV_SLOT } from '../shared/site00-character-fabrication/assets.js';
import { characterEnvironmentSlotId, isCharacterRunningSimulation } from '../shared/site00-character-fabrication/environment.js';
import { initialFabricationState } from '../shared/site00-character-fabrication/reducer.js';
import stateMap from '../docs/environment-family/STATE-TO-ENVIRONMENT.json';

describe('authority environment family — mounted receipts', () => {
  it('production atmosphere receipt resolves', () => {
    expect(HUB_ASSET_RECEIPTS.some((r) => r.slotId === 'production.hub.chamber.atmosphere')).toBe(true);
    expect(hubAssetUrl('production.hub.chamber.atmosphere')).toMatch(/atmosphere\.webp$/);
  });

  it('character fabrication + simulation volume receipts resolve', () => {
    expect(characterAssetUrl(CF_FABRICATION_ENV_SLOT)).toMatch(/fabrication\/machine\/chamber\.webp$/);
    expect(characterAssetUrl(CF_SIMULATION_ENV_SLOT)).toMatch(/simulation-volume\.webp$/);
  });
});

describe('character environment state map (CF-18 only)', () => {
  const base = initialFabricationState();

  it('idle / station selection uses fabrication base', () => {
    expect(characterEnvironmentSlotId({ ...base, activeStation: 'simulation' })).toBe(CF_FABRICATION_ENV_SLOT);
    expect(isCharacterRunningSimulation({ ...base, activeStation: 'simulation' })).toBe(false);
  });

  it('RUNNING simulation uses simulation volume', () => {
    const running = {
      ...base,
      activeStation: 'simulation' as const,
      run: {
        simulationId: 'sim-1',
        testId: 'interact',
        config: base.simConfig,
        status: 'RUNNING' as const,
        elapsedMs: 0,
        startedAt: '2026-01-01',
        fidelity: 'SIMULATION_PREVIEW_CACHED' as const,
      },
    };
    expect(isCharacterRunningSimulation(running)).toBe(true);
    expect(characterEnvironmentSlotId(running)).toBe(CF_SIMULATION_ENV_SLOT);
  });

  it('PAUSED simulation keeps simulation volume', () => {
    const paused = {
      ...base,
      run: {
        simulationId: 'sim-1',
        testId: 'interact',
        config: base.simConfig,
        status: 'PAUSED' as const,
        elapsedMs: 1000,
        startedAt: '2026-01-01',
        fidelity: 'SIMULATION_PREVIEW_CACHED' as const,
      },
    };
    expect(characterEnvironmentSlotId(paused)).toBe(CF_SIMULATION_ENV_SLOT);
  });

  it('completed run restores fabrication base', () => {
    const done = {
      ...base,
      run: {
        simulationId: 'sim-1',
        testId: 'interact',
        config: base.simConfig,
        status: 'COMPLETE' as const,
        elapsedMs: 5000,
        startedAt: null,
        fidelity: 'SIMULATION_PREVIEW_CACHED' as const,
      },
    };
    expect(characterEnvironmentSlotId(done)).toBe(CF_FABRICATION_ENV_SLOT);
  });

  it('STATE-TO-ENVIRONMENT.json marks only cf.simulation.running as distinct swap', () => {
    const cf = stateMap.states.filter((s: { workspace: string }) => s.workspace === 'character-fabrication');
    const swaps = cf.filter((s: { swapRequired: boolean }) => s.swapRequired);
    expect(swaps).toHaveLength(1);
    expect(swaps[0].stateId).toBe('cf.simulation.running');
    expect(swaps[0].environmentId).toBe('cf.environment.simulation.volume');
  });
});
