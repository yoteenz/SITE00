/**
 * Sprint B4.8 — Canonical persisted founder approval for Entry 002 pre-storyboard authorities.
 * Founder explicitly approved all five current authority versions as LOVE_IT.
 */

import { buildEntry002PreStoryboardAuthorityId } from '../../../shared/site00-expression-engine/preStoryboardAuthorityIds.js';
import type { PreStoryboardAuthorityKey } from './preStoryboardAuthorityGate.js';

export const ENTRY_002_PRE_STORYBOARD_AUTHORITY_VERSION = '001' as const;

export const ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVAL_APPROVED_AT =
  '2026-09-08T01:30:00.000Z' as const;

export type Entry002PreStoryboardFounderApprovalEntry = {
  authorityKey: PreStoryboardAuthorityKey;
  authorityId: string;
  boardNumber: number;
  boardTitle: string;
  founderJudgment: 'LOVE_IT';
  visualAuthority: true;
  canon: true;
  status: 'APPROVED';
  version: typeof ENTRY_002_PRE_STORYBOARD_AUTHORITY_VERSION;
  approvedAt: typeof ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVAL_APPROVED_AT;
};

export const ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS: Entry002PreStoryboardFounderApprovalEntry[] = [
  {
    authorityKey: 'AUTHORITY_01',
    authorityId: buildEntry002PreStoryboardAuthorityId(1),
    boardNumber: 1,
    boardTitle: 'NDX PRESENCE AUTHORITY',
    founderJudgment: 'LOVE_IT',
    visualAuthority: true,
    canon: true,
    status: 'APPROVED',
    version: ENTRY_002_PRE_STORYBOARD_AUTHORITY_VERSION,
    approvedAt: ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVAL_APPROVED_AT,
  },
  {
    authorityKey: 'AUTHORITY_02',
    authorityId: buildEntry002PreStoryboardAuthorityId(2),
    boardNumber: 2,
    boardTitle: 'SUBJECT WOMAN DUAL-ERA AUTHORITY',
    founderJudgment: 'LOVE_IT',
    visualAuthority: true,
    canon: true,
    status: 'APPROVED',
    version: ENTRY_002_PRE_STORYBOARD_AUTHORITY_VERSION,
    approvedAt: ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVAL_APPROVED_AT,
  },
  {
    authorityKey: 'AUTHORITY_03',
    authorityId: buildEntry002PreStoryboardAuthorityId(3),
    boardNumber: 3,
    boardTitle: 'NDX HANDS / NAILS / INTERACTIONS AUTHORITY',
    founderJudgment: 'LOVE_IT',
    visualAuthority: true,
    canon: true,
    status: 'APPROVED',
    version: ENTRY_002_PRE_STORYBOARD_AUTHORITY_VERSION,
    approvedAt: ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVAL_APPROVED_AT,
  },
  {
    authorityKey: 'AUTHORITY_04',
    authorityId: buildEntry002PreStoryboardAuthorityId(4),
    boardNumber: 4,
    boardTitle: 'SUBJECT FASHION CONTINUITY AUTHORITY',
    founderJudgment: 'LOVE_IT',
    visualAuthority: true,
    canon: true,
    status: 'APPROVED',
    version: ENTRY_002_PRE_STORYBOARD_AUTHORITY_VERSION,
    approvedAt: ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVAL_APPROVED_AT,
  },
  {
    authorityKey: 'AUTHORITY_05',
    authorityId: buildEntry002PreStoryboardAuthorityId(5),
    boardNumber: 5,
    boardTitle: 'PHONE / CULTURAL GLITCH AUTHORITY',
    founderJudgment: 'LOVE_IT',
    visualAuthority: true,
    canon: true,
    status: 'APPROVED',
    version: ENTRY_002_PRE_STORYBOARD_AUTHORITY_VERSION,
    approvedAt: ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVAL_APPROVED_AT,
  },
];

export function isEntry002PreStoryboardFounderApprovalComplete(
  judgments: Array<{ authorityKey: PreStoryboardAuthorityKey; founderJudgment: string }>,
): boolean {
  return ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS.every((expected) =>
    judgments.some(
      (j) => j.authorityKey === expected.authorityKey && j.founderJudgment === 'LOVE_IT',
    ),
  );
}
