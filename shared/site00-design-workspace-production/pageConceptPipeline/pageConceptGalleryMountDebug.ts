import type { PageConceptGenerationState } from './types.js';
import type { PageConceptGalleryServerMountTrace } from './pageConceptGalleryServerHydration.js';

export function samplePageConceptGalleryImageHost(state: PageConceptGenerationState): string {
  for (const job of state.generationJobs) {
    if (job.provider !== 'GPT2_MOBILE' || job.status !== 'READY') continue;
    const uri = job.imageUri?.trim();
    if (!uri) continue;
    if (uri.startsWith('blob:') || uri.startsWith('data:')) return 'local-cache';
    try {
      return new URL(uri).hostname;
    } catch {
      return 'invalid-uri';
    }
  }
  for (const concept of state.pipelineSet?.mobileConcepts ?? []) {
    if (concept.status !== 'READY') continue;
    const uri = concept.imageUri?.trim();
    if (!uri) continue;
    if (uri.startsWith('blob:') || uri.startsWith('data:')) return 'local-cache';
    try {
      return new URL(uri).hostname;
    } catch {
      return 'invalid-uri';
    }
  }
  return 'none';
}

export function pageConceptGalleryMountDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.localStorage.getItem('site00:page-concept-gallery-mount-debug') === '1') return true;
    const params = new URLSearchParams(window.location.search);
    if (params.get('galleryMountDebug') === '1') {
      window.localStorage.setItem('site00:page-concept-gallery-mount-debug', '1');
      return true;
    }
  } catch {
    /* ignore */
  }
  return import.meta.env.DEV;
}

export function formatPageConceptGalleryMountDebugLine(input: {
  trace: PageConceptGalleryServerMountTrace | null;
  generationState: PageConceptGenerationState;
  persistedServerRunId: string | null;
}): string {
  const runId =
    input.trace?.runId ??
    input.persistedServerRunId ??
    input.generationState.activeGenerationRunId ??
    input.generationState.activeReviewRunId ??
    '—';
  const phase = input.trace?.phase ?? '—';
  const imageHost = samplePageConceptGalleryImageHost(input.generationState);
  return `Mounted run: ${runId} (${phase}) / image host: ${imageHost}`;
}
