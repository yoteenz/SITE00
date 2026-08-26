import { apiFetch } from '../../utils/api';
import type {
  ClientAppManifest,
  ClientAppProjectsPayload,
  ClientInboxThread,
  ClientLibraryCategory,
  ClientLibraryFile,
} from '../../../shared/site00-client-app/types.js';

async function parseJson<T>(res: Response): Promise<T> {
  const raw = await res.text();
  if (!raw.trim()) return {} as T;
  return JSON.parse(raw) as T;
}

async function clientAppFetch<T>(path: string, init?: { method?: string; body?: Record<string, unknown> }): Promise<T> {
  const res = await apiFetch(path, init);
  const data = await parseJson<T & { error?: string }>(res);
  if (!res.ok) throw new Error(data.error ?? `Client app API ${res.status}`);
  return data;
}

export const site00ClientAppApi = {
  manifest: (projectSlug: string) =>
    clientAppFetch<ClientAppManifest>(`/api/site00/client-app?action=manifest&projectSlug=${encodeURIComponent(projectSlug)}`),
  projects: (fixtureMode?: string) =>
    clientAppFetch<ClientAppProjectsPayload>(
      `/api/site00/client-app?action=projects${fixtureMode ? `&fixtureMode=${encodeURIComponent(fixtureMode)}` : ''}`,
    ),
  inbox: (projectSlug: string) =>
    clientAppFetch<{ threads: ClientInboxThread[] }>(
      `/api/site00/client-app?action=inbox&projectSlug=${encodeURIComponent(projectSlug)}`,
    ),
  library: (projectSlug: string, categoryId?: string) =>
    clientAppFetch<{ categories?: ClientLibraryCategory[]; files?: ClientLibraryFile[] }>(
      `/api/site00/client-app?action=library&projectSlug=${encodeURIComponent(projectSlug)}${categoryId ? `&categoryId=${encodeURIComponent(categoryId)}` : ''}`,
    ),
  activate: (projectSlug: string) =>
    clientAppFetch('/api/site00/client-app', { method: 'POST', body: { action: 'activate', projectSlug } }),
  opportunityInterest: (projectSlug: string, offer: string, signal: string) =>
    clientAppFetch('/api/site00/client-app', {
      method: 'POST',
      body: { action: 'opportunity-interest', projectSlug, offer, signal },
    }),
};
