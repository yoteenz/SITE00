import {
  registerPageConceptRenditions,
  type PageConceptRenditionRegistration,
} from '../designProjectBinding/designPageConceptModel.js';
import type {
  PageConceptGeneratedArtifact,
  PageConceptGenerationState,
  PageConceptPipelineSet,
} from './types.js';
import {
  galleryConceptIdToRenditionSlot,
  renditionDisplayLabel,
  renditionSlotToGalleryConceptId,
} from './constants.js';

function appendHistory(
  state: PageConceptGenerationState,
  type: string,
  summary: string,
): PageConceptGenerationState {
  return {
    ...state,
    history: [...state.history, { type, at: new Date().toISOString(), summary }],
  };
}

export function applyPageConceptPipelineSet(
  state: PageConceptGenerationState,
  pipelineSet: PageConceptPipelineSet,
): PageConceptGenerationState {
  let generationStatus = state.generationStatus;
  if (pipelineSet.creativeInjectionError && !pipelineSet.creativeInjection) {
    generationStatus = 'FAILED';
  } else if (pipelineSet.gpt2AuthorityError && !pipelineSet.gpt2AuthorityConcept) {
    generationStatus = 'FAILED';
  } else if (pipelineSet.pipelineLineage === 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE') {
    if (pipelineSet.twinImplementationPackage) generationStatus = 'TWIN_IMPLEMENTATION_PACKAGE_READY';
    else if (pipelineSet.viewportAuthorityFamily?.status === 'LOCKED') generationStatus = 'VIEWPORT_FAMILY_LOCKED';
    else if (pipelineSet.viewportAuthorityFamily?.status === 'AWAITING_FOUNDER_FAMILY_REVIEW') {
      generationStatus = 'VIEWPORT_FAMILY_REVIEW';
    } else if (pipelineSet.mobileConcepts?.length) generationStatus = 'GPT2_MOBILE_AWAITING_SELECTION';
  } else if (pipelineSet.creativeInjection && pipelineSet.gpt2AuthorityConcept) {
    generationStatus = 'NBP_RUNNING';
  }
  return appendHistory(
    { ...state, pipelineSet, generationStatus },
    'page_creative_pipeline_ready',
    pipelineSet.gpt2AuthorityConcept?.conceptId ?? 'gpt2-pending',
  );
}

export function registerPageConceptGenerationJobs(
  state: PageConceptGenerationState,
  jobs: readonly PageConceptGeneratedArtifact[],
): PageConceptGenerationState {
  return { ...state, generationJobs: [...jobs] };
}

/** Retry merges new job rows over existing ones by artifactId. */
export function mergePageConceptGenerationJobs(
  state: PageConceptGenerationState,
  jobs: readonly PageConceptGeneratedArtifact[],
): PageConceptGenerationState {
  const byId = new Map(state.generationJobs.map((j) => [j.artifactId, j]));
  for (const job of jobs) byId.set(job.artifactId, job);
  return { ...state, generationJobs: [...byId.values()] };
}

export function mergePageConceptArtifactsIntoGallery(
  state: PageConceptGenerationState,
): PageConceptGenerationState {
  const gpt2 = state.pipelineSet?.gpt2AuthorityConcept ?? null;
  if (!gpt2) return state;

  const registrations: PageConceptRenditionRegistration[] = [];
  for (const slot of ['RENDITION_A', 'RENDITION_B', 'RENDITION_C'] as const) {
    const conceptId = renditionSlotToGalleryConceptId(slot);
    const mobileJob = state.generationJobs.find(
      (j) => j.renditionSlot === slot && j.viewport === 'MOBILE' && j.status === 'READY',
    );
    const desktopJob = state.generationJobs.find(
      (j) => j.renditionSlot === slot && j.viewport === 'DESKTOP' && j.status === 'READY',
    );
    registrations.push({
      conceptId,
      projectId: state.projectId,
      pageId: state.pageId,
      conceptTitle: renditionDisplayLabel(slot),
      conceptTerritory: gpt2.premise,
      creativeRationale: gpt2.visualLanguage,
      mobileVisualReference: mobileJob?.imageUri ?? mobileJob?.artifactPath ?? null,
      desktopVisualReference: desktopJob?.imageUri ?? desktopJob?.artifactPath ?? null,
      gpt2AuthorityConceptId: gpt2.conceptId,
      creativeInjectionId: state.pipelineSet?.creativeInjection?.injectionId ?? null,
      renditionSlot: slot,
    });
  }

  registerPageConceptRenditions(state.projectId, state.pageId, registrations);

  const readyCount = state.generationJobs.filter((j) => j.status === 'READY').length;
  const failedCount = state.generationJobs.filter((j) => j.status === 'FAILED').length;
  let generationStatus = state.generationStatus;
  if (readyCount === 6) generationStatus = 'READY_FOR_FOUNDER_REVIEW';
  else if (readyCount > 0 && failedCount > 0) generationStatus = 'PARTIAL_GENERATION';
  else if (failedCount > 0 && readyCount === 0) generationStatus = 'FAILED';

  return appendHistory(
    { ...state, generationStatus },
    'page_concept_generation_completed',
    `${readyCount}/6 NBP artifacts ready`,
  );
}

export function pageConceptVisualForViewport(
  conceptId: string,
  registrations: readonly PageConceptRenditionRegistration[],
  viewport: 'MOBILE' | 'DESKTOP' | 'TABLET',
): string | null {
  const row = registrations.find((r) => r.conceptId === conceptId);
  if (!row) return null;
  if (viewport === 'DESKTOP') return row.desktopVisualReference ?? row.mobileVisualReference;
  return row.mobileVisualReference ?? row.desktopVisualReference;
}

export { galleryConceptIdToRenditionSlot };
