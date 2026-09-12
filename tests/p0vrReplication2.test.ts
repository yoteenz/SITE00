/**
 * P0.VR.REPLICATION.2 — Shell-first geometric reconstruction contracts.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildNdxAuthorityShellBlueprint,
  evaluateShellMatch,
  expectedShellFirstTwinBandPresence,
  executeShellFirstNdxReplication,
  NDX_AUTHORITY_SHELL_BANDS,
  P0_VR_REPLICATION_2_BUILD,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication2/index.js';
import type { ReconstructionTwinSession } from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

function ndxSession(): ReconstructionTwinSession {
  return {
    sessionId: 'twin_shell_pilot',
    projectId: 'ndxbook',
    pageId: 'ndxbook:/projects/ndxbook/overview',
    viewport: 'mobile',
    canonicalRoute: '/projects/ndxbook/overview',
    twinRoute: '/projects/ndxbook/debug/reconstruction/overview/twin_shell_pilot',
    authorityVersionId: 'auth_v2',
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
      componentChanges: [],
      functionPreservation: ['navigation'],
      goal: 'Shell-first',
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
  };
}

describe('P0.VR.REPLICATION.2 shell-first', () => {
  it('exports build ref v316', () => {
    expect(P0_VR_REPLICATION_2_BUILD).toBe('v316');
  });

  it('authority shell blueprint segments macro bands', () => {
    const bp = buildNdxAuthorityShellBlueprint({
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      authorityVersionId: 'auth_v2',
    });
    expect(bp.bandOrder).toEqual([...NDX_AUTHORITY_SHELL_BANDS]);
    expect(bp.bands.length).toBeGreaterThanOrEqual(10);
    expect(bp.status).toBe('READY');
  });

  it('shell match gate passes for shell-first twin band markers', () => {
    const bp = buildNdxAuthorityShellBlueprint({
      pageId: 'p',
      viewport: 'mobile',
      authorityVersionId: 'a',
    });
    const match = evaluateShellMatch({
      blueprint: bp,
      twinRenderMode: 'SHELL_FIRST_NDX_OVERVIEW',
      twinBandPresence: expectedShellFirstTwinBandPresence(),
    });
    expect(match.status).toBe('PASS');
    expect(match.gateLabel).toBe('SHELL MATCH');
  });

  it('shell match fails when render mode is not shell-first', () => {
    const bp = buildNdxAuthorityShellBlueprint({
      pageId: 'p',
      viewport: 'mobile',
      authorityVersionId: 'a',
    });
    const match = evaluateShellMatch({
      blueprint: bp,
      twinRenderMode: 'AUTHORITY_FIRST_NDX_OVERVIEW',
      twinBandPresence: expectedShellFirstTwinBandPresence(),
    });
    expect(match.status).toBe('FAIL');
  });

  it('executeShellFirstNdxReplication sets shell-first session fields', async () => {
    const result = await executeShellFirstNdxReplication({
      session: ndxSession(),
      twinVersionId: 'twin_v1',
    });
    expect(result.sessionPatch.preVisionBaselineRenderMode).toBe('SHELL_FIRST_NDX_OVERVIEW');
    expect(result.sessionPatch.twinRenderMode).toBe('VISION_LITERAL_NDX_OVERVIEW');
    expect(result.sessionPatch.visionReplicationReport?.heroRecognizable).toBe(true);
    expect(result.shellReceipt.buildRef).toBe('v316');
    expect(result.sessionPatch.authorityShellBlueprintId).toBeTruthy();
  });

  it('pipeline uses shell-first executor for replication mode', () => {
    const pipeline = read(
      'shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/twinBuildPipeline.ts',
    );
    expect(pipeline).toContain('executeShellFirstNdxReplication');
    expect(pipeline).toContain('P0_VR_REPLICATION_2_BUILD');
  });

  it('shell-first twin surface component declares shell bands', () => {
    const twin = read('src/site00/components/reconstruction/ShellFirstNdxOverviewTwin.tsx');
    for (const band of NDX_AUTHORITY_SHELL_BANDS) {
      expect(twin).toContain(`data-shell-band="${band}"`);
    }
  });

  it('NOT LIVE badge can render outside shell strip', () => {
    const page = read('src/site00/pages/ReconstructionTwinPreviewPage.tsx');
    expect(page).toContain('outside-shell-strip');
    expect(page).toContain('site00-reconstruction-twin-chrome');
  });

  it('upgrade UX surfaces design authority panel and shell summary', () => {
    const ux = read('src/site00/components/designWorkspace/pageFamily/PageUpgradeReplicationExperience.tsx');
    expect(ux).toContain('DESIGN AUTHORITY');
    expect(ux).toContain('buildReplicationReviewModel');
    expect(ux).toContain('shellMatchLabel');
  });
});
