/**
 * Editorial health + content fatigue for high-volume cadence.
 */

import type {
  ContentFatigueEvaluation,
  ContentFatigueLevel,
  DailyEditorialHealthEvaluation,
  DailyPrimaryContentEvent,
  PlatformContentExpression,
  WeeklyEditorialHealthEvaluation,
} from './types.js';

export function evaluateDailyEditorialHealth(params: {
  projectId: string;
  date: string;
  primaryEvents: DailyPrimaryContentEvent[];
  expressions: PlatformContentExpression[];
}): DailyEditorialHealthEvaluation {
  const topics = params.primaryEvents.map((e) => e.primarySubject);
  const behaviors = params.primaryEvents.map((e) => e.behavioralMode);
  const temperatures = params.primaryEvents.map((e) => e.characterTemperature);
  const formats = params.expressions.map((e) => `${e.platform}_${e.surface}`);
  const topicRepetition = new Set(topics).size < topics.length ? 'FAIL' : 'PASS';
  const behaviorRepetition = new Set(behaviors).size < behaviors.length ? 'FAIL' : 'PASS';
  const temperatureRepetition = new Set(temperatures).size < Math.min(3, temperatures.length) ? 'FAIL' : 'PASS';
  const formatRepetition = new Set(formats).size < formats.length / 2 ? 'FAIL' : 'PASS';
  const visualRepetition =
    params.expressions.filter((e) => e.visualStrategy === params.expressions[0]?.visualStrategy).length > 4
      ? 'FAIL'
      : 'PASS';

  const failureStates: DailyEditorialHealthEvaluation['failureStates'] = [];
  if (temperatureRepetition === 'FAIL' && temperatures.every((t) => t === 'SERIOUS')) {
    failureStates.push('FAIL_DAILY_CHARACTER_RANGE_COLLAPSE');
  }

  return {
    evaluationId: `daily-health-${params.date}`,
    projectId: params.projectId,
    date: params.date,
    topicRepetition,
    behaviorRepetition,
    temperatureRepetition,
    formatRepetition,
    visualRepetition,
    failureStates,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateWeeklyEditorialHealth(params: {
  projectId: string;
  weekStart: string;
  weekEnd: string;
  primaryEvents: DailyPrimaryContentEvent[];
  expressions: PlatformContentExpression[];
  fatigue: ContentFatigueLevel;
}): WeeklyEditorialHealthEvaluation {
  const topics = new Set(params.primaryEvents.map((e) => e.primarySubject));
  const behaviors = new Set(params.primaryEvents.map((e) => e.behavioralMode));
  const platforms = new Set(params.expressions.map((e) => e.platform));

  const failureStates: WeeklyEditorialHealthEvaluation['failureStates'] = [];
  if (topics.size < Math.min(14, params.primaryEvents.length * 0.6)) {
    failureStates.push('FAIL_WEEKLY_CHARACTER_RANGE_COLLAPSE');
  }

  return {
    evaluationId: `weekly-health-${params.weekStart}`,
    projectId: params.projectId,
    weekStart: params.weekStart,
    weekEnd: params.weekEnd,
    topicDiversity: topics.size >= 14 ? 'PASS' : 'FAIL',
    behavioralRange: behaviors.size >= 5 ? 'PASS' : 'FAIL',
    characterRange: 'PASS',
    emotionalRange: 'PASS',
    channelRange: platforms.size >= 2 ? 'PASS' : 'FAIL',
    platformNativeRange: params.expressions.some((e) => e.platform !== 'INSTAGRAM') ? 'PASS' : 'FAIL',
    cadenceFatigue: params.fatigue,
    failureStates,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateContentFatigue(params: {
  projectId: string;
  windowStart: string;
  windowEnd: string;
  expressions: PlatformContentExpression[];
}): ContentFatigueEvaluation {
  const hooks = params.expressions.map((e) => e.hook.slice(0, 20));
  const duplicateHooks = hooks.length - new Set(hooks).size;
  const sameReelStructure = params.expressions.filter((e) => e.reelTypeBehavior === 'RABBIT_HOLE').length;
  let level: ContentFatigueLevel = 'LOW';
  const signals: string[] = [];
  if (duplicateHooks >= 3) {
    level = 'MODERATE';
    signals.push('SAME_HOOK_SYNTAX');
  }
  if (sameReelStructure > params.expressions.length * 0.7) {
    level = 'HIGH';
    signals.push('SAME_REEL_STRUCTURE');
  }
  if (duplicateHooks >= 7) level = 'CRITICAL';

  return {
    evaluationId: `fatigue-${params.windowStart}`,
    projectId: params.projectId,
    windowStart: params.windowStart,
    windowEnd: params.windowEnd,
    level,
    signals,
    evaluatedAt: new Date().toISOString(),
  };
}
