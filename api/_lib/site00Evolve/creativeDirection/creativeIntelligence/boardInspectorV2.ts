/**
 * Board-level QA v2 — 0–5 scoring with pass threshold 43/50.
 */

import type {
  BoardQaScoreReport,
  CreativeDirectionBoard,
  CreativeDirectionBoardPlan,
} from './creativeDirectionBoardTypes.js';
import {
  collectAllBoardCopyStrings,
  scanBoardCopyForContamination,
} from './markedUpCopyCopyContract.js';

function scoreFromAssets(board: CreativeDirectionBoard, minDecision: 'ACCEPT' | 'NEEDS_HUMAN_REVIEW'): number {
  const falAssets = board.assetRecords.filter((a) => a.generationMethod.startsWith('FAL'));
  if (!falAssets.length) return 3;
  const accepted = falAssets.filter((a) => a.qaState === 'ACCEPT').length;
  const inspected = falAssets.filter((a) => a.inspectionReport?.visionInspected).length;
  const avgStock =
    falAssets.reduce((s, a) => s + (a.inspectionReport?.stockLikeness ?? 3), 0) / falAssets.length;
  let base = 3 + accepted / falAssets.length;
  if (avgStock <= 2) base += 1;
  if (inspected > 0) base += 0.5;
  if (minDecision === 'ACCEPT' && accepted === falAssets.length) base += 0.5;
  return Math.min(5, Math.round(base));
}

export function inspectCreativeDirectionBoardV2(params: {
  plan: CreativeDirectionBoardPlan;
  board: CreativeDirectionBoard;
  boardCopySnippets: string[];
  wordmarkRemovalPass: boolean;
}): BoardQaScoreReport {
  const { plan, board, boardCopySnippets, wordmarkRemovalPass } = params;
  const notes: string[] = [];

  const contamination = scanBoardCopyForContamination([
    ...boardCopySnippets,
    ...collectAllBoardCopyStrings(),
  ]);

  const allAssetsReady = plan.assetManifest.every((m) =>
    board.assetRecords.some(
      (a) => a.manifestId === m.manifestId && a.productionState === 'READY' && a.qaState === 'ACCEPT',
    ),
  );

  const hasHybrid = plan.assetManifest.some((m) => m.classification === 'HYBRID_COMPOSITION');
  const hasRefConditioned = board.assetRecords.some((a) =>
    (a.referenceImageInputs?.length ?? 0) > 0,
  );
  const hasCodeNative = board.assetRecords.some(
    (a) => a.classification === 'CODE_NATIVE' || a.classification === 'SVG_NATIVE',
  );
  const hasDynamicArt = Boolean(plan.dynamicArtDirection?.lineage.provider === 'anthropic');

  const CONCEPT_IMMEDIACY = allAssetsReady && plan.dynamicArtDirection?.signatureMoment ? 5 : 4;
  const BRAND_SPECIFICITY = hasCodeNative && hasHybrid ? 5 : 4;
  const REFERENCE_TRANSLATION =
    (plan.referenceCrops?.length ?? 0) >= 2 && hasRefConditioned ? 5 : plan.resolvedReferences?.length ? 4 : 3;
  const COMPOSITION_INTENT = plan.desktopMap.placements.length >= 6 ? 5 : 4;
  const SYSTEM_EXTENSIBILITY = hasDynamicArt && hasCodeNative ? 5 : 4;
  const TYPOGRAPHIC_INTEGRITY = contamination.pass ? 5 : 2;
  const MATERIAL_RELEVANCE = scoreFromAssets(board, 'ACCEPT');
  const SOCIAL_APPLICABILITY = board.socialProofStoragePath ? 5 : 4;
  const MOTION_COHERENCE = board.motionProofStoragePath ? 5 : 4;
  const falAssets = board.assetRecords.filter((a) => a.generationMethod.startsWith('FAL'));
  const avgStock =
    falAssets.length > 0
      ? falAssets.reduce((s, a) => s + (a.inspectionReport?.stockLikeness ?? 2), 0) / falAssets.length
      : 1;
  const NON_STOCK_DISTINCTIVENESS = avgStock <= 2 ? 5 : avgStock <= 3 ? 4 : 2;

  const scores = {
    CONCEPT_IMMEDIACY,
    BRAND_SPECIFICITY,
    REFERENCE_TRANSLATION,
    COMPOSITION_INTENT,
    SYSTEM_EXTENSIBILITY,
    TYPOGRAPHIC_INTEGRITY,
    MATERIAL_RELEVANCE,
    SOCIAL_APPLICABILITY,
    MOTION_COHERENCE,
    NON_STOCK_DISTINCTIVENESS,
  };

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const minScore = Math.min(...Object.values(scores));

  const WORDMARK_REMOVAL_TEST: 'PASS' | 'FAIL' = wordmarkRemovalPass ? 'PASS' : 'FAIL';
  const GENERIC_STOCK_TEST: 'PASS' | 'FAIL' = avgStock <= 3 && NON_STOCK_DISTINCTIVENESS >= 4 ? 'PASS' : 'FAIL';
  const DIRECTION_CONTAMINATION_TEST: 'PASS' | 'FAIL' = contamination.pass ? 'PASS' : 'FAIL';
  const REFERENCE_TRANSLATION_TEST: 'PASS' | 'FAIL' = REFERENCE_TRANSLATION >= 4 ? 'PASS' : 'FAIL';

  if (!allAssetsReady) notes.push('Not all manifest assets accepted');
  if (!contamination.pass) notes.push(`Contamination: ${contamination.violations.join(', ')}`);
  if (!wordmarkRemovalPass) notes.push('Wordmark-removal test failed');
  if (GENERIC_STOCK_TEST === 'FAIL') notes.push('Generic stock test failed');

  let result: BoardQaScoreReport['result'] = 'PASS';
  if (
    minScore < 4 ||
    total < 43 ||
    WORDMARK_REMOVAL_TEST === 'FAIL' ||
    GENERIC_STOCK_TEST === 'FAIL' ||
    DIRECTION_CONTAMINATION_TEST === 'FAIL'
  ) {
    result = 'FAIL';
  } else if (notes.length) {
    result = 'NEEDS_HUMAN_REVIEW';
  }

  return {
    ...scores,
    total,
    WORDMARK_REMOVAL_TEST,
    GENERIC_STOCK_TEST,
    DIRECTION_CONTAMINATION_TEST,
    REFERENCE_TRANSLATION_TEST,
    result,
    notes,
  };
}

export function evaluateWordmarkRemovalHeuristic(plan: CreativeDirectionBoardPlan): boolean {
  const art = plan.dynamicArtDirection;
  if (!art) return false;
  const combined = `${art.boardStory} ${art.signatureMoment} ${art.annotationGrammar} ${art.artifactBehavior}`.toLowerCase();
  return (
    combined.includes('strike') ||
    combined.includes('cross') ||
    combined.includes('margin') ||
    combined.includes('revision') ||
    combined.includes('replace')
  );
}
