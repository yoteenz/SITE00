import type { ProductionServiceAdapter } from './adapter.js';
import { MockStudioWorldAdapter } from './mockAdapter.js';
import { STUDIO_WORLD_INTEGRATION_STATUS } from './types.js';

let cached: ProductionServiceAdapter | null = null;

/**
 * Returns the configured Studio World adapter.
 * LIVE adapter is unavailable until STUDIO_WORLD_EXTERNAL_INTEGRATION_CONTRACT is supplied.
 */
export function getProductionServiceAdapter(): ProductionServiceAdapter {
  if (cached) return cached;

  const mode = process.env.STUDIO_WORLD_ADAPTER?.trim() ?? 'mock';
  if (mode === 'live') {
    // Real adapter not implemented — contract not available in this repository.
    console.warn('[studioWorld] STUDIO_WORLD_ADAPTER=live requested but contract unavailable — falling back to mock');
  }

  cached = new MockStudioWorldAdapter();
  return cached;
}

export function studioWorldIntegrationStatus(): typeof STUDIO_WORLD_INTEGRATION_STATUS | 'MOCKED' {
  const mode = process.env.STUDIO_WORLD_ADAPTER?.trim() ?? 'mock';
  if (mode === 'live') return STUDIO_WORLD_INTEGRATION_STATUS;
  return 'MOCKED';
}

export { MockStudioWorldAdapter };
