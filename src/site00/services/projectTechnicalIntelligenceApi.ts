import { apiFetch } from '../../utils/api';
import type { ProjectCodebaseIntelligence } from '../../../shared/site00-projects/technical/types.js';

export async function fetchProjectTechnicalIntelligence(
  projectId: string,
  options?: { sync?: boolean; viewMode?: 'FOUNDER' | 'CLIENT' },
): Promise<ProjectCodebaseIntelligence> {
  const params = new URLSearchParams({ projectId, action: options?.sync ? 'sync' : 'intelligence' });
  if (options?.viewMode) params.set('viewMode', options.viewMode);
  const res = await apiFetch(`/api/site00/project-technical-intelligence?${params}`);
  const data = (await res.json()) as { ok: boolean; intelligence?: ProjectCodebaseIntelligence; error?: { message: string } };
  if (!res.ok || !data.ok || !data.intelligence) {
    throw new Error(data.error?.message ?? 'TECHNICAL INTELLIGENCE UNAVAILABLE');
  }
  return data.intelligence;
}
