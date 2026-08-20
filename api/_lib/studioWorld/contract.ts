/** Studio World external integration contract v1 — path constants and env validation. */

export const STUDIO_WORLD_CONTRACT_VERSION = '1.0' as const;

export const STUDIO_WORLD_API_PATHS = {
  provision: '/external/v1/campaigns/provision',
  status: (campaignId: string) => `/external/v1/campaigns/${encodeURIComponent(campaignId)}/status`,
  reviews: (campaignId: string) => `/external/v1/campaigns/${encodeURIComponent(campaignId)}/reviews`,
  deliverables: (campaignId: string) => `/external/v1/campaigns/${encodeURIComponent(campaignId)}/deliverables`,
  reviewAction: (reviewId: string) => `/external/v1/reviews/${encodeURIComponent(reviewId)}/actions`,
} as const;

export type StudioWorldAdapterMode = 'mock' | 'live';

export function resolveStudioWorldAdapterMode(): StudioWorldAdapterMode {
  const explicit = process.env.STUDIO_WORLD_ADAPTER?.trim();
  if (explicit === 'mock') return 'mock';
  if (explicit === 'live') return 'live';
  return process.env.NODE_ENV === 'production' ? 'live' : 'mock';
}

export function getStudioWorldApiBase(): string {
  const base = process.env.STUDIO_WORLD_API_BASE?.trim();
  if (!base) throw new Error('STUDIO_WORLD_API_BASE is not configured');
  return base.replace(/\/$/, '');
}

export function getStudioWorldApiKey(): string {
  const key = process.env.STUDIO_WORLD_API_KEY?.trim();
  if (!key) throw new Error('STUDIO_WORLD_API_KEY is not configured');
  return key;
}

export function getStudioWorldWebhookSecret(): string | null {
  return process.env.STUDIO_WORLD_WEBHOOK_SECRET?.trim() || null;
}

export function isLiveStudioWorldConfigured(): boolean {
  return Boolean(process.env.STUDIO_WORLD_API_BASE?.trim() && process.env.STUDIO_WORLD_API_KEY?.trim());
}
