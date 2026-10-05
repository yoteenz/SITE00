/**
 * P0.VR.8-SRF — Screen Replication Fidelity / Asset-Deferred Convergence tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  P0_VR_8_SRF_LINEAGE,
  GOLDEN_NDX_OVERVIEW_MOBILE,
  DEFAULT_ASSET_DEFERRED_POLICY,
  buildNdxOverviewMobileFidelityContract,
  buildNdxOverviewMobileAuthorityBlueprint,
  buildNdxOverviewCompositionMap,
  buildNdxOverviewRebuildRegionMap,
  resolveAssetState,
  assetPendingBlocksStructuralConvergence,
  structuralConvergenceAllowedWithDeferredAssets,
  scoreDimensionsFromDifferences,
  structuralScoresPass,
  assetScoreMustNotLowerStructure,
  measureLiveRegionsAgainstBlueprint,
  authoritiesShareDomFingerprint,
  maskAssetDeferredRegionsOnly,
  runStructuralQaPass,
  runFullQaPass,
  buildCaptureSet,
  excessiveMaskingDetected,
  detectTemplateDrift,
  detectCompositionCloning as detectCloningDiff,
  wholePageImageCheatDetected,
  runScreenReplicationConvergence,
  mobilePassGate,
  desktopIndependentAuthorityRequired,
  runScreenReplicationKernel,
  NDX_OVERVIEW_MOBILE_DOM_MARKERS,
  NDX_OVERVIEW_MOBILE_LIVE_REGION_MAP,
  screenAuthorityRoutesToReplicationNotAssets,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr8/screenReplicationFidelity/index.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.8-SRF Screen Replication Fidelity', () => {
  it('1. ScreenReplicationFidelityContract golden case', () => {
    const c = buildNdxOverviewMobileFidelityContract();
    expect(c.fidelityMode).toBe('EXACT');
    expect(c.convergenceRequired).toBe(true);
    expect(c.assetPolicy).toBe('ASSET_DEFERRED_ALLOWED');
    expect(P0_VR_8_SRF_LINEAGE).toBe('P0.VR.8-SRF');
  });

  it('2. AssetDeferredPolicy allows structural continuation', () => {
    expect(DEFAULT_ASSET_DEFERRED_POLICY.continueStructuralConvergenceWhenAssetPending).toBe(true);
    expect(assetPendingBlocksStructuralConvergence({ regionId: 'x', role: 'IMAGE', rebuildClass: 'ASSET_DEFERRED', geometry: { x: 0, y: 0, width: 1, height: 1 }, assetState: 'ASSET_PENDING' })).toBe(false);
    expect(structuralConvergenceAllowedWithDeferredAssets(DEFAULT_ASSET_DEFERRED_POLICY, 2)).toBe(true);
  });

  it('3. separate structural and asset scores', () => {
    const scores = scoreDimensionsFromDifferences({
      differences: [{ differenceId: 'a1', regionId: 'production-card-art-1', differenceClass: 'ASSET_DRIFT', severity: 'MINOR', description: 'pending hero', masked: false }],
      assetDeferredRegionIds: ['production-card-art-1'],
      maskedRegionIds: [],
    });
    expect(scores.STRUCTURE_MATCH).toBeGreaterThanOrEqual(90);
    expect(scores.ASSET_MATCH).toBeLessThan(90);
    expect(scores.assetMatchStatus).toBe('DEFERRED');
  });

  it('4. asset score must not lower structure reporting', () => {
    const r = assetScoreMustNotLowerStructure(96, 42);
    expect(r.structuralFidelity).toBe(96);
    expect(r.assetFidelity).toBe('DEFERRED');
  });

  it('5. ScreenAuthorityBlueprint geometry regions', () => {
    const bp = buildNdxOverviewMobileAuthorityBlueprint();
    expect(bp.pageBounds.width).toBe(GOLDEN_NDX_OVERVIEW_MOBILE.viewportWidth);
    expect(bp.regions.some((r) => r.regionId === 'overview-hero')).toBe(true);
    expect(bp.firstViewportRegions.length).toBeGreaterThan(0);
  });

  it('6. parent geometry first — blueprint orders major regions', () => {
    const bp = buildNdxOverviewMobileAuthorityBlueprint();
    const hero = bp.regions.find((r) => r.regionId === 'overview-hero')!;
    const kpis = bp.regions.find((r) => r.regionId === 'overview-kpis')!;
    expect(hero.geometry.y).toBeLessThan(kpis.geometry.y);
  });

  it('7. typography fidelity tracked in blueprint roles', () => {
    const bp = buildNdxOverviewMobileAuthorityBlueprint();
    expect(bp.regions.find((r) => r.regionId === 'overview-hero')?.typographyRole).toBe('DISPLAY');
  });

  it('8. CompositionRelationshipMap', () => {
    const map = buildNdxOverviewCompositionMap();
    expect(map.relationships.some((r) => r.relationship.includes('KPI'))).toBe(true);
  });

  it('9. AuthorityRebuildRegionMap host boundary audit', () => {
    const map = buildNdxOverviewRebuildRegionMap();
    expect(map.authorityControlledPercent).toBeGreaterThan(map.hostLockedPercent);
    expect(map.hostBoundarySuspect).toBe(false);
  });

  it('10. host boundary suspect when host too large', () => {
    const map = buildNdxOverviewRebuildRegionMap();
    expect(map.hostLockedPercent).toBeLessThan(55);
  });

  it('11. interaction preservation — kernel inherits page completion', () => {
    const k = runScreenReplicationKernel({ workspace: 'PAGES', pageExperience: { projectId: 'ndxbook', pageId: 'overview', primaryRoute: '/projects/ndxbook/overview', moduleScreenType: 'PROJECT_OVERVIEW', parentAuthorityId: null } });
    expect(k.pageJob).toBeTruthy();
    expect(k.screenReplication?.contract.interactionPolicy).toBe('PRESERVE_FUNCTION');
  });

  it('12. asset-deferred masking structural QA pass A', () => {
    const bp = buildNdxOverviewMobileAuthorityBlueprint();
    const diffs = [{ differenceId: 'd1', regionId: 'production-card-art-1', differenceClass: 'ASSET_DRIFT' as const, severity: 'MINOR' as const, description: 'pending', masked: false }];
    const pass = runStructuralQaPass({ blueprint: bp, differences: diffs });
    expect(pass.passKind).toBe('STRUCTURAL');
    expect(pass.maskedRegionIds).toContain('production-card-art-1');
    expect(pass.passed).toBe(true);
  });

  it('13. full QA pass B without masks', () => {
    const bp = buildNdxOverviewMobileAuthorityBlueprint();
    const pass = runFullQaPass({ blueprint: bp, differences: [] });
    expect(pass.passKind).toBe('FULL');
    expect(pass.maskedRegionIds).toHaveLength(0);
    expect(structuralScoresPass(pass.scores)).toBe(true);
  });

  it('14. capture set includes reference live overlay diff', () => {
    const cap = buildCaptureSet({ referencePath: '/ref.png', livePath: '/live', viewportWidth: 390, viewportHeight: 844 });
    expect(cap.referenceUrl).toContain('reference');
    expect(cap.liveUrl).toContain('live');
    expect(cap.overlayUrl).toContain('overlay');
    expect(cap.diffUrl).toContain('diff');
  });

  it('15. no excessive masking of structural regions', () => {
    const bp = buildNdxOverviewMobileAuthorityBlueprint();
    const { maskedRegionIds } = maskAssetDeferredRegionsOnly(bp, []);
    expect(excessiveMaskingDetected(maskedRegionIds, bp)).toBe(false);
  });

  it('16. convergence loop produces session', () => {
    const c = buildNdxOverviewMobileFidelityContract();
    const bp = buildNdxOverviewMobileAuthorityBlueprint();
    const state = runScreenReplicationConvergence({
      contract: c,
      blueprint: bp,
      liveDomMarkers: [...NDX_OVERVIEW_MOBILE_DOM_MARKERS],
      liveRegionPresence: NDX_OVERVIEW_MOBILE_LIVE_REGION_MAP,
    });
    expect(state.captures).toBeTruthy();
    expect(state.passCount).toBe(1);
  });

  it('17. no whole-page image cheat detection', () => {
    expect(wholePageImageCheatDetected(['site00-srf-image-cheat'])).toBe(true);
    expect(wholePageImageCheatDetected(NDX_OVERVIEW_MOBILE_DOM_MARKERS)).toBe(false);
  });

  it('18. template drift fails generic pov template', () => {
    const r = detectTemplateDrift(['site00-pov', 'site00-pov-hero', 'site00-pov-signals', 'site00-pov-tactical']);
    expect(r.templateDrift).toBe(true);
    expect(r.differences[0]?.differenceClass).toBe('TEMPLATE_DRIFT');
  });

  it('19. composition cloning detector', () => {
    const diff = detectCloningDiff({ authorityA: 'a', authorityB: 'b', domFingerprintA: 'same', domFingerprintB: 'same' });
    expect(diff?.differenceClass).toBe('COMPOSITION_CLONING');
    expect(authoritiesShareDomFingerprint('a', 'b', true)).toBe(true);
  });

  it('20. mobile golden case routes to screen authority not assets', () => {
    expect(screenAuthorityRoutesToReplicationNotAssets('SCREEN_AUTHORITY')).toBe(true);
    expect(screenAuthorityRoutesToReplicationNotAssets('ASSET_SOURCE')).toBe(false);
  });

  it('21. mobile pass gate blocks desktop until structural pass', () => {
    const c = buildNdxOverviewMobileFidelityContract();
    const bp = buildNdxOverviewMobileAuthorityBlueprint();
    const pass = runScreenReplicationConvergence({ contract: c, blueprint: bp, liveDomMarkers: [...NDX_OVERVIEW_MOBILE_DOM_MARKERS], liveRegionPresence: NDX_OVERVIEW_MOBILE_LIVE_REGION_MAP });
    expect(mobilePassGate(pass)).toBe(true);
    expect(desktopIndependentAuthorityRequired(mobilePassGate(pass))).toBe(true);
  });

  it('22. resolveAssetState pipeline', () => {
    expect(resolveAssetState({ hasCanonicalAsset: true, hasApprovedAsset: false, reconstructionReady: false })).toBe('CANONICAL_ASSET');
    expect(resolveAssetState({ hasCanonicalAsset: false, hasApprovedAsset: false, reconstructionReady: false })).toBe('ASSET_PENDING');
  });

  it('23. ProjectOverviewModuleSurface uses authority mobile for ndxbook', () => {
    const src = read('src/site00/components/projectOperatingSystem/ProjectOverviewModuleSurface.tsx');
    expect(src).toContain('OverviewMobileHomeScreen');
    expect(src).toContain('data-screen-replication="NDX_OVERVIEW_MOBILE"');
  });

  it('24. inspector + asset pending placeholder wired', () => {
    expect(read('src/site00/components/designWorkspace/DesignScreenReplicationInspector.tsx')).toContain('SCREEN REPLICATION');
    expect(read('src/site00/components/designWorkspace/DesignMoreTab.tsx')).toContain('DesignScreenReplicationInspector');
    expect(read('src/site00/components/founderWorkspace/OverviewFounderWorkspaceBoard.tsx')).toContain('AssetPendingPlaceholder');
    expect(read('src/site00/components/founderWorkspace/OverviewFounderWorkspaceBoard.tsx')).toContain('data-srf-region');
  });

  it('25. measureLiveRegionsAgainstBlueprint missing region drift', () => {
    const bp = buildNdxOverviewMobileAuthorityBlueprint();
    const diffs = measureLiveRegionsAgainstBlueprint({ blueprint: bp, liveRegionPresence: { 'overview-hero': true }, usesGenericTemplate: false });
    expect(diffs.some((d) => d.differenceClass === 'STRUCTURAL_DRIFT')).toBe(true);
  });
});
