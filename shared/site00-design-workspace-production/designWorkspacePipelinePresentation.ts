/**
 * Hero + viewport tab presentation derived from canonical pipeline state (GPT2).
 */

import type { PageViewportId } from './designProjectBinding/pageViewportAuthority.js';
import type {
  HeroPreviewResolution,
  ViewportAuthorityStatus,
  ViewportControlPresentation,
} from './designProjectBinding/pageViewportAuthority.js';
import type { DesignWorkspacePipelineState } from './designWorkspacePipelineState.js';
import type { PageConceptGenerationState } from './pageConceptPipeline/types.js';
import { resolvePageConceptArtifactDisplayUrl } from './pageConceptPipeline/pageConceptArtifactDisplayUrl.js';

export type ViewportTabPipelineStatus = 'READY' | 'NOT_GENERATED' | 'STALE' | 'GENERATING';

export function resolveViewportTabPipelineStatus(
  state: DesignWorkspacePipelineState,
  viewport: PageViewportId,
): ViewportTabPipelineStatus {
  if (viewport === 'MOBILE') {
    if (state.mobileAuthorityStatus === 'CONFIRMED') return 'READY';
    if (state.selectedMobileConceptId) return 'READY';
    return 'NOT_GENERATED';
  }
  if (viewport === 'DESKTOP') {
    if (state.desktopExpressionStatus === 'STALE' || state.desktopViewportStatus === 'STALE') return 'STALE';
    if (state.desktopViewportStatus === 'GENERATING') return 'GENERATING';
    return state.desktopViewportStatus === 'READY' ? 'READY' : 'NOT_GENERATED';
  }
  if (state.tabletExpressionStatus === 'STALE' || state.tabletViewportStatus === 'STALE') return 'STALE';
  if (state.tabletViewportStatus === 'GENERATING') return 'GENERATING';
  return state.tabletViewportStatus === 'READY' ? 'READY' : 'NOT_GENERATED';
}

export function viewportControlsFromPipelineState(
  state: DesignWorkspacePipelineState,
): readonly ViewportControlPresentation[] {
  const tab = (viewport: PageViewportId): ViewportControlPresentation => {
    const pipelineStatus = resolveViewportTabPipelineStatus(state, viewport);
    if (pipelineStatus === 'GENERATING') {
      return { viewport, status: 'IN_REVIEW', statusShort: 'GENERATING' };
    }
    if (pipelineStatus === 'STALE') {
      return { viewport, status: 'DESIGN_NEEDED', statusShort: 'STALE' };
    }
    if (pipelineStatus === 'READY') {
      const status: ViewportAuthorityStatus =
        viewport === 'MOBILE' && state.mobileAuthorityStatus === 'CONFIRMED' ? 'APPROVED' : 'AVAILABLE';
      return { viewport, status, statusShort: 'READY' };
    }
    return { viewport, status: 'DESIGN_NEEDED', statusShort: 'NOT GEN' };
  };
  return [tab('MOBILE'), tab('TABLET'), tab('DESKTOP')];
}

function jobImageForArtifact(
  generationState: PageConceptGenerationState | null,
  artifactId: string | null,
): string | null {
  if (!artifactId || !generationState) return null;
  const job = generationState.generationJobs.find(
    (j) => j.artifactId === artifactId && j.status === 'READY',
  );
  if (!job) return null;
  return resolvePageConceptArtifactDisplayUrl(job.imageUri ?? job.artifactPath ?? null, job.artifactId);
}

export function resolveHeroPreviewFromPipelineState(input: {
  state: DesignWorkspacePipelineState;
  generationState: PageConceptGenerationState | null;
  viewport: PageViewportId;
}): HeroPreviewResolution {
  const { state, generationState, viewport } = input;
  if (viewport === 'MOBILE') {
    const src = jobImageForArtifact(generationState, state.bindings.mobileAuthorityArtifactId);
    if (src && state.mobileAuthorityStatus === 'CONFIRMED') {
      return { kind: 'image', src, viewport: 'MOBILE', status: 'APPROVED' };
    }
    if (src && state.selectedMobileConceptId) {
      return { kind: 'image', src, viewport: 'MOBILE', status: 'AVAILABLE' };
    }
    return { kind: 'manifest-hero', viewport: 'MOBILE', status: 'DESIGN_NEEDED' };
  }
  if (viewport === 'DESKTOP') {
    const src = jobImageForArtifact(generationState, state.desktopViewportAuthorityId);
    if (src) {
      return { kind: 'image', src, viewport: 'DESKTOP', status: 'AVAILABLE' };
    }
    return {
      kind: 'missing-design',
      viewport: 'DESKTOP',
      title: 'DESKTOP VIEWPORT',
      statusLine: 'DERIVED · NOT GENERATED',
      actionLabel: 'GENERATE DESKTOP',
      actionDisabled: !canGenerateDesktopPresentation(state),
      actionReason: null,
    };
  }
  const src = jobImageForArtifact(generationState, state.tabletViewportAuthorityId);
  if (src) {
    return { kind: 'image', src, viewport: 'TABLET', status: 'DERIVED' };
  }
  return {
    kind: 'tablet-waiting',
    viewport: 'TABLET',
    title: 'TABLET VIEWPORT',
    statusLine: 'DERIVED · NOT GENERATED',
    message: 'Generate tablet viewport authority from confirmed mobile experience.',
  };
}

function canGenerateDesktopPresentation(state: DesignWorkspacePipelineState): boolean {
  return (
    state.mobileAuthorityStatus === 'CONFIRMED' &&
    state.mobileExperienceStatus === 'APPROVED' &&
    state.desktopViewportStatus !== 'GENERATING'
  );
}

export function resolveGalleryPipelineBanner(
  state: DesignWorkspacePipelineState,
  viewport: PageViewportId,
): string | null {
  if (viewport !== 'MOBILE') return null;
  if (state.mobileAuthorityStatus === 'CONFIRMED') return 'AUTHORITY CONFIRMED';
  return null;
}
