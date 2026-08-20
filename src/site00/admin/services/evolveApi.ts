/** Admin client for EVOLVE Marketing OS API */

import type {
  EvolveApprovalItem,
  EvolveCalendarItem,
  EvolveCampaignListRow,
  EvolveEmailItem,
  EvolveMarketingPlan,
  EvolveOverview,
  EvolveSocialItem,
} from '../types/evolve';

const BASE = '/api/admin/site00-evolve';

async function evolveFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `EVOLVE API ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const site00EvolveApi = {
  organizations: () =>
    evolveFetch<{ organizations: Array<{ slug: string; name: string; classification: string }> }>('?action=organizations'),

  overview: (orgSlug: string) =>
    evolveFetch<{ overview: EvolveOverview }>(`?action=overview&orgSlug=${encodeURIComponent(orgSlug)}`),

  debug: (orgSlug: string) => evolveFetch<Record<string, unknown>>(`?action=debug&orgSlug=${encodeURIComponent(orgSlug)}`),

  campaigns: (orgSlug: string) =>
    evolveFetch<{ campaigns: EvolveCampaignListRow[] }>(`?action=campaigns&orgSlug=${encodeURIComponent(orgSlug)}`),

  campaign: (orgSlug: string, campaignId: string) =>
    evolveFetch<{
      campaign: Record<string, unknown>;
      listRow: EvolveCampaignListRow;
      calendar: EvolveCalendarItem[];
      production: Array<Record<string, unknown>>;
      approvals: EvolveApprovalItem[];
    }>(`?action=campaign&orgSlug=${encodeURIComponent(orgSlug)}&campaignId=${encodeURIComponent(campaignId)}`),

  calendar: (orgSlug: string) =>
    evolveFetch<{ calendar: EvolveCalendarItem[] }>(`?action=calendar&orgSlug=${encodeURIComponent(orgSlug)}`),

  calendarItem: (orgSlug: string, itemId: string) =>
    evolveFetch<{ item: EvolveCalendarItem }>(
      `?action=calendar_item&orgSlug=${encodeURIComponent(orgSlug)}&itemId=${encodeURIComponent(itemId)}`,
    ),

  emails: (orgSlug: string) =>
    evolveFetch<{
      channel: Record<string, unknown> | undefined;
      providerState: string;
      items: EvolveEmailItem[];
      blockers: string[];
    }>(`?action=emails&orgSlug=${encodeURIComponent(orgSlug)}`),

  social: (orgSlug: string) =>
    evolveFetch<{
      channels: Array<Record<string, unknown>>;
      deferredByOwner: Array<Record<string, unknown>>;
      items: EvolveSocialItem[];
      roadmapDeferred: Array<Record<string, unknown>>;
    }>(`?action=social&orgSlug=${encodeURIComponent(orgSlug)}`),

  plans: (orgSlug: string) =>
    evolveFetch<{
      plans: EvolveMarketingPlan[];
      roadmap: Array<Record<string, unknown>>;
      objectives: Array<Record<string, unknown>>;
    }>(`?action=plans&orgSlug=${encodeURIComponent(orgSlug)}`),

  approvals: (orgSlug: string) =>
    evolveFetch<{ approvals: EvolveApprovalItem[] }>(`?action=approvals&orgSlug=${encodeURIComponent(orgSlug)}`),

  approvalsInbox: () => evolveFetch<{ approvals: EvolveApprovalItem[] }>('?action=approvals_inbox'),

  channels: (orgSlug: string) =>
    evolveFetch<{ channels: Array<Record<string, unknown>> }>(`?action=channels&orgSlug=${encodeURIComponent(orgSlug)}`),

  manifest: (orgSlug: string) => evolveFetch<Record<string, unknown>>(`?action=manifest&orgSlug=${encodeURIComponent(orgSlug)}`),

  runAssessment: (orgSlug: string) =>
    evolveFetch<{ assessment: Record<string, unknown> }>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'run_assessment', orgSlug }),
    }),

  generateManifest: (orgSlug: string) =>
    evolveFetch<{ manifest: Record<string, unknown>; items: unknown[] }>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'generate_manifest', orgSlug }),
    }),

  requestProduction: (
    orgSlug: string,
    data: { productionType: string; objective?: string; brief?: string; campaignId?: string },
  ) =>
    evolveFetch<{ ok: boolean; request?: Record<string, unknown>; error?: string }>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'request_production', orgSlug, ...data }),
    }),

  approveItem: (approvalId: string) =>
    evolveFetch<{ ok: boolean }>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'approve_item', approvalId }),
    }),

  rejectItem: (approvalId: string, reason?: string) =>
    evolveFetch<{ ok: boolean }>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'reject_item', approvalId, reason }),
    }),

  connectionsPortfolio: () =>
    evolveFetch<{ groups: Array<{ organizationSlug: string; organizationName: string; publishingStatus: string; connections: import('../types/evolve').SafeConnectionView[] }> }>(
      '?action=connections_portfolio',
    ),

  connections: (orgSlug: string) =>
    evolveFetch<{
      buckets: Record<string, import('../types/evolve').SafeConnectionView[]>;
      availableProviders: Array<{ providerKey: string; displayName: string; category: string; adapterStatus: string }>;
      pilot: Record<string, unknown>;
      publishingFence: Record<string, unknown>;
    }>(`?action=connections&orgSlug=${encodeURIComponent(orgSlug)}`),

  pilotReadiness: (orgSlug: string) =>
    evolveFetch<{ items: Array<{ key: string; label: string; state: string; detail?: string }>; publishingFence: Record<string, unknown>; automationMode: string }>(
      `?action=pilot_readiness&orgSlug=${encodeURIComponent(orgSlug)}`,
    ),

  initiateConnection: (orgSlug: string, providerKey: string, displayName?: string) =>
    evolveFetch<{ connection: import('../types/evolve').SafeConnectionView }>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'initiate_connection', orgSlug, providerKey, displayName }),
    }),

  verifyConnection: (orgSlug: string, connectionId: string) =>
    evolveFetch<{ connection: import('../types/evolve').SafeConnectionView }>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'verify_connection', orgSlug, connectionId }),
    }),

  syncConnection: (orgSlug: string, connectionId: string) =>
    evolveFetch<{ syncRunId: string; recordsNormalized: number; state: string }>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'sync_connection', orgSlug, connectionId }),
    }),

  disconnectConnection: (orgSlug: string, connectionId: string) =>
    evolveFetch<{ ok: boolean }>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'disconnect_connection', orgSlug, connectionId }),
    }),
};
