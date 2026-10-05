/**
 * Keep pipelineSet.mobileConcepts aligned with READY GPT2 mobile jobs so gallery conceptIds
 * (often derived from gpt2AuthorityConceptId) resolve for founder select/confirm actions.
 */

import type { PageGpt2MobileConcept, PageMobileConceptSlotId } from './pageConceptViewportAuthorityFamily.js';
import type { PageConceptGenerationState, PageConceptPipelineSet } from './types.js';
import { PAGE_CONCEPT_CANONICAL_PIPELINE_ID } from './pageConceptCanonicalPipeline.js';
import {
  parseMobileConceptSlotFromArtifactId,
  resolveMobileConceptSlotForJob,
} from './pageConceptCandidateReconciliation.js';

function latestReadyJobForSlot(
  state: PageConceptGenerationState,
  slot: PageMobileConceptSlotId,
): import('./types.js').PageConceptGeneratedArtifact | null {
  const jobs = state.generationJobs
    .filter((j) => j.provider === 'GPT2_MOBILE' && j.viewport === 'MOBILE' && j.status === 'READY')
    .filter((j) => resolveMobileConceptSlotForJob(j) === slot)
    .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
  return jobs.at(-1) ?? null;
}

function conceptIdForJob(
  state: PageConceptGenerationState,
  slot: PageMobileConceptSlotId,
  job: import('./types.js').PageConceptGeneratedArtifact,
  meta: PageGpt2MobileConcept | undefined,
): string {
  return (
    meta?.conceptId ??
    job.gpt2AuthorityConceptId ??
    `pg2m-page-${slot}-${state.pipelineSet?.pipelineSetId ?? state.activeGenerationRunId ?? 'run'}`
  );
}

/** CGPT brief ids for viewport-family orchestration when only creativeInjection was persisted on the run. */
export function resolveCgptBriefIdsForViewportFamily(
  ps: PageConceptPipelineSet,
  generationJobs: readonly import('./types.js').PageConceptGeneratedArtifact[] = [],
): {
  briefId: string;
  briefVersion: string;
} {
  if (ps.cgptCreativeBrief) {
    return { briefId: ps.cgptCreativeBrief.briefId, briefVersion: ps.cgptCreativeBrief.version };
  }
  const inj = ps.creativeInjection;
  if (inj) return { briefId: inj.injectionId, briefVersion: 'v1' };
  const fromJob = generationJobs.find(
    (j) => j.provider === 'GPT2_MOBILE' && j.creativeInjectionId?.trim(),
  )?.creativeInjectionId;
  if (fromJob) return { briefId: fromJob, briefVersion: 'v1' };
  return { briefId: `gallery-${ps.pipelineSetId}`, briefVersion: 'v1' };
}

export function ensureGpt2MobileConceptCatalog(state: PageConceptGenerationState): PageConceptGenerationState {
  const ps = state.pipelineSet;
  if (!ps) return state;
  if (ps.pipelineLineage !== PAGE_CONCEPT_CANONICAL_PIPELINE_ID) return state;

  const slots: PageMobileConceptSlotId[] = ['MOBILE_CONCEPT_A', 'MOBILE_CONCEPT_B', 'MOBILE_CONCEPT_C'];
  const existing = [...(ps.mobileConcepts ?? [])];
  let changed = false;

  for (const slot of slots) {
    const job = latestReadyJobForSlot(state, slot);
    if (!job) continue;
    const meta = existing.find((c) => c.slot === slot && c.artifactId === job.artifactId);
    const conceptId = conceptIdForJob(state, slot, job, meta);
    if (meta) {
      continue;
    }
    const bySlot = existing.find((c) => c.slot === slot);
    if (bySlot) {
      const idx = existing.indexOf(bySlot);
      existing[idx] = {
        ...bySlot,
        artifactId: job.artifactId,
        conceptId: bySlot.conceptId || conceptId,
        imageUri: job.imageUri ?? job.artifactPath ?? bySlot.imageUri,
        status: 'READY',
      };
      changed = true;
      continue;
    }
    existing.push({
      conceptId,
      slot,
      artifactId: job.artifactId,
      imageUri: job.imageUri ?? job.artifactPath ?? null,
      status: 'READY',
      createdAt: job.createdAt ?? new Date().toISOString(),
      territoryLabel: job.displayTitle ?? undefined,
    });
    changed = true;
  }

  if (!changed) return state;
  return {
    ...state,
    pipelineSet: {
      ...ps,
      mobileConcepts: existing,
    },
  };
}

/** Map gallery / rail conceptId to a pipeline mobileConcept row (handles gpt2AuthorityConceptId aliases). */
export function resolveMobileConceptForSelection(
  state: PageConceptGenerationState,
  conceptId: string,
): PageGpt2MobileConcept | null {
  const ps = state.pipelineSet;
  if (!ps?.mobileConcepts?.length) return null;
  const direct = ps.mobileConcepts.find((c) => c.conceptId === conceptId);
  if (direct) return direct;

  const byAlias = ps.mobileConcepts.find(
    (c) =>
      state.generationJobs.some(
        (j) =>
          j.provider === 'GPT2_MOBILE' &&
          j.gpt2AuthorityConceptId === conceptId &&
          resolveMobileConceptSlotForJob(j) === c.slot,
      ),
  );
  if (byAlias) return byAlias;

  const job = state.generationJobs.find(
    (j) =>
      j.provider === 'GPT2_MOBILE' &&
      j.viewport === 'MOBILE' &&
      (j.gpt2AuthorityConceptId === conceptId || j.artifactId === conceptId),
  );
  if (job) {
    const slot = resolveMobileConceptSlotForJob(job) ?? parseMobileConceptSlotFromArtifactId(job.artifactId);
    if (slot) {
      return (
        ps.mobileConcepts.find((c) => c.slot === slot && c.artifactId === job.artifactId) ??
        ps.mobileConcepts.find((c) => c.slot === slot) ??
        null
      );
    }
  }

  const slotFromId = conceptId.includes('MOBILE_CONCEPT_A') ? 'MOBILE_CONCEPT_A'
    : conceptId.includes('MOBILE_CONCEPT_B') ? 'MOBILE_CONCEPT_B'
    : conceptId.includes('MOBILE_CONCEPT_C') ? 'MOBILE_CONCEPT_C'
    : null;
  if (slotFromId) {
    return ps.mobileConcepts.find((c) => c.slot === slotFromId) ?? null;
  }

  return null;
}

/** Map pipeline / authority conceptId to a visible MOBILE gallery row conceptId (alias-safe). */
export function resolveMobileGalleryCandidateConceptId(input: {
  state: PageConceptGenerationState;
  mobileGalleryRows: readonly { conceptId: string; gpt2AuthorityConceptId?: string | null }[];
  selectedMobileConceptId: string | null;
}): string | null {
  const selected = input.selectedMobileConceptId?.trim();
  if (!selected) return null;
  const direct = input.mobileGalleryRows.find((c) => c.conceptId === selected);
  if (direct) return direct.conceptId;
  const fromPipeline = resolveMobileConceptForSelection(input.state, selected);
  if (fromPipeline) {
    const row = input.mobileGalleryRows.find((c) => c.conceptId === fromPipeline.conceptId);
    if (row) return row.conceptId;
  }
  const byAlias = input.mobileGalleryRows.find((c) => c.gpt2AuthorityConceptId === selected);
  return byAlias?.conceptId ?? null;
}
