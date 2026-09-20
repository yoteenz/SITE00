/**
 * P0.VR.PAGE-CONCEPT-RUNTIME-BLOCKER-FORENSICS1 — single founder-facing blocker channel.
 */

import {
  assertPageConceptEligibilityInvariants,
  type PageConceptGenerationEligibility,
} from './pageConceptGenerationEligibility.js';
export type PageConceptGenerationBlockingState = {
  /** Eligibility-only notice (confirm gate). */
  eligibilityNotice: string | null;
  /** Runtime failure after dispatch (review/progress). */
  executionError: string | null;
  /** What the modal footer renders — never stale capture copy when captures are ready. */
  founderNotice: string | null;
  primaryBlockerCode: string | null;
};

export function isPageConceptSourceCaptureRelatedNotice(notice: string | null | undefined): boolean {
  if (!notice?.trim()) return false;
  const raw = notice.trim();
  return (
    raw === 'BLOCKED_NO_SOURCE_CAPTURE' ||
    raw === 'BLOCKED_NO_MOBILE_CAPTURE' ||
    raw === 'BLOCKED_NO_DESKTOP_CAPTURE' ||
    /capture the current mobile/i.test(raw) ||
    /capture the current desktop/i.test(raw) ||
    /implementation source capture missing/i.test(raw) ||
    /missing implementation source capture/i.test(raw)
  );
}

export function sanitizePageConceptExecutionError(
  eligibility: PageConceptGenerationEligibility,
  executionError: string | null,
): string | null {
  if (!executionError) return null;
  if (
    eligibility.sourceCaptureValidation.allRequiredReady &&
    isPageConceptSourceCaptureRelatedNotice(executionError)
  ) {
    if (import.meta.env?.DEV) {
      console.warn('STALE_CONFIRM_NOTICE_CLEARED', executionError);
    }
    return null;
  }
  return executionError;
}

export function derivePageConceptGenerationBlockingState(input: {
  eligibility: PageConceptGenerationEligibility;
  executionError: string | null;
  mode: 'confirm' | 'progress' | 'review';
}): PageConceptGenerationBlockingState {
  const executionError = sanitizePageConceptExecutionError(input.eligibility, input.executionError);
  const { eligibility } = input;

  if (input.mode === 'confirm') {
    if (eligibility.canGenerate) {
      assertNoImpossibleSourceBlocker(eligibility, null);
      return {
        eligibilityNotice: null,
        executionError,
        founderNotice: null,
        primaryBlockerCode: null,
      };
    }
    const eligibilityNotice =
      eligibility.hydrationStatus === 'checking' ?
        null
      : eligibility.confirmNotice ?? eligibility.blockerMessage;
    assertNoImpossibleSourceBlocker(eligibility, eligibilityNotice);
    return {
      eligibilityNotice,
      executionError,
      founderNotice: eligibilityNotice,
      primaryBlockerCode: eligibility.blockerCode,
    };
  }

  if (input.mode === 'progress') {
    return {
      eligibilityNotice: null,
      executionError,
      founderNotice: executionError,
      primaryBlockerCode: executionError ? 'EXECUTION_ERROR' : null,
    };
  }

  return {
    eligibilityNotice: null,
    executionError,
    founderNotice: executionError,
    primaryBlockerCode: executionError ? 'EXECUTION_ERROR' : null,
  };
}

function assertNoImpossibleSourceBlocker(
  eligibility: PageConceptGenerationEligibility,
  renderedNotice: string | null,
): void {
  if (!import.meta.env?.DEV) return;
  assertPageConceptEligibilityInvariants(eligibility);
  const v = eligibility.sourceCaptureValidation;
  if (
    eligibility.hydrationStatus === 'ready' &&
    v.mobile.ready &&
    v.desktop.ready &&
    renderedNotice &&
    isPageConceptSourceCaptureRelatedNotice(renderedNotice)
  ) {
    console.error('PAGE_CONCEPT_IMPOSSIBLE_SOURCE_BLOCKER', { eligibility, renderedNotice });
  }
  if (eligibility.canGenerate && renderedNotice && isPageConceptSourceCaptureRelatedNotice(renderedNotice)) {
    console.error('PAGE_CONCEPT_IMPOSSIBLE_SOURCE_BLOCKER', { eligibility, renderedNotice });
  }
}
