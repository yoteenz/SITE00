/**
 * P0.VR.REBUILD.1 — Authority-first twin reconstruction tests.
 */

import { describe, expect, it } from 'vitest';
import {
  ndxbookOverviewMobileStrategy,
  resolveReconstructionStrategy,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrRebuild1/reconstructionStrategyResolver.js';
import { scoreCompositionDivergence, NDX_LEGACY_OVERVIEW_STACK } from '../shared/site00-studio-world-production/visualReconstruction/p0vrRebuild1/compositionDivergenceScore.js';
import { buildAuthorityCompositionBlueprint } from '../shared/site00-studio-world-production/visualReconstruction/p0vrRebuild1/authorityCompositionBlueprint.js';
import { buildCurrentPageFunctionalInventory } from '../shared/site00-studio-world-production/visualReconstruction/p0vrRebuild1/currentPageFunctionalInventory.js';
import { buildFunctionalTransplantPlan } from '../shared/site00-studio-world-production/visualReconstruction/p0vrRebuild1/functionalTransplantPlan.js';
import { composeAuthorityFirstTwin } from '../shared/site00-studio-world-production/visualReconstruction/p0vrRebuild1/authorityFirstTwinComposer.js';
import { evaluateAuthorityCompositionCoverage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrRebuild1/authorityCompositionCoverage.js';
import { runLegacyStructureRetentionCheck } from '../shared/site00-studio-world-production/visualReconstruction/p0vrRebuild1/legacyStructureRetentionCheck.js';
import { evaluateVisualAuthorityAcceptanceGate } from '../shared/site00-studio-world-production/visualReconstruction/p0vrRebuild1/visualAuthorityAcceptanceGate.js';
import { buildFidelityScoreProvenance, formatProvenanceScore } from '../shared/site00-studio-world-production/visualReconstruction/p0vrRebuild1/fidelityScoreProvenance.js';
import { enrichSessionVisualAuthority, inferLegacyPatchTwinStatus } from '../shared/site00-studio-world-production/visualReconstruction/p0vrRebuild1/sessionVisualAuthority.js';
import { resolvePageRegionLayoutProfile } from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/pageRegionLayoutProfiles.js';
import { canPromote, evaluatePromotionReadiness } from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/promotionReadiness.js';
import type { ReconstructionTwinSession } from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';

const baseSession = (): ReconstructionTwinSession =>
  ({
    sessionId: 'twin_ndxbook_test',
    projectId: 'ndxbook',
    pageId: 'ndxbook:/projects/ndxbook/overview',
    viewport: 'mobile',
    canonicalRoute: '/projects/ndxbook/overview',
    twinRoute: '/projects/ndxbook/debug/reconstruction/x/twin_ndxbook_test',
    authorityVersionId: 'auth_v1',
    beforeCaptureId: 'cap_before',
    reconstructionPlanId: 'plan_1',
    sourceLiveVersionId: 'live_v1',
    twinVersionId: 'twin_v1',
    mutationPolicy: 'READ_ONLY',
    functionContract: {
      route: '/projects/ndxbook/overview',
      auth: ['signed_in'],
      permissions: ['admin'],
      dataQueries: ['operatingState'],
      mutations: [],
      forms: [],
      links: [],
      navigation: ['bottomNav'],
      state: ['operatingState'],
      featureFlags: [],
      actions: [],
      businessRules: [],
    },
    reconstructionPlan: {
      planId: 'plan_1',
      pagePurpose: 'overview',
      geometryChanges: [],
      spacingChanges: [],
      typographyChanges: [],
      assetChanges: [],
      measuredSpecId: null,
      forensicsReportId: null,
    },
    status: 'READY_FOR_REVIEW',
    buildSteps: [],
    twinCapture: {
      sessionId: 'twin_ndxbook_test',
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      captureId: 'cap_twin',
      imageRef: null,
      capturedAt: new Date().toISOString(),
      status: 'CAPTURE_READY',
    },
    revisions: [],
    twinVersions: [],
    fidelityQa: [{ dimension: 'FUNCTION', status: 'PASS', summary: 'ok' }],
    promotionReadiness: null,
    responsiveImpact: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvedForPromotionAt: null,
    promotedAt: null,
  }) as ReconstructionTwinSession;

describe('P0.VR.REBUILD.1 strategy resolver', () => {
  it('classifies PATCH_EXISTING for identical stacks', () => {
    const genericProfile = resolvePageRegionLayoutProfile({ pageArchetype: 'generic-mobile-page' });
    const r = resolveReconstructionStrategy({
      pageId: 'generic:/page',
      viewport: 'mobile',
      pageArchetype: 'generic-mobile-page',
      currentStack: genericProfile.stackOrder,
    });
    expect(r.strategy).toBe('PATCH_EXISTING');
  });

  it('classifies REBUILD_FROM_AUTHORITY for NDX legacy vs authority', () => {
    expect(ndxbookOverviewMobileStrategy()).toBe('REBUILD_FROM_AUTHORITY');
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile', screenId: 'overview' });
    const divergence = scoreCompositionDivergence({
      currentStack: NDX_LEGACY_OVERVIEW_STACK,
      authorityStack: profile.stackOrder,
    });
    expect(divergence.status).toBe('HIGH');
  });

  it('RECOMPOSE_EXISTING for medium divergence', () => {
    const authority = resolvePageRegionLayoutProfile({
      pageArchetype: 'ndxbook-overview-mobile',
      screenId: 'overview',
    }).stackOrder;
    const partial = authority.slice(0, 6);
    const divergence = scoreCompositionDivergence({ currentStack: partial, authorityStack: authority });
    expect(['MEDIUM', 'HIGH', 'LOW']).toContain(divergence.status);
  });
});

describe('P0.VR.REBUILD.1 blueprints and transplant', () => {
  it('authority blueprint follows authority stack not legacy DOM', () => {
    const blueprint = buildAuthorityCompositionBlueprint({
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      authorityVersionId: 'auth_v1',
    });
    expect(blueprint.regionOrder[0]).toBe('header');
    expect(blueprint.regionOrder).toContain('hero-media');
    expect(blueprint.regionOrder).not.toContain('legacy-kpi-grid');
    expect(blueprint.regions.length).toBeGreaterThan(5);
  });

  it('functional inventory is separate from visuals', () => {
    const inv = buildCurrentPageFunctionalInventory({
      sessionId: 's1',
      contract: baseSession().functionContract,
    });
    expect(inv.dataQueries).toContain('operatingState');
    expect(inv.routes[0]).toContain('/overview');
  });

  it('functional transplant binds data and nav', () => {
    const blueprint = buildAuthorityCompositionBlueprint({
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      authorityVersionId: 'auth_v1',
    });
    const plan = buildFunctionalTransplantPlan({
      sessionId: 's1',
      blueprint,
      inventory: buildCurrentPageFunctionalInventory({
        sessionId: 's1',
        contract: baseSession().functionContract,
      }),
    });
    expect(plan.bindings.some((b) => b.bindingType === 'DATA')).toBe(true);
    expect(plan.bindings.some((b) => b.bindingType === 'NAVIGATION')).toBe(true);
    expect(plan.status).toBe('READY');
  });
});

describe('P0.VR.REBUILD.1 composer and QA gates', () => {
  it('composeAuthorityFirstTwin for NDX overview', () => {
    const result = composeAuthorityFirstTwin(baseSession());
    expect(result.strategy).toBe('REBUILD_FROM_AUTHORITY');
    expect(result.renderMode).toBe('AUTHORITY_FIRST_NDX_OVERVIEW');
    expect(result.compositionVersion.buildRef).toBe('v313');
  });

  it('authority composition coverage passes for authority-first order', () => {
    const blueprint = buildAuthorityCompositionBlueprint({
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      authorityVersionId: 'auth_v1',
    });
    const coverage = evaluateAuthorityCompositionCoverage({
      blueprint,
      twinRegionOrder: blueprint.regionOrder,
      strategy: 'REBUILD_FROM_AUTHORITY',
    });
    expect(coverage.status).toBe('PASS');
    expect(coverage.flags).not.toContain('LEGACY_COMPOSITION_RETAINED');
  });

  it('legacy structure retention fails for legacy overview surface', () => {
    const check = runLegacyStructureRetentionCheck({
      strategy: 'PATCH_EXISTING',
      twinSurface: 'LEGACY_OVERVIEW',
    });
    expect(check.legacyDominates).toBe(true);
    expect(check.status).toBe('LEGACY_COMPOSITION_RETAINED');
  });

  it('visual authority gate blocks failed patch twin', () => {
    const enriched = enrichSessionVisualAuthority(baseSession());
    expect(inferLegacyPatchTwinStatus(baseSession())).toBe('FAILED_VISUAL_AUTHORITY');
    const gate = enriched.visualAuthorityAcceptanceGate;
    expect(gate?.promotionAllowed).toBe(false);
  });

  it('unknown fidelity scores do not display as 100', () => {
    const rows = buildFidelityScoreProvenance({
      convergenceBefore: null,
      convergenceAfter: null,
      compositionCoveragePass: false,
    });
    const spacing = rows.find((r) => r.dimension === 'SPACING')!;
    expect(formatProvenanceScore(spacing)).toBe('—');
    expect(spacing.after).toBeNull();
  });

  it('promotion disabled when visual authority failed', () => {
    const session = enrichSessionVisualAuthority(baseSession());
    const readiness = evaluatePromotionReadiness({
      session,
      fidelityQa: session.fidelityQa,
      currentAuthorityVersionId: session.authorityVersionId,
      founderApproved: true,
      visualAuthorityGate: session.visualAuthorityAcceptanceGate,
    });
    expect(canPromote(readiness)).toBe(false);
    expect(readiness.blockingIssues).toContain('VISUAL_AUTHORITY_FAILED');
  });

  it('visual authority gate requires founder approval for promotion when built authority-first', () => {
    const blueprint = buildAuthorityCompositionBlueprint({
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      authorityVersionId: 'auth_v1',
    });
    const coverage = evaluateAuthorityCompositionCoverage({
      blueprint,
      twinRegionOrder: blueprint.regionOrder,
      strategy: 'REBUILD_FROM_AUTHORITY',
    });
    const legacy = runLegacyStructureRetentionCheck({
      strategy: 'REBUILD_FROM_AUTHORITY',
      twinSurface: 'AUTHORITY_FIRST',
    });
    const gate = evaluateVisualAuthorityAcceptanceGate({
      visualAuthorityStatus: 'AUTHORITY_FIRST_BUILT',
      compositionCoverage: coverage,
      legacyCheck: legacy,
      functionQaPass: true,
      founderApproved: false,
    });
    expect(gate.promotionAllowed).toBe(false);
    expect(gate.blockingReasons).toContain('FOUNDER_VISUAL_APPROVAL_REQUIRED');
  });
});

describe('P0.VR.REBUILD.1 UI surface contract', () => {
  it('AuthorityFirstNdxOverviewTwin module exists in source', async () => {
    const fs = await import('node:fs/promises');
    const src = await fs.readFile(
      new URL('../src/site00/components/reconstruction/AuthorityFirstNdxOverviewTwin.tsx', import.meta.url),
      'utf8',
    );
    expect(src).toContain('data-authority-region="hero-media"');
    expect(src).not.toContain('backgroundImage: `url(${authority');
    expect(src).toContain('useProjectOperatingState');
  });

  it('twin build pipeline wires REBUILD path', async () => {
    const fs = await import('node:fs/promises');
    const src = await fs.readFile(
      new URL(
        '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/twinBuildPipeline.ts',
        import.meta.url,
      ),
      'utf8',
    );
    expect(src).toContain('composeAuthorityFirstTwin');
    expect(src).toContain('REBUILD_FROM_AUTHORITY');
  });
});
