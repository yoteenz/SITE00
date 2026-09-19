import {
  GROK_ACTIVE_STAGES,
  GROK_DESIGN_BENCH_EXECUTION_TIMEOUT_MS,
  GROK_DESIGN_BENCH_STALL_MS,
  GROK_PROVIDER_TIMEOUT,
  GROK_RUN_STALLED,
} from '../../../shared/site00-design-bench/grokTwinTestA/constants.js';
import { evaluateGrokEta } from '../../../shared/site00-design-bench/grokTwinTestA/timing.js';
import type { GrokDesignBenchRun } from '../../../shared/site00-design-bench/grokTwinTestA/types.js';

const abortByRun = new Map<string, AbortController>();
const cancelByRun = new Set<string>();

export function registerGrokRunAbort(runId: string): AbortController {
  abortByRun.get(runId)?.abort();
  const controller = new AbortController();
  abortByRun.set(runId, controller);
  return controller;
}

export function requestGrokRunCancel(runId: string): boolean {
  cancelByRun.add(runId);
  abortByRun.get(runId)?.abort();
  return true;
}

export function isGrokRunCancelRequested(runId: string): boolean {
  return cancelByRun.has(runId);
}

export function clearGrokRunControl(runId: string): void {
  abortByRun.delete(runId);
  cancelByRun.delete(runId);
}

export function applyGrokStallWatchdog(run: GrokDesignBenchRun, nowMs = Date.now()): GrokDesignBenchRun {
  const active = (GROK_ACTIVE_STAGES as readonly string[]).includes(run.stage);
  const lastChange = run.lastStateChangeAt ?? run.timing.providerStartedAt ?? run.timing.startedAt ?? run.timing.queuedAt;
  const lastMs = lastChange ? Date.parse(lastChange) : NaN;
  const elapsedSinceChange = Number.isFinite(lastMs) ? nowMs - lastMs : 0;
  const queuedMs = run.timing.queuedAt ? nowMs - Date.parse(run.timing.queuedAt) : 0;
  const eta = evaluateGrokEta({
    stage: run.stage,
    elapsedMs: queuedMs,
    historicalAverageMs: null,
    lastStateChangeAt: lastChange,
    nowMs,
  });
  const stall = {
    stalled: active && elapsedSinceChange >= GROK_DESIGN_BENCH_STALL_MS,
    stalledStage: active ? run.stage : null,
    lastStateChange: lastChange ?? null,
    providerRequestStatus: run.providerRequestStatus ?? 'NOT_STARTED',
  };
  return {
    ...run,
    etaKind: eta.kind,
    estimatedRemainingMs: eta.remainingMs,
    stall,
  };
}

export function grokExecutionTimedOut(run: GrokDesignBenchRun, nowMs = Date.now()): boolean {
  const started = run.timing.providerStartedAt ?? run.timing.startedAt ?? run.timing.queuedAt;
  if (!started) return false;
  return nowMs - Date.parse(started) >= GROK_DESIGN_BENCH_EXECUTION_TIMEOUT_MS;
}

export { GROK_PROVIDER_TIMEOUT, GROK_RUN_STALLED, GROK_DESIGN_BENCH_EXECUTION_TIMEOUT_MS, GROK_DESIGN_BENCH_STALL_MS };
