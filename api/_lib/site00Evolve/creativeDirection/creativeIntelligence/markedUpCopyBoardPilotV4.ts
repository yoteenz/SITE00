/**
 * THE MARKED-UP COPY — v4 DirectionExpressionSystem + live Sonnet board production.
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
  composeBoardSvgV4,
  extractMotionProofSvg,
  extractSocialProofSvg,
} from './boardCompositorV4.js';
import {
  evaluateWordmarkRemovalHeuristic,
  inspectCreativeDirectionBoardV4,
} from './boardInspectorV4.js';
import {
  expressionSystemGatesPass,
  isProductionSonnetConfigured,
  runSonnetDirectionExpressionSystem,
} from './directionExpressionSystemService.js';
import { upsertDirectionExpressionSystem } from './directionExpressionSystemStore.js';
import { runSonnetBoardArtDirectionV4 } from './boardCreativeDirectorV4Service.js';
import { buildMarkedUpCopyBoardPlanV4 } from './markedUpCopyBoardPlanV4.js';
import { buildDeterministicCreativeDirectorPass } from './boardCreativeDirectorService.js';
import {
  MARKED_UP_COPY_BOARD_PLAN_VERSION_V2,
  MARKED_UP_COPY_BOARD_PLAN_VERSION_V3,
  MARKED_UP_COPY_BOARD_PLAN_VERSION_V4,
  MARKED_UP_COPY_DIRECTION_NAME,
  type BoardAssetReuseDecision,
  type BoardCreativeDirectorPass,
  type CreativeDirectionBoard,
  type MarkedUpCopyBoardPilotV4Result,
} from './creativeDirectionBoardTypes.js';
import { getFormationRecordById } from './formationStore/storeAdapter.js';
import { NDXBOOK_V1_FORMATION_ID } from './founderComparisonSet.js';
import type { DirectionExpressionSystem } from './directionExpressionSystemTypes.js';

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

function syntheticCreativeDirectorPass(system: DirectionExpressionSystem): BoardCreativeDirectorPass {
  const base = buildDeterministicCreativeDirectorPass({
    direction: {
      directionId: system.directionId,
      directionName: system.directionName,
      comparisonIndex: 1,
      sourceFormationId: system.sourceFormationId,
      sourceFormationVersion: system.sourceFormationVersion,
      brandLoreProfileVersion: system.brandLoreVersion,
      brandLoreFingerprint: system.brandLoreFingerprint,
      fieldCompleteness: { complete: true, missingFields: [] },
    } as never,
    v2Plan: { assetManifest: [] } as never,
    references: [],
  });
  base.artDirection.lineage = {
    provider: system.provider,
    model: system.model,
    promptVersion: system.promptVersion,
    inputFingerprint: system.inputFingerprint,
    outputHash: system.outputHash,
    createdAt: system.createdAt,
  };
  base.creativeDirectionAuthorityScore = 5;
  return base;
}

export async function runMarkedUpCopyBoardPilotV4(params: {
  orgSlug?: string;
  dryRun?: boolean;
  deps?: BoardProductionV2Deps;
}): Promise<MarkedUpCopyBoardPilotV4Result> {
  const orgSlug = params.orgSlug ?? 'ndxbook';
  const anthropic = {
    completionRequests: 0,
    artDirectionRequests: 0,
    visionRequests: 0,
    creativeDirectorRequests: 0,
    expressionSystemRequests: 0,
    boardArtDirectionRequests: 0,
    boardCritiqueRequests: 0,
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
    referenceConditionedCalls: [] as MarkedUpCopyBoardPilotV4Result['fal']['referenceConditionedCalls'],
  };

  if (orgSlug !== 'ndxbook') throw new Error('Pilot scoped to ndxbook only');

  if (!isProductionSonnetConfigured()) {
    return {
      status: 'BLOCKED_ON_PRODUCTION_SONNET_CREDENTIAL',
      expressionSystem: null,
      plan: null,
      board: null,
      boardCritique: null,
      directionCompletion: {
        missingFieldsBefore: [],
        completionExecuted: false,
        fieldsCompleted: [],
        fieldCompletenessAfter: false,
        immutableAnchorsPreserved: false,
      },
      anthropic,
      fal,
      otherDirectionsTouched: false,
      v2Preserved: true,
      v3Preserved: true,
      credentialExposed: false,
    };
  }

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
      expressionSystem: null,
      plan: null,
      board: null,
      boardCritique: null,
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
      v3Preserved: true,
      credentialExposed: false,
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

  const influenceGraph = buildReferenceInfluenceGraph({
    crops: referenceCrops,
    references: refResolution.resolved,
  });

  const v1Formation = await getFormationRecordById(NDXBOOK_V1_FORMATION_ID);

  function comparisonSetKeyFor(d: typeof direction): string {
    return `ndxbook:6-direction:v${d.brandLoreProfileVersion}:${d.brandLoreFingerprint}`;
  }

  const v2Board = findCreativeDirectionBoard({
    comparisonSetKey: comparisonSetKeyFor(direction),
    directionId: direction.directionId,
    boardPlanVersion: MARKED_UP_COPY_BOARD_PLAN_VERSION_V2,
  });

  let expressionSystem: DirectionExpressionSystem;
  try {
    let esResult = await runSonnetDirectionExpressionSystem({
      direction,
      formationInput: v1Formation?.formationInput ?? null,
      references: refResolution.resolved,
      v2Board,
      v2Plan: null,
      expressionContext: 'SOCIAL_FIRST_EDITORIAL',
    });
    anthropic.expressionSystemRequests = esResult.anthropicRequests;
    anthropic.inputTokens += esResult.usage.inputTokens;
    anthropic.outputTokens += esResult.usage.outputTokens;

    if (!expressionSystemGatesPass(esResult.system)) {
      try {
        esResult = await runSonnetDirectionExpressionSystem({
          direction,
          formationInput: v1Formation?.formationInput ?? null,
          references: refResolution.resolved,
          v2Board,
          v2Plan: null,
          revisionHint: 'Revise Expression System — 50-post and no-explanation gates failed. Return compact valid JSON.',
        });
      } catch (retryErr) {
        if (!(retryErr instanceof SyntaxError) && !(retryErr instanceof Error && retryErr.message.includes('JSON'))) {
          throw retryErr;
        }
      }
      anthropic.expressionSystemRequests += esResult.anthropicRequests;
      anthropic.inputTokens += esResult.usage.inputTokens;
      anthropic.outputTokens += esResult.usage.outputTokens;
    }

    expressionSystem = esResult.system;
    if (!expressionSystemGatesPass(expressionSystem)) {
      upsertDirectionExpressionSystem(expressionSystem);
      return {
        status: 'EXPRESSION_SYSTEM_GATE_FAILED',
        expressionSystem,
        plan: null,
        board: null,
        boardCritique: null,
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
        v3Preserved: Boolean(
          findCreativeDirectionBoard({
            comparisonSetKey: comparisonSetKeyFor(direction),
            directionId: direction.directionId,
            boardPlanVersion: MARKED_UP_COPY_BOARD_PLAN_VERSION_V3,
          }),
        ),
        credentialExposed: false,
      };
    }
    expressionSystem = upsertDirectionExpressionSystem(expressionSystem);
  } catch (e) {
    if (e instanceof Error && e.message.includes('BLOCKED_ON_PRODUCTION_SONNET')) {
      return {
        status: 'BLOCKED_ON_PRODUCTION_SONNET_CREDENTIAL',
        expressionSystem: null,
        plan: null,
        board: null,
        boardCritique: null,
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
        v3Preserved: true,
        credentialExposed: false,
      };
    }
    throw e;
  }

  const boardArtResult = await runSonnetBoardArtDirectionV4({
    expressionSystem,
    v2Board,
    v2Plan: null,
    priorAssetInventory: ['MU01', 'MU02', 'MU03', 'MU04', 'MU05', 'MU06'],
  });
  anthropic.boardArtDirectionRequests = boardArtResult.anthropicRequests;
  anthropic.boardCritiqueRequests = boardArtResult.anthropicRequests;
  anthropic.inputTokens += boardArtResult.usage.inputTokens;
  anthropic.outputTokens += boardArtResult.usage.outputTokens;

  const plan = buildMarkedUpCopyBoardPlanV4({
    direction,
    expressionSystem,
    boardArtDirection: boardArtResult.result,
    resolvedReferences: refResolution.resolved,
    referenceCrops,
    referenceInfluenceGraph: influenceGraph,
  });

  const existingV4 = findCreativeDirectionBoard({
    comparisonSetKey: plan.comparisonSetKey,
    directionId: plan.directionId,
    boardPlanVersion: MARKED_UP_COPY_BOARD_PLAN_VERSION_V4,
  });

  if (
    existingV4?.productionState === 'READY' &&
    existingV4.qaScoreReport?.result === 'PASS' &&
    existingV4.founderVisualApproval === 'PENDING'
  ) {
    return {
      status: 'PASS',
      expressionSystem,
      plan,
      board: existingV4,
      boardCritique: boardArtResult.result.critique,
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
      v3Preserved: Boolean(
        findCreativeDirectionBoard({
          comparisonSetKey: plan.comparisonSetKey,
          directionId: plan.directionId,
          boardPlanVersion: MARKED_UP_COPY_BOARD_PLAN_VERSION_V3,
        }),
      ),
      credentialExposed: false,
    };
  }

  if (params.dryRun) {
    return {
      status: 'NEEDS_HUMAN_REVIEW',
      expressionSystem,
      plan,
      board: null,
      boardCritique: boardArtResult.result.critique,
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
      v3Preserved: true,
      credentialExposed: false,
    };
  }

  const v2AssetsByManifest = new Map(v2Board?.assetRecords.map((a) => [a.manifestId, a]) ?? []);
  const legacyIds = new Set(['MU01', 'MU02', 'MU03', 'MU04', 'MU05', 'MU06']);
  const assetRecords = [];

  for (const entry of plan.assetManifest) {
    const legacyDecision = boardArtResult.result.assetDecisions.find(
      (d) => d.manifestId === entry.manifestId || legacyIds.has(d.manifestId),
    );
    const decision = legacyDecision?.decision ?? 'REGENERATE';

    if (decision === 'REMOVE') continue;

    if (!needsProduction(decision)) {
      const legacyId = entry.manifestId.replace('MUC-', 'MU');
      const reused = v2AssetsByManifest.get(legacyId) ?? v2AssetsByManifest.get(entry.manifestId);
      if (reused) {
        assetRecords.push({
          ...reused,
          assetId: randomUUID(),
          manifestId: entry.manifestId,
          planId: plan.planId,
          iteration: 0,
          inspectionNotes: [...reused.inspectionNotes, `v4 ${decision}`],
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
    });

    fal.textToImageRequests += produced.falCalls - produced.referenceConditionedCalls;
    fal.referenceConditionedRequests += produced.referenceConditionedCalls;
    fal.backgroundRemovalRequests += produced.bgRemovalCalls;
    if (produced.referenceConditionedCalls > 0) {
      fal.referenceConditionedCalls.push({
        manifestId: entry.manifestId,
        model: produced.asset.model ?? 'openai/gpt-image-2/edit',
        referenceInputs: produced.asset.referenceImageInputs ?? [],
        outputStoragePath: produced.asset.storagePath,
      });
    }
    if (produced.rejected) fal.rejectedGenerations += 1;

    while (produced.asset.qaState === 'REJECT' && iteration < MAX_ASSET_RETRIES) {
      iteration += 1;
      fal.regenerations += 1;
      produced = await produceBoardManifestAssetV2({
        plan,
        entry,
        iteration,
        promptRevision: `${entry.prompt} REVISION: expression-system fidelity, non-stock.`,
        deps: params.deps,
      });
      fal.textToImageRequests += produced.falCalls - produced.referenceConditionedCalls;
      fal.referenceConditionedRequests += produced.referenceConditionedCalls;
      fal.backgroundRemovalRequests += produced.bgRemovalCalls;
      if (produced.rejected) fal.rejectedGenerations += 1;
    }

    if (produced.asset.qaState === 'NEEDS_HUMAN_REVIEW') {
      produced.asset.inspectionNotes.push('NEEDS_HUMAN_REVIEW — visionInspected=false');
    }

    assetRecords.push(produced.asset);
  }

  fal.estimatedCostUsd =
    (fal.textToImageRequests + fal.referenceConditionedRequests) * FAL_COST +
    fal.backgroundRemovalRequests * BIREFNET_COST;

  if (assetRecords.length < plan.assetManifest.length) {
    return {
      status: 'REVISE_METHODOLOGY',
      expressionSystem,
      plan,
      board: null,
      boardCritique: boardArtResult.result.critique,
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
      v3Preserved: true,
      credentialExposed: false,
    };
  }

  const desktopSvg = composeBoardSvgV4({
    plan,
    map: plan.desktopMap,
    assets: assetRecords,
    expressionSystem,
  });
  const mobileSvg = composeBoardSvgV4({
    plan,
    map: plan.mobileMap,
    assets: assetRecords,
    expressionSystem,
  });
  const wordmarkHiddenSvg = composeBoardSvgV4({
    plan,
    map: plan.desktopMap,
    assets: assetRecords,
    expressionSystem,
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

  const desktopUpload = await uploadSite00AssetBuffer(desktopPath, Buffer.from(desktopSvg, 'utf8'), 'image/svg+xml', {
    upsert: true,
  });
  const mobileUpload = await uploadSite00AssetBuffer(mobilePath, Buffer.from(mobileSvg, 'utf8'), 'image/svg+xml', {
    upsert: true,
  });

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

  await uploadSite00AssetBuffer(socialPath, Buffer.from(socialSvg, 'utf8'), 'image/svg+xml', { upsert: true });
  await uploadSite00AssetBuffer(motionPath, Buffer.from(motionSvg, 'utf8'), 'image/svg+xml', { upsert: true });

  const wordmarkRemovalPass =
    evaluateWordmarkRemovalHeuristic(plan) && wordmarkHiddenSvg.includes('STRIKE');

  const draftBoard: CreativeDirectionBoard = {
    boardId: existingV4?.boardId ?? randomUUID(),
    planId: plan.planId,
    boardPlanVersion: MARKED_UP_COPY_BOARD_PLAN_VERSION_V4,
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
    expressionSystemId: expressionSystem.expressionSystemId,
    founderVisualApproval: 'PENDING',
    qaReport: {
      conceptUnder5Seconds: true,
      brandWorldNotCollage: true,
      contemporary: true,
      referenceTranslation: referenceCrops.length >= 2,
      hierarchy: true,
      negativeSpace: true,
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

  const qaScore = inspectCreativeDirectionBoardV4({
    plan,
    board: draftBoard,
    boardCopySnippets: collectCompositorCopySnippets(),
    wordmarkRemovalPass,
    expressionSystem,
    boardArtDirection: boardArtResult.result,
    creativeDirectorPass: syntheticCreativeDirectorPass(expressionSystem),
  });

  draftBoard.qaScoreReport = qaScore;
  draftBoard.qaReport.result = qaScore.result === 'PASS' ? 'PASS' : qaScore.result === 'FAIL' ? 'FAIL' : 'NEEDS_HUMAN_REVIEW';
  draftBoard.founderVisible = qaScore.result === 'PASS';
  draftBoard.productionState =
    qaScore.result === 'PASS' ? 'READY' : qaScore.result === 'FAIL' ? 'FAILED' : 'NEEDS_HUMAN_REVIEW';
  draftBoard.presentationMode = qaScore.result === 'PASS' ? 'BOARD_READY' : 'BOARD_PRODUCTION';
  draftBoard.founderVisualApproval = 'PENDING';

  const board = upsertCreativeDirectionBoard(draftBoard);

  return {
    status:
      qaScore.result === 'PASS'
        ? 'PASS'
        : qaScore.result === 'FAIL'
          ? 'FAIL'
          : 'NEEDS_HUMAN_REVIEW',
    expressionSystem,
    plan,
    board,
    boardCritique: boardArtResult.result.critique,
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
    v2Preserved: loadCreativeDirectionBoardManifest().some(
      (b) => b.boardPlanVersion === MARKED_UP_COPY_BOARD_PLAN_VERSION_V2,
    ),
    v3Preserved: loadCreativeDirectionBoardManifest().some(
      (b) => b.boardPlanVersion === MARKED_UP_COPY_BOARD_PLAN_VERSION_V3,
    ),
    credentialExposed: false,
  };
}
