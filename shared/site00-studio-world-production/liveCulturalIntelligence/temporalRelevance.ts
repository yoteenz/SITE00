/**
 * Temporal relevance + WHY NOW gate.
 */

import { randomUUID } from 'node:crypto';
import type {
  FreshnessState,
  LiveWorldSignal,
  TemporalClass,
  TemporalRelevanceEvaluation,
  WhyNowEvaluation,
  WhyNowResult,
} from './types.js';

export function evaluateTemporalRelevance(params: {
  signal: LiveWorldSignal;
  whyNow: string;
}): TemporalRelevanceEvaluation {
  const temporalClass = mapTemporalClass(params.signal);
  const now = new Date();
  const end = new Date(now);
  if (temporalClass === 'IMMEDIATE' || temporalClass === 'SAME_DAY') end.setHours(end.getHours() + 24);
  else if (temporalClass === 'THIS_WEEK') end.setDate(end.getDate() + 7);
  else end.setDate(end.getDate() + 30);

  return {
    id: `temp-${randomUUID().slice(0, 8)}`,
    signalId: params.signal.id,
    whyNow: params.whyNow,
    relevanceStart: now.toISOString(),
    idealPublishStart: now.toISOString(),
    idealPublishEnd: end.toISOString(),
    relevanceDecay: temporalClass === 'EVERGREEN' ? 'SLOW' : 'FAST',
    expirationRisk: params.signal.saturation > 0.7 ? 'HIGH' : 'MEDIUM',
    latePublishingPenalty: params.signal.signalOrigin === 'BREAKING' ? 'Narrative may feel late' : null,
    evergreenAfterWindow: temporalClass === 'EVERGREEN' || temporalClass === 'EVERGREEN_REACTIVATED',
    reactivationConditions: ['New evidence', 'Callback angle', 'Cultural reassessment'],
    temporalClass,
    evaluatedAt: now.toISOString(),
  };
}

function mapTemporalClass(signal: LiveWorldSignal): TemporalClass {
  if (signal.signalOrigin === 'BREAKING') return 'IMMEDIATE';
  if (signal.signalOrigin === 'ACCELERATING') return '24_HOUR';
  if (signal.signalOrigin === 'KNOWN_UPCOMING') return 'THIS_WEEK';
  if (signal.signalOrigin === 'EVERGREEN_REACTIVATED' || signal.signalOrigin === 'RESURFACED') return 'EVERGREEN_REACTIVATED';
  if (signal.signalOrigin === 'STABLE') return 'EVERGREEN';
  return '48_72_HOUR';
}

export function evaluateWhyNow(params: {
  signal: LiveWorldSignal;
  whatChanged: string;
  attentionDriver: string;
  saturation: number;
  windowEndPassed?: boolean;
}): WhyNowEvaluation {
  let result: WhyNowResult = 'TIMELY_NOW';
  if (params.windowEndPassed) result = 'WINDOW_PASSED';
  else if (params.signal.signalOrigin === 'KNOWN_UPCOMING') result = 'PREPARE_FOR_KNOWN_MOMENT';
  else if (params.saturation < 0.3 && params.signal.velocity < 0.4) result = 'WATCH_AND_WAIT';
  else if (params.signal.signalOrigin === 'EVERGREEN_REACTIVATED') result = 'EVERGREEN_BUT_REACTIVATED';
  else if (params.signal.signalOrigin === 'STABLE') result = 'NOT_TIME_SENSITIVE';
  else if (params.signal.signalOrigin === 'BREAKING') result = 'URGENT_NOW';

  return {
    id: `whynow-${randomUUID().slice(0, 8)}`,
    signalId: params.signal.id,
    whatChanged: params.whatChanged,
    whyRelevantNow: params.whatChanged,
    attentionDriver: params.attentionDriver,
    usefulPublishingWindow: result === 'WINDOW_PASSED' ? 'Retrospective/callback only' : 'Active',
    ifWeWait: params.saturation > 0.7 ? 'Conversation may saturate' : 'May remain open',
    interestingAfterTrend: params.signal.novelty > 0.5,
    result,
    evaluatedAt: new Date().toISOString(),
  };
}

export function expiredSignalMayBecomeCallback(whyNow: WhyNowEvaluation): boolean {
  return whyNow.result === 'WINDOW_PASSED' && whyNow.interestingAfterTrend;
}

export function whyNowRequiredBeforeSlate(whyNow: WhyNowEvaluation | null): boolean {
  return whyNow !== null && whyNow.whatChanged.length > 0 && whyNow.whyRelevantNow.length > 0;
}

export function evaluateContextualFreshness(params: {
  signalClass: string;
  ageHours: number;
}): FreshnessState {
  if (params.signalClass === 'BREAKING' && params.ageHours > 12) return 'STALE';
  if (params.signalClass === 'HISTORICAL' && params.ageHours > 8760) return 'HISTORICAL';
  if (params.ageHours < 2) return 'LIVE';
  if (params.ageHours < 24) return 'CURRENT';
  if (params.ageHours < 72) return 'RECENT';
  if (params.ageHours < 168) return 'AGING';
  return 'STALE';
}
