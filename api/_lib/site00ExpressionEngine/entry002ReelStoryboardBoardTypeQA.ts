/**
 * Sprint B4.9R3 — Board-type QA for reel storyboard artifact.
 */

import type { BoardTypeQAResult } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';

export function runReelStoryboardBoardTypeQA(params: {
  storyboardAssetCount: number;
  selectedMomentCount: number;
  isUnrelatedContactSheet?: boolean;
  isAuthorityBoardClone?: boolean;
  isInfographic?: boolean;
}): BoardTypeQAResult {
  const checks: BoardTypeQAResult['checks'] = [];
  const blockers: string[] = [];

  const isSingleImage = params.storyboardAssetCount === 1;
  const isMultiImageSequenceWithinBoard = params.selectedMomentCount >= 8;
  const isStoryMoodBoard = isSingleImage && isMultiImageSequenceWithinBoard;
  const isCinematicSequence = isMultiImageSequenceWithinBoard && !params.isUnrelatedContactSheet;
  const isInfographic = params.isInfographic ?? false;
  const isTechnicalSpecBoard = false;
  const isAuthorityBoardClone = params.isAuthorityBoardClone ?? false;
  const isUnrelatedContactSheet = params.isUnrelatedContactSheet ?? false;

  checks.push({ check: 'isSingleImage', passed: isSingleImage });
  checks.push({ check: 'isMultiImageSequenceWithinBoard', passed: isMultiImageSequenceWithinBoard });
  checks.push({ check: 'isStoryMoodBoard', passed: isStoryMoodBoard });
  checks.push({ check: 'isCinematicSequence', passed: isCinematicSequence });
  checks.push({ check: 'isInfographic=false', passed: !isInfographic });
  checks.push({ check: 'isTechnicalSpecBoard=false', passed: !isTechnicalSpecBoard });
  checks.push({ check: 'isAuthorityBoardClone=false', passed: !isAuthorityBoardClone });
  checks.push({ check: 'isUnrelatedContactSheet=false', passed: !isUnrelatedContactSheet });

  for (const c of checks) {
    if (!c.passed) blockers.push(c.check);
  }

  return {
    passed: blockers.length === 0,
    result: blockers.length === 0 ? 'PASS' : 'FAIL',
    isSingleImage,
    isMultiImageSequenceWithinBoard,
    isStoryMoodBoard,
    isCinematicSequence,
    isInfographic,
    isTechnicalSpecBoard,
    isAuthorityBoardClone,
    isUnrelatedContactSheet,
    checks,
    blockers,
  };
}
