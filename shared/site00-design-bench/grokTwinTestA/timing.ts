import { GROK_STAGE_LABELS, GROK_STAGE_PROGRESS, GROK_TWIN_TEST_A_DEFAULT_ETA_MS } from './constants.js';
import type { GrokDesignBenchStage, GrokDesignBenchTiming } from './types.js';

export function emptyGrokTiming(): GrokDesignBenchTiming {
  return {
    queuedAt: null,
    startedAt: null,
    providerStartedAt: null,
    providerCompletedAt: null,
    completedAt: null,
    queueDurationMs: null,
    modelDurationMs: null,
    postProcessingDurationMs: null,
    totalDurationMs: null,
  };
}

export function grokStageProgress(stage: GrokDesignBenchStage): number {
  return GROK_STAGE_PROGRESS[stage] ?? 0;
}

export function grokStageLabel(stage: GrokDesignBenchStage): string {
  return GROK_STAGE_LABELS[stage] ?? stage;
}

export function formatDurationMmSs(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms) || ms < 0) return '—';
  const total = Math.floor(ms / 1000);
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export function estimateRemainingMs(args: {
  stage: GrokDesignBenchStage;
  elapsedMs: number;
  historicalAverageMs: number | null;
}): number | null {
  if (args.stage === 'COMPLETE' || args.stage === 'FAILED' || args.stage === 'IDLE') return 0;
  const expected = args.historicalAverageMs && args.historicalAverageMs > 0
    ? args.historicalAverageMs
    : GROK_TWIN_TEST_A_DEFAULT_ETA_MS;
  const progress = Math.max(grokStageProgress(args.stage), 8);
  const projected = expected * (1 - progress / 100);
  const fromElapsed = Math.max(expected - args.elapsedMs, 0);
  return Math.round(Math.max(Math.min(projected, fromElapsed + expected * 0.25), 0));
}

export function finalizeGrokTiming(timing: GrokDesignBenchTiming, completedAtIso: string): GrokDesignBenchTiming {
  const completedAtMs = Date.parse(completedAtIso);
  const queuedAtMs = timing.queuedAt ? Date.parse(timing.queuedAt) : completedAtMs;
  const startedAtMs = timing.startedAt ? Date.parse(timing.startedAt) : queuedAtMs;
  const providerStartedAtMs = timing.providerStartedAt ? Date.parse(timing.providerStartedAt) : startedAtMs;
  const providerCompletedAtMs = timing.providerCompletedAt ? Date.parse(timing.providerCompletedAt) : completedAtMs;
  return {
    ...timing,
    completedAt: completedAtIso,
    queueDurationMs: Math.max(startedAtMs - queuedAtMs, 0),
    modelDurationMs: Math.max(providerCompletedAtMs - providerStartedAtMs, 0),
    postProcessingDurationMs: Math.max(completedAtMs - providerCompletedAtMs, 0),
    totalDurationMs: Math.max(completedAtMs - queuedAtMs, 0),
  };
}

export function meanPositive(values: number[]): number | null {
  const usable = values.filter((v) => Number.isFinite(v) && v > 0);
  if (!usable.length) return null;
  return usable.reduce((a, b) => a + b, 0) / usable.length;
}
