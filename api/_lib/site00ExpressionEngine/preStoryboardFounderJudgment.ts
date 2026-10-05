/**
 * Sprint B4.7 — Pre-storyboard authority founder judgment helpers.
 */

import type {
  PreStoryboardFounderJudgment,
  PreStoryboardVisualAuthority,
} from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import {
  PRE_STORYBOARD_AUTHORITY_KEYS,
  preStoryboardAuthorityKey,
  type PreStoryboardAuthorityKey,
} from './preStoryboardAuthorityGate.js';
import {
  getAllPreStoryboardAuthorityJudgments,
  recordPreStoryboardAuthorityJudgment,
} from './preStoryboardAuthorityStore.js';

export const FOUNDER_PRE_STORYBOARD_JUDGMENT_OPTIONS: Exclude<
  PreStoryboardFounderJudgment,
  'UNREVIEWED'
>[] = ['LOVE_IT', 'PROMISING_REFINE', 'NOT_FOR_ME'];

export type PreStoryboardFounderReviewSlot = {
  authorityKey: PreStoryboardAuthorityKey;
  authorityId: string;
  boardNumber: number;
  boardTitle: string;
  founderJudgment: PreStoryboardFounderJudgment;
  allowedJudgments: PreStoryboardFounderJudgment[];
};

export function buildPreStoryboardFounderReviewSlots(
  authorities: PreStoryboardVisualAuthority[],
): PreStoryboardFounderReviewSlot[] {
  const stored = new Map(
    getAllPreStoryboardAuthorityJudgments().map((j) => [j.authorityKey, j.founderJudgment]),
  );

  return authorities.map((board) => {
    const key = preStoryboardAuthorityKey(board.boardNumber);
    return {
      authorityKey: key,
      authorityId: board.boardId,
      boardNumber: board.boardNumber,
      boardTitle: board.boardTitle,
      founderJudgment: stored.get(key) ?? board.founderJudgment,
      allowedJudgments: ['UNREVIEWED', ...FOUNDER_PRE_STORYBOARD_JUDGMENT_OPTIONS],
    };
  });
}

export function applyStoredPreStoryboardJudgments(
  authorities: PreStoryboardVisualAuthority[],
): PreStoryboardVisualAuthority[] {
  const stored = new Map(
    getAllPreStoryboardAuthorityJudgments().map((j) => [j.authorityKey, j.founderJudgment]),
  );

  return authorities.map((board) => {
    const key = preStoryboardAuthorityKey(board.boardNumber);
    const judgment = stored.get(key);
    if (!judgment) return board;
    return { ...board, founderJudgment: judgment };
  });
}

export function applyPreStoryboardFounderJudgments(
  authorities: PreStoryboardVisualAuthority[],
  judgments: Partial<Record<PreStoryboardAuthorityKey, PreStoryboardFounderJudgment>>,
): PreStoryboardVisualAuthority[] {
  for (const key of PRE_STORYBOARD_AUTHORITY_KEYS) {
    const judgment = judgments[key];
    if (!judgment) continue;
    const board = authorities.find((a) => preStoryboardAuthorityKey(a.boardNumber) === key);
    if (!board) continue;
    recordPreStoryboardAuthorityJudgment({
      authorityKey: key,
      authorityId: board.boardId,
      founderJudgment: judgment,
    });
  }
  return applyStoredPreStoryboardJudgments(authorities);
}

export function summarizePreStoryboardFounderReview(authorities: PreStoryboardVisualAuthority[]): {
  loveItCount: number;
  promisingCount: number;
  notForMeCount: number;
  unreviewedCount: number;
  gateSatisfied: boolean;
} {
  const counts = { loveItCount: 0, promisingCount: 0, notForMeCount: 0, unreviewedCount: 0 };
  for (const board of authorities) {
    if (board.founderJudgment === 'LOVE_IT') counts.loveItCount += 1;
    else if (board.founderJudgment === 'PROMISING_REFINE') counts.promisingCount += 1;
    else if (board.founderJudgment === 'NOT_FOR_ME') counts.notForMeCount += 1;
    else counts.unreviewedCount += 1;
  }
  return {
    ...counts,
    gateSatisfied: counts.loveItCount === PRE_STORYBOARD_AUTHORITY_KEYS.length,
  };
}
