import { apiFetch } from '../../../utils/api';
import type { OrchestrationDashboardSnapshot, ProjectControlSnapshot } from '../types/orchestration';

async function parseJson<T>(res: Response): Promise<T> {
  const raw = await res.text();
  if (!raw.trim()) return {} as T;
  return JSON.parse(raw) as T;
}

async function orchestrationFetch<T>(path: string, init?: { method?: string; body?: Record<string, unknown> }): Promise<T> {
  const res = await apiFetch(path, init);
  const data = await parseJson<T & { error?: string }>(res);
  if (!res.ok) throw new Error(data.error ?? `Orchestration API ${res.status}`);
  return data;
}

export const site00OrchestrationApi = {
  dashboard: () =>
    orchestrationFetch<OrchestrationDashboardSnapshot>('/api/admin/site00-orchestration?action=dashboard'),

  project: (orgSlug: string) =>
    orchestrationFetch<ProjectControlSnapshot>(
      `/api/admin/site00-orchestration?action=project&orgSlug=${encodeURIComponent(orgSlug)}`,
    ),

  reconcileDecide: (reconciliationId: string, decision: 'ACCEPT' | 'REJECT' | 'MODIFY', modifiedState?: string) =>
    orchestrationFetch('/api/admin/site00-orchestration', {
      method: 'POST',
      body: { action: 'reconcile-decide', reconciliationId, decision, modifiedState },
    }),

  approveManifest: (manifestId: string) =>
    orchestrationFetch('/api/admin/site00-orchestration', {
      method: 'POST',
      body: { action: 'approve-manifest', manifestId },
    }),
};
