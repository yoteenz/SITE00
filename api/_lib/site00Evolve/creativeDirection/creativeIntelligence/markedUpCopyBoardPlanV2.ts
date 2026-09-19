/**
 * Build CreativeDirectionBoardPlan v2 — after dynamic art direction + reference resolution.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { ComparisonDirectionCandidate } from './types.js';
import { comparisonSetKeyFor } from './comparisonProofStore.js';
import type {
  BoardAssetManifestEntry,
  BoardReferenceCrop,
  BoardReferenceInfluenceEdge,
  CreativeDirectionBoardArtDirection,
  CreativeDirectionBoardPlan,
  ResolvedBoardReference,
} from './creativeDirectionBoardTypes.js';
import {
  MARKED_UP_COPY_BOARD_PLAN_VERSION_V2,
  MARKED_UP_COPY_DIRECTION_NAME,
} from './creativeDirectionBoardTypes.js';
import { MARKED_UP_COPY_IMMUTABLE } from './markedUpCopyCopyContract.js';
import { MARKED_UP_COPY_REFERENCE_DECOMPOSITIONS } from './markedUpCopyPilotConstants.js';
import { buildMarkedUpCopyArtDirectionSpec } from './markedUpCopyPilotConstants.js';
import { desktopMap, mobileMap, hashPrompt } from './markedUpCopyBoardPlan.js';

const FAL_COST = 0.04;
const BIREFNET_COST = 0.02;

function cropIdsForAsset(manifestId: string, crops: BoardReferenceCrop[]): string[] {
  return crops.filter((c) => c.influencedAssetIds.includes(manifestId)).map((c) => c.cropId);
}

function buildAssetManifestV2(params: {
  dynamicArtDirection: CreativeDirectionBoardArtDirection;
  crops: BoardReferenceCrop[];
}): BoardAssetManifestEntry[] {
  const baseNegative = [
    'stock photo aesthetic',
    'generic corporate',
    'SaaS dashboard',
    'readable text',
    'logos',
    'watermark',
    'ranking',
    'scoreboard',
    'leaderboard',
  ];

  const heroPrompt =
    `${params.dynamicArtDirection.imageLanguageApplication}. ` +
    'Generate ONLY hero editorial photograph zone — contemporary magazine spread, documentary crop, ' +
    'intentional negative space upper-right for code-native annotation. NO readable text, NO logos.';

  const entries: Omit<BoardAssetManifestEntry, 'assetId' | 'manifestId'>[] = [
    {
      role: 'HERO_EDITORIAL_SPREAD',
      zoneId: 'heroEditorialSpread',
      classification: 'FAL_REFERENCE_CONDITIONED',
      generationMethod: 'REFERENCE_CONDITIONED_GENERATION',
      referenceInputs: ['ref-editorial-spread-modern'],
      referenceCropIds: cropIdsForAsset('MU01', params.crops),
      textOwnership: 'FAL_FORBIDDEN',
      backgroundTreatment: 'FULL_BLEED',
      backgroundRemovalRequired: false,
      edgeTreatment: 'NOT_APPLICABLE',
      shadowOwnership: 'NONE',
      desktopPlacement: desktopMap().placements.find((p) => p.zoneId === 'heroEditorialSpread')!,
      mobilePlacement: mobileMap().placements.find((p) => p.zoneId === 'heroEditorialSpread')!,
      prompt: heroPrompt,
      negativeConstraints: [...baseNegative, ...(params.dynamicArtDirection.antiGenericRules ?? [])],
      qaCriteria: ['editorial not stock', 'reference-informed composition', 'no baked text'],
    },
    {
      role: 'REPLACEMENT_PAPER_STRIP',
      zoneId: 'primaryRevisionArtifact',
      classification: 'HYBRID_COMPOSITION',
      generationMethod: 'FAL_GENERATED_AND_ISOLATED',
      referenceInputs: ['ref-live-revision-behavior', 'ref-material-paper'],
      referenceCropIds: cropIdsForAsset('MU02', params.crops),
      textOwnership: 'HYBRID_OVERLAY',
      backgroundTreatment: 'NEUTRAL_REMOVABLE',
      backgroundRemovalRequired: true,
      edgeTreatment: 'PAPER_CLEAN',
      shadowOwnership: 'COMPOSITE_SHADOW',
      desktopPlacement: desktopMap().placements.find((p) => p.zoneId === 'primaryRevisionArtifact')!,
      mobilePlacement: mobileMap().placements.find((p) => p.zoneId === 'primaryRevisionArtifact')!,
      prompt:
        `${params.dynamicArtDirection.materialApplication}. ` +
        'Generate ONLY physical editorial paper page fragment — fresh white coated paper, subtle bend, ' +
        'isolated neutral background. NO readable text — code-native strike/replace overlay follows.',
      negativeConstraints: [...baseNegative, 'handwriting', 'notebook lines'],
      qaCriteria: ['hybrid substrate', 'clean alpha', 'no semantic text in FAL layer'],
    },
    {
      role: 'SECONDARY_PHOTOGRAPHIC_EVIDENCE',
      zoneId: 'supportingPhotography',
      classification: 'FAL_REFERENCE_CONDITIONED',
      generationMethod: 'REFERENCE_CONDITIONED_GENERATION',
      referenceInputs: ['ref-editorial-spread-modern'],
      referenceCropIds: cropIdsForAsset('MU03', params.crops),
      textOwnership: 'FAL_FORBIDDEN',
      backgroundTreatment: 'FULL_BLEED',
      backgroundRemovalRequired: false,
      edgeTreatment: 'NOT_APPLICABLE',
      shadowOwnership: 'NONE',
      desktopPlacement: desktopMap().placements.find((p) => p.zoneId === 'supportingPhotography')!,
      mobilePlacement: mobileMap().placements.find((p) => p.zoneId === 'supportingPhotography')!,
      prompt:
        'Generate ONLY secondary editorial photographic evidence — documentary partial crop, distinct from hero, ' +
        'supports live revision margin-argument narrative. No text, no logos.',
      negativeConstraints: baseNegative,
      qaCriteria: ['distinct from hero', 'documentary editorial'],
    },
    {
      role: 'PHYSICAL_EDITOR_OBJECT',
      zoneId: 'physicalEditorObject',
      classification: 'FAL_GENERATED_AND_ISOLATED',
      generationMethod: 'FAL_GENERATED_AND_ISOLATED',
      referenceInputs: ['ref-live-revision-behavior'],
      referenceCropIds: [],
      textOwnership: 'FAL_FORBIDDEN',
      backgroundTreatment: 'NEUTRAL_REMOVABLE',
      backgroundRemovalRequired: true,
      edgeTreatment: 'HARD_ALPHA',
      shadowOwnership: 'COMPOSITE_SHADOW',
      desktopPlacement: desktopMap().placements.find((p) => p.zoneId === 'physicalEditorObject')!,
      mobilePlacement: mobileMap().placements.find((p) => p.zoneId === 'physicalEditorObject')!,
      prompt:
        'Generate ONLY contemporary red editor marker pen, isolated neutral background, tactile object for live revision board.',
      negativeConstraints: baseNegative,
      qaCriteria: ['clean isolation', 'editor tool not stock hand'],
    },
    {
      role: 'SOCIAL_FRAME_SUBSTRATE',
      zoneId: 'socialExpression',
      classification: 'CODE_NATIVE',
      generationMethod: 'CODE_NATIVE',
      referenceInputs: [],
      textOwnership: 'CODE_NATIVE',
      backgroundTreatment: 'CODE_FIELD',
      backgroundRemovalRequired: false,
      edgeTreatment: 'NOT_APPLICABLE',
      shadowOwnership: 'CODE_NATIVE_SHADOW',
      desktopPlacement: desktopMap().placements.find((p) => p.zoneId === 'socialExpression')!,
      mobilePlacement: mobileMap().placements.find((p) => p.zoneId === 'socialExpression')!,
      prompt: params.dynamicArtDirection.socialBehavior,
      negativeConstraints: [],
      qaCriteria: ['source → reaction → correction sequence'],
    },
    {
      role: 'MOTION_KEYFRAME_SUBSTRATE',
      zoneId: 'motionSeedStrip',
      classification: 'SVG_NATIVE',
      generationMethod: 'SVG_NATIVE',
      referenceInputs: [],
      textOwnership: 'CODE_NATIVE',
      backgroundTreatment: 'CODE_FIELD',
      backgroundRemovalRequired: false,
      edgeTreatment: 'NOT_APPLICABLE',
      shadowOwnership: 'NONE',
      desktopPlacement: desktopMap().placements.find((p) => p.zoneId === 'motionSeedStrip')!,
      mobilePlacement: mobileMap().placements.find((p) => p.zoneId === 'motionSeedStrip')!,
      prompt: params.dynamicArtDirection.motionBehavior,
      negativeConstraints: [],
      qaCriteria: ['5-frame revision sequence'],
    },
  ];

  return entries.map((e, i) => ({
    ...e,
    assetId: randomUUID(),
    manifestId: `MU${String(i + 1).padStart(2, '0')}`,
  }));
}

export function buildMarkedUpCopyBoardPlanV2(params: {
  direction: ComparisonDirectionCandidate;
  brandLoreFingerprint: string;
  brandLoreProfileVersion: number;
  dynamicArtDirection: CreativeDirectionBoardArtDirection;
  resolvedReferences: ResolvedBoardReference[];
  referenceCrops: BoardReferenceCrop[];
  referenceInfluenceGraph: BoardReferenceInfluenceEdge[];
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
    .update(`${comparisonSetKey}:${params.direction.directionId}:${MARKED_UP_COPY_BOARD_PLAN_VERSION_V2}`)
    .digest('hex')
    .slice(0, 16);

  const assetManifest = buildAssetManifestV2({
    dynamicArtDirection: params.dynamicArtDirection,
    crops: params.referenceCrops,
  });

  const refConditioned = assetManifest.filter(
    (a) => a.classification === 'FAL_REFERENCE_CONDITIONED' || a.referenceCropIds?.length,
  ).length;
  const falAssets = assetManifest.filter((a) => a.classification.startsWith('FAL') || a.classification === 'HYBRID_COMPOSITION');
  const isolated = assetManifest.filter((a) => a.backgroundRemovalRequired);
  const codeNative = assetManifest.filter(
    (a) => a.classification === 'CODE_NATIVE' || a.classification === 'SVG_NATIVE',
  );

  const legacyArt = buildMarkedUpCopyArtDirectionSpec();
  legacyArt.boardStory = params.dynamicArtDirection.boardStory;
  legacyArt.firstRead = params.dynamicArtDirection.firstRead;
  legacyArt.secondRead = params.dynamicArtDirection.secondRead;
  legacyArt.signatureMoment = params.dynamicArtDirection.signatureMoment;

  return {
    planId,
    boardPlanVersion: MARKED_UP_COPY_BOARD_PLAN_VERSION_V2,
    comparisonSetKey,
    comparisonIndex: params.direction.comparisonIndex,
    directionId: params.direction.directionId,
    directionName: params.direction.directionName,
    sourceFormationId: params.direction.sourceFormationId,
    sourceFormationVersion: params.direction.sourceFormationVersion,
    bigIdea: MARKED_UP_COPY_IMMUTABLE.bigIdea,
    thesis: MARKED_UP_COPY_IMMUTABLE.thesis,
    governingBehavior: MARKED_UP_COPY_IMMUTABLE.governingBehavior,
    artDirection: legacyArt,
    dynamicArtDirection: params.dynamicArtDirection,
    referenceDecompositions: MARKED_UP_COPY_REFERENCE_DECOMPOSITIONS,
    resolvedReferences: params.resolvedReferences,
    referenceCrops: params.referenceCrops,
    referenceInfluenceGraph: params.referenceInfluenceGraph,
    desktopMap: desktopMap(),
    mobileMap: mobileMap(),
    assetManifest,
    costEstimate: {
      assetsPlanned: assetManifest.length,
      referenceConditionedCalls: refConditioned,
      textToImageCalls: Math.max(0, falAssets.length - refConditioned),
      backgroundRemovalCalls: isolated.length,
      codeNativeAssets: codeNative.length,
      estimatedCostUsd: falAssets.length * FAL_COST + isolated.length * BIREFNET_COST,
    },
    createdAt: new Date().toISOString(),
  };
}

export { hashPrompt };
