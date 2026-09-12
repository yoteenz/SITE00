/**
 * P0.VR.REPLICATION.1R1 — NDXBOOK pilot hard-convergence execution contracts.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildNdxbookPilotBlueprint,
  validateNdxPilotBlueprint,
  executeNdxbookReplication,
  initReplicationExecutionReceipt,
  setStage,
  stageLabel,
  NDX_PILOT_STACK_ORDER,
  P0_VR_REPLICATION_1R1_BUILD,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication1R1/index.js';
import type { ReconstructionTwinSession } from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

function ndxTwinSession(overrides: Partial<ReconstructionTwinSession> = {}): ReconstructionTwinSession {
  return {
    sessionId: 'twin_1r1_pilot',
    projectId: 'ndxbook',
    pageId: 'ndxbook:/projects/ndxbook/overview',
    viewport: 'mobile',
    canonicalRoute: '/projects/ndxbook/overview',
    twinRoute: '/projects/ndxbook/debug/reconstruction/overview/twin_1r1_pilot',
    authorityVersionId: 'auth_ndx_mobile',
    beforeCaptureId: 'cap_before',
    reconstructionPlanId: 'plan_1',
    sourceLiveVersionId: 'live_v1',
    twinVersionId: 'twin_v_twin_1r1_pilot_1',
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
      planId: 'plan_1',
      pagePurpose: 'overview',
      geometryChanges: [],
      spacingChanges: [],
      typographyChanges: [],
      assetChanges: [],
      componentChanges: [],
      functionPreservation: ['navigation'],
      goal: 'Match authority',
      measuredSpecId: null,
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
    forensicsReportId: null,
    measuredSpecId: null,
    ...overrides,
  };
}

describe('P0.VR.REPLICATION.1R1', () => {
  it('exports pilot build ref v315', () => {
    expect(P0_VR_REPLICATION_1R1_BUILD).toBe('v315');
  });

  it('NDX pilot authority blueprint loads and validates', () => {
    const blueprint = buildNdxbookPilotBlueprint({
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      authorityVersionId: 'auth_ndx_mobile',
    });
    expect(blueprint.regionOrder).toEqual([...NDX_PILOT_STACK_ORDER]);
    const validation = validateNdxPilotBlueprint(blueprint);
    expect(validation.pass).toBe(true);
  });

  it('replication execution receipt tracks stages with labels', () => {
    let receipt = initReplicationExecutionReceipt('sess');
    receipt = setStage(receipt, 'reference', 'PASS');
    receipt = setStage(receipt, 'blueprint', 'FAIL', { code: 'X', message: 'y' });
    expect(receipt.failedStage).toBe('blueprint');
    expect(stageLabel('blueprint')).toContain('BLUEPRINT');
  });

  it('executeNdxbookReplication produces page-ready session patch', async () => {
    const session = ndxTwinSession();
    const { receipt, sessionPatch } = await executeNdxbookReplication({
      session,
      twinVersionId: 'twin_v_twin_1r1_pilot_1',
      convergenceAfter: null,
    });
    expect(receipt.status).toBe('PASS');
    expect(receipt.nextStrategy).toBe('CONTINUE_REFINEMENT');
    expect(receipt.renderProof).toMatch(/AUTHORITY_FIRST_NDX_OVERVIEW/);
    expect(sessionPatch.status).toBe('READY_FOR_REVIEW');
    expect(sessionPatch.twinRenderMode).toBe('AUTHORITY_FIRST_NDX_OVERVIEW');
    expect(receipt.macroIterations).toBeLessThanOrEqual(3);
  });

  it('direct fallback path when reference missing fails with named stage', async () => {
    const session = ndxTwinSession({ authorityVersionId: '' });
    const { receipt, sessionPatch } = await executeNdxbookReplication({
      session,
      twinVersionId: 'twin_v1',
      convergenceAfter: null,
    });
    expect(receipt.failedStage).toBe('reference');
    expect(sessionPatch.status).toBe('FAILED');
    expect(receipt.nextStrategy).toBe('SWITCH_IMPLEMENTATION_APPROACH');
  });

  it('twin build pipeline defers early compose for REPLICATION_MODE', () => {
    const pipeline = read(
      'shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/twinBuildPipeline.ts',
    );
    expect(pipeline).toContain('executeNdxbookReplication');
    expect(pipeline).toContain('composition deferred to replication executor');
  });

  it('failure UX names stage — not generic region copy', () => {
    const ux = read('src/site00/components/designWorkspace/pageFamily/PageUpgradeReplicationExperience.tsx');
    expect(ux).toContain('WE COULDN');
    expect(ux).toContain('REPLICATION STOPPED AT');
    expect(ux).not.toContain("We couldn't rebuild this region yet");
  });

  it('NOT LIVE badge does not use full-width sticky reconstruction header', () => {
    const css = read('src/site00/styles/site00-reconstruction-twin.css');
    expect(css).toMatch(/position:\s*fixed|fixed/i);
    const banner = read('src/site00/components/reconstruction/ReconstructionTwinBanner.tsx');
    expect(banner).not.toMatch(/RECONSTRUCTION TWIN/);
  });

  it('replicate flow uses async onReplicatePage without setTimeout race', () => {
    const panel = read('src/site00/components/designWorkspace/pageFamily/PageCreativeUpgradePanel.tsx');
    expect(panel).toContain('onReplicatePage');
    expect(panel).not.toContain('setTimeout(() => onBuildTwin');
    const workspace = read('src/site00/components/designWorkspace/pageFamily/PageFamilyWorkspace.tsx');
    expect(workspace).toContain('onReplicatePage={async');
  });

  it('review experience shows authority vs twin compare node', () => {
    const ux = read('src/site00/components/designWorkspace/pageFamily/PageUpgradeReplicationExperience.tsx');
    expect(ux).toContain('Authority vs twin');
    expect(ux).toContain('reviewCompare');
  });
});
