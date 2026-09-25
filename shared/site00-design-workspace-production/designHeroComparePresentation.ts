/**
 * Hero CURRENT vs CONCEPT compare — latest artifact resolution + capture-matched framing.
 */

import type { PageConceptCandidate } from './designProjectBinding/designPageConceptModel.js';
import type { PageViewportId } from './designProjectBinding/pageViewportAuthority.js';
import { resolvePageConceptArtifactDisplayUrl } from './pageConceptPipeline/pageConceptArtifactDisplayUrl.js';
import {
  parseMobileConceptSlotFromArtifactId,
  resolveMobileConceptSlotForJob,
} from './pageConceptPipeline/pageConceptCandidateReconciliation.js';
import type { PageConceptGenerationState, PageConceptGeneratedArtifact } from './pageConceptPipeline/types.js';
import type { PageMobileConceptSlotId } from './pageConceptPipeline/pageConceptViewportAuthorityFamily.js';

export type DesignHeroCaptureDimensions = { width: number; height: number };

/** Match implementation snapshot / mobile capture authority used for GPT2 references. */
export const DESIGN_HERO_COMPARE_CAPTURE_DIMENSIONS: Record<PageViewportId, DesignHeroCaptureDimensions> = {
  MOBILE: { width: 390, height: 844 },
  TABLET: { width: 768, height: 1024 },
  DESKTOP: { width: 1440, height: 1024 },
};

function mobileSlotFromCandidate(concept: PageConceptCandidate): PageMobileConceptSlotId | null {
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

function latestReadyMobileJobForSlot(
  state: PageConceptGenerationState | null | undefined,
  slot: PageMobileConceptSlotId,
): PageConceptGeneratedArtifact | null {
  if (!state) return null;
  const jobs = state.generationJobs
    .filter((j) => j.provider === 'GPT2_MOBILE' && j.viewport === 'MOBILE' && j.status === 'READY')
    .filter((j) => resolveMobileConceptSlotForJob(j) === slot)
    .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
  return jobs.length > 0 ? jobs[jobs.length - 1]! : null;
}

function conceptRowPreviewUri(concept: PageConceptCandidate, viewport: PageViewportId): string | null {
  const cacheBust = concept.artifactId ?? concept.conceptId;
  if (viewport === 'DESKTOP') {
    return resolvePageConceptArtifactDisplayUrl(
      concept.desktopVisualReference ?? concept.visualReference,
      cacheBust,
    );
  }
  if (viewport === 'TABLET') {
    return resolvePageConceptArtifactDisplayUrl(concept.visualReference, cacheBust);
  }
  return resolvePageConceptArtifactDisplayUrl(
    concept.mobileVisualReference ?? concept.visualReference,
    cacheBust,
  );
}

/**
 * Hero CONCEPT pane — prefer latest READY GPT2 mobile job for the selected slot (not stale gallery URIs).
 */
export function resolveHeroCompareConceptPreviewSrc(input: {
  concept: PageConceptCandidate | null;
  viewport: PageViewportId;
  generationState: PageConceptGenerationState | null | undefined;
}): string | null {
  const { concept, viewport, generationState } = input;
  if (!concept) return null;

  if (viewport === 'MOBILE' && concept.artifactRole === 'MOBILE_CANDIDATE') {
    const slot = mobileSlotFromCandidate(concept);
    if (slot) {
      const job = latestReadyMobileJobForSlot(generationState, slot);
      if (job) {
        const fromJob = resolvePageConceptArtifactDisplayUrl(
          job.imageUri ?? job.artifactPath ?? null,
          job.artifactId,
        );
        if (fromJob) return fromJob;
      }
    }
  }

  return conceptRowPreviewUri(concept, viewport);
}

export function resolveDesignHeroCompareCaptureDimensions(viewport: PageViewportId): DesignHeroCaptureDimensions {
  return DESIGN_HERO_COMPARE_CAPTURE_DIMENSIONS[viewport] ?? DESIGN_HERO_COMPARE_CAPTURE_DIMENSIONS.MOBILE;
}
