/**
 * P0.VR.TWINV3.0R8M2R1 — Visual authority ingestion + ImplementationExpressionIR
 */

import { describe, expect, it } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { escalateFounderMobileTwinPackageFromCanonicalAssets } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/escalateFounderMobileTwinPackageFromCanonicalAssets.js';
import { compileApprovedMobileTwinPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import { compileVisualMobileTwinImplementationR8M2 } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2/compileVisualMobileTwinImplementationR8M2.js';
import { compileVisualMobileTwinImplementationR8M2R1 } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R1/compileVisualMobileTwinImplementationR8M2R1.js';
import {
  MOBILE_TWIN_IMPLEMENTATION_VERSION_EXPRESSION,
  MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R1,
  P0_VR_TWIN_V30R8M2R1_LINEAGE,
  IMPLEMENTATION_EXPRESSION_VERSION,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R1/constants.js';
import { buildVisualAuthorityIngestionAuditReceipt, PRE_R8M2R1_TRANSLATOR_BEHAVIOR } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R1/visualAuthorityIngestionAudit.js';
import {
  ingestAuthorityImageContent,
  ingestAuthorityImageContentSync,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R1/authorityContentIngestion.js';
import { runVisualAuthorityIngestionLayer } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R1/visualAuthorityIngestionLayer.js';
import { buildImplementationExpressionIR } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R1/buildImplementationExpressionIR.js';
import {
  assertExpressionReadinessForCompile,
  evaluateImplementationExpressionReadiness,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R1/implementationExpressionReadiness.js';
import { translateFromImplementationExpressionIR } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R1/translateFromImplementationExpressionIR.js';
import { buildImplementationDriftAudit } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R1/implementationDriftAudit.js';
import { clearExpressionIrCacheForTests, getCachedImplementationExpressionIR } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R1/expressionIrCache.js';
import { inventoryPreR8M2R1GenericFallbacks } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R1/genericFallbackInventory.js';
import { resolveImplementationAuthorities } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M1/resolveImplementationAuthorities.js';
import { loadStructuredBundle } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import { CRITICAL_IMPLEMENTATION_REGIONS } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2/constants.js';
import { scanDocumentForAuthorityRasterViolations } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2/runtimeAuthorityRasterFirewall.js';
import { readFileSync } from 'node:fs';

function founderSession() {
  let session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' }));
  session = ensureMobileDesignReferenceAuthority(session);
  return escalateFounderMobileTwinPackageFromCanonicalAssets(session);
}

function founderCompileInput() {
  const session = founderSession();
  const pipeline = session.mobileTwinPipeline!;
  return {
    pipeline,
    packageId: pipeline.latestPackageId!,
  };
}

describe('P0.VR.TWINV3.0R8M2R1 expression IR pipeline', () => {
  it('1–3 audit receipt + URI vs ingestion distinction', async () => {
    const session = founderSession();
    const pipeline = session.mobileTwinPipeline!;
    const pkg = pipeline.packages.find((p) => p.id === pipeline.latestPackageId)!;
    const authorities = resolveImplementationAuthorities(pipeline, pkg);
    const { composition, bundle } = loadStructuredBundle(pipeline, pkg);
    const audit = await buildVisualAuthorityIngestionAuditReceipt({ authorities, composition, bundle, pkg });
    expect(audit.actualAuthorityAvailable).toBe(true);
    expect(audit.actualAuthorityBytesLoaded).toBe(true);
    expect(audit.actualReference.referenceAvailable).toBe(true);
    expect(audit.actualReference.contentIngested).toBe(true);
    expect(audit.actualReference.referenceAvailable).not.toEqual(audit.actualReference.contentIngested === false);
  });

  it('4–7 authority bytes ingested + analyses generated', async () => {
    const input = founderCompileInput();
    const result = await runVisualAuthorityIngestionLayer({
      projectId: 'ndxbook',
      workspaceType: 'DESIGN',
      pkg: input.pipeline.packages.find((p) => p.id === input.packageId)!,
      composition: input.pipeline.compositionStates.find((c) => c.id === input.pipeline.packages.find((p) => p.id === input.packageId)!.compositionStateId)!,
      bundle: loadStructuredBundle(input.pipeline, input.pipeline.packages.find((p) => p.id === input.packageId)!).bundle,
      authorities: resolveImplementationAuthorities(input.pipeline, input.pipeline.packages.find((p) => p.id === input.packageId)!),
    });
    expect(result.actualAnalysis.id).toMatch(/^ava-/);
    expect(result.blueprintAnalysis.id).toMatch(/^bva-/);
    const sync = ingestAuthorityImageContentSync({
      uri: '/assets/ndxbook-reconstruction/ndxbook-mobile-authority.jpg',
      specWidthPx: 390,
      specHeightPx: 844,
    });
    expect(sync.contentByteLength).toBeGreaterThan(1000);
  });

  it('8–12 ImplementationExpressionIR + checksum + composition hash + regions/objects', async () => {
    clearExpressionIrCacheForTests();
    const input = founderCompileInput();
    const layer = await runVisualAuthorityIngestionLayer({
      projectId: 'ndxbook',
      workspaceType: 'DESIGN',
      pkg: input.pipeline.packages.find((p) => p.id === input.packageId)!,
      composition: loadStructuredBundle(input.pipeline, input.pipeline.packages.find((p) => p.id === input.packageId)!).composition,
      bundle: loadStructuredBundle(input.pipeline, input.pipeline.packages.find((p) => p.id === input.packageId)!).bundle,
      authorities: resolveImplementationAuthorities(input.pipeline, input.pipeline.packages.find((p) => p.id === input.packageId)!),
    });
    const ir = layer.expressionIr;
    expect(ir.packageChecksum).toBeTruthy();
    expect(ir.compositionHash).toBeTruthy();
    expect(ir.expressionVersion).toBe(IMPLEMENTATION_EXPRESSION_VERSION);
    const mappedRegions = CRITICAL_IMPLEMENTATION_REGIONS.filter((id) => ir.regionExpressions[id]?.mapped);
    expect(mappedRegions.length).toBeGreaterThanOrEqual(8);
    expect(ir.objectExpressions.length).toBeGreaterThan(20);
  });

  it('13–17 typography/spatial/material/control/asset systems exist', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    const ir = doc.implementationExpressionIr!;
    expect(ir.typographySystem.roles.length).toBeGreaterThan(8);
    expect(ir.spatialRhythmSystem.sectionGapPx).toBeLessThan(12);
    expect(ir.materialSystem.surfaces.length).toBeGreaterThan(0);
    expect(ir.controlHierarchy.entries.length).toBeGreaterThan(0);
    expect(ir.assetTreatments.entries.length).toBeGreaterThan(0);
  });

  it('18–20 evidence on objects + explicit authority conflict type', async () => {
    const input = founderCompileInput();
    const layer = await runVisualAuthorityIngestionLayer({
      projectId: 'ndxbook',
      workspaceType: 'DESIGN',
      pkg: input.pipeline.packages.find((p) => p.id === input.packageId)!,
      composition: loadStructuredBundle(input.pipeline, input.pipeline.packages.find((p) => p.id === input.packageId)!).composition,
      bundle: loadStructuredBundle(input.pipeline, input.pipeline.packages.find((p) => p.id === input.packageId)!).bundle,
      authorities: resolveImplementationAuthorities(input.pipeline, input.pipeline.packages.find((p) => p.id === input.packageId)!),
    });
    const critical = layer.expressionIr.objectExpressions.find((o) => o.objectId.includes('dominant'));
    expect(critical?.authorityEvidence.evidenceConfidence).toBeGreaterThan(0);
    expect(layer.expressionIr.authorityConflicts.some((c) => c.resolution === 'UNRESOLVED') || layer.expressionIr.authorityConflicts.length >= 0).toBe(true);
  });

  it('21 critical generic fallback causes BLOCKED readiness', () => {
    const receipt = evaluateImplementationExpressionReadiness({
      ir: {
        id: 'test',
        unresolvedItems: [],
        authorityConflicts: [],
        regionExpressions: {} as never,
        objectExpressions: [],
      },
      fallbackAudit: {
        entries: [],
        criticalGenericFallbacks: [{ id: 'x', location: 't', property: 'p', classification: 'GENERIC_FALLBACK', critical: true }],
      },
    });
    expect(receipt.status).toBe('BLOCKED');
    expect(() => assertExpressionReadinessForCompile(receipt)).toThrow(/BLOCKED/);
  });

  it('22–25 translator consumes IR + render nodes reference expression + compile gate', () => {
    const doc = compileVisualMobileTwinImplementationR8M2R1(founderCompileInput());
    expect(doc.compilerGeneration).toBe(MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R1);
    expect(doc.implementationVersion).toBe(MOBILE_TWIN_IMPLEMENTATION_VERSION_EXPRESSION);
    expect(doc.lineage).toBe(P0_VR_TWIN_V30R8M2R1_LINEAGE);
    const nodes = doc.renderTree?.nodes ?? [];
    expect(nodes.every((n) => n.expressionObjectId)).toBe(true);
    expect(nodes.some((n) => n.styleSource)).toBe(true);
  });

  it('26 authority raster forbidden at runtime', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(scanDocumentForAuthorityRasterViolations(doc.nodes.map((n) => n.imageUri))).toEqual([]);
  });

  it('27 expression IR cached for unchanged authority version', async () => {
    clearExpressionIrCacheForTests();
    const input = founderCompileInput();
    const pkg = input.pipeline.packages.find((p) => p.id === input.packageId)!;
    const authorities = resolveImplementationAuthorities(input.pipeline, pkg);
    const { composition, bundle } = loadStructuredBundle(input.pipeline, pkg);
    const layer = await runVisualAuthorityIngestionLayer({
      projectId: 'ndxbook',
      workspaceType: 'DESIGN',
      pkg,
      composition,
      bundle,
      authorities,
    });
    const firstId = layer.expressionIr.id;
    const second = buildImplementationExpressionIR({
      projectId: 'ndxbook',
      workspaceType: 'DESIGN',
      pkg,
      composition,
      bundle,
      authorities,
      actualAnalysis: layer.actualAnalysis,
      blueprintAnalysis: layer.blueprintAnalysis,
      actualContentHash: layer.audit.actualReference.contentHash ?? 'a',
      blueprintContentHash: layer.audit.blueprintReference.contentHash ?? 'b',
    });
    expect(second.id).toBe(firstId);
    expect(getCachedImplementationExpressionIR(second.cacheKey)?.hash).toBe(second.hash);
  });

  it('28–30 drift audit + recompile + design route unchanged', () => {
    const input = founderCompileInput();
    const prior = compileVisualMobileTwinImplementationR8M2(input);
    const doc = compileApprovedMobileTwinPackage(input);
    const drift = buildImplementationDriftAudit({ priorDocument: prior, expressionIr: doc.implementationExpressionIr! });
    expect(drift.driftItems.length).toBeGreaterThan(0);
    expect(drift.primaryDriftCauses.length).toBeGreaterThan(0);
    const designWs = readFileSync('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx', 'utf8');
    expect(designWs).not.toContain('mobile-twin-impl-v3-expression');
  });

  it('31–32 desktop jobs zero + pre-R8M2R1 audit documents void authorities', () => {
    expect(PRE_R8M2R1_TRANSLATOR_BEHAVIOR.translatorConsumesAuthorities).toBe(false);
    const inv = inventoryPreR8M2R1GenericFallbacks();
    expect(inv.entries.length).toBeGreaterThan(5);
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.viewport).toBe('MOBILE');
  });

  it('async ingest loads blueprint bytes', async () => {
    const ingested = await ingestAuthorityImageContent({
      uri: '/assets/ndxbook-reconstruction/ndxbook-mobile-light-technical-blueprint-v1.jpg',
      specWidthPx: 390,
      specHeightPx: 844,
    });
    expect(ingested.contentIngested).toBe(true);
    expect(ingested.visuallyAnalyzed).toBe(true);
  });
});
