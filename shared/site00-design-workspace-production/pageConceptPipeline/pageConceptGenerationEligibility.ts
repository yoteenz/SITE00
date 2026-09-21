/**
 * P0.VR.PAGE-CONCEPT-CAPTURE-READINESS-UNIFICATION1 — one canonical generation eligibility object.
 */

import { resolveDesignPageIdentity } from '../designPageIdentity.js';
import { compilePageCreativeContext, compileProjectCreativeContext } from './contextCompilers.js';
import { compilePageFunctionContract } from './functionContract.js';
import {
  pageConceptBlockedReason,
  pageConceptBlockedResolution,
  pageConceptReadinessIsSourceCaptureBlocked,
  pageConceptSourceCaptureBlockMessage,
} from './readiness.js';
import {
  type PageConceptSourceCaptureValidation,
  validatePageConceptSourceCaptures,
} from './pageConceptSourceCaptureValidation.js';
import type { PageCaptureRecord } from '../designPageCapture.js';
import type { PageConceptReadiness } from './types.js';
import type { PageConceptSourceCaptureLine } from './readiness.js';

export type PageConceptCaptureHydrationStatus = 'idle' | 'checking' | 'ready';

export type PageConceptGenerationEligibility = {
  /** Active design project slug (same as projectId). */
  activeProjectId: string;
  /** Registry page id for the active DESIGN target. */
  activePageId: string;
  projectId: string;
  pageId: string;
  canonicalPageId: string;
  mobileCapture: PageCaptureRecord | null;
  desktopCapture: PageCaptureRecord | null;
  sourceCaptureValidation: PageConceptSourceCaptureValidation;
  sourceCaptureLines: PageConceptSourceCaptureLine[];
  hydrationStatus: PageConceptCaptureHydrationStatus;
  projectContextReady: boolean;
  pageContextReady: boolean;
  functionContractReady: boolean;
  sessionReady: boolean | null;
  readiness: PageConceptReadiness;
  blockerCode: PageConceptReadiness | null;
  /** Founder-facing blocker copy (gallery, pipeline, overlay confirm). */
  blockerMessage: string | null;
  /** Founder-facing resolution hint. */
  resolutionAction: string | null;
  confirmNotice: string | null;
  /** @deprecated use blockerMessage */
  blockedReason: string | null;
  /** @deprecated use resolutionAction */
  blockedResolution: string | null;
  canGenerate: boolean;
};

function sourceCaptureLinesFromValidation(
  validation: PageConceptSourceCaptureValidation,
): PageConceptSourceCaptureLine[] {
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

/** Founder-facing confirm notice — never source-capture copy when captures are ready. */
export function pageConceptConfirmNoticeFromEligibility(eligibility: PageConceptGenerationEligibility): string | null {
  if (eligibility.hydrationStatus === 'checking') return null;
  if (eligibility.canGenerate) return null;
  if (eligibility.sessionReady === false) {
    return 'SIGN IN REQUIRED — GENERATE calls api.site00.com. Open Ctrl Room on this tab and sign in, then retry.';
  }
  if (eligibility.sourceCaptureValidation.allRequiredReady) {
    return eligibility.blockerMessage;
  }
  return (
    pageConceptSourceCaptureBlockMessage(eligibility.projectId, eligibility.canonicalPageId) ||
    eligibility.blockerMessage
  );
}

export function buildPageConceptGenerationEligibility(input: {
  projectSlug: string;
  pageId: string;
  screenId: string;
  route?: string | null;
  sessionReady: boolean | null;
  hydrationStatus: PageConceptCaptureHydrationStatus;
}): PageConceptGenerationEligibility {
  const identity = resolveDesignPageIdentity({
    projectSlug: input.projectSlug,
    pageId: input.pageId,
    screenId: input.screenId,
    route: input.route,
  });
  const projectId = identity.projectId;
  const pageId = identity.registryPageId;
  const canonicalPageId = identity.canonicalPageId;

  const sourceCaptureValidation = validatePageConceptSourceCaptures(projectId, canonicalPageId);
  const projectContextReady = Boolean(compileProjectCreativeContext(projectId));
  const pageContextReady = Boolean(compilePageCreativeContext(projectId, pageId));
  const functionContractReady = Boolean(compilePageFunctionContract(projectId, pageId));

  let readiness: PageConceptReadiness = 'READY_FOR_CREATIVE_INJECTION';
  if (!projectContextReady) readiness = 'BLOCKED_NO_PROJECT_CONTEXT';
  else if (!pageContextReady) readiness = 'BLOCKED_NO_PAGE_CONTEXT';
  else if (!functionContractReady) readiness = 'BLOCKED_NO_FUNCTION_CONTRACT';
  else if (input.hydrationStatus === 'ready' && sourceCaptureValidation.sourceCaptureBlockerCode) {
    readiness = sourceCaptureValidation.sourceCaptureBlockerCode;
  }

  const sourceCaptureLines =
    input.hydrationStatus === 'checking' ?
      [{ viewport: 'MOBILE' as const, label: 'CHECKING CAPTURES…', state: 'CHECKING' as const }]
    : sourceCaptureLinesFromValidation(sourceCaptureValidation);

  const blockedReason =
    input.hydrationStatus !== 'ready' ?
      null
    : readiness === 'READY_FOR_CREATIVE_INJECTION' ?
      input.sessionReady === false ?
        'SIGN IN REQUIRED — GENERATE calls api.site00.com.'
      : null
    : pageConceptReadinessIsSourceCaptureBlocked(readiness) ?
      pageConceptSourceCaptureBlockMessage(projectId, canonicalPageId) || pageConceptBlockedReason(readiness)
    : pageConceptBlockedReason(readiness);

  const canGenerate =
    input.hydrationStatus === 'ready' &&
    sourceCaptureValidation.allRequiredReady &&
    projectContextReady &&
    pageContextReady &&
    functionContractReady &&
    input.sessionReady === true;

  const resolutionAction = pageConceptBlockedResolution(readiness);

  const eligibility: PageConceptGenerationEligibility = {
    activeProjectId: projectId,
    activePageId: pageId,
    projectId,
    pageId,
    canonicalPageId,
    mobileCapture: sourceCaptureValidation.mobile.record,
    desktopCapture: sourceCaptureValidation.desktop.record,
    sourceCaptureValidation,
    sourceCaptureLines,
    hydrationStatus: input.hydrationStatus,
    projectContextReady,
    pageContextReady,
    functionContractReady,
    sessionReady: input.sessionReady,
    readiness,
    blockerCode:
      input.hydrationStatus !== 'ready' || readiness === 'READY_FOR_CREATIVE_INJECTION' ? null : readiness,
    confirmNotice: null,
    blockerMessage: blockedReason,
    resolutionAction,
    blockedReason,
    blockedResolution: resolutionAction,
    canGenerate,
  };

  eligibility.confirmNotice = pageConceptConfirmNoticeFromEligibility(eligibility);

  if (import.meta.env?.DEV) {
    assertPageConceptEligibilityInvariants(eligibility);
  }

  return eligibility;
}

export function assertPageConceptEligibilityInvariants(eligibility: PageConceptGenerationEligibility): void {
  const { sourceCaptureValidation: v } = eligibility;
  if (
    eligibility.hydrationStatus === 'ready' &&
    v.mobile.ready &&
    v.desktop.ready &&
    eligibility.blockedReason &&
    pageConceptReadinessIsSourceCaptureBlocked(eligibility.readiness)
  ) {
    console.error('PAGE_CONCEPT_READINESS_STATE_DIVERGENCE', eligibility);
  }
  if (
    eligibility.hydrationStatus === 'ready' &&
    v.allRequiredReady &&
    eligibility.confirmNotice &&
    /source capture required/i.test(eligibility.confirmNotice)
  ) {
    console.error('PAGE_CONCEPT_READINESS_STATE_DIVERGENCE', { confirmNotice: eligibility.confirmNotice, v });
  }
  if (eligibility.hydrationStatus !== 'ready' && eligibility.confirmNotice?.includes('Capture the current')) {
    console.warn('PAGE_CONCEPT_PREHYDRATION_BLOCKER', eligibility);
  }
}

/** Gallery / pipeline CTA — only source for disabled state and blocker copy. */
export function pageConceptGenerationGateFromEligibility(
  eligibility: PageConceptGenerationEligibility,
  generationInFlight: boolean,
): {
  canPressGenerate: boolean;
  blockerMessage: string | null;
  resolutionAction: string | null;
} {
  const checking = eligibility.hydrationStatus === 'checking';
  return {
    canPressGenerate: eligibility.canGenerate && !generationInFlight,
    blockerMessage: checking ? null : eligibility.blockerMessage,
    resolutionAction: checking ? null : eligibility.resolutionAction,
  };
}

export function assertPageConceptGenerationGateDivergence(input: {
  eligibility: PageConceptGenerationEligibility;
  generateButtonDisabled: boolean;
  renderedBlockerText: string | null;
}): void {
  const { eligibility } = input;
  if (eligibility.canGenerate && input.generateButtonDisabled) {
    console.error('PAGE_CONCEPT_GENERATION_GATE_DIVERGENCE', input);
  }
  const text = input.renderedBlockerText ?? '';
  if (
    eligibility.hydrationStatus === 'ready' &&
    eligibility.sourceCaptureValidation.allRequiredReady &&
    /capture the current mobile and desktop/i.test(text)
  ) {
    console.error('STALE_CAPTURE_BLOCKER_COPY_RENDERED', input);
  }
}
