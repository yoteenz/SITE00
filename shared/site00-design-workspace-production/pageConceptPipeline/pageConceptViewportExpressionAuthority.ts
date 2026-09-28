/**
 * P0.VR.RESPONSIVE-VIEWPORT-GENERATION-THEN-EXPRESSION-WORKFLOW1
 * Viewport base authority (GPT2 artifact on family) vs viewport expression packages (behavior states).
 */

import type { ExperienceExpressionAuthority } from './experienceExpressionAuthority.js';
import type { PageViewportAuthorityFamily } from './pageConceptViewportAuthorityFamily.js';
import type { PageConceptPipelineSet } from './types.js';

export type ViewportExpressionViewport = 'DESKTOP' | 'TABLET';

export type ViewportExpressionAuthority = {
  id: string;
  viewport: ViewportExpressionViewport;
  projectId: string;
  pageId: string;
  sourceViewportAuthorityArtifactId: string;
  sourceMobileExperienceAuthorityId: string;
  status: ExperienceExpressionAuthority['status'];
  visualStates: ExperienceExpressionAuthority['visualStates'];
  approvedAt: string | null;
  generatedAt: string;
};

export type ViewportBaseAuthorityStatus = 'NOT_GENERATED' | 'READY';

export function resolveViewportBaseAuthorityStatus(
  family: PageViewportAuthorityFamily | null | undefined,
  viewport: ViewportExpressionViewport,
): ViewportBaseAuthorityStatus {
  const artifactId = viewport === 'DESKTOP' ? family?.desktopArtifactId : family?.tabletArtifactId;
  return artifactId ? 'READY' : 'NOT_GENERATED';
}

export function resolveViewportExpressionAuthority(
  pipelineSet: PageConceptPipelineSet | null | undefined,
  viewport: ViewportExpressionViewport,
): ViewportExpressionAuthority | null {
  if (!pipelineSet) return null;
  return viewport === 'DESKTOP' ?
      (pipelineSet.desktopExpressionAuthority ?? null)
    : (pipelineSet.tabletExpressionAuthority ?? null);
}

export function resolveViewportExpressionStatus(
  pipelineSet: PageConceptPipelineSet | null | undefined,
  viewport: ViewportExpressionViewport,
): ExperienceExpressionAuthority['status'] {
  const authority = resolveViewportExpressionAuthority(pipelineSet, viewport);
  return authority?.status ?? 'NOT_STARTED';
}

export function isViewportExpressionApproved(
  pipelineSet: PageConceptPipelineSet | null | undefined,
  viewport: ViewportExpressionViewport,
): boolean {
  return resolveViewportExpressionStatus(pipelineSet, viewport) === 'APPROVED';
}

export function viewportExpressionPackageExists(
  pipelineSet: PageConceptPipelineSet | null | undefined,
  viewport: ViewportExpressionViewport,
): boolean {
  const status = resolveViewportExpressionStatus(pipelineSet, viewport);
  return status !== 'NOT_STARTED' && status !== 'SUPERSEDED';
}
