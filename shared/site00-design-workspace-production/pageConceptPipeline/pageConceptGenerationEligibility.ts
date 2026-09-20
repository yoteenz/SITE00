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
import type { PageConceptReadiness } from './types.js';
import type { PageConceptSourceCaptureLine } from './readiness.js';

export type PageConceptCaptureHydrationStatus = 'idle' | 'checking' | 'ready';

export type PageConceptGenerationEligibility = {
  projectId: string;
  pageId: string;
  canonicalPageId: string;
  sourceCaptureValidation: PageConceptSourceCaptureValidation;
  sourceCaptureLines: PageConceptSourceCaptureLine[];
  hydrationStatus: PageConceptCaptureHydrationStatus;
  projectContextReady: boolean;
  pageContextReady: boolean;
  functionContractReady: boolean;
  sessionReady: boolean | null;
  readiness: PageConceptReadiness;
  blockerCode: PageConceptReadiness | null;
  confirmNotice: string | null;
  blockedReason: string | null;
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
    return eligibility.blockedReason;
  }
  return pageConceptSourceCaptureBlockMessage(eligibility.projectId, eligibility.pageId) || eligibility.blockedReason;
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

  const eligibility: PageConceptGenerationEligibility = {
    projectId,
    pageId,
    canonicalPageId,
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
    blockedReason,
    blockedResolution: pageConceptBlockedResolution(readiness),
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
