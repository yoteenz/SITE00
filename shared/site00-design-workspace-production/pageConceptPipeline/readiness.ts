import { isPageCaptureDisplayableArtifact, resolveCurrentPageCapture } from '../designPageCapture.js';
import type { PageCaptureRecord } from '../designPageCapture.js';
import { resolveDesignPageIdentity } from '../designPageIdentity.js';
import type { PageConceptGenerationState, PageConceptReadiness } from './types.js';
import { compilePageCreativeContext, compileProjectCreativeContext } from './contextCompilers.js';
import { compilePageFunctionContract } from './functionContract.js';
import { validatePageConceptSourceCaptures } from './pageConceptSourceCaptureValidation.js';

export const PAGE_CONCEPT_REQUIRES_MOBILE_CAPTURE = true;
export const PAGE_CONCEPT_REQUIRES_DESKTOP_CAPTURE = true;

function captureReady(record: PageCaptureRecord | null | undefined): boolean {
  return Boolean(record?.artifactPath && isPageCaptureDisplayableArtifact(record.artifactPath));
}

/** Context + function contract only — for API when captures arrive in POST body. */
export function evaluatePageConceptServerReadiness(projectId: string, pageId: string): PageConceptReadiness {
  if (!compileProjectCreativeContext(projectId)) return 'BLOCKED_NO_PROJECT_CONTEXT';
  if (!compilePageCreativeContext(projectId, pageId)) return 'BLOCKED_NO_PAGE_CONTEXT';
  if (!compilePageFunctionContract(projectId, pageId)) return 'BLOCKED_NO_FUNCTION_CONTRACT';
  return 'READY_FOR_CREATIVE_INJECTION';
}

export function evaluatePageConceptReadiness(projectId: string, pageId: string): PageConceptReadiness {
  const serverReady = evaluatePageConceptServerReadiness(projectId, pageId);
  if (serverReady !== 'READY_FOR_CREATIVE_INJECTION') return serverReady;

  const { canonicalPageId } = resolveDesignPageIdentity({
    projectSlug: projectId,
    pageId,
    screenId: '',
  });
  const captureValidation = validatePageConceptSourceCaptures(projectId, canonicalPageId);
  if (captureValidation.allRequiredReady) return 'READY_FOR_CREATIVE_INJECTION';
  return captureValidation.sourceCaptureBlockerCode ?? 'BLOCKED_NO_SOURCE_CAPTURE';
}

/** Which implementation captures are missing for GENERATE (not design-authority refs). */
export function pageConceptMissingSourceCaptureViewports(
  projectId: string,
  pageId: string,
): readonly ('MOBILE' | 'DESKTOP')[] {
  const missing: ('MOBILE' | 'DESKTOP')[] = [];
  if (!captureReady(resolveCurrentPageCapture(projectId, pageId, 'MOBILE').record)) missing.push('MOBILE');
  if (!captureReady(resolveCurrentPageCapture(projectId, pageId, 'DESKTOP').record)) missing.push('DESKTOP');
  return missing;
}

export type PageConceptSourceCaptureLine = {
  viewport: 'MOBILE' | 'DESKTOP';
  label: string;
  state: 'READY' | 'MISSING' | 'CHECKING';
};

export function pageConceptSourceCaptureLines(projectId: string, pageId: string): PageConceptSourceCaptureLine[] {
  const { canonicalPageId } = resolveDesignPageIdentity({
    projectSlug: projectId,
    pageId,
    screenId: '',
  });
  const validation = validatePageConceptSourceCaptures(projectId, canonicalPageId);
  return [
    {
      viewport: 'MOBILE',
      label: 'MOBILE CAPTURE',
      state: validation.mobile.ready ? 'READY' : 'MISSING',
    },
    {
      viewport: 'DESKTOP',
      label: 'DESKTOP CAPTURE',
      state: validation.desktop.ready ? 'READY' : 'MISSING',
    },
  ];
}

export function pageConceptSourceCaptureBlockMessage(projectId: string, pageId: string): string {
  const missing = pageConceptMissingSourceCaptureViewports(projectId, pageId);
  if (missing.length === 0) return '';
  if (missing.length === 2) {
    return 'Capture the current Mobile and Desktop page before generating concepts.';
  }
  const only = missing[0];
  return `Capture the current ${only === 'MOBILE' ? 'Mobile' : 'Desktop'} page before generating concepts (the other viewport is already ready).`;
}

/** Human copy for overlay confirm — never emit raw BLOCKED_* codes to founders. */
export function pageConceptCaptureConfirmBlockMessage(projectId: string, pageId: string): string {
  const fromCaptures = pageConceptSourceCaptureBlockMessage(projectId, pageId);
  if (fromCaptures) return fromCaptures;
  const readiness = evaluatePageConceptReadiness(projectId, pageId);
  if (readiness === 'READY_FOR_CREATIVE_INJECTION') return '';
  return pageConceptBlockedReason(readiness) || readiness;
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
      return 'Implementation source capture missing for Mobile and Desktop.';
    case 'BLOCKED_NO_MOBILE_CAPTURE':
      return 'Implementation source capture missing for Mobile.';
    case 'BLOCKED_NO_DESKTOP_CAPTURE':
      return 'Implementation source capture missing for Desktop.';
    case 'BLOCKED_NO_PROVIDER_CONFIG':
      return 'Provider configuration is missing on the API host.';
    case 'READY_FOR_CREATIVE_INJECTION':
      return '';
  }
}

export function pageConceptBlockedResolution(readiness: PageConceptReadiness): string | null {
  switch (readiness) {
    case 'BLOCKED_NO_SOURCE_CAPTURE':
    case 'BLOCKED_NO_MOBILE_CAPTURE':
    case 'BLOCKED_NO_DESKTOP_CAPTURE':
      return 'Use CAPTURE SCREEN for Mobile and Desktop before generating page concepts.';
    case 'BLOCKED_NO_FUNCTION_CONTRACT':
      return 'Open Page System Review and compile the page function contract.';
    default:
      return null;
  }
}

export function pageConceptReadinessIsSourceCaptureBlocked(readiness: PageConceptReadiness): boolean {
  return (
    readiness === 'BLOCKED_NO_SOURCE_CAPTURE' ||
    readiness === 'BLOCKED_NO_MOBILE_CAPTURE' ||
    readiness === 'BLOCKED_NO_DESKTOP_CAPTURE'
  );
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
    activeReviewRunId: partial.activeReviewRunId ?? null,
    archivedRuns: partial.archivedRuns ?? [],
    activeGenerationRunId: partial.activeGenerationRunId ?? null,
    activeGenerationRunStartedAt: partial.activeGenerationRunStartedAt ?? null,
    activeGenerationStage: partial.activeGenerationStage ?? null,
    liveProgress: partial.liveProgress ?? null,
    cgptSubsteps: partial.cgptSubsteps ?? null,
    dualRenderTestRun: partial.dualRenderTestRun ?? null,
  };
}
