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
    }>(`/api/site00/projects?action=project_intelligence_manifest_get&slug=${encodeURIComponent(slug)}`),
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
