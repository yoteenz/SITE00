/**
 * P0.VR.TWINV3.0R4 — project creative grounding + authority generation inputs
 */

import { describe, expect, it } from 'vitest';
import {
  assertNoUngroundedVisualAssets,
  buildAuthorityCreativeGenerationPayload,
  buildAuthorityGroundedAssetManifest,
  buildNdxbookProjectCreativeContextPackage,
  loadProjectCreativeContextPackage,
  P0_VR_TWIN_V30R4_LINEAGE,
  P0_VR_TWIN_V30_BUILD,
  PROJECT_CREATIVE_CONTEXT_VERSION,
  runDesignPageAuthorityGeneration,
  runDesignPageAuthorityR4SelfCheck,
  runProjectCreativeGroundingGate,
  SOURCE_PRIORITY_RULE,
  createDesignPageAuthorityReviewSession,
  buildAllTerritoryPrompts,
  buildAllTerritoryCreativePayloads,
  assertProjectCreativeGroundingGate,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';

describe('P0.VR.TWINV3.0R4 project creative grounding', () => {
  it('1–3 ProjectCreativeContextPackage + NDXBOOK DNA', () => {
    const pkg = buildNdxbookProjectCreativeContextPackage();
    expect(pkg.projectId).toBe('ndxbook');
    expect(pkg.version).toBe(PROJECT_CREATIVE_CONTEXT_VERSION);
    expect(pkg.status).toBe('READY');
    expect(pkg.creativeDNA.brandTruths.some((t) => t.includes('NOT a library'))).toBe(true);
    expect(pkg.dontRules.some((r) => r.includes('bookstore'))).toBe(true);
  });

  it('4–6 artifact vocabulary + asset source map + source priority', () => {
    const pkg = loadProjectCreativeContextPackage('ndxbook');
    expect(pkg.artifactVocabulary.entries.length).toBeGreaterThanOrEqual(15);
    expect(pkg.artifactVocabulary.entries.some((e) => e.artifactType === 'CULTURAL_RECEIPT')).toBe(true);
    expect(pkg.assetSourceMap.sources.length).toBeGreaterThanOrEqual(3);
    expect(pkg.assetSourceMap.sources[0]!.priority).toBe(1);
    expect(SOURCE_PRIORITY_RULE).toContain('APPROVED PROJECT ASSET');
  });

  it('7–9 visual / typography / material / symbolic language', () => {
    const pkg = loadProjectCreativeContextPackage('ndxbook');
    expect(pkg.visualLanguage.forbiddenMotifs).toContain('library shelves');
    expect(pkg.typographyExpression.hostTypography.toLowerCase()).toContain('martian mono');
    expect(pkg.materialLanguage.forbiddenMaterials).toContain('random glossy 3D');
    expect(pkg.symbolicLanguage.forbiddenSymbols.some((s) => s.includes('book'))).toBe(true);
  });

  it('10–12 workspace expression + function contract + grounding gate pass', () => {
    const pkg = loadProjectCreativeContextPackage('ndxbook');
    expect(pkg.workspaceExpression.hostBoundaries.length).toBeGreaterThanOrEqual(5);
    const gate = runProjectCreativeGroundingGate(pkg);
    expect(gate.pass).toBe(true);
    expect(assertProjectCreativeGroundingGate(pkg).pass).toBe(true);
  });

  it('13 fail closed on missing project package', () => {
    expect(() => loadProjectCreativeContextPackage('frontal-slayer')).toThrow(/PROJECT_CREATIVE_CONTEXT_INCOMPLETE/);
  });

  it('14–16 creative generation payload + prompts include grounding', () => {
    const payloads = buildAllTerritoryCreativePayloads('ndxbook');
    expect(payloads.A.mobile.projectCreativeContextVersion).toBe(PROJECT_CREATIVE_CONTEXT_VERSION);
    const all = buildAllTerritoryPrompts({ clientProjectId: 'ndxbook' });
    const combined = Object.values(all)
      .flatMap((p) => [p.mobile, p.desktop])
      .join('\n');
    const r4 = runDesignPageAuthorityR4SelfCheck({
      promptOrArtifactText: combined,
      territoryPrompts: { A: all.A.mobile, B: all.B.mobile, C: all.C.mobile },
      payloads: {
        A: payloads.A.mobile,
        B: payloads.B.mobile,
        C: payloads.C.mobile,
      },
    });
    expect(r4.pass).toBe(true);
    expect(combined).toContain(P0_VR_TWIN_V30R4_LINEAGE);
    expect(combined).toContain('NO GENERIC FALLBACK');
  });

  it('17–19 AssetGroundingRecord + manifest + ungrounded guard', () => {
    const payload = buildAuthorityCreativeGenerationPayload({
      projectId: 'ndxbook',
      territoryId: 'B',
      viewport: 'desktop',
    });
    const manifest = buildAuthorityGroundedAssetManifest({
      authoritySessionId: 'test-session',
      projectId: 'ndxbook',
      territoryId: 'B',
      viewport: 'desktop',
      payload,
    });
    expect(manifest.status).toBe('PASS');
    expect(manifest.ungroundedAssetCount).toBe(0);
    expect(manifest.assets.every((a) => a.artifactType && a.sourceId)).toBe(true);
    expect(() => assertNoUngroundedVisualAssets([manifest])).not.toThrow();
  });

  it('20–22 generation attaches R4 manifests + QA + version', async () => {
    const session = createDesignPageAuthorityReviewSession();
    const result = await runDesignPageAuthorityGeneration({ session, action: 'GENERATE' });
    expect(result.buildRef).toBe(P0_VR_TWIN_V30_BUILD);
    expect(result.lineage).toBe(P0_VR_TWIN_V30R4_LINEAGE);
    expect(result.r4SelfCheck.pass).toBe(true);
    expect(result.projectCreativeContextVersion).toBe(PROJECT_CREATIVE_CONTEXT_VERSION);
    expect(result.authorityGroundedAssetManifests.length).toBe(6);
    expect(result.ungroundedAssetCount).toBe(0);
    expect(result.projectGroundingQa.projectGrounding).toBe('PASS');
    expect(result.projectGroundingQa.randomAssetRisk).toBe('LOW');
  });

  it('23 territory payload shared artifact family consistency', () => {
    const payloads = buildAllTerritoryCreativePayloads('ndxbook');
    const famA = payloads.A.mobile.sharedArtifactFamily.join(',');
    const famC = payloads.C.desktop.sharedArtifactFamily.join(',');
    expect(famA).toBe(famC);
  });

  it('24 host shell preserved in R3 checks during generation', async () => {
    const session = createDesignPageAuthorityReviewSession();
    const result = await runDesignPageAuthorityGeneration({ session, action: 'GENERATE' });
    expect(result.hostShellPreserved).toBe(true);
    expect(result.r3SelfCheck.pass).toBe(true);
    expect(result.projectGroundingQa.hostProjectFirewall).toBe('PASS');
  });
});
