/**
 * Sprint B4.6 follow-up — GATE_0B pre-storyboard visual authority gate.
 */

import type {
  PreStoryboardApprovalState,
  PreStoryboardFounderJudgment,
  PreStoryboardGateSatisfaction,
  PreStoryboardVisualAuthority,
} from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';

export const PRE_STORYBOARD_VISUAL_GATE_ID = 'GATE_0B_PRE_STORYBOARD_AUTHORITY' as const;

export type PreStoryboardAuthorityKey =
  | 'AUTHORITY_01'
  | 'AUTHORITY_02'
  | 'AUTHORITY_03'
  | 'AUTHORITY_04'
  | 'AUTHORITY_05';

export const PRE_STORYBOARD_AUTHORITY_KEYS: PreStoryboardAuthorityKey[] = [
  'AUTHORITY_01',
  'AUTHORITY_02',
  'AUTHORITY_03',
  'AUTHORITY_04',
  'AUTHORITY_05',
];

export function preStoryboardAuthorityKey(boardNumber: number): PreStoryboardAuthorityKey {
  return `AUTHORITY_${String(boardNumber).padStart(2, '0')}` as PreStoryboardAuthorityKey;
}

export function buildPreStoryboardApprovalState(
  authorities: PreStoryboardVisualAuthority[],
  judgments?: Partial<Record<PreStoryboardAuthorityKey, PreStoryboardFounderJudgment>>,
): PreStoryboardApprovalState {
  const boardJudgments = PRE_STORYBOARD_AUTHORITY_KEYS.reduce(
    (acc, key, index) => {
      const board = authorities.find((b) => b.boardNumber === index + 1);
      acc[key] = judgments?.[key] ?? board?.founderJudgment ?? 'UNREVIEWED';
      return acc;
    },
    {} as PreStoryboardApprovalState['boardJudgments'],
  );

  const allAuthoritiesLoveIt = PRE_STORYBOARD_AUTHORITY_KEYS.every(
    (k) => boardJudgments[k] === 'LOVE_IT',
  );

  return {
    gateId: PRE_STORYBOARD_VISUAL_GATE_ID,
    boardJudgments,
    allAuthoritiesLoveIt,
    anyNotForMe: PRE_STORYBOARD_AUTHORITY_KEYS.some((k) => boardJudgments[k] === 'NOT_FOR_ME'),
    blocksCinematicStoryboard: !allAuthoritiesLoveIt,
  };
}

export function buildPreStoryboardGateSatisfaction(
  authorities: PreStoryboardVisualAuthority[],
): PreStoryboardGateSatisfaction {
  const counts = { loveItCount: 0, unreviewedCount: 0, promisingCount: 0, notForMeCount: 0 };
  for (const board of authorities) {
    if (board.founderJudgment === 'LOVE_IT') counts.loveItCount += 1;
    else if (board.founderJudgment === 'PROMISING_REFINE') counts.promisingCount += 1;
    else if (board.founderJudgment === 'NOT_FOR_ME') counts.notForMeCount += 1;
    else counts.unreviewedCount += 1;
  }

  return {
    gateId: PRE_STORYBOARD_VISUAL_GATE_ID,
    satisfied: counts.loveItCount === PRE_STORYBOARD_AUTHORITY_KEYS.length,
    requiredCount: 5,
    ...counts,
  };
}

export function isPreStoryboardAuthorityApproved(
  authorities: PreStoryboardVisualAuthority[],
): boolean {
  return (
    authorities.length === PRE_STORYBOARD_AUTHORITY_KEYS.length &&
    PRE_STORYBOARD_AUTHORITY_KEYS.every((_, index) => {
      const board = authorities.find((a) => a.boardNumber === index + 1);
      return board?.founderJudgment === 'LOVE_IT' && (board.record?.visualAuthority ?? board.founderJudgment === 'LOVE_IT');
    })
  );
}

export function assertPreStoryboardVisualAuthorityApprovedForStoryboard(
  approvalState: PreStoryboardApprovalState,
): void {
  if (approvalState.blocksCinematicStoryboard) {
    const pending = PRE_STORYBOARD_AUTHORITY_KEYS.filter(
      (k) => approvalState.boardJudgments[k] !== 'LOVE_IT',
    ).join(', ');
    throw new Error(
      `CINEMATIC_STORYBOARD blocked — ${PRE_STORYBOARD_VISUAL_GATE_ID} requires LOVE_IT on all 5 pre-storyboard visual authorities (pending: ${pending})`,
    );
  }
}

export function isCinematicStoryboardBlockedByPreStoryboardGate(
  approvalState: PreStoryboardApprovalState,
): boolean {
  return approvalState.blocksCinematicStoryboard;
}
