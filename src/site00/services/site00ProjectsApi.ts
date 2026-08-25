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
    const code = typeof data.error === 'object' && data.error?.code ? data.error.code : '';
    let message =
      typeof data.error === 'string'
        ? data.error
        : data.error?.message ?? data.error?.code ?? `Projects API ${res.status}`;
    if (res.status === 401 || code === 'UNAUTHORIZED') {
      message =
        'SESSION EXPIRED OR NOT SIGNED IN — open Ctrl Room, sign out, sign back in, then retry Projects.';
    }
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
  submitCreativeAppetite: (slug: string, answers: Record<string, string | string[]>) =>
    projectsFetch<CreativeDirectionPayload & { intelligenceInspector?: unknown }>(
      '/api/site00/projects?action=creative_appetite_submit',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, answers }),
      },
    ),
    personalityReplayBootstrap: (slug: string) =>
    projectsFetch<{
      ok: true;
      replay: {
        replayId: string;
        status: string;
        rawPersonalityAnswers: Record<string, string | string[]>;
        personalityCompletedSteps?: string[];
      };
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
    projectsFetch<{ ok: true; replay: Record<string, unknown> }>('/api/site00/projects?action=personality_replay_complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, replayId }),
    }),
  personalityReplayExecute: (slug: string, replayId: string) =>
    projectsFetch<{ ok: true; replay: Record<string, unknown> }>('/api/site00/projects?action=personality_replay_execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, replayId }),
    }),
  personalityReplayDiagnostic: (slug: string, replayId: string) =>
    projectsFetch<{ ok: true; diagnostic: Record<string, unknown> }>(
      `/api/site00/projects?action=personality_replay_diagnostic&slug=${encodeURIComponent(slug)}&replayId=${encodeURIComponent(replayId)}`,
    ),
  personalityReplaySixDirectionExecute: (slug: string, replayId: string) =>
    projectsFetch<{ ok: true; replay: Record<string, unknown> }>(
      '/api/site00/projects?action=personality_replay_six_direction_execute',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, replayId }),
      },
    ),
  personalityReplaySixDirectionJudgment: (
    slug: string,
    replayId: string,
    comparisonIndex: number,
    judgment: 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_NDXBOOK' | null,
  ) =>
    projectsFetch<{ ok: true; replay: Record<string, unknown> }>(
      '/api/site00/projects?action=personality_replay_six_direction_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, replayId, comparisonIndex, judgment }),
      },
    ),
  canonicalCreativeRangePreflight: (slug: string) =>
    projectsFetch<{ ok: true; preflight: Record<string, unknown> }>(
      `/api/site00/projects?action=canonical_creative_range_preflight&slug=${encodeURIComponent(slug)}`,
    ),
  canonicalCreativeRangeGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      `/api/site00/projects?action=canonical_creative_range_get&slug=${encodeURIComponent(slug)}`,
    ),
  canonicalCreativeRangeExecute: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      '/api/site00/projects?action=canonical_creative_range_execute',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  canonicalCreativeRangeJudgment: (
    slug: string,
    comparisonIndex: number,
    judgment: 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_NDXBOOK' | null,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=canonical_creative_range_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, comparisonIndex, judgment }),
      },
    ),
  canonicalCarouselExpansionPreflight: (slug: string) =>
    projectsFetch<{ ok: true; preflight: Record<string, unknown> }>(
      `/api/site00/projects?action=canonical_carousel_expansion_preflight&slug=${encodeURIComponent(slug)}`,
    ),
  canonicalCarouselExpansionGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      `/api/site00/projects?action=canonical_carousel_expansion_get&slug=${encodeURIComponent(slug)}`,
    ),
  canonicalCarouselExpansionExecute: (
    slug: string,
    mode: 'INITIALIZE' | 'NEXT_SLIDE' | 'REST_OF_CAROUSEL' | 'NEXT_CAROUSEL' | 'ALL_REMAINING',
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      '/api/site00/projects?action=canonical_carousel_expansion_execute',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, mode }),
      },
    ),
  canonicalCarouselExpansionSlideJudgment: (
    slug: string,
    comparisonIndex: number,
    slideNumber: number,
    judgment: 'LOVE_IT' | 'REVISE' | 'PROMISING_REFINE' | 'NOT_FOR_ME' | null,
  ) =>
    projectsFetch<{
      ok: true;
      run: Record<string, unknown>;
      lineage?: { message?: string; brandLineageMembership?: string; productionState?: string } | null;
    }>(
      '/api/site00/projects?action=canonical_carousel_expansion_slide_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, comparisonIndex, slideNumber, judgment }),
      },
    ),
  canonicalCarouselExpansionDirectionVerdict: (
    slug: string,
    comparisonIndex: number,
    verdict:
      | 'LOVE_THIS_DIRECTION'
      | 'KEEP_IN_CONTENTION'
      | 'BEAUTIFUL_BUT_TOO_NARROW'
      | 'TOO_REPETITIVE'
      | 'NOT_NDXBOOK'
      | null,
    note?: string | null,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=canonical_carousel_expansion_direction_verdict',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, comparisonIndex, verdict, note }),
      },
    ),
  experimentDGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      `/api/site00/projects?action=experiment_d_get&slug=${encodeURIComponent(slug)}`,
    ),
  experimentDFormTerritories: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_d_form_territories',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  experimentDExecuteHeroes: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_d_execute_heroes',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  experimentDHeroJudgment: (
    slug: string,
    comparisonIndex: number,
    judgment: 'LOVE_THE_CONCEPT' | 'PROMISING_REFINE' | 'TOO_CLOSE_TO_ANOTHER' | 'NOT_NDXBOOK' | null,
    tooCloseSibling?: string | null,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_d_hero_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, comparisonIndex, judgment, tooCloseSibling }),
      },
    ),
  experimentFGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      `/api/site00/projects?action=experiment_f_get&slug=${encodeURIComponent(slug)}`,
    ),
  experimentFPrepareSnapshot: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_f_prepare_snapshot',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  experimentFFormConcepts: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_f_form_concepts',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  experimentFConceptJudgment: (
    slug: string,
    conceptId: string,
    judgment: 'LOVE_THE_CONCEPT' | 'PROMISING_DEVELOP' | 'TOO_CLOSE' | 'NOT_NDXBOOK' | 'REFORM_SET' | null,
    note?: string | null,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_f_concept_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, conceptId, judgment, note }),
      },
    ),
  experimentFReformSet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_f_reform_set',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  experimentGGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      `/api/site00/projects?action=experiment_g_get&slug=${encodeURIComponent(slug)}`,
    ),
  experimentGPrepareSnapshot: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_g_prepare_snapshot',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  experimentGFormConcepts: (slug: string, options?: { forceRetry?: boolean }) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_g_form_concepts',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, forceRetry: options?.forceRetry === true }),
      },
    ),
  experimentGConceptJudgment: (
    slug: string,
    conceptId: string,
    judgment:
      | 'LOVE_THE_CONCEPT'
      | 'PROMISING_DEVELOP'
      | 'TOO_CLOSE_TO_ANOTHER'
      | 'TOO_CONTENT_SPECIFIC'
      | 'NOT_NDXBOOK'
      | 'REFORM_SET'
      | null,
    note?: string | null,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_g_concept_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, conceptId, judgment, note }),
      },
    ),
  experimentGReformSet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_g_reform_set',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  experimentHGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      `/api/site00/projects?action=experiment_h_get&slug=${encodeURIComponent(slug)}`,
    ),
  experimentHPrepareSnapshot: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_h_prepare_snapshot',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  experimentHFormCharacters: (slug: string, options?: { forceRetry?: boolean }) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_h_form_characters',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, forceRetry: options?.forceRetry === true }),
      },
    ),
  experimentHCharacterJudgment: (
    slug: string,
    characterId: string,
    judgment:
      | 'LOVE_THE_CHARACTER'
      | 'PROMISING_DEVELOP'
      | 'TOO_GENERIC'
      | 'TOO_PERFORMATIVE'
      | 'TOO_INTERNET'
      | 'TOO_ACADEMIC'
      | 'TOO_STYLE_DEPENDENT'
      | 'TOO_CLOSE_TO_ANOTHER'
      | 'CULTURALLY_HOLLOW'
      | 'NOT_NDXBOOK'
      | 'REFORM_SET'
      | null,
    note?: string | null,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_h_character_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, characterId, judgment, note }),
      },
    ),
  experimentHReformSet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_h_reform_set',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  experimentHDevelopCharacter: (
    slug: string,
    territoryId: string,
    founderDelta?: { preserve?: string[]; develop?: string[]; avoid?: string[] },
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; development: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_h_develop_character',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, territoryId, founderDelta }),
      },
    ),
  experimentHCompileSystem: (slug: string, characterId: string, developmentId?: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; system: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_h_compile_system',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, characterId, developmentId }),
      },
    ),
  experimentGDirectionGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      `/api/site00/projects?action=experiment_g_direction_get&slug=${encodeURIComponent(slug)}`,
    ),
  experimentGDirectionPrepare: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; costPreview: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_g_direction_prepare',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  experimentGDirectionForm: (slug: string, options?: { forceRetry?: boolean }) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; costPreview: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_g_direction_form',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, forceRetry: options?.forceRetry === true }),
      },
    ),
  experimentGDirectionJudgment: (
    slug: string,
    directionId: string,
    judgment:
      | 'LOVE_THE_DIRECTION'
      | 'PROMISING_DEVELOP'
      | 'TOO_CLOSE_TO_SIBLING'
      | 'DRIFTS_FROM_CONCEPT'
      | 'TOO_CONTENT_SPECIFIC'
      | 'TOO_FORMAT_SPECIFIC'
      | 'TOO_STYLE_DEPENDENT'
      | 'NOT_NDXBOOK'
      | null,
    note?: string | null,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_g_direction_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, directionId, judgment, note }),
      },
    ),
  experimentGDirectionRevise: (
    slug: string,
    directionId: string,
    revision: { preserve: string[]; change: string[]; doNotBecome: string[] },
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_g_direction_revise',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, directionId, ...revision }),
      },
    ),
  experimentGVisualGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      `/api/site00/projects?action=experiment_g_visual_get&slug=${encodeURIComponent(slug)}`,
    ),
  experimentGVisualFinalist: (slug: string, directionId: string, selected: boolean) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_g_visual_finalist',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, directionId, selected }),
      },
    ),
  experimentGVisualFormulate: (slug: string, options?: { forceRetry?: boolean }) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_g_visual_formulate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, forceRetry: options?.forceRetry === true }),
      },
    ),
  experimentGVisualGenerate: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; costPreview: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_g_visual_generate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  experimentGVisualJudgment: (
    slug: string,
    params: {
      expressionId?: string;
      benchmarkId?: string;
      judgment:
        | 'LOVE_THIS_EXPRESSION'
        | 'PROMISING_REVISE'
        | 'NOT_THIS_EXPRESSION'
        | 'MISREPRESENTS_DIRECTION'
        | 'TOO_GENERIC'
        | 'TOO_LITERAL'
        | 'TOO_STYLE_DEPENDENT'
        | 'LOVE_THIS_DIRECTION'
        | 'NOT_THIS_DIRECTION'
        | 'MISREPRESENTS_THE_DIRECTION'
        | 'VISUAL_DOES_NOT_HELP_ME_JUDGE'
        | null;
      note?: string | null;
    },
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_g_visual_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...params }),
      },
    ),
  experimentGVisualRevise: (
    slug: string,
    params: {
      expressionId?: string;
      benchmarkId?: string;
      preserve: string[];
      change: string[];
      doNotBecome: string[];
    },
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_g_visual_revise',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...params }),
      },
    ),
  experimentGVisualWinner: (slug: string, params: { expressionId?: string; benchmarkId?: string }) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_g_visual_winner',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...params }),
      },
    ),
  experimentEGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      `/api/site00/projects?action=experiment_e_get&slug=${encodeURIComponent(slug)}`,
    ),
  experimentESelectTerritory: (slug: string, params: { directionName?: string; territoryId?: string }) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_e_select_territory',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...params }),
      },
    ),
  experimentEFormConcepts: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_e_form_concepts',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  experimentEGenerateVisuals: (
    slug: string,
    params: { conceptIndex?: number; allConcepts?: boolean },
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; costPreview?: number }>(
      '/api/site00/projects?action=experiment_e_generate_visuals',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...params }),
      },
    ),
  experimentEConceptJudgment: (
    slug: string,
    conceptIndex: number,
    judgment:
      | 'LOVE_THE_EXPERIENCE'
      | 'PROMISING_EXPLORE'
      | 'NOT_FOR_THIS_PROJECT'
      | 'TOO_TEMPLATE_LIKE'
      | 'TOO_CLOSE_TO_ANOTHER'
      | null,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_e_concept_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, conceptIndex, judgment }),
      },
    ),
  experimentECompileContract: (slug: string, conceptIndex: number) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_e_compile_contract',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, conceptIndex }),
      },
    ),
  experimentECompileAssetDirection: (slug: string, conceptIndex: number) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_e_compile_asset_direction',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, conceptIndex }),
      },
    ),
  experimentECompileAssetManifest: (slug: string, conceptIndex: number) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_e_compile_asset_manifest',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, conceptIndex }),
      },
    ),
  experimentEGenerateAssetVisuals: (
    slug: string,
    params: { conceptIndex: number; action?: string; assetFamily?: string; requirementIds?: string[] },
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_e_generate_asset_visuals',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...params }),
      },
    ),
  experimentEPromoteAsset: (slug: string, assetId: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_e_promote_asset',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, assetId }),
      },
    ),
  projectWorkspaceHeroGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      `/api/site00/projects?action=project_workspace_hero_get&slug=${encodeURIComponent(slug)}`,
    ),
  projectWorkspaceCompileHeroSubset: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=project_workspace_compile_hero_subset',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  projectWorkspacePrepareHero: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=project_workspace_prepare_hero',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  projectWorkspaceGenerateHero: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=project_workspace_generate_hero',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  projectWorkspaceComposeHero: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=project_workspace_compose_hero',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  projectWorkspaceHeroJudgment: (
    slug: string,
    judgment: 'LOVE_THE_DIRECTION' | 'PROMISING_REVISE' | 'NOT_THE_DIRECTION' | null,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=project_workspace_hero_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, judgment }),
      },
    ),
  visualDevelopmentGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      `/api/site00/projects?action=visual_development_get&slug=${encodeURIComponent(slug)}`,
    ),
  visualDevelopmentGenerate: (
    slug: string,
    proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=visual_development_generate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, proofId }),
      },
    ),
  visualDevelopmentGenerateAssets: (
    slug: string,
    proofId: 'SITE00_PROJECTS_INDEX',
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=visual_development_generate_assets',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, proofId }),
      },
    ),
  visualDevelopmentPrepareInterface: (
    slug: string,
    proofId: 'SITE00_PROJECTS_INDEX',
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=visual_development_prepare_interface',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, proofId }),
      },
    ),
  visualDevelopmentJudgment: (
    slug: string,
    proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
    judgment: 'LOVE_THE_DIRECTION' | 'PROMISING_REVISE' | 'NOT_THE_DIRECTION',
    revisionNote?: string | null,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=visual_development_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, proofId, judgment, revisionNote }),
      },
    ),
  visualDevelopmentPrepareImplementation: (
    slug: string,
    proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=visual_development_prepare_implementation',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, proofId }),
      },
    ),
  visualDevelopmentOrchestrate: (
    slug: string,
    proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; orchestrationPackageId: string }>(
      '/api/site00/projects?action=visual_development_orchestrate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, proofId }),
      },
    ),
  visualDevelopmentRefreshReferences: (
    slug: string,
    proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=visual_development_refresh_references',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, proofId }),
      },
    ),
  visualDevelopmentCompileReferences: (
    slug: string,
    proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=visual_development_compile_references',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, proofId }),
      },
    ),
  visualDevelopmentGenerateReferenceConditioned: (
    slug: string,
    proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=visual_development_generate_reference_conditioned',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, proofId }),
      },
    ),
  visualDevelopmentExcludeReference: (
    slug: string,
    proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
    referenceId: string,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=visual_development_exclude_reference',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, proofId, referenceId }),
      },
    ),
  creativeLineageForensicAudit: (slug: string) =>
    projectsFetch<{ ok: true; report: Record<string, unknown> }>(
      `/api/site00/projects?action=creative_lineage_forensic_audit&slug=${encodeURIComponent(slug)}`,
    ),
  creativeLineageNormalize: (slug: string) =>
    projectsFetch<{ ok: true; report: Record<string, unknown>; normalized: Record<string, unknown> }>(
      '/api/site00/projects?action=creative_lineage_normalize',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  creativeLineageLibrary: (slug: string, section = 'ALL') =>
    projectsFetch<{ ok: true; library: Record<string, unknown> }>(
      `/api/site00/projects?action=creative_lineage_library&slug=${encodeURIComponent(slug)}&section=${encodeURIComponent(section)}`,
    ),
  creativeLineageAssetUpdate: (
    slug: string,
    assetId: string,
    updates: { productionState?: string; reuseState?: string; reviewState?: string },
  ) =>
    projectsFetch<{ ok: true; asset: Record<string, unknown> }>(
      '/api/site00/projects?action=creative_lineage_asset_update',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, assetId, ...updates }),
      },
    ),
  creativeLineageSalvageAction: (
    slug: string,
    params: {
      winningDirectionId: string;
      losingDirectionId: string;
      itemId: string;
      action: string;
    },
  ) =>
    projectsFetch<{ ok: true; review: Record<string, unknown> }>(
      '/api/site00/projects?action=creative_lineage_salvage_action',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...params }),
      },
    ),
  founderCreativeJudgmentRecord: (
    slug: string,
    params: {
      assetId: string;
      founderAction: 'LOVE_IT' | 'REVISE' | 'NOT_FOR_ME' | 'PROMISING_REFINE';
      judgmentReason?: string | null;
      carouselRunGenerating?: boolean;
    },
  ) =>
    projectsFetch<{ ok: true; asset: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_creative_judgment_record',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...params }),
      },
    ),
  founderRevisionSpecCreate: (
    slug: string,
    params: {
      parentAssetId: string;
      founderOriginalNote?: string;
      categoryNotes?: Record<string, string>;
      lockedElements?: string[];
      mutableElements?: string[];
      severity?: string;
      branchId?: string | null;
    },
  ) =>
    projectsFetch<{ ok: true; spec: import('../../../shared/site00-brand-lore/creativeLineage/revisionTypes').CreativeRevisionSpec }>(
      '/api/site00/projects?action=founder_revision_spec_create',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...params }),
      },
    ),
  founderRevisionSpecUpdate: (
    slug: string,
    params: {
      revisionId: string;
      founderOriginalNote?: string;
      categoryNotes?: Record<string, string>;
      lockedElements?: string[];
      mutableElements?: string[];
      severity?: string;
      status?: string;
    },
  ) =>
    projectsFetch<{ ok: true; spec: import('../../../shared/site00-brand-lore/creativeLineage/revisionTypes').CreativeRevisionSpec }>(
      '/api/site00/projects?action=founder_revision_spec_update',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...params }),
      },
    ),
  founderRevisionSpecCompile: (slug: string, revisionId: string) =>
    projectsFetch<{
      ok: true;
      spec: import('../../../shared/site00-brand-lore/creativeLineage/revisionTypes').CreativeRevisionSpec;
      brief: import('../../../shared/site00-brand-lore/creativeLineage/revisionTypes').RevisionGenerationBrief;
      surgicality: { result: string; passed: boolean };
      contamination: { result: string; passed: boolean };
      generationGate: { approved: boolean; gateReason: string };
    }>('/api/site00/projects?action=founder_revision_spec_compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, revisionId }),
    }),
  founderRevisionHistory: (slug: string, assetId: string) =>
    projectsFetch<{
      ok: true;
      history: {
        rootAssetId: string;
        revisions: import('../../../shared/site00-brand-lore/creativeLineage/revisionTypes').CreativeRevisionSpec[];
        branches: import('../../../shared/site00-brand-lore/creativeLineage/revisionTypes').RevisionBranch[];
      };
    }>(
      `/api/site00/projects?action=founder_revision_history&slug=${encodeURIComponent(slug)}&assetId=${encodeURIComponent(assetId)}`,
    ),
  founderRevisionSpecApprove: (slug: string, revisionId: string) =>
    projectsFetch<{ ok: true; spec: import('../../../shared/site00-brand-lore/creativeLineage/revisionTypes').CreativeRevisionSpec }>(
      '/api/site00/projects?action=founder_revision_spec_approve',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, revisionId }),
      },
    ),
  founderRevisionGenerate: (slug: string, revisionId: string, technicalRetry?: boolean) =>
    projectsFetch<{
      ok: true;
      result: {
        allowed: boolean;
        reason?: string;
        spec?: import('../../../shared/site00-brand-lore/creativeLineage/revisionTypes').CreativeRevisionSpec;
        child?: Record<string, unknown>;
        diff?: import('../../../shared/site00-brand-lore/creativeLineage/revisionTypes').CreativeRevisionDiff;
        receipt?: import('../../../shared/site00-brand-lore/creativeLineage/revisionTypes').RevisionGenerationReceipt;
      };
    }>('/api/site00/projects?action=founder_revision_generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, revisionId, technicalRetry: technicalRetry === true }),
    }),
  founderRevisionComparison: (slug: string, revisionId: string) =>
    projectsFetch<{
      ok: true;
      comparison: import('../../../shared/site00-brand-lore/creativeLineage/revisionTypes').RevisionComparisonState;
    }>(
      `/api/site00/projects?action=founder_revision_comparison&slug=${encodeURIComponent(slug)}&revisionId=${encodeURIComponent(revisionId)}`,
    ),
  founderRevisionPreferredVersion: (slug: string, rootAssetId: string, preferredAssetId: string) =>
    projectsFetch<{ ok: true; asset: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_revision_preferred_version',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, rootAssetId, preferredAssetId }),
      },
    ),
  founderJudgmentForensicAudit: (slug: string) =>
    projectsFetch<{ ok: true; report: Record<string, unknown> }>(
      `/api/site00/projects?action=founder_judgment_forensic_audit&slug=${encodeURIComponent(slug)}`,
    ),
  creativeLineageLaunchSeedSelect: (slug: string, assetId: string) =>
    projectsFetch<{ ok: true; asset: Record<string, unknown>; launchSeedSet: Record<string, unknown> }>(
      '/api/site00/projects?action=creative_lineage_launch_seed_select',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, assetId }),
      },
    ),
  creativeLineageLaunchSeedReconcile: (slug: string) =>
    projectsFetch<{ ok: true; launchSeedSet: Record<string, unknown> | null; reviewRequiredCount: number }>(
      '/api/site00/projects?action=creative_lineage_launch_seed_reconcile',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  projectIntelligenceManifestGet: (slug: string) =>
    projectsFetch<{
      ok: true;
      manifest: Record<string, unknown> | null;
      readiness: string;
      formationGate: { allowed: boolean; reason: string | null };
      brandCharacterSummary?: { state: string; questionCount: number; label: string } | null;
    }>(`/api/site00/projects?action=project_intelligence_manifest_get&slug=${encodeURIComponent(slug)}`),
  experimentHReadinessGet: (slug: string) =>
    projectsFetch<{ ok: true; record: Record<string, unknown> | null }>(
      `/api/site00/projects?action=experiment_h_readiness_get&slug=${encodeURIComponent(slug)}`,
    ),
  experimentHReadinessEvaluate: (slug: string) =>
    projectsFetch<{ ok: true; record: Record<string, unknown>; retrospective: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_h_readiness_evaluate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  experimentHDeepeningGet: (slug: string) =>
    projectsFetch<{
      ok: true;
      module: Record<string, unknown> | null;
      evaluation: Record<string, unknown> | null;
    }>(`/api/site00/projects?action=experiment_h_deepening_get&slug=${encodeURIComponent(slug)}`),
  experimentHDeepeningAnswer: (slug: string, questionId: string, rawAnswer: string) =>
    projectsFetch<{ ok: true; record: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_h_deepening_answer',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, questionId, rawAnswer }),
      },
    ),
  experimentHReadinessOverride: (
    slug: string,
    overrideReason: string,
    missingDomains: string[],
  ) =>
    projectsFetch<{ ok: true; record: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_h_readiness_override',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, overrideReason, missingDomains }),
      },
    ),
  experimentHSynthesisGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      `/api/site00/projects?action=experiment_h_synthesis_get&slug=${encodeURIComponent(slug)}`,
    ),
  experimentHSynthesisRun: (slug: string, options?: { forceRetry?: boolean }) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_h_synthesis_run',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, forceRetry: options?.forceRetry === true }),
      },
    ),
  experimentHSynthesisJudgment: (slug: string, judgment: string, note?: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_h_synthesis_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, judgment, note }),
      },
    ),
  experimentHSynthesisCompileSystem: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_h_synthesis_compile_system',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  experimentHArtifactProofsFormulate: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_h_artifact_proofs_formulate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  experimentHArtifactProofGenerate: (slug: string, proofId: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=experiment_h_artifact_proof_generate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, proofId }),
      },
    ),
  marketingExpressionGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      `/api/site00/projects?action=marketing_expression_get&slug=${encodeURIComponent(slug)}`,
    ),
  marketingExpressionPrepare: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_prepare',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  marketingExpressionCompile: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_compile',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  marketingExpressionExperiment01Formulate: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_formulate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  marketingExpressionExperiment01Generate: (slug: string, artifactId: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_generate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, artifactId }),
      },
    ),
  marketingExpressionExperiment01GenerateAll: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_generate_all',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  marketingExpressionExperiment01ArtifactJudgment: (slug: string, artifactId: string, judgment: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_artifact_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, artifactId, judgment }),
      },
    ),
  marketingExpressionExperiment01SetJudgment: (slug: string, judgment: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_set_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, judgment }),
      },
    ),
  marketingExpressionExperiment01V2Formulate: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v2_formulate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  marketingExpressionExperiment01V2Generate: (slug: string, artifactId: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v2_generate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, artifactId }),
      },
    ),
  marketingExpressionExperiment01V2GenerateAll: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v2_generate_all',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  marketingExpressionExperiment01V2ArtifactJudgment: (slug: string, artifactId: string, judgment: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v2_artifact_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, artifactId, judgment }),
      },
    ),
  marketingExpressionExperiment01V21Formulate: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v21_formulate',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  marketingExpressionExperiment01V21Generate: (slug: string, artifactId: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v21_generate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, artifactId }),
      },
    ),
  marketingExpressionExperiment01V21GenerateAll: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v21_generate_all',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  marketingExpressionExperiment01V21ArtifactJudgment: (slug: string, artifactId: string, judgment: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v21_artifact_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, artifactId, judgment }),
      },
    ),
  marketingExpressionExperiment01V22Formulate: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v22_formulate',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  marketingExpressionExperiment01V22Generate: (slug: string, artifactId: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v22_generate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, artifactId }),
      },
    ),
  marketingExpressionExperiment01V22GenerateAll: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v22_generate_all',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  marketingExpressionExperiment01V22ArtifactJudgment: (slug: string, artifactId: string, judgment: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v22_artifact_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, artifactId, judgment }),
      },
    ),
  marketingExpressionExperiment01V23Formulate: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v23_formulate',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  marketingExpressionExperiment01V23Generate: (slug: string, artifactId: string, mode?: 'REGENERATE_CURRENT' | 'REPLAY_GENERATION') =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v23_generate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, artifactId, mode: mode ?? 'REGENERATE_CURRENT' }),
      },
    ),
  marketingExpressionExperiment01V23Replay: (slug: string, artifactId: string, replaySnapshotId?: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v23_replay',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, artifactId, replaySnapshotId }),
      },
    ),
  marketingExpressionExperiment01V23SelectAsset: (slug: string, artifactId: string, selectedGenerationAssetId: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v23_select_asset',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, artifactId, selectedGenerationAssetId }),
      },
    ),
  marketingExpressionExperiment01V23GenerateAll: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v23_generate_all',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  marketingExpressionExperiment01V23RegenerateAll: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v23_regenerate_all',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      },
    ),
  marketingExpressionExperiment01V23ArtifactJudgment: (slug: string, artifactId: string, judgment: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v23_artifact_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, artifactId, judgment }),
      },
    ),
  marketingExpressionExperiment01V23FounderRevision: (
    slug: string,
    artifactId: string,
    judgment: string,
    founderNote: string,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=marketing_expression_experiment_01_v23_founder_revision',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, artifactId, judgment, founderNote }),
      },
    ),
  contentOperationsGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      `/api/site00/projects?action=content_operations_get&slug=${encodeURIComponent(slug)}`,
    ),
  contentOperationsPrepare: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=content_operations_prepare',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  contentOperationsCompile: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=content_operations_compile',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  contentOperationsDiscoverOpportunities: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=content_operations_discover_opportunities',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  contentOperationsProposeSlate: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=content_operations_propose_slate',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  contentOperationsApproveSlate: (slug: string, judgment?: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=content_operations_approve_slate',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, judgment }) },
    ),
  contentOperationsPackageJudgment: (slug: string, packageId: string, judgment: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=content_operations_package_judgment',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, packageId, judgment }) },
    ),
  contentOperationsApprovePackage: (slug: string, packageId: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=content_operations_approve_package',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, packageId }) },
    ),
  contentOperationsRecordPerformance: (slug: string, packageId: string, metrics?: Record<string, number | null>) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=content_operations_record_performance',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, packageId, metrics }) },
    ),
  contentOperationsAcceptLearning: (slug: string, learningId: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=content_operations_accept_learning',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, learningId }) },
    ),
  campaignProductionGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      `/api/site00/projects?action=campaign_production_get&slug=${encodeURIComponent(slug)}`,
    ),
  campaignProductionInitialize: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=campaign_production_initialize',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  campaignProductionLockRound01: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=campaign_production_lock_round_01',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  campaignProductionFormulateRound02: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=campaign_production_formulate_round_02',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  campaignProductionAssetJudgment: (slug: string, assetId: string, judgment: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=campaign_production_asset_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, assetId, judgment }),
      },
    ),
  campaignProductionSynthesizeCaptions: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=campaign_production_synthesize_captions',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  campaignProductionCaptionJudgment: (slug: string, contentPieceId: string, judgment: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=campaign_production_caption_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, contentPieceId, judgment }),
      },
    ),
  founderCreativeIngestionGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; ingestion: Record<string, unknown> | null }>(
      `/api/site00/projects?action=founder_creative_ingestion_get&slug=${encodeURIComponent(slug)}`,
    ),
  founderCreativeIngestionInitializeRow01: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; ingestion: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_creative_ingestion_initialize_row01',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  founderCreativeIngestionDecomposeAll: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; ingestion: Record<string, unknown>; background?: boolean }>(
      '/api/site00/projects?action=founder_creative_ingestion_decompose_all',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  founderCreativeIngestionDecompose: (slug: string, sequenceId: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; ingestion: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_creative_ingestion_decompose',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, sequenceId }) },
    ),
  founderCreativeIngestionPhotoMode: (slug: string, slideId: string, mode: string, assetId?: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; ingestion: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_creative_ingestion_photo_mode',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, slideId, mode, assetId }),
      },
    ),
  founderCreativeIngestionEditPrompt: (slug: string, slideId: string, prompt: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; ingestion: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_creative_ingestion_edit_prompt',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, slideId, prompt }),
      },
    ),
  founderCreativeIngestionEstimate: (slug: string, slideId: string) =>
    projectsFetch<{ ok: true; estimate: Record<string, unknown> }>(
      `/api/site00/projects?action=founder_creative_ingestion_estimate&slug=${encodeURIComponent(slug)}&slideId=${encodeURIComponent(slideId)}`,
    ),
  founderCreativeIngestionGeneratePhoto: (slug: string, slideId: string, dispatchFal = true) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; ingestion: Record<string, unknown>; background?: boolean }>(
      '/api/site00/projects?action=founder_creative_ingestion_generate_photo',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, slideId, dispatchFal }),
      },
    ),
  founderCreativeIngestionReplacePhoto: (slug: string, slideId: string, assetId: string, previewUrl?: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; ingestion: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_creative_ingestion_replace_photo',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, slideId, assetId, previewUrl }),
      },
    ),
  founderCreativeIngestionSlideJudgment: (slug: string, slideId: string, judgment: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; ingestion: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_creative_ingestion_slide_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, slideId, judgment }),
      },
    ),
  founderCreativeIngestionSequenceReview: (slug: string, sequenceId: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; ingestion: Record<string, unknown>; report: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_creative_ingestion_sequence_review',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, sequenceId }),
      },
    ),
  founderCreativeIngestionRegisterCampaign: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; ingestion: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_creative_ingestion_register_campaign',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  founderCreativeIngestionReplaceReference: (
    slug: string,
    sequenceId: string,
    previewUrl: string | null,
    notes?: string,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; ingestion: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_creative_ingestion_replace_reference',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, sequenceId, previewUrl, notes }),
      },
    ),
  founderCreativeIngestionUploadReference: (
    slug: string,
    sequenceId: string,
    imageData: string,
    notes?: string,
  ) =>
    projectsFetch<{
      ok: true;
      run: Record<string, unknown>;
      ingestion: Record<string, unknown>;
      previewUrl: string;
      storagePath: string;
    }>('/api/site00/projects?action=founder_creative_ingestion_upload_reference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, sequenceId, imageData, notes }),
    }),
  founderCreativeIngestionRedecomposeDraft: (slug: string, sequenceId: string) =>
    projectsFetch<{
      ok: true;
      run: Record<string, unknown>;
      ingestion: Record<string, unknown>;
      diff: Record<string, unknown> | null;
      qaReport: Record<string, unknown> | null;
    }>('/api/site00/projects?action=founder_creative_ingestion_redecompose_draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, sequenceId }),
    }),
  founderCreativeIngestionPromoteReference: (slug: string, sequenceId: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; ingestion: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_creative_ingestion_promote_reference',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, sequenceId }) },
    ),
  founderCreativeIngestionReplaceSlideReference: (
    slug: string,
    sequenceId: string,
    slideNumber: number,
    previewUrl: string | null,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; ingestion: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_creative_ingestion_replace_slide_reference',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, sequenceId, slideNumber, previewUrl }),
      },
    ),
  founderCreativeIngestionBulkReplaceReferences: (
    slug: string,
    uploads: Array<{ sequenceId: string; previewUrl: string | null; notes?: string }>,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; ingestion: Record<string, unknown>; diffs: Record<string, unknown>[] }>(
      '/api/site00/projects?action=founder_creative_ingestion_bulk_replace_references',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, uploads }),
      },
    ),
  founderCreativeIngestionReferenceComparison: (slug: string, sequenceId: string) =>
    projectsFetch<{ ok: true; comparison: Record<string, unknown> }>(
      `/api/site00/projects?action=founder_creative_ingestion_reference_comparison&slug=${encodeURIComponent(slug)}&sequenceId=${encodeURIComponent(sequenceId)}`,
    ),
  filmProductionGet: (slug: string) =>
    projectsFetch<{ ok: true; state: Record<string, unknown> }>(
      `/api/site00/projects?action=film_production_get&slug=${encodeURIComponent(slug)}`,
    ),
  filmProductionInitializePilots: (slug: string) =>
    projectsFetch<{ ok: true; state: Record<string, unknown> }>(
      '/api/site00/projects?action=film_production_initialize_pilots',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  filmProductionCompilePlan: (slug: string, filmId: string) =>
    projectsFetch<{ ok: true; state: Record<string, unknown>; film: Record<string, unknown>; plan: Record<string, unknown> }>(
      `/api/site00/projects?action=film_production_compile_plan&slug=${encodeURIComponent(slug)}&filmId=${encodeURIComponent(filmId)}`,
    ),
  filmProductionApprovePlan: (slug: string, filmId: string) =>
    projectsFetch<{ ok: true; state: Record<string, unknown>; film: Record<string, unknown> }>(
      '/api/site00/projects?action=film_production_approve_plan',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, filmId }) },
    ),
  filmProductionTriggerGeneration: (slug: string, filmId: string) =>
    projectsFetch<{ ok: true; state: Record<string, unknown>; film: Record<string, unknown> }>(
      '/api/site00/projects?action=film_production_trigger_generation',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, filmId }) },
    ),
  filmProductionDailiesJudgment: (slug: string, filmId: string, entryId: string, action: string, note?: string) =>
    projectsFetch<{ ok: true; state: Record<string, unknown>; film: Record<string, unknown> }>(
      '/api/site00/projects?action=film_production_dailies_judgment',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, filmId, entryId, action, note }) },
    ),
  filmProductionRoughCutJudgment: (slug: string, filmId: string, action: string, note?: string) =>
    projectsFetch<{ ok: true; state: Record<string, unknown>; film: Record<string, unknown> }>(
      '/api/site00/projects?action=film_production_rough_cut_judgment',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, filmId, action, note }) },
    ),
  filmProductionRegisterCampaign: (slug: string) =>
    projectsFetch<{ ok: true; state: Record<string, unknown>; run: Record<string, unknown> | null }>(
      '/api/site00/projects?action=film_production_register_campaign',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  dailyPublishingGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      `/api/site00/projects?action=daily_publishing_get&slug=${encodeURIComponent(slug)}`,
    ),
  cinematicRealismLabGet: (slug: string) =>
    projectsFetch<{ ok: true; state: Record<string, unknown> }>(
      `/api/site00/projects?action=cinematic_realism_lab_get&slug=${encodeURIComponent(slug)}`,
    ),
  cinematicRealismLabInitializePilot: (slug: string) =>
    projectsFetch<{ ok: true; state: Record<string, unknown> }>(
      '/api/site00/projects?action=cinematic_realism_lab_initialize_pilot',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  cinematicRealismLabQueueLanes: (slug: string, experimentId: string) =>
    projectsFetch<{ ok: true; state: Record<string, unknown> }>(
      '/api/site00/projects?action=cinematic_realism_lab_queue_lanes',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, experimentId }) },
    ),
  cinematicRealismLabSimulateOutputs: (slug: string, experimentId: string) =>
    projectsFetch<{ ok: true; state: Record<string, unknown> }>(
      '/api/site00/projects?action=cinematic_realism_lab_simulate_outputs',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, experimentId }) },
    ),
  cinematicRealismLabJudgment: (
    slug: string,
    experimentId: string,
    runId: string,
    assetId: string,
    judgment: string,
  ) =>
    projectsFetch<{ ok: true; state: Record<string, unknown> }>(
      '/api/site00/projects?action=cinematic_realism_lab_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, experimentId, runId, assetId, judgment }),
      },
    ),
  cinematicRealismLabFinalizeDecision: (slug: string, experimentId: string) =>
    projectsFetch<{ ok: true; state: Record<string, unknown> }>(
      '/api/site00/projects?action=cinematic_realism_lab_finalize_decision',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, experimentId }) },
    ),
  dailyPublishingConfigure: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=daily_publishing_configure',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  dailyPublishingPlanWeek: (slug: string, weekStart: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=daily_publishing_plan_week',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, weekStart }) },
    ),
  dailyPublishingBuildDay: (slug: string, date: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=daily_publishing_build_day',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, date }) },
    ),
  dailyPublishingApproveWeeklySlate: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=daily_publishing_approve_weekly_slate',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  culturalIntelligenceGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(`/api/site00/projects?action=cultural_intelligence_get&slug=${encodeURIComponent(slug)}`),
  culturalIntelligenceConfigure: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=cultural_intelligence_configure',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  culturalIntelligenceRefresh: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=cultural_intelligence_refresh',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  culturalIntelligenceWeeklyForecast: (slug: string, weekStart: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=cultural_intelligence_weekly_forecast',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, weekStart }) },
    ),
  culturalIntelligencePromoteOpportunities: (slug: string) =>
    projectsFetch<{ ok: true; intelRun: Record<string, unknown>; contentOpsRun: Record<string, unknown> }>(
      '/api/site00/projects?action=cultural_intelligence_promote_opportunities',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  culturalIntelligenceAddManualSignal: (
    slug: string,
    payload: { founderNote: string; whatCaughtAttention: string; referenceUrl?: string; urgency?: string },
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=cultural_intelligence_add_manual_signal',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...payload }),
      },
    ),
  culturalIntelligenceProvingRun: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=cultural_intelligence_proving_run',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  culturalIntelligencePromoteItem: (slug: string, interpretationId: string) =>
    projectsFetch<{ ok: true; intelRun: Record<string, unknown>; contentOpsRun: Record<string, unknown> }>(
      '/api/site00/projects?action=cultural_intelligence_promote_item',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, interpretationId }) },
    ),
  motionCharacterBookLanguageGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      `/api/site00/projects?action=motion_character_book_language_get&slug=${encodeURIComponent(slug)}`,
    ),
  motionCharacterBookLanguageInitialize: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=motion_character_book_language_initialize',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  motionCharacterBookLanguageRefresh: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=motion_character_book_language_refresh',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  embodiedCharacterDiscoveryGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      `/api/site00/projects?action=embodied_character_discovery_get&slug=${encodeURIComponent(slug)}`,
    ),
  embodiedCharacterDiscoveryInitialize: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=embodied_character_discovery_initialize',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  embodiedCharacterDiscoverySaveRound: (slug: string, round: string, answer: string, rawWording?: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=embodied_character_discovery_save_round',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, round, answer, rawWording }),
      },
    ),
  embodiedCharacterDiscoveryJudgment: (slug: string, judgment: string, dimension: string, note: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=embodied_character_discovery_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, judgment, dimension, note }),
      },
    ),
  embodiedCharacterDiscoverySynthesize: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=embodied_character_discovery_synthesize',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  founderCharacterDiscoveryGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null; neuralProviderConfigured?: boolean }>(
      `/api/site00/projects?action=founder_character_discovery_get&slug=${encodeURIComponent(slug)}`,
    ),
  founderCharacterDiscoveryInitialize: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_character_discovery_initialize',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  founderCharacterDiscoveryTraitJudgment: (
    slug: string,
    traitId: string,
    judgment: string,
    revision?: string,
    note?: string,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_character_discovery_trait_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, traitId, judgment, revision, note }),
      },
    ),
  founderCharacterDiscoveryScenarioResponse: (
    slug: string,
    scenarioId: string,
    response: string,
    judgment: string,
    notes?: string,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_character_discovery_scenario_response',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, scenarioId, response, judgment, notes }),
      },
    ),
  founderCharacterDiscoveryVisualJudgment: (
    slug: string,
    hypothesisId: string,
    judgment: string,
    note?: string,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_character_discovery_visual_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, hypothesisId, judgment, note }),
      },
    ),
  founderCharacterDiscoveryVoiceJudgment: (
    slug: string,
    sampleId: string,
    channel: string,
    judgment: string,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_character_discovery_voice_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, sampleId, channel, judgment }),
      },
    ),
  founderCharacterDiscoveryRecognition: (slug: string, response: string, note?: string, sourceRoute?: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; redirectToCasting?: boolean; blockers?: string[] }>(
      '/api/site00/projects?action=founder_character_discovery_recognition',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, response, note, sourceRoute }),
      },
    ),
  characterVisualCastingGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; visualCastingState: Record<string, unknown> | null; redirectToCasting?: boolean }>(
      `/api/site00/projects?action=character_visual_casting_get&slug=${encodeURIComponent(slug)}`,
    ),
  characterVisualCastingEstimate: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; estimate: Record<string, unknown> }>(
      '/api/site00/projects?action=character_visual_casting_estimate',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  characterVisualCastingGenerate: (slug: string, dispatchFal = true) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=character_visual_casting_generate',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, dispatchFal }) },
    ),
  characterVisualCastingRetryFal: (slug: string, roundId?: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=character_visual_casting_retry_fal',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, roundId }) },
    ),
  characterVisualCastingJudgment: (slug: string, candidateId: string, judgment: string, note?: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=character_visual_casting_judgment',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, candidateId, judgment, note }) },
    ),
  characterVisualCastingMerge: (slug: string, candidateIds: string[], retainFromEach: Record<string, string[]>) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=character_visual_casting_merge',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, candidateIds, retainFromEach }) },
    ),
  characterVisualCastingNextRound: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=character_visual_casting_next_round',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  characterVisualCastingLock: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=character_visual_casting_lock',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  founderCharacterDiscoverySynthesisPreview: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_character_discovery_synthesis_preview',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  founderCharacterDiscoveryCalibrationContinue: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; interaction: Record<string, unknown> | null }>(
      '/api/site00/projects?action=founder_character_discovery_calibration_continue',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  founderCharacterDiscoveryCalibrationReaction: (
    slug: string,
    interactionId: string,
    reaction: string,
    revision?: string,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; nextInteraction: Record<string, unknown> | null }>(
      '/api/site00/projects?action=founder_character_discovery_calibration_reaction',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, interactionId, reaction, revision }),
      },
    ),
  founderCharacterDiscoveryCalibrationSynthesis: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_character_discovery_calibration_synthesis',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  founderCharacterDiscoveryVoiceRoundStart: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; round: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_character_discovery_voice_round_start',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  founderCharacterDiscoveryVoiceHypothesisJudgment: (
    slug: string,
    hypothesisId: string,
    judgment: string,
    note?: string,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_character_discovery_voice_hypothesis_judgment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, hypothesisId, judgment, note }),
      },
    ),
  founderCharacterDiscoveryVoicePairwise: (
    slug: string,
    hypothesisAId: string,
    hypothesisBId: string,
    preference: string,
    customNote?: string,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_character_discovery_voice_pairwise',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, hypothesisAId, hypothesisBId, preference, customNote }),
      },
    ),
  founderCharacterDiscoveryVoiceRecognition: (slug: string, response: string, note?: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_character_discovery_voice_recognition',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, response, note }) },
    ),
  founderCharacterDiscoveryVoiceUnseenLine: (
    slug: string,
    hypothesisId: string,
    spokenCopy: string,
    response: string,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_character_discovery_voice_unseen_line',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, hypothesisId, spokenCopy, response }),
      },
    ),
  founderCharacterDiscoveryNeuralVoiceEstimate: (slug: string) =>
    projectsFetch<{ ok: true; estimate: Record<string, unknown>; neuralProviderConfigured: boolean }>(
      `/api/site00/projects?action=founder_character_discovery_neural_voice_estimate&slug=${encodeURIComponent(slug)}`,
    ),
  founderCharacterDiscoveryNeuralVoiceAudition: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown>; round: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_character_discovery_neural_voice_audition',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  founderCharacterDiscoveryHumanWomanTest: (slug: string, hypothesisId: string, response: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_character_discovery_human_woman_test',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, hypothesisId, response }),
      },
    ),
  founderCharacterDiscoveryNeuralVoiceRevision: (
    slug: string,
    hypothesisId: string,
    judgment: string,
    founderNote: string,
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_character_discovery_neural_voice_revision',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, hypothesisId, judgment, founderNote }),
      },
    ),
  founderCharacterDiscoveryNeuralVoiceRegenerate: (
    slug: string,
    hypothesisId: string,
    mode?: 'REGENERATE_CURRENT' | 'REPLAY_GENERATION',
  ) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=founder_character_discovery_neural_voice_regenerate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, hypothesisId, mode: mode ?? 'REGENERATE_CURRENT' }),
      },
    ),
  characterContinuityGet: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> | null }>(
      `/api/site00/projects?action=character_continuity_get&slug=${encodeURIComponent(slug)}`,
    ),
  characterContinuityInitialize: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=character_continuity_initialize',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  characterContinuityIngestBible: (slug: string, rawSource: string, sourceType: string, normalized?: Record<string, unknown>) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=character_continuity_ingest_bible',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, rawSource, sourceType, normalized }),
      },
    ),
  characterContinuityIngestSynthesis: (slug: string, whoSheIs: string, bookMeaning: string, whatMakesHerAnnoying: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=character_continuity_ingest_synthesis',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, whoSheIs, bookMeaning, whatMakesHerAnnoying }),
      },
    ),
  characterContinuityPreviewContract: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=character_continuity_preview_contract',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  characterContinuityMockFixtureTest: (slug: string) =>
    projectsFetch<{ ok: true; run: Record<string, unknown> }>(
      '/api/site00/projects?action=character_continuity_mock_fixture_test',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) },
    ),
  projectIntelligenceManifestCompile: (slug: string, experienceClass?: string) =>
    projectsFetch<{
      ok: true;
      manifest: Record<string, unknown>;
      readiness: string;
      formationGate: { allowed: boolean; reason: string | null };
    }>('/api/site00/projects?action=project_intelligence_manifest_compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, experienceClass }),
    }),
};
