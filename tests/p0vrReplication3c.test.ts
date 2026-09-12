/**
 * P0.VR.REPLICATION.3C — Visual asset recovery + literal source execution.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ASSET_RESOLUTION_STRATEGIES,
  P0_VR_REPLICATION_3C_BUILD,
  MAX_HERO_ASSET_CORRECTION_PASSES,
  buildHeroAssetInventory,
  resolveHeroAssetSlots,
  heroAssetsFullyBound,
  executeReplication3cPipeline,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3c/index.js';
import { buildHeroLayoutInstructions } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3c/literalLayoutInstructions.js';
import { executeLiteralRegionSource } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3c/literalSourceExecutor.js';
import { assertSourceStructureNotCollapsed } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3c/sourceStructureGuard.js';
import { observationToLiteralRegionSpec } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3b/ndxStructuralVisionSeed.js';
import { buildNdxHeroStructuralObservation } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3b/ndxStructuralVisionSeed.js';
import type { ReconstructionTwinSession } from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import type { VisionReplicationReport } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3b/types.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

function heroSpec() {
  return observationToLiteralRegionSpec(buildNdxHeroStructuralObservation());
}

function minimalVisionReport(): VisionReplicationReport {
  const spec = heroSpec();
  return {
    reportId: 'vr_test',
    sessionId: 's',
    buildRef: 'v328',
    providerAudit: { provider: 'test', model: 'fixture', apiKeyPresent: false },
    regionObservations: [buildNdxHeroStructuralObservation()],
    literalRegionSpecs: [spec],
    generatedSources: [],
    correctionPasses: [],
    heroRecognizable: true,
    capabilityLimit: false,
    playwrightLoopUsed: false,
    createdAt: new Date().toISOString(),
  };
}

function session(): ReconstructionTwinSession {
  return {
    sessionId: 'twin_3c',
    projectId: 'ndxbook',
    pageId: 'ndxbook:/projects/ndxbook/overview',
    viewport: 'mobile',
    canonicalRoute: '/projects/ndxbook/overview',
    twinRoute: '/projects/ndxbook/debug/reconstruction/overview/twin_3c',
    authorityVersionId: 'auth',
    beforeCaptureId: 'cap',
    reconstructionPlanId: 'plan',
    sourceLiveVersionId: 'live',
    twinVersionId: 'twin_v329',
    mutationPolicy: 'READ_ONLY',
    designAuthorityAssetRef: 'https://cdn.example.com/ndx-authority.png',
    functionContract: {
      route: '/projects/ndxbook/overview',
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
      planId: 'plan',
      pagePurpose: 'overview',
      geometryChanges: [],
      spacingChanges: [],
      typographyChanges: [],
      assetChanges: [],
      componentChanges: [],
      functionPreservation: [],
      goal: '3c',
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

describe('P0.VR.REPLICATION.3C asset + literal execution', () => {
  it('exports asset resolution strategies', () => {
    expect(ASSET_RESOLUTION_STRATEGIES).toContain('EXISTING_LIBRARY_ASSET');
    expect(ASSET_RESOLUTION_STRATEGIES).toContain('AUTHORITY_REGION_DERIVATION');
    expect(ASSET_RESOLUTION_STRATEGIES).toContain('PROCEDURAL_DOM_GRAPHIC');
    expect(P0_VR_REPLICATION_3C_BUILD).toBe('v319');
    expect(MAX_HERO_ASSET_CORRECTION_PASSES).toBe(3);
  });

  it('builds hero asset inventory from literal spec (multiple slots)', () => {
    const spec = heroSpec();
    const slots = buildHeroAssetInventory({
      heroSpec: spec,
      authorityImageUrl: 'https://authority.png',
    });
    expect(slots.length).toBe(spec.imageSlots.length + spec.graphicSlots.length);
    expect(slots.map((s) => s.slotId).sort()).toEqual(
      ['lime_ndx', 'right_graphic', 'slice_a', 'slice_b', 'slice_c'].sort(),
    );
  });

  it('searches library and binds before generation', () => {
    const spec = heroSpec();
    const inventory = buildHeroAssetInventory({ heroSpec: spec, authorityImageUrl: null });
    const { slots, receipts } = resolveHeroAssetSlots({ slots: inventory, authorityImageUrl: null });
    const sliceB = slots.find((s) => s.slotId === 'slice_b');
    expect(sliceB?.selectedStrategy).toBe('EXISTING_LIBRARY_ASSET');
    expect(sliceB?.status).toBe('BOUND');
    expect(receipts.some((r) => r.strategy === 'EXISTING_LIBRARY_ASSET')).toBe(true);
  });

  it('derives authority regions when library miss (no full-screen cheat in crop presets)', () => {
    const spec = heroSpec();
    const inventory = buildHeroAssetInventory({ heroSpec: spec, authorityImageUrl: 'https://a.png' });
    const { slots } = resolveHeroAssetSlots({ slots: inventory, authorityImageUrl: 'https://a.png' });
    const sliceC = slots.find((s) => s.slotId === 'slice_c');
    expect(sliceC?.selectedStrategy).toMatch(/AUTHORITY_/);
    expect(sliceC?.cropSpec?.backgroundSize).not.toBe('100% 100%');
    expect(heroAssetsFullyBound(slots)).toBe(true);
  });

  it('uses procedural DOM for lime graphic', () => {
    const spec = heroSpec();
    const inventory = buildHeroAssetInventory({ heroSpec: spec, authorityImageUrl: null });
    const { slots } = resolveHeroAssetSlots({ slots: inventory, authorityImageUrl: null });
    const lime = slots.find((s) => s.slotId === 'lime_ndx');
    expect(lime?.selectedStrategy).toBe('PROCEDURAL_DOM_GRAPHIC');
  });

  it('marks UNRESOLVED when no authority and no library match', () => {
    const spec = heroSpec();
    const inventory = buildHeroAssetInventory({ heroSpec: spec, authorityImageUrl: null });
    const onlySliceC = inventory.filter((s) => s.slotId === 'slice_c');
    const { slots } = resolveHeroAssetSlots({ slots: onlySliceC, authorityImageUrl: null });
    expect(slots[0]?.status).toBe('UNRESOLVED_VISUAL_ASSET');
  });

  it('builds literal layout instructions for hero grid relationships', () => {
    const instructions = buildHeroLayoutInstructions(heroSpec());
    expect(instructions.length).toBeGreaterThan(4);
    expect(instructions.some((i) => i.overlap != null)).toBe(true);
  });

  it('literal source executor consumes spec + layout + asset slots', () => {
    const spec = heroSpec();
    const inventory = buildHeroAssetInventory({ heroSpec: spec, authorityImageUrl: 'https://a.png' });
    const { slots } = resolveHeroAssetSlots({ slots: inventory, authorityImageUrl: 'https://a.png' });
    const layout = buildHeroLayoutInstructions(spec);
    const executed = executeLiteralRegionSource({ spec, layoutInstructions: layout, assetSlots: slots });
    expect(executed.sourceElementCount).toBeGreaterThanOrEqual(spec.subregions.length + slots.length);
    expect(executed.structureCollapse).toBe(false);
  });

  it('SOURCE_STRUCTURE_COLLAPSE when source too thin', () => {
    const spec = heroSpec();
    const guard = assertSourceStructureNotCollapsed({
      spec,
      assetSlots: [],
      source: {
        regionId: spec.regionId,
        component: 'VisionLiteralNdxOverviewTwin',
        rootClass: 'x',
        subregionCount: 1,
        domOutline: ['<div />'],
        cssGridTemplate: null,
        assetSlotCount: 0,
        collapsed: false,
      },
    });
    expect(guard.ok).toBe(false);
    expect(guard.code).toBe('SOURCE_STRUCTURE_COLLAPSE');
  });

  it('3C pipeline produces receipts and preserves prior twin version', () => {
    const result = executeReplication3cPipeline({
      session: session(),
      visionReport: minimalVisionReport(),
      authorityImageUrl: session().designAuthorityAssetRef ?? null,
      priorTwinVersionId: 'twin_v329',
    });
    expect(result.report.priorTwinVersionPreserved).toBe('twin_v329');
    expect(result.report.assetReceipts.length).toBeGreaterThan(0);
    expect(result.report.executionReceipts[0]?.correctionPasses).toBeLessThanOrEqual(3);
    expect(result.report.heroHumanRecognizable).toBe(true);
    expect(result.sessionPatch.twinRenderMode).toBe('VISION_LITERAL_EXECUTED_NDX_OVERVIEW');
  });

  it('founder twin does not render ASSET_MISSING copy', () => {
    const twin = read('src/site00/components/reconstruction/VisionLiteralNdxOverviewTwin.tsx');
    expect(twin).not.toContain('ASSET_MISSING');
  });

  it('host bottom nav uses SITE 00 bays when executed', () => {
    const nav = read('src/site00/components/reconstruction/TwinSite00HostBottomNav.tsx');
    expect(nav).toContain('MOBILE_SITE_NAV');
    expect(nav).not.toContain('CONTENT OPS');
    const config = read('src/site00/config/mobile-site-nav.ts');
    expect(config).toContain('ORIGIN');
    expect(config).toContain('CTRL ROOM');
  });

  it('upgrade UX exposes asset resolution panel', () => {
    const ux = read('src/site00/components/designWorkspace/pageFamily/PageUpgradeReplicationExperience.tsx');
    expect(ux).toContain('AssetResolutionPanel');
    expect(ux).toContain('ASSET RESOLUTION');
  });

  it('paid generation guard: no GENERATED_RECONSTRUCTION in default hero path', () => {
    const result = executeReplication3cPipeline({
      session: session(),
      visionReport: minimalVisionReport(),
      authorityImageUrl: session().designAuthorityAssetRef ?? null,
      priorTwinVersionId: 'twin_v329',
    });
    expect(result.report.assetReceipts.every((r) => r.strategy !== 'GENERATED_RECONSTRUCTION')).toBe(true);
  });
});
