/**
 * P0.VR.EXPERIENCE-LEGACY-FAL-ARTIFACT-RECONCILIATION-AND-REVIEW-UX-FIX1
 */

import { designPageIdsEquivalent } from '../designPageIdentity.js';
import { resolveDesignPageIdentityForGallery } from './pageConceptGenerationStateDiscovery.js';
import type { ExperienceExpressionAuthority, ExperienceExpressionVisualState } from './experienceExpressionAuthority.js';
import {
  expressionTypeForVisualState,
  validateExperiencePackageMaterialization,
} from './experiencePackageMaterialization.js';
import { isNdxbookOverviewExperiencePage } from './ndxbookOverviewExperienceExpressionContentSpec.js';
import { PAGE_EXPERIENCE_EXPRESSION_FAL_PROMPT_VERSION } from './pageConceptExperienceExpressionFalPlan.js';
import type { ExpressionPromptType } from './pageConceptExperienceExpressionFalPlan.js';
import type { PageConceptGeneratedArtifact, PageConceptGenerationState } from './types.js';

export type CanonicalExperienceRouteId = string;

export type CanonicalExperienceExpressionType =
  | 'MENU_EXPANDED_NAV'
  | 'ENTRY_DETAIL_PANEL'
  | 'PROJECT_ACCESS_OVERLAY'
  | 'BASE_PAGE_AT_REST'
  | 'UNKNOWN';

export type RecoveredExperienceArtifactClass =
  | 'CURRENT'
  | 'NEEDS_REVIEW'
  | 'STALE_CONTENT'
  | 'STALE_AUTHORITY'
  | 'RECOVERED_LEGACY_ARTIFACT';

export type RecoveredExperienceFalArtifact = {
  stateId: string;
  canonicalExpressionType: CanonicalExperienceExpressionType;
  artifactId: string;
  imageUri: string;
  providerRequestId: string | null;
  legacyJobId: string;
  sourceConceptId: string | null;
  sourcePageId: string;
  routeHint: string | null;
  createdAt: string;
  recoveryClass: RecoveredExperienceArtifactClass;
  reconciledAt: string;
};

export type ExperienceLegacyReconciliationReceipt = {
  rootCauseOfUnrecoveredFalOutputs:
    | 'ROUTE_ALIAS_MISMATCH'
    | 'PAGE_ID_BUCKET_MISMATCH'
    | 'EXPRESSION_LABEL_MISMATCH'
    | 'AUTHORITY_LINEAGE_MISMATCH'
    | 'NO_HISTORICAL_JOBS'
    | 'OTHER'
    | null;
  canonicalRouteId: CanonicalExperienceRouteId | null;
  menu: 'RECOVERED' | 'STALE' | 'MISSING';
  entryDetail: 'RECOVERED' | 'STALE' | 'MISSING';
  projectAccess: 'RECOVERED' | 'STALE' | 'MISSING';
  confirmedMissingStateIds: readonly string[];
  recoverableWithoutProviderCall: boolean;
};

const FAL_JOB_STATE_ID_RE = /pcga-EXP-([A-Z0-9-]+)-/i;

export function canonicalExperienceRouteId(input: {
  projectId: string;
  route?: string | null;
  screenId?: string | null;
  pageId?: string | null;
}): CanonicalExperienceRouteId | null {
  const route = (input.route ?? '').trim().toLowerCase();
  const screen = (input.screenId ?? '').trim().toLowerCase();
  const project = input.projectId.trim().toLowerCase();
  if (
    isNdxbookOverviewExperiencePage({
      projectId: project,
      route: route || '/projects/ndxbook',
      pageId: input.pageId ?? undefined,
      screenId: screen || undefined,
    })
  ) {
    return 'ndxbook:overview';
  }
  if (route) return `${project}:${route.replace(/^\/+/, '')}`;
  if (screen) return `${project}:screen:${screen}`;
  return input.pageId ? `${project}:page:${input.pageId}` : null;
}

export function routesMatchForExperienceRecovery(
  a: CanonicalExperienceRouteId | null,
  b: CanonicalExperienceRouteId | null,
): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a === 'ndxbook:overview' && b === 'ndxbook:overview') return true;
  return false;
}

export function normalizeLegacyExperienceExpressionType(raw: string): CanonicalExperienceExpressionType {
  const blob = raw.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  if (/MENU|NAV|EXPANDED_NAV|PRIMARY_NAV/.test(blob)) return 'MENU_EXPANDED_NAV';
  if (/ENTRY|DETAIL|PANEL|DRAWER|PANEL_OR/.test(blob)) return 'ENTRY_DETAIL_PANEL';
  if (/ACCESS|OVERLAY|PROJECT/.test(blob)) return 'PROJECT_ACCESS_OVERLAY';
  if (/BASE/.test(blob)) return 'BASE_PAGE_AT_REST';
  return 'UNKNOWN';
}

export function stateIdForCanonicalExpressionType(type: CanonicalExperienceExpressionType): string | null {
  if (type === 'MENU_EXPANDED_NAV') return 'menu';
  if (type === 'ENTRY_DETAIL_PANEL') return 'entry-detail';
  if (type === 'PROJECT_ACCESS_OVERLAY') return 'project-access';
  return null;
}

function inferStateIdFromJob(job: PageConceptGeneratedArtifact): string | null {
  if (job.artifactId) {
    const m = job.artifactId.match(FAL_JOB_STATE_ID_RE);
    if (m?.[1]) {
      const sid = m[1]!.toLowerCase();
      if (sid.includes('menu') || sid.includes('nav')) return 'menu';
      if (sid.includes('entry') || sid.includes('detail') || sid.includes('drawer') || sid.includes('panel')) {
        return 'entry-detail';
      }
      if (sid.includes('access') || sid.includes('overlay') || sid.includes('project')) return 'project-access';
    }
  }
  const fromTitle = job.displayTitle ? normalizeLegacyExperienceExpressionType(job.displayTitle) : 'UNKNOWN';
  return stateIdForCanonicalExpressionType(fromTitle);
}

function resolveVisualStateIdForRecovery(
  stateId: string,
  visualStates: readonly ExperienceExpressionVisualState[],
): string | null {
  const aliases: Record<string, string[]> = {
    menu: ['menu'],
    'entry-detail': ['entry-detail', 'drawer'],
    'project-access': ['project-access', 'overlay'],
  };
  const list = aliases[stateId] ?? [stateId];
  for (const id of list) {
    if (visualStates.some((v) => v.stateId === id)) return id;
  }
  return null;
}

function jobMatchesExperiencePage(input: {
  job: PageConceptGeneratedArtifact;
  state: PageConceptGenerationState;
  canonicalRouteId: CanonicalExperienceRouteId | null;
}): boolean {
  if (input.job.provider !== 'FAL_EXPERIENCE') return false;
  if (input.job.projectId.trim().toLowerCase() !== input.state.projectId.trim().toLowerCase()) return false;
  if (input.job.status !== 'READY' || !input.job.imageUri?.trim()) return false;

  const identity = resolveDesignPageIdentityForGallery({
    projectSlug: input.state.projectId,
    pageId: input.state.pageId,
    screenId: input.state.functionContract?.route ? undefined : '',
    route: input.state.functionContract?.route ?? null,
  });

  if (designPageIdsEquivalent(input.state.projectId, input.state.pageId, input.job.pageId)) return true;
  if (designPageIdsEquivalent(input.state.projectId, identity.canonicalPageId, input.job.pageId)) return true;
  if (designPageIdsEquivalent(input.state.projectId, identity.registryPageId, input.job.pageId)) return true;

  const jobRouteId = canonicalExperienceRouteId({
    projectId: input.job.projectId,
    route: input.state.functionContract?.route ?? null,
    pageId: input.job.pageId,
  });
  if (routesMatchForExperienceRecovery(input.canonicalRouteId, jobRouteId)) return true;

  if (
    input.canonicalRouteId === 'ndxbook:overview' &&
    input.job.projectId.trim().toLowerCase() === input.state.projectId.trim().toLowerCase()
  ) {
    return true;
  }

  return false;
}

function classifyRecoveredArtifact(input: {
  job: PageConceptGeneratedArtifact;
  authority: ExperienceExpressionAuthority;
  confirmedConceptId: string | null;
}): RecoveredExperienceArtifactClass {
  const conceptMatch =
    !input.confirmedConceptId ||
    input.job.gpt2AuthorityConceptId === input.confirmedConceptId ||
    input.job.gpt2AuthorityConceptId === input.authority.sourceConceptId;
  if (!conceptMatch) return 'STALE_AUTHORITY';

  const promptVersion = input.job.promptVersion?.trim() ?? '';
  const isMenu = inferStateIdFromJob(input.job) === 'menu';
  if (
    isMenu &&
    promptVersion &&
    promptVersion !== PAGE_EXPERIENCE_EXPRESSION_FAL_PROMPT_VERSION &&
    !promptVersion.includes('ndxbook') &&
    !promptVersion.includes('v2')
  ) {
    return 'STALE_CONTENT';
  }
  if (promptVersion && promptVersion.includes('legacy')) return 'STALE_CONTENT';
  return 'RECOVERED_LEGACY_ARTIFACT';
}

function dedupeJobsByArtifact(jobs: readonly PageConceptGeneratedArtifact[]): PageConceptGeneratedArtifact[] {
  const byArtifact = new Map<string, PageConceptGeneratedArtifact>();
  for (const job of jobs) {
    const key = job.artifactId || `${job.providerJobId}:${job.createdAt}`;
    const existing = byArtifact.get(key);
    if (!existing || Date.parse(job.createdAt) > Date.parse(existing.createdAt)) {
      byArtifact.set(key, job);
    }
  }
  return [...byArtifact.values()];
}

/** Collect FAL experience jobs from state plus optional cross-bucket sources (browser storage scan). */
export function collectExperienceFalJobCandidates(
  state: PageConceptGenerationState,
  extraJobs: readonly PageConceptGeneratedArtifact[] = [],
): PageConceptGeneratedArtifact[] {
  const all = dedupeJobsByArtifact([...state.generationJobs, ...extraJobs]);
  const canonicalRouteId = canonicalExperienceRouteId({
    projectId: state.projectId,
    route: state.functionContract?.route ?? null,
    pageId: state.pageId,
    screenId: null,
  });
  return all.filter((job) => jobMatchesExperiencePage({ job, state, canonicalRouteId }));
}

export function reconcileExistingExperienceArtifacts(input: {
  authority: ExperienceExpressionAuthority;
  state: PageConceptGenerationState;
  extraJobs?: readonly PageConceptGeneratedArtifact[];
}): {
  authority: ExperienceExpressionAuthority;
  recovered: readonly RecoveredExperienceFalArtifact[];
  receipt: ExperienceLegacyReconciliationReceipt;
} {
  const family = input.state.pipelineSet?.viewportAuthorityFamily;
  const confirmedConceptId = family?.confirmedMobileConceptId ?? family?.selectedMobileConceptId ?? null;
  const canonicalRouteId = canonicalExperienceRouteId({
    projectId: input.state.projectId,
    route: input.state.functionContract?.route ?? null,
    pageId: input.state.pageId,
    screenId: null,
  });

  const candidates = collectExperienceFalJobCandidates(input.state, input.extraJobs ?? []);
  const byState = new Map<string, PageConceptGeneratedArtifact>();
  for (const job of candidates) {
    const sidRaw = inferStateIdFromJob(job);
    if (!sidRaw) continue;
    const sid = resolveVisualStateIdForRecovery(sidRaw, input.authority.visualStates) ?? sidRaw;
    const existing = byState.get(sid);
    if (!existing || Date.parse(job.createdAt) > Date.parse(existing.createdAt)) {
      byState.set(sid, job);
    }
  }

  const authorityJobs = [...(input.authority.generationJobs ?? [])];
  const recovered: RecoveredExperienceFalArtifact[] = [];
  const visualStates = input.authority.visualStates.map((state) => {
    if (state.previewImageUri?.trim() && state.sourceProvider !== 'FAL_EXPERIENCE') return state;
    const job = byState.get(state.stateId);
    const authJob = authorityJobs.find((j) => j.stateId === state.stateId && j.artifactId);
    const imageUri = state.previewImageUri?.trim() ? state.previewImageUri : job?.imageUri?.trim() ?? null;
    if (!imageUri) return state;

    const recoveryClass =
      state.previewImageUri?.trim() ?
        'CURRENT'
      : job ?
        classifyRecoveredArtifact({ job, authority: input.authority, confirmedConceptId })
      : 'CURRENT';

    const artifactId = job?.artifactId ?? authJob?.artifactId ?? state.generatedArtifactId ?? null;
    if (job) {
      recovered.push({
        stateId: state.stateId,
        canonicalExpressionType: normalizeLegacyExperienceExpressionType(
          state.outputLabel ?? state.label ?? state.stateId,
        ),
        artifactId: artifactId ?? job.artifactId,
        imageUri,
        providerRequestId: job.providerJobId,
        legacyJobId: job.artifactId,
        sourceConceptId: job.gpt2AuthorityConceptId,
        sourcePageId: job.pageId,
        routeHint: canonicalRouteId,
        createdAt: job.createdAt,
        recoveryClass,
        reconciledAt: new Date().toISOString(),
      });
    }

    let materializationStatus = state.materializationStatus;
    if (recoveryClass === 'STALE_AUTHORITY' || recoveryClass === 'STALE_CONTENT') {
      materializationStatus = 'PRESERVED';
    } else if (recoveryClass === 'RECOVERED_LEGACY_ARTIFACT') {
      materializationStatus = 'READY';
    } else if (!materializationStatus || materializationStatus === 'GENERATING') {
      materializationStatus = 'READY';
    }

    return {
      ...state,
      previewImageUri: imageUri,
      generatedArtifactId: artifactId,
      materializationStatus,
      caption:
        recoveryClass === 'STALE_AUTHORITY' || recoveryClass === 'STALE_CONTENT' ?
          `${state.label} — recovered legacy output · REGENERATION REQUIRED`
        : state.previewImageUri?.trim() ?
          state.caption
        : `${state.label} — recovered legacy FAL artifact`,
    };
  });

  for (const [stateId, job] of byState) {
    if (authorityJobs.some((j) => j.stateId === stateId)) continue;
    authorityJobs.push({
      jobId: `exp-job-legacy-${stateId}-${job.artifactId.slice(-8)}`,
      experiencePackageId: input.authority.id,
      expressionType: (expressionTypeForVisualState(
        visualStates.find((v) => v.stateId === stateId) ?? {
          stateId,
          label: stateId,
          patternType: 'MENU',
          previewImageUri: job.imageUri,
          caption: '',
        },
      ) ?? 'OVERLAY_OR_DETAIL_STATE') as ExpressionPromptType,
      stateId,
      sourceAuthorityId: input.authority.sourceMobileArtifactId,
      promptId: null,
      provider: 'FAL_EXPERIENCE',
      providerRequestId: job.providerJobId,
      status: 'READY',
      artifactId: job.artifactId,
      error: null,
      regenerationReason: 'RECOVERED_LEGACY_ARTIFACT',
    });
  }

  const materialization = validateExperiencePackageMaterialization({ ...input.authority, visualStates });
  const readyCount = visualStates.filter((v) => v.previewImageUri?.trim()).length;
  const planned = materialization.plannedOutputCount || visualStates.length;

  let status = input.authority.status;
  if (status === 'APPROVED') {
    /* keep */
  } else if (materialization.ok) {
    status = 'READY_FOR_REVIEW';
  } else if (readyCount > 0 && readyCount < planned) {
    status = 'PARTIAL_FAILURE';
  } else if (readyCount >= planned && readyCount > 0) {
    status = 'READY_FOR_REVIEW';
  } else if (readyCount > 0 && status === 'NOT_STARTED') {
    status = 'PARTIAL_FAILURE';
  }

  const confirmedMissingStateIds = visualStates
    .filter((v) => v.sourceProvider === 'FAL_EXPERIENCE' && !v.previewImageUri?.trim())
    .map((v) => v.stateId);

  const slotStatus = (id: string): 'RECOVERED' | 'STALE' | 'MISSING' => {
    const v = visualStates.find((s) => s.stateId === id);
    if (!v?.previewImageUri?.trim()) return 'MISSING';
    const rec = recovered.find((r) => r.stateId === id);
    if (rec?.recoveryClass === 'STALE_AUTHORITY' || rec?.recoveryClass === 'STALE_CONTENT') return 'STALE';
    if (v.caption.includes('REGENERATION REQUIRED')) return 'STALE';
    return 'RECOVERED';
  };

  let rootCause: ExperienceLegacyReconciliationReceipt['rootCauseOfUnrecoveredFalOutputs'] = null;
  if (confirmedMissingStateIds.length > 0) {
    rootCause =
      candidates.length === 0 ? 'NO_HISTORICAL_JOBS'
      : confirmedMissingStateIds.length === 3 ? 'PAGE_ID_BUCKET_MISMATCH'
      : 'EXPRESSION_LABEL_MISMATCH';
  }

  const authority: ExperienceExpressionAuthority = {
    ...input.authority,
    status,
    visualStates,
    generationJobs: authorityJobs,
    expressionAssetIds: [
      ...new Set([
        ...(input.authority.expressionAssetIds ?? []),
        ...visualStates.map((v) => v.generatedArtifactId).filter(Boolean) as string[],
      ]),
    ],
  };

  return {
    authority,
    recovered,
    receipt: {
      rootCauseOfUnrecoveredFalOutputs: rootCause,
      canonicalRouteId,
      menu: slotStatus('menu'),
      entryDetail: slotStatus('entry-detail'),
      projectAccess: slotStatus('project-access'),
      confirmedMissingStateIds,
      recoverableWithoutProviderCall: candidates.length > 0 && confirmedMissingStateIds.length === 0,
    },
  };
}
