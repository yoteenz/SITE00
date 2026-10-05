/**
 * P0.VR.REPLICATION.4 — Forensic blueprint consumption + zero-invention rebuild.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  NDXBOOK_FORENSIC_OBJECT_COUNT,
  P0_VR_REPLICATION_4_BUILD,
  assertZeroInventionObjectOrder,
  buildBlueprintDomBindings,
  executeForensicBlueprintPipeline,
  getNdxbookMobileForensicBlueprint,
  replicationModeIsForensic,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4/index.js';
import type { ReconstructionTwinSession } from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

function session(): ReconstructionTwinSession {
  return {
    sessionId: 'twin_4fb',
    projectId: 'ndxbook',
    pageId: 'ndxbook:/projects/ndxbook/overview',
    viewport: 'mobile',
    canonicalRoute: '/projects/ndxbook/overview',
    twinRoute: '/twin',
    authorityVersionId: 'auth_4',
    beforeCaptureId: 'c',
    reconstructionPlanId: 'p',
    sourceLiveVersionId: 'live',
    twinVersionId: 'v334',
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
      goal: '4fb',
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
    designAuthorityAssetRef: 'https://cdn.example/authority.png',
  };
}

describe('P0.VR.REPLICATION.4 forensic blueprint', () => {
  it('ingests canonical blueprint with 70 numbered objects', () => {
    const bp = getNdxbookMobileForensicBlueprint();
    expect(bp.objects.length).toBe(NDXBOOK_FORENSIC_OBJECT_COUNT);
    expect(bp.objects[0]?.objectId).toBe('01');
    expect(bp.objects[69]?.objectId).toBe('70');
    expect(bp.colorPalette.length).toBeGreaterThan(5);
    expect(bp.typographyKey.length).toBeGreaterThan(3);
    expect(bp.lineSpecs.length).toBeGreaterThan(3);
    expect(bp.contentViewport.width).toBe(375);
  });

  it('preserves stable object ids 01–16 for masthead and nav', () => {
    const bp = getNdxbookMobileForensicBlueprint();
    const ids = bp.objects.slice(0, 16).map((o) => o.objectId);
    expect(ids).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
    ]);
  });

  it('builds dom bindings for every object', () => {
    const bp = getNdxbookMobileForensicBlueprint();
    const bindings = buildBlueprintDomBindings(bp.objects);
    expect(bindings.length).toBe(70);
    expect(bindings.every((b) => b.domSelector.includes('data-forensic-object-id'))).toBe(true);
  });

  it('executeForensicBlueprintPipeline produces translation receipts and coverage', () => {
    const result = executeForensicBlueprintPipeline({
      session: session(),
      boundaryReport: {
        buildRef: 'v333',
        sessionId: 'twin_4fb',
        twinMount: {} as never,
        regionAssignments: [],
        coordinateSpaces: [],
        sourceClassifications: [],
        bindingChecks: [],
        verdict: {
          CONTENT_ROOT_VALID: true,
          PAGE_NESTING_DETECTED: false,
          HERO_SLOT_MISBOUND: false,
          COORDINATE_SPACE_INVALID: false,
        },
        typedFailures: [],
        founderMessage: null,
        status: 'PASS',
      },
      priorTwinVersionId: 'v334',
    });
    expect(result.report.buildRef).toBe(P0_VR_REPLICATION_4_BUILD);
    expect(result.report.translationReceipts.length).toBe(70);
    expect(result.report.requiredCoverage).toBeGreaterThanOrEqual(95);
    expect(result.report.wholePageScreenshotCheat).toBe(false);
    expect(result.sessionPatch.replicationMode).toBe('FORENSIC_BLUEPRINT_REPLICATION');
  });

  it('zero-invention policy rejects object order drift', () => {
    const bp = getNdxbookMobileForensicBlueprint();
    const expected = bp.objects.map((o) => o.objectId);
    const check = assertZeroInventionObjectOrder(expected, expected);
    expect(check.ok).toBe(true);
    const bad = assertZeroInventionObjectOrder(expected, ['01', '03']);
    expect(bad.ok).toBe(false);
  });

  it('convergence loop runs at most 3 passes', () => {
    const result = executeForensicBlueprintPipeline({
      session: session(),
      boundaryReport: null,
      priorTwinVersionId: 'v334',
    });
    expect(result.report.convergencePasses.length).toBeLessThanOrEqual(3);
  });

  it('wires forensic twin surface and pipeline in repo', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrReplication2/executeShellFirstNdxReplication.ts')).toContain(
      'executeForensicBlueprintPipeline',
    );
    expect(read('src/site00/components/reconstruction/ReconstructionTwinOverviewSurface.tsx')).toContain(
      'ForensicBlueprintNdxOverviewTwin',
    );
    expect(read('src/site00/components/reconstruction/ForensicBlueprintNdxOverviewTwin.tsx')).toContain(
      'data-forensic-object-id',
    );
    expect(replicationModeIsForensic('FORENSIC_BLUEPRINT_REPLICATION')).toBe(true);
  });

  it('live overview route unchanged (no forensic import in live board)', () => {
    const live = read('src/site00/components/founderWorkspace/OverviewFounderWorkspaceBoard.tsx');
    expect(live.includes('ForensicBlueprintNdxOverviewTwin')).toBe(false);
  });
});
