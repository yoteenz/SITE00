/** Admin client for EVOLVE Marketing OS API */

import { getAccessToken } from '../../../utils/api.js';
import type {
  EvolveApprovalItem,
  EvolveCalendarItem,
  EvolveCampaignListRow,
  EvolveEmailItem,
  EvolveMarketingPlan,
  EvolveOverview,
  EvolveSocialItem,
} from '../types/evolve';
import type { EvolveCommercialState, EvolveServiceCatalog } from '../../../../shared/site00-evolve-commercial/types';

export type ExpandedReadinessPayload = {
  designation: string;
  currentState: string;
  globalPublishing: string;
  humanApprovalRequired: boolean;
  crossPosting: string;
  nextAction: string;
  pilotPurpose: string;
  items: Array<{ key: string; label: string; state: string; detail?: string }>;
  ownerConfiguration?: {
    items: Array<{ key: string; label: string; status: string; lastValidated: string | null; validationResult: string }>;
    exactCallbackUrl: string;
    allConfigured: boolean;
  };
  exactCallbackUrl?: string;
  publishingFence: Record<string, unknown>;
  automationMode: string;
};

const EVOLVE_ADMIN_PATH = '/api/admin/site00-evolve';

function resolveEvolveApiBase(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    // Preview hosts proxy a local API that is often stale — always use Railway production.
    if (host.includes('fsbw-dev.com') || host.endsWith('.trycloudflare.com')) {
      return 'https://api.site00.com';
    }
  }

  const envBase = (
    (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? ''
  ).replace(/\/$/, '');
  if (envBase) return envBase;

  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host === 'site00.com' || host.endsWith('.site00.com')) {
      return 'https://api.site00.com';
    }
  }
  return '';
}

function evolveAdminUrl(path: string): string {
  const apiBase = resolveEvolveApiBase();
  const suffix = path.startsWith('?') ? path : path.startsWith('/') ? path : `/${path}`;
  return apiBase ? `${apiBase}${EVOLVE_ADMIN_PATH}${suffix}` : `${EVOLVE_ADMIN_PATH}${suffix}`;
}

async function evolveFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init?.headers as Record<string, string> | undefined) ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  // Bearer auth only — do not send credentials; ACAO:* + credentials:'include' fails CORS on fsbw-dev → api.site00.com.
  const res = await fetch(evolveAdminUrl(path), {
    ...init,
    headers,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.status === 401) {
      throw new Error(
        err.error === 'Sign in required'
          ? 'Sign in required — sign in on site00.com (same account), then reload this page.'
          : (err.error ?? 'Sign in required'),
      );
    }
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
    evolveFetch<ExpandedReadinessPayload>(`?action=pilot_readiness&orgSlug=${encodeURIComponent(orgSlug)}`),

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

  providerConfig: () =>
    evolveFetch<{
      items: Array<{ key: string; label: string; status: string; lastValidated: string | null; validationResult: string }>;
      exactCallbackUrl: string;
      callbackPath: string;
      allConfigured: boolean;
      validatedAt: string;
    }>('?action=provider_config'),

  oauthCallbackUrl: () => evolveFetch<{ exactCallbackUrl: string }>('?action=oauth_callback_url'),

  fenceReadiness: (orgSlug: string) =>
    evolveFetch<{ readiness: string; checks: Record<string, boolean>; fenceEnablementNote: string }>(
      `?action=fence_readiness&orgSlug=${encodeURIComponent(orgSlug)}`,
    ),

  ndxbookState: () => evolveFetch<Record<string, unknown>>('?action=ndxbook_state'),

  runNdxbookAssessment: (answers: Record<string, unknown>) =>
    evolveFetch<{ assessment: Record<string, unknown>; manifest?: Record<string, unknown> }>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'run_ndxbook_assessment', orgSlug: 'ndxbook', answers }),
    }),

  startOAuth: (orgSlug: string, connectionId: string, providerKey = 'meta_instagram') =>
    evolveFetch<{ ok: boolean; authorizationUrl?: string; code?: string; message?: string }>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'start_oauth', orgSlug, connectionId, providerKey }),
    }),

  discoverIgAccounts: (orgSlug: string, connectionId: string) =>
    evolveFetch<{ accounts: Array<Record<string, string>>; requiresSelection: boolean; message: string }>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'discover_ig_accounts', orgSlug, connectionId }),
    }),

  selectConnectionAccount: (
    orgSlug: string,
    connectionId: string,
    accountId: string,
    accountName: string,
    propertyId?: string,
    propertyName?: string,
  ) =>
    evolveFetch<{ connection: import('../types/evolve').SafeConnectionView }>('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'select_connection_account',
        orgSlug,
        connectionId,
        accountId,
        accountName,
        propertyId,
        propertyName,
      }),
    }),

  verifyCapabilities: (orgSlug: string, connectionId: string) =>
    evolveFetch<{ capabilities: Record<string, string>; publishingCapability: string; analyticsCapability: string }>(
      '',
      { method: 'POST', body: JSON.stringify({ action: 'verify_capabilities', orgSlug, connectionId }) },
    ),

  confirmAccount: (orgSlug: string, connectionId: string) =>
    evolveFetch<{ connection: import('../types/evolve').SafeConnectionView }>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'confirm_account', orgSlug, connectionId }),
    }),

  analyticsBaseline: (orgSlug: string, connectionId: string) =>
    evolveFetch<Record<string, unknown>>(
      `?action=analytics_baseline&orgSlug=${encodeURIComponent(orgSlug)}&connectionId=${encodeURIComponent(connectionId)}`,
    ),

  firstPostCandidate: (orgSlug: string, candidateId?: string) =>
    evolveFetch<Record<string, unknown>>(
      `?action=first_post_candidate&orgSlug=${encodeURIComponent(orgSlug)}${candidateId ? `&candidateId=${encodeURIComponent(candidateId)}` : ''}`,
    ),

  saveFirstPostDraft: (orgSlug: string, data: Record<string, unknown>) =>
    evolveFetch<{ candidate: Record<string, unknown> }>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'save_first_post_draft', orgSlug, ...data }),
    }),

  sendFirstPostApproval: (orgSlug: string, candidateId: string) =>
    evolveFetch<Record<string, unknown>>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'send_first_post_approval', orgSlug, candidateId }),
    }),

  firstPostDryRun: (orgSlug: string, candidateId: string, approvalState = 'APPROVED') =>
    evolveFetch<Record<string, unknown>>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'first_post_dry_run', orgSlug, candidateId, approvalState }),
    }),

  creativeDirection: (orgSlug: string) =>
    evolveFetch<Record<string, unknown>>(`?action=creative_direction&orgSlug=${encodeURIComponent(orgSlug)}`),

  creativeDirectionDebug: (orgSlug: string) =>
    evolveFetch<Record<string, unknown>>(`?action=creative_direction_debug&orgSlug=${encodeURIComponent(orgSlug)}`),

  creativeDirectionFormationInspector: (orgSlug: string) =>
    evolveFetch<Record<string, unknown>>(`?action=creative_direction_formation_inspector&orgSlug=${encodeURIComponent(orgSlug)}`),

  commercialCatalog: () => evolveFetch<{ catalog: EvolveServiceCatalog }>('?action=commercial_catalog'),

  commercialState: (orgSlug: string) =>
    evolveFetch<{ orgSlug: string; commercial: EvolveCommercialState }>(`?action=commercial_state&orgSlug=${encodeURIComponent(orgSlug)}`),

  commercialSetPlan: (orgSlug: string, planId: string) =>
    evolveFetch<{ orgSlug: string; commercial: EvolveCommercialState }>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'commercial_set_plan', orgSlug, planId }),
    }),

  commercialMarkFoundationCompleted: (orgSlug: string) =>
    evolveFetch<{ orgSlug: string; commercial: EvolveCommercialState }>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'commercial_mark_foundation_completed', orgSlug }),
    }),

  creativeDirectionDecision: (
    orgSlug: string,
    body: {
      type: 'APPROVE' | 'REFINE' | 'HYBRIDIZE' | 'REJECT';
      selectedTerritoryId?: string;
      selectedComparisonDirectionId?: string;
      hybridSelections?: Array<{ territoryId: string; elements: string[] }>;
      refinementNotes?: string;
      rejectedTerritoryIds?: string[];
    },
  ) =>
    evolveFetch<Record<string, unknown>>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'creative_direction_decision', orgSlug, ...body }),
    }),

  /** Step 1 — Sonnet completion for v1 directions 01–03 only (NDX BOOK). */
  creativeDirectionCompleteV1Directions: (orgSlug: string) =>
    evolveFetch<Record<string, unknown>>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'creative_direction_complete_v1_directions', orgSlug }),
    }),

  /** Step 2 — Stage A visual proof production for all six comparison directions. */
  creativeDirectionRunSixDirectionProduction: (
    orgSlug: string,
    options?: { completeV1?: boolean; includeAllProofTypes?: boolean; dryRun?: boolean },
  ) =>
    evolveFetch<Record<string, unknown>>('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'creative_direction_run_six_direction_production',
        orgSlug,
        completeV1: options?.completeV1 ?? false,
        includeAllProofTypes: options?.includeAllProofTypes ?? true,
        dryRun: options?.dryRun ?? false,
      }),
    }),

  /** Background job — returns immediately; poll creativeDirectionProductionJob for status. */
  creativeDirectionStartProductionJob: (
    orgSlug: string,
    options?: {
      jobType?: 'v1_completion' | 'six_direction_proofs' | 'full_pipeline';
      includeAllProofTypes?: boolean;
      completeV1InProofStep?: boolean;
    },
  ) =>
    evolveFetch<{ job: Record<string, unknown>; message?: string }>('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'creative_direction_start_production_job',
        orgSlug,
        jobType: options?.jobType ?? 'full_pipeline',
        includeAllProofTypes: options?.includeAllProofTypes ?? true,
        completeV1InProofStep: options?.completeV1InProofStep ?? false,
      }),
    }),

  creativeDirectionProductionJob: (orgSlug: string, jobId?: string) =>
    evolveFetch<{ job: Record<string, unknown> | null }>(
      `?action=creative_direction_production_job&orgSlug=${encodeURIComponent(orgSlug)}${
        jobId ? `&jobId=${encodeURIComponent(jobId)}` : ''
      }`,
    ),
};
