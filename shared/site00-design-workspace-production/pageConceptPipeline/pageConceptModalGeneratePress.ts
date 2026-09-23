/**
 * P0.VR.PAGE-CONCEPT-GENERATE-CLICK-DEADPATH1 — modal GENERATE press gate (DOM disabled must match).
 */

import {
  pageConceptGenerationActivelyRunning,
  pageConceptPrimaryGenerateStartsNewBranch,
} from './pageConceptGeneratorBinding.js';
import type { PageConceptGenerationEligibility } from './pageConceptGenerationEligibility.js';
import type { PageConceptGenerationStatus } from './types.js';

export type PageConceptModalGeneratePress = {
  canPress: boolean;
  blockReason: string | null;
  intendedAction: 'dispatch' | 'retry' | 'new_branch' | 'blocked';
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
  const activelyRunning = pageConceptGenerationActivelyRunning(input.generationStatus, input.generating);
  const failedNbp = input.failedNbp;

  const canGenerateAtClick = input.eligibility.canGenerate;

  if (activelyRunning) {
    return {
      canPress: false,
      blockReason: 'GENERATION IN PROGRESS',
      intendedAction: 'blocked',
      canGenerateAtClick,
    };
  }

  if (pageConceptPrimaryGenerateStartsNewBranch(input.generationStatus)) {
    if (input.eligibility.sessionReady === null) {
      return {
        canPress: true,
        blockReason: null,
        intendedAction: 'new_branch',
        canGenerateAtClick,
      };
    }
    if (input.eligibility.sessionReady === false) {
      return {
        canPress: true,
        blockReason:
          input.eligibility.confirmNotice ??
          input.eligibility.blockerMessage ??
          'SIGN IN REQUIRED — GENERATE calls api.site00.com.',
        intendedAction: 'new_branch',
        canGenerateAtClick,
      };
    }
    return {
      canPress: true,
      blockReason: null,
      intendedAction: 'new_branch',
      canGenerateAtClick,
    };
  }

  const retryIntent = Boolean(input.executionError?.trim()) || failedNbp;

  if (retryIntent) {
    if (input.eligibility.sessionReady === null) {
      return {
        canPress: true,
        blockReason: null,
        intendedAction: 'retry',
        canGenerateAtClick,
      };
    }
    if (input.eligibility.sessionReady === false) {
      return {
        canPress: true,
        blockReason:
          input.eligibility.confirmNotice ??
          input.eligibility.blockerMessage ??
          'SIGN IN REQUIRED — GENERATE calls api.site00.com.',
        intendedAction: 'retry',
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
      canPress: true,
      blockReason: null,
      intendedAction: 'dispatch',
      canGenerateAtClick,
    };
  }

  if (!input.eligibility.canGenerate) {
    return {
      canPress: true,
      blockReason:
        input.eligibility.confirmNotice ??
        input.eligibility.blockerMessage ??
        'GENERATION REQUIREMENTS NOT READY',
      intendedAction: 'dispatch',
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
