/**
 * Build CreativeDirectionBoardPlan for THE MARKED-UP COPY pilot —
 * art direction + composition maps + asset manifest BEFORE any FAL calls.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { ComparisonDirectionCandidate } from './types.js';
import { comparisonSetKeyFor } from './comparisonProofStore.js';
import type {
  BoardAssetManifestEntry,
  BoardCompositionMap,
  BoardCompositionPlacement,
  CreativeDirectionBoardPlan,
} from './creativeDirectionBoardTypes.js';
import {
  MARKED_UP_COPY_BOARD_PLAN_VERSION,
  MARKED_UP_COPY_DIRECTION_NAME,
} from './creativeDirectionBoardTypes.js';
import {
  MARKED_UP_COPY_LOCKED,
  MARKED_UP_COPY_REFERENCE_DECOMPOSITIONS,
  buildMarkedUpCopyArtDirectionSpec,
} from './markedUpCopyPilotConstants.js';

const FAL_COST = 0.04;
const BIREFNET_COST = 0.02;

function placement(
  zoneId: BoardCompositionPlacement['zoneId'],
  partial: Omit<BoardCompositionPlacement, 'zoneId'>,
): BoardCompositionPlacement {
  return { zoneId, ...partial };
}

function desktopMap(): BoardCompositionMap {
  return {
    canvasWidth: 1440,
    canvasHeight: 900,
    breakpoint: 'DESKTOP',
    placements: [
      placement('heroEditorialSpread', {
        x: 0,
        y: 0,
        width: 920,
        height: 620,
        rotation: 0,
        zIndex: 1,
        anchor: 'top-left',
        cropMode: 'cover',
        backgroundMode: 'editorial-field',
        shadowOwner: 'NONE',
      }),
      placement('typographicInterruption', {
        x: 48,
        y: 48,
        width: 520,
        height: 280,
        rotation: 0,
        zIndex: 4,
        anchor: 'top-left',
        cropMode: 'none',
        safeArea: { top: 12, right: 12, bottom: 12, left: 12 },
        backgroundMode: 'transparent',
        shadowOwner: 'NONE',
      }),
      placement('primaryRevisionArtifact', {
        x: 640,
        y: 380,
        width: 340,
        height: 420,
        rotation: -2,
        zIndex: 3,
        anchor: 'center',
        cropMode: 'contain',
        overlapTarget: 'heroEditorialSpread',
        overlapAmount: 0.18,
        backgroundMode: 'transparent',
        shadowOwner: 'COMPOSITE_SHADOW',
      }),
      placement('supportingPhotography', {
        x: 960,
        y: 48,
        width: 420,
        height: 300,
        rotation: 0,
        zIndex: 2,
        anchor: 'top-right',
        cropMode: 'cover',
        backgroundMode: 'editorial-field',
        shadowOwner: 'NONE',
      }),
      placement('physicalEditorObject', {
        x: 1080,
        y: 520,
        width: 180,
        height: 120,
        rotation: 12,
        zIndex: 5,
        anchor: 'bottom-right',
        cropMode: 'contain',
        overlapTarget: 'primaryRevisionArtifact',
        overlapAmount: 0.08,
        backgroundMode: 'transparent',
        shadowOwner: 'COMPOSITE_SHADOW',
      }),
      placement('socialExpression', {
        x: 48,
        y: 680,
        width: 280,
        height: 380,
        rotation: 0,
        zIndex: 6,
        anchor: 'bottom-left',
        cropMode: 'contain',
        backgroundMode: 'paper',
        shadowOwner: 'CODE_NATIVE_SHADOW',
      }),
      placement('motionSeedStrip', {
        x: 360,
        y: 820,
        width: 1040,
        height: 64,
        rotation: 0,
        zIndex: 7,
        anchor: 'bottom-left',
        cropMode: 'none',
        backgroundMode: 'transparent',
        shadowOwner: 'NONE',
      }),
    ],
  };
}

function mobileMap(): BoardCompositionMap {
  return {
    canvasWidth: 390,
    canvasHeight: 780,
    breakpoint: 'MOBILE',
    placements: [
      placement('heroEditorialSpread', {
        x: 0,
        y: 0,
        width: 390,
        height: 320,
        rotation: 0,
        zIndex: 1,
        anchor: 'top-left',
        cropMode: 'cover',
        backgroundMode: 'editorial-field',
        shadowOwner: 'NONE',
      }),
      placement('typographicInterruption', {
        x: 16,
        y: 24,
        width: 358,
        height: 140,
        rotation: 0,
        zIndex: 4,
        anchor: 'top-left',
        cropMode: 'none',
        backgroundMode: 'transparent',
        shadowOwner: 'NONE',
      }),
      placement('primaryRevisionArtifact', {
        x: 180,
        y: 260,
        width: 190,
        height: 240,
        rotation: -3,
        zIndex: 3,
        anchor: 'center',
        cropMode: 'contain',
        overlapTarget: 'heroEditorialSpread',
        overlapAmount: 0.22,
        backgroundMode: 'transparent',
        shadowOwner: 'COMPOSITE_SHADOW',
      }),
      placement('supportingPhotography', {
        x: 16,
        y: 340,
        width: 160,
        height: 120,
        rotation: 0,
        zIndex: 2,
        anchor: 'top-left',
        cropMode: 'cover',
        backgroundMode: 'editorial-field',
        shadowOwner: 'NONE',
      }),
      placement('physicalEditorObject', {
        x: 280,
        y: 480,
        width: 90,
        height: 70,
        rotation: 10,
        zIndex: 5,
        anchor: 'center',
        cropMode: 'contain',
        overlapTarget: 'primaryRevisionArtifact',
        overlapAmount: 0.1,
        backgroundMode: 'transparent',
        shadowOwner: 'COMPOSITE_SHADOW',
      }),
      placement('socialExpression', {
        x: 16,
        y: 520,
        width: 160,
        height: 220,
        rotation: 0,
        zIndex: 6,
        anchor: 'top-left',
        cropMode: 'contain',
        backgroundMode: 'paper',
        shadowOwner: 'CODE_NATIVE_SHADOW',
      }),
      placement('motionSeedStrip', {
        x: 16,
        y: 700,
        width: 358,
        height: 56,
        rotation: 0,
        zIndex: 7,
        anchor: 'bottom-left',
        cropMode: 'none',
        backgroundMode: 'transparent',
        shadowOwner: 'NONE',
      }),
    ],
  };
}

function heroPrompt(): { prompt: string; negative: string[] } {
  return {
    prompt:
      'Generate ONLY the hero editorial photograph zone for a contemporary independent magazine spread. ' +
      'High-end editorial publication sensibility, modern not vintage, documentary crop with intentional negative space ' +
      'in upper-right for code-native annotation overlay. Matte print realism, controlled grain, asymmetric composition, ' +
      'no readable text, no logos, no UI, no people smiling at camera. Suitable for deterministic compositing with ' +
      'editorial headline and margin marks added in code. Three-quarter editorial feature crop, tactile paper field at edges.',
    negative: [
      'stock photo',
      'corporate office',
      'laptop',
      'business people smiling',
      'scrapbook',
      'antique manuscript',
      'handwritten gibberish',
      'logos',
      'website UI',
      'dashboard',
      'moodboard grid',
      'text',
      'watermark',
    ],
  };
}

function buildAssetManifest(planId: string): BoardAssetManifestEntry[] {
  const hero = heroPrompt();
  const baseNegative = [
    'stock photo aesthetic',
    'generic corporate',
    'SaaS dashboard',
    'readable text',
    'logos',
    'watermark',
  ];

  const entries: Omit<BoardAssetManifestEntry, 'assetId' | 'manifestId'>[] = [
    {
      role: 'HERO_EDITORIAL_SPREAD',
      zoneId: 'heroEditorialSpread',
      classification: 'FAL_GENERATED',
      generationMethod: 'FAL_GENERATED',
      referenceInputs: ['ref-editorial-spread-modern'],
      backgroundTreatment: 'FULL_BLEED',
      backgroundRemovalRequired: false,
      edgeTreatment: 'NOT_APPLICABLE',
      shadowOwnership: 'NONE',
      desktopPlacement: desktopMap().placements.find((p) => p.zoneId === 'heroEditorialSpread')!,
      mobilePlacement: mobileMap().placements.find((p) => p.zoneId === 'heroEditorialSpread')!,
      prompt: hero.prompt,
      negativeConstraints: [...baseNegative, ...hero.negative],
      qaCriteria: ['editorial not stock', 'annotation-safe quiet zone', 'no baked text'],
    },
    {
      role: 'REPLACEMENT_PAPER_STRIP',
      zoneId: 'primaryRevisionArtifact',
      classification: 'FAL_GENERATED_AND_ISOLATED',
      generationMethod: 'FAL_GENERATED_AND_ISOLATED',
      referenceInputs: ['ref-live-revision-behavior'],
      backgroundTreatment: 'NEUTRAL_REMOVABLE',
      backgroundRemovalRequired: true,
      edgeTreatment: 'PAPER_CLEAN',
      shadowOwnership: 'COMPOSITE_SHADOW',
      desktopPlacement: desktopMap().placements.find((p) => p.zoneId === 'primaryRevisionArtifact')!,
      mobilePlacement: mobileMap().placements.find((p) => p.zoneId === 'primaryRevisionArtifact')!,
      prompt:
        'Generate ONLY a physical editorial paper page fragment for live revision — fresh white coated paper with subtle bend, ' +
        'three-quarter overhead view, isolated on neutral removable background. NO readable text, NO logos. ' +
        'Tactile print surface for code-native strike-through and replacement overlay. Contemporary magazine paper not vintage manuscript.',
      negativeConstraints: [...baseNegative, 'antique yellow paper', 'notebook lines', 'handwriting'],
      qaCriteria: ['clean alpha after isolation', 'paper tactile', 'no semantic text'],
    },
    {
      role: 'SECONDARY_PHOTOGRAPHIC_EVIDENCE',
      zoneId: 'supportingPhotography',
      classification: 'FAL_GENERATED',
      generationMethod: 'FAL_GENERATED',
      referenceInputs: ['ref-editorial-spread-modern'],
      backgroundTreatment: 'FULL_BLEED',
      backgroundRemovalRequired: false,
      edgeTreatment: 'NOT_APPLICABLE',
      shadowOwnership: 'NONE',
      desktopPlacement: desktopMap().placements.find((p) => p.zoneId === 'supportingPhotography')!,
      mobilePlacement: mobileMap().placements.find((p) => p.zoneId === 'supportingPhotography')!,
      prompt:
        'Generate ONLY secondary editorial photographic evidence — documentary crop, partial subject at frame edge, ' +
        'controlled grain, editorial era influence contemporary not vintage. No readable text, no logos. ' +
        'Supports margin-argument narrative on a creative direction board.',
      negativeConstraints: baseNegative,
      qaCriteria: ['distinct from hero crop', 'documentary editorial', 'not stock portrait'],
    },
    {
      role: 'PHYSICAL_EDITOR_OBJECT',
      zoneId: 'physicalEditorObject',
      classification: 'FAL_GENERATED_AND_ISOLATED',
      generationMethod: 'FAL_GENERATED_AND_ISOLATED',
      referenceInputs: ['ref-live-revision-behavior'],
      backgroundTreatment: 'NEUTRAL_REMOVABLE',
      backgroundRemovalRequired: true,
      edgeTreatment: 'HARD_ALPHA',
      shadowOwnership: 'COMPOSITE_SHADOW',
      desktopPlacement: desktopMap().placements.find((p) => p.zoneId === 'physicalEditorObject')!,
      mobilePlacement: mobileMap().placements.find((p) => p.zoneId === 'physicalEditorObject')!,
      prompt:
        'Generate ONLY a contemporary editor red marker pen or editorial markup tool, isolated on neutral removable background, ' +
        'slight cast shadow suitable for composite. No text, no logos, no hand.',
      negativeConstraints: baseNegative,
      qaCriteria: ['clean isolation', 'tactile object', 'no halo on white/gray/black'],
    },
    {
      role: 'SOCIAL_FRAME_SUBSTRATE',
      zoneId: 'socialExpression',
      classification: 'CODE_NATIVE',
      generationMethod: 'CODE_NATIVE',
      referenceInputs: [],
      backgroundTreatment: 'CODE_FIELD',
      backgroundRemovalRequired: false,
      edgeTreatment: 'NOT_APPLICABLE',
      shadowOwnership: 'CODE_NATIVE_SHADOW',
      desktopPlacement: desktopMap().placements.find((p) => p.zoneId === 'socialExpression')!,
      mobilePlacement: mobileMap().placements.find((p) => p.zoneId === 'socialExpression')!,
      prompt: 'CODE_NATIVE social frame — claim with active cross-out and replacement, not hero crop resize.',
      negativeConstraints: [],
      qaCriteria: ['social-native behavior', 'live edit visible', 'exact copy in code'],
    },
    {
      role: 'MOTION_KEYFRAME_SUBSTRATE',
      zoneId: 'motionSeedStrip',
      classification: 'SVG_NATIVE',
      generationMethod: 'SVG_NATIVE',
      referenceInputs: [],
      backgroundTreatment: 'CODE_FIELD',
      backgroundRemovalRequired: false,
      edgeTreatment: 'NOT_APPLICABLE',
      shadowOwnership: 'NONE',
      desktopPlacement: desktopMap().placements.find((p) => p.zoneId === 'motionSeedStrip')!,
      mobilePlacement: mobileMap().placements.find((p) => p.zoneId === 'motionSeedStrip')!,
      prompt: 'Five-frame motion strip: clean → strike → replace → margin interrupt → annotated final.',
      negativeConstraints: [],
      qaCriteria: ['derives from governing behavior', '5 frames', 'code-native labels'],
    },
  ];

  return entries.map((e, i) => ({
    ...e,
    assetId: randomUUID(),
    manifestId: `MU${String(i + 1).padStart(2, '0')}`,
  }));
}

export function buildMarkedUpCopyBoardPlan(params: {
  direction: ComparisonDirectionCandidate;
  brandLoreFingerprint: string;
  brandLoreProfileVersion: number;
}): CreativeDirectionBoardPlan {
  if (params.direction.directionName !== MARKED_UP_COPY_DIRECTION_NAME) {
    throw new Error(`Pilot locked to ${MARKED_UP_COPY_DIRECTION_NAME} only`);
  }

  const comparisonSetKey = comparisonSetKeyFor(
    params.brandLoreFingerprint,
    params.brandLoreProfileVersion,
  );
  const planId = createHash('sha256')
    .update(`${comparisonSetKey}:${params.direction.directionId}:${MARKED_UP_COPY_BOARD_PLAN_VERSION}`)
    .digest('hex')
    .slice(0, 16);

  const assetManifest = buildAssetManifest(planId);
  const falAssets = assetManifest.filter((a) => a.classification.startsWith('FAL'));
  const isolated = assetManifest.filter((a) => a.backgroundRemovalRequired);
  const codeNative = assetManifest.filter(
    (a) => a.classification === 'CODE_NATIVE' || a.classification === 'SVG_NATIVE',
  );

  return {
    planId,
    boardPlanVersion: MARKED_UP_COPY_BOARD_PLAN_VERSION,
    comparisonSetKey,
    comparisonIndex: params.direction.comparisonIndex,
    directionId: params.direction.directionId,
    directionName: params.direction.directionName,
    sourceFormationId: params.direction.sourceFormationId,
    sourceFormationVersion: params.direction.sourceFormationVersion,
    bigIdea: MARKED_UP_COPY_LOCKED.bigIdea,
    thesis: MARKED_UP_COPY_LOCKED.thesis,
    governingBehavior: MARKED_UP_COPY_LOCKED.governingBehavior,
    artDirection: buildMarkedUpCopyArtDirectionSpec(),
    referenceDecompositions: MARKED_UP_COPY_REFERENCE_DECOMPOSITIONS,
    desktopMap: desktopMap(),
    mobileMap: mobileMap(),
    assetManifest,
    costEstimate: {
      assetsPlanned: assetManifest.length,
      referenceConditionedCalls: 0,
      textToImageCalls: falAssets.length,
      backgroundRemovalCalls: isolated.length,
      codeNativeAssets: codeNative.length,
      estimatedCostUsd: falAssets.length * FAL_COST + isolated.length * BIREFNET_COST,
    },
    createdAt: new Date().toISOString(),
  };
}

export function boardJobKey(plan: CreativeDirectionBoardPlan): string {
  return `${plan.comparisonSetKey}:${plan.directionId}:${plan.boardPlanVersion}`;
}

export function assetJobKey(
  plan: CreativeDirectionBoardPlan,
  entry: BoardAssetManifestEntry,
  promptHash: string,
): string {
  return `${boardJobKey(plan)}:${entry.manifestId}:${promptHash}`;
}

export function hashPrompt(prompt: string): string {
  return createHash('sha256').update(prompt).digest('hex').slice(0, 16);
}
