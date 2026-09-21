/**
 * P0.VR.PAGE-CONCEPT-RUNTIME-BLOCKER-FORENSICS1 — single founder-facing blocker channel.
 */

import {
  assertPageConceptEligibilityInvariants,
  type PageConceptGenerationEligibility,
} from './pageConceptGenerationEligibility.js';
import {
  isPageConceptStaleCaptureEligibilityNotice,
  sanitizePageConceptFounderNotice,
} from './pageConceptFounderNotice.js';

export type PageConceptGenerationBlockingState = {
  /** Eligibility-only notice (confirm gate). */
  eligibilityNotice: string | null;
  /** Runtime failure after dispatch (review/progress). */
  executionError: string | null;
  /** What the modal footer renders — never stale capture copy when captures are ready. */
  founderNotice: string | null;
  primaryBlockerCode: string | null;
};

/** @deprecated Prefer isPageConceptStaleCaptureEligibilityNotice for sanitization. */
export function isPageConceptSourceCaptureRelatedNotice(notice: string | null | undefined): boolean {
  return isPageConceptStaleCaptureEligibilityNotice(notice);
}

function finalizeFounderNotice(
  eligibility: PageConceptGenerationEligibility,
  notice: string | null,
): string | null {
  return sanitizePageConceptFounderNotice({
    notice,
    sourceCapturesReady: eligibility.sourceCaptureValidation.allRequiredReady,
    generationEligibility: eligibility,
  });
}

export function sanitizePageConceptExecutionError(
  eligibility: PageConceptGenerationEligibility,
  executionError: string | null,
): string | null {
  if (!executionError) return null;
  if (
    eligibility.sourceCaptureValidation.allRequiredReady &&
    isPageConceptStaleCaptureEligibilityNotice(executionError)
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
      const founderNotice = finalizeFounderNotice(eligibility, executionError);
      assertNoImpossibleSourceBlocker(eligibility, founderNotice);
      return {
        eligibilityNotice: null,
        executionError,
        founderNotice,
        primaryBlockerCode: executionError ? 'EXECUTION_ERROR' : null,
      };
    }
    const eligibilityNotice =
      eligibility.hydrationStatus === 'checking' ?
        null
      : eligibility.confirmNotice ?? eligibility.blockerMessage;
    const founderNotice = finalizeFounderNotice(eligibility, eligibilityNotice);
    assertNoImpossibleSourceBlocker(eligibility, founderNotice);
    return {
      eligibilityNotice,
      executionError,
      founderNotice,
      primaryBlockerCode: eligibility.blockerCode,
    };
  }

  if (input.mode === 'progress') {
    const founderNotice = finalizeFounderNotice(eligibility, executionError);
    return {
      eligibilityNotice: null,
      executionError,
      founderNotice,
      primaryBlockerCode: executionError ? 'EXECUTION_ERROR' : null,
    };
  }

  const founderNotice = finalizeFounderNotice(eligibility, executionError);
  return {
    eligibilityNotice: null,
    executionError,
    founderNotice,
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
    isPageConceptStaleCaptureEligibilityNotice(renderedNotice)
  ) {
    console.error('PAGE_CONCEPT_IMPOSSIBLE_SOURCE_BLOCKER', { eligibility, renderedNotice });
  }
  if (eligibility.canGenerate && renderedNotice && isPageConceptStaleCaptureEligibilityNotice(renderedNotice)) {
    console.error('PAGE_CONCEPT_IMPOSSIBLE_SOURCE_BLOCKER', { eligibility, renderedNotice });
  }
}
