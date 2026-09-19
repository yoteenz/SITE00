/**
 * P0.VR.REPLICATION.3A — Drift triangulation + decision trace contracts.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  REPLICATION_FAILURE_LAYERS,
  REPLICATION_DRIFT_STAGES,
  buildDriftTriangulationReport,
  classifyDriftLayer,
  buildReplicationImplementationReceipts,
  buildNdxReplicationRuntimeModuleTrace,
  REPLICATION_POLICY_AUDIT_ENTRIES,
  auditAntiReplicationRules,
  buildRegionLiteralReplicationScore,
  NDX_DRIFT_TRACE_REGION_IDS,
  P0_VR_REPLICATION_3A_BUILD,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3a/index.js';
import { buildNdxAuthorityShellBlueprint } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication2/authorityShellBlueprint.js';
import type { ReconstructionTwinSession } from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

function session(): ReconstructionTwinSession {
  return {
    sessionId: 'twin_drift_3a',
    projectId: 'ndxbook',
    pageId: 'ndxbook:/projects/ndxbook/overview',
    viewport: 'mobile',
    canonicalRoute: '/projects/ndxbook/overview',
    twinRoute: '/projects/ndxbook/debug/reconstruction/overview/twin_drift_3a',
    authorityVersionId: 'auth_live',
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
      functionPreservation: [],
      goal: 'trace',
      measuredSpecId: null,
    },
    status: 'READY_FOR_REVIEW',
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
    twinRenderMode: 'SHELL_FIRST_NDX_OVERVIEW',
  };
}

describe('P0.VR.REPLICATION.3A', () => {
  it('defines failure layers and drift stages', () => {
    expect(REPLICATION_FAILURE_LAYERS).toContain('VISUAL_INTELLIGENCE');
    expect(REPLICATION_FAILURE_LAYERS).toContain('EXECUTION_POLICY');
    expect(REPLICATION_DRIFT_STAGES).toContain('VISUAL_DETECTION');
    expect(P0_VR_REPLICATION_3A_BUILD).toBe('v317');
  });

  it('classifies hero-like detection loss as VISUAL_INTELLIGENCE', () => {
    const result = classifyDriftLayer({
      reference: {
        bounds: 'hero',
        dominantSurfaces: ['black'],
        majorChildBlocks: ['a', 'b', 'c', 'd'],
        textBlockCount: 2,
        imageBlockCount: 4,
        accentColorRole: 'lime',
        layoutDirection: 'split',
        majorRelationships: [],
        assetPresence: ['slices'],
        visualDensity: 'EXPANSIVE',
      },
      detected: {
        summary: 'hero with image and text',
        subregionCount: 2,
        features: ['media', 'copy'],
        confidence: 'LOW',
        provider: 'profile',
        model: 'heuristic',
      },
      blueprint: {
        bandId: 'hero',
        geometry: 'generic',
        buildMode: 'MEASURED',
        contentType: 'hero',
        genericness: 'GENERIC',
      },
      decision: { strategy: 'SHELL', literalReplication: false, collapsedToGeneric: true, notes: 'collapsed' },
      source: {
        component: 'ShellFirst',
        selectorOrClass: '.hero',
        elementSummary: 'single block',
        subregionCount: 1,
      },
      assetMissing: true,
      renderMismatch: true,
    });
    expect(result.layer).toBe('VISUAL_INTELLIGENCE');
  });

  it('buildDriftTriangulationReport uses real NDX pilot regions', () => {
    const blueprint = buildNdxAuthorityShellBlueprint({
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      authorityVersionId: 'auth_live',
    });
    const report = buildDriftTriangulationReport({
      session: session(),
      shellBlueprint: blueprint,
      replicationMode: true,
    });
    expect(report.traces.length).toBe(NDX_DRIFT_TRACE_REGION_IDS.length);
    expect(report.promotionReady).toBe(false);
    expect(report.culpritRanking.length).toBeGreaterThan(0);
    const hero = report.traces.find((t) => t.regionId === 'hero-editorial');
    expect(hero?.decision.collapsedToGeneric).toBe(true);
    expect(report.visualProviderAudit.calledInReplicationPath).toBe(false);
  });

  it('implementation receipt flags composeAuthorityFirstTwin as IMPLEMENTED_NOT_EXECUTED', () => {
    const receipts = buildReplicationImplementationReceipts({ replicationMode: true });
    const compose = receipts.find((r) => r.expectedModule.includes('composeAuthorityFirstTwin'));
    expect(compose?.status).toBe('IMPLEMENTED_NOT_EXECUTED');
  });

  it('runtime module trace shows visual detector not executed', () => {
    const trace = buildNdxReplicationRuntimeModuleTrace({
      replicationMode: true,
      shellFirstExecuted: true,
      visionProviderCalled: false,
    });
    const detector = trace.find((s) => s.moduleId === 'visualDetector');
    expect(detector?.executed).toBe(false);
  });

  it('policy audit finds anti-replication high-risk rules', () => {
    expect(REPLICATION_POLICY_AUDIT_ENTRIES.length).toBeGreaterThan(3);
    expect(auditAntiReplicationRules().length).toBeGreaterThan(0);
  });

  it('hero literal score shows first loss stage', () => {
    const score = buildRegionLiteralReplicationScore('hero-editorial');
    expect(score.referencePct).toBe(100);
    expect(score.renderPct).toBeLessThan(score.referencePct);
    expect(score.firstLossStage).toBeTruthy();
  });

  it('details UI includes drift trace panel', () => {
    const ux = read('src/site00/components/designWorkspace/pageFamily/PageUpgradeReplicationExperience.tsx');
    expect(ux).toContain('DRIFT TRACE');
    expect(ux).toContain('DriftTracePanel');
  });

  it('shell-first executor attaches drift report', () => {
    const exec = read(
      'shared/site00-studio-world-production/visualReconstruction/p0vrReplication2/executeShellFirstNdxReplication.ts',
    );
    expect(exec).toContain('buildDriftTriangulationReport');
    expect(exec).toContain('driftTriangulationReport');
  });
});
