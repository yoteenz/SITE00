/**
 * P0.VR.REPLICATION.3B — Vision-in-the-loop literal replication.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  executeVisionLiteralNdxReplication,
  createTestFixtureVisionClient,
  runVisionReplicationInspector,
  generateLiteralRegionSource,
  assertLiteralSourceNotCollapsed,
  REPLICATION_LITERAL_POLICY_RULES,
  antiInterpretationPolicyActive,
  isVisionOutputTooGeneric,
  MAX_HERO_VISION_CORRECTION_PASSES,
  LITERAL_UI_REPLICATION_PROMPT_CLASS,
  auditVisionReplicationProvider,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3b/index.js';
import { buildNdxHeroStructuralObservation } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3b/ndxStructuralVisionSeed.js';
import type { ReconstructionTwinSession } from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

function session(): ReconstructionTwinSession {
  return {
    sessionId: 'twin_vision_3b',
    projectId: 'ndxbook',
    pageId: 'ndxbook:/projects/ndxbook/overview',
    viewport: 'mobile',
    canonicalRoute: '/projects/ndxbook/overview',
    twinRoute: '/projects/ndxbook/debug/reconstruction/overview/twin_vision_3b',
    authorityVersionId: 'auth_live',
    beforeCaptureId: 'cap',
    reconstructionPlanId: 'plan',
    sourceLiveVersionId: 'live',
    twinVersionId: 'twin_v324',
    mutationPolicy: 'READ_ONLY',
    designAuthorityAssetRef: 'https://cdn.example.com/ndxbook-authority-mobile.png',
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
      goal: 'vision-literal',
      measuredSpecId: null,
    },
    status: 'BUILDING',
    buildSteps: [],
    twinCapture: null,
    revisions: [],
    twinVersions: [{ versionId: 'twin_v324', sessionId: 'twin_vision_3b', revisionNumber: 1, buildRef: 'v316', commitSha: null, createdAt: new Date().toISOString(), status: 'READY' }],
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

describe('P0.VR.REPLICATION.3B', () => {
  it('audits vision-capable provider config', () => {
    const audit = auditVisionReplicationProvider();
    expect(audit.visionCapability).toBe(true);
    expect(audit.model).toContain('claude');
  });

  it('rejects generic hero vision output', () => {
    expect(
      isVisionOutputTooGeneric({
        regionId: 'hero-editorial',
        authorityDescription: 'dark hero with text and image',
        twinDescription: 'hero block',
        visibleDifferences: [],
        missingElements: [],
        extraElements: [],
        geometryDifferences: [],
        surfaceDifferences: [],
        typographyDifferences: [],
        assetDifferences: [],
        layoutRelationships: [],
        literalCorrections: [],
        confidence: 'LOW',
        status: 'OK',
      }),
    ).toBe(true);
  });

  it('hero structural observation is not generic', () => {
    const obs = buildNdxHeroStructuralObservation();
    expect(isVisionOutputTooGeneric(obs)).toBe(false);
    expect(obs.authorityDescription.toLowerCase()).toContain('lime');
  });

  it('LiteralRegionSpec reaches source generator without collapse', () => {
    const client = createTestFixtureVisionClient();
    return runVisionReplicationInspector({
      authorityImage: 'https://cdn.example.com/a.png',
      twinScreenshot: 'twin-route:preview',
      viewport: 'mobile',
      regionIds: ['hero-editorial'],
      client,
    }).then((result) => {
      const spec = result.literalSpecs.find((s) => s.regionId === 'hero-editorial');
      expect(spec?.subregions.length).toBeGreaterThanOrEqual(3);
      const source = generateLiteralRegionSource(spec!);
      const guard = assertLiteralSourceNotCollapsed({ spec: spec!, generatedSubregionCount: source.subregionCount });
      expect(guard.ok).toBe(true);
    });
  });

  it('executeVisionLiteralNdxReplication receives authority image on replicate path', async () => {
    const result = await executeVisionLiteralNdxReplication({
      session: session(),
      twinVersionId: 'twin_v324',
      authorityImageUrl: session().designAuthorityAssetRef,
      visionClient: createTestFixtureVisionClient(),
    });
    expect(result.report.receipts[0].inputImages[0].received).toBe(true);
    expect(result.report.receipts[0].visionPromptClass).toBe(LITERAL_UI_REPLICATION_PROMPT_CLASS);
    expect(result.report.literalRegionSpecs.some((s) => s.regionId === 'hero-editorial')).toBe(true);
    expect(result.report.heroRecognizable).toBe(true);
    expect(result.sessionPatch.preVisionBaselineRenderMode).toBe('SHELL_FIRST_NDX_OVERVIEW');
    expect(result.sessionPatch.twinRenderMode).toBe('VISION_LITERAL_NDX_OVERVIEW');
  });

  it('caps hero correction passes at 3', async () => {
    const result = await executeVisionLiteralNdxReplication({
      session: session(),
      twinVersionId: 'twin_v324',
      authorityImageUrl: session().designAuthorityAssetRef,
      visionClient: createTestFixtureVisionClient(),
    });
    const heroPasses = result.report.correctionPasses.filter((p) => p.regionId === 'hero-editorial');
    expect(heroPasses.length).toBeLessThanOrEqual(MAX_HERO_VISION_CORRECTION_PASSES);
  });

  it('ReplicationLiteralPolicy active', () => {
    expect(REPLICATION_LITERAL_POLICY_RULES.length).toBeGreaterThanOrEqual(6);
    expect(antiInterpretationPolicyActive()).toBe(true);
  });

  it('shell-first executor wires vision literal replication', () => {
    const exec = read('shared/site00-studio-world-production/visualReconstruction/p0vrReplication2/executeShellFirstNdxReplication.ts');
    expect(exec).toContain('executeVisionLiteralNdxReplication');
    expect(exec).toContain('visionReplicationReport');
  });

  it('UI exposes vision literal twin and trace', () => {
    expect(read('src/site00/components/reconstruction/ReconstructionTwinOverviewSurface.tsx')).toContain('VisionLiteralNdxOverviewTwin');
    expect(read('src/site00/components/designWorkspace/pageFamily/PageUpgradeReplicationExperience.tsx')).toContain('VISION TRACE');
  });

  it('vision replication API route exists', () => {
    expect(read('api/site00/vision-replication.ts')).toContain('inspect_region');
    expect(read('api/_lib/site00VisualReconstruction/visionReplicationAnthropic.ts')).toContain('LITERAL_VISION_SYSTEM');
  });

  it('preserves new twin version id', async () => {
    const result = await executeVisionLiteralNdxReplication({
      session: session(),
      twinVersionId: 'twin_v324',
      authorityImageUrl: session().designAuthorityAssetRef,
      visionClient: createTestFixtureVisionClient(),
    });
    expect(result.report.newTwinVersionId).toContain('vision');
    expect(result.sessionPatch.twinVersions?.length).toBeGreaterThan(1);
  });
});
