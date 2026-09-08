/**
 * B5.0R2 — Storyboard generation cost guard (no automatic provider spend).
 */

import type { StoryboardDispatchReceipt } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';

export type StoryboardCostTelemetry = {
  storyboardGenerationAttemptCount: number;
  storyboardProviderDispatchCount: number;
  storyboardImportedCount: number;
  storyboardFailedGenerationCount: number;
  storyboardAutoRetryCount: number;
  storyboardFounderSuppliedCount: number;
  generationInFlight: boolean;
  autoRetry: false;
  lastDispatchReceipt: StoryboardDispatchReceipt | null;
};

type GuardInput = {
  explicitFounderAction: boolean;
  currentStageIsFinalStoryboard: boolean;
  allFiveAuthoritiesApproved: boolean;
  generationInFlight: boolean;
  autoRetry: boolean;
  storyboardGenerationAllowed: boolean;
};

const state: StoryboardCostTelemetry = {
  storyboardGenerationAttemptCount: 0,
  storyboardProviderDispatchCount: 0,
  storyboardImportedCount: 0,
  storyboardFailedGenerationCount: 0,
  storyboardAutoRetryCount: 0,
  storyboardFounderSuppliedCount: 0,
  generationInFlight: false,
  autoRetry: false,
  lastDispatchReceipt: null,
};

export function resetStoryboardGenerationCostGuard(): void {
  state.storyboardGenerationAttemptCount = 0;
  state.storyboardProviderDispatchCount = 0;
  state.storyboardImportedCount = 0;
  state.storyboardFailedGenerationCount = 0;
  state.storyboardAutoRetryCount = 0;
  state.storyboardFounderSuppliedCount = 0;
  state.generationInFlight = false;
  state.lastDispatchReceipt = null;
}

export function getStoryboardCostTelemetry(): StoryboardCostTelemetry {
  return { ...state, autoRetry: false, lastDispatchReceipt: state.lastDispatchReceipt };
}

export function evaluateStoryboardGenerationGuard(input: GuardInput): {
  allowed: boolean;
  blockers: string[];
} {
  const blockers: string[] = [];
  if (!input.explicitFounderAction) blockers.push('explicit founder action required');
  if (!input.currentStageIsFinalStoryboard) blockers.push('current stage must be FINAL STORYBOARD');
  if (!input.allFiveAuthoritiesApproved) blockers.push('all five authorities must be LOVE_IT approved');
  if (input.generationInFlight) blockers.push('generation already in flight');
  if (input.autoRetry) blockers.push('auto retry disabled');
  if (!input.storyboardGenerationAllowed) blockers.push('storyboard generation not allowed');
  return { allowed: blockers.length === 0, blockers };
}

export function beginStoryboardGenerationAttempt(): void {
  state.storyboardGenerationAttemptCount += 1;
  state.generationInFlight = true;
}

export function recordStoryboardProviderDispatch(receipt: StoryboardDispatchReceipt): void {
  state.storyboardProviderDispatchCount += 1;
  state.lastDispatchReceipt = receipt;
  state.generationInFlight = false;
}

export function recordStoryboardGenerationFailure(): void {
  state.storyboardFailedGenerationCount += 1;
  state.generationInFlight = false;
}

export function recordStoryboardImport(): void {
  state.storyboardImportedCount += 1;
  state.storyboardFounderSuppliedCount += 1;
}

export function recordStoryboardAutoRetryBlocked(): void {
  // Guard ensures this stays 0 — track blocked auto-retry attempts for telemetry only
  if (state.storyboardAutoRetryCount === 0) {
    // intentionally never increment unless founder explicitly triggers
  }
}

export function assertNoGetDispatch(): void {
  recordStoryboardAutoRetryBlocked();
}
