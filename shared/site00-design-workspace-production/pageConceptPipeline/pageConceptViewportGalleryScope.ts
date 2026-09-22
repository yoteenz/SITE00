/**
 * P0.VR.DESIGN-WORKSPACE-VIEWPORT-GALLERIES-CORRECTION1 — one gallery per viewport mode.
 */

import type { PageViewportId } from '../designProjectBinding/pageViewportAuthority.js';
import type { PageConceptCandidate } from '../designProjectBinding/designPageConceptModel.js';
import type { PageConceptGenerationState } from './types.js';
import { pageConceptGenerationStateHasReadyMobileArtifacts } from './pageConceptGalleryHydration.js';

export type PageConceptViewportGalleryTitle = {
  title: string;
  currentGroupLabel: string;
  historyGroupLabel: string;
};

export function resolvePageConceptViewportGalleryTitle(viewport: PageViewportId): PageConceptViewportGalleryTitle {
  if (viewport === 'TABLET') {
    return {
      title: 'TABLET INTERPRETATIONS',
      currentGroupLabel: 'CURRENT INTERPRETATION',
      historyGroupLabel: 'PREVIOUS TABLET VERSIONS',
    };
  }
  if (viewport === 'DESKTOP') {
    return {
      title: 'DESKTOP INTERPRETATIONS',
      currentGroupLabel: 'CURRENT INTERPRETATION',
      historyGroupLabel: 'PREVIOUS DESKTOP VERSIONS',
    };
  }
  return {
    title: 'CONCEPT CANDIDATE GALLERY',
    currentGroupLabel: 'CURRENT GENERATION',
    historyGroupLabel: 'PREVIOUS GENERATIONS',
  };
}

/** Strict gallery membership — never mix mobile candidates with tablet/desktop interpretations. */
export function pageConceptCandidateMatchesViewportGallery(
  concept: PageConceptCandidate,
  viewport: PageViewportId,
): boolean {
  if (viewport === 'MOBILE') {
    return concept.artifactRole === 'MOBILE_CANDIDATE' || (
      concept.viewportScope === 'MOBILE' &&
      concept.artifactRole !== 'TABLET_INTERPRETATION' &&
      concept.artifactRole !== 'DESKTOP_INTERPRETATION'
    );
  }
  if (viewport === 'TABLET') {
    return concept.artifactRole === 'TABLET_INTERPRETATION' && concept.viewportScope === 'TABLET';
  }
  return concept.artifactRole === 'DESKTOP_INTERPRETATION' && concept.viewportScope === 'DESKTOP';
}

export function listPageConceptCandidatesForViewportGallery(
  all: readonly PageConceptCandidate[],
  viewport: PageViewportId,
): readonly PageConceptCandidate[] {
  return all.filter((c) => pageConceptCandidateMatchesViewportGallery(c, viewport));
}

export type PageConceptViewportGalleryEmpty = {
  message: string | null;
  secondaryLine: string | null;
  testId: 'gallery-page-concept-empty' | 'gallery-page-concept-load-failed' | null;
};

export function resolvePageConceptViewportGalleryEmptyPresentation(input: {
  viewport: PageViewportId;
  scoped: readonly PageConceptCandidate[];
  generationState: PageConceptGenerationState;
}): PageConceptViewportGalleryEmpty {
  const { viewport, scoped, generationState } = input;
  const family = generationState.pipelineSet?.viewportAuthorityFamily ?? null;
  const hasReady = scoped.some(
    (c) => c.artifactStatus === 'READY' || c.mobileVisualReference || c.visualReference,
  );
  if (hasReady) return { message: null, secondaryLine: null, testId: null };

  if (viewport === 'MOBILE') {
    if (pageConceptGenerationStateHasReadyMobileArtifacts(generationState) && scoped.length === 0) {
      return {
        message: 'CONCEPTS COULD NOT BE LOADED',
        secondaryLine: null,
        testId: 'gallery-page-concept-load-failed',
      };
    }
    return { message: 'NO MOBILE CONCEPTS YET', secondaryLine: null, testId: 'gallery-page-concept-empty' };
  }

  if (viewport === 'TABLET') {
    if (!family?.selectedMobileConceptId) {
      return {
        message: 'NO TABLET INTERPRETATION YET',
        secondaryLine: 'SELECT A MOBILE AUTHORITY FIRST',
        testId: 'gallery-page-concept-empty',
      };
    }
    return { message: 'NO TABLET INTERPRETATION YET', secondaryLine: null, testId: 'gallery-page-concept-empty' };
  }

  if (!family?.selectedMobileConceptId) {
    return {
      message: 'NO DESKTOP INTERPRETATION YET',
      secondaryLine: 'SELECT A MOBILE AUTHORITY FIRST',
      testId: 'gallery-page-concept-empty',
    };
  }
  if (!family?.tabletArtifactId) {
    return {
      message: 'NO DESKTOP INTERPRETATION YET',
      secondaryLine: 'COMPLETE TABLET INTERPRETATION FIRST',
      testId: 'gallery-page-concept-empty',
    };
  }
  return { message: 'NO DESKTOP INTERPRETATION YET', secondaryLine: null, testId: 'gallery-page-concept-empty' };
}
