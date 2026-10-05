import { apiFetch } from '../../utils/api';
import type {
  Site00AccessCredentialPublicView,
  Site00AccessCredentialStatus,
  Site00AccessCredentialType,
} from '../config/access-credentials';

export type { Site00AccessCredentialPublicView };

export type Site00AccessCredentialAdmin = {
  id: string;
  credential_code: string;
  credential_type: Site00AccessCredentialType;
  status: Site00AccessCredentialStatus;
  issued_at: string | null;
  activated_at: string | null;
  first_scanned_at: string | null;
  last_scanned_at: string | null;
  scan_count: number;
  recipient_name: string | null;
  recipient_email: string | null;
  recipient_company: string | null;
  notes: string | null;
  assigned_user_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

async function parseJson<T>(res: Response): Promise<T> {
  const raw = await res.text();
  if (!raw.trim()) return {} as T;
  return JSON.parse(raw) as T;
}

async function accessFetch<T>(path: string, init?: { method?: string; body?: Record<string, unknown> }): Promise<T> {
  const res = await apiFetch(path, init);
  const data = await parseJson<T & { error?: string }>(res);
  if (!res.ok) throw new Error(data.error ?? `Access API ${res.status}`);
  return data;
}

export const site00AccessApi = {
  resolve: (code: string) =>
    accessFetch<{ view: Site00AccessCredentialPublicView }>(
      `/api/site00-access?action=resolve&code=${encodeURIComponent(code)}`,
    ),

  recordScan: (code: string, sessionId: string) =>
    accessFetch<{ ok: boolean; view: Site00AccessCredentialPublicView }>('/api/site00-access', {
      method: 'POST',
      body: { action: 'scan', code, sessionId },
    }),

  recordEnter: (code: string, sessionId: string) =>
    accessFetch<{ ok: boolean; view: Site00AccessCredentialPublicView }>('/api/site00-access', {
      method: 'POST',
      body: { action: 'enter', code, sessionId },
    }),

  associate: (code: string, sessionId: string) =>
    accessFetch<{ ok: boolean; reason?: string }>('/api/site00-access', {
      method: 'POST',
      body: { action: 'associate', code, sessionId },
    }),
};

export const site00AccessCredentialsAdminApi = {
  list: () =>
    accessFetch<{ items: Site00AccessCredentialAdmin[] }>('/api/admin/site00-access-credentials?action=list'),

  detail: (id: string) =>
    accessFetch<{ credential: Site00AccessCredentialAdmin; events: unknown[] }>(
      `/api/admin/site00-access-credentials?action=detail&id=${encodeURIComponent(id)}`,
    ),

  create: (body: {
    credentialType?: Site00AccessCredentialType;
    recipientName?: string;
    recipientEmail?: string;
    recipientCompany?: string;
    notes?: string;
    activate?: boolean;
  }) =>
    accessFetch<{ credential: Site00AccessCredentialAdmin }>('/api/admin/site00-access-credentials', {
      method: 'POST',
      body: { action: 'create', ...body },
    }),

  activate: (id: string) =>
    accessFetch<{ credential: Site00AccessCredentialAdmin }>('/api/admin/site00-access-credentials', {
      method: 'POST',
      body: { action: 'activate', id },
    }),

  revoke: (id: string) =>
    accessFetch<{ credential: Site00AccessCredentialAdmin }>('/api/admin/site00-access-credentials', {
      method: 'POST',
      body: { action: 'revoke', id },
    }),

  deactivate: (id: string) =>
    accessFetch<{ credential: Site00AccessCredentialAdmin }>('/api/admin/site00-access-credentials', {
      method: 'POST',
      body: { action: 'deactivate', id },
    }),
};
