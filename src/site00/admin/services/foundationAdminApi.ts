/**
 * Digital Foundation founder mini console — admin API (Bearer via apiFetch).
 */
import { digitalFoundationClientIntakePath } from '../../../../shared/site00-digital-foundation/clientRoutes.js';
import type {
  PipelineRow,
  pipelineAttentionQueries,
} from '../../../../shared/site00-digital-foundation/operations/contracts/p13Pipeline.js';
import type { ProjectCommandSnapshot } from '../../../../shared/site00-digital-foundation/operations/contracts/p14ProjectCommand.js';
import type { FounderRunbookView } from '../../../../shared/site00-digital-foundation/operations/contracts/p15RunbookView.js';
import { apiFetch } from '../../../utils/api';

export { digitalFoundationClientIntakePath };

async function parseJson<T>(res: Response): Promise<T> {
  const raw = await res.text();
  if (!raw.trim()) return {} as T;
  return JSON.parse(raw) as T;
}

export async function foundationFetch<T>(path: string, init?: { method?: string; body?: Record<string, unknown> }): Promise<T> {
  const res = await apiFetch(path, init);
  const data = await parseJson<T & { error?: string; code?: string }>(res);
  if (!res.ok) {
    const msg = data.error ?? `Foundation admin API ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export type ReferralSourceRow = {
  referral_source_id: string;
  kind: string;
  label: string;
  active: boolean;
};

export type FoundationAdminListRow = {
  artifact_id: string;
  public_token: string;
  state: string;
  payment_state: string;
  intake_state?: string;
  business_name?: string | null;
  referral_source_id?: string | null;
  created_at: string;
  last_activity_at?: string;
};

export type FoundationAdminListResponse = {
  artifacts: FoundationAdminListRow[];
  referral_sources?: ReferralSourceRow[];
};

export const foundationAdminApi = {
  list: () => foundationFetch<FoundationAdminListResponse>('/api/admin/site00-foundation?action=list'),

  detail: (id: string) =>
    foundationFetch(`/api/admin/site00-foundation?action=detail&id=${encodeURIComponent(id)}`),

  createLeadLink: (body: { contact_email?: string; contact_name?: string; business_name?: string; referral_kind?: string }) =>
    foundationFetch<{ personalized_url?: string }>('/api/admin/site00-foundation', {
      method: 'POST',
      body: { action: 'create-artifact', ...body },
    }),

  markComplete: (artifactId: string, ownership: Record<string, unknown>) =>
    foundationFetch('/api/admin/site00-foundation', {
      method: 'POST',
      body: { action: 'mark-complete', artifact_id: artifactId, ownership },
    }),

  pipeline: () => foundationFetch<FoundationPipelineView>('/api/admin/site00-foundation?action=pipeline'),

  projectCommand: (id: string) =>
    foundationFetch<ProjectCommandSnapshot>(`/api/admin/site00-foundation?action=project-command&id=${encodeURIComponent(id)}`),

  workbench: (id: string) =>
    foundationFetch<Record<string, unknown>>(`/api/admin/site00-foundation?action=workbench&id=${encodeURIComponent(id)}`),

  runbook: (id: string) =>
    foundationFetch<FounderRunbookView>(`/api/admin/site00-foundation?action=runbook&id=${encodeURIComponent(id)}`),

  completionGate: (id: string) =>
    foundationFetch<Record<string, unknown>>(
      `/api/admin/site00-foundation?action=completion-gate&id=${encodeURIComponent(id)}`,
    ),

  messages: (id: string) =>
    foundationFetch<{ messages: unknown[] }>(
      `/api/admin/site00-foundation?action=messages&id=${encodeURIComponent(id)}`,
    ),

  emailTimeline: () =>
    foundationFetch<{ events: unknown[] }>('/api/admin/site00-foundation?action=email-timeline'),

  quoteCommercialReady: (artifactId: string) =>
    foundationFetch('/api/admin/site00-foundation', {
      method: 'POST',
      body: { action: 'quote-commercial-ready', artifact_id: artifactId },
    }),

  manualQuoteAdjustment: (artifactId: string, adjustmentMinor: number) =>
    foundationFetch('/api/admin/site00-foundation', {
      method: 'POST',
      body: { action: 'manual-adjustment', artifact_id: artifactId, adjustment_minor: adjustmentMinor },
    }),

  approvalResolve: (artifactId: string, approvalId: string, status: 'APPROVED' | 'REVISION_REQUESTED', note?: string) =>
    foundationFetch('/api/admin/site00-foundation', {
      method: 'POST',
      body: { action: 'approval-resolve', artifact_id: artifactId, approval_id: approvalId, status, note },
    }),

  startTask: (artifactId: string, taskId: string) =>
    foundationFetch('/api/admin/site00-foundation', {
      method: 'POST',
      body: { action: 'start-task', artifact_id: artifactId, task_id: taskId },
    }),

  completeTask: (artifactId: string, taskId: string) =>
    foundationFetch('/api/admin/site00-foundation', {
      method: 'POST',
      body: { action: 'complete-task', artifact_id: artifactId, task_id: taskId },
    }),

  setBlocker: (artifactId: string, taskId: string, category: string, reason: string) =>
    foundationFetch('/api/admin/site00-foundation', {
      method: 'POST',
      body: { action: 'set-blocker', artifact_id: artifactId, task_id: taskId, category, reason },
    }),

  sendMessage: (artifactId: string, body: string) =>
    foundationFetch('/api/admin/site00-foundation', {
      method: 'POST',
      body: { action: 'send-message', artifact_id: artifactId, body },
    }),
};

export type { PipelineRow, ProjectCommandSnapshot, FounderRunbookView };

export type FoundationPipelineView = {
  rows: PipelineRow[];
  attention: ReturnType<typeof pipelineAttentionQueries>;
};
