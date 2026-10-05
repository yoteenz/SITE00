/**
 * P0.VR.REPLICATION.3D — Authority coordinate map + grid lock.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildNdxAuthorityShellBlueprint } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication2/authorityShellBlueprint.js';
import { observationToLiteralRegionSpec, buildNdxHeroStructuralObservation } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3b/ndxStructuralVisionSeed.js';
import {
  buildAuthorityCoordinateMap,
  buildAuthorityGrid,
  buildGeometricTargets,
  computeGeometryDelta,
  executeGeometryLockPipeline,
  P0_VR_REPLICATION_3D_BUILD,
  NORMALIZED_COORD_SCALE,
  MAX_GEOMETRY_CORRECTION_PASSES,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3d/index.js';
import { generateLiteralRegionSourceWithGeometry } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3d/applyGeometryToLiteralSource.js';
import type { ReconstructionTwinSession } from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

function session(): ReconstructionTwinSession {
  return {
    sessionId: 'twin_3d',
    projectId: 'ndxbook',
    pageId: 'ndxbook:/projects/ndxbook/overview',
    viewport: 'mobile',
    canonicalRoute: '/projects/ndxbook/overview',
    twinRoute: '/twin',
    authorityVersionId: 'auth_v3d',
    beforeCaptureId: 'c',
    reconstructionPlanId: 'p',
    sourceLiveVersionId: 'live',
    twinVersionId: 'v331',
    mutationPolicy: 'READ_ONLY',
    functionContract: {
      route: '/',
      auth: [],
      permissions: [],
      dataQueries: [],
      mutations: [],
      forms: [],
      links: [],
      navigation: [],
      state: [],
      featureFlags: [],
      actions: [],
      businessRules: [],
    },
    reconstructionPlan: {
      planId: 'p',
      pagePurpose: 'overview',
      geometryChanges: [],
      spacingChanges: [],
      typographyChanges: [],
      assetChanges: [],
      componentChanges: [],
      functionPreservation: [],
      goal: '3d',
      measuredSpecId: null,
    },
    status: 'BUILDING',
    buildSteps: [],
    twinCapture: null,
    revisions: [],
    twinVersions: [],
    fidelityQa: [],
    promotionReadiness: null,
    responsiveImpact: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvedForPromotionAt: null,
    promotedAt: null,
  };
}

describe('P0.VR.REPLICATION.3D geometry lock', () => {
  it('exports build ref and normalized scale', () => {
    expect(P0_VR_REPLICATION_3D_BUILD).toBe('v332');
    expect(NORMALIZED_COORD_SCALE).toBe(10_000);
    expect(MAX_GEOMETRY_CORRECTION_PASSES).toBe(3);
  });

  it('builds AuthorityCoordinateMap with content viewport and bands', () => {
    const bp = buildNdxAuthorityShellBlueprint({
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      authorityVersionId: 'auth',
    });
    const heroSpec = observationToLiteralRegionSpec(buildNdxHeroStructuralObservation());
    const map = buildAuthorityCoordinateMap({ blueprint: bp, heroSpec, sourceAuthorityId: 'auth' });
    expect(map.elements.length).toBeGreaterThan(20);
    expect(map.authorityContentViewportBounds.heightPx).toBeGreaterThan(400);
    expect(map.regions.some((r) => r.regionId === 'hero-editorial')).toBe(true);
    expect(map.elements.some((e) => e.elementId === 'left_copy_region')).toBe(true);
    expect(map.elements.filter((e) => e.elementId.startsWith('module_nav:')).length).toBe(6);
    expect(map.elements.filter((e) => e.elementId.startsWith('metric_cell_')).length).toBe(4);
  });

  it('derives AuthorityGrid from map (not generic 12-col)', () => {
    const bp = buildNdxAuthorityShellBlueprint({
      pageId: 'p',
      viewport: 'mobile',
      authorityVersionId: 'a',
    });
    const map = buildAuthorityCoordinateMap({ blueprint: bp, heroSpec: null, sourceAuthorityId: 'a' });
    const grid = buildAuthorityGrid(map);
    expect(grid.columnCount).toBe(3);
    expect(grid.columnWidths.length).toBe(3);
    expect(grid.columnWidths[0]).toBeCloseTo(0.38, 2);
  });

  it('computes GeometryDelta edge errors', () => {
    const bp = buildNdxAuthorityShellBlueprint({ pageId: 'p', viewport: 'mobile', authorityVersionId: 'a' });
    const map = buildAuthorityCoordinateMap({ blueprint: bp, heroSpec: null, sourceAuthorityId: 'a' });
    const targets = buildGeometricTargets(map);
    const t = targets.find((x) => x.elementId === 'left_copy_region');
    expect(t).toBeTruthy();
    const delta = computeGeometryDelta({
      target: t!,
      rendered: { elementId: t!.elementId, ...t!.targetBoundsPx, left: t!.targetBoundsPx.x + 8, top: t!.targetBoundsPx.y, right: 0, bottom: 0 },
      map,
    });
    expect(delta.leftEdgeError).toBe(8);
    expect(delta.withinTolerance).toBe(false);
  });

  it('literal source generator consumes geometry map', () => {
    const bp = buildNdxAuthorityShellBlueprint({ pageId: 'p', viewport: 'mobile', authorityVersionId: 'a' });
    const heroSpec = observationToLiteralRegionSpec(buildNdxHeroStructuralObservation());
    const map = buildAuthorityCoordinateMap({ blueprint: bp, heroSpec, sourceAuthorityId: 'a' });
    const grid = buildAuthorityGrid(map);
    const plan = {
      planId: 'x',
      regionId: 'hero-editorial',
      authorityGrid: grid,
      targetElements: [],
      cssStrategy: 'CSS_GRID' as const,
      overlayElements: [],
      dynamicContentPolicy: 'LINE_CLAMP' as const,
      tolerancePolicy: { bandPositionPx: 4, bandSizePx: 6, internalPx: 4, navPx: 3, textPx: 3 },
    };
    const cssPatch = { '--vlt-hero-grid-template': '38fr 34fr 28fr', '--vlt-hero-min-height-px': '210' };
    const src = generateLiteralRegionSourceWithGeometry({
      spec: heroSpec,
      assetSlots: [],
      map,
      grid,
      plan,
      cssPatch,
    });
    expect(src.geometryConsumed).toBe(true);
    expect(src.cssGridTemplate).toContain('210px');
  });

  it('executeGeometryLockPipeline produces fidelity receipt and css patch', () => {
    const bp = buildNdxAuthorityShellBlueprint({
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      authorityVersionId: 'auth_v3d',
    });
    const heroSpec = observationToLiteralRegionSpec(buildNdxHeroStructuralObservation());
    const result = executeGeometryLockPipeline({
      session: session(),
      shellBlueprint: bp,
      heroSpec,
      assetSlots: [],
      priorTwinVersionId: 'v331',
    });
    expect(result.report.fidelityReceipts[0]?.targetCount).toBeGreaterThan(0);
    expect(result.sessionPatch.twinGeometryCssPatch?.['--vlt-hero-min-height-px']).toBeTruthy();
    expect(result.report.correctionPasses.length).toBeLessThanOrEqual(3);
  });

  it('does not use whole-screen background cheat', () => {
    const twin = read('src/site00/components/reconstruction/VisionLiteralNdxOverviewTwin.tsx');
    expect(twin).not.toContain('backgroundImage: url(authority');
    expect(twin).not.toMatch(/background.*designAuthority/i);
  });

  it('upgrade UX exposes geometry panel', () => {
    const ux = read('src/site00/components/designWorkspace/pageFamily/PageUpgradeReplicationExperience.tsx');
    expect(ux).toContain('GeometryPanel');
    expect(ux).toContain('GEOMETRY');
  });
});
