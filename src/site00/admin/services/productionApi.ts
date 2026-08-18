import { apiFetch } from '../../../utils/api';
import type {
  AdminActivityItem,
  AdminBldrIntake,
  AdminDashboardPayload,
  AdminIdentity,
  AdminInvoice,
  AdminLead,
  AdminPeriod,
  AdminSearchResults,
  AdminSite,
} from '../types/operations.js';
import type {
  Site00ApprovalsPayload,
  Site00ProjectWorkspacePayload,
  Site00ProjectsPayload,
  Site00StudioPayload,
} from '../types/production.js';

async function parseJson<T>(res: Response): Promise<T> {
  const raw = await res.text();
  if (!raw.trim()) return {} as T;
  return JSON.parse(raw) as T;
}

async function productionFetch<T>(path: string, init?: { method?: string; body?: Record<string, unknown> }): Promise<T> {
  const res = await apiFetch(path, init);
  const data = await parseJson<T & { error?: string }>(res);
  if (!res.ok) throw new Error(data.error ?? `Production API ${res.status}`);
  return data;
}

function qs(params: Record<string, string | number | undefined>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `&${parts.join('&')}` : '';
}

export const site00ProductionApi = {
  dashboard: (period: AdminPeriod = '30d') =>
    productionFetch<AdminDashboardPayload>(`/api/admin/site00-production?action=dashboard&period=${encodeURIComponent(period)}`),

  identities: (params?: { search?: string }) =>
    productionFetch<{ items: AdminIdentity[]; total: number }>(
      `/api/admin/site00-production?action=identities${qs({ search: params?.search })}`,
    ),

  identity: (id: string) =>
    productionFetch(`/api/admin/site00-production?action=identity&id=${encodeURIComponent(id)}`),

  bldrIntakes: (params?: { buildClass?: string; status?: string }) =>
    productionFetch<{ items: AdminBldrIntake[]; total: number }>(
      `/api/admin/site00-production?action=bldr-intakes${qs({ buildClass: params?.buildClass, status: params?.status })}`,
    ),

  bldrIntake: (id: string) =>
    productionFetch(`/api/admin/site00-production?action=bldr-intake&id=${encodeURIComponent(id)}`),

  leads: (params?: { status?: string }) =>
    productionFetch<{ items: AdminLead[]; total: number }>(
      `/api/admin/site00-production?action=leads${qs({ status: params?.status })}`,
    ),

  lead: (id: string) => productionFetch(`/api/admin/site00-production?action=lead&id=${encodeURIComponent(id)}`),

  discovery: (status = 'UPCOMING') =>
    productionFetch<{ items: unknown[]; total: number }>(
      `/api/admin/site00-production?action=discovery&status=${encodeURIComponent(status)}`,
    ),

  discoveryDetail: (id: string) =>
    productionFetch(`/api/admin/site00-production?action=discovery-detail&id=${encodeURIComponent(id)}`),

  sites: (params?: { filter?: string }) =>
    productionFetch<{ items: AdminSite[]; total: number }>(
      `/api/admin/site00-production?action=sites${qs({ filter: params?.filter })}`,
    ),

  site: (id: string) => productionFetch(`/api/admin/site00-production?action=site&id=${encodeURIComponent(id)}`),

  ctrlRoom: () => productionFetch(`/api/admin/site00-production?action=ctrl-room`),

  finance: () => productionFetch<{ invoices: AdminInvoice[]; summary: Record<string, number> }>(`/api/admin/site00-production?action=finance`),

  invoice: (id: string) =>
    productionFetch(`/api/admin/site00-production?action=invoice&id=${encodeURIComponent(id)}`),

  team: () => productionFetch(`/api/admin/site00-production?action=team`),

  reportsPipeline: (period: AdminPeriod = 'all') =>
    productionFetch(`/api/admin/site00-production?action=reports-pipeline&period=${encodeURIComponent(period)}`),

  activity: (limit = 50) =>
    productionFetch<{ items: AdminActivityItem[]; total: number }>(
      `/api/admin/site00-production?action=activity&limit=${encodeURIComponent(String(limit))}`,
    ),

  search: (q: string) =>
    productionFetch<AdminSearchResults>(`/api/admin/site00-production?action=search&q=${encodeURIComponent(q)}`),

  addNote: (entityType: string, entityId: string, body: string) =>
    productionFetch('/api/admin/site00-production', {
      method: 'POST',
      body: { action: 'add-note', entityType, entityId, body },
    }),

  markIntakeReviewed: (intakeId: string) =>
    productionFetch('/api/admin/site00-production', {
      method: 'POST',
      body: { action: 'mark-intake-reviewed', intakeId },
    }),

  convertIntakeToProject: (intakeId: string) =>
    productionFetch<{ projectId?: string; created?: boolean }>('/api/admin/site00-production', {
      method: 'POST',
      body: { action: 'convert-intake-to-project', intakeId },
    }),

  studio: (projectId?: string) =>
    productionFetch<Site00StudioPayload>(
      `/api/admin/site00-production?action=studio${projectId ? `&projectId=${encodeURIComponent(projectId)}` : ''}`,
    ),

  approvals: (category = 'ALL') =>
    productionFetch<Site00ApprovalsPayload>(
      `/api/admin/site00-production?action=approvals&category=${encodeURIComponent(category)}`,
    ),

  projects: () => productionFetch<Site00ProjectsPayload>('/api/admin/site00-production?action=projects'),

  project: (projectId: string, section = 'overview') =>
    productionFetch<Site00ProjectWorkspacePayload>(
      `/api/admin/site00-production?action=project&projectId=${encodeURIComponent(projectId)}&section=${encodeURIComponent(section)}`,
    ),

  bootstrapDemo: () =>
    productionFetch<{ projectId?: string }>('/api/admin/site00-production', { method: 'POST', body: { action: 'bootstrap-demo' } }),

  generateBrief: (projectId: string, deliverableKey: string) =>
    productionFetch('/api/admin/site00-production', {
      method: 'POST',
      body: { action: 'generate-brief', projectId, deliverableKey },
    }),

  decideApproval: (approvalId: string, decision: string, notes?: string) =>
    productionFetch('/api/admin/site00-production', {
      method: 'POST',
      body: { action: 'decide-approval', approvalId, decision, notes },
    }),
};
