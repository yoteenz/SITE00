import { apiFetch } from '../../utils/api';
import type { Site00ProjectDetail, Site00ProjectsIndexPayload } from '../../../shared/site00-projects/types';
import type { CreativeDirectionPayload, CreativeDirectionDecisionInput } from '../components/evolve/creative-direction/CreativeDirectionExperience';

export type Site00ProjectsResponseCategory = 'json' | 'html' | 'empty' | 'malformed' | 'non_json';

export type Site00ProjectsApiDiagnostics = {
  status: number;
  contentType: string | null;
  responseCategory: Site00ProjectsResponseCategory;
  endpoint: string;
};

export class Site00ProjectsApiError extends Error {
  readonly status: number;
  readonly diagnostics: Site00ProjectsApiDiagnostics;

  constructor(message: string, diagnostics: Site00ProjectsApiDiagnostics) {
    super(message);
    this.name = 'Site00ProjectsApiError';
    this.status = diagnostics.status;
    this.diagnostics = diagnostics;
  }
}

function classifyResponse(raw: string, contentType: string | null): Site00ProjectsResponseCategory {
  const trimmed = raw.trim();
  if (!trimmed) return 'empty';
  if (trimmed.startsWith('<!') || trimmed.startsWith('<html') || trimmed.startsWith('<HTML')) return 'html';
  if (contentType && !contentType.toLowerCase().includes('json')) return 'non_json';
  return 'json';
}

/** Exported for contract tests — evaluates raw HTTP body before JSON parse */
export function evaluateProjectsApiResponse(input: {
  raw: string;
  contentType: string | null;
  status: number;
  endpoint: string;
}): { category: Site00ProjectsResponseCategory; diagnostics: Site00ProjectsApiDiagnostics } {
  const category = classifyResponse(input.raw, input.contentType);
  return {
    category,
    diagnostics: {
      status: input.status,
      contentType: input.contentType,
      responseCategory: category,
      endpoint: input.endpoint,
    },
  };
}

function developerDiagnostic(diagnostics: Site00ProjectsApiDiagnostics): string {
  return `[projects-api] ${diagnostics.endpoint} status=${diagnostics.status} type=${diagnostics.contentType ?? 'unknown'} category=${diagnostics.responseCategory}`;
}

async function projectsFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  const contentType = res.headers.get('content-type');
  const raw = await res.text();
  const endpoint = path;
  const responseCategory = classifyResponse(raw, contentType);
  const diagnostics: Site00ProjectsApiDiagnostics = {
    status: res.status,
    contentType,
    responseCategory,
    endpoint,
  };

  if (responseCategory === 'empty') {
    console.error(developerDiagnostic(diagnostics));
    throw new Site00ProjectsApiError('PROJECT INDEX UNAVAILABLE — EMPTY RESPONSE FROM LIVE PROJECT SERVICE.', diagnostics);
  }

  if (responseCategory === 'html' || responseCategory === 'non_json') {
    console.error(developerDiagnostic(diagnostics));
    throw new Site00ProjectsApiError(
      'PROJECT INDEX UNAVAILABLE — THE LIVE PROJECT SERVICE RETURNED AN INVALID RESPONSE.',
      diagnostics,
    );
  }

  let data: T & { ok?: boolean; error?: { message?: string; code?: string } | string };
  try {
    data = JSON.parse(raw) as T & { ok?: boolean; error?: { message?: string; code?: string } | string };
  } catch {
    console.error(developerDiagnostic({ ...diagnostics, responseCategory: 'malformed' }));
    throw new Site00ProjectsApiError('PROJECT INDEX UNAVAILABLE — INVALID JSON RESPONSE.', {
      ...diagnostics,
      responseCategory: 'malformed',
    });
  }

  if (!res.ok) {
    const message =
      typeof data.error === 'string'
        ? data.error
        : data.error?.message ?? data.error?.code ?? `Projects API ${res.status}`;
    console.error(developerDiagnostic(diagnostics), message);
    throw new Site00ProjectsApiError(message, diagnostics);
  }

  if (data.ok === false) {
    const message =
      typeof data.error === 'string'
        ? data.error
        : data.error?.message ?? data.error?.code ?? 'Project index unavailable';
    throw new Site00ProjectsApiError(message, diagnostics);
  }

  return data;
}

export const site00ProjectsApi = {
  index: () => projectsFetch<Site00ProjectsIndexPayload>('/api/site00/projects?action=index'),
  detail: (slug: string) =>
    projectsFetch<{ ok: true; project: Site00ProjectDetail; source: string }>(
      `/api/site00/projects?action=detail&slug=${encodeURIComponent(slug)}`,
    ),
  creativeDirection: (slug: string) =>
    projectsFetch<CreativeDirectionPayload>(`/api/site00/projects?action=creative_direction&slug=${encodeURIComponent(slug)}`),
  creativeDirectionDecision: (slug: string, input: CreativeDirectionDecisionInput) =>
    projectsFetch<{ ok: true; engagement: unknown; source: string }>('/api/site00/projects?action=creative_direction_decision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, ...input }),
    }),
  submitLoreCalibration: (slug: string, answers: Record<string, string | string[]>) =>
    projectsFetch<CreativeDirectionPayload>('/api/site00/projects?action=lore_calibration_submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, answers }),
    }),
  personalityReplayBootstrap: (slug: string) =>
    projectsFetch<{
      ok: true;
      replay: { replayId: string; status: string; rawPersonalityAnswers: Record<string, string | string[]> };
      resumeStepId: string;
    }>(`/api/site00/projects?action=personality_replay_bootstrap&slug=${encodeURIComponent(slug)}`),
  personalityReplayGet: (slug: string, replayId: string) =>
    projectsFetch<{ ok: true; replay: Record<string, unknown> }>(
      `/api/site00/projects?action=personality_replay_get&slug=${encodeURIComponent(slug)}&replayId=${encodeURIComponent(replayId)}`,
    ),
  personalityReplaySave: (
    slug: string,
    replayId: string,
    payload: { answers: Record<string, string | string[]>; completedSteps?: string[] },
  ) =>
    projectsFetch<{ ok: true; replay: { status: string } }>('/api/site00/projects?action=personality_replay_save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, replayId, ...payload }),
    }),
  personalityReplayComplete: (slug: string, replayId: string) =>
    projectsFetch<{ ok: true; replay: { status: string } }>('/api/site00/projects?action=personality_replay_complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, replayId }),
    }),
};
