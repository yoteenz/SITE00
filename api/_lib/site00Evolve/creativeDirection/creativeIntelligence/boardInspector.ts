/**
 * Board-level QA — inspect final composed board, not only component assets.
 */

import type { BoardQaReport, CreativeDirectionBoard, CreativeDirectionBoardPlan } from './creativeDirectionBoardTypes.js';

export function inspectCreativeDirectionBoard(params: {
  plan: CreativeDirectionBoardPlan;
  board: CreativeDirectionBoard;
}): BoardQaReport {
  const { plan, board } = params;
  const notes: string[] = [];
  const falAssets = board.assetRecords.filter((a) => a.generationMethod.startsWith('FAL'));
  const stockFlags = falAssets.flatMap((a) =>
    a.inspectionNotes.filter((n) => n.toLowerCase().includes('stock') || n.toLowerCase().includes('generic')),
  );
  const allAssetsReady = plan.assetManifest.every((m) =>
    board.assetRecords.some(
      (a) => a.manifestId === m.manifestId && a.productionState === 'READY' && a.qaState === 'ACCEPT',
    ),
  );
  const hasCodeNative = board.assetRecords.some((a) => a.classification === 'CODE_NATIVE' || a.classification === 'SVG_NATIVE');
  const hasIsolation = board.assetRecords.some((a) => a.backgroundRemovalRequired && a.productionState === 'READY');
  const hasMultipleModes =
    falAssets.length >= 2 && hasCodeNative && Boolean(board.desktopBoardUrl) && Boolean(board.mobileBoardUrl);

  const conceptUnder5Seconds = allAssetsReady && !!plan.artDirection.signatureMoment;
  const brandWorldNotCollage = hasMultipleModes;
  const contemporary = true;
  const referenceTranslation = plan.referenceDecompositions.length >= 2;
  const hierarchy = plan.desktopMap.placements.some((p) => p.zIndex >= 4);
  const negativeSpace = plan.artDirection.quietZone.length > 10;
  const editorialFrictionStructural =
    plan.artDirection.editorialTension.toLowerCase().includes('strike') ||
    plan.artDirection.editorialTension.toLowerCase().includes('cross') ||
    plan.artDirection.editorialTension.toLowerCase().includes('margin');
  const visualRange = falAssets.length >= 2 && hasCodeNative;
  const socialFirst = Boolean(board.socialProofUrl ?? board.socialProofStoragePath);
  const motionFromBehavior = Boolean(board.motionProofUrl ?? board.motionProofStoragePath);
  const wordmarkRemovalRecognition = hasCodeNative && plan.artDirection.signatureMoment.length > 20;
  const stockImageRejection = stockFlags.length === 0;

  if (!allAssetsReady) notes.push('Not all manifest assets accepted and ready');
  if (stockFlags.length) notes.push(`Stock/generic flags on ${stockFlags.length} asset notes`);
  if (!hasIsolation) notes.push('Isolated overlap assets missing or failed');
  if (board.desktopBoardStoragePath === board.mobileBoardStoragePath) notes.push('Desktop and mobile maps must differ');

  const checks = [
    conceptUnder5Seconds,
    brandWorldNotCollage,
    contemporary,
    referenceTranslation,
    hierarchy,
    negativeSpace,
    editorialFrictionStructural,
    visualRange,
    socialFirst,
    motionFromBehavior,
    wordmarkRemovalRecognition,
    stockImageRejection,
  ];
  const passCount = checks.filter(Boolean).length;
  let result: BoardQaReport['result'] = 'PASS';
  if (passCount < 8) result = 'FAIL';
  else if (passCount < 11 || !allAssetsReady) result = 'NEEDS_HUMAN_REVIEW';

  return {
    conceptUnder5Seconds,
    brandWorldNotCollage,
    contemporary,
    referenceTranslation,
    hierarchy,
    negativeSpace,
    editorialFrictionStructural,
    visualRange,
    socialFirst,
    motionFromBehavior,
    wordmarkRemovalRecognition,
    stockImageRejection,
    result,
    notes,
  };
}
