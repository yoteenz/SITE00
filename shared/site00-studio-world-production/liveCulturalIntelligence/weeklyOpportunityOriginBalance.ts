/**
 * P0.5D.2 — Weekly opportunity origin balance (anti trend-only week).
 */

import type { BrandSignalInterpretation, LiveWorldSignal, WeeklyOpportunityOriginBalanceEvaluation } from './types.js';

export function buildWeeklyOpportunityOriginBalanceEvaluation(params: {
  projectId: string;
  signals: LiveWorldSignal[];
  opportunities: BrandSignalInterpretation[];
}): WeeklyOpportunityOriginBalanceEvaluation {
  const liveOrigins = new Set(['EMERGING', 'ACCELERATING', 'BREAKING', 'PEAKING']);
  const liveCount = params.signals.filter((s) => liveOrigins.has(s.signalOrigin)).length;
  const total = params.signals.length || 1;
  const liveTrendPercent = liveCount / total;

  return {
    evaluationId: `woob-${params.projectId}`,
    projectId: params.projectId,
    liveTrendPercent,
    evergreenPercent: params.signals.filter((s) => s.signalOrigin === 'EVERGREEN_REACTIVATED').length / total,
    callbackPercent: params.opportunities.filter((o) => o.hasHistoricalCallback).length / Math.max(params.opportunities.length, 1),
    knownMomentPercent: params.signals.filter((s) => s.signalOrigin === 'KNOWN_UPCOMING').length / total,
    trendOnlyWeek: liveTrendPercent >= 0.95 && params.signals.length >= 5,
    founderOverrideRequired: liveTrendPercent >= 0.95,
    evaluatedAt: new Date().toISOString(),
  };
}

export function trendOnlyWeekGuardTriggered(evaluation: WeeklyOpportunityOriginBalanceEvaluation): boolean {
  return evaluation.trendOnlyWeek && !evaluation.founderOverrideRequired === false;
}
