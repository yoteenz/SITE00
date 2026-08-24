/**
 * Trend lifecycle evaluation — history preserved, volume ≠ value.
 */

import type {
  EditorialWhitespaceOutcome,
  LiveWorldSignal,
  TrendLifecycleEvaluation,
  TrendLifecycleState,
  TrendLifecycleTransition,
} from './types.js';

export function evaluateTrendLifecycle(params: {
  signal: LiveWorldSignal;
  prior?: TrendLifecycleEvaluation | null;
}): TrendLifecycleEvaluation {
  const { signal } = params;
  let currentState: TrendLifecycleState = signal.lifecycleState;
  if (signal.velocity > 0.8 && signal.momentum > 0.7) currentState = 'ACCELERATING';
  if (signal.saturation > 0.85) currentState = 'SATURATED';
  if (signal.signalOrigin === 'RESURFACED') currentState = 'RESURFACING';

  const history: TrendLifecycleTransition[] = [...(params.prior?.history ?? [])];
  if (!params.prior || params.prior.currentState !== currentState) {
    history.push({
      from: params.prior?.currentState ?? null,
      to: currentState,
      observedAt: new Date().toISOString(),
      reason: `velocity=${signal.velocity}, saturation=${signal.saturation}`,
    });
  }

  const whitespace: EditorialWhitespaceOutcome =
    signal.saturation > 0.8 ? 'SATURATED_NO_ADDITIONAL_VALUE' : signal.novelty > 0.6 ? 'OPEN' : 'NARROW';

  return {
    signalId: signal.id,
    currentState,
    history,
    velocity: signal.velocity,
    acceleration: signal.momentum - (params.prior?.velocity ?? signal.velocity),
    sourceDiversity: signal.sourceDiversity,
    saturation: signal.saturation,
    editorialWhitespace: whitespace,
    evaluatedAt: new Date().toISOString(),
  };
}

export function lifecycleHistoryPreserved(evaluation: TrendLifecycleEvaluation): boolean {
  return evaluation.history.length >= 1;
}

export function smallAcceleratingBeatsLargeSaturated(params: {
  smallVelocity: number;
  smallSaturation: number;
  largeVelocity: number;
  largeSaturation: number;
}): boolean {
  return params.smallVelocity > 0.6 && params.smallSaturation < 0.4 && params.largeSaturation > 0.85;
}
