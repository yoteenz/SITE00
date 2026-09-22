import type { PageConceptPipelineLineageId } from './pageConceptCanonicalPipeline.js';
import {
  upsertPageConceptCandidates,
  type PageConceptCandidate,
  type PageConceptCandidateStatus,
} from '../designProjectBinding/designPageConceptModel.js';
import type { PageMobileConceptSlotId } from './pageConceptViewportAuthorityFamily.js';
import type { PageConceptGenerationState, PageConceptGeneratedArtifact } from './types.js';
import { renditionSlotToGalleryConceptId } from './constants.js';

function slotLetterFromMobileSlot(slot: PageMobileConceptSlotId): 'A' | 'B' | 'C' {
  if (slot === 'MOBILE_CONCEPT_A') return 'A';
  if (slot === 'MOBILE_CONCEPT_B') return 'B';
  return 'C';
}

function renditionSlotFromMobileSlot(slot: PageMobileConceptSlotId): 'RENDITION_A' | 'RENDITION_B' | 'RENDITION_C' {
  const letter = slotLetterFromMobileSlot(slot);
  return letter === 'A' ? 'RENDITION_A' : letter === 'B' ? 'RENDITION_B' : 'RENDITION_C';
}

function conceptTitleForSlot(slot: PageMobileConceptSlotId, territory?: string): string {
  const letter = slotLetterFromMobileSlot(slot);
  return territory ? `CONCEPT ${letter} · ${territory}` : `GPT2 MOBILE PAGE CONCEPT ${letter}`;
}

function jobForMobileConcept(
  jobs: readonly PageConceptGeneratedArtifact[],
  artifactId: string,
): PageConceptGeneratedArtifact | undefined {
  return jobs.find((j) => j.artifactId === artifactId);
}

function resolveActiveRunId(state: PageConceptGenerationState): string | null {
  return state.activeGenerationRunId ?? state.activeReviewRunId ?? state.pipelineSet?.pipelineSetId ?? null;
}

function artifactStatusFromJob(
  job: PageConceptGeneratedArtifact | undefined,
  conceptStatus: 'PENDING' | 'RUNNING' | 'READY' | 'FAILED',
): PageConceptCandidate['artifactStatus'] {
  if (job?.status === 'READY' || conceptStatus === 'READY') return 'READY';
  if (job?.status === 'FAILED' || conceptStatus === 'FAILED') return 'FAILED';
  if (job?.status === 'RUNNING' || conceptStatus === 'RUNNING') return 'RUNNING';
  return 'PENDING';
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

/** Upsert canonical GPT2 mobile (and legacy NBP) artifacts into the page concept gallery store. */
export function syncPageConceptGalleryFromGenerationState(state: PageConceptGenerationState): void {
  const mobileConcepts = state.pipelineSet?.mobileConcepts ?? [];
  const canonicalMobile =
    state.pipelineSet?.pipelineLineage === 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE' && mobileConcepts.length > 0;
  const activeRunId = resolveActiveRunId(state);
  const selectedMobileConceptId =
    state.pipelineSet?.viewportAuthorityFamily?.selectedMobileConceptId ??
    state.pipelineSet?.selectedMobileConceptId ??
    null;
  const pipelineId = (state.pipelineSet?.pipelineLineage ?? null) as PageConceptPipelineLineageId | null;

  const incoming: PageConceptCandidate[] = [];

  if (canonicalMobile) {
    for (const concept of mobileConcepts) {
      const job = jobForMobileConcept(state.generationJobs, concept.artifactId);
      const artifactStatus = artifactStatusFromJob(job, concept.status);
      if (artifactStatus !== 'READY' && artifactStatus !== 'RUNNING' && artifactStatus !== 'FAILED') {
        continue;
      }
      const renditionSlot = renditionSlotFromMobileSlot(concept.slot);
      const selected = selectedMobileConceptId === concept.conceptId;
      incoming.push({
        conceptId: concept.conceptId,
        projectId: state.projectId,
        pageId: state.pageId,
        conceptTitle: conceptTitleForSlot(concept.slot, concept.territoryLabel),
        conceptTerritory: concept.gpt2MobileDebug?.territoryDirective ?? concept.territoryLabel ?? concept.conceptId,
        creativeRationale: 'GPT2 mobile page authority — twin pipeline',
        visualReference: job?.imageUri ?? job?.artifactPath ?? concept.imageUri,
        mobileVisualReference: job?.imageUri ?? job?.artifactPath ?? concept.imageUri,
        desktopVisualReference: null,
        gpt2AuthorityConceptId: concept.conceptId,
        creativeInjectionId: state.pipelineSet?.creativeInjection?.injectionId ?? null,
        renditionSlot,
        generatedBy: 'GPT2',
        createdAt: concept.createdAt ?? job?.createdAt ?? new Date().toISOString(),
        lineage: {
          brandIntelligence: ['project-intelligence', 'page-intelligence'],
          creativeTerritories: [concept.slot],
        },
        status: selected ? 'SELECTED' : 'CANDIDATE',
        viewportScope: 'MOBILE',
        runId: activeRunId,
        artifactId: concept.artifactId,
        conceptSlot: concept.slot,
        pipelineId,
        artifactStatus,
        runGroup: 'CURRENT',
        runLabel: null,
        artifactRole: 'MOBILE_CANDIDATE',
        galleryFilterStatus: selected ? 'SELECTED' : artifactStatus === 'READY' ? 'CANDIDATE' : 'CANDIDATE',
      });
    }
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
        visualReference: mobileJob.imageUri ?? mobileJob.artifactPath ?? null,
        mobileVisualReference: mobileJob.imageUri ?? mobileJob.artifactPath ?? null,
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
