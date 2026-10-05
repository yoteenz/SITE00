/**
 * CreativeDirectionBoardPlan v3 — Sonnet creative-director pass composition.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { ComparisonDirectionCandidate } from './types.js';
import { comparisonSetKeyFor } from './comparisonProofStore.js';
import type {
  BoardAssetManifestEntry,
  BoardCompositionMap,
  BoardCompositionPlacement,
  BoardCreativeDirectorPass,
  BoardHierarchyPlan,
  CreativeDirectionBoardPlan,
} from './creativeDirectionBoardTypes.js';
import {
  MARKED_UP_COPY_BOARD_PLAN_VERSION_V3,
  MARKED_UP_COPY_DIRECTION_NAME,
} from './creativeDirectionBoardTypes.js';
import { MARKED_UP_COPY_REFERENCE_DECOMPOSITIONS } from './markedUpCopyPilotConstants.js';
import { buildMarkedUpCopyArtDirectionSpec } from './markedUpCopyPilotConstants.js';
import { hashPrompt } from './markedUpCopyBoardPlan.js';

const FAL_COST = 0.04;
const BIREFNET_COST = 0.02;

function placement(
  zoneId: BoardCompositionPlacement['zoneId'],
  partial: Omit<BoardCompositionPlacement, 'zoneId'>,
): BoardCompositionPlacement {
  return { zoneId, ...partial };
}

/** v3 desktop — dramatic hierarchy, quiet upper-right, dominant hero + violent artifact overlap */
export function desktopMapV3(hierarchy?: BoardHierarchyPlan): BoardCompositionMap {
  void hierarchy;
  return {
    canvasWidth: 1440,
    canvasHeight: 900,
    breakpoint: 'DESKTOP',
    placements: [
      placement('heroEditorialSpread', {
        x: 0,
        y: 0,
        width: 1020,
        height: 680,
        rotation: 0,
        zIndex: 1,
        anchor: 'top-left',
        cropMode: 'cover',
        backgroundMode: 'editorial-field',
        shadowOwner: 'NONE',
      }),
      placement('typographicInterruption', {
        x: 32,
        y: 32,
        width: 580,
        height: 320,
        rotation: -1,
        zIndex: 5,
        anchor: 'top-left',
        cropMode: 'none',
        safeArea: { top: 8, right: 8, bottom: 8, left: 8 },
        overlapTarget: 'heroEditorialSpread',
        overlapAmount: 0.12,
        backgroundMode: 'transparent',
        shadowOwner: 'NONE',
      }),
      placement('primaryRevisionArtifact', {
        x: 720,
        y: 420,
        width: 420,
        height: 480,
        rotation: -4,
        zIndex: 4,
        anchor: 'center',
        cropMode: 'contain',
        overlapTarget: 'heroEditorialSpread',
        overlapAmount: 0.28,
        backgroundMode: 'transparent',
        shadowOwner: 'COMPOSITE_SHADOW',
      }),
      placement('supportingPhotography', {
        x: 980,
        y: 120,
        width: 320,
        height: 220,
        rotation: 2,
        zIndex: 2,
        anchor: 'top-right',
        cropMode: 'cover',
        overlapTarget: 'typographicInterruption',
        overlapAmount: 0.15,
        backgroundMode: 'editorial-field',
        shadowOwner: 'NONE',
      }),
      placement('physicalEditorObject', {
        x: 1120,
        y: 560,
        width: 140,
        height: 100,
        rotation: 18,
        zIndex: 6,
        anchor: 'bottom-right',
        cropMode: 'contain',
        overlapTarget: 'primaryRevisionArtifact',
        overlapAmount: 0.12,
        backgroundMode: 'transparent',
        shadowOwner: 'COMPOSITE_SHADOW',
      }),
      placement('socialExpression', {
        x: 32,
        y: 720,
        width: 260,
        height: 160,
        rotation: 0,
        zIndex: 7,
        anchor: 'bottom-left',
        cropMode: 'contain',
        backgroundMode: 'paper',
        shadowOwner: 'CODE_NATIVE_SHADOW',
      }),
      placement('motionSeedStrip', {
        x: 320,
        y: 820,
        width: 1080,
        height: 72,
        rotation: 0,
        zIndex: 8,
        anchor: 'bottom-left',
        cropMode: 'none',
        backgroundMode: 'transparent',
        shadowOwner: 'NONE',
      }),
    ],
  };
}

/** v3 mobile — vertical drama, dominant hero event first, artifact overlap survives */
export function mobileMapV3(hierarchy?: BoardHierarchyPlan): BoardCompositionMap {
  void hierarchy;
  return {
    canvasWidth: 390,
    canvasHeight: 780,
    breakpoint: 'MOBILE',
    placements: [
      placement('heroEditorialSpread', {
        x: 0,
        y: 0,
        width: 390,
        height: 360,
        rotation: 0,
        zIndex: 1,
        anchor: 'top-left',
        cropMode: 'cover',
        backgroundMode: 'editorial-field',
        shadowOwner: 'NONE',
      }),
      placement('typographicInterruption', {
        x: 12,
        y: 16,
        width: 366,
        height: 160,
        rotation: 0,
        zIndex: 5,
        anchor: 'top-left',
        cropMode: 'none',
        overlapTarget: 'heroEditorialSpread',
        overlapAmount: 0.1,
        backgroundMode: 'transparent',
        shadowOwner: 'NONE',
      }),
      placement('primaryRevisionArtifact', {
        x: 140,
        y: 280,
        width: 230,
        height: 280,
        rotation: -5,
        zIndex: 4,
        anchor: 'center',
        cropMode: 'contain',
        overlapTarget: 'heroEditorialSpread',
        overlapAmount: 0.32,
        backgroundMode: 'transparent',
        shadowOwner: 'COMPOSITE_SHADOW',
      }),
      placement('supportingPhotography', {
        x: 12,
        y: 400,
        width: 120,
        height: 90,
        rotation: 3,
        zIndex: 2,
        anchor: 'top-left',
        cropMode: 'cover',
        overlapTarget: 'primaryRevisionArtifact',
        overlapAmount: 0.1,
        backgroundMode: 'editorial-field',
        shadowOwner: 'NONE',
      }),
      placement('physicalEditorObject', {
        x: 290,
        y: 520,
        width: 80,
        height: 60,
        rotation: 14,
        zIndex: 6,
        anchor: 'center',
        cropMode: 'contain',
        overlapTarget: 'primaryRevisionArtifact',
        overlapAmount: 0.08,
        backgroundMode: 'transparent',
        shadowOwner: 'COMPOSITE_SHADOW',
      }),
      placement('socialExpression', {
        x: 12,
        y: 560,
        width: 366,
        height: 100,
        rotation: 0,
        zIndex: 7,
        anchor: 'top-left',
        cropMode: 'contain',
        backgroundMode: 'paper',
        shadowOwner: 'CODE_NATIVE_SHADOW',
      }),
      placement('motionSeedStrip', {
        x: 12,
        y: 680,
        width: 366,
        height: 88,
        rotation: 0,
        zIndex: 8,
        anchor: 'top-left',
        cropMode: 'none',
        backgroundMode: 'transparent',
        shadowOwner: 'NONE',
      }),
    ],
  };
}

function applyPassToManifest(
  manifest: BoardAssetManifestEntry[],
  pass: BoardCreativeDirectorPass,
): BoardAssetManifestEntry[] {
  const desktop = pass.desktopMap;
  const mobile = pass.mobileMap;
  const art = pass.artDirection;

  return manifest
    .filter((entry) => {
      const decision = pass.assetDecisions.find((d) => d.manifestId === entry.manifestId);
      return decision?.decision !== 'REMOVE';
    })
    .map((entry) => {
      const decision = pass.assetDecisions.find((d) => d.manifestId === entry.manifestId);
      const desktopPlacement =
        desktop.placements.find((p) => p.zoneId === entry.zoneId) ?? entry.desktopPlacement;
      const mobilePlacement =
        mobile.placements.find((p) => p.zoneId === entry.zoneId) ?? entry.mobilePlacement;

      let prompt = entry.prompt;
      if (entry.manifestId === 'MU01') {
        prompt =
          `${art.imageLanguageApplication}. ${pass.hierarchy.dominantEvent}. ` +
          'Hero editorial photograph partially obscured by correction — documentary crop, ' +
          'reference-conditioned, NO readable text. Image participates in editorial argument.';
      } else if (entry.manifestId === 'MU02') {
        prompt =
          `${art.artifactBehavior}. ${art.materialApplication}. ` +
          'Physical paper fragment — torn edge, tape shadow, handled, corrected, larger scale. ' +
          'NO readable text in FAL layer.';
      } else if (entry.role === 'SOCIAL_FRAME_SUBSTRATE') {
        prompt = pass.socialSystem;
      } else if (entry.role === 'MOTION_KEYFRAME_SUBSTRATE') {
        prompt = pass.motionSystem;
      }

      const referenceConditioned =
        decision?.referenceConditioned === true ||
        (decision?.decision === 'REGENERATE' && entry.manifestId === 'MU01');

      return {
        ...entry,
        assetId: randomUUID(),
        desktopPlacement,
        mobilePlacement,
        prompt,
        classification: referenceConditioned ? 'FAL_REFERENCE_CONDITIONED' : entry.classification,
        generationMethod: referenceConditioned
          ? 'REFERENCE_CONDITIONED_GENERATION'
          : entry.generationMethod,
        referenceCropIds: entry.referenceCropIds?.length ? entry.referenceCropIds : undefined,
      };
    });
}

function estimateCost(manifest: BoardAssetManifestEntry[], decisions: BoardCreativeDirectorPass['assetDecisions']) {
  let referenceConditionedCalls = 0;
  let textToImageCalls = 0;
  let backgroundRemovalCalls = 0;
  let codeNativeAssets = 0;

  for (const entry of manifest) {
    const decision = decisions.find((d) => d.manifestId === entry.manifestId);
    const needsGen =
      decision?.decision === 'REGENERATE' ||
      decision?.decision === 'NEW_ASSET_REQUIRED' ||
      decision?.decision === 'REUSE_WITH_EDIT';

    if (!needsGen && decision?.decision !== 'REUSE_WITH_NEW_CROP') {
      if (entry.classification === 'CODE_NATIVE' || entry.classification === 'SVG_NATIVE') {
        codeNativeAssets += 1;
      }
      continue;
    }

    if (entry.generationMethod === 'REFERENCE_CONDITIONED_GENERATION') referenceConditionedCalls += 1;
    else if (entry.generationMethod.startsWith('FAL')) textToImageCalls += 1;
    if (entry.backgroundRemovalRequired) backgroundRemovalCalls += 1;
    if (entry.classification === 'CODE_NATIVE' || entry.classification === 'SVG_NATIVE') codeNativeAssets += 1;
  }

  return {
    assetsPlanned: manifest.length,
    referenceConditionedCalls,
    textToImageCalls,
    backgroundRemovalCalls,
    codeNativeAssets,
    estimatedCostUsd:
      (referenceConditionedCalls + textToImageCalls) * FAL_COST + backgroundRemovalCalls * BIREFNET_COST,
  };
}

export function buildMarkedUpCopyBoardPlanV3(params: {
  direction: ComparisonDirectionCandidate;
  brandLoreFingerprint: string;
  brandLoreProfileVersion: number;
  creativeDirectorPass: BoardCreativeDirectorPass;
  resolvedReferences: CreativeDirectionBoardPlan['resolvedReferences'];
  referenceCrops: CreativeDirectionBoardPlan['referenceCrops'];
  referenceInfluenceGraph: CreativeDirectionBoardPlan['referenceInfluenceGraph'];
  sourceV2Plan: CreativeDirectionBoardPlan;
}): CreativeDirectionBoardPlan {
  if (params.direction.directionName !== MARKED_UP_COPY_DIRECTION_NAME) {
    throw new Error(`Pilot locked to ${MARKED_UP_COPY_DIRECTION_NAME} only`);
  }
  if (!params.direction.fieldCompleteness.complete) {
    throw new Error('VISUAL_PLAN_BLOCKED_INCOMPLETE_DIRECTION');
  }

  const comparisonSetKey = comparisonSetKeyFor(
    params.brandLoreFingerprint,
    params.brandLoreProfileVersion,
  );
  const planId = createHash('sha256')
    .update(`${comparisonSetKey}:${params.direction.directionId}:${MARKED_UP_COPY_BOARD_PLAN_VERSION_V3}`)
    .digest('hex')
    .slice(0, 16);

  const assetManifest = applyPassToManifest(
    params.sourceV2Plan.assetManifest,
    params.creativeDirectorPass,
  );

  const art = params.creativeDirectorPass.artDirection;
  const artDirectionSpec = buildMarkedUpCopyArtDirectionSpec();
  artDirectionSpec.boardStory = art.boardStory || artDirectionSpec.boardStory;
  artDirectionSpec.firstRead = art.firstRead || artDirectionSpec.firstRead;
  artDirectionSpec.secondRead = art.secondRead || artDirectionSpec.secondRead;
  artDirectionSpec.editorialTension = params.creativeDirectorPass.hierarchy.dominantEvent;
  artDirectionSpec.quietZone = params.creativeDirectorPass.hierarchy.quietZone;
  artDirectionSpec.signatureMoment = art.signatureMoment || artDirectionSpec.signatureMoment;

  return {
    planId,
    boardPlanVersion: MARKED_UP_COPY_BOARD_PLAN_VERSION_V3,
    comparisonSetKey,
    comparisonIndex: params.direction.comparisonIndex,
    directionId: params.direction.directionId,
    directionName: params.direction.directionName,
    sourceFormationId: params.direction.sourceFormationId,
    sourceFormationVersion: params.direction.sourceFormationVersion,
    bigIdea: params.direction.bigIdea,
    thesis: params.direction.oneLineThesis,
    governingBehavior: params.direction.governingBehavior,
    artDirection: artDirectionSpec,
    dynamicArtDirection: art,
    referenceDecompositions: MARKED_UP_COPY_REFERENCE_DECOMPOSITIONS,
    resolvedReferences: params.resolvedReferences,
    referenceCrops: params.referenceCrops,
    referenceInfluenceGraph: params.referenceInfluenceGraph,
    desktopMap: params.creativeDirectorPass.desktopMap,
    mobileMap: params.creativeDirectorPass.mobileMap,
    assetManifest,
    costEstimate: estimateCost(assetManifest, params.creativeDirectorPass.assetDecisions),
    createdAt: new Date().toISOString(),
  };
}

export { hashPrompt };
