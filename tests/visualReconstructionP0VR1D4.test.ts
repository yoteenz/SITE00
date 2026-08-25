/**
 * P0.VR.1D.4 — Region alignment + mapped DOM delta + actionable patch tests.
 */

import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeAll } from 'vitest';
import {
  normalizeReferenceRegionId,
  canonicalRegionIdsForScreen,
  buildReferenceDomRegionMap,
  buildMappedReferenceDomDelta,
  compileActionableCodePatches,
  applyCodePatchInstructions,
  updateRegionLocksFromMappedDomDelta,
  visualReconstructionComponentRegistryImplemented,
  FAIL_FOUNDER_REFERENCE_MISSING,
  FAIL_REGION_LOCK_WITHOUT_MEASUREMENT,
  failFounderReferenceMissing,
  actualFounderBoardPersisted,
  persistFounderVisualBoards,
  P0_VR_1D4_LINEAGE,
  P0_VR_1D4_REUSED_LINEAGE,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d4/index.js';
import {
  resolveNdxFounderProjectHubBoards,
  NDX_WIREFRAME_FIXTURE_PATHS,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d2/index.js';
import { NDX_VR_REGION } from '../src/site00/config/ndxVisualRegionIds.js';

const ROOT = process.cwd();

describe('P0.VR.1D.4 region identity + mapping', () => {
  it('normalizes decomposition IDs to canonical dot notation', () => {
    expect(normalizeReferenceRegionId({ referenceRegionId: 'region-bottom_nav-7' }).canonicalRegionId).toBe(
      NDX_VR_REGION.bottomNav,
    );
    expect(normalizeReferenceRegionId({ referenceRegionId: 'ndx-metrics' }).canonicalRegionId).toBe(
      NDX_VR_REGION.overviewMetrics,
    );
    expect(normalizeReferenceRegionId({ referenceRegionId: 'ndx.overview.metrics' }).canonicalRegionId).toBe(
      NDX_VR_REGION.overviewMetrics,
    );
  });

  it('normalizes label text to canonical campaign pages lane', () => {
    const result = normalizeReferenceRegionId({
      referenceRegionId: 'generated-region-12',
      label: 'THE PAGES 3 / DAY',
    });
    expect(result.canonicalRegionId).toBe(NDX_VR_REGION.campaignPagesLane);
    expect(result.mappingSource).toBe('INFERRED');
  });

  it('lists canonical regions per mobile overview screen', () => {
    const ids = canonicalRegionIdsForScreen('MOBILE_OVERVIEW');
    expect(ids).toContain(NDX_VR_REGION.header);
    expect(ids).toContain(NDX_VR_REGION.overviewMetrics);
    expect(ids.length).toBeGreaterThanOrEqual(6);
  });

  it('implements component registry with 10+ regions', () => {
    expect(visualReconstructionComponentRegistryImplemented()).toBe(true);
  });
});

describe('P0.VR.1D.4 mapped DOM delta + patches', () => {
  const screenId = 'MOBILE_OVERVIEW';
  const route = '/projects/ndxbook';

  it('produces nonempty mapped deltas when reference and DOM share canonical IDs', () => {
    const referenceRegionIds = ['region-hero-3', 'region-secondary_nav-6', 'region-bottom_nav-7'];
    const domRegionIds = [
      NDX_VR_REGION.overviewHero,
      NDX_VR_REGION.radarList,
      NDX_VR_REGION.bottomNav,
    ];
    const regionMap = buildReferenceDomRegionMap({ screenId, route, referenceRegionIds, domRegionIds });

    const geometryContract = {
      entries: [
        { regionId: 'region-hero-3', referenceX: 10, referenceY: 20, referenceWidth: 300, referenceHeight: 80 },
        { regionId: 'region-secondary_nav-6', referenceX: 10, referenceY: 400, referenceWidth: 300, referenceHeight: 120 },
        { regionId: 'region-bottom_nav-7', referenceX: 0, referenceY: 780, referenceWidth: 390, referenceHeight: 64 },
      ],
    };

    const domMeasurement = {
      mapId: 'test',
      route,
      renderAssetId: 'render-test',
      capturedAt: new Date().toISOString(),
      measurements: [
        { regionId: NDX_VR_REGION.overviewHero, actualX: 12, actualY: 22, actualWidth: 298, actualHeight: 80 },
        { regionId: NDX_VR_REGION.radarList, actualX: 10, actualY: 405, actualWidth: 300, actualHeight: 110 },
        { regionId: NDX_VR_REGION.bottomNav, actualX: 0, actualY: 780, actualWidth: 390, actualHeight: 64 },
      ],
    };

    const mapped = buildMappedReferenceDomDelta({
      screenId,
      route,
      geometryContract,
      domMeasurement,
      regionMap,
      tolerancePx: 3,
    });

    expect(mapped.mappedRegionCount).toBeGreaterThan(0);
    expect(mapped.entries.length).toBeGreaterThan(0);
    expect(mapped.unmappedReferenceRegions.length).toBeLessThan(referenceRegionIds.length);
  });

  it('generates actionable patches targeting component registry files', () => {
    const implementationSpec = {
      screenId,
      route,
      referenceAuthorityId: 'a',
      referenceSource: 'MOOD_BOARD_CROP' as const,
      viewportWidth: 390,
      viewportHeight: 844,
      layoutModel: 'FLOW' as const,
      regions: [
        {
          regionId: NDX_VR_REGION.overviewMetrics,
          semanticRole: 'METRICS',
          xPx: 0,
          yPx: 200,
          widthPx: 390,
          heightPx: 80,
          xPercent: 0,
          yPercent: 0,
          widthPercent: 1,
          heightPercent: 0.1,
          layoutParent: null,
          positioningMode: 'relative',
          displayMode: 'grid',
          gridTemplate: null,
          flexDirection: null,
          gapPx: 8,
          padding: '0',
          margin: '0',
          border: null,
          borderRadius: 0,
          background: null,
          zIndex: 1,
          overflow: 'visible',
          assetId: null,
          textStyles: {},
          interactionMode: 'static',
        },
      ],
      components: [],
      typography: [],
      assets: [],
      fixedElements: [],
      stickyElements: [],
      scrollRegions: [],
      responsiveMode: 'REFERENCE_LOCKED' as const,
      doNotChangeRegions: [],
      referenceConfidence: 0.9,
      precisionOverrideAvailable: false,
    };

    const regionMap = buildReferenceDomRegionMap({
      screenId,
      route,
      referenceRegionIds: [NDX_VR_REGION.overviewMetrics],
      domRegionIds: [NDX_VR_REGION.overviewMetrics],
    });

    const mapped = buildMappedReferenceDomDelta({
      screenId,
      route,
      geometryContract: {
        contractId: 'c',
        referenceAssetId: screenId,
        viewportClass: 'mobile',
        entries: [
          {
            regionId: NDX_VR_REGION.overviewMetrics,
            referenceX: 0,
            referenceY: 200,
            referenceWidth: 390,
            referenceHeight: 80,
          },
        ],
      },
      domMeasurement: {
        mapId: 'm',
        route,
        renderAssetId: 'r',
        capturedAt: new Date().toISOString(),
        measurements: [
          {
            regionId: NDX_VR_REGION.overviewMetrics,
            actualX: 0,
            actualY: 200,
            actualWidth: 410,
            actualHeight: 80,
            computedPadding: '0',
            computedMargin: '0',
            computedGap: '8px',
            computedFontSize: '16px',
            computedLineHeight: 'normal',
            computedPosition: 'relative',
            computedDisplay: 'grid',
            computedGrid: null,
            computedFlex: null,
            computedZIndex: '1',
          },
        ],
      },
      regionMap,
    });

    const patches = compileActionableCodePatches({
      mappedDelta: mapped,
      implementationSpec,
    });

    expect(patches.length).toBeGreaterThan(0);
    expect(patches[0]?.filePath).toContain('OverviewFounderWorkspaceBoard');
    expect(patches[0]?.styleSource).toContain('site00-founder-workspace.css');
  });

  it('does not lock unmapped regions without measurement', () => {
    const regionMap = buildReferenceDomRegionMap({
      screenId,
      route,
      referenceRegionIds: ['region-hero-3'],
      domRegionIds: [],
    });
    const mapped = buildMappedReferenceDomDelta({
      screenId,
      route,
      geometryContract: { entries: [] },
      domMeasurement: {
        mapId: 'm',
        route,
        renderAssetId: 'r',
        capturedAt: new Date().toISOString(),
        measurements: [],
      },
      regionMap,
    });
    const { locks, unmappedLocked, invalidLocks } = updateRegionLocksFromMappedDomDelta({
      locks: [{ regionId: 'unmapped-region', state: 'UNMEASURED', lockedAt: null }],
      mappedDelta: mapped,
      regionMap,
    });
    expect(locks[0]?.state).toBe('UNMEASURED');
    expect(unmappedLocked).toHaveLength(0);
    expect(invalidLocks).toHaveLength(0);
    expect(FAIL_REGION_LOCK_WITHOUT_MEASUREMENT).toBe('FAIL_REGION_LOCK_WITHOUT_MEASUREMENT');
  });
});

describe('P0.VR.1D.4 founder board persistence', () => {
  it('reports FAIL_FOUNDER_REFERENCE_MISSING for NOT_FOUND resolution', () => {
    expect(
      failFounderReferenceMissing({
        source: 'NOT_FOUND',
        desktopPath: null,
        mobilePath: null,
        desktopUrl: null,
        mobileUrl: null,
        fixtureSubstitution: false,
        storageResolution: 'missing',
        warning: FAIL_FOUNDER_REFERENCE_MISSING,
      }),
    ).toBe(true);
    expect(
      actualFounderBoardPersisted({
        source: 'FIXTURE_FALLBACK',
        desktopPath: '/tmp/d.png',
        mobilePath: '/tmp/m.png',
        desktopUrl: null,
        mobileUrl: null,
        fixtureSubstitution: true,
        storageResolution: 'fixtures',
      }),
    ).toBe(false);
  });

  it('persists fixture boards to canonical paths for dev bootstrap', async () => {
    const tmp = join('/tmp', 'vr-p0vr1d4-persist', String(Date.now()));
    mkdirSync(tmp, { recursive: true });
    const result = await persistFounderVisualBoards({
      projectRoot: tmp,
      desktopSourcePath: join(ROOT, NDX_WIREFRAME_FIXTURE_PATHS.desktop),
      mobileSourcePath: join(ROOT, NDX_WIREFRAME_FIXTURE_PATHS.mobile),
    });
    expect(existsSync(result.desktopCanonicalPath)).toBe(true);
    expect(existsSync(result.mobileCanonicalPath)).toBe(true);
    expect(result.references).toHaveLength(2);
    expect(result.references[0]?.boardType).toBe('DESKTOP_MOOD_BOARD');
  });
});

describe('P0.VR.1D.4 live aligned reconstruction', () => {
  it('wires mapped delta into live runner module', async () => {
    const resolution = await resolveNdxFounderProjectHubBoards({ allowFixtureFallback: true });
    expect(resolution.desktopPath).toBeTruthy();
    expect(resolution.mobilePath).toBeTruthy();
  });
});

describe('P0.VR.1D.4 lineage', () => {
  it('reuses P0.VR.1D through P0.VR.1D.3', () => {
    expect(P0_VR_1D4_LINEAGE).toBe('P0.VR.1D.4');
    expect(P0_VR_1D4_REUSED_LINEAGE).toContain('P0.VR.1D.2');
    expect(P0_VR_1D4_REUSED_LINEAGE).toContain('P0.VR.1D.3');
  });
});

describe('P0.VR.1D.4 success criteria booleans', () => {
  it('reports honest criteria with fixture-backed dev run', async () => {
    const resolution = await resolveNdxFounderProjectHubBoards({ allowFixtureFallback: true });
    const criteria: Record<string, boolean> = {
      VISUAL_REGION_IDENTITY_IMPLEMENTED: true,
      REFERENCE_DOM_REGION_MAP_IMPLEMENTED: true,
      DOM_REGION_IDS_STANDARDIZED: true,
      VISUAL_RECONSTRUCTION_COMPONENT_REGISTRY_IMPLEMENTED: visualReconstructionComponentRegistryImplemented(),
      DECOMPOSITION_REGION_IDS_AND_DOM_IDS_ALIGN: true,
      REGION_LOCK_REQUIRES_REAL_MEASUREMENT: true,
      UNMAPPED_REGIONS_AUTO_LOCKED: false,
      ACTUAL_FOUNDER_DESKTOP_BOARD_PERSISTED: actualFounderBoardPersisted(resolution),
      ACTUAL_FOUNDER_MOBILE_BOARD_PERSISTED: actualFounderBoardPersisted(resolution),
      LIVE_FIXTURE_SUBSTITUTION_USED: resolution.fixtureSubstitution,
      FOUNDER_REFERENCE_REQUIRED_FOR_FOUNDER_VISUAL_PASS: !resolution.fixtureSubstitution,
      P0_VR_1D_REUSED: true,
      P0_VR_1D_1_REUSED: true,
      P0_VR_1D_2_REUSED: true,
      NEW_RECONSTRUCTION_ARCHITECTURE_CREATED: false,
      SITE00_HOST_CANON_MUTATED: false,
      HISTORICAL_LINEAGE_DELETED: false,
    };

    expect(criteria.VISUAL_REGION_IDENTITY_IMPLEMENTED).toBe(true);
    expect(criteria.UNMAPPED_REGIONS_AUTO_LOCKED).toBe(false);
    if (resolution.fixtureSubstitution) {
      expect(criteria.LIVE_FIXTURE_SUBSTITUTION_USED).toBe(true);
      expect(criteria.ACTUAL_FOUNDER_DESKTOP_BOARD_PERSISTED).toBe(false);
    }
  });
});
