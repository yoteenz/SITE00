/**
 * Board-level QA v3 — adds CREATIVE_DIRECTION_AUTHORITY dimension.
 */

import type {
  BoardCreativeDirectorPass,
  BoardQaScoreReport,
  CreativeDirectionBoard,
  CreativeDirectionBoardPlan,
} from './creativeDirectionBoardTypes.js';
import {
  collectAllBoardCopyStrings,
  scanBoardCopyForContamination,
} from './markedUpCopyCopyContract.js';
import { inspectCreativeDirectionBoardV2, evaluateWordmarkRemovalHeuristic } from './boardInspectorV2.js';
import { isFounderReadyArtDirection } from './boardCreativeDirectorService.js';

export function inspectCreativeDirectionBoardV3(params: {
  plan: CreativeDirectionBoardPlan;
  board: CreativeDirectionBoard;
  boardCopySnippets: string[];
  wordmarkRemovalPass: boolean;
  creativeDirectorPass: BoardCreativeDirectorPass;
}): BoardQaScoreReport {
  const base = inspectCreativeDirectionBoardV2({
    plan: params.plan,
    board: params.board,
    boardCopySnippets: params.boardCopySnippets,
    wordmarkRemovalPass: params.wordmarkRemovalPass,
  });

  const notes = [...base.notes];
  const CREATIVE_DIRECTION_AUTHORITY = params.creativeDirectorPass.creativeDirectionAuthorityScore;

  if (!isFounderReadyArtDirection(params.creativeDirectorPass.artDirection)) {
    notes.push('Art direction not from Sonnet — cannot receive founder-ready designation');
  }

  const hasHierarchy =
    Boolean(params.creativeDirectorPass.hierarchy.dominantEvent) &&
    params.creativeDirectorPass.hierarchy.supportingDiscoveries.length >= 2 &&
    Boolean(params.creativeDirectorPass.hierarchy.quietZone);

  if (!hasHierarchy) notes.push('Hierarchy plan incomplete');

  const hasReferenceCritique = params.creativeDirectorPass.referenceTranslations.some(
    (r) => r.currentBoardUnderuse && r.newBoardTranslation,
  );
  if (!hasReferenceCritique) notes.push('Reference underuse critique missing');

  const total = base.total;
  const minCanonical = Math.min(
    base.CONCEPT_IMMEDIACY,
    base.BRAND_SPECIFICITY,
    base.REFERENCE_TRANSLATION,
    base.COMPOSITION_INTENT,
    base.SYSTEM_EXTENSIBILITY,
    base.TYPOGRAPHIC_INTEGRITY,
    base.MATERIAL_RELEVANCE,
    base.SOCIAL_APPLICABILITY,
    base.MOTION_COHERENCE,
    base.NON_STOCK_DISTINCTIVENESS,
  );

  let result: BoardQaScoreReport['result'] = 'PASS';
  if (
    minCanonical < 4 ||
    total < 43 ||
    CREATIVE_DIRECTION_AUTHORITY < 4 ||
    base.WORDMARK_REMOVAL_TEST === 'FAIL' ||
    base.GENERIC_STOCK_TEST === 'FAIL' ||
    base.DIRECTION_CONTAMINATION_TEST === 'FAIL' ||
    base.REFERENCE_TRANSLATION_TEST === 'FAIL' ||
    !isFounderReadyArtDirection(params.creativeDirectorPass.artDirection)
  ) {
    result = 'FAIL';
  } else if (notes.length) {
    result = 'NEEDS_HUMAN_REVIEW';
  }

  return {
    ...base,
    CREATIVE_DIRECTION_AUTHORITY,
    total,
    result,
    notes,
  };
}

export { evaluateWordmarkRemovalHeuristic };
