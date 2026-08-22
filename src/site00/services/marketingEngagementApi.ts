import type {
  MarketingEngagementPayload,
  MarketingEngagementRecord,
  MarketingIntakeRecord,
  MarketingScopeRecord,
  MarketingServiceCategory,
} from '../../../shared/site00-marketing/types.js';
import { apiFetch } from '../../utils/api.js';

async function marketingFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

export const marketingEngagementApi = {
  list: () => marketingFetch<{ engagements: MarketingEngagementRecord[] }>('/api/site00/marketing-engagements?action=list'),
  detail: (id: string) => marketingFetch<MarketingEngagementPayload>(`/api/site00/marketing-engagements?action=detail&id=${encodeURIComponent(id)}`),
  create: (serviceCategory: MarketingServiceCategory, campaignName?: string) =>
    marketingFetch<MarketingEngagementRecord>('/api/site00/marketing-engagements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', serviceCategory, campaignName }),
    }),
  updateIntake: (id: string, intake: Partial<MarketingIntakeRecord>, markComplete?: boolean) =>
    marketingFetch<MarketingEngagementRecord>('/api/site00/marketing-engagements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update-intake', id, intake, markComplete }),
    }),
  updateScope: (id: string, scope: Partial<MarketingScopeRecord>) =>
    marketingFetch<MarketingEngagementRecord>('/api/site00/marketing-engagements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update-scope', id, scope }),
    }),
  authorize: (id: string) =>
    marketingFetch<MarketingEngagementRecord>('/api/site00/marketing-engagements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'authorize', id }),
    }),
  confirmPayment: (id: string) =>
    marketingFetch<MarketingEngagementRecord>('/api/site00/marketing-engagements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'confirm-payment', id }),
    }),
  provision: (id: string) =>
    marketingFetch<MarketingEngagementRecord>('/api/site00/marketing-engagements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'provision', id }),
    }),
  sync: (id: string) =>
    marketingFetch<MarketingEngagementPayload>('/api/site00/marketing-engagements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sync', id }),
    }),
  reviewAction: (input: {
    id: string;
    reviewId: string;
    reviewActionType: 'APPROVE' | 'REQUEST_REVISION' | 'SELECT_DIRECTION';
    note?: string;
    directionId?: string;
  }) =>
    marketingFetch<{ ok: true }>('/api/site00/marketing-engagements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'review-action', ...input }),
    }),
};
