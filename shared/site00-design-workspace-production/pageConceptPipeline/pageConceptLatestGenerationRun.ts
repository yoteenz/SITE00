/**
 * P0.VR.DESIGN-WORKSPACE-PREVIEW-FIT-LATEST-RUN-AND-HERO-RAIL-RESTORE1
 * Authoritative CURRENT GENERATION run + per-slot artifact resolution for gallery/hero.
 */

import type { PageConceptCandidate } from '../designProjectBinding/designPageConceptModel.js';
import type { PageViewportId } from '../designProjectBinding/pageViewportAuthority.js';
import {
  inferPageConceptPipelineLineage,
  PAGE_CONCEPT_CANONICAL_PIPELINE_ID,
} from './pageConceptCanonicalPipeline.js';
import { pageConceptCandidateMatchesViewportGallery } from './pageConceptViewportGalleryScope.js';
import type { PageConceptGenerationState } from './types.js';
import {
  PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS,
  type PageMobileConceptSlotId,
} from './pageConceptViewportAuthorityFamily.js';
import { parseMobileConceptSlotFromArtifactId } from './pageConceptCandidateReconciliation.js';

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

export function resolvePageConceptLatestGenerationDiagnostics(
  state: PageConceptGenerationState,
): PageConceptLatestGenerationDiagnostics {
  const activeGenerationRunId = resolvePageConceptActiveGenerationRunId(state);
  const activeGenerationCreatedAt = runTimestamp(state) || null;
  const slotArtifactIds: Partial<Record<'A' | 'B' | 'C', string | null>> = {};
  const slotVersions: Partial<Record<'A' | 'B' | 'C', number>> = {};

  const pipelineId = inferPageConceptPipelineLineage({
    pipelineLineage: state.pipelineSet?.pipelineLineage ?? null,
    generationJobs: state.generationJobs,
  });
  if (pipelineId !== PAGE_CONCEPT_CANONICAL_PIPELINE_ID) {
    return {
      activeGenerationRunId,
      activeGenerationCreatedAt,
      latestGenerationResolution: 'NO_SUCCESSFUL_RUN',
      slotArtifactIds,
      slotVersions,
    };
  }

  const mobileJobs = state.generationJobs
    .filter((j) => j.provider === 'GPT2_MOBILE' && j.viewport === 'MOBILE')
    .filter((j) => j.status === 'READY' || j.status === 'RUNNING' || j.status === 'FAILED')
    .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));

  for (const slot of PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS) {
    const letter = slotLetter(slot);
    const jobs = mobileJobs.filter((j) => parseMobileConceptSlotFromArtifactId(j.artifactId) === slot);
    if (jobs.length === 0) continue;
    const latest = jobs[jobs.length - 1]!;
    slotArtifactIds[letter] = latest.artifactId;
    slotVersions[letter] = jobs.length;
  }

  const readyCount = Object.values(slotArtifactIds).filter(Boolean).length;
  const running = mobileJobs.some((j) => j.status === 'RUNNING');
  let latestGenerationResolution: PageConceptLatestGenerationResolution = 'NO_SUCCESSFUL_RUN';
  if (readyCount === 0 && running) latestGenerationResolution = 'ACTIVE_RUN_IN_PROGRESS';
  else if (readyCount > 0 && readyCount < 3) latestGenerationResolution = 'LATEST_RUN_PARTIAL';
  else if (readyCount >= 3) latestGenerationResolution = 'LATEST_RUN_READY';

  return {
    activeGenerationRunId,
    activeGenerationCreatedAt,
    latestGenerationResolution,
    slotArtifactIds,
    slotVersions,
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
    return [...bySlotFallback.values(), ...interpCurrent.filter((c) => c.runGroup === 'CURRENT')];
  }
  const diagnostics = resolvePageConceptLatestGenerationDiagnostics(input.state);

  const bySlot = new Map<PageMobileConceptSlotId, PageConceptCandidate>();
  for (const c of mobileCurrent) {
    if (!c.conceptSlot) continue;
    const existing = bySlot.get(c.conceptSlot);
    if (!existing || (c.createdAt ?? '') >= (existing.createdAt ?? '')) {
      bySlot.set(c.conceptSlot, c);
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
    if (activeRunId && row.runId && row.runId !== activeRunId && row.runGroup === 'HISTORY') continue;
    resolvedMobile.push(row);
  }

  const mobileOut =
    resolvedMobile.length > 0 ?
      resolvedMobile
    : mobileCurrent.filter((c) => !activeRunId || !c.runId || c.runId === activeRunId);

  return [...mobileOut, ...interpCurrent];
}

export function pageConceptCurrentGenerationUnresolvedMessage(
  diagnostics: PageConceptLatestGenerationDiagnostics,
): string | null {
  if (diagnostics.latestGenerationResolution === 'NO_SUCCESSFUL_RUN') {
    return 'CURRENT GENERATION COULD NOT BE RESOLVED';
  }
  return null;
}
