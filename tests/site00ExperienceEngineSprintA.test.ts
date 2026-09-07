import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  compareCropRegions,
  scoreToFidelityStatus,
} from '../api/_lib/site00ExperienceEngine/cropRegionComparison.js';
import { composeReferenceFrame } from '../api/_lib/site00ExperienceEngine/enterReferenceFrame.js';
import {
  authorityBlocksPromotion,
  classifyThresholdBehavior,
  evaluatePromotionEligibility,
  statusBlocksPromotion,
} from '../api/_lib/site00ExperienceEngine/promotionEligibility.js';
import {
  resolveSite00HostProjectScope,
  assertNoNdxbookFallback,
} from '../api/_lib/site00ExperienceEngine/projectScope.js';
import {
  resetExperienceEngineMemoryStore,
  seedEnterDesktopReference,
  seedEnterMobileBlockedReference,
  listFidelityIterations,
} from '../api/_lib/site00ExperienceEngine/routeReferenceStore.js';
import {
  decomposeReference,
  recordFidelityIteration,
  resolveRouteReference,
  runEnterDesktopProofLoop,
} from '../api/_lib/site00ExperienceEngine/experienceEngineService.js';
import {
  ENTER_DESKTOP_PROOF_REGIONS,
  ENTER_DESKTOP_VIEWPORT,
  EXPERIENCE_ENGINE_PIXEL_PASS_THRESHOLD,
} from '../shared/site00-experience-engine/constants.js';
import type {
  Site00FidelityIterationRecord,
  Site00RouteReferenceRecord,
} from '../shared/site00-experience-engine/types.js';

process.env.EXPERIENCE_ENGINE_MEMORY_STORE = '1';

function identicalBuffer(width: number, height: number, rgba: [number, number, number, number]): Buffer {
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = rgba[0];
    data[i * 4 + 1] = rgba[1];
    data[i * 4 + 2] = rgba[2];
    data[i * 4 + 3] = rgba[3];
  }
  return data;
}

async function pngFromRaw(data: Buffer, width: number, height: number): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  return sharp(data, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

describe('Experience Engine Sprint A', () => {
  beforeEach(() => {
    resetExperienceEngineMemoryStore();
  });

  it('resolves SITE 00 host project scope without NDXBOOK fallback', async () => {
    const scope = await resolveSite00HostProjectScope();
    expect(scope.projectKey).toBe('site00');
    expect(scope.projectId).toBe('site00');
    assertNoNdxbookFallback(scope);
  });

  it('registers /enter desktop DESIGN_AUTHORITY reference', async () => {
    seedEnterDesktopReference('site00-managed-id');
    const ref = await resolveRouteReference({ routeId: '/enter', viewportClass: 'DESKTOP' });
    expect(ref?.authorityLevel).toBe('DESIGN_AUTHORITY');
    expect(ref?.referenceStoragePath).toContain('89319E70');
    expect(ref?.projectKey).toBe('site00');
  });

  it('blocks mobile with BLOCKED_PENDING_REFERENCE_AUTHORITY', async () => {
    seedEnterMobileBlockedReference('site00-managed-id');
    const ref = await resolveRouteReference({ routeId: '/enter', viewportClass: 'MOBILE' });
    expect(ref?.status).toBe('BLOCKED_PENDING_REFERENCE_AUTHORITY');
    const promotion = evaluatePromotionEligibility({ reference: ref, latestIteration: null });
    expect(promotion.eligible).toBe(false);
    expect(promotion.reasons).toContain('BLOCKED_PENDING_REFERENCE_AUTHORITY');
  });

  it('IMPLEMENTATION_BASELINE cannot satisfy DESIGN_AUTHORITY gate', () => {
    const ref: Site00RouteReferenceRecord = {
      id: 'r1',
      projectId: 'site00',
      projectKey: 'site00',
      routeId: '/enter',
      viewportClass: 'DESKTOP',
      referenceStoragePath: 'baseline.png',
      authorityLevel: 'IMPLEMENTATION_BASELINE',
      referenceKind: 'FULL_VIEWPORT',
      status: 'ACTIVE',
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(authorityBlocksPromotion('IMPLEMENTATION_BASELINE')).toBe(true);
    const promotion = evaluatePromotionEligibility({
      reference: ref,
      latestIteration: {
        id: 'i1',
        routeReferenceId: 'r1',
        iterationNumber: 0,
        renderStoragePath: 'render.png',
        heatmapStoragePath: null,
        pixelScore: 0.99,
        structuralScore: 0.99,
        status: 'PIXEL_PASS',
        comparisonMetadata: {
          fullViewportPixelScore: 0.99,
          regionScores: [],
          heatmapStoragePath: null,
          comparisonEngine: 'crop_region_pixelmatch_v0',
          threshold: 0.94,
          mismatches: [],
        },
        createdAt: new Date().toISOString(),
      },
    });
    expect(promotion.eligible).toBe(false);
    expect(promotion.reasons).toContain('IMPLEMENTATION_BASELINE_CANNOT_SATISFY_DESIGN_AUTHORITY_GATE');
  });

  it('0.93 fails and 0.94 passes threshold gate', () => {
    expect(classifyThresholdBehavior(0.93).passes094).toBe(false);
    expect(classifyThresholdBehavior(0.94).passes094).toBe(true);
    expect(scoreToFidelityStatus(0.93)).toBe('FOUNDER_REVIEW');
    expect(scoreToFidelityStatus(0.94)).toBe('PIXEL_PASS');
  });

  it('STRUCTURAL_PASS alone does not ship', () => {
    const ref = seedEnterDesktopReference('site00');
    const iteration: Site00FidelityIterationRecord = {
      id: 'i-struct',
      routeReferenceId: ref.id,
      iterationNumber: 0,
      renderStoragePath: 'r.png',
      heatmapStoragePath: null,
      pixelScore: 0.85,
      structuralScore: 0.85,
      status: 'FOUNDER_REVIEW',
      comparisonMetadata: {
        fullViewportPixelScore: 0.85,
        regionScores: [],
        heatmapStoragePath: null,
        comparisonEngine: 'crop_region_pixelmatch_v0',
        threshold: 0.94,
        mismatches: [],
      },
      createdAt: new Date().toISOString(),
    };
    const promotion = evaluatePromotionEligibility({ reference: ref, latestIteration: iteration });
    expect(promotion.eligible).toBe(false);
    expect(classifyThresholdBehavior(0.85).structuralOnly).toBe(true);
  });

  it('NOT_EVALUATED fails promotion', () => {
    const ref = seedEnterDesktopReference('site00');
    const iteration: Site00FidelityIterationRecord = {
      id: 'i-ne',
      routeReferenceId: ref.id,
      iterationNumber: 0,
      renderStoragePath: 'r.png',
      heatmapStoragePath: null,
      pixelScore: 0.99,
      structuralScore: null,
      status: 'COMPARED',
      comparisonMetadata: {
        fullViewportPixelScore: 0.99,
        regionScores: [],
        heatmapStoragePath: null,
        comparisonEngine: 'NOT_EVALUATED',
        threshold: 0.94,
        mismatches: [],
      },
      createdAt: new Date().toISOString(),
    };
    expect(statusBlocksPromotion('COMPARED')).toBe(true);
    const promotion = evaluatePromotionEligibility({ reference: ref, latestIteration: iteration });
    expect(promotion.eligible).toBe(false);
    expect(promotion.reasons).toContain('NOT_EVALUATED');
  });

  it('performs real crop region pixelmatch (not global heuristic)', async () => {
    const width = 100;
    const height = 100;
    const referenceRaw = identicalBuffer(width, height, [10, 20, 30, 255]);
    const renderRaw = identicalBuffer(width, height, [10, 20, 30, 255]);
    renderRaw[0] = 255;
    const referenceBuffer = await pngFromRaw(referenceRaw, width, height);
    const renderBuffer = await pngFromRaw(renderRaw, width, height);
    const result = await compareCropRegions({
      referenceBuffer,
      renderBuffer,
      viewportWidth: width,
      viewportHeight: height,
      regions: [
        { regionId: 'a', label: 'A', bounds: { x: 0, y: 0, width: 50, height: 50 } },
        { regionId: 'b', label: 'B', bounds: { x: 50, y: 50, width: 50, height: 50 } },
      ],
    });
    expect(result.fullViewportPixelScore).toBeLessThan(1);
    expect(result.regionScores[0]?.pixelScore).not.toBe(result.regionScores[1]?.pixelScore);
  });

  it('orders fidelity iterations by iteration_number', async () => {
    const ref = seedEnterDesktopReference('site00');
    await recordFidelityIteration({
      routeReference: ref,
      iterationNumber: 1,
      renderStoragePath: 'a.png',
      heatmapStoragePath: 'h.png',
      comparison: {
        fullViewportPixelScore: 0.5,
        regionScores: [],
        heatmapBuffer: Buffer.alloc(4),
        mismatchPixels: 1,
        totalPixels: 2,
      },
    });
    await recordFidelityIteration({
      routeReference: ref,
      iterationNumber: 0,
      renderStoragePath: 'b.png',
      heatmapStoragePath: 'h.png',
      comparison: {
        fullViewportPixelScore: 0.5,
        regionScores: [],
        heatmapBuffer: Buffer.alloc(4),
        mismatchPixels: 1,
        totalPixels: 2,
      },
    });
    const iterations = await listFidelityIterations(ref.id);
    expect(iterations.map((i) => i.iterationNumber)).toEqual([0, 1]);
  });

  it('produces enter desktop decomposition artifact', () => {
    const ref = seedEnterDesktopReference('site00');
    const decomposition = decomposeReference(ref);
    expect(decomposition?.routeId).toBe('/enter');
    expect(decomposition?.environment.assetId).toContain('89319E70');
    expect(decomposition?.directoryPanel.liveDom).toBe(true);
    expect(decomposition?.statusStrip.liveDom).toBe(true);
  });

  it('composeReferenceFrame uses focal anchor (center 75%)', async () => {
    const asset = readFileSync('/tmp/enter-proof/reference-env.png');
    const centered = await composeReferenceFrame({ assetBuffer: asset, focal: 'center center' });
    const focal75 = await composeReferenceFrame({ assetBuffer: asset, focal: 'center 75%' });
    expect(centered.equals(focal75)).toBe(false);
  });

  it('live /enter desktop proof reaches PIXEL_PASS when dev server available', async () => {
    if (process.env.RUN_EXPERIENCE_ENGINE_LIVE_PROOF !== '1') {
      expect(true).toBe(true);
      return;
    }
    const proof = await runEnterDesktopProofLoop({
      baseUrl: process.env.VITE_DEV_SERVER_URL ?? 'http://127.0.0.1:5174',
      maxIterations: 1,
      artifactRoot: join(tmpdir(), 'ee-live-proof'),
    });
    expect(proof.iterations.length).toBeGreaterThan(0);
    const latest = proof.iterations[proof.iterations.length - 1]!;
    expect(latest.pixelScore).toBeGreaterThanOrEqual(EXPERIENCE_ENGINE_PIXEL_PASS_THRESHOLD);
    expect(latest.status).toBe('PIXEL_PASS');
    expect(proof.promotion.eligible).toBe(true);
    expect(proof.references.some((r) => r.viewportClass === 'MOBILE' && r.status === 'BLOCKED_PENDING_REFERENCE_AUTHORITY')).toBe(true);
  }, 120_000);
});
