/**
 * P0.VR.PAGE-CONCEPT-RUN-TRUTH-AND-CREATIVE-GROUNDING1 — canonical run health vs founder blockers.
 */

import { pageConceptHasFailedNbpJobs } from './pageConceptGeneratorBinding.js';
import type { PageConceptGenerationState, PageConceptGenerationStatus } from './types.js';

export type PageConceptErrorSeverity =
  | 'BLOCKING'
  | 'RECOVERABLE'
  | 'PARTIAL'
  | 'WARNING'
  | 'HISTORICAL';

export type PageConceptRunHealthEvent = {
  severity: PageConceptErrorSeverity;
  code: string;
  message: string;
  at: string | null;
  resolvedAt?: string | null;
};

export type PageConceptRunHealth = {
  runStatus: PageConceptGenerationStatus;
  activeStage: string | null;
  blockingError: string | null;
  recoverableError: string | null;
  partialFailures: PageConceptRunHealthEvent[];
  warnings: PageConceptRunHealthEvent[];
  historicalEvents: PageConceptRunHealthEvent[];
};

export function isPageConceptPipelineExecutionActive(input: {
  generationStatus: PageConceptGenerationStatus;
  generating: boolean;
}): boolean {
  if (input.generating) return true;
  return (
    input.generationStatus === 'CGPT_RUNNING' ||
    input.generationStatus === 'CGPT_RATE_LIMITED' ||
    input.generationStatus === 'GPT2_RUNNING' ||
    input.generationStatus === 'GPT2_AWAITING_FOUNDER_REVIEW' ||
    input.generationStatus === 'NBP_RUNNING' ||
    input.generationStatus === 'PARTIAL_GENERATION'
  );
}

/** Pre-start / eligibility failures that must not display during an active or completed run. */
export function isPageConceptPreStartFatalNotice(notice: string | null | undefined): boolean {
  if (!notice?.trim()) return false;
  const raw = notice.trim();
  if (/^GENERATION COULD NOT START/i.test(raw)) return true;
  if (/^BLOCKED_/i.test(raw)) return true;
  if (/BLOCKED_MOBILE_SNAPSHOT/i.test(raw)) return true;
  if (/BLOCKED_DESKTOP_SNAPSHOT/i.test(raw)) return true;
  if (/BLOCKED_.*SNAPSHOT/i.test(raw)) return true;
  return false;
}

export function classifyPageConceptErrorSeverity(
  message: string,
  input: { pipelineActive: boolean; stageFailed: boolean },
): PageConceptErrorSeverity {
  if (input.stageFailed && !isPageConceptPreStartFatalNotice(message)) return 'BLOCKING';
  if (isPageConceptPreStartFatalNotice(message)) {
    return input.pipelineActive ? 'HISTORICAL' : 'BLOCKING';
  }
  if (/rate.?limit|retry|429/i.test(message)) return 'RECOVERABLE';
  if (/partial|failed only|1 of|2 of|3 of/i.test(message)) return 'PARTIAL';
  if (/warning|degraded/i.test(message)) return 'WARNING';
  return 'BLOCKING';
}

export function derivePageConceptRunHealth(input: {
  state: PageConceptGenerationState;
  generating: boolean;
  executionError: string | null;
}): PageConceptRunHealth {
  const { state, generating, executionError } = input;
  const pipelineActive = isPageConceptPipelineExecutionActive({
    generationStatus: state.generationStatus,
    generating,
  });

  const historicalEvents: PageConceptRunHealthEvent[] = [];
  const partialFailures: PageConceptRunHealthEvent[] = [];
  const warnings: PageConceptRunHealthEvent[] = [];
  let blockingError: string | null = null;
  let recoverableError: string | null = null;

  const pushHistorical = (message: string, at: string | null) => {
    historicalEvents.push({
      severity: 'HISTORICAL',
      code: message.slice(0, 64),
      message,
      at,
      resolvedAt: new Date().toISOString(),
    });
  };

  if (executionError?.trim()) {
    const severity = classifyPageConceptErrorSeverity(executionError, {
      pipelineActive,
      stageFailed: false,
    });
    if (severity === 'HISTORICAL' || (pipelineActive && isPageConceptPreStartFatalNotice(executionError))) {
      pushHistorical(executionError, state.lastFailure?.at ?? null);
    } else if (severity === 'RECOVERABLE') {
      recoverableError = executionError;
    } else if (severity === 'PARTIAL') {
      partialFailures.push({
        severity: 'PARTIAL',
        code: 'PARTIAL',
        message: executionError,
        at: state.lastFailure?.at ?? null,
      });
    } else if (severity === 'WARNING') {
      warnings.push({ severity: 'WARNING', code: 'WARN', message: executionError, at: null });
    } else {
      blockingError = executionError;
    }
  }

  if (state.lastFailure?.message && state.lastFailure.message !== executionError) {
    const msg = state.lastFailure.message;
    if (pipelineActive && isPageConceptPreStartFatalNotice(msg)) {
      pushHistorical(msg, state.lastFailure.at);
    }
  }

  const cgptFailed =
    Boolean(state.pipelineSet?.creativeInjectionError) && !state.pipelineSet?.creativeInjection;
  const gpt2Failed =
    Boolean(state.pipelineSet?.gpt2AuthorityError) && !state.pipelineSet?.gpt2AuthorityConcept;

  if (cgptFailed && state.pipelineSet?.creativeInjectionError) {
    blockingError = state.pipelineSet.creativeInjectionError;
  } else if (gpt2Failed && state.pipelineSet?.gpt2AuthorityError) {
    blockingError = state.pipelineSet.gpt2AuthorityError;
  } else if (
    pipelineActive &&
    blockingError &&
    isPageConceptPreStartFatalNotice(blockingError)
  ) {
    pushHistorical(blockingError, state.lastFailure?.at ?? null);
    blockingError = null;
  }

  if (pageConceptHasFailedNbpJobs(state) && state.generationStatus === 'NBP_RUNNING') {
    if (blockingError && isPageConceptPreStartFatalNotice(blockingError)) {
      pushHistorical(blockingError, state.lastFailure?.at ?? null);
      blockingError = null;
    }
    const failed = state.generationJobs.filter((j) => j.status === 'FAILED');
    const ready = state.generationJobs.filter((j) => j.status === 'READY');
    partialFailures.push({
      severity: 'PARTIAL',
      code: 'NBP_PARTIAL',
      message: `NBP PARTIAL · ${ready.length} READY · ${failed.length} FAILED`,
      at: null,
    });
  }

  if (
    pipelineActive &&
    !cgptFailed &&
    !gpt2Failed &&
    blockingError &&
    isPageConceptPreStartFatalNotice(blockingError)
  ) {
    pushHistorical(blockingError, state.lastFailure?.at ?? null);
    blockingError = null;
  }

  return {
    runStatus: state.generationStatus,
    activeStage: state.activeGenerationStage,
    blockingError,
    recoverableError,
    partialFailures,
    warnings,
    historicalEvents,
  };
}

export function pageConceptFounderBlockingNotice(health: PageConceptRunHealth): string | null {
  if (health.blockingError) return health.blockingError;
  if (health.partialFailures.length > 0 && health.runStatus === 'NBP_RUNNING') {
    return health.partialFailures[health.partialFailures.length - 1]!.message;
  }
  if (health.recoverableError) return health.recoverableError;
  return null;
}
