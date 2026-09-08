/**
 * Sprint B4.7 — Build first-class pre-storyboard authority records.
 */

import type {
  PreStoryboardAuthorityRecord,
  PreStoryboardAuthorityType,
  PreStoryboardFounderJudgment,
  PreStoryboardVisualAuthority,
  PreStoryboardVisualAuthorityRole,
} from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';

const ROLE_TO_TYPE: Record<PreStoryboardVisualAuthorityRole, PreStoryboardAuthorityType> = {
  NDX_PRESENCE: 'NDX_PRESENCE',
  SUBJECT_WOMAN_DUAL_ERA: 'SUBJECT_DUAL_ERA',
  NDX_HAND_NAIL_INTERACTION: 'NDX_HANDS_NAILS',
  SUBJECT_FASHION_CONTINUITY: 'SUBJECT_FASHION_CONTINUITY',
  PHONE_CULTURAL_GLITCH: 'PHONE_CULTURAL_GLITCH',
};

const DOMAIN_LABELS: Record<PreStoryboardVisualAuthorityRole, string> = {
  NDX_PRESENCE: 'NDX observer partial presence',
  SUBJECT_WOMAN_DUAL_ERA: 'Subject woman dual-era identity',
  NDX_HAND_NAIL_INTERACTION: 'NDX hands / nails / interactions',
  SUBJECT_FASHION_CONTINUITY: 'Subject fashion continuity 2016 vs 2026',
  PHONE_CULTURAL_GLITCH: 'Phone / profile scroll / cultural glitch',
};

function authorityStatus(judgment: PreStoryboardFounderJudgment): PreStoryboardAuthorityRecord['status'] {
  if (judgment === 'LOVE_IT') return 'APPROVED';
  if (judgment === 'NOT_FOR_ME') return 'REJECTED';
  if (judgment === 'PROMISING_REFINE') return 'UNDER_REVIEW';
  return 'VISUAL_INGESTED';
}

export function buildPreStoryboardAuthorityRecord(
  board: PreStoryboardVisualAuthority,
  options?: { version?: string; notes?: string | null },
): PreStoryboardAuthorityRecord {
  const now = new Date().toISOString();
  const judgment = board.founderJudgment;
  const isApproved = judgment === 'LOVE_IT';

  return {
    authorityId: board.boardId,
    entryId: 'entry-002',
    authorityType: ROLE_TO_TYPE[board.role],
    title: board.boardTitle,
    domain: board.role,
    status: authorityStatus(judgment),
    founderJudgment: judgment,
    visualAuthority: isApproved,
    canon: isApproved,
    referenceOnly: false,
    assetId: board.boardId,
    version: options?.version ?? '001',
    createdAt: now,
    updatedAt: now,
    approvedAt: isApproved ? now : null,
    notes: options?.notes ?? null,
  };
}

export function attachPreStoryboardAuthorityRecords(
  authorities: PreStoryboardVisualAuthority[],
): PreStoryboardVisualAuthority[] {
  return authorities.map((board) => ({
    ...board,
    record: buildPreStoryboardAuthorityRecord(board),
  }));
}

export function summarizePreStoryboardAuthorityRecords(
  authorities: PreStoryboardVisualAuthority[],
): {
  records: PreStoryboardAuthorityRecord[];
  allVisualAuthority: boolean;
  allExist: boolean;
} {
  const records = authorities.map((a) => a.record ?? buildPreStoryboardAuthorityRecord(a));
  return {
    records,
    allVisualAuthority: records.every((r) => r.visualAuthority),
    allExist: records.length === 5,
  };
}

export { DOMAIN_LABELS, ROLE_TO_TYPE };
