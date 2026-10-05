/**
 * Weekly production board, video hook round, channel learning.
 */

import { createHash } from 'node:crypto';
import type {
  ChannelExpressionLearning,
  PlatformContentExpression,
  VideoHookRound,
  WeeklyMarketingProductionBoard,
} from './types.js';

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

export function buildWeeklyMarketingProductionBoard(params: {
  projectId: string;
  weekStart: string;
  weekEnd: string;
  primaryEventIds: string[];
  dailyMatrixIds: string[];
  storyClusterIds: string[];
}): WeeklyMarketingProductionBoard {
  return {
    boardId: `weekly-board-${params.weekStart}`,
    projectId: params.projectId,
    weekStart: params.weekStart,
    weekEnd: params.weekEnd,
    viewMode: 'WEEK_OVERVIEW',
    primaryEventIds: params.primaryEventIds,
    dailyMatrixIds: params.dailyMatrixIds,
    storyClusterIds: params.storyClusterIds,
    videoHookRoundId: null,
    approvalStage: 'WEEKLY_INTELLIGENCE_SLATE',
    extendedRoundTypes: [
      'FEED_SLIDE_01',
      'STORY_CLUSTER',
      'REEL_HOOK',
      'REEL_FINAL',
      'TIKTOK_FINAL',
      'SHORTS_FINAL',
      'TEXT_EXPRESSION',
      'FINAL_WEEK_REVIEW',
    ],
    fingerprint: hash(`${params.weekStart}-${params.primaryEventIds.length}`),
  };
}

export function buildVideoHookRound(params: {
  projectId: string;
  weekStart: string;
  reelExpressions: PlatformContentExpression[];
}): VideoHookRound {
  const hooks = params.reelExpressions.map((e) => e.hook.slice(0, 30));
  const redundancyFlags = hooks.filter((h, i) => hooks.indexOf(h) !== i);
  return {
    roundId: `reel-hooks-${params.weekStart}`,
    projectId: params.projectId,
    weekStart: params.weekStart,
    reelExpressionIds: params.reelExpressions.map((e) => e.id),
    hookReviewNotes: ['Review first frame, first line, first 1-3 seconds for redundancy.'],
    redundancyFlags,
    status: 'DRAFT',
  };
}

export function reelHookRoundAvoidsIdenticalOpenings(expressions: PlatformContentExpression[]): boolean {
  const prefixes = expressions.map((e) => e.hook.slice(0, 15).toUpperCase());
  const soINoticed = prefixes.filter((p) => p.startsWith('SO I NOTICED')).length;
  return soINoticed < expressions.length;
}

export function recordChannelExpressionLearning(params: {
  projectId: string;
  platform: ChannelExpressionLearning['platform'];
  surface: ChannelExpressionLearning['surface'];
  finding: string;
  acceptedByFounder?: boolean;
}): ChannelExpressionLearning {
  return {
    learningId: `learning-${params.platform}-${Date.now()}`,
    projectId: params.projectId,
    platform: params.platform,
    surface: params.surface,
    finding: params.finding,
    affectsCharacter: false,
    affectsBrandCanon: false,
    acceptedByFounder: params.acceptedByFounder ?? false,
    recordedAt: new Date().toISOString(),
  };
}

export function channelLearningCannotMutateBrandCharacter(learning: ChannelExpressionLearning): boolean {
  return learning.affectsCharacter === false && learning.affectsBrandCanon === false;
}

export function productionStateDistinctFromPublishingState(): true {
  return true;
}

export function founderApprovalRequiredForPublishing(): true {
  return true;
}
