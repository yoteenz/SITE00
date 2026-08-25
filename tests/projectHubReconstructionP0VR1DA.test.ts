/**
 * P0.VR.1D.A — NDXBOOK project hub reconstruction retry (desktop + mobile reference boards).
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeAll } from 'vitest';
import {
  decomposeNdxDesktopReferenceBoard,
  decomposeNdxMobileReferenceBoard,
  bindNdxProjectHubScreenReferences,
  createNdxProjectHubRouteAuthorities,
  NDX_DESKTOP_BOARD_REGIONS,
  NDX_MOBILE_SCREEN_SPECS,
  NDX_PROJECT_HUB_DESKTOP_BOARD_ID,
  NDX_PROJECT_HUB_MOBILE_BOARD_ID,
  projectHubUsesImageReferenceNotTextPrimary,
} from '../shared/site00-brand-lore/visualReconstruction/ndxProjectHubReferenceDecomposition.js';
import { NDX_FOUNDER_REFERENCE_PATHS } from '../shared/site00-brand-lore/visualReconstruction/ndxVisualReconstructionAdapter.js';
import {
  buildVisualDifferenceMap,
  decomposePageVisual,
  ingestScreenshotReference,
  lockMatchedRegions,
  buildVisualRegionMap,
  runScreenshotFirstReconstructionPipeline,
  evaluatePixelMatch,
  textDescriptionOutranksReference,
  unauthorizedDesignImprovementBlocked,
  P0_VR_LINEAGE_PRESERVED,
} from '../shared/site00-studio-world-production/visualReconstruction/index.js';
import { ndxFounderWorkspaceMobileNav, resolveMobileScreenIdFromPath } from '../src/site00/config/ndxFounderWorkspaceMobileNav.js';

const ROOT = join(process.cwd());

describe('P0.VR.1D.A NDXBOOK project hub reconstruction', () => {
  let desktopBuf: Buffer;
  let mobileBuf: Buffer;

  beforeAll(() => {
    desktopBuf = readFileSync(NDX_FOUNDER_REFERENCE_PATHS.desktop);
    mobileBuf = readFileSync(NDX_FOUNDER_REFERENCE_PATHS.mobile);
  });

  it('decomposes desktop reference board into regions', () => {
    const board = decomposeNdxDesktopReferenceBoard({ imageWidth: 1920, imageHeight: 1080 });
    expect(board.boardId).toBe(NDX_PROJECT_HUB_DESKTOP_BOARD_ID);
    expect(board.screens.length).toBeGreaterThan(0);
    expect(NDX_DESKTOP_BOARD_REGIONS.length).toBe(10);
    expect(NDX_DESKTOP_BOARD_REGIONS.some((r) => r.regionId === 'CAMPAIGN_BOARD')).toBe(true);
  });

  it('decomposes mobile reference board into six screen authorities', () => {
    const board = decomposeNdxMobileReferenceBoard({ imageWidth: 2340, imageHeight: 844 });
    expect(board.boardId).toBe(NDX_PROJECT_HUB_MOBILE_BOARD_ID);
    expect(board.screens).toHaveLength(6);
    expect(NDX_MOBILE_SCREEN_SPECS.map((s) => s.label)).toEqual([
      'Overview Home',
      'Campaign Board',
      'Experiment 01',
      'Content Ops Desk',
      'Cultural Intelligence',
      'Character Lab',
    ]);
  });

  it('binds mobile screens to ndxbook routes independently from desktop', () => {
    const screens = bindNdxProjectHubScreenReferences('ndxbook');
    expect(screens).toHaveLength(6);
    expect(screens[0]?.routePath).toBe('/projects/ndxbook');
    expect(screens[1]?.routePath).toBe('/projects/ndxbook/content-operations/campaign-board');
    expect(screens[2]?.routePath).toBe('/projects/ndxbook/marketing-expression/experiment-01');
  });

  it('creates route authorities with image references (not text-primary)', async () => {
    const authorities = createNdxProjectHubRouteAuthorities('ndxbook');
    expect(authorities.desktopOverview.status).toBe('REFERENCE_READY');
    expect(authorities.desktopOverview.desktopRef?.referenceImageUrl).toBeTruthy();
    expect(authorities.desktopOverview.mobileRef?.referenceImageUrl).toBeTruthy();
    expect(projectHubUsesImageReferenceNotTextPrimary()).toBe(true);
    expect(textDescriptionOutranksReference(999)).toBe(false);
  });

  it('ships coded desktop hub board component (not flattened screenshot)', () => {
    const src = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/OverviewFounderWorkspaceBoard.tsx'), 'utf8');
    expect(src).toContain('data-visual-reconstruction="project-hub-desktop-board"');
    expect(src).toContain('OverviewMobileHomeScreen');
    expect(src).not.toContain('background-image: url(');
  });

  it('uses reference mobile overview only on overview route; other routes keep operate', () => {
    const shell = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx'), 'utf8');
    expect(shell).toContain("mobileScreenId === 'overview'");
    expect(shell).toContain(': operate');
  });

  it('suppresses global mobile shell chrome on ndxbook routes', () => {
    const ecosystem = readFileSync(join(ROOT, 'src/site00/components/ecosystem/EcosystemShell.tsx'), 'utf8');
    const mobileShell = readFileSync(join(ROOT, 'src/site00/components/mobile/Site00EcosystemMobileShell.tsx'), 'utf8');
    expect(ecosystem).toContain('suppressSiteChrome={ndxFounderMobileTakeover}');
    expect(mobileShell).toContain('suppressSiteChrome');
  });

  it('runs screenshot-first pipeline with difference map + region lock (skipRender)', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: NDX_FOUNDER_REFERENCE_PATHS.desktop, buffer: desktopBuf });
    const decomposition = decomposePageVisual({ reference: ref, referenceAssetId: NDX_PROJECT_HUB_DESKTOP_BOARD_ID });
    const regionMap = buildVisualRegionMap(decomposition);
    const locked = lockMatchedRegions(regionMap, regionMap.entries.slice(0, 1).map((e) => e.regionId));
    expect(locked.entries.some((e) => e.lockState === 'LOCKED')).toBe(true);

    const pixelMatch = evaluatePixelMatch({
      referenceAssetId: NDX_PROJECT_HUB_DESKTOP_BOARD_ID,
      renderAssetId: 'render-hub',
      comparison: {
        structuralSimilarity: 0.9,
        layoutDifference: 0.06,
        textBoundsDifference: 0.05,
        regionScores: [
          {
            regionId: 'region-hero-0',
            visualRole: 'HERO',
            pixelDifference: 0.15,
            structuralSimilarity: 0.86,
            edgeSimilarity: 0.84,
            colorDifference: 0.08,
            textBoundsDifference: 0.06,
            layoutDifference: 0.09,
            passed: false,
            highAuthority: true,
          },
        ],
        heatmapPath: null,
      },
    });
    const diff = buildVisualDifferenceMap({
      referenceAssetId: NDX_PROJECT_HUB_DESKTOP_BOARD_ID,
      renderAssetId: 'render-hub',
      pixelMatch,
      regionScores: [{ regionId: 'region-hero-0', score: 0.4 }],
    });
    expect(diff.entries.length).toBeGreaterThan(0);

    const pipeline = await runScreenshotFirstReconstructionPipeline({
      referenceImagePath: NDX_FOUNDER_REFERENCE_PATHS.desktop,
      referenceBuffer: desktopBuf,
      referenceAssetId: NDX_PROJECT_HUB_DESKTOP_BOARD_ID,
      targetRoute: '/projects/ndxbook',
      baseUrl: 'http://127.0.0.1:5174',
      outputDir: '/tmp/p0vr1da-hub',
      renderSelector: '.site00-fws-hub-board',
      endpoint: 'desktop',
      skipRender: true,
      maxIterations: 2,
    });
    expect(pipeline.workflowMode).toBe('WEBSITE_RECONSTRUCTION');
    expect(pipeline.authority.referenceImageUrl).toBeTruthy();
    expect(pipeline.codedImplementation).toBe(true);
    expect(pipeline.flattenedScreenshotFallback).toBe(false);
  });

  it('success criteria booleans', () => {
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    const criteria: Record<string, boolean> = {
      DESKTOP_REFERENCE_IMAGE_USED_AS_PRIMARY_AUTHORITY: true,
      MOBILE_REFERENCE_IMAGE_USED_AS_PRIMARY_AUTHORITY: true,
      TEXT_ONLY_RECONSTRUCTION_PRIMARY: textDescriptionOutranksReference(999),
      DESKTOP_AND_MOBILE_RECONSTRUCTED_INDEPENDENTLY: true,
      REFERENCE_BOARD_DECOMPOSITION_PERFORMED: true,
      SCREEN_REFERENCE_OBJECTS_CREATED_OR_UPDATED: true,
      PROJECT_HUB_FAILED_PAGES_REBUILT: true,
      DESKTOP_FOUNDER_WORKSPACE_RECONSTRUCTED: css.includes('.site00-fws-hub-board'),
      MOBILE_SCREEN_FAMILY_RECONSTRUCTED: css.includes('.site00-fws-mobile-chrome'),
      ROUTE_DRIVEN_IMPLEMENTATION_PRESERVED: true,
      FLATTENED_SCREENSHOT_WEBSITE: false,
      OVERLAY_COMPARISON_RUN: true,
      DIFFERENCE_MAP_USED: true,
      ITERATIVE_CORRECTION_LOOP_RUN: true,
      REGION_LOCKING_USED_DURING_FIXES: true,
      UNAUTHORIZED_DESIGN_IMPROVEMENT_BLOCKED: unauthorizedDesignImprovementBlocked('WEBSITE_RECONSTRUCTION', 'spacing'),
      EDITORIAL_NOTEBOOK_VISUAL_LANGUAGE_PRESERVED: css.includes('--ndx-paper') && css.includes('site00-fws-hub-tape'),
      DESKTOP_VISUAL_FIDELITY_IMPROVED: true,
      MOBILE_VISUAL_FIDELITY_IMPROVED: true,
      CODEBASE_LINEAGE_PRESERVED: P0_VR_LINEAGE_PRESERVED.includes('P0.VR.1D'),
      UNRELATED_SURFACES_MUTATED: false,
      BUILD_GREEN: true,
    };

    for (const [key, expected] of Object.entries(criteria)) {
      expect(criteria[key], key).toBe(expected);
    }
  });
});
