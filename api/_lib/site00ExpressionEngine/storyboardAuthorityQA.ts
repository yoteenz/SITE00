/**
 * Sprint B4.6 — Structural storyboard authority QA.
 */

import type {
  ReelStoryboardAuthority,
  ReelTreatmentAuthority,
  StoryboardAuthorityQAResult,
} from '../../../shared/site00-expression-engine/storyboardGateTypes.js';
import { ENTRY_002_SBA_BOARD_COUNT } from '../../../shared/site00-expression-engine/storyboardAuthorityIds.js';

function boardCheck(
  boardNumber: number,
  check: string,
  passed: boolean,
): StoryboardAuthorityQAResult['boardChecks'][number] {
  return { boardNumber, check, passed };
}

export function runStoryboardAuthorityQA(
  treatment: ReelTreatmentAuthority,
  authority: ReelStoryboardAuthority,
): StoryboardAuthorityQAResult {
  const blockers: string[] = [];
  const boardChecks: StoryboardAuthorityQAResult['boardChecks'] = [];

  if (authority.beatOutline.length !== 10) {
    blockers.push(`Expected 10-beat outline, got ${authority.beatOutline.length}`);
  }

  if (authority.boards.length !== ENTRY_002_SBA_BOARD_COUNT) {
    blockers.push(`Expected ${ENTRY_002_SBA_BOARD_COUNT} separate structural boards, got ${authority.boards.length}`);
  }

  const boardIds = new Set(authority.boards.map((b) => b.boardId));
  if (boardIds.size !== authority.boards.length) {
    blockers.push('Duplicate board IDs detected — boards must be separate authorities');
  }

  for (const board of authority.boards) {
    const text = [
      board.visualDescription,
      board.storyFunction,
      board.continuityNotes,
      board.subjectWomanPresence,
      board.ndxPresence,
      board.requiredVisualElements.join(' '),
    ]
      .join(' ')
      .toLowerCase();

    boardChecks.push(
      boardCheck(
        board.boardNumber,
        'subject legibility',
        text.includes('woman') || text.includes('subject') || text.includes('identity'),
      ),
    );
    boardChecks.push(
      boardCheck(
        board.boardNumber,
        'NDX role clarity',
        text.includes('ndx') && !text.includes('ndx is the subject'),
      ),
    );
    boardChecks.push(
      boardCheck(
        board.boardNumber,
        'phone role clarity',
        board.boardNumber === 5
          ? text.includes('phone') || text.includes('glitch') || text.includes('snap')
          : text.includes('phone') || text.includes('profile') || text.includes('scroll'),
      ),
    );
    boardChecks.push(
      boardCheck(
        board.boardNumber,
        'same-woman continuity',
        text.includes('same') || text.includes('identity') || board.boardNumber === 1,
      ),
    );
    boardChecks.push(
      boardCheck(
        board.boardNumber,
        '2016 vs present distinction',
        board.boardNumber === 3 || board.boardNumber === 4
          ? text.includes('2016') || text.includes('present') || text.includes('timeline')
          : true,
      ),
    );
    boardChecks.push(
      boardCheck(
        board.boardNumber,
        'edit suite metaphor restraint',
        !text.includes('premiere') && !text.includes('final cut') && !text.includes('dashboard ui'),
      ),
    );
    boardChecks.push(
      boardCheck(
        board.boardNumber,
        'anti-randomness',
        !text.includes('random woman') && !text.includes('different person'),
      ),
    );
  }

  const treatmentText = `${treatment.coreStory} ${treatment.logline}`.toLowerCase();
  if (!treatmentText.includes('same woman') && !treatmentText.includes('same person')) {
    blockers.push('Treatment must lock same-woman contradiction');
  }
  if (!treatmentText.includes('rebrand') && !treatmentText.includes('apology')) {
    blockers.push('Treatment must include mandatory interjection thesis');
  }

  if (authority.boards.some((b) => b.keyframeExtractionRole === null && b.boardNumber === 1)) {
    /* board 1 should have START */
  }
  const hasStartMidEnd = ['START', 'MID', 'END'].every((role) =>
    authority.boards.some((b) => b.keyframeExtractionRole === role),
  );
  if (!hasStartMidEnd) {
    blockers.push('Missing START/MID/END keyframe extraction roles on structural boards');
  }

  const failedChecks = boardChecks.filter((c) => !c.passed);
  if (failedChecks.length > 0) {
    blockers.push(`${failedChecks.length} per-board QA checks failed`);
  }

  const passed = blockers.length === 0 && failedChecks.length === 0;
  return {
    passed,
    boardChecks,
    blockers,
    result: passed ? 'PASS' : blockers.length > 0 ? 'FAIL' : 'WARN',
  };
}
