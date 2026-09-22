import {
  inferPageConceptPipelineLineage,
  PAGE_CONCEPT_CANONICAL_PIPELINE_ID,
  type PageConceptPipelineLineageId,
} from './pageConceptCanonicalPipeline.js';
import {
  upsertPageConceptCandidates,
  type PageConceptCandidate,
  type PageConceptCandidateStatus,
} from '../designProjectBinding/designPageConceptModel.js';
import type { PageConceptGenerationState } from './types.js';
import { renditionSlotToGalleryConceptId } from './constants.js';
import { buildMobileCandidatesFromGenerationJobs } from './pageConceptCandidateReconciliation.js';
import { resolvePageConceptArtifactDisplayUrl } from './pageConceptArtifactDisplayUrl.js';

function resolveActiveRunId(state: PageConceptGenerationState): string | null {
  return state.activeGenerationRunId ?? state.activeReviewRunId ?? state.pipelineSet?.pipelineSetId ?? null;
}

function buildViewportInterpretationCandidates(
  state: PageConceptGenerationState,
  target: 'TABLET' | 'DESKTOP',
  pipelineId: PageConceptPipelineLineageId | null,
  activeRunId: string | null,
): PageConceptCandidate[] {
  const provider = target === 'TABLET' ? 'GPT2_TABLET' : 'GPT2_DESKTOP';
  const role = target === 'TABLET' ? 'TABLET_INTERPRETATION' : 'DESKTOP_INTERPRETATION';
  const family = state.pipelineSet?.viewportAuthorityFamily ?? null;
  const activeArtifactId = target === 'TABLET' ? family?.tabletArtifactId : family?.desktopArtifactId;
  const jobs = state.generationJobs
    .filter((j) => j.provider === provider && j.viewport === target)
    .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));

  const rows: PageConceptCandidate[] = [];
  for (let index = 0; index < jobs.length; index++) {
    const job = jobs[index]!;
    if (job.status !== 'READY' && job.status !== 'RUNNING' && job.status !== 'FAILED') continue;
    const version = `V${index + 1}`;
    const isLatest = index === jobs.length - 1;
    const isActive = Boolean(activeArtifactId && job.artifactId === activeArtifactId);
    const runGroup = isLatest || isActive ? 'CURRENT' : 'HISTORY';
    const conceptId = job.renditionId?.trim() || `${target.toLowerCase()}-interp-${job.artifactId}`;
    const image = resolvePageConceptArtifactDisplayUrl(job.imageUri ?? job.artifactPath ?? null);
    rows.push({
      conceptId,
      projectId: state.projectId.trim().toLowerCase(),
      pageId: state.pageId,
      conceptTitle: `${target} INTERPRETATION ${version}`,
      conceptTerritory: job.displayTitle ?? `${target} authored interpretation`,
      creativeRationale: 'GPT2 viewport interpretation — twin pipeline',
      visualReference: image,
      mobileVisualReference: null,
      desktopVisualReference: target === 'DESKTOP' ? image : null,
      gpt2AuthorityConceptId: job.gpt2AuthorityConceptId ?? null,
      creativeInjectionId: state.pipelineSet?.creativeInjection?.injectionId ?? null,
      generatedBy: 'GPT2',
      createdAt: job.createdAt ?? new Date().toISOString(),
      lineage: { creativeTerritories: [target] },
      status: isActive ? 'SELECTED' : 'CANDIDATE',
      viewportScope: target,
      runId: activeRunId,
      artifactId: job.artifactId,
      conceptSlot: null,
      pipelineId,
      artifactStatus: job.status === 'READY' ? 'READY' : job.status === 'FAILED' ? 'FAILED' : 'RUNNING',
      runGroup,
      runLabel: version,
      artifactRole: role,
      galleryFilterStatus: isActive ? 'SELECTED' : runGroup === 'HISTORY' ? 'HISTORICAL' : 'CANDIDATE',
    });
  }
  return rows;
}

function galleryStatusForCandidate(input: {
  artifactStatus: PageConceptCandidate['artifactStatus'];
  candidateStatus: PageConceptCandidateStatus;
  runGroup: PageConceptCandidate['runGroup'];
}): PageConceptCandidateStatus {
  if (input.candidateStatus === 'SELECTED') return 'SELECTED';
  if (input.runGroup === 'HISTORY' || input.candidateStatus === 'ARCHIVED') return 'ARCHIVED';
  if (input.artifactStatus === 'READY') return 'CANDIDATE';
  return 'CANDIDATE';
}

function isCanonicalGpt2MobilePipelineState(state: PageConceptGenerationState): boolean {
  const lineage = inferPageConceptPipelineLineage({
    pipelineLineage: state.pipelineSet?.pipelineLineage ?? null,
    generationJobs: state.generationJobs,
  });
  if (lineage !== PAGE_CONCEPT_CANONICAL_PIPELINE_ID) return false;
  return (
    (state.pipelineSet?.mobileConcepts?.length ?? 0) > 0 ||
    state.generationJobs.some((j) => j.provider === 'GPT2_MOBILE')
  );
}

/** Upsert canonical GPT2 mobile (and legacy NBP) artifacts into the page concept gallery store. */
export function syncPageConceptGalleryFromGenerationState(state: PageConceptGenerationState): void {
  const canonicalMobile = isCanonicalGpt2MobilePipelineState(state);
  const activeRunId = resolveActiveRunId(state);
  const selectedMobileConceptId =
    state.pipelineSet?.viewportAuthorityFamily?.selectedMobileConceptId ??
    state.pipelineSet?.selectedMobileConceptId ??
    null;
  const pipelineId = inferPageConceptPipelineLineage({
    pipelineLineage: state.pipelineSet?.pipelineLineage ?? null,
    generationJobs: state.generationJobs,
  });

  const incoming: PageConceptCandidate[] = [];

  if (canonicalMobile) {
    incoming.push(...buildMobileCandidatesFromGenerationJobs(state));
  } else {
    const gpt2 = state.pipelineSet?.gpt2AuthorityConcept ?? null;
    if (!gpt2) return;
    for (const slot of ['RENDITION_A', 'RENDITION_B', 'RENDITION_C'] as const) {
      const mobileJob = state.generationJobs.find(
        (j) => j.renditionSlot === slot && j.viewport === 'MOBILE' && j.status === 'READY',
      );
      if (!mobileJob) continue;
      const galleryId = renditionSlotToGalleryConceptId(slot);
      incoming.push({
        conceptId: galleryId,
        projectId: state.projectId,
        pageId: state.pageId,
        conceptTitle: slot.replace('_', ' '),
        conceptTerritory: gpt2.premise,
        creativeRationale: gpt2.visualLanguage,
        visualReference: resolvePageConceptArtifactDisplayUrl(mobileJob.imageUri ?? mobileJob.artifactPath ?? null),
        mobileVisualReference: resolvePageConceptArtifactDisplayUrl(mobileJob.imageUri ?? mobileJob.artifactPath ?? null),
        desktopVisualReference: null,
        gpt2AuthorityConceptId: gpt2.conceptId,
        creativeInjectionId: state.pipelineSet?.creativeInjection?.injectionId ?? null,
        renditionSlot: slot,
        generatedBy: 'GPT2',
        createdAt: mobileJob.createdAt ?? new Date().toISOString(),
        lineage: { creativeTerritories: [slot] },
        status: 'CANDIDATE',
        viewportScope: 'MOBILE',
        runId: activeRunId,
        artifactId: mobileJob.artifactId,
        conceptSlot: null,
        pipelineId,
        artifactStatus: 'READY',
        runGroup: 'CURRENT',
        runLabel: null,
        artifactRole: 'MOBILE_CANDIDATE',
        galleryFilterStatus: 'CANDIDATE',
      });
    }
  }

  if (pipelineId === PAGE_CONCEPT_CANONICAL_PIPELINE_ID) {
    incoming.push(
      ...buildViewportInterpretationCandidates(state, 'TABLET', pipelineId, activeRunId),
      ...buildViewportInterpretationCandidates(state, 'DESKTOP', pipelineId, activeRunId),
    );
  }

  if (incoming.length === 0) return;

  for (const row of incoming) {
    row.status = galleryStatusForCandidate({
      artifactStatus: row.artifactStatus,
      candidateStatus: row.status,
      runGroup: row.runGroup,
    });
    if (selectedMobileConceptId && row.conceptId === selectedMobileConceptId) {
      row.status = 'SELECTED';
      row.galleryFilterStatus = 'SELECTED';
    }
  }

  upsertPageConceptCandidates(state.projectId, state.pageId, incoming, {
    activeRunId,
    selectedMobileConceptId,
  });
}
