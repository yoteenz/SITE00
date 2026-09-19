/**
 * THE MARKED-UP COPY — single-board production pilot orchestrator.
 * Does NOT touch directions 02–06.
 */

import { randomUUID } from 'node:crypto';
import { uploadSite00AssetBuffer } from '../../../site00Assts/storage.js';
import { resolveNdxbookFounderComparisonSet } from './founderComparisonSet.js';
import {
  MARKED_UP_COPY_BOARD_PLAN_VERSION,
  MARKED_UP_COPY_DIRECTION_NAME,
  type CreativeDirectionBoard,
  type MarkedUpCopyBoardPilotResult,
} from './creativeDirectionBoardTypes.js';
import { buildMarkedUpCopyBoardPlan, boardJobKey } from './markedUpCopyBoardPlan.js';
import {
  findCreativeDirectionBoard,
  storagePathForFinalBoard,
  upsertCreativeDirectionBoard,
} from './boardStore.js';
import { produceBoardManifestAsset, MAX_RETRIES, type BoardProductionDeps } from './boardAssetProduction.js';
import { composeBoardSvg, extractMotionProofSvg, extractSocialProofSvg } from './boardCompositor.js';
import { inspectCreativeDirectionBoard } from './boardInspector.js';

const FAL_COST = 0.04;
const BIREFNET_COST = 0.02;

export async function runMarkedUpCopyBoardPilot(params: {
  orgSlug?: string;
  dryRun?: boolean;
  deps?: BoardProductionDeps;
}): Promise<MarkedUpCopyBoardPilotResult> {
  const orgSlug = params.orgSlug ?? 'ndxbook';
  if (orgSlug !== 'ndxbook') throw new Error('Pilot scoped to ndxbook only');

  const comparisonSet = await resolveNdxbookFounderComparisonSet({
    orgSlug,
    organizationId: '7681ab75-bddc-43e5-b594-79fcf8168205',
    brandLoreFingerprint: '5e71f429',
    brandLoreProfileVersion: 24,
    canonicalFormation: null,
  });

  if (!comparisonSet) throw new Error('NDX BOOK comparison set unavailable');

  const direction = comparisonSet.directions.find((d) => d.directionName === MARKED_UP_COPY_DIRECTION_NAME);
  if (!direction) throw new Error(`${MARKED_UP_COPY_DIRECTION_NAME} not found in comparison set`);

  const plan = buildMarkedUpCopyBoardPlan({
    direction,
    brandLoreFingerprint: comparisonSet.brandLoreFingerprint,
    brandLoreProfileVersion: comparisonSet.brandLoreProfileVersion,
  });

  const existing = findCreativeDirectionBoard({
    comparisonSetKey: plan.comparisonSetKey,
    directionId: plan.directionId,
    boardPlanVersion: plan.boardPlanVersion,
  });

  if (existing?.productionState === 'READY' && existing.qaReport.result === 'PASS') {
    return {
      plan,
      board: existing,
      otherDirectionsTouched: false,
      anthropicRequestCount: 0,
      falRequestCount: 0,
      backgroundRemovalCount: 0,
      regenerations: 0,
      estimatedCostUsd: plan.costEstimate.estimatedCostUsd,
      actualCostUsd: 0,
      pilotResult: 'PASS',
      readyToScale: false,
    };
  }

  if (params.dryRun) {
    return {
      plan,
      board: null,
      otherDirectionsTouched: false,
      anthropicRequestCount: 0,
      falRequestCount: 0,
      backgroundRemovalCount: 0,
      regenerations: 0,
      estimatedCostUsd: plan.costEstimate.estimatedCostUsd,
      actualCostUsd: 0,
      pilotResult: 'NEEDS_HUMAN_REVIEW',
      readyToScale: false,
    };
  }

  let falRequestCount = 0;
  let backgroundRemovalCount = 0;
  let regenerations = 0;
  const assetRecords = [];

  for (const entry of plan.assetManifest) {
    let produced = await produceBoardManifestAsset({
      plan,
      entry,
      existing: existing?.assetRecords.find((a) => a.manifestId === entry.manifestId) ?? null,
      deps: params.deps,
    });
    falRequestCount += produced.falCalls;
    backgroundRemovalCount += produced.bgRemovalCalls;

    if (produced.asset.productionState === 'FAILED' && produced.asset.iteration < MAX_RETRIES) {
      regenerations += 1;
      produced = await produceBoardManifestAsset({
        plan,
        entry,
        iteration: produced.asset.iteration + 1,
        deps: params.deps,
      });
      falRequestCount += produced.falCalls;
      backgroundRemovalCount += produced.bgRemovalCalls;
    }

    assetRecords.push(produced.asset);
  }

  const readyAssets = assetRecords.filter((a) => a.productionState === 'READY');
  if (readyAssets.length < plan.assetManifest.length) {
    return {
      plan,
      board: null,
      otherDirectionsTouched: false,
      anthropicRequestCount: 0,
      falRequestCount,
      backgroundRemovalCount,
      regenerations,
      estimatedCostUsd: plan.costEstimate.estimatedCostUsd,
      actualCostUsd: falRequestCount * FAL_COST + backgroundRemovalCount * BIREFNET_COST,
      pilotResult: 'REVISE_METHODOLOGY',
      readyToScale: false,
    };
  }

  const desktopSvg = composeBoardSvg({ plan, map: plan.desktopMap, assets: assetRecords });
  const mobileSvg = composeBoardSvg({ plan, map: plan.mobileMap, assets: assetRecords });
  const desktopPath = storagePathForFinalBoard({
    comparisonIndex: plan.comparisonIndex,
    breakpoint: 'desktop',
    boardPlanVersion: plan.boardPlanVersion,
  });
  const mobilePath = storagePathForFinalBoard({
    comparisonIndex: plan.comparisonIndex,
    breakpoint: 'mobile',
    boardPlanVersion: plan.boardPlanVersion,
  });

  const desktopUpload = await uploadSite00AssetBuffer(desktopPath, Buffer.from(desktopSvg, 'utf8'), 'image/svg+xml');
  const mobileUpload = await uploadSite00AssetBuffer(mobilePath, Buffer.from(mobileSvg, 'utf8'), 'image/svg+xml');

  const socialSvg = extractSocialProofSvg(plan, plan.desktopMap);
  const motionSvg = extractMotionProofSvg(plan, plan.desktopMap);
  const socialPath = storagePathForFinalBoard({
    comparisonIndex: plan.comparisonIndex,
    breakpoint: 'desktop',
    boardPlanVersion: `${plan.boardPlanVersion}-social`,
  }).replace('final-desktop', 'social-proof');
  const motionPath = storagePathForFinalBoard({
    comparisonIndex: plan.comparisonIndex,
    breakpoint: 'desktop',
    boardPlanVersion: `${plan.boardPlanVersion}-motion`,
  }).replace('final-desktop', 'motion-proof');
  const socialUpload = await uploadSite00AssetBuffer(socialPath, Buffer.from(socialSvg, 'utf8'), 'image/svg+xml');
  const motionUpload = await uploadSite00AssetBuffer(motionPath, Buffer.from(motionSvg, 'utf8'), 'image/svg+xml');

  const draftBoard: CreativeDirectionBoard = {
    boardId: existing?.boardId ?? randomUUID(),
    planId: plan.planId,
    boardPlanVersion: MARKED_UP_COPY_BOARD_PLAN_VERSION,
    comparisonSetKey: plan.comparisonSetKey,
    comparisonIndex: plan.comparisonIndex,
    directionId: plan.directionId,
    directionName: plan.directionName,
    desktopBoardUrl: desktopUpload.publicUrl,
    desktopBoardStoragePath: desktopPath,
    mobileBoardUrl: mobileUpload.publicUrl,
    mobileBoardStoragePath: mobilePath,
    socialProofStoragePath: socialPath,
    motionProofStoragePath: motionPath,
    assetRecords,
    qaReport: {
      conceptUnder5Seconds: false,
      brandWorldNotCollage: false,
      contemporary: false,
      referenceTranslation: false,
      hierarchy: false,
      negativeSpace: false,
      editorialFrictionStructural: false,
      visualRange: false,
      socialFirst: false,
      motionFromBehavior: false,
      wordmarkRemovalRecognition: false,
      stockImageRejection: false,
      result: 'NEEDS_HUMAN_REVIEW',
      notes: [],
    },
    founderVisible: false,
    productionState: 'NEEDS_HUMAN_REVIEW',
    createdAt: new Date().toISOString(),
  };

  const qaReport = inspectCreativeDirectionBoard({ plan, board: draftBoard });
  draftBoard.qaReport = qaReport;
  draftBoard.founderVisible = qaReport.result === 'PASS';
  draftBoard.productionState =
    qaReport.result === 'PASS'
      ? 'READY'
      : qaReport.result === 'FAIL'
        ? 'FAILED'
        : 'NEEDS_HUMAN_REVIEW';
  if (qaReport.result === 'NEEDS_HUMAN_REVIEW') {
    draftBoard.qaReport.notes.push(
      'Automated gate passed structural checks — founder visual QA required before PASS',
    );
  }

  const board = upsertCreativeDirectionBoard(draftBoard);

  return {
    plan,
    board,
    otherDirectionsTouched: false,
    anthropicRequestCount: 0,
    falRequestCount,
    backgroundRemovalCount,
    regenerations,
    estimatedCostUsd: plan.costEstimate.estimatedCostUsd,
    actualCostUsd: falRequestCount * FAL_COST + backgroundRemovalCount * BIREFNET_COST,
    pilotResult:
      qaReport.result === 'PASS'
        ? 'PASS'
        : qaReport.result === 'FAIL'
          ? 'REVISE_METHODOLOGY'
          : 'NEEDS_HUMAN_REVIEW',
    readyToScale: false,
  };
}

export { boardJobKey };
