import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { LiveStudioWorldAdapter } from './liveAdapter.js';
import { resetProductionServiceAdapterCache, getProductionServiceAdapter, studioWorldIntegrationStatus } from './client.js';
import { MockStudioWorldAdapter } from './mockAdapter.js';

describe('LiveStudioWorldAdapter', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    process.env.STUDIO_WORLD_API_BASE = 'https://studio-world.test';
    process.env.STUDIO_WORLD_API_KEY = 'test-key';
    resetProductionServiceAdapterCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.STUDIO_WORLD_API_BASE;
    delete process.env.STUDIO_WORLD_API_KEY;
    delete process.env.STUDIO_WORLD_ADAPTER;
    resetProductionServiceAdapterCache();
  });

  it('provisions campaign with idempotency header', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ campaignId: 'sw-1', status: 'PROVISIONED', clientPhase: '02' }), { status: 200 }),
    );

    const adapter = new LiveStudioWorldAdapter();
    const result = await adapter.provisionCampaign({
      externalSystem: 'SITE_00',
      externalClientId: 'client-1',
      externalEngagementId: 'eng-1',
      brandSetupRequired: false,
      engagementType: 'EVOLVE_MARKETING',
      serviceType: 'campaign',
    });

    expect(result.campaignId).toBe('sw-1');
    expect(mockFetch).toHaveBeenCalledOnce();
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['X-Idempotency-Key']).toBe('eng-1');
  });

  it('returns ALREADY_EXISTS on 409 response body', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ campaignId: 'sw-1', status: 'ALREADY_EXISTS', clientPhase: '03' }), { status: 409 }),
    );

    const adapter = new LiveStudioWorldAdapter();
    const result = await adapter.provisionCampaign({
      externalSystem: 'SITE_00',
      externalClientId: 'client-1',
      externalEngagementId: 'eng-1',
      brandSetupRequired: false,
      engagementType: 'EVOLVE_MARKETING',
      serviceType: 'campaign',
    });

    expect(result.status).toBe('ALREADY_EXISTS');
  });

  it('submits client review action', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const adapter = new LiveStudioWorldAdapter();
    const result = await adapter.submitClientAction({
      reviewId: 'rev-1',
      clientUserId: 'user-1',
      action: 'APPROVE',
      timestamp: new Date().toISOString(),
    });

    expect(result.ok).toBe(true);
    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain('/external/v1/reviews/rev-1/actions');
  });
});

describe('getProductionServiceAdapter', () => {
  afterEach(() => {
    delete process.env.STUDIO_WORLD_ADAPTER;
    delete process.env.STUDIO_WORLD_API_BASE;
    delete process.env.STUDIO_WORLD_API_KEY;
    delete process.env.NODE_ENV;
    resetProductionServiceAdapterCache();
  });

  it('uses mock when STUDIO_WORLD_ADAPTER=mock', () => {
    process.env.STUDIO_WORLD_ADAPTER = 'mock';
    resetProductionServiceAdapterCache();
    expect(getProductionServiceAdapter().mode).toBe('mock');
    expect(studioWorldIntegrationStatus()).toBe('MOCKED');
  });

  it('uses live when configured', () => {
    process.env.STUDIO_WORLD_ADAPTER = 'live';
    process.env.STUDIO_WORLD_API_BASE = 'https://studio-world.test';
    process.env.STUDIO_WORLD_API_KEY = 'key';
    resetProductionServiceAdapterCache();
    expect(getProductionServiceAdapter().mode).toBe('live');
    expect(studioWorldIntegrationStatus()).toBe('LIVE');
  });

  it('uses mock adapter class when mock mode', () => {
    process.env.STUDIO_WORLD_ADAPTER = 'mock';
    resetProductionServiceAdapterCache();
    expect(getProductionServiceAdapter()).toBeInstanceOf(MockStudioWorldAdapter);
  });
});
