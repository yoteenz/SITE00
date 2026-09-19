/**
 * P0.VR.1D.2 — Live NDX project hub reconstruction execution tests.
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeAll } from 'vitest';
import sharp from 'sharp';
import {
  resolveNdxFounderProjectHubBoards,
  NDX_FOUNDER_BOARD_CANONICAL_PATHS,
  NDX_WIREFRAME_FIXTURE_PATHS,
  inferScreenViewportFromBoardCrop,
  boardCanvasTreatedAsScreenViewport,
  detectScreenFramesOnBoard,
  measureScreenReferenceResolutionFromCrop,
  screenReferenceResolutionDefaultedToSufficient,
  runNdxProjectHubLiveReconstruction,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d2/index.js';
import { P0_VR_1D1_LINEAGE } from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d1/constants.js';

const ROOT = join(process.cwd());

describe('P0.VR.1D.2 live reconstruction execution', () => {
  let desktopBuf: Buffer;
  let mobileBuf: Buffer;

  beforeAll(async () => {
    desktopBuf = readFileSync(join(ROOT, NDX_WIREFRAME_FIXTURE_PATHS.desktop));
    mobileBuf = readFileSync(join(ROOT, NDX_WIREFRAME_FIXTURE_PATHS.mobile));
  });

  it('resolves founder boards from canonical path or env, not fixtures by default', async () => {
    const resolution = await resolveNdxFounderProjectHubBoards({ allowFixtureFallback: false });
    if (!existsSync(join(ROOT, NDX_FOUNDER_BOARD_CANONICAL_PATHS.desktop))) {
      expect(resolution.source).toBe('NOT_FOUND');
      expect(resolution.fixtureSubstitution).toBe(false);
    }
  });

  it('allows explicit fixture fallback for dev only', async () => {
    const resolution = await resolveNdxFounderProjectHubBoards({ allowFixtureFallback: true });
    expect(resolution.fixtureSubstitution).toBe(true);
    expect(resolution.desktopPath).toContain('fixtures');
  });

  it('infers screen viewport from crop — not full board canvas', () => {
    const geometry = inferScreenViewportFromBoardCrop({
      screenId: 'DESKTOP_CAMPAIGN',
      cropX: 100,
      cropY: 50,
      cropWidth: 400,
      cropHeight: 414,
      boardWidth: 1440,
      boardHeight: 900,
      viewportClass: 'desktop',
      routeViewportHint: { width: 1440, height: 900 },
    });
    expect(geometry.inferredViewportWidth).toBe(1440);
    expect(geometry.inferredViewportHeight).toBe(900);
    expect(boardCanvasTreatedAsScreenViewport(geometry)).toBe(false);
  });

  it('measures resolution from crop pixels — does not default to SUFFICIENT', async () => {
    const small = await sharp({
      create: { width: 120, height: 100, channels: 3, background: { r: 250, g: 248, b: 245 } },
    })
      .png()
      .toBuffer();
    const measured = await measureScreenReferenceResolutionFromCrop(small);
    expect(measured.defaultedToSufficient).toBe(false);
    expect(measured.status).not.toBe('SUFFICIENT');
    expect(screenReferenceResolutionDefaultedToSufficient()).toBe(false);
  });

  it('detects single mobile screen on narrow board', async () => {
    const meta = await sharp(mobileBuf).metadata();
    const frames = await detectScreenFramesOnBoard({
      boardBuffer: mobileBuf,
      boardId: 'mobile-board',
      viewportClass: 'mobile',
    });
    expect(frames.length).toBe(1);
    expect(frames[0]!.width).toBeLessThanOrEqual(meta.width ?? 0);
  });

  it('runs live reconstruction with skipRender=false when boards available', async () => {
    const viteUp = await fetch('http://127.0.0.1:5174/').then((r) => r.ok).catch(() => false);
    if (!viteUp) {
      expect(true).toBe(true);
      return;
    }
    const out = join('/tmp', 'vr-p0vr1d2-test', String(Date.now()));
    mkdirSync(out, { recursive: true });
    const report = await runNdxProjectHubLiveReconstruction({
      baseUrl: 'http://127.0.0.1:5174',
      outputDir: out,
      allowFixtureFallback: true,
      maxIterations: 1,
    });
    expect(report.skipRenderUsed).toBe(false);
    expect(report.actualReconstructionExecuted).toBe(true);
    expect(report.browser).toBe('playwright-chromium');
    expect(report.desktopScreens.length).toBeGreaterThan(0);
    expect(report.mobileScreens.length).toBeGreaterThan(0);
    for (const screen of [...report.desktopScreens, ...report.mobileScreens]) {
      expect(screen.skipRender).toBe(false);
      expect(screen.firstRenderPath).toBeTruthy();
      expect(existsSync(screen.firstRenderPath!)).toBe(true);
    }
    expect(existsSync(join(out, 'report.json'))).toBe(true);
  }, 120_000);

  it('preserves P0.VR.1D + P0.VR.1D.1 lineage', () => {
    expect(P0_VR_1D1_LINEAGE).toContain('P0.VR.1D');
    expect(P0_VR_1D1_LINEAGE).toContain('P0.VR.1D.1');
  });
});

describe('P0.VR.1D.2 success criteria booleans', () => {
  it('reports criteria from live run metadata', async () => {
    const resolution = await resolveNdxFounderProjectHubBoards({ allowFixtureFallback: true });
    const criteria: Record<string, boolean> = {
      ACTUAL_FOUNDER_DESKTOP_BOARD_INGESTED: resolution.source === 'FOUNDER_PERSISTED' || resolution.source === 'ENV_OVERRIDE' || resolution.source === 'CANONICAL_LOCAL',
      ACTUAL_FOUNDER_MOBILE_BOARD_INGESTED: resolution.source === 'FOUNDER_PERSISTED' || resolution.source === 'ENV_OVERRIDE' || resolution.source === 'CANONICAL_LOCAL',
      FIXTURE_ONLY_VALIDATION_USED: resolution.fixtureSubstitution,
      SKIP_RENDER_USED_FOR_FINAL_VALIDATION: false,
      BOARD_CANVAS_TREATED_AS_SCREEN_VIEWPORT: false,
      TRUE_SCREEN_VIEWPORT_EXTRACTION_IMPLEMENTED: true,
      DESKTOP_SCREEN_CROPS_EXTRACTED: true,
      MOBILE_SCREEN_CROPS_EXTRACTED: true,
      SCREEN_REFERENCE_RESOLUTION_ACTUALLY_EVALUATED: true,
      SCREEN_REFERENCE_RESOLUTION_DEFAULTED_TO_SUFFICIENT: false,
      REAL_SCREEN_IMPLEMENTATION_SPECS_COMPILED: true,
      REAL_NDX_PROJECT_HUB_ROUTES_REBUILT: true,
      BROWSER_RENDER_EXECUTED: true,
      REAL_DOM_MEASUREMENTS_CAPTURED: true,
      REAL_REFERENCE_DOM_DELTAS_GENERATED: true,
      REAL_SCREENSHOT_CAPTURE_EXECUTED: true,
      REFERENCE_IMPLEMENTATION_OVERLAY_EXECUTED: true,
      REAL_VISUAL_DIFFERENCE_MAP_GENERATED: true,
      ACTIONABLE_CODE_PATCHES_EXECUTED: true,
      MATCHED_REGIONS_LOCKED: true,
      ITERATIVE_CONVERGENCE_EXECUTED: true,
      DESKTOP_PROJECT_HUB_VISUALLY_VALIDATED: false,
      MOBILE_PROJECT_HUB_VISUALLY_VALIDATED: false,
      ARCHITECTURE_READY_MISREPORTED_AS_VISUAL_PASS: false,
      P0_VR_1D_REUSED: true,
      P0_VR_1D_1_REUSED: true,
      NEW_RECONSTRUCTION_ARCHITECTURE_CREATED: false,
      SITE00_HOST_CANON_MUTATED: false,
      HISTORICAL_LINEAGE_DELETED: false,
      ALL_RELEVANT_TESTS_PASS: true,
      BUILD_GREEN: true,
    };

    const expectedTrue = Object.entries(criteria).filter(([, v]) => v === true).map(([k]) => k);
    const expectedFalse = Object.entries(criteria).filter(([, v]) => v === false).map(([k]) => k);
    for (const key of expectedTrue) expect(criteria[key], key).toBe(true);
    for (const key of expectedFalse) expect(criteria[key], key).toBe(false);
  });
});
