/**
 * THE MARKED-UP COPY board pilot v2 — unit tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildMarkedUpCopyBoardPlanV2 } from './markedUpCopyBoardPlanV2.js';
import { composeBoardSvg, collectCompositorCopySnippets } from './boardCompositorV2.js';
import { inspectCreativeDirectionBoardV2, evaluateWordmarkRemovalHeuristic } from './boardInspectorV2.js';
import { containsForbiddenSiblingCopy, scanBoardCopyForContamination } from './markedUpCopyCopyContract.js';
import { buildReferenceInfluenceGraph } from './boardReferenceCrops.js';
import { buildFallbackBoardArtDirection } from './boardArtDirectionService.js';
import {
  MARKED_UP_COPY_BOARD_PLAN_VERSION_V2,
  MARKED_UP_COPY_DIRECTION_NAME,
} from './creativeDirectionBoardTypes.js';
import type { ComparisonDirectionCandidate } from './types.js';
import { inspectGeneratedBoardAsset } from './boardAssetInspector.js';

function completeDirection(): ComparisonDirectionCandidate {
  return {
    directionId: 'dir-marked-up-copy',
    directionName: MARKED_UP_COPY_DIRECTION_NAME,
    comparisonIndex: 1,
    sourceFormationId: '5db1b245-fe69-4287-acf7-e78417815fdf',
    sourceFormationVersion: 1,
    sourceDirectionIndex: 1,
    brandLoreProfileVersion: 24,
    brandLoreFingerprint: '5e71f429',
    fieldCompleteness: { complete: true, missingFields: [] },
    completionLineage: null,
    bigIdea: 'test',
    oneLineThesis: 'SOMEONE ALREADY READ THIS. THEY LEFT NOTES.',
    brandConnection: 'test',
    governingBehavior: 'live edit',
    loreLineage: ['worldMetaphor: annotation'],
    visualMetaphor: 'margin marks',
    conceptualAncestor: 'editorial',
    audienceRole: 'reader',
    brandRole: 'editor',
    materialImageryLanguage: 'paper',
    imageryLanguage: 'editorial',
    typographicAttitude: 'serif/sans',
    coreColorLogic: 'paper/ink',
    colorLogic: 'paper/ink',
    signatureDevices: ['strike'],
    primaryBrandArtifact: 'marked page',
    proprietaryQuality: 'live revision',
    antiDirection: [],
    risks: ['stock drift'],
    motionSeed: 'strike sequence',
    socialExpressionHypothesis: 'social edit',
  } as ComparisonDirectionCandidate;
}

describe('Marked-Up Copy board v2', () => {
  it('blocks incomplete direction in plan builder', () => {
    const d = completeDirection();
    d.fieldCompleteness = { complete: false, missingFields: ['loreLineage'] };
    expect(() =>
      buildMarkedUpCopyBoardPlanV2({
        direction: d,
        brandLoreFingerprint: '5e71f429',
        brandLoreProfileVersion: 24,
        dynamicArtDirection: buildFallbackBoardArtDirection({ direction: d, references: [] }),
        resolvedReferences: [],
        referenceCrops: [],
        referenceInfluenceGraph: [],
      }),
    ).toThrow(/INCOMPLETE/);
  });

  it('builds v2 plan with reference influence and hybrid artifact', () => {
    const d = completeDirection();
    const art = buildFallbackBoardArtDirection({ direction: d, references: [] });
    const plan = buildMarkedUpCopyBoardPlanV2({
      direction: d,
      brandLoreFingerprint: '5e71f429',
      brandLoreProfileVersion: 24,
      dynamicArtDirection: art,
      resolvedReferences: [
        {
          referenceId: 'ref-editorial-spread-modern',
          assetId: 'editorial_utility:feature_article_opener',
          source: 'SUPABASE_MANIFEST',
          storagePath: 'path',
          publicUrl: 'https://example.com/a.webp',
          mimeType: 'image/webp',
          width: 100,
          height: 100,
          founderNote: 'note',
          referenceRole: 'COMPOSITION',
        },
      ],
      referenceCrops: [
        {
          cropId: 'REF-COMP-01',
          sourceReferenceId: 'ref-editorial-spread-modern',
          sourceX: 0,
          sourceY: 0,
          cropWidth: 100,
          cropHeight: 100,
          purpose: 'comp',
          boardZone: 'heroEditorialSpread',
          influencedAssetIds: ['MU01'],
          storagePath: 'crop.webp',
          publicUrl: 'https://example.com/crop.webp',
        },
      ],
      referenceInfluenceGraph: buildReferenceInfluenceGraph({
        crops: [],
        references: [],
      }),
    });
    expect(plan.boardPlanVersion).toBe(MARKED_UP_COPY_BOARD_PLAN_VERSION_V2);
    expect(plan.assetManifest.some((a) => a.classification === 'HYBRID_COMPOSITION')).toBe(true);
    expect(plan.assetManifest.some((a) => a.referenceCropIds?.length)).toBe(true);
    expect(plan.costEstimate.referenceConditionedCalls).toBeGreaterThan(0);
  });

  it('rejects Countdown Room copy in board strings', () => {
    expect(containsForbiddenSiblingCopy('THE RANKING IS THE ARGUMENT').length).toBeGreaterThan(0);
    const scan = scanBoardCopyForContamination(collectCompositorCopySnippets());
    expect(scan.pass).toBe(true);
  });

  it('mobile map differs from desktop', () => {
    const d = completeDirection();
    const plan = buildMarkedUpCopyBoardPlanV2({
      direction: d,
      brandLoreFingerprint: '5e71f429',
      brandLoreProfileVersion: 24,
      dynamicArtDirection: buildFallbackBoardArtDirection({ direction: d, references: [] }),
      resolvedReferences: [],
      referenceCrops: [],
      referenceInfluenceGraph: [],
    });
    expect(plan.mobileMap.canvasWidth).toBe(390);
    expect(plan.desktopMap.canvasWidth).toBe(1440);
    expect(plan.mobileMap.canvasHeight).not.toBe(plan.desktopMap.canvasHeight);
  });

  it('board QA numeric scoring fails below 43', () => {
    const d = completeDirection();
    const plan = buildMarkedUpCopyBoardPlanV2({
      direction: d,
      brandLoreFingerprint: '5e71f429',
      brandLoreProfileVersion: 24,
      dynamicArtDirection: buildFallbackBoardArtDirection({ direction: d, references: [] }),
      resolvedReferences: [],
      referenceCrops: [],
      referenceInfluenceGraph: [],
    });
    const qa = inspectCreativeDirectionBoardV2({
      plan,
      board: {
        boardId: 'b',
        planId: plan.planId,
        boardPlanVersion: plan.boardPlanVersion,
        comparisonSetKey: plan.comparisonSetKey,
        comparisonIndex: 1,
        directionId: d.directionId,
        directionName: d.directionName,
        desktopBoardUrl: '',
        desktopBoardStoragePath: '',
        mobileBoardUrl: '',
        mobileBoardStoragePath: '',
        assetRecords: [],
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
          result: 'FAIL',
          notes: [],
        },
        founderVisible: false,
        productionState: 'FAILED',
        createdAt: new Date().toISOString(),
      },
      boardCopySnippets: collectCompositorCopySnippets(),
      wordmarkRemovalPass: false,
    });
    expect(qa.total).toBeLessThan(43);
    expect(qa.result).toBe('FAIL');
  });

  it('code-native asset inspect accepts without FAL success shortcut', async () => {
    const d = completeDirection();
    const plan = buildMarkedUpCopyBoardPlanV2({
      direction: d,
      brandLoreFingerprint: '5e71f429',
      brandLoreProfileVersion: 24,
      dynamicArtDirection: buildFallbackBoardArtDirection({ direction: d, references: [] }),
      resolvedReferences: [],
      referenceCrops: [],
      referenceInfluenceGraph: [],
    });
    const entry = plan.assetManifest.find((a) => a.role === 'SOCIAL_FRAME_SUBSTRATE')!;
    const report = await inspectGeneratedBoardAsset({
      imageUrl: 'https://example.com/x.svg',
      entry,
      plan,
    });
    expect(report.decision).toBe('ACCEPT');
  });

  it('wordmark removal heuristic recognizes revision language', () => {
    const d = completeDirection();
    const art = buildFallbackBoardArtDirection({ direction: d, references: [] });
    const plan = buildMarkedUpCopyBoardPlanV2({
      direction: d,
      brandLoreFingerprint: '5e71f429',
      brandLoreProfileVersion: 24,
      dynamicArtDirection: art,
      resolvedReferences: [],
      referenceCrops: [],
      referenceInfluenceGraph: [],
    });
    expect(evaluateWordmarkRemovalHeuristic(plan)).toBe(true);
  });
});
