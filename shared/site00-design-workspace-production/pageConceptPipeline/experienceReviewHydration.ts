/**
 * P0.VR.EXPERIENCE-REVIEW-HYDRATION-AND-SINGLE-STATE-REGENERATION-UX1
 */

import { compileExperienceExpressionAuthority } from './experienceExpressionAuthority.js';
import type { ExperienceExpressionAuthority, ExperienceExpressionVisualState } from './experienceExpressionAuthority.js';
import { compileProjectSkinContract } from './pageConceptProjectSkinContract.js';
import type { PageViewportAuthorityFamily } from './pageConceptViewportAuthorityFamily.js';
import {
  expressionTypeForVisualState,
  validateExperiencePackageMaterialization,
  type ExperienceGenerationJob,
} from './experiencePackageMaterialization.js';
import { isMobileAuthorityConfirmed } from './pageConceptViewportFamilyState.js';
import type { PageConceptGeneratedArtifact, PageConceptGenerationState } from './types.js';
import { reconcileExistingExperienceArtifacts } from './experienceLegacyFalArtifactReconciliation.js';
import { buildExperienceReviewPackageStatus, resolveExperienceReviewPanelMode } from './experienceReviewPresentation.js';

export type ExperienceReviewZeroOutputRootCause =
  | 'PACKAGE_NOT_HYDRATED'
  | 'WRONG_AUTHORITY_LOOKUP'
  | 'ARTIFACT_INDEX_MISSING'
  | 'STALE_PACKAGE_FILTER'
  | 'MEMORY_ONLY_STATE'
  | 'UI_DEFAULT_OVERRIDING_SERVER_STATE'
  | 'OTHER';

export type ExperienceReviewHydrationPhase =
  | 'HYDRATING'
  | 'READY'
  | 'PARTIAL'
  | 'NOT_GENERATED'
  | 'FAILED'
  | 'STALE';

export type ExperienceReviewHydrationReceipt = {
  rootCauseOfZeroOutputPanel: ExperienceReviewZeroOutputRootCause | null;
  phase: ExperienceReviewHydrationPhase;
  persistedOutputsFound: number;
  reviewPanelOutputCount: number;
  packageStatusAfterHydration: ReturnType<typeof buildExperienceReviewPackageStatus>;
  experiencePackageId: string | null;
  sourceAuthorityId: string | null;
  outputArtifactIds: readonly string[];
  packageStale: boolean;
};

export type ExperienceOutputVersionRecord = {
  expressionType: string;
  previousArtifactId: string | null;
  newArtifactId: string;
  regeneratedAt: string;
  reason: string;
};

const FAL_JOB_STATE_ID_RE = /pcga-EXP-([A-Z0-9-]+)-/i;

export function inferExperienceStateIdFromArtifactId(artifactId: string): string | null {
  const m = artifactId.match(FAL_JOB_STATE_ID_RE);
  if (!m?.[1]) return null;
  return normalizeExperienceStateId(m[1]!);
}

function normalizeExperienceStateId(raw: string): string {
  const lower = raw.toLowerCase().replace(/_/g, '-');
  if (lower === 'menu' || lower.includes('nav')) return 'menu';
  if (lower === 'entry-detail' || lower.includes('entry') || lower === 'drawer') return 'entry-detail';
  if (lower === 'project-access' || lower.includes('access') || lower === 'overlay') return 'project-access';
  if (lower.includes('base')) return 'base';
  return lower;
}

const EXPERIENCE_STATE_ID_ALIASES: Record<string, readonly string[]> = {
  menu: ['menu'],
  drawer: ['drawer', 'entry-detail'],
  overlay: ['overlay', 'project-access'],
  'entry-detail': ['entry-detail', 'drawer'],
  'project-access': ['project-access', 'overlay'],
};

function resolveVisualStateIdForJob(
  jobStateId: string,
  visualStates: readonly ExperienceExpressionVisualState[],
): string | null {
  const normalized = normalizeExperienceStateId(jobStateId);
  const aliases = EXPERIENCE_STATE_ID_ALIASES[normalized] ?? [normalized];
  for (const alias of aliases) {
    if (visualStates.some((v) => v.stateId === alias)) return alias;
  }
  return visualStates.some((v) => v.stateId === normalized) ? normalized : null;
}

export function experienceFalJobsForPage(
  jobs: readonly PageConceptGeneratedArtifact[],
  input: { projectId: string; pageId: string; sourceConceptId?: string | null },
): PageConceptGeneratedArtifact[] {
  return jobs.filter(
    (j) =>
      j.provider === 'FAL_EXPERIENCE' &&
      j.projectId === input.projectId &&
      j.pageId === input.pageId &&
      j.status === 'READY' &&
      Boolean(j.imageUri?.trim()) &&
      (!input.sourceConceptId || j.gpt2AuthorityConceptId === input.sourceConceptId),
  );
}

function jobStateId(job: PageConceptGeneratedArtifact): string | null {
  const fromArtifact = job.artifactId ? inferExperienceStateIdFromArtifactId(job.artifactId) : null;
  if (fromArtifact) return normalizeExperienceStateId(fromArtifact);
  const fromTitle = job.displayTitle ? normalizeExperienceStateId(job.displayTitle) : null;
  return fromTitle;
}

export function reconcileExperienceVisualStatesFromJobs(input: {
  authority: ExperienceExpressionAuthority;
  pageJobs: readonly PageConceptGeneratedArtifact[];
}): ExperienceExpressionAuthority {
  const falJobs = experienceFalJobsForPage(input.pageJobs, {
    projectId: input.authority.projectId,
    pageId: input.authority.pageId,
    sourceConceptId: input.authority.sourceConceptId,
  });
  const jobsByState = new Map<string, PageConceptGeneratedArtifact>();
  for (const job of falJobs) {
    const sidRaw = jobStateId(job);
    if (!sidRaw) continue;
    const sid = resolveVisualStateIdForJob(sidRaw, input.authority.visualStates) ?? sidRaw;
    const existing = jobsByState.get(sid);
    if (!existing || Date.parse(job.createdAt) > Date.parse(existing.createdAt)) {
      jobsByState.set(sid, job);
    }
  }

  const authorityJobs = input.authority.generationJobs ?? [];
  const authorityJobByState = new Map(authorityJobs.map((j) => [j.stateId, j]));

  let repaired = false;
  const visualStates = input.authority.visualStates.map((state) => {
    if (state.previewImageUri?.trim()) return state;
    const pageJob = jobsByState.get(state.stateId);
    const authJob = authorityJobByState.get(state.stateId);
    const artifactId = pageJob?.artifactId ?? authJob?.artifactId ?? null;
    const imageUri = pageJob?.imageUri?.trim() ?? null;
    if (!imageUri) return state;
    repaired = true;
    return {
      ...state,
      previewImageUri: imageUri,
      generatedArtifactId: artifactId ?? state.generatedArtifactId,
      materializationStatus: 'READY' as const,
    };
  });

  const mergedGenerationJobs: ExperienceGenerationJob[] = [...authorityJobs];
  for (const [stateId, job] of jobsByState) {
    if (authorityJobByState.has(stateId)) continue;
    mergedGenerationJobs.push({
      jobId: `exp-job-hydrate-${stateId}-${job.artifactId.slice(-8)}`,
      experiencePackageId: input.authority.id,
      expressionType: expressionTypeForVisualState(
        visualStates.find((v) => v.stateId === stateId) ?? {
          stateId,
          label: stateId,
          patternType: 'MENU',
          previewImageUri: job.imageUri,
          caption: '',
        },
      ),
      stateId,
      sourceAuthorityId: input.authority.sourceMobileArtifactId,
      promptId: null,
      provider: 'FAL_EXPERIENCE',
      providerRequestId: job.providerJobId,
      status: 'READY',
      artifactId: job.artifactId,
      error: null,
    });
    repaired = repaired || true;
  }

  if (!repaired && mergedGenerationJobs.length === authorityJobs.length) {
    return input.authority;
  }

  const materialization = validateExperiencePackageMaterialization({ ...input.authority, visualStates });
  let status = input.authority.status;
  if (materialization.ok && status !== 'APPROVED') status = 'READY_FOR_REVIEW';
  else if (!materialization.ok && visualStates.some((v) => v.previewImageUri?.trim()) && status === 'NOT_STARTED') {
    status = 'PARTIAL_FAILURE';
  } else if (visualStates.some((v) => v.previewImageUri?.trim()) && status === 'GENERATING') {
    status = materialization.ok ? 'READY_FOR_REVIEW' : 'PARTIAL_FAILURE';
  }

  const expressionAssetIds = [
    ...new Set([
      ...(input.authority.expressionAssetIds ?? []),
      ...visualStates.map((v) => v.generatedArtifactId).filter(Boolean) as string[],
    ]),
  ];

  return {
    ...input.authority,
    status,
    visualStates,
    generationJobs: mergedGenerationJobs,
    expressionAssetIds,
  };
}

export function compileExperienceAuthorityIfMissing(
  state: PageConceptGenerationState,
): ExperienceExpressionAuthority | null {
  const ps = state.pipelineSet;
  const family = ps?.viewportAuthorityFamily;
  if (!isMobileAuthorityConfirmed(family)) return ps?.experienceExpressionAuthority ?? null;
  if (ps?.experienceExpressionAuthority?.visualStates?.length) return ps.experienceExpressionAuthority;
  const conceptId = family!.confirmedMobileConceptId ?? family!.selectedMobileConceptId!;
  const mobileConcept = ps!.mobileConcepts?.find((c) => c.conceptId === conceptId);
  if (!mobileConcept?.imageUri?.trim()) return ps?.experienceExpressionAuthority ?? null;
  if (!ps!.creativeInjection || !ps!.cgptCreativeBrief || !state.functionContract) {
    return ps?.experienceExpressionAuthority ?? null;
  }
  const skin = compileProjectSkinContract(state.projectId);
  return compileExperienceExpressionAuthority({
    projectId: state.projectId,
    pageId: state.pageId,
    mobileConcept,
    skinContract: skin,
    cgptBrief: ps!.cgptCreativeBrief,
    injection: ps!.creativeInjection,
    functionContract: state.functionContract,
  });
}

export function experiencePackageAuthorityStale(
  family: PageViewportAuthorityFamily | null | undefined,
  authority: ExperienceExpressionAuthority | null | undefined,
): boolean {
  if (!family || !authority) return false;
  const confirmed = family.confirmedMobileConceptId ?? family.selectedMobileConceptId;
  if (!confirmed) return false;
  return authority.sourceConceptId !== confirmed;
}

export function missingExperienceFalStateIds(authority: ExperienceExpressionAuthority | null | undefined): string[] {
  if (!authority) return [];
  const fromReceipt = authority.legacyReconciliationReceipt?.confirmedMissingStateIds;
  if (fromReceipt) return [...fromReceipt];
  return authority.visualStates
    .filter((v) => v.sourceProvider === 'FAL_EXPERIENCE' && !v.previewImageUri?.trim())
    .map((v) => v.stateId);
}

export function diagnoseExperienceReviewZeroOutputRootCause(input: {
  state: PageConceptGenerationState;
  authorityBefore: ExperienceExpressionAuthority | null | undefined;
  authorityAfter: ExperienceExpressionAuthority | null | undefined;
}): ExperienceReviewZeroOutputRootCause | null {
  const afterReady = (input.authorityAfter?.visualStates ?? []).filter((v) => v.previewImageUri?.trim()).length;
  if (afterReady > 0) return null;

  const family = input.state.pipelineSet?.viewportAuthorityFamily;
  const falJobs = experienceFalJobsForPage(input.state.generationJobs, {
    projectId: input.state.projectId,
    pageId: input.state.pageId,
    sourceConceptId: family?.confirmedMobileConceptId ?? family?.selectedMobileConceptId,
  });
  if (falJobs.length > 0 && !input.authorityBefore) return 'PACKAGE_NOT_HYDRATED';
  if (falJobs.length > 0 && (input.authorityBefore?.visualStates ?? []).every((v) => !v.previewImageUri?.trim())) {
    return 'ARTIFACT_INDEX_MISSING';
  }
  if (
    input.authorityBefore &&
    experiencePackageAuthorityStale(family, input.authorityBefore) &&
    falJobs.length === 0
  ) {
    return 'WRONG_AUTHORITY_LOOKUP';
  }
  if (
    input.authorityBefore &&
    input.state.pipelineSet?.viewportAuthorityFamily?.experienceExpressionStatus === 'READY_FOR_REVIEW' &&
    !input.authorityBefore.visualStates?.length
  ) {
    return 'MEMORY_ONLY_STATE';
  }
  if (!input.authorityBefore && !input.authorityAfter) return 'UI_DEFAULT_OVERRIDING_SERVER_STATE';
  return 'OTHER';
}

export function applyExperienceReviewHydrationToState(
  state: PageConceptGenerationState,
  options?: { extraExperienceFalJobs?: readonly import('./types.js').PageConceptGeneratedArtifact[] },
): { state: PageConceptGenerationState; receipt: ExperienceReviewHydrationReceipt } {
  const ps = state.pipelineSet;
  const family = ps?.viewportAuthorityFamily;
  const authorityBefore = ps?.experienceExpressionAuthority ?? null;

  let authority = authorityBefore ?? compileExperienceAuthorityIfMissing(state);

  const mergedJobs = [...state.generationJobs, ...(options?.extraExperienceFalJobs ?? [])];
  if (authority) {
    authority = reconcileExperienceVisualStatesFromJobs({ authority, pageJobs: mergedJobs });
    const legacy = reconcileExistingExperienceArtifacts({
      authority,
      state,
      extraJobs: options?.extraExperienceFalJobs ?? [],
    });
    authority = { ...legacy.authority, legacyReconciliationReceipt: legacy.receipt };
  } else {
    const compiled = compileExperienceAuthorityIfMissing(state);
    if (compiled) {
      authority = reconcileExperienceVisualStatesFromJobs({ authority: compiled, pageJobs: mergedJobs });
      const legacy = reconcileExistingExperienceArtifacts({
        authority,
        state,
        extraJobs: options?.extraExperienceFalJobs ?? [],
      });
      authority = { ...legacy.authority, legacyReconciliationReceipt: legacy.receipt };
    }
  }

  if (authority && experiencePackageAuthorityStale(family, authority)) {
    authority = {
      ...authority,
      status: authority.status === 'APPROVED' ? 'APPROVED' : 'SUPERSEDED',
      behaviorContract: `${authority.behaviorContract}\n\nEXPERIENCE PACKAGE STALE — SOURCE AUTHORITY CHANGED.`,
    };
  }

  const stale = experiencePackageAuthorityStale(family, authority);
  const materialization = validateExperiencePackageMaterialization(authority);
  const readyCount = (authority?.visualStates ?? []).filter((v) => v.previewImageUri?.trim()).length;

  let phase: ExperienceReviewHydrationPhase = 'NOT_GENERATED';
  if (stale) phase = 'STALE';
  else if (!authority) phase = 'NOT_GENERATED';
  else if (authority.status === 'FAILED') phase = 'FAILED';
  else if (materialization.ok || resolveExperienceReviewPanelMode(authority) === 'READY') phase = 'READY';
  else if (readyCount > 0) phase = 'PARTIAL';
  else phase = 'NOT_GENERATED';

  const rootCause = diagnoseExperienceReviewZeroOutputRootCause({
    state,
    authorityBefore,
    authorityAfter: authority,
  });

  const packageStatusAfterHydration = buildExperienceReviewPackageStatus(authority);

  const nextState: PageConceptGenerationState =
    authority && ps ?
      {
        ...state,
        pipelineSet: {
          ...ps,
          experienceExpressionAuthority: authority,
          viewportAuthorityFamily:
            family && !stale && phase === 'READY' && family.experienceExpressionStatus === 'NOT_STARTED' ?
              { ...family, experienceExpressionStatus: 'READY_FOR_REVIEW', updatedAt: new Date().toISOString() }
            : family,
        },
      }
    : state;

  const outputArtifactIds = (authority?.visualStates ?? [])
    .map((v) => v.generatedArtifactId)
    .filter(Boolean) as string[];

  return {
    state: nextState,
    receipt: {
      rootCauseOfZeroOutputPanel: rootCause,
      phase,
      persistedOutputsFound: readyCount,
      reviewPanelOutputCount: authority?.visualStates.length ?? 0,
      packageStatusAfterHydration,
      experiencePackageId: authority?.id ?? null,
      sourceAuthorityId: authority?.sourceConceptId ?? null,
      outputArtifactIds,
      packageStale: stale,
    },
  };
}

export function resolveExperienceReviewPanelModeDuringHydration(
  authority: ExperienceExpressionAuthority | null | undefined,
  hydrating: boolean,
): ReturnType<typeof resolveExperienceReviewPanelMode> | 'HYDRATING' {
  if (hydrating) return 'HYDRATING';
  if (authority && experiencePackageAuthorityStale(null, authority)) {
    /* stale handled via authority status SUPERSEDED — still show outputs */
  }
  return resolveExperienceReviewPanelMode(authority);
}

export function recordExperienceOutputVersionOnRegeneration(input: {
  state: ExperienceExpressionVisualState;
  previousArtifactId: string | null;
  newArtifactId: string;
  reason: string;
}): ExperienceExpressionVisualState {
  return {
    ...input.state,
    generatedArtifactId: input.newArtifactId,
    materializationStatus: 'READY',
  };
}

export function appendExperienceGenerationJobVersionHistory(
  priorJobs: readonly ExperienceGenerationJob[],
  nextJob: ExperienceGenerationJob,
  previousArtifactId: string | null,
): ExperienceGenerationJob[] {
  let jobs = [...priorJobs];
  if (previousArtifactId) {
    const idx = jobs.findIndex((j) => j.stateId === nextJob.stateId && j.artifactId === previousArtifactId);
    if (idx >= 0) {
      jobs[idx] = { ...jobs[idx]!, status: 'PRESERVED' };
    } else {
      jobs.push({
        ...nextJob,
        jobId: `exp-job-preserved-${nextJob.stateId}-${Date.now()}`,
        status: 'PRESERVED',
        artifactId: previousArtifactId,
        providerRequestId: null,
        regeneratedAt: null,
        regenerationReason: null,
      });
    }
  }
  return [
    ...jobs.filter((j) => !(j.stateId === nextJob.stateId && j.status !== 'PRESERVED')),
    { ...nextJob, previousArtifactId: previousArtifactId ?? undefined },
  ];
}
