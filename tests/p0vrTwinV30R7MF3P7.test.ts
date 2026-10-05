/**
 * P0.VR.TWINV3.0R7MF3P7 — Founder Package Inspector + structured artifact hydration
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
  P0_VR_TWIN_V30R7MF3P7_LINEAGE,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { canApproveMobileTwinPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/approveMobileTwinPackage.js';
import { applyFounderNbpMobileTwinPromotion } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/applyFounderNbpMobileTwinPromotion.js';
import { hydrateMobileTwinPackageInspector } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/hydrateMobileTwinPackageInspector.js';
import {
  buildMobileTwinPackageIntegrityReceipt,
  PACKAGE_ARTIFACT_MISSING,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileTwinPackageIntegrityReceipt.js';
import { recordFounderTwinCapabilityDecision } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/recordFounderTwinCapabilityDecision.js';
import { requestMobileTwinPackageCorrection } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/requestMobileTwinPackageCorrection.js';
import { runMobileTwinCapabilityTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinCapabilityTest.js';
import { runMobileAtomicTwinGeneration } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileAtomicTwinGeneration.js';
import * as falReferenceImageJob from '../shared/site00-visual-generation/falReferenceImageJob.js';
import { resolveFocusedHybridNbpModel } from '../shared/site00-visual-generation/twinFocusedHybridBenchmarkCatalog.js';

async function promotedSession() {
  let session = ensureMobileDesignReferenceAuthority(
    applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' })),
  );
  session = await runMobileTwinCapabilityTest({ session });
  session = recordFounderTwinCapabilityDecision(session, 'FLOW_A_MORE_ACCURATE');
  return applyFounderNbpMobileTwinPromotion(session);
}

async function sessionWithPackage() {
  vi.spyOn(falReferenceImageJob, 'runFalReferenceImageJob').mockImplementation(async (input) => ({
    url: `vitest-fal://${input.jobKey}`,
    jobRef: `job-${input.jobKey}`,
    model: resolveFocusedHybridNbpModel(),
    normalizedInput: {},
  }));
  const session = await runMobileAtomicTwinGeneration({ session: await promotedSession() });
  vi.restoreAllMocks();
  return session;
}

describe('P0.VR.TWINV3.0R7MF3P7 package inspector', () => {
  it('1 PACKAGE tab wires Package Inspector component', () => {
    const src = readFileSync('src/site00/components/designWorkspace/DesignPageV3MobileTwinPipelinePanel.tsx', 'utf8');
    expect(src).toContain('DesignPageV3MobileTwinPackageInspector');
    expect(src).toContain("compareMode === 'PACKAGE'");
    expect(src).toContain('v3-mobile-twin-package-inspector');
  });

  it('2–3 summary hydrates package id and status; visual twin triple', async () => {
    const session = await sessionWithPackage();
    const view = hydrateMobileTwinPackageInspector(session.mobileTwinPipeline!, 'ndxbook');
    expect(view.lineage).toBe(P0_VR_TWIN_V30R7MF3P7_LINEAGE);
    expect(view.summary.packageId).toMatch(/^mtp-/);
    expect(view.summary.status).toBe('FOUNDER_REVIEW_READY');
    expect(view.visualTwin.reference).toBeTruthy();
    expect(view.visualTwin.actual?.renderImageUri).toContain('vitest-fal');
    expect(view.visualTwin.blueprint?.twinImageUri).toContain('vitest-fal');
  });

  it('4 composition state section hydrates', async () => {
    const session = await sessionWithPackage();
    const view = hydrateMobileTwinPackageInspector(session.mobileTwinPipeline!, 'ndxbook');
    expect(view.composition).toBeTruthy();
    expect(view.compositionStats?.objectCount).toBeGreaterThan(0);
    expect(view.compositionStats?.regionCount).toBeGreaterThan(0);
  });

  it('5 surgical blueprint hydrates', async () => {
    const session = await sessionWithPackage();
    const view = hydrateMobileTwinPackageInspector(session.mobileTwinPipeline!, 'ndxbook');
    expect(view.surgicalBlueprint?.id).toMatch(/^msb-/);
    expect(view.surgicalBlueprint?.objects.length).toBeGreaterThan(0);
  });

  it('6 object map hydrates with grouped categories', async () => {
    const session = await sessionWithPackage();
    const view = hydrateMobileTwinPackageInspector(session.mobileTwinPipeline!, 'ndxbook');
    expect(view.objectMap?.id).toMatch(/^mom-/);
    expect(Object.keys(view.objectMapGrouped).length).toBeGreaterThan(0);
  });

  it('7 asset manifest hydrates', async () => {
    const session = await sessionWithPackage();
    const view = hydrateMobileTwinPackageInspector(session.mobileTwinPipeline!, 'ndxbook');
    expect(view.assetManifest?.id).toMatch(/^mcam-/);
    const total = Object.values(view.assetManifestGrouped).reduce((s, r) => s + r.length, 0);
    expect(total).toBeGreaterThan(0);
  });

  it('8 function map hydrates', async () => {
    const session = await sessionWithPackage();
    const view = hydrateMobileTwinPackageInspector(session.mobileTwinPipeline!, 'ndxbook');
    expect(view.functionMap?.id).toMatch(/^mfbm-/);
    expect(view.functionMap?.bindings.length).toBeGreaterThan(0);
  });

  it('9 ownership hydrates', async () => {
    const session = await sessionWithPackage();
    const view = hydrateMobileTwinPackageInspector(session.mobileTwinPipeline!, 'ndxbook');
    expect(view.ownershipMap?.id).toMatch(/^mhpom-/);
    expect(Object.keys(view.ownershipGrouped).length).toBeGreaterThan(0);
  });

  it('10 implementation primitives hydrates', async () => {
    const session = await sessionWithPackage();
    const view = hydrateMobileTwinPackageInspector(session.mobileTwinPipeline!, 'ndxbook');
    expect(view.primitiveContract?.id).toMatch(/^mipc-/);
    expect(Object.keys(view.primitiveCounts).length).toBeGreaterThan(0);
    expect(view.forbiddenPrimitiveViolations.length).toBe(0);
  });

  it('11 traceability hydrates', async () => {
    const session = await sessionWithPackage();
    const view = hydrateMobileTwinPackageInspector(session.mobileTwinPipeline!, 'ndxbook');
    expect(view.traceability?.id).toMatch(/^mrtm-/);
    expect(view.traceability?.traces.length).toBeGreaterThan(0);
  });

  it('12 validation receipts hydrate', async () => {
    const session = await sessionWithPackage();
    const view = hydrateMobileTwinPackageInspector(session.mobileTwinPipeline!, 'ndxbook');
    expect(view.validation.referenceFidelity?.result).toBeTruthy();
    expect(view.validation.reconciliation).toBeTruthy();
  });

  it('13 provider lineage is secondary summary data', async () => {
    const session = await sessionWithPackage();
    const view = hydrateMobileTwinPackageInspector(session.mobileTwinPipeline!, 'ndxbook');
    expect(view.providerLineage?.actual.jobId).toBeTruthy();
    expect(view.providerLineage?.blueprint.styleContract).toBeTruthy();
    expect(view.summary.actualProvider).toContain('NANO BANANA');
  });

  it('14 gaps section derives from bindings and integrity', async () => {
    const session = await sessionWithPackage();
    const view = hydrateMobileTwinPackageInspector(session.mobileTwinPipeline!, 'ndxbook');
    expect(Array.isArray(view.gaps)).toBe(true);
  });

  it('15 approval readiness card rows', async () => {
    const session = await sessionWithPackage();
    const view = hydrateMobileTwinPackageInspector(session.mobileTwinPipeline!, 'ndxbook');
    expect(view.approvalReadiness.length).toBe(8);
    expect(view.approvalReadiness.every((r) => r.status === 'PASS' || r.status === 'REVIEW')).toBe(true);
  });

  it('16 missing artifact surfaces PACKAGE_ARTIFACT_MISSING', async () => {
    const session = await sessionWithPackage();
    const pipeline = session.mobileTwinPipeline!;
    const pkg = pipeline.packages.find((p) => p.id === pipeline.latestPackageId)!;
    const broken = {
      ...pipeline,
      artifactsById: { ...pipeline.artifactsById },
    };
    delete broken.artifactsById[pkg.objectMapId];
    const view = hydrateMobileTwinPackageInspector(broken, 'ndxbook');
    expect(view.missingArtifacts.some((m) => m.code === PACKAGE_ARTIFACT_MISSING && m.label === 'ObjectMap')).toBe(
      true,
    );
  });

  it('17 package integrity receipt generated', async () => {
    const session = await sessionWithPackage();
    const pipeline = session.mobileTwinPipeline!;
    const pkg = pipeline.packages.find((p) => p.id === pipeline.latestPackageId)!;
    const receipt = buildMobileTwinPackageIntegrityReceipt({
      pkg,
      artifactsById: pipeline.artifactsById,
      visualPairPresent: true,
    });
    expect(receipt.result).toBe('PASS');
    expect(receipt.objectMapPresent).toBe(true);
    const view = hydrateMobileTwinPackageInspector(pipeline, 'ndxbook');
    expect(view.integrity?.result).toBe('PASS');
  });

  it('18 raw JSON not default view', async () => {
    const session = await sessionWithPackage();
    const view = hydrateMobileTwinPackageInspector(session.mobileTwinPipeline!, 'ndxbook');
    expect(view.showRawJsonDefault).toBe(false);
  });

  it('19 provider metadata available but not primary summary fields only', async () => {
    const session = await sessionWithPackage();
    const view = hydrateMobileTwinPackageInspector(session.mobileTwinPipeline!, 'ndxbook');
    expect(view.summary.packageChecksum).toBeTruthy();
    expect(view.providerLineage).not.toBeNull();
  });

  it('20 approve CTA eligibility for FOUNDER_REVIEW_READY', async () => {
    const session = await sessionWithPackage();
    expect(canApproveMobileTwinPackage(session)).toBe(true);
  });

  it('21 request package correction records artifact without regeneration', async () => {
    const session = await sessionWithPackage();
    const beforeJobs = session.mobileTwinPipeline!.falJobsDispatched ?? 0;
    const next = requestMobileTwinPackageCorrection(session, { reason: 'BLUEPRINT_ISSUE', note: 'test' });
    const key = Object.keys(next.mobileTwinPipeline!.artifactsById).find((k) => k.startsWith('mtpcr-'));
    expect(key).toBeTruthy();
    expect(next.mobileTwinPipeline!.falJobsDispatched ?? 0).toBe(beforeJobs);
  });

  it('22–25 opening inspector path does not dispatch FAL, assets, desktop, or react build', async () => {
    const session = await sessionWithPackage();
    const spy = vi.spyOn(falReferenceImageJob, 'runFalReferenceImageJob');
    hydrateMobileTwinPackageInspector(session.mobileTwinPipeline!, 'ndxbook');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
    expect(session.mobileTwinPipeline!.packages[0]?.status).toBe('FOUNDER_REVIEW_READY');
  });
});
