import { apiFetch } from '../../utils/api';

export class ClientProductionApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ClientProductionApiError';
    this.status = status;
  }
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') ?? '';
  const raw = await res.text();

  if (!raw.trim()) {
    if (!res.ok) {
      throw new ClientProductionApiError(`Request failed (${res.status})`, res.status);
    }
    return {} as T;
  }

  const looksJson =
    contentType.includes('application/json') || contentType.includes('+json') || /^[\[{]/.test(raw.trim());

  if (!looksJson) {
    if (import.meta.env.DEV) {
      console.warn('[clientProductionApi] Non-JSON response', { status: res.status, contentType, preview: raw.slice(0, 120) });
    }
    throw new ClientProductionApiError(
      res.ok ? 'Unexpected response format' : `Service unavailable (${res.status})`,
      res.status,
    );
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new ClientProductionApiError('Invalid JSON response', res.status);
  }
}

async function clientProductionFetch<T>(path: string, init?: { method?: string; body?: Record<string, unknown> }): Promise<T> {
  const res = await apiFetch(path, init);
  const data = await parseJsonResponse<T & { error?: string }>(res);
  if (!res.ok) {
    throw new ClientProductionApiError(data.error ?? `Client production API ${res.status}`, res.status);
  }
  return data;
}

export type CtrlRoomSignalPayload = {
  id: string;
  project_name: string;
  signal_type: string;
  title: string;
  reason: string;
  owner: string;
  age_days: number;
  action_route: string;
  action_label: string;
};

export type CtrlRoomSitePayload = {
  id: string;
  name: string;
  domain: string | null;
  status: string | null;
  updated_at: string | null;
};

export type CtrlRoomClientPayload = {
  signals?: CtrlRoomSignalPayload[];
  projects?: Array<{ id: string; name: string; slug: string; client_email?: string }>;
  sites?: CtrlRoomSitePayload[];
  counts?: { properties: number; projects: number; domains: number };
};

export const site00ClientProductionApi = {
  provisioning: (projectSlug: string) =>
    clientProductionFetch(`/api/site00/client-production?action=provisioning&projectSlug=${encodeURIComponent(projectSlug)}`),
  ctrlRoom: () => clientProductionFetch<CtrlRoomClientPayload>('/api/site00/client-production?action=ctrl-room'),
  connectService: (projectId: string, providerKey: string, connectionState = 'CONNECTED') =>
    clientProductionFetch('/api/site00/client-production', {
      method: 'POST',
      body: { action: 'connect-service', projectId, providerKey, connectionState },
    }),
};
