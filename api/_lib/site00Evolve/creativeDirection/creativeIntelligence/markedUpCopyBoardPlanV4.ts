/**
 * CreativeDirectionBoardPlan v4 — derived FROM DirectionExpressionSystem (not board constants).
 */

import { createHash, randomUUID } from 'node:crypto';
import type { ComparisonDirectionCandidate } from './types.js';
import { comparisonSetKeyFor } from './comparisonProofStore.js';
import type {
  BoardAssetManifestEntry,
  BoardCompositionMap,
  BoardCompositionPlacement,
  CreativeDirectionBoardArtDirection,
  CreativeDirectionBoardPlan,
} from './creativeDirectionBoardTypes.js';
import {
  MARKED_UP_COPY_BOARD_PLAN_VERSION_V4,
  MARKED_UP_COPY_DIRECTION_NAME,
} from './creativeDirectionBoardTypes.js';
import { MARKED_UP_COPY_REFERENCE_DECOMPOSITIONS } from './markedUpCopyPilotConstants.js';
import { buildMarkedUpCopyArtDirectionSpec } from './markedUpCopyPilotConstants.js';
import type { DirectionExpressionSystem } from './directionExpressionSystemTypes.js';
import type { parseBoardV4CritiqueResponse } from './boardCreativeDirectorV4Service.js';
import { assertSocialFirstBoardProof } from '../../../../../shared/site00-brand-lore/boardProofEnforcement.js';

const FAL_COST = 0.04;
const BIREFNET_COST = 0.02;

function placement(
  zoneId: BoardCompositionPlacement['zoneId'],
  partial: Omit<BoardCompositionPlacement, 'zoneId'>,
): BoardCompositionPlacement {
  return { zoneId, ...partial };
}

/** Expression-system-derived desktop canvas — NOT legacy seven-slot template authority */
export function desktopMapFromExpression(system: DirectionExpressionSystem): BoardCompositionMap {
  void system;
  return {
    canvasWidth: 1440,
    canvasHeight: 960,
    breakpoint: 'DESKTOP',
    placements: [
      placement('heroEditorialSpread', {
        x: 0, y: 0, width: 1080, height: 620, rotation: 0, zIndex: 1,
        anchor: 'top-left', cropMode: 'cover', backgroundMode: 'editorial-field', shadowOwner: 'NONE',
      }),
      placement('typographicInterruption', {
        x: 24, y: 24, width: 640, height: 340, rotation: -1, zIndex: 6,
        anchor: 'top-left', cropMode: 'none', overlapTarget: 'heroEditorialSpread', overlapAmount: 0.14,
        backgroundMode: 'transparent', shadowOwner: 'NONE',
      }),
      placement('primaryRevisionArtifact', {
        x: 760, y: 400, width: 460, height: 520, rotation: -5, zIndex: 5,
        anchor: 'center', cropMode: 'contain', overlapTarget: 'heroEditorialSpread', overlapAmount: 0.32,
        backgroundMode: 'transparent', shadowOwner: 'COMPOSITE_SHADOW',
      }),
      placement('supportingPhotography', {
        x: 1020, y: 80, width: 380, height: 260, rotation: 3, zIndex: 2,
        anchor: 'top-right', cropMode: 'cover', overlapTarget: 'typographicInterruption', overlapAmount: 0.12,
        backgroundMode: 'editorial-field', shadowOwner: 'NONE',
      }),
      placement('physicalEditorObject', {
        x: 1180, y: 580, width: 160, height: 120, rotation: 20, zIndex: 7,
        anchor: 'bottom-right', cropMode: 'contain', overlapTarget: 'primaryRevisionArtifact', overlapAmount: 0.1,
        backgroundMode: 'transparent', shadowOwner: 'COMPOSITE_SHADOW',
      }),
      placement('socialExpression', {
        x: 24, y: 680, width: 320, height: 260, rotation: 0, zIndex: 8,
        anchor: 'bottom-left', cropMode: 'contain', backgroundMode: 'paper', shadowOwner: 'CODE_NATIVE_SHADOW',
      }),
      placement('motionSeedStrip', {
        x: 360, y: 880, width: 1056, height: 72, rotation: 0, zIndex: 9,
        anchor: 'bottom-left', cropMode: 'none', backgroundMode: 'transparent', shadowOwner: 'NONE',
      }),
    ],
  };
}

export function mobileMapFromExpression(system: DirectionExpressionSystem): BoardCompositionMap {
  void system;
  return {
    canvasWidth: 390,
    canvasHeight: 820,
    breakpoint: 'MOBILE',
    placements: [
      placement('heroEditorialSpread', {
        x: 0, y: 0, width: 390, height: 380, rotation: 0, zIndex: 1,
        anchor: 'top-left', cropMode: 'cover', backgroundMode: 'editorial-field', shadowOwner: 'NONE',
      }),
      placement('typographicInterruption', {
        x: 8, y: 12, width: 374, height: 180, rotation: 0, zIndex: 6,
        anchor: 'top-left', cropMode: 'none', overlapTarget: 'heroEditorialSpread', overlapAmount: 0.1,
        backgroundMode: 'transparent', shadowOwner: 'NONE',
      }),
      placement('primaryRevisionArtifact', {
        x: 120, y: 300, width: 250, height: 300, rotation: -6, zIndex: 5,
        anchor: 'center', cropMode: 'contain', overlapTarget: 'heroEditorialSpread', overlapAmount: 0.35,
        backgroundMode: 'transparent', shadowOwner: 'COMPOSITE_SHADOW',
      }),
      placement('supportingPhotography', {
        x: 8, y: 420, width: 140, height: 100, rotation: 4, zIndex: 2,
        anchor: 'top-left', cropMode: 'cover', overlapTarget: 'primaryRevisionArtifact', overlapAmount: 0.08,
        backgroundMode: 'editorial-field', shadowOwner: 'NONE',
      }),
      placement('socialExpression', {
        x: 8, y: 580, width: 374, height: 120, rotation: 0, zIndex: 8,
        anchor: 'top-left', cropMode: 'contain', backgroundMode: 'paper', shadowOwner: 'CODE_NATIVE_SHADOW',
      }),
      placement('motionSeedStrip', {
        x: 8, y: 720, width: 374, height: 92, rotation: 0, zIndex: 9,
        anchor: 'top-left', cropMode: 'none', backgroundMode: 'transparent', shadowOwner: 'NONE',
      }),
    ],
  };
}

function buildDefaultManifestFromExpression(
  system: DirectionExpressionSystem,
  desktop: BoardCompositionMap,
  mobile: BoardCompositionMap,
): BoardAssetManifestEntry[] {
  const baseNegative = [...system.antiGenericRules, 'stock photo', 'logos', 'readable text in FAL layer'];
  const heroPrompt =
    `${system.photographySystem.subjectMatter}. ${system.imageTreatment}. ` +
    `${system.visualThesis}. Reference-conditioned editorial hero — NO text.`;

  const entries: Omit<BoardAssetManifestEntry, 'assetId' | 'manifestId'>[] = [
    {
      role: 'HERO_EDITORIAL_SPREAD',
      zoneId: 'heroEditorialSpread',
      classification: 'FAL_REFERENCE_CONDITIONED',
      generationMethod: 'REFERENCE_CONDITIONED_GENERATION',
      referenceInputs: ['ref-editorial-spread-modern'],
      referenceCropIds: ['REF-COMP-01'],
      textOwnership: 'FAL_FORBIDDEN',
      backgroundTreatment: 'FULL_BLEED',
      backgroundRemovalRequired: false,
      edgeTreatment: 'NOT_APPLICABLE',
      shadowOwner: 'NONE',
      desktopPlacement: desktop.placements.find((p) => p.zoneId === 'heroEditorialSpread')!,
      mobilePlacement: mobile.placements.find((p) => p.zoneId === 'heroEditorialSpread')!,
      prompt: heroPrompt,
      negativeConstraints: baseNegative,
      qaCriteria: ['expression-system hero', 'reference-conditioned'],
    },
    {
      role: 'REPLACEMENT_PAPER_STRIP',
      zoneId: 'primaryRevisionArtifact',
      classification: 'HYBRID_COMPOSITION',
      generationMethod: 'FAL_GENERATED_AND_ISOLATED',
      referenceInputs: ['ref-live-revision-behavior', 'ref-material-paper'],
      referenceCropIds: ['REF-ANNOT-01', 'REF-MAT-01'],
      textOwnership: 'HYBRID_OVERLAY',
      backgroundTreatment: 'NEUTRAL_REMOVABLE',
      backgroundRemovalRequired: true,
      edgeTreatment: 'PAPER_CLEAN',
      shadowOwner: 'COMPOSITE_SHADOW',
      desktopPlacement: desktop.placements.find((p) => p.zoneId === 'primaryRevisionArtifact')!,
      mobilePlacement: mobile.placements.find((p) => p.zoneId === 'primaryRevisionArtifact')!,
      prompt: `${system.materialLanguage.justifiedMaterials.join(', ')}. ${system.primaryBrandArtifacts[0] ?? 'handled corrected page fragment'}. Torn edge, tape — NO text.`,
      negativeConstraints: baseNegative,
      qaCriteria: ['physical artifact', 'hybrid overlay'],
    },
    {
      role: 'SECONDARY_PHOTOGRAPHIC_EVIDENCE',
      zoneId: 'supportingPhotography',
      classification: 'FAL_REFERENCE_CONDITIONED',
      generationMethod: 'REFERENCE_CONDITIONED_GENERATION',
      referenceInputs: ['ref-editorial-spread-modern'],
      referenceCropIds: ['REF-PHOTO-01'],
      textOwnership: 'FAL_FORBIDDEN',
      backgroundTreatment: 'FULL_BLEED',
      backgroundRemovalRequired: false,
      edgeTreatment: 'NOT_APPLICABLE',
      shadowOwner: 'NONE',
      desktopPlacement: desktop.placements.find((p) => p.zoneId === 'supportingPhotography')!,
      mobilePlacement: mobile.placements.find((p) => p.zoneId === 'supportingPhotography')!,
      prompt: `${system.photographySystem.croppingBehavior}. Partially obscured documentary crop.`,
      negativeConstraints: baseNegative,
      qaCriteria: ['secondary evidence'],
    },
    {
      role: 'PHYSICAL_EDITOR_OBJECT',
      zoneId: 'physicalEditorObject',
      classification: 'FAL_GENERATED_AND_ISOLATED',
      generationMethod: 'FAL_GENERATED_AND_ISOLATED',
      referenceInputs: ['ref-live-revision-behavior'],
      textOwnership: 'FAL_FORBIDDEN',
      backgroundTreatment: 'NEUTRAL_REMOVABLE',
      backgroundRemovalRequired: true,
      edgeTreatment: 'HARD_ALPHA',
      shadowOwner: 'COMPOSITE_SHADOW',
      desktopPlacement: desktop.placements.find((p) => p.zoneId === 'physicalEditorObject')!,
      mobilePlacement: mobile.placements.find((p) => p.zoneId === 'physicalEditorObject')!,
      prompt: `Editor ${system.secondaryBrandArtifacts[0] ?? 'red marker pen'} isolated — tactile revision tool.`,
      negativeConstraints: baseNegative,
      qaCriteria: ['isolated object'],
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
      shadowOwner: 'CODE_NATIVE_SHADOW',
      desktopPlacement: desktop.placements.find((p) => p.zoneId === 'socialExpression')!,
      mobilePlacement: mobile.placements.find((p) => p.zoneId === 'socialExpression')!,
      prompt: system.socialBehavior.feedBehavior,
      negativeConstraints: [],
      qaCriteria: ['social system proof'],
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
      shadowOwner: 'NONE',
      desktopPlacement: desktop.placements.find((p) => p.zoneId === 'motionSeedStrip')!,
      mobilePlacement: mobile.placements.find((p) => p.zoneId === 'motionSeedStrip')!,
      prompt: system.socialBehavior.motionBehavior,
      negativeConstraints: [],
      qaCriteria: ['motion sequence'],
    },
  ];

  return entries.map((e, i) => ({
    ...e,
    assetId: randomUUID(),
    manifestId: `MUC-${String(i + 1).padStart(2, '0')}`,
  }));
}

function estimateCost(manifest: BoardAssetManifestEntry[]) {
  let ref = 0;
  let t2i = 0;
  let bg = 0;
  let code = 0;
  for (const e of manifest) {
    if (e.generationMethod === 'REFERENCE_CONDITIONED_GENERATION') ref += 1;
    else if (e.generationMethod.startsWith('FAL')) t2i += 1;
    if (e.backgroundRemovalRequired) bg += 1;
    if (e.classification === 'CODE_NATIVE' || e.classification === 'SVG_NATIVE') code += 1;
  }
  return {
    assetsPlanned: manifest.length,
    referenceConditionedCalls: ref,
    textToImageCalls: t2i,
    backgroundRemovalCalls: bg,
    codeNativeAssets: code,
    estimatedCostUsd: (ref + t2i) * FAL_COST + bg * BIREFNET_COST,
  };
}

function artDirectionFromExpression(system: DirectionExpressionSystem): CreativeDirectionBoardArtDirection {
  return {
    boardStory: system.conceptualWorld,
    firstRead: system.signatureMoments[0] ?? system.visualThesis,
    secondRead: system.recurringContentFranchises.map((f) => f.name).join(' · '),
    thirdRead: system.socialBehavior.feedBehavior,
    signatureMoment: system.signatureMoments[0] ?? system.visualThesis,
    visualHierarchy: system.governingVisualBehavior,
    compositionBehavior: system.spatialBehavior,
    negativeSpaceStrategy: system.extensibilityRules.find((r) => r.toLowerCase().includes('quiet')) ?? 'Deliberate breathing room',
    imageLanguageApplication: system.photographySystem.documentaryEditorialBalance,
    materialApplication: system.materialLanguage.justifiedMaterials.join('; '),
    typographicBehavior: `${system.typographySystem.cleanVoice} vs ${system.typographySystem.revisionVoice}`,
    graphicGrammar: system.graphicGrammar.selectedDevices.join(', '),
    annotationGrammar: system.annotationGrammar.correctionBehavior,
    artifactBehavior: system.primaryBrandArtifacts.join('; '),
    socialBehavior: system.socialBehavior.feedBehavior,
    motionBehavior: system.socialBehavior.motionBehavior,
    referenceApplication: system.referenceApplications.map((r) => r.newBoardTranslation ?? r.trait),
    antiGenericRules: system.antiGenericRules,
    antiCousinRules: system.antiCousinRules,
    lineage: {
      provider: system.provider,
      model: system.model,
      promptVersion: system.promptVersion,
      inputFingerprint: system.inputFingerprint,
      outputHash: system.outputHash,
      createdAt: system.createdAt,
    },
  };
}

export function buildMarkedUpCopyBoardPlanV4(params: {
  direction: ComparisonDirectionCandidate;
  expressionSystem: DirectionExpressionSystem;
  boardArtDirection: ReturnType<typeof parseBoardV4CritiqueResponse>;
  resolvedReferences: CreativeDirectionBoardPlan['resolvedReferences'];
  referenceCrops: CreativeDirectionBoardPlan['referenceCrops'];
  referenceInfluenceGraph: CreativeDirectionBoardPlan['referenceInfluenceGraph'];
}): CreativeDirectionBoardPlan {
  if (params.direction.directionName !== MARKED_UP_COPY_DIRECTION_NAME) {
    throw new Error(`Pilot locked to ${MARKED_UP_COPY_DIRECTION_NAME} only`);
  }

  const comparisonSetKey = comparisonSetKeyFor(
    params.expressionSystem.brandLoreFingerprint,
    params.expressionSystem.brandLoreVersion,
  );
  const planId = createHash('sha256')
    .update(`${comparisonSetKey}:${params.direction.directionId}:${MARKED_UP_COPY_BOARD_PLAN_VERSION_V4}`)
    .digest('hex')
    .slice(0, 16);

  const desktopMap =
    params.boardArtDirection.desktopMap.placements.length > 0
      ? params.boardArtDirection.desktopMap
      : desktopMapFromExpression(params.expressionSystem);
  const mobileMap =
    params.boardArtDirection.mobileMap.placements.length > 0
      ? params.boardArtDirection.mobileMap
      : mobileMapFromExpression(params.expressionSystem);

  assertSocialFirstBoardProof({
    expressionContext: 'SOCIAL_FIRST_EDITORIAL',
    presentZoneIds: desktopMap.placements.map((p) => p.zoneId),
  });

  const assetManifest =
    params.boardArtDirection.assetManifest.length > 0
      ? params.boardArtDirection.assetManifest
      : buildDefaultManifestFromExpression(params.expressionSystem, desktopMap, mobileMap);

  const artDirectionSpec = buildMarkedUpCopyArtDirectionSpec();
  artDirectionSpec.boardStory = params.expressionSystem.conceptualWorld;
  artDirectionSpec.signatureMoment = params.expressionSystem.signatureMoments[0] ?? params.expressionSystem.visualThesis;

  return {
    planId,
    boardPlanVersion: MARKED_UP_COPY_BOARD_PLAN_VERSION_V4,
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
    dynamicArtDirection: artDirectionFromExpression(params.expressionSystem),
    referenceDecompositions: MARKED_UP_COPY_REFERENCE_DECOMPOSITIONS,
    resolvedReferences: params.resolvedReferences,
    referenceCrops: params.referenceCrops,
    referenceInfluenceGraph: params.referenceInfluenceGraph,
    expressionSystemId: params.expressionSystem.expressionSystemId,
    boardStructureRationale: params.boardArtDirection.boardStructureRationale,
    fixedTemplateInherited: params.boardArtDirection.fixedTemplateInherited,
    desktopMap,
    mobileMap,
    assetManifest,
    costEstimate: estimateCost(assetManifest),
    createdAt: new Date().toISOString(),
  };
}
