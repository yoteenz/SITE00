/**
 * Digital Foundation founder mini console — admin API (Bearer via apiFetch).
 */
import { digitalFoundationClientIntakePath } from '../../../../shared/site00-digital-foundation/clientRoutes.js';
import { apiFetch } from '../../../utils/api';

export { digitalFoundationClientIntakePath };

async function parseJson<T>(res: Response): Promise<T> {
  const raw = await res.text();
  if (!raw.trim()) return {} as T;
  return JSON.parse(raw) as T;
}

async function foundationFetch<T>(path: string, init?: { method?: string; body?: Record<string, unknown> }): Promise<T> {
  const res = await apiFetch(path, init);
  const data = await parseJson<T & { error?: string; code?: string }>(res);
  if (!res.ok) {
    const msg = data.error ?? `Foundation admin API ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export type FoundationAdminListRow = {
  artifact_id: string;
  public_token: string;
  state: string;
  payment_state: string;
  created_at: string;
};

export const foundationAdminApi = {
  list: () =>
    foundationFetch<{ artifacts: FoundationAdminListRow[] }>('/api/admin/site00-foundation?action=list'),

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

  pipeline: () => foundationFetch<{ rows: PipelineRow[] }>('/api/admin/site00-foundation?action=pipeline'),

  projectCommand: (id: string) =>
    foundationFetch<Record<string, unknown>>(`/api/admin/site00-foundation?action=project-command&id=${encodeURIComponent(id)}`),

  workbench: (id: string) =>
    foundationFetch<Record<string, unknown>>(`/api/admin/site00-foundation?action=workbench&id=${encodeURIComponent(id)}`),
};

export type PipelineRow = {
  artifact_id: string;
  business_name: string | null;
  payment_state: string;
  current_stage: string | null;
  next_action: string | null;
  blocker: string | null;
};
