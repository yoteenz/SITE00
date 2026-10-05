/**
 * THE MARKED-UP COPY board pilot — unit tests (mocked FAL, no other directions touched).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildMarkedUpCopyBoardPlan, hashPrompt } from './markedUpCopyBoardPlan.js';
import { composeBoardSvg } from './boardCompositor.js';
import { inspectCreativeDirectionBoard } from './boardInspector.js';
import { MARKED_UP_COPY_DIRECTION_NAME } from './creativeDirectionBoardTypes.js';
import type { ComparisonDirectionCandidate } from './types.js';

function mockDirection(): ComparisonDirectionCandidate {
  return {
    directionId: 'dir-marked-up-copy',
    directionName: MARKED_UP_COPY_DIRECTION_NAME,
    comparisonIndex: 1,
    sourceFormationId: '5db1b245-fe69-4287-acf7-e78417815fdf',
    sourceFormationVersion: 1,
    sourceDirectionIndex: 1,
    brandLoreProfileVersion: 24,
    brandLoreFingerprint: '5e71f429',
    fieldCompleteness: { complete: false, missingFields: ['brandConnection'] },
    completionLineage: null,
    bigIdea: 'test',
    oneLineThesis: 'test thesis',
    brandConnection: '',
    culturalReference: '',
    emotionalPromise: '',
    visualMetaphor: '',
    governingBehavior: '',
    materialImageryLanguage: '',
    typographicAttitude: '',
    coreColorLogic: '',
    signatureDevices: [],
    primaryBrandArtifact: '',
    proprietaryQuality: '',
    antiDirection: [],
    loreLineage: [],
    conceptualAncestor: '',
    audienceRole: '',
    brandRole: '',
    imageryLanguage: '',
    colorLogic: '',
    motionSeed: '',
    socialExpressionHypothesis: '',
    risks: [],
  } as ComparisonDirectionCandidate;
}

describe('Marked-Up Copy board plan', () => {
  it('builds plan with manifest before generation', () => {
    const plan = buildMarkedUpCopyBoardPlan({
      direction: mockDirection(),
      brandLoreFingerprint: '5e71f429',
      brandLoreProfileVersion: 24,
    });
    expect(plan.directionName).toBe(MARKED_UP_COPY_DIRECTION_NAME);
    expect(plan.assetManifest.length).toBe(6);
    expect(plan.desktopMap.placements.length).toBeGreaterThan(4);
    expect(plan.mobileMap.canvasWidth).toBe(390);
    expect(plan.desktopMap.canvasWidth).toBe(1440);
    expect(plan.costEstimate.textToImageCalls).toBe(4);
    expect(plan.costEstimate.codeNativeAssets).toBe(2);
  });

  it('rejects non-pilot directions', () => {
    const d = mockDirection();
    d.directionName = 'THE COUNTDOWN ROOM';
    expect(() =>
      buildMarkedUpCopyBoardPlan({
        direction: d,
        brandLoreFingerprint: '5e71f429',
        brandLoreProfileVersion: 24,
      }),
    ).toThrow(/Pilot locked/);
  });

  it('every manifest asset has board role and placement', () => {
    const plan = buildMarkedUpCopyBoardPlan({
      direction: mockDirection(),
      brandLoreFingerprint: '5e71f429',
      brandLoreProfileVersion: 24,
    });
    for (const entry of plan.assetManifest) {
      expect(entry.role).toBeTruthy();
      expect(entry.desktopPlacement.zoneId).toBe(entry.zoneId);
      expect(entry.mobilePlacement.zoneId).toBe(entry.zoneId);
      expect(entry.prompt.length).toBeGreaterThan(20);
    }
  });

  it('desktop and mobile maps differ', () => {
    const plan = buildMarkedUpCopyBoardPlan({
      direction: mockDirection(),
      brandLoreFingerprint: '5e71f429',
      brandLoreProfileVersion: 24,
    });
    expect(plan.desktopMap.canvasWidth).not.toBe(plan.mobileMap.canvasWidth);
    expect(plan.desktopMap.canvasHeight).not.toBe(plan.mobileMap.canvasHeight);
  });

  it('code-native assets do not use FAL for exact text', () => {
    const plan = buildMarkedUpCopyBoardPlan({
      direction: mockDirection(),
      brandLoreFingerprint: '5e71f429',
      brandLoreProfileVersion: 24,
    });
    const social = plan.assetManifest.find((a) => a.role === 'SOCIAL_FRAME_SUBSTRATE');
    const motion = plan.assetManifest.find((a) => a.role === 'MOTION_KEYFRAME_SUBSTRATE');
    expect(social?.classification).toBe('CODE_NATIVE');
    expect(motion?.classification).toBe('SVG_NATIVE');
  });

  it('isolated assets declare background removal', () => {
    const plan = buildMarkedUpCopyBoardPlan({
      direction: mockDirection(),
      brandLoreFingerprint: '5e71f429',
      brandLoreProfileVersion: 24,
    });
    const isolated = plan.assetManifest.filter((a) => a.backgroundRemovalRequired);
    expect(isolated.length).toBe(2);
  });
});

describe('Board compositor', () => {
  it('composes deterministic SVG with code-native typography', () => {
    const plan = buildMarkedUpCopyBoardPlan({
      direction: mockDirection(),
      brandLoreFingerprint: '5e71f429',
      brandLoreProfileVersion: 24,
    });
    const svg = composeBoardSvg({ plan, map: plan.desktopMap, assets: [] });
    expect(svg).toContain('typographic-interruption');
    expect(svg).toContain('THE CLAIM IS STILL BEING ARGUED');
    expect(svg).toContain('text-decoration="line-through"');
    expect(svg).toContain('motion-seed');
  });
});

describe('Board idempotency', () => {
  it('stable prompt hash for same prompt', () => {
    const h1 = hashPrompt('test prompt');
    const h2 = hashPrompt('test prompt');
    expect(h1).toBe(h2);
  });
});

describe('Board QA gate', () => {
  it('fails incomplete board', () => {
    const plan = buildMarkedUpCopyBoardPlan({
      direction: mockDirection(),
      brandLoreFingerprint: '5e71f429',
      brandLoreProfileVersion: 24,
    });
    const qa = inspectCreativeDirectionBoard({
      plan,
      board: {
        boardId: 'b1',
        planId: plan.planId,
        boardPlanVersion: plan.boardPlanVersion,
        comparisonSetKey: plan.comparisonSetKey,
        comparisonIndex: 1,
        directionId: plan.directionId,
        directionName: plan.directionName,
        desktopBoardUrl: '',
        desktopBoardStoragePath: 'a',
        mobileBoardUrl: '',
        mobileBoardStoragePath: 'b',
        assetRecords: [],
        qaReport: {} as never,
        founderVisible: false,
        productionState: 'NEEDS_HUMAN_REVIEW',
        createdAt: new Date().toISOString(),
      },
    });
    expect(qa.result).not.toBe('PASS');
  });
});

describe('Pilot scope guard', () => {
  it('only Marked-Up Copy direction name is pilot target', () => {
    expect(MARKED_UP_COPY_DIRECTION_NAME).toBe('THE MARKED-UP COPY');
  });
});
