/**
 * P0.VR.DIAG.1R5 — Internal region structure + child-anchor forensics.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  P0_VR_DIAG_1R5A_BUILD,
  resetDimensionEvidenceCounterForTest,
  resetForensicsEvidenceCounterForTest,
  runAuthorityRelativeForensics,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/index.js';
import {
  analyzeMissingForensicEvidence,
  resetRecoveryHistoryForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1R4/index.js';
import {
  extractCurrentRegionStructure,
  extractAuthorityRegionStructure,
  buildInternalStructureMeasurements,
  internalMeasurementsToDimensionEvidence,
  formatTypedDimensionValue,
  compareTypedDimensions,
  computeInternalStructureCompleteness,
  resolveComplexRegionSubtype,
  deriveEvidenceRecoveryFailure,
  repairDimensionTypesOnBundles,
  buildStructureHierarchyPreview,
  resetInternalStructureEvidenceCounterForTest,
  resetRegionInternalStructureRegistryForTest,
  getRegionInternalStructure,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1R5/index.js';
import { resolvePageRegionLayoutProfile } from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/pageRegionLayoutProfiles.js';
import { isRegionDepthSufficient } from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/forensicDepthQualification.js';

const SHELL = {
  headerHeightPx: 52,
  headerPaddingX: 14,
  contentPaddingX: 14,
  sectionGap: 10,
  bottomNavHeightPx: 52,
  viewportWidth: 390,
  viewportHeight: 844,
};

const SHALLOW_QA_DOM = [
  { regionId: 'ndx.overview.header-shell', actualX: 0, actualY: 47, actualWidth: 390, actualHeight: 41, computedFontSize: '14px' },
  { regionId: 'ndx.overview.hero', actualX: 14, actualY: 100, actualWidth: 320, actualHeight: 120, computedFontSize: '22px' },
  { regionId: 'ndx.overview.kpis', actualX: 14, actualY: 240, actualWidth: 362, actualHeight: 40 },
  { regionId: 'ndx.overview.production', actualX: 14, actualY: 320, actualWidth: 362, actualHeight: 140 },
  { regionId: 'ndx.overview.content-shell', actualX: 14, actualY: 480, actualWidth: 362, actualHeight: 56, computedGap: '8px' },
  { regionId: 'ndx.overview.kpi.audience', actualX: 14, actualY: 560, actualWidth: 362, actualHeight: 64 },
  { regionId: 'ndx.overview.radar', actualX: 14, actualY: 640, actualWidth: 362, actualHeight: 120 },
  { regionId: 'ndx.overview.bottom-nav-shell', actualX: 0, actualY: 765, actualWidth: 390, actualHeight: 79 },
];

describe('P0.VR.DIAG.1R5 internal structure', () => {
  beforeEach(() => {
    resetForensicsEvidenceCounterForTest();
    resetDimensionEvidenceCounterForTest();
    resetRecoveryHistoryForTest();
    resetInternalStructureEvidenceCounterForTest();
    resetRegionInternalStructureRegistryForTest();
  });

  it('build constant', () => {
    expect(P0_VR_DIAG_1R5A_BUILD).toBe('v308');
  });

  it('section nav internal model resolves items, active item, indicator', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' });
    const def = profile.regions.find((r) => r.regionType === 'NAVIGATION')!;
    const dom = SHALLOW_QA_DOM.find((d) => d.regionId === def.regionId)!;
    const structure = extractCurrentRegionStructure({ def, dom, relatedDom: [] });
    expect(structure.status).not.toBe('UNRESOLVED');
    expect(structure.groups.some((g) => g.groupType === 'NAV_ITEMS')).toBe(true);
    expect(structure.childAnchors.some((a) => a.anchorType === 'ACTIVE_INDICATOR')).toBe(true);
    const preview = buildStructureHierarchyPreview(structure);
    expect(preview.some((l) => l.includes('ITEM'))).toBe(true);
  });

  it('metric cells model + count formatting not pixels', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' });
    const def = profile.regions.find((r) => r.regionType === 'METRICS')!;
    const dom = SHALLOW_QA_DOM.find((d) => d.regionId === def.regionId) ?? SHALLOW_QA_DOM[2]!;
    const structure = extractCurrentRegionStructure({ def, dom, relatedDom: [] });
    expect(structure.groups.some((g) => g.groupType === 'METRIC_CELLS')).toBe(true);
    const auth = extractAuthorityRegionStructure({ def, authority: { regionId: def.regionId, regionName: def.regionName, category: 'METRICS', geometry: { x: 0, y: 0, width: 362, height: 64, widthPct: 1, heightPct: 0.08, xPct: 0, yPct: 0.3 } } });
    const measurements = buildInternalStructureMeasurements(auth, structure);
    const cellCount = measurements.find((m) => m.measurementType === 'cellCount');
    expect(cellCount?.valueType).toBe('COUNT');
    const formatted = formatTypedDimensionValue(cellCount!.currentValue, 'COUNT');
    expect(formatted).toMatch(/items?/);
    expect(formatted).not.toMatch(/px$/);
  });

  it('progress band resolves track, fill, phase block', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' });
    const def = profile.regions.find((r) => r.regionType === 'STATUS')!;
    const dom = SHALLOW_QA_DOM.find((d) => d.regionId === def.regionId) ?? SHALLOW_QA_DOM[4]!;
    const structure = extractCurrentRegionStructure({ def, dom });
    const types = structure.childAnchors.map((a) => a.anchorType);
    expect(types).toContain('TRACK');
    expect(types).toContain('FILL');
  });

  it('typed dimension comparator count delta', () => {
    const cmp = compareTypedDimensions({
      measurementType: 'itemCount',
      valueType: 'COUNT',
      authorityValue: 5,
      currentValue: 4,
    });
    expect(cmp.delta).toMatch(/-1/);
    expect(cmp.delta).not.toMatch(/px/i);
  });

  it('complex subtype resolver returns milestone or card rail', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' });
    const rail = profile.regions.find((r) => r.regionType === 'CARD_RAIL');
    if (rail) {
      expect(resolveComplexRegionSubtype(rail)).toBe('CARD_RAIL');
    } else {
      expect(resolveComplexRegionSubtype({ ...profile.regions[0]!, regionType: 'CARD_RAIL', regionName: 'CARD RAIL' })).toBe(
        'CARD_RAIL',
      );
    }
  });

  it('R4 recovery integrates internal structure and adds dimensions', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile', screenId: 'overview' });
    const report = runAuthorityRelativeForensics({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      screenId: 'overview',
      currentCapture: { captureId: 'cap_r5', width: 390, height: 844, domMeasurements: SHALLOW_QA_DOM },
      designAuthority: { authorityVersionId: 'auth_r5', width: 390, height: 844, visualShellSpec: SHELL },
    });
    const beforeDims = report.regionForensics.reduce((n, b) => n + b.dimensions.length, 0);
    const { report: after, receipt } = analyzeMissingForensicEvidence({
      report,
      profile,
      forensicsVersion: 'v306',
      domMeasurements: SHALLOW_QA_DOM,
      shell: { headerPaddingX: 14, contentPaddingX: 14, sectionGap: 10 },
      viewportWidth: 390,
      viewportHeight: 844,
    });
    expect(receipt.forensicsVersionAfter).toBe(P0_VR_DIAG_1R5A_BUILD);
    expect(receipt.regionsAttempted.length).toBeGreaterThan(0);
    expect(receipt.structureTraces?.length).toBe(receipt.regionsAttempted.length);
    const afterDims = after.regionForensics.reduce((n, b) => n + b.dimensions.length, 0);
    expect(afterDims).toBeGreaterThanOrEqual(beforeDims);
    const attemptedId = receipt.regionsAttempted[0]!;
    const touched = after.regionForensics.find((b) => b.regionId === attemptedId);
    expect(touched?.internalStructure?.status).toBeDefined();
    const cacheKey = `${report.pageId}|${report.viewport}|${report.authorityVersionId ?? 'na'}|${report.captureId}|${P0_VR_DIAG_1R5A_BUILD}`;
    expect(getRegionInternalStructure(cacheKey, attemptedId)).toBeTruthy();
  });

  it('no progress reports root cause not silent', () => {
    const failure = deriveEvidenceRecoveryFailure({
      regionId: 'r1',
      currentStructure: {
        regionId: 'r1',
        regionType: 'NAVIGATION',
        container: null,
        childAnchors: [],
        groups: [],
        relationships: [],
        structureConfidence: 'LOW',
        status: 'UNRESOLVED',
      },
      authorityStructure: {
        regionId: 'r1',
        regionType: 'NAVIGATION',
        container: null,
        childAnchors: [],
        groups: [],
        relationships: [],
        structureConfidence: 'LOW',
        status: 'UNRESOLVED',
      },
      dimensionsAdded: 0,
    });
    expect(failure?.failureCode).toBe('DOM_CHILDREN_UNRESOLVED');
  });

  it('dimension type repair preserves raw evidence flag', () => {
    const { receipt } = repairDimensionTypesOnBundles({
      bundles: [
        {
          regionId: 'r',
          regionName: 'NAV',
          regionType: 'NAVIGATION',
          significance: 'MAJOR',
          status: 'MATCHED',
          componentTarget: { regionId: 'r', componentId: null, selector: null, route: null, confidence: 'HIGH', unresolvedComponentTarget: false },
          dimensions: [
            {
              evidenceId: 'e1',
              regionId: 'r',
              dimension: 'itemCount',
              authorityValue: '5',
              currentValue: '4',
              unit: 'px',
              confidence: 'MEDIUM',
              source: 'DOM',
              delta: '-1px',
            },
          ],
          corrections: [],
          confidence: 'MEDIUM',
          functionalRisk: 'LOW',
        },
      ],
      forensicsVersionBefore: 'v306',
      forensicsVersionAfter: 'v307',
    });
    expect(receipt.rawEvidencePreserved).toBe(true);
    expect(receipt.dimensionsReclassified).toBeGreaterThan(0);
  });

  it('internal measurements map to dimension evidence with region type profile', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' });
    const def = profile.regions.find((r) => r.regionType === 'METRICS')!;
    const dom = SHALLOW_QA_DOM.find((d) => d.regionId === def.regionId)!;
    const cur = extractCurrentRegionStructure({ def, dom });
    const auth = extractAuthorityRegionStructure({
      def,
      authority: {
        regionId: def.regionId,
        regionName: def.regionName,
        category: 'METRICS',
        geometry: { x: dom.actualX, y: dom.actualY, width: dom.actualWidth, height: dom.actualHeight, widthPct: 1, heightPct: 0.08, xPct: 0, yPct: 0.3 },
      },
    });
    const ms = buildInternalStructureMeasurements(auth, cur);
    expect(ms.some((m) => m.measurementType === 'cellCount')).toBe(true);
    const evidence = internalMeasurementsToDimensionEvidence(def.regionId, ms, 'METRICS');
    expect(evidence.length).toBeGreaterThan(0);
    const gap = evidence.find((e) => e.dimension === 'gap');
    expect(gap?.importance).toBe('CRITICAL');
  });

  it('structure completeness gates sufficiency for container-only nav', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' });
    const def = profile.regions.find((r) => r.regionType === 'NAVIGATION')!;
    const structure = extractCurrentRegionStructure({ def, dom: null });
    expect(structure.status).toBe('UNRESOLVED');
    const completeness = computeInternalStructureCompleteness(structure);
    expect(completeness.missingAnchors.length).toBeGreaterThan(0);
    const bundle = {
      regionId: def.regionId,
      regionName: def.regionName,
      regionType: 'NAVIGATION' as const,
      significance: 'MAJOR' as const,
      status: 'MATCHED' as const,
      componentTarget: { regionId: def.regionId, componentId: null, selector: null, route: null, confidence: 'HIGH', unresolvedComponentTarget: false },
      dimensions: [
        {
          evidenceId: 'd1',
          regionId: def.regionId,
          dimension: 'containerHeight',
          authorityValue: '40px',
          currentValue: '40px',
          unit: 'px' as const,
          confidence: 'HIGH' as const,
          source: 'DOM' as const,
          currentSource: 'DOM_RECT' as const,
          authoritySource: 'AUTHORITY_IMAGE_ESTIMATE' as const,
          delta: '0px',
        },
      ],
      corrections: [],
      confidence: 'HIGH' as const,
      functionalRisk: 'LOW' as const,
      internalStructure: { status: structure.status, anchorHierarchy: buildStructureHierarchyPreview(structure) },
    };
    expect(isRegionDepthSufficient(bundle)).toBe(false);
  });
});
