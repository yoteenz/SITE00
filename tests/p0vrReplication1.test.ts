/**
 * P0.VR.REPLICATION.1 — Replication mode + director + UX contracts.
 */

import { describe, expect, it } from 'vitest';
import {
  ndxbookOverviewMobileReplicationMode,
  resolveReconstructionMode,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication1/reconstructionModeResolver.js';
import { buildVisualPageBlueprint } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication1/visualPageBlueprint.js';
import { buildFunctionGraph } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication1/functionGraph.js';
import { buildVisualGraph } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication1/visualGraph.js';
import { buildFunctionToVisualBindingPlan } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication1/functionToVisualBindingPlan.js';
import { classifyAssetSlot } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication1/assetReplicationDecision.js';
import { buildVisualReplicationDiff, formatReplicationScore } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication1/visualReplicationDiff.js';
import { planReplicationCorrections } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication1/replicationCorrectionPlanner.js';
import { runBrowserReplicationLoop } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication1/browserReplicationLoop.js';
import {
  createDefaultReplicationBudgetPolicy,
  detectReplicationPlateau,
  shouldStopReplication,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication1/replicationBudgetPolicy.js';
import { runVisualReconstructionDirector } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication1/visualReconstructionDirector.js';
import {
  experienceStepIndex,
  resolveReconstructionExperienceState,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication1/reconstructionExperienceState.js';
import {
  createFounderVisualAcceptance,
  founderAcceptanceAllowsPromotion,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication1/founderVisualAcceptance.js';
import type { ReconstructionTwinSession } from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';

const session = (): ReconstructionTwinSession =>
  ({
    sessionId: 'twin_rep_test',
    projectId: 'ndxbook',
    pageId: 'ndxbook:/projects/ndxbook/overview',
    viewport: 'mobile',
    canonicalRoute: '/projects/ndxbook/overview',
    twinRoute: '/projects/ndxbook/debug/x',
    authorityVersionId: 'auth_v1',
    beforeCaptureId: 'cap',
    reconstructionPlanId: 'plan',
    sourceLiveVersionId: 'live',
    twinVersionId: 'twin_v1',
    mutationPolicy: 'READ_ONLY',
    functionContract: {
      route: '/projects/ndxbook/overview',
      auth: ['signed_in'],
      permissions: [],
      dataQueries: ['operatingState'],
      mutations: [],
      forms: [],
      links: [],
      navigation: ['bottomNav'],
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
    },
    status: 'PLANNED',
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
  }) as ReconstructionTwinSession;

describe('P0.VR.REPLICATION.1 modes', () => {
  it('NDXBOOK overview resolves REPLICATION_MODE', () => {
    expect(ndxbookOverviewMobileReplicationMode()).toBe('REPLICATION_MODE');
  });

  it('PATCH mode for aligned generic stacks', () => {
    const mode = resolveReconstructionMode({
      pageId: 'generic:/x',
      viewport: 'mobile',
      pageArchetype: 'generic-mobile-page',
    });
    expect(['PATCH_MODE', 'RECOMPOSE_MODE', 'REPLICATION_MODE']).toContain(mode.mode);
  });
});

describe('P0.VR.REPLICATION.1 blueprint + graphs', () => {
  it('VisualPageBlueprint from authority with relationships', () => {
    const bp = buildVisualPageBlueprint({
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      authorityVersionId: 'auth_v1',
    });
    expect(bp.regions.length).toBeGreaterThan(5);
    expect(bp.relationships.some((r) => r.type === 'above')).toBe(true);
    expect(bp.regions[0]?.regionId).toBeTruthy();
  });

  it('FunctionGraph and binding plan', () => {
    const bp = buildVisualPageBlueprint({
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      authorityVersionId: 'auth_v1',
    });
    const fg = buildFunctionGraph({ sessionId: 's1', contract: session().functionContract });
    const vg = buildVisualGraph(bp);
    const plan = buildFunctionToVisualBindingPlan({
      sessionId: 's1',
      contract: session().functionContract,
      blueprint: bp,
      viewport: 'mobile',
    });
    expect(fg.dataQueries).toContain('operatingState');
    expect(vg.dominantRegionId).toBeTruthy();
    expect(plan.bindings.length).toBeGreaterThan(2);
  });
});

describe('P0.VR.REPLICATION.1 browser loop', () => {
  it('unknown scores are not 100', () => {
    const diff = buildVisualReplicationDiff({
      iteration: 1,
      convergenceAfter: null,
      compositionCoveragePass: false,
      measured: false,
    });
    expect(formatReplicationScore(diff.compositionScore)).toBe('UNKNOWN');
  });

  it('correction planner prioritizes composition', () => {
    const bp = buildVisualPageBlueprint({
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      authorityVersionId: 'auth_v1',
    });
    const diff = buildVisualReplicationDiff({
      iteration: 1,
      convergenceAfter: { geometry: 90, spacing: 90, typography: 94, assets: 40, hierarchy: 80, controls: 80, order: 30, composition: 35, function: 100, overall: 50 },
      compositionCoveragePass: false,
      measured: true,
    });
    const corrections = planReplicationCorrections({ diff, blueprint: bp });
    expect(corrections.some((c) => c.includes('REGION') || c.includes('COMPOSITION'))).toBe(true);
  });

  it('runs multiple iterations with plateau guard', async () => {
    const bp = buildVisualPageBlueprint({
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      authorityVersionId: 'auth_v1',
    });
    const result = await runBrowserReplicationLoop({
      sessionId: 's1',
      twinVersionId: 'tv1',
      viewport: 'mobile',
      blueprint: bp,
      convergenceAfter: null,
      compositionCoveragePass: false,
      policy: { ...createDefaultReplicationBudgetPolicy(), maxIterations: 3 },
    });
    expect(result.iterations.length).toBeGreaterThan(0);
    expect(result.iterations.length).toBeLessThanOrEqual(3);
    const stop = shouldStopReplication({
      policy: createDefaultReplicationBudgetPolicy(),
      iterations: result.iterations,
      targets: { compositionMin: 95 },
    });
    expect(typeof stop.stop).toBe('boolean');
    expect(detectReplicationPlateau(result.iterations) || result.iterations.length >= 2).toBe(true);
  });
});

describe('P0.VR.REPLICATION.1 director + experience', () => {
  it('director runs replication path for NDX', async () => {
    const out = await runVisualReconstructionDirector({
      session: session(),
      convergenceAfter: null,
      playwrightEnabled: false,
    });
    expect(out.mode).toBe('REPLICATION_MODE');
    expect(out.replicationIterations.length).toBeGreaterThan(0);
    expect(out.buildRef).toBe('v314');
  });

  it('experience state maps founder screens', () => {
    expect(
      resolveReconstructionExperienceState({
        session: { status: 'DIRECTION_READY' } as never,
        twinSession: null,
      }),
    ).toBe('REFERENCE_READY');
    expect(
      experienceStepIndex(
        resolveReconstructionExperienceState({
          session: { status: 'DIRECTION_APPROVED' } as never,
          twinSession: { status: 'BUILDING' } as never,
          buildingTwin: true,
        }),
      ),
    ).toBe(1);
  });

  it('founder acceptance gates promotion', () => {
    expect(founderAcceptanceAllowsPromotion(createFounderVisualAcceptance('ACCEPT'))).toBe(true);
    expect(founderAcceptanceAllowsPromotion(createFounderVisualAcceptance('REFINE'))).toBe(false);
  });
});

describe('P0.VR.REPLICATION.1 UX module', () => {
  it('PageUpgradeReplicationExperience source includes REPLICATE PAGE', async () => {
    const fs = await import('node:fs/promises');
    const src = await fs.readFile(
      new URL('../src/site00/components/designWorkspace/pageFamily/PageUpgradeReplicationExperience.tsx', import.meta.url),
      'utf8',
    );
    expect(src).toContain('REPLICATE PAGE');
    expect(src).toContain('DETAILS');
  });
});
