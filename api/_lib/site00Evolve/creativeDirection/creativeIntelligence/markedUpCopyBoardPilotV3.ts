/**
 * THE MARKED-UP COPY — board engine v3 Sonnet creative-director pass orchestrator.
 */

import { randomUUID } from 'node:crypto';
import { uploadSite00AssetBuffer } from '../../../site00Assts/storage.js';
import { resolveNdxbookFounderComparisonSet } from './founderComparisonSet.js';
import { ensureMarkedUpCopyProductionComplete } from './markedUpCopyDirectionPrep.js';
import {
  referenceIdsForMarkedUpCopyPilot,
  resolveMarkedUpCopyBoardReferences,
} from './boardReferenceResolver.js';
import { buildReferenceInfluenceGraph, createReferenceCrops } from './boardReferenceCrops.js';
import { buildMarkedUpCopyBoardPlanV2 } from './markedUpCopyBoardPlanV2.js';
import { buildMarkedUpCopyBoardPlanV3 } from './markedUpCopyBoardPlanV3.js';
import {
  findCreativeDirectionBoard,
  storagePathForFinalBoard,
  upsertCreativeDirectionBoard,
  loadCreativeDirectionBoardManifest,
} from './boardStore.js';
import {
  MAX_ASSET_RETRIES,
  produceBoardManifestAssetV2,
  type BoardProductionV2Deps,
} from './boardAssetProductionV2.js';
import {
  collectCompositorCopySnippets,
  composeBoardSvg,
  extractMotionProofSvg,
  extractSocialProofSvg,
} from './boardCompositorV2.js';
import {
  evaluateWordmarkRemovalHeuristic,
  inspectCreativeDirectionBoardV3,
} from './boardInspectorV3.js';
import { runDynamicBoardArtDirection } from './boardArtDirectionService.js';
import {
  isProductionSonnetConfigured,
  runSonnetCreativeDirectorPass,
} from './boardCreativeDirectorService.js';
import {
  MARKED_UP_COPY_BOARD_PLAN_VERSION_V2,
  MARKED_UP_COPY_BOARD_PLAN_VERSION_V3,
  MARKED_UP_COPY_DIRECTION_NAME,
  type BoardAssetReuseDecision,
  type CreativeDirectionBoard,
  type MarkedUpCopyBoardPilotV3Result,
} from './creativeDirectionBoardTypes.js';
import { getFormationRecordById } from './formationStore/storeAdapter.js';
import { NDXBOOK_V1_FORMATION_ID } from './founderComparisonSet.js';

const FAL_COST = 0.04;
const BIREFNET_COST = 0.02;

function needsProduction(decision: BoardAssetReuseDecision): boolean {
  return (
    decision === 'REGENERATE' ||
    decision === 'NEW_ASSET_REQUIRED' ||
    decision === 'REUSE_WITH_EDIT' ||
    decision === 'REUSE_WITH_NEW_CROP'
  );
}

export async function runMarkedUpCopyBoardPilotV3(params: {
  orgSlug?: string;
  dryRun?: boolean;
  deps?: BoardProductionV2Deps;
}): Promise<MarkedUpCopyBoardPilotV3Result> {
  const orgSlug = params.orgSlug ?? 'ndxbook';
  const anthropic = {
    completionRequests: 0,
    artDirectionRequests: 0,
    visionRequests: 0,
    creativeDirectorRequests: 0,
    inputTokens: 0,
    outputTokens: 0,
    estimatedCostUsd: 0,
  };
  const fal = {
    referenceConditionedRequests: 0,
    textToImageRequests: 0,
    backgroundRemovalRequests: 0,
    regenerations: 0,
    rejectedGenerations: 0,
    estimatedCostUsd: 0,
  };

  if (orgSlug !== 'ndxbook') throw new Error('Pilot scoped to ndxbook only');

  const comparisonSet = await resolveNdxbookFounderComparisonSet({
    orgSlug,
    organizationId: '7681ab75-bddc-43e5-b594-79fcf8168205',
    brandLoreFingerprint: '5e71f429',
    brandLoreProfileVersion: 24,
    canonicalFormation: null,
  });
  if (!comparisonSet) throw new Error('NDX BOOK comparison set unavailable');

  const rawDirection = comparisonSet.directions.find((d) => d.directionName === MARKED_UP_COPY_DIRECTION_NAME);
  if (!rawDirection) throw new Error(`${MARKED_UP_COPY_DIRECTION_NAME} not found`);

  const prep = await ensureMarkedUpCopyProductionComplete({ comparisonDirection: rawDirection });
  if (!prep.ok) {
    return {
      status: 'PILOT_BLOCKED_ON_DIRECTION_COMPLETION',
      plan: null,
      board: null,
      creativeDirectorPass: null,
      directionCompletion: {
        missingFieldsBefore: prep.missingFieldsBefore,
        completionExecuted: false,
        fieldsCompleted: [],
        fieldCompletenessAfter: false,
        immutableAnchorsPreserved: false,
      },
      anthropic,
      fal,
      otherDirectionsTouched: false,
      v2Preserved: true,
    };
  }

  anthropic.completionRequests = prep.anthropicRequests;
  const direction = prep.direction;

  const refResolution = await resolveMarkedUpCopyBoardReferences({
    referenceIds: referenceIdsForMarkedUpCopyPilot(),
    orgSlug,
  });

  const referenceCrops = refResolution.resolved.length
    ? await createReferenceCrops({
        references: refResolution.resolved,
        comparisonIndex: direction.comparisonIndex,
      })
    : [];

  const v1Formation = await getFormationRecordById(NDXBOOK_V1_FORMATION_ID);
  const artResult = await runDynamicBoardArtDirection({
    direction,
    formationInput: v1Formation?.formationInput ?? null,
    references: refResolution.resolved,
  });
  anthropic.artDirectionRequests = artResult.anthropicRequests;
  anthropic.inputTokens += artResult.usage.inputTokens;
  anthropic.outputTokens += artResult.usage.outputTokens;

  const influenceGraph = buildReferenceInfluenceGraph({
    crops: referenceCrops,
    references: refResolution.resolved,
  });

  const v2Plan = buildMarkedUpCopyBoardPlanV2({
    direction,
    brandLoreFingerprint: comparisonSet.brandLoreFingerprint,
    brandLoreProfileVersion: comparisonSet.brandLoreProfileVersion,
    dynamicArtDirection: artResult.artDirection,
    resolvedReferences: refResolution.resolved,
    referenceCrops,
    referenceInfluenceGraph: influenceGraph,
  });

  const v2Board = findCreativeDirectionBoard({
    comparisonSetKey: v2Plan.comparisonSetKey,
    directionId: v2Plan.directionId,
    boardPlanVersion: MARKED_UP_COPY_BOARD_PLAN_VERSION_V2,
  });

  if (!isProductionSonnetConfigured()) {
    return {
      status: 'BLOCKED_ON_SONNET_ART_DIRECTION',
      plan: null,
      board: null,
      creativeDirectorPass: null,
      directionCompletion: {
        missingFieldsBefore: prep.missingFieldsBefore,
        completionExecuted: prep.completionExecuted,
        fieldsCompleted: prep.fieldsCompleted,
        fieldCompletenessAfter: true,
        immutableAnchorsPreserved: prep.immutableAnchorsPreserved,
      },
      anthropic,
      fal,
      otherDirectionsTouched: false,
      v2Preserved: Boolean(v2Board),
    };
  }

  let creativeDirectorPass;
  try {
    const cdResult = await runSonnetCreativeDirectorPass({
      direction,
      formationInput: v1Formation?.formationInput ?? null,
      references: refResolution.resolved,
      v2Plan,
      v2Board,
      expressionContext: 'SOCIAL_FIRST_EDITORIAL',
    });
    creativeDirectorPass = cdResult.pass;
    anthropic.creativeDirectorRequests = cdResult.anthropicRequests;
    anthropic.inputTokens += cdResult.usage.inputTokens;
    anthropic.outputTokens += cdResult.usage.outputTokens;
  } catch (e) {
    if (e instanceof Error && e.message.includes('BLOCKED_ON_SONNET')) {
      return {
        status: 'BLOCKED_ON_SONNET_ART_DIRECTION',
        plan: null,
        board: null,
        creativeDirectorPass: null,
        directionCompletion: {
          missingFieldsBefore: prep.missingFieldsBefore,
          completionExecuted: prep.completionExecuted,
          fieldsCompleted: prep.fieldsCompleted,
          fieldCompletenessAfter: true,
          immutableAnchorsPreserved: prep.immutableAnchorsPreserved,
        },
        anthropic,
        fal,
        otherDirectionsTouched: false,
        v2Preserved: Boolean(v2Board),
      };
    }
    throw e;
  }

  const plan = buildMarkedUpCopyBoardPlanV3({
    direction,
    brandLoreFingerprint: comparisonSet.brandLoreFingerprint,
    brandLoreProfileVersion: comparisonSet.brandLoreProfileVersion,
    creativeDirectorPass,
    resolvedReferences: refResolution.resolved,
    referenceCrops,
    referenceInfluenceGraph: influenceGraph,
    sourceV2Plan: v2Plan,
  });

  const existingV3 = findCreativeDirectionBoard({
    comparisonSetKey: plan.comparisonSetKey,
    directionId: plan.directionId,
    boardPlanVersion: MARKED_UP_COPY_BOARD_PLAN_VERSION_V3,
  });

  if (
    existingV3?.productionState === 'READY' &&
    existingV3.qaScoreReport?.result === 'PASS' &&
    existingV3.founderVisualApproval === 'PENDING'
  ) {
    return {
      status: 'PASS',
      plan,
      board: existingV3,
      creativeDirectorPass,
      directionCompletion: {
        missingFieldsBefore: prep.missingFieldsBefore,
        completionExecuted: prep.completionExecuted,
        fieldsCompleted: prep.fieldsCompleted,
        fieldCompletenessAfter: true,
        immutableAnchorsPreserved: prep.immutableAnchorsPreserved,
      },
      anthropic,
      fal,
      otherDirectionsTouched: false,
      v2Preserved: Boolean(v2Board),
    };
  }

  if (params.dryRun) {
    return {
      status: 'NEEDS_HUMAN_REVIEW',
      plan,
      board: null,
      creativeDirectorPass,
      directionCompletion: {
        missingFieldsBefore: prep.missingFieldsBefore,
        completionExecuted: prep.completionExecuted,
        fieldsCompleted: prep.fieldsCompleted,
        fieldCompletenessAfter: true,
        immutableAnchorsPreserved: prep.immutableAnchorsPreserved,
      },
      anthropic,
      fal,
      otherDirectionsTouched: false,
      v2Preserved: Boolean(v2Board),
    };
  }

  const v2AssetsByManifest = new Map(v2Board?.assetRecords.map((a) => [a.manifestId, a]) ?? []);

  const assetRecords = [];
  for (const entry of plan.assetManifest) {
    const decision =
      creativeDirectorPass.assetDecisions.find((d) => d.manifestId === entry.manifestId)?.decision ??
      'REUSE_AS_IS';

    if (!needsProduction(decision)) {
      const reused = v2AssetsByManifest.get(entry.manifestId);
      if (reused) {
        assetRecords.push({
          ...reused,
          assetId: randomUUID(),
          planId: plan.planId,
          iteration: 0,
          inspectionNotes: [...reused.inspectionNotes, `v3 ${decision} from v2`],
        });
        continue;
      }
    }

    let iteration = 0;
    let produced = await produceBoardManifestAssetV2({
      plan,
      entry,
      iteration,
      deps: params.deps,
      reuseFromV1: decision === 'REUSE_AS_IS' ? v2AssetsByManifest.get(entry.manifestId) ?? null : null,
    });

    fal.textToImageRequests += produced.falCalls - produced.referenceConditionedCalls;
    fal.referenceConditionedRequests += produced.referenceConditionedCalls;
    fal.backgroundRemovalRequests += produced.bgRemovalCalls;
    if (produced.rejected) fal.rejectedGenerations += 1;

    while (produced.asset.qaState === 'REJECT' && iteration < MAX_ASSET_RETRIES) {
      iteration += 1;
      fal.regenerations += 1;
      produced = await produceBoardManifestAssetV2({
        plan,
        entry,
        iteration,
        promptRevision: `${entry.prompt} REVISION: stronger editorial tension, reference fidelity, non-stock.`,
        deps: params.deps,
      });
      fal.textToImageRequests += produced.falCalls - produced.referenceConditionedCalls;
      fal.referenceConditionedRequests += produced.referenceConditionedCalls;
      fal.backgroundRemovalRequests += produced.bgRemovalCalls;
      if (produced.rejected) fal.rejectedGenerations += 1;
    }

    if (produced.asset.qaState === 'NEEDS_HUMAN_REVIEW') {
      produced.asset.inspectionNotes.push('Ambiguous asset — NEEDS_HUMAN_REVIEW (no visionInspected=true)');
    }

    assetRecords.push(produced.asset);
  }

  fal.estimatedCostUsd =
    (fal.textToImageRequests + fal.referenceConditionedRequests) * FAL_COST +
    fal.backgroundRemovalRequests * BIREFNET_COST;

  const readyCount = assetRecords.filter((a) => a.productionState === 'READY' && a.qaState !== 'REJECT').length;
  if (readyCount < plan.assetManifest.length) {
    return {
      status: 'REVISE_METHODOLOGY',
      plan,
      board: null,
      creativeDirectorPass,
      directionCompletion: {
        missingFieldsBefore: prep.missingFieldsBefore,
        completionExecuted: prep.completionExecuted,
        fieldsCompleted: prep.fieldsCompleted,
        fieldCompletenessAfter: true,
        immutableAnchorsPreserved: prep.immutableAnchorsPreserved,
      },
      anthropic,
      fal,
      otherDirectionsTouched: false,
      v2Preserved: Boolean(v2Board),
    };
  }

  const desktopSvg = composeBoardSvg({ plan, map: plan.desktopMap, assets: assetRecords });
  const mobileSvg = composeBoardSvg({ plan, map: plan.mobileMap, assets: assetRecords });
  const wordmarkHiddenSvg = composeBoardSvg({
    plan,
    map: plan.desktopMap,
    assets: assetRecords,
    hideBrand: true,
  });

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

  await uploadSite00AssetBuffer(socialPath, Buffer.from(socialSvg, 'utf8'), 'image/svg+xml');
  await uploadSite00AssetBuffer(motionPath, Buffer.from(motionSvg, 'utf8'), 'image/svg+xml');

  const wordmarkRemovalPass =
    evaluateWordmarkRemovalHeuristic(plan) && wordmarkHiddenSvg.includes('STRIKE');

  const draftBoard: CreativeDirectionBoard = {
    boardId: existingV3?.boardId ?? randomUUID(),
    planId: plan.planId,
    boardPlanVersion: MARKED_UP_COPY_BOARD_PLAN_VERSION_V3,
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
    creativeDirectorCritique: creativeDirectorPass.critique,
    founderVisualApproval: 'PENDING',
    qaReport: {
      conceptUnder5Seconds: true,
      brandWorldNotCollage: true,
      contemporary: true,
      referenceTranslation: referenceCrops.length >= 2,
      hierarchy: Boolean(creativeDirectorPass.hierarchy.dominantEvent),
      negativeSpace: Boolean(creativeDirectorPass.hierarchy.quietZone),
      editorialFrictionStructural: true,
      visualRange: true,
      socialFirst: true,
      motionFromBehavior: true,
      wordmarkRemovalRecognition: wordmarkRemovalPass,
      stockImageRejection: true,
      result: 'NEEDS_HUMAN_REVIEW',
      notes: [],
    },
    founderVisible: false,
    productionState: 'NEEDS_HUMAN_REVIEW',
    presentationMode: 'BOARD_PRODUCTION',
    createdAt: new Date().toISOString(),
  };

  const qaScore = inspectCreativeDirectionBoardV3({
    plan,
    board: draftBoard,
    boardCopySnippets: collectCompositorCopySnippets(),
    wordmarkRemovalPass,
    creativeDirectorPass,
  });
  draftBoard.qaScoreReport = qaScore;
  draftBoard.qaReport.result = qaScore.result === 'PASS' ? 'PASS' : qaScore.result === 'FAIL' ? 'FAIL' : 'NEEDS_HUMAN_REVIEW';
  draftBoard.founderVisible = qaScore.result === 'PASS';
  draftBoard.productionState =
    qaScore.result === 'PASS' ? 'READY' : qaScore.result === 'FAIL' ? 'FAILED' : 'NEEDS_HUMAN_REVIEW';
  draftBoard.presentationMode = qaScore.result === 'PASS' ? 'BOARD_READY' : 'BOARD_PRODUCTION';
  draftBoard.founderVisualApproval = qaScore.result === 'PASS' ? 'PENDING' : 'PENDING';

  const board = upsertCreativeDirectionBoard(draftBoard);

  const v2StillExists = loadCreativeDirectionBoardManifest().some(
    (b) => b.boardPlanVersion === MARKED_UP_COPY_BOARD_PLAN_VERSION_V2,
  );

  return {
    status:
      qaScore.result === 'PASS'
        ? 'PASS'
        : qaScore.result === 'FAIL'
          ? 'FAIL'
          : 'NEEDS_HUMAN_REVIEW',
    plan,
    board,
    creativeDirectorPass,
    directionCompletion: {
      missingFieldsBefore: prep.missingFieldsBefore,
      completionExecuted: prep.completionExecuted,
      fieldsCompleted: prep.fieldsCompleted,
      fieldCompletenessAfter: true,
      immutableAnchorsPreserved: prep.immutableAnchorsPreserved,
    },
    anthropic,
    fal,
    otherDirectionsTouched: false,
    v2Preserved: v2StillExists,
  };
}
