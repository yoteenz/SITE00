import { apiFetch } from '../../utils/api';

async function parseJson<T>(res: Response): Promise<T> {
  const raw = await res.text();
  if (!raw.trim()) return {} as T;
  return JSON.parse(raw) as T;
}

async function clientProductionFetch<T>(path: string, init?: { method?: string; body?: Record<string, unknown> }): Promise<T> {
  const res = await apiFetch(path, init);
  const data = await parseJson<T & { error?: string }>(res);
  if (!res.ok) throw new Error(data.error ?? `Client production API ${res.status}`);
  return data;
}

export const site00ClientProductionApi = {
  provisioning: (projectSlug: string) =>
    clientProductionFetch(`/api/site00/client-production?action=provisioning&projectSlug=${encodeURIComponent(projectSlug)}`),
  ctrlRoom: () => clientProductionFetch('/api/site00/client-production?action=ctrl-room'),
  connectService: (projectId: string, providerKey: string, connectionState = 'CONNECTED') =>
    clientProductionFetch('/api/site00/client-production', {
      method: 'POST',
      body: { action: 'connect-service', projectId, providerKey, connectionState },
    }),
};
