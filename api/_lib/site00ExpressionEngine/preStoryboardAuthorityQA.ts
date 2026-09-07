/**
 * Sprint B4.6 follow-up — Pre-storyboard visual authority QA.
 */

import type {
  PreStoryboardAuthorityQAResult,
  PreStoryboardVisualAuthorityPack,
} from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import { ENTRY_002_PRE_SBA_COUNT } from '../../../shared/site00-expression-engine/preStoryboardAuthorityIds.js';

export function runPreStoryboardAuthorityQA(
  pack: PreStoryboardVisualAuthorityPack,
): PreStoryboardAuthorityQAResult {
  const blockers: string[] = [];
  const boardChecks: PreStoryboardAuthorityQAResult['boardChecks'] = [];

  if (pack.authorities.length !== ENTRY_002_PRE_SBA_COUNT) {
    blockers.push(`Expected ${ENTRY_002_PRE_SBA_COUNT} separate authorities`);
  }

  const roles = new Set(pack.authorities.map((a) => a.role));
  if (roles.size !== pack.authorities.length) {
    blockers.push('Duplicate authority roles');
  }

  for (const board of pack.authorities) {
    const text = [
      board.purpose,
      board.visualDescription,
      board.continuityRules.join(' '),
      board.forbiddenElements.join(' '),
    ]
      .join(' ')
      .toLowerCase();

    boardChecks.push({
      boardNumber: board.boardNumber,
      check: 'role split — no collapsed NDX/subject identity',
      passed: !text.includes('same ndxbook woman every frame'),
    });

    boardChecks.push({
      boardNumber: board.boardNumber,
      check: 'separate board authority',
      passed: Boolean(board.boardId) && Boolean(board.purpose),
    });

    if (board.role === 'SUBJECT_WOMAN_DUAL_ERA') {
      boardChecks.push({
        boardNumber: board.boardNumber,
        check: 'dual-era subject lock',
        passed: text.includes('2016') && text.includes('2026') && text.includes('same'),
      });
    }

    if (board.role === 'NDX_HAND_NAIL_INTERACTION') {
      boardChecks.push({
        boardNumber: board.boardNumber,
        check: 'lime nail authority',
        passed: text.includes('lime') && text.includes('nail'),
      });
    }
  }

  const failed = boardChecks.filter((c) => !c.passed);
  if (failed.length > 0) blockers.push(`${failed.length} authority QA checks failed`);

  return {
    passed: blockers.length === 0,
    boardChecks,
    blockers,
    result: blockers.length === 0 ? 'PASS' : 'FAIL',
  };
}
