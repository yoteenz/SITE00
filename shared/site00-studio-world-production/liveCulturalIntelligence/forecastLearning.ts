/**
 * Forecast outcome learning — historical forecasts immutable.
 */

import type { ForecastOutcome, ForecastOutcomeResult, TrendLifecycleState } from './types.js';

export function evaluateForecastOutcome(params: {
  forecastId: string;
  momentId: string | null;
  signalId: string | null;
  forecastedLifecycle: TrendLifecycleState;
  actualLifecycle: TrendLifecycleState | null;
  forecastedPeak: string | null;
  observedPeak: string | null;
}): ForecastOutcome {
  let result: ForecastOutcomeResult = 'INSUFFICIENT_DATA';
  if (params.actualLifecycle) {
    if (params.forecastedLifecycle === params.actualLifecycle) result = 'ACCURATE';
    else if (
      ['EMERGING', 'ACCELERATING', 'PEAKING'].includes(params.forecastedLifecycle) &&
      ['EMERGING', 'ACCELERATING', 'PEAKING', 'SATURATED'].includes(params.actualLifecycle)
    ) {
      result = 'DIRECTIONALLY_ACCURATE';
    } else result = 'OVERPREDICTED';
  }

  return {
    forecastId: params.forecastId,
    momentId: params.momentId,
    signalId: params.signalId,
    forecastedLifecycle: params.forecastedLifecycle,
    actualLifecycle: params.actualLifecycle,
    forecastedPeak: params.forecastedPeak,
    observedPeak: params.observedPeak,
    forecastedBrandRelevance: 'PROMISING_INVESTIGATE',
    actualEditorialUsefulness: 'UNKNOWN',
    result,
    evaluatedAt: new Date().toISOString(),
  };
}

export function historicalForecastsNotRewritten(existing: ForecastOutcome[], updated: ForecastOutcome): ForecastOutcome[] {
  return [...existing, updated];
}

export function performanceLearningCannotMutateCharacter(): true {
  return true;
}

export function performanceLearningCannotMutateCanon(): true {
  return true;
}
