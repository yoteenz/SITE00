import { getPageConceptSourceCaptures, isPageCaptureDisplayableArtifact } from '../designPageCapture.js';
import type { PageConceptGenerationState, PageConceptReadiness } from './types.js';
import { compilePageCreativeContext, compileProjectCreativeContext } from './contextCompilers.js';
import { compilePageFunctionContract } from './functionContract.js';

export function evaluatePageConceptReadiness(projectId: string, pageId: string): PageConceptReadiness {
  if (!compileProjectCreativeContext(projectId)) return 'BLOCKED_NO_PROJECT_CONTEXT';
  if (!compilePageCreativeContext(projectId, pageId)) return 'BLOCKED_NO_PAGE_CONTEXT';
  if (!compilePageFunctionContract(projectId, pageId)) return 'BLOCKED_NO_FUNCTION_CONTRACT';
  const { mobile, desktop } = getPageConceptSourceCaptures(projectId, pageId);
  if (
    !mobile?.artifactPath ||
    !desktop?.artifactPath ||
    !isPageCaptureDisplayableArtifact(mobile.artifactPath) ||
    !isPageCaptureDisplayableArtifact(desktop.artifactPath)
  ) {
    return 'BLOCKED_NO_SOURCE_CAPTURE';
  }
  return 'READY_FOR_CREATIVE_INJECTION';
}

/** Which implementation captures are missing for GENERATE (not design-authority refs). */
export function pageConceptMissingSourceCaptureViewports(
  projectId: string,
  pageId: string,
): readonly ('MOBILE' | 'DESKTOP')[] {
  const { mobile, desktop } = getPageConceptSourceCaptures(projectId, pageId);
  const missing: ('MOBILE' | 'DESKTOP')[] = [];
  if (!mobile?.artifactPath || !isPageCaptureDisplayableArtifact(mobile.artifactPath)) missing.push('MOBILE');
  if (!desktop?.artifactPath || !isPageCaptureDisplayableArtifact(desktop.artifactPath)) missing.push('DESKTOP');
  return missing;
}

export function pageConceptSourceCaptureBlockMessage(projectId: string, pageId: string): string {
  const missing = pageConceptMissingSourceCaptureViewports(projectId, pageId);
  if (missing.length === 0) return '';
  const list = missing.join(' + ');
  return `Missing implementation source capture (${list}). Viewport “OK” is design authority — GENERATE requires CAPTURE SCREEN for both Mobile and Desktop (saved to Supabase, then hydrated on load).`;
}

export function pageConceptBlockedReason(readiness: PageConceptReadiness): string {
  switch (readiness) {
    case 'BLOCKED_NO_PROJECT_CONTEXT':
      return 'Project creative context is missing.';
    case 'BLOCKED_NO_PAGE_CONTEXT':
      return 'Page context could not be compiled for the active page.';
    case 'BLOCKED_NO_FUNCTION_CONTRACT':
      return 'Function contract has not been compiled for this page.';
    case 'BLOCKED_NO_SOURCE_CAPTURE':
      return 'Implementation source capture missing for Mobile and/or Desktop.';
    case 'BLOCKED_NO_PROVIDER_CONFIG':
      return 'Provider configuration is missing on the API host.';
    case 'READY_FOR_CREATIVE_INJECTION':
      return '';
  }
}

export function pageConceptBlockedResolution(readiness: PageConceptReadiness): string | null {
  switch (readiness) {
    case 'BLOCKED_NO_SOURCE_CAPTURE':
      return 'Use CAPTURE SCREEN for Mobile and Desktop before generating page concepts.';
    case 'BLOCKED_NO_FUNCTION_CONTRACT':
      return 'Open Page System Review and compile the page function contract.';
    default:
      return null;
  }
}

export function hydratePageConceptGenerationState(
  projectId: string,
  pageId: string,
  partial: Partial<PageConceptGenerationState> = {},
): PageConceptGenerationState {
  return {
    targetType: 'PAGE',
    projectId,
    pageId,
    projectContext: compileProjectCreativeContext(projectId),
    pageContext: compilePageCreativeContext(projectId, pageId),
    functionContract: compilePageFunctionContract(projectId, pageId),
    pipelineSet: partial.pipelineSet ?? null,
    generationJobs: partial.generationJobs ?? [],
    generationStatus: partial.generationStatus ?? 'IDLE',
    lastFailure: partial.lastFailure ?? null,
    history: partial.history ?? [],
  };
}
