/**
 * P0.VR.PAGE-CONCEPT-GENERATE-CLICK-DEADPATH1 — modal GENERATE press gate (DOM disabled must match).
 */

import { pageConceptGenerationInFlight, pageConceptReviewReady } from './pageConceptGeneratorBinding.js';
import type { PageConceptGenerationEligibility } from './pageConceptGenerationEligibility.js';
import type { PageConceptGenerationStatus } from './types.js';

export type PageConceptModalGeneratePress = {
  canPress: boolean;
  blockReason: string | null;
  intendedAction: 'dispatch' | 'retry' | 'blocked';
  canGenerateAtClick: boolean;
};

export function computePageConceptModalGeneratePress(input: {
  eligibility: PageConceptGenerationEligibility;
  mode: 'confirm' | 'progress' | 'review';
  generating: boolean;
  generationStatus: PageConceptGenerationStatus;
  executionError: string | null;
  failedNbp: boolean;
}): PageConceptModalGeneratePress {
  const inFlight = pageConceptGenerationInFlight(input.generationStatus, input.generating);
  const reviewReady = pageConceptReviewReady(input.generationStatus);
  const failedNbp = input.failedNbp;

  const canGenerateAtClick = input.eligibility.canGenerate;

  if (input.generating || inFlight) {
    return {
      canPress: false,
      blockReason: 'GENERATION IN PROGRESS',
      intendedAction: 'blocked',
      canGenerateAtClick,
    };
  }

  if (input.mode === 'review' && reviewReady && !failedNbp) {
    return {
      canPress: false,
      blockReason: null,
      intendedAction: 'blocked',
      canGenerateAtClick,
    };
  }

  const retryIntent = Boolean(input.executionError?.trim()) || failedNbp;

  if (retryIntent) {
    if (input.eligibility.sessionReady === null) {
      return {
        canPress: false,
        blockReason: 'CHECKING SESSION…',
        intendedAction: 'blocked',
        canGenerateAtClick,
      };
    }
    if (input.eligibility.sessionReady === false) {
      return {
        canPress: false,
        blockReason:
          input.eligibility.confirmNotice ??
          input.eligibility.blockerMessage ??
          'SIGN IN REQUIRED — GENERATE calls api.site00.com.',
        intendedAction: 'blocked',
        canGenerateAtClick,
      };
    }
    return {
      canPress: true,
      blockReason: null,
      intendedAction: 'retry',
      canGenerateAtClick,
    };
  }

  if (input.eligibility.sessionReady === null) {
    return {
      canPress: false,
      blockReason: 'CHECKING SESSION…',
      intendedAction: 'blocked',
      canGenerateAtClick,
    };
  }

  if (!input.eligibility.canGenerate) {
    return {
      canPress: false,
      blockReason:
        input.eligibility.confirmNotice ??
        input.eligibility.blockerMessage ??
        'GENERATION REQUIREMENTS NOT READY',
      intendedAction: 'blocked',
      canGenerateAtClick,
    };
  }

  return {
    canPress: true,
    blockReason: null,
    intendedAction: 'dispatch',
    canGenerateAtClick,
  };
}
