/**
 * SITE 00 Admin — canonical Identity + Builder Intake Inbox API client.
 * Thin wrapper over api/admin/site00-intakes.ts (see intakesApi pattern in productionApi.ts).
 */
import { apiFetch } from '../../../utils/api';
import type { IntakeAuditEvent, IntakeDetail, IntakeSummary, IntakeType } from '../../../../shared/site00-intakes/types';

async function parseJson<T>(res: Response): Promise<T> {
  const raw = await res.text();
  if (!raw.trim()) return {} as T;
  return JSON.parse(raw) as T;
}

async function intakesFetch<T>(path: string, init?: { method?: string; body?: Record<string, unknown> }): Promise<T> {
  const res = await apiFetch(path, init);
  const data = await parseJson<T & { error?: string }>(res);
  if (!res.ok) throw new Error(data.error ?? `Admin intakes API ${res.status}`);
  return data;
}

function qs(params: Record<string, string | number | undefined>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `&${parts.join('&')}` : '';
}

export type AdminIntakeListParams = {
  intakeType?: IntakeType;
  status?: string;
  ownerKind?: 'GUEST' | 'AUTHENTICATED';
  search?: string;
  sort?: 'newest' | 'oldest' | 'recently_updated' | 'recently_submitted';
  limit?: number;
};

export const site00AdminIntakesApi = {
  list: (params?: AdminIntakeListParams) =>
    intakesFetch<{ intakes: IntakeSummary[] }>(
      `/api/admin/site00-intakes?action=list${qs({
        intakeType: params?.intakeType,
        status: params?.status,
        ownerKind: params?.ownerKind,
        search: params?.search,
        sort: params?.sort,
        limit: params?.limit,
      })}`,
    ),

  detail: (intakeType: IntakeType, id: string) =>
    intakesFetch<{ intake: IntakeDetail; events: IntakeAuditEvent[] }>(
      `/api/admin/site00-intakes?action=detail&intakeType=${encodeURIComponent(intakeType)}&id=${encodeURIComponent(id)}`,
    ),

  markInReview: (intakeType: IntakeType, id: string) =>
    intakesFetch<{ intake: IntakeDetail }>('/api/admin/site00-intakes', {
      method: 'POST',
      body: { action: 'mark-in-review', intakeType, id },
    }),

  archive: (intakeType: IntakeType, id: string) =>
    intakesFetch<{ intake: IntakeDetail }>('/api/admin/site00-intakes', {
      method: 'POST',
      body: { action: 'archive', intakeType, id },
    }),
};
