/**
 * P0.VR.DESIGN-WORKSPACE-PREVIEW-FIT-LATEST-RUN-AND-HERO-RAIL-RESTORE1
 * P0.VR.DESIGN-WORKSPACE-V646-VISUAL-RESTORE-AND-LATEST-RUN-RECOVERY1
 * Authoritative CURRENT GENERATION run + per-slot artifact resolution for gallery/hero.
 */

import type { PageConceptCandidate } from '../designProjectBinding/designPageConceptModel.js';
import type { PageViewportId } from '../designProjectBinding/pageViewportAuthority.js';
import {
  inferPageConceptPipelineLineage,
  PAGE_CONCEPT_CANONICAL_PIPELINE_ID,
} from './pageConceptCanonicalPipeline.js';
import { pageConceptCandidateMatchesViewportGallery } from './pageConceptViewportGalleryScope.js';
import type { PageConceptGeneratedArtifact, PageConceptGenerationState } from './types.js';
import {
  PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS,
  type PageMobileConceptSlotId,
} from './pageConceptViewportAuthorityFamily.js';
import {
  parseMobileConceptSlotFromArtifactId,
  resolveMobileConceptSlotForJob,
} from './pageConceptCandidateReconciliation.js';

export type PageConceptLatestGenerationResolution =
  | 'LATEST_RUN_READY'
  | 'LATEST_RUN_PARTIAL'
  | 'ACTIVE_RUN_IN_PROGRESS'
  | 'NO_SUCCESSFUL_RUN';

export type PageConceptLatestGenerationDiagnostics = {
  activeGenerationRunId: string | null;
  activeGenerationCreatedAt: string | null;
  latestGenerationResolution: PageConceptLatestGenerationResolution;
  slotArtifactIds: Partial<Record<'A' | 'B' | 'C', string | null>>;
  slotVersions: Partial<Record<'A' | 'B' | 'C', number>>;
  /** True when slot/run linkage was inferred from durable gallery artifacts (not a perfect run row). */
  recoveredFromArtifacts?: boolean;
};

function slotLetter(slot: PageMobileConceptSlotId): 'A' | 'B' | 'C' {
  if (slot === 'MOBILE_CONCEPT_A') return 'A';
  if (slot === 'MOBILE_CONCEPT_B') return 'B';
  return 'C';
}

function runTimestamp(state: PageConceptGenerationState): string {
  return (
    state.activeGenerationRunStartedAt ??
    state.pipelineSet?.createdAt ??
    state.generationJobs.reduce((max, j) => ((j.createdAt ?? '') > max ? (j.createdAt ?? '') : max), '') ??
    ''
  );
}

/** Resolve the active generation run id from persisted state (not gallery store order). */
export function resolvePageConceptActiveGenerationRunId(state: PageConceptGenerationState): string | null {
  return state.activeGenerationRunId ?? state.activeReviewRunId ?? state.pipelineSet?.pipelineSetId ?? null;
}

function mobileJobsForDiagnostics(state: PageConceptGenerationState): PageConceptGeneratedArtifact[] {
  return state.generationJobs
    .filter((j) => j.provider === 'GPT2_MOBILE' && j.viewport === 'MOBILE')
    .filter((j) => j.status === 'READY' || j.status === 'RUNNING' || j.status === 'FAILED')
    .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
}

function resolveSlotArtifactIdsFromJobs(jobs: readonly PageConceptGeneratedArtifact[]): {
  slotArtifactIds: Partial<Record<'A' | 'B' | 'C', string | null>>;
  slotVersions: Partial<Record<'A' | 'B' | 'C', number>>;
} {
  const slotArtifactIds: Partial<Record<'A' | 'B' | 'C', string | null>> = {};
  const slotVersions: Partial<Record<'A' | 'B' | 'C', number>> = {};

  for (const slot of PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS) {
    const letter = slotLetter(slot);
    const slotJobs = jobs.filter((j) => resolveMobileConceptSlotForJob(j) === slot);
    if (slotJobs.length === 0) continue;
    const latest = slotJobs[slotJobs.length - 1]!;
    slotArtifactIds[letter] = latest.artifactId;
    slotVersions[letter] = slotJobs.length;
  }

  return { slotArtifactIds, slotVersions };
}

function resolveSlotArtifactIdsFromMobileConcepts(state: PageConceptGenerationState): {
  slotArtifactIds: Partial<Record<'A' | 'B' | 'C', string | null>>;
  slotVersions: Partial<Record<'A' | 'B' | 'C', number>>;
} {
  const slotArtifactIds: Partial<Record<'A' | 'B' | 'C', string | null>> = {};
  const slotVersions: Partial<Record<'A' | 'B' | 'C', number>> = {};
  const mobileConcepts = state.pipelineSet?.mobileConcepts ?? [];
  for (const slot of PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS) {
    const letter = slotLetter(slot);
    const rows = mobileConcepts
      .filter((c) => c.slot === slot && (c.status === 'READY' || c.status === 'RUNNING' || c.status === 'FAILED'))
      .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
    if (rows.length === 0) continue;
    const latest = rows[rows.length - 1]!;
    slotArtifactIds[letter] = latest.artifactId;
    slotVersions[letter] = rows.length;
  }
  return { slotArtifactIds, slotVersions };
}

function candidateSlot(concept: PageConceptCandidate): PageMobileConceptSlotId | null {
  if (concept.conceptSlot) return concept.conceptSlot;
  if (concept.artifactId) {
    const fromArtifact = parseMobileConceptSlotFromArtifactId(concept.artifactId);
    if (fromArtifact) return fromArtifact;
  }
  if (concept.renditionSlot === 'RENDITION_A') return 'MOBILE_CONCEPT_A';
  if (concept.renditionSlot === 'RENDITION_B') return 'MOBILE_CONCEPT_B';
  if (concept.renditionSlot === 'RENDITION_C') return 'MOBILE_CONCEPT_C';
  return null;
}

/** Latest non-stale mobile candidate per slot — never prefer HISTORY when a newer CURRENT exists. */
export function reconcileLatestMobileSlotArtifactsFromCandidates(
  candidates: readonly PageConceptCandidate[],
  viewport: PageViewportId = 'MOBILE',
): {
  slotArtifactIds: Partial<Record<'A' | 'B' | 'C', string | null>>;
  slotVersions: Partial<Record<'A' | 'B' | 'C', number>>;
  inferredRunId: string | null;
  familyCreatedAt: string | null;
} {
  const slotArtifactIds: Partial<Record<'A' | 'B' | 'C', string | null>> = {};
  const slotVersions: Partial<Record<'A' | 'B' | 'C', number>> = {};
  const mobileRows = candidates.filter(
    (c) =>
      pageConceptCandidateMatchesViewportGallery(c, viewport) &&
      c.artifactRole === 'MOBILE_CANDIDATE' &&
      c.artifactStatus !== 'FAILED' &&
      (c.mobileVisualReference ?? c.visualReference),
  );

  const bySlot = new Map<PageMobileConceptSlotId, PageConceptCandidate[]>();
  for (const row of mobileRows) {
    const slot = candidateSlot(row);
    if (!slot) continue;
    const list = bySlot.get(slot) ?? [];
    list.push(row);
    bySlot.set(slot, list);
  }

  const chosen: PageConceptCandidate[] = [];
  for (const slot of PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS) {
    const letter = slotLetter(slot);
    const rows = (bySlot.get(slot) ?? []).sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
    if (rows.length === 0) continue;
    const currentRows = rows.filter((r) => r.runGroup === 'CURRENT');
    const nonHistory = rows.filter((r) => r.runGroup !== 'HISTORY');
    const pool = currentRows.length > 0 ? currentRows : nonHistory.length > 0 ? nonHistory : rows;
    const pick = pool[pool.length - 1];
    if (!pick) continue;
    slotArtifactIds[letter] = pick.artifactId ?? null;
    slotVersions[letter] = rows.filter((r) => r.artifactStatus === 'READY' || r.artifactStatus === 'RUNNING').length || 1;
    chosen.push(pick);
  }

  let inferredRunId: string | null = null;
  if (chosen.length > 0) {
    inferredRunId =
      chosen.reduce((best, row) => ((row.createdAt ?? '') >= (best.createdAt ?? '') ? row : best)).runId ?? null;
  }

  const familyCreatedAt =
    chosen.length > 0 ?
      chosen.reduce((max, row) => ((row.createdAt ?? '') > max ? (row.createdAt ?? '') : max), '')
    : null;

  return { slotArtifactIds, slotVersions, inferredRunId, familyCreatedAt };
}

function countReadySlots(slotArtifactIds: Partial<Record<'A' | 'B' | 'C', string | null>>): number {
  return Object.values(slotArtifactIds).filter(Boolean).length;
}

function resolutionFromReadyCount(
  readyCount: number,
  running: boolean,
): PageConceptLatestGenerationResolution {
  if (readyCount === 0 && running) return 'ACTIVE_RUN_IN_PROGRESS';
  if (readyCount > 0 && readyCount < 3) return 'LATEST_RUN_PARTIAL';
  if (readyCount >= 3) return 'LATEST_RUN_READY';
  return 'NO_SUCCESSFUL_RUN';
}

export function resolvePageConceptLatestGenerationDiagnostics(
  state: PageConceptGenerationState,
  options?: { candidates?: readonly PageConceptCandidate[] },
): PageConceptLatestGenerationDiagnostics {
  const activeGenerationRunId = resolvePageConceptActiveGenerationRunId(state);
  const activeGenerationCreatedAt = runTimestamp(state) || null;

  const pipelineId = inferPageConceptPipelineLineage({
    pipelineLineage: state.pipelineSet?.pipelineLineage ?? null,
    generationJobs: state.generationJobs,
  });

  const mobileJobs = mobileJobsForDiagnostics(state);
  let { slotArtifactIds, slotVersions } = resolveSlotArtifactIdsFromJobs(mobileJobs);
  let recoveredFromArtifacts = false;
  const missingActiveRun = !state.activeGenerationRunId && !state.activeReviewRunId;

  if (countReadySlots(slotArtifactIds) === 0) {
    const fromConcepts = resolveSlotArtifactIdsFromMobileConcepts(state);
    if (countReadySlots(fromConcepts.slotArtifactIds) > 0) {
      slotArtifactIds = fromConcepts.slotArtifactIds;
      slotVersions = fromConcepts.slotVersions;
      if (mobileJobs.length === 0) recoveredFromArtifacts = true;
    }
  }
  let reconciledRunId: string | null = null;
  let reconciledCreatedAt: string | null = null;

  if (
    pipelineId === PAGE_CONCEPT_CANONICAL_PIPELINE_ID &&
    options?.candidates &&
    options.candidates.length > 0 &&
    (missingActiveRun || countReadySlots(slotArtifactIds) === 0)
  ) {
    const reconciled = reconcileLatestMobileSlotArtifactsFromCandidates(options.candidates, 'MOBILE');
    if (countReadySlots(reconciled.slotArtifactIds) > countReadySlots(slotArtifactIds)) {
      slotArtifactIds = reconciled.slotArtifactIds;
      slotVersions = reconciled.slotVersions;
      reconciledRunId = reconciled.inferredRunId;
      reconciledCreatedAt = reconciled.familyCreatedAt;
      recoveredFromArtifacts = true;
    }
  }

  if (pipelineId !== PAGE_CONCEPT_CANONICAL_PIPELINE_ID) {
    if (options?.candidates && countReadySlots(slotArtifactIds) === 0) {
      const reconciled = reconcileLatestMobileSlotArtifactsFromCandidates(options.candidates, 'MOBILE');
      if (countReadySlots(reconciled.slotArtifactIds) > 0) {
        slotArtifactIds = reconciled.slotArtifactIds;
        slotVersions = reconciled.slotVersions;
        reconciledRunId = reconciled.inferredRunId;
        reconciledCreatedAt = reconciled.familyCreatedAt;
        recoveredFromArtifacts = true;
      }
    }
    if (countReadySlots(slotArtifactIds) === 0) {
      return {
        activeGenerationRunId,
        activeGenerationCreatedAt,
        latestGenerationResolution: 'NO_SUCCESSFUL_RUN',
        slotArtifactIds,
        slotVersions,
      };
    }
  }

  const readyCount = countReadySlots(slotArtifactIds);
  const running = mobileJobs.some((j) => j.status === 'RUNNING');
  const latestGenerationResolution = resolutionFromReadyCount(readyCount, running);

  if (missingActiveRun && readyCount > 0) recoveredFromArtifacts = true;

  const resolvedRunId =
    missingActiveRun ?
      reconciledRunId ?? activeGenerationRunId ?? state.pipelineSet?.pipelineSetId ?? null
    : activeGenerationRunId;
  const resolvedCreatedAt =
    recoveredFromArtifacts && reconciledCreatedAt ? reconciledCreatedAt : activeGenerationCreatedAt;

  return {
    activeGenerationRunId: resolvedRunId,
    activeGenerationCreatedAt: resolvedCreatedAt,
    latestGenerationResolution,
    slotArtifactIds,
    slotVersions,
    recoveredFromArtifacts: recoveredFromArtifacts || undefined,
  };
}

/** Patch missing active run id when durable artifacts imply a current family. */
export function repairPageConceptGenerationRunLinkage(
  state: PageConceptGenerationState,
  candidates: readonly PageConceptCandidate[],
): { state: PageConceptGenerationState; changed: boolean } {
  const diagnostics = resolvePageConceptLatestGenerationDiagnostics(state, { candidates });
  if (diagnostics.latestGenerationResolution === 'NO_SUCCESSFUL_RUN') {
    return { state, changed: false };
  }
  const inferredRun = diagnostics.activeGenerationRunId;
  if (!inferredRun) return { state, changed: false };
  const hasActive = Boolean(state.activeGenerationRunId ?? state.activeReviewRunId);
  if (hasActive && !diagnostics.recoveredFromArtifacts) {
    return { state, changed: false };
  }
  if (hasActive && diagnostics.recoveredFromArtifacts && diagnostics.activeGenerationRunId === state.activeGenerationRunId) {
    return { state, changed: false };
  }
  if (state.activeGenerationRunId === inferredRun && state.activeReviewRunId === inferredRun) {
    return { state, changed: false };
  }
  return {
    state: {
      ...state,
      activeGenerationRunId: inferredRun,
      activeReviewRunId: inferredRun,
      activeGenerationRunStartedAt:
        diagnostics.activeGenerationCreatedAt ?? state.activeGenerationRunStartedAt ?? null,
    },
    changed: true,
  };
}

/** CURRENT GENERATION cards for gallery — latest slot artifacts tied to active run boundary. */
export function filterPageConceptGalleryCurrentCandidates(input: {
  candidates: readonly PageConceptCandidate[];
  viewport: PageViewportId;
  state: PageConceptGenerationState | null;
}): readonly PageConceptCandidate[] {
  const scoped = input.candidates.filter((c) => pageConceptCandidateMatchesViewportGallery(c, input.viewport));
  const mobileCurrent = scoped.filter(
    (c) => c.artifactRole === 'MOBILE_CANDIDATE' && c.runGroup !== 'HISTORY' && c.artifactStatus !== 'FAILED',
  );
  const interpCurrent = scoped.filter(
    (c) =>
      (c.artifactRole === 'TABLET_INTERPRETATION' || c.artifactRole === 'DESKTOP_INTERPRETATION') &&
      c.runGroup !== 'HISTORY' &&
      c.artifactStatus !== 'FAILED',
  );

  const activeRunId = input.state ? resolvePageConceptActiveGenerationRunId(input.state) : null;

  if (!input.state || !activeRunId) {
    const bySlotFallback = new Map<PageMobileConceptSlotId, PageConceptCandidate>();
    for (const c of mobileCurrent.filter((row) => row.runGroup === 'CURRENT')) {
      if (!c.conceptSlot) continue;
      const existing = bySlotFallback.get(c.conceptSlot);
      if (!existing || (c.createdAt ?? '') >= (existing.createdAt ?? '')) {
        bySlotFallback.set(c.conceptSlot, c);
      }
    }
    if (bySlotFallback.size === 0) {
      for (const c of mobileCurrent) {
        const slot = candidateSlot(c);
        if (!slot) continue;
        const existing = bySlotFallback.get(slot);
        if (!existing || (c.createdAt ?? '') >= (existing.createdAt ?? '')) {
          bySlotFallback.set(slot, c);
        }
      }
    }
    return [...bySlotFallback.values(), ...interpCurrent.filter((c) => c.runGroup === 'CURRENT')];
  }
  const diagnostics = resolvePageConceptLatestGenerationDiagnostics(input.state, {
    candidates: input.candidates,
  });
  const effectiveRunId = diagnostics.activeGenerationRunId ?? activeRunId;

  const bySlot = new Map<PageMobileConceptSlotId, PageConceptCandidate>();
  for (const c of mobileCurrent) {
    const slot = candidateSlot(c);
    if (!slot) continue;
    const existing = bySlot.get(slot);
    if (!existing || (c.createdAt ?? '') >= (existing.createdAt ?? '')) {
      bySlot.set(slot, c);
    }
  }

  const resolvedMobile: PageConceptCandidate[] = [];
  for (const slot of PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS) {
    const letter = slotLetter(slot);
    const artifactId = diagnostics.slotArtifactIds[letter];
    const row =
      artifactId ?
        mobileCurrent.find((c) => c.artifactId === artifactId) ?? bySlot.get(slot) ?? null
      : bySlot.get(slot) ?? null;
    if (!row) continue;
    if (
      effectiveRunId &&
      row.runId &&
      row.runId !== effectiveRunId &&
      row.runGroup === 'HISTORY' &&
      !diagnostics.recoveredFromArtifacts
    ) {
      continue;
    }
    resolvedMobile.push(row);
  }

  const mobileOut =
    resolvedMobile.length > 0 ?
      resolvedMobile
    : mobileCurrent.filter((c) => !effectiveRunId || !c.runId || c.runId === effectiveRunId);

  return [...mobileOut, ...interpCurrent];
}

export function pageConceptCurrentGenerationUnresolvedMessage(
  diagnostics: PageConceptLatestGenerationDiagnostics,
): string | null {
  if (diagnostics.recoveredFromArtifacts) return null;
  if (diagnostics.latestGenerationResolution === 'NO_SUCCESSFUL_RUN') {
    return 'CURRENT GENERATION COULD NOT BE RESOLVED';
  }
  return null;
}

export function pageConceptCurrentGenerationGroupLabel(
  diagnostics: PageConceptLatestGenerationDiagnostics,
  defaultLabel = 'CURRENT GENERATION',
): string {
  if (diagnostics.recoveredFromArtifacts) return 'RECOVERED CURRENT GENERATION';
  return defaultLabel;
}
