/**
 * Board QA v4 — expression-system completeness + template/no-explanation gates.
 */

import type { DirectionExpressionSystem } from './directionExpressionSystemTypes.js';
import type { BoardQaScoreReport, CreativeDirectionBoard, CreativeDirectionBoardPlan } from './creativeDirectionBoardTypes.js';
import { inspectCreativeDirectionBoardV3 } from './boardInspectorV3.js';
import { isFounderReadyExpressionSystem } from './directionExpressionSystemService.js';
import type { parseBoardV4CritiqueResponse } from './boardCreativeDirectorV4Service.js';
import { scanBoardCopyForContamination } from './markedUpCopyCopyContract.js';

export function inspectCreativeDirectionBoardV4(params: {
  plan: CreativeDirectionBoardPlan;
  board: CreativeDirectionBoard;
  boardCopySnippets: string[];
  wordmarkRemovalPass: boolean;
  expressionSystem: DirectionExpressionSystem;
  boardArtDirection: ReturnType<typeof parseBoardV4CritiqueResponse>;
  creativeDirectorPass: Parameters<typeof inspectCreativeDirectionBoardV3>[0]['creativeDirectorPass'];
}): BoardQaScoreReport {
  const base = inspectCreativeDirectionBoardV3({
    plan: params.plan,
    board: params.board,
    boardCopySnippets: params.boardCopySnippets,
    wordmarkRemovalPass: params.wordmarkRemovalPass,
    creativeDirectorPass: params.creativeDirectorPass,
  });

  const notes = [...base.notes];
  const sys = params.expressionSystem;

  const IDENTITY_SYSTEM_COMPLETENESS =
    sys.recurringContentFranchises.length >= 2 &&
    sys.photographySystem.subjectMatter &&
    sys.typographySystem.cleanVoice &&
    sys.graphicGrammar.selectedDevices.length >= 3
      ? 5
      : 4;

  const NO_EXPLANATION_STRENGTH = sys.qualityGates.noExplanationTest.score;
  const FIFTY_POST_EXTENSIBILITY = sys.qualityGates.fiftyPostTest.score;

  const NON_TEMPLATE_DISTINCTIVENESS =
    params.boardArtDirection.fixedTemplateInherited || params.boardArtDirection.templateSubstitutionRisk === 'HIGH'
      ? 2
      : params.boardArtDirection.templateSubstitutionRisk === 'MEDIUM'
        ? 3
        : 5;

  const TEMPLATE_SUBSTITUTION_TEST: 'PASS' | 'FAIL' =
    params.boardArtDirection.templateSubstitutionRisk === 'HIGH' ||
    params.plan.fixedTemplateInherited === true
      ? 'FAIL'
      : 'PASS';

  if (params.boardArtDirection.visualEvidenceDominance === 'LOW') {
    notes.push('Visual evidence dominance too low — NO_EXPLANATION_TEST at risk');
  }

  if (!isFounderReadyExpressionSystem(sys)) {
    notes.push('Expression system not Sonnet-authored');
  }

  const contamination = scanBoardCopyForContamination(params.boardCopySnippets);
  if (!contamination.pass) notes.push(`Contamination: ${contamination.violations.join(', ')}`);

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

  const CREATIVE_DIRECTION_AUTHORITY = base.CREATIVE_DIRECTION_AUTHORITY ?? 4;

  let result: BoardQaScoreReport['result'] = 'PASS';
  if (
    minCanonical < 4 ||
    base.total < 43 ||
    CREATIVE_DIRECTION_AUTHORITY < 4 ||
    IDENTITY_SYSTEM_COMPLETENESS < 4 ||
    NO_EXPLANATION_STRENGTH < 4 ||
    FIFTY_POST_EXTENSIBILITY < 4 ||
    NON_TEMPLATE_DISTINCTIVENESS < 4 ||
    base.WORDMARK_REMOVAL_TEST === 'FAIL' ||
    base.GENERIC_STOCK_TEST === 'FAIL' ||
    base.DIRECTION_CONTAMINATION_TEST === 'FAIL' ||
    base.REFERENCE_TRANSLATION_TEST === 'FAIL' ||
    TEMPLATE_SUBSTITUTION_TEST === 'FAIL' ||
    !isFounderReadyExpressionSystem(sys)
  ) {
    result = 'FAIL';
  } else if (notes.length) {
    result = 'NEEDS_HUMAN_REVIEW';
  }

  return {
    ...base,
    CREATIVE_DIRECTION_AUTHORITY,
    IDENTITY_SYSTEM_COMPLETENESS,
    NO_EXPLANATION_STRENGTH,
    FIFTY_POST_EXTENSIBILITY,
    NON_TEMPLATE_DISTINCTIVENESS,
    TEMPLATE_SUBSTITUTION_TEST,
    result,
    notes,
  };
}

export { evaluateWordmarkRemovalHeuristic } from './boardInspectorV3.js';
