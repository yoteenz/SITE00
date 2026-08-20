import type { ProductionServiceAdapter } from './adapter.js';
import { isLiveStudioWorldConfigured, resolveStudioWorldAdapterMode } from './contract.js';
import { LiveStudioWorldAdapter } from './liveAdapter.js';
import { MockStudioWorldAdapter } from './mockAdapter.js';

let cached: ProductionServiceAdapter | null = null;

export type StudioWorldIntegrationStatus = 'MOCKED' | 'LIVE' | 'LIVE_MISCONFIGURED';

/**
 * Returns the configured Studio World adapter.
 * - `STUDIO_WORLD_ADAPTER=mock` → mock (dev/testing)
 * - `STUDIO_WORLD_ADAPTER=live` → live (requires API base + key)
 * - Default: mock in development, live in production
 */
export function getProductionServiceAdapter(): ProductionServiceAdapter {
  if (cached) return cached;

  const mode = resolveStudioWorldAdapterMode();
  if (mode === 'live') {
    if (!isLiveStudioWorldConfigured()) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('STUDIO_WORLD live adapter requires STUDIO_WORLD_API_BASE and STUDIO_WORLD_API_KEY');
      }
      console.warn('[studioWorld] STUDIO_WORLD_ADAPTER=live but credentials missing — using mock in non-production');
      cached = new MockStudioWorldAdapter();
      return cached;
    }
    cached = new LiveStudioWorldAdapter();
    return cached;
  }

  cached = new MockStudioWorldAdapter();
  return cached;
}

export function studioWorldIntegrationStatus(): StudioWorldIntegrationStatus {
  const mode = resolveStudioWorldAdapterMode();
  if (mode === 'mock') return 'MOCKED';
  if (!isLiveStudioWorldConfigured()) return 'LIVE_MISCONFIGURED';
  return 'LIVE';
}

export function resetProductionServiceAdapterCache(): void {
  cached = null;
}

export { MockStudioWorldAdapter, LiveStudioWorldAdapter };
