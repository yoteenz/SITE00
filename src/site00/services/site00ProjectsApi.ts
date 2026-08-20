import { apiFetch } from '../../utils/api';
import type { Site00ProjectDetail, Site00ProjectsIndexPayload } from '../../../shared/site00-projects/types';
import type { CreativeDirectionPayload, CreativeDirectionDecisionInput } from '../components/evolve/creative-direction/CreativeDirectionExperience';

export class Site00ProjectsApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'Site00ProjectsApiError';
    this.status = status;
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const raw = await res.text();
  if (!raw.trim()) throw new Site00ProjectsApiError(`Request failed (${res.status})`, res.status);
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Site00ProjectsApiError('Invalid JSON response', res.status);
  }
}

async function projectsFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  const data = await parseJson<T & { error?: string }>(res);
  if (!res.ok) throw new Site00ProjectsApiError(data.error ?? `Projects API ${res.status}`, res.status);
  return data;
}

export const site00ProjectsApi = {
  index: () => projectsFetch<Site00ProjectsIndexPayload>('/api/site00/projects?action=index'),
  detail: (slug: string) =>
    projectsFetch<{ project: Site00ProjectDetail; source: string }>(`/api/site00/projects?action=detail&slug=${encodeURIComponent(slug)}`),
  creativeDirection: (slug: string) =>
    projectsFetch<CreativeDirectionPayload>(`/api/site00/projects?action=creative_direction&slug=${encodeURIComponent(slug)}`),
  creativeDirectionDecision: (slug: string, input: CreativeDirectionDecisionInput) =>
    projectsFetch<{ engagement: unknown; source: string }>('/api/site00/projects?action=creative_direction_decision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, ...input }),
    }),
};
