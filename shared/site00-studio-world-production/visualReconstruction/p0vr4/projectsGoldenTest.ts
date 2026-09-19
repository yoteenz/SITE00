/**
 * P0.VR.4 — Projects red planet golden test case.
 */

import { PROJECTS_GOLDEN_TEST, PROJECTS_BULK_QUEUE_SEEDS } from './constants.js';
import {
  detectAndRegisterAssets,
  dispatchReconstructionGeneration,
  persistApprovedAssetToSupabase,
  applyAssetToLivePage,
} from './reconstructionPipeline.js';
import { approveAssetLoveIt } from './founderApproval.js';
import { getReconstructionAsset } from './assetStore.js';
import type { ApprovedScreenshotSource } from './types.js';

export function buildProjectsGoldenScreenshotSource(): ApprovedScreenshotSource {
  return {
    projectId: PROJECTS_GOLDEN_TEST.projectId,
    pageId: PROJECTS_GOLDEN_TEST.pageId,
    route: PROJECTS_GOLDEN_TEST.route,
    screenshotId: 'projects-approved-mobile-v1',
    screenshotUrl: '/visual-references/founder/site00/projects-index-approved-reference.jpg',
    referenceVersion: 'v1',
    approvedBy: 'founder',
    approvalStatus: 'APPROVED',
  };
}

export function runProjectsRedPlanetGoldenTest(): {
  passed: boolean;
  steps: Record<string, boolean>;
  assetId: string | null;
} {
  const source = buildProjectsGoldenScreenshotSource();
  const assets = detectAndRegisterAssets({
    source,
    hints: [
      {
        regionId: 'projects-header-planet',
        classification: 'HERO_OBJECT',
        bounds: PROJECTS_GOLDEN_TEST.cropRegion,
        labelHint: PROJECTS_GOLDEN_TEST.semanticName,
        confidenceHint: 'HIGH',
      },
      ...PROJECTS_BULK_QUEUE_SEEDS.slice(1).map((seed, i) => ({
        regionId: `bulk-${i + 2}`,
        classification: seed.assetType === 'NAV_ICON' ? ('NAV_ICON' as const) : ('PROJECT_VISUAL' as const),
        bounds: { x: 20 + i * 40, y: 200 + i * 80, width: 80, height: 80 },
        labelHint: seed.semanticName,
        confidenceHint: 'MODERATE' as const,
      })),
    ],
    screenshotBasePath: '/visual-references/founder/site00/projects-mobile-approved',
  });

  const planet = assets.find((a) => a.semanticName === PROJECTS_GOLDEN_TEST.semanticName);
  if (!planet) {
    return { passed: false, steps: { assetDetected: false }, assetId: null };
  }

  const dispatch = dispatchReconstructionGeneration({
    assetId: planet.assetId,
    explicitFounderAction: true,
    simulateOutputUrl: '/design-assets/site00/projects-index/hero_object/projects-header-planet/v001.png',
  });

  approveAssetLoveIt(planet.assetId);
  getReconstructionAsset(planet.assetId)!;

  const storagePath = `design-assets/site00/projects-index/hero_object/projects-header-planet/v001.png`;
  const supabaseUrl = `https://example.supabase.co/storage/v1/object/public/live-preview/${storagePath}`;

  persistApprovedAssetToSupabase({
    assetId: planet.assetId,
    supabaseUrl,
    storage: {
      bucket: 'live-preview',
      path: storagePath,
      mimeType: 'image/png',
      width: 120,
      height: 120,
      alpha: true,
      checksum: 'golden-test-checksum',
      createdAt: new Date().toISOString(),
    },
  });

  applyAssetToLivePage({
    assetId: planet.assetId,
    componentPath: PROJECTS_GOLDEN_TEST.componentPath,
    componentName: PROJECTS_GOLDEN_TEST.componentName,
    assetSlot: PROJECTS_GOLDEN_TEST.assetSlot,
    canonicalUrl: supabaseUrl,
  });

  const final = getReconstructionAsset(planet.assetId);

  const steps: Record<string, boolean> = {
    assetDetected: Boolean(planet),
    classifiedHeroObject: planet.assetType === 'HERO_OBJECT',
    cropExists: Boolean(planet.referenceCropRegion),
    gptImage2Dispatch: !dispatch.blocked,
    transparentOutput: Boolean(final?.generatedAssetUrl),
    founderApproved: final?.founderJudgment === 'LOVE_IT',
    supabasePersisted: final?.status === 'PERSISTED' || final?.status === 'BOUND' || final?.status === 'VERIFIED',
    liveBound: Boolean(final?.binding),
    liveVerified: final?.status === 'VERIFIED',
    bulkQueueSeeded: assets.length >= 2,
  };

  return {
    passed: Object.values(steps).every(Boolean),
    steps,
    assetId: planet.assetId,
  };
}
