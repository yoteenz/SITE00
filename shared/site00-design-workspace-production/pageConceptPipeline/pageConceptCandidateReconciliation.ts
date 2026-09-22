/**
 * P0.VR.DESIGN-WORKSPACE-ARTIFACT-SYNC-REGEN-PANEL-FINALIZATION1 —
 * One canonical candidate list derived from persisted generation jobs + mobileConcepts.
 */

import type { PageConceptCandidate } from '../designProjectBinding/designPageConceptModel.js';
import {
  inferPageConceptPipelineLineage,
  PAGE_CONCEPT_CANONICAL_PIPELINE_ID,
  type PageConceptPipelineLineageId,
} from './pageConceptCanonicalPipeline.js';
import type {
  PageConceptGeneratedArtifact,
  PageConceptGenerationState,
} from './types.js';
import {
  mobileConceptArtifactId,
  PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS,
  type PageGpt2MobileConcept,
  type PageMobileConceptSlotId,
} from './pageConceptViewportAuthorityFamily.js';
import { gpt2MobileConceptRenditionSlot } from './pageConceptGpt2MobilePageAuthority.js';

function slotLetter(slot: PageMobileConceptSlotId): 'A' | 'B' | 'C' {
  if (slot === 'MOBILE_CONCEPT_A') return 'A';
  if (slot === 'MOBILE_CONCEPT_B') return 'B';
  return 'C';
}

export function parseMobileConceptSlotFromArtifactId(artifactId: string): PageMobileConceptSlotId | null {
  if (artifactId.includes('MOBILE_CONCEPT_A')) return 'MOBILE_CONCEPT_A';
  if (artifactId.includes('MOBILE_CONCEPT_B')) return 'MOBILE_CONCEPT_B';
  if (artifactId.includes('MOBILE_CONCEPT_C')) return 'MOBILE_CONCEPT_C';
  return null;
}

export function resolveMobileConceptSlotForJob(job: PageConceptGeneratedArtifact): PageMobileConceptSlotId | null {
  const fromArtifact = parseMobileConceptSlotFromArtifactId(job.artifactId);
  if (fromArtifact) return fromArtifact;
  if (job.renditionSlot === 'RENDITION_A') return 'MOBILE_CONCEPT_A';
  if (job.renditionSlot === 'RENDITION_B') return 'MOBILE_CONCEPT_B';
  if (job.renditionSlot === 'RENDITION_C') return 'MOBILE_CONCEPT_C';
  return null;
}

function conceptTitleForSlot(slot: PageMobileConceptSlotId, territory?: string): string {
  const letter = slotLetter(slot);
  return territory ? `CONCEPT ${letter} · ${territory}` : `GPT2 MOBILE PAGE CONCEPT ${letter}`;
}

function mobileConceptMetaForSlot(
  mobileConcepts: readonly PageGpt2MobileConcept[],
  slot: PageMobileConceptSlotId,
  artifactId: string,
): PageGpt2MobileConcept | undefined {
  return (
    mobileConcepts.find((c) => c.slot === slot && c.artifactId === artifactId) ??
    mobileConcepts.find((c) => c.slot === slot)
  );
}

function resolveActiveRunId(state: PageConceptGenerationState): string | null {
  return state.activeGenerationRunId ?? state.activeReviewRunId ?? state.pipelineSet?.pipelineSetId ?? null;
}

function buildMobileCandidateFromJob(input: {
  state: PageConceptGenerationState;
  job: PageConceptGeneratedArtifact;
  slot: PageMobileConceptSlotId;
  meta: PageGpt2MobileConcept | undefined;
  pipelineId: PageConceptPipelineLineageId;
  activeRunId: string | null;
  selectedMobileConceptId: string | null;
  runGroup: PageConceptCandidate['runGroup'];
  runLabel: string | null;
}): PageConceptCandidate {
  const { job, slot, meta, state } = input;
  const renditionSlot = gpt2MobileConceptRenditionSlot(slot);
  const conceptId = meta?.conceptId ?? job.gpt2AuthorityConceptId ?? `pg2m-page-${slot}-${state.pipelineSet?.pipelineSetId ?? 'run'}`;
  const selected = input.selectedMobileConceptId === conceptId;
  const artifactStatus =
    job.status === 'READY' ? 'READY'
    : job.status === 'FAILED' ? 'FAILED'
    : job.status === 'RUNNING' ? 'RUNNING'
    : 'PENDING';
  const image = job.imageUri ?? job.artifactPath ?? meta?.imageUri ?? null;

  return {
    conceptId,
    projectId: state.projectId.trim().toLowerCase(),
    pageId: state.pageId,
    conceptTitle: conceptTitleForSlot(slot, meta?.territoryLabel ?? job.displayTitle ?? undefined),
    conceptTerritory: meta?.gpt2MobileDebug?.territoryDirective ?? meta?.territoryLabel ?? job.displayTitle ?? conceptId,
    creativeRationale: meta?.gpt2MobileDebug?.territoryLabel ?? 'GPT2 mobile page authority — twin pipeline',
    visualReference: image,
    mobileVisualReference: image,
    desktopVisualReference: null,
    gpt2AuthorityConceptId: conceptId,
    creativeInjectionId: state.pipelineSet?.creativeInjection?.injectionId ?? null,
    renditionSlot,
    generatedBy: 'GPT2',
    createdAt: meta?.createdAt ?? job.createdAt ?? new Date().toISOString(),
    lineage: { brandIntelligence: ['project-intelligence', 'page-intelligence'], creativeTerritories: [slot] },
    status: selected ? 'SELECTED' : 'CANDIDATE',
    viewportScope: 'MOBILE',
    runId: input.activeRunId,
    artifactId: job.artifactId,
    conceptSlot: slot,
    pipelineId: input.pipelineId,
    artifactStatus,
    runGroup: input.runGroup,
    runLabel: input.runLabel,
    artifactRole: 'MOBILE_CANDIDATE',
    galleryFilterStatus: selected ? 'SELECTED' : input.runGroup === 'HISTORY' ? 'HISTORICAL' : 'CANDIDATE',
  };
}

/** Idempotent: build canonical mobile candidates from READY/RUNNING/FAILED GPT2 mobile jobs (all versions). */
export function buildMobileCandidatesFromGenerationJobs(state: PageConceptGenerationState): PageConceptCandidate[] {
  const pipelineId = inferPageConceptPipelineLineage({
    pipelineLineage: state.pipelineSet?.pipelineLineage ?? null,
    generationJobs: state.generationJobs,
  });
  if (pipelineId !== PAGE_CONCEPT_CANONICAL_PIPELINE_ID) return [];

  const mobileConcepts = state.pipelineSet?.mobileConcepts ?? [];
  const selectedMobileConceptId =
    state.pipelineSet?.viewportAuthorityFamily?.selectedMobileConceptId ??
    state.pipelineSet?.selectedMobileConceptId ??
    null;
  const activeRunId = resolveActiveRunId(state);

  const mobileJobs = state.generationJobs
    .filter((j) => j.provider === 'GPT2_MOBILE' && j.viewport === 'MOBILE')
    .filter((j) => j.status === 'READY' || j.status === 'RUNNING' || j.status === 'FAILED');

  const bySlot = new Map<PageMobileConceptSlotId, PageConceptGeneratedArtifact[]>();
  for (const job of mobileJobs) {
    const slot = resolveMobileConceptSlotForJob(job);
    if (!slot) continue;
    const list = bySlot.get(slot) ?? [];
    list.push(job);
    bySlot.set(slot, list);
  }

  const rows: PageConceptCandidate[] = [];
  for (const slot of PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS) {
    const jobs = (bySlot.get(slot) ?? []).sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
    if (jobs.length === 0) {
      const meta = mobileConcepts.find((c) => c.slot === slot);
      const canonicalArtifactId = mobileConceptArtifactId(slot);
      if (meta && (meta.status === 'READY' || meta.status === 'RUNNING' || meta.status === 'FAILED')) {
        rows.push(
          buildMobileCandidateFromJob({
            state,
            job: {
              artifactId: meta.artifactId,
              projectId: state.projectId,
              pageId: state.pageId,
              renditionSlot: gpt2MobileConceptRenditionSlot(slot),
              viewport: 'MOBILE',
              captureSetId: state.pipelineSet?.captureSetId ?? '',
              projectContextVersion: '',
              pageContextVersion: '',
              functionContractId: state.pipelineSet?.functionContractId ?? '',
              creativeInjectionId: state.pipelineSet?.creativeInjection?.injectionId ?? '',
              gpt2AuthorityConceptId: meta.conceptId,
              renditionId: meta.conceptId,
              provider: 'GPT2_MOBILE',
              model: '',
              providerJobId: null,
              promptVersion: '',
              createdAt: meta.createdAt,
              status: meta.status,
              artifactPath: meta.imageUri,
              imageUri: meta.imageUri,
              width: 768,
              height: 1376,
            },
            slot,
            meta,
            pipelineId,
            activeRunId,
            selectedMobileConceptId,
            runGroup: 'CURRENT',
            runLabel: null,
          }),
        );
      }
      continue;
    }
    jobs.forEach((job, index) => {
      const isLatest = index === jobs.length - 1;
      const meta = mobileConceptMetaForSlot(mobileConcepts, slot, job.artifactId);
      rows.push(
        buildMobileCandidateFromJob({
          state,
          job,
          slot,
          meta,
          pipelineId,
          activeRunId,
          selectedMobileConceptId,
          runGroup: isLatest ? 'CURRENT' : 'HISTORY',
          runLabel: jobs.length > 1 ? `V${index + 1}` : null,
        }),
      );
    });
  }

  return rows;
}

export function reconcilePageConceptCandidatesFromGenerationState(
  state: PageConceptGenerationState,
): PageConceptCandidate[] {
  return buildMobileCandidatesFromGenerationJobs(state);
}

export function generationStateHasOrphanReadyMobileJobs(state: PageConceptGenerationState): boolean {
  const readyJobs = state.generationJobs.filter((j) => j.provider === 'GPT2_MOBILE' && j.status === 'READY');
  if (readyJobs.length === 0) return false;
  const built = buildMobileCandidatesFromGenerationJobs(state);
  return built.filter((c) => c.artifactStatus === 'READY').length === 0;
}
