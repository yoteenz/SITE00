/**
 * P0.VR.REPLICATION.3C-R1 — Hero asset materialization proof.
 */

import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import {
  cropAuthorityImageBuffer,
  bufferToDataUrl,
  materializeHeroProofSlotFromBuffer,
  materializeHeroProofSlot,
  isBrowserSafeAssetUrl,
  HERO_MATERIALIZATION_PROOF_SLOT_ID,
  P0_VR_REPLICATION_3C_R1_BUILD,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3cR1/index.js';
import { executeReplication3cPipeline } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3c/executeReplication3cPipeline.js';
import { observationToLiteralRegionSpec, buildNdxHeroStructuralObservation } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3b/ndxStructuralVisionSeed.js';
import type { ReconstructionTwinSession } from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import type { VisionReplicationReport } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3b/types.js';

async function syntheticAuthorityPng(): Promise<Buffer> {
  return sharp({
    create: {
      width: 390,
      height: 844,
      channels: 3,
      background: { r: 10, g: 10, b: 10 },
    },
  })
    .composite([
      {
        input: await sharp({
          create: { width: 120, height: 80, channels: 3, background: { r: 180, g: 175, b: 170 } },
        })
          .png()
          .toBuffer(),
        left: 140,
        top: 250,
      },
      {
        input: await sharp({
          create: { width: 90, height: 60, channels: 3, background: { r: 90, g: 85, b: 80 } },
        })
          .png()
          .toBuffer(),
        left: 150,
        top: 320,
      },
    ])
    .png()
    .toBuffer();
}

function session(authorityDataUrl: string): ReconstructionTwinSession {
  return {
    sessionId: 'twin_3cr1',
    projectId: 'ndxbook',
    pageId: 'ndxbook:/projects/ndxbook/overview',
    viewport: 'mobile',
    canonicalRoute: '/projects/ndxbook/overview',
    twinRoute: '/projects/ndxbook/debug/reconstruction/overview/twin_3cr1',
    authorityVersionId: 'auth',
    beforeCaptureId: 'cap',
    reconstructionPlanId: 'plan',
    sourceLiveVersionId: 'live',
    twinVersionId: 'twin_v330',
    mutationPolicy: 'READ_ONLY',
    designAuthorityAssetRef: authorityDataUrl,
    functionContract: {
      route: '/projects/ndxbook/overview',
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
      planId: 'plan',
      pagePurpose: 'overview',
      geometryChanges: [],
      spacingChanges: [],
      typographyChanges: [],
      assetChanges: [],
      componentChanges: [],
      functionPreservation: [],
      goal: '3cr1',
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
  };
}

function visionReport(): VisionReplicationReport {
  const spec = observationToLiteralRegionSpec(buildNdxHeroStructuralObservation());
  return {
    reportId: 'vr',
    sessionId: 'twin_3cr1',
    buildRef: 'v330',
    providerAudit: { provider: 'test', model: 'fixture', apiKeyPresent: false },
    regionObservations: [buildNdxHeroStructuralObservation()],
    literalRegionSpecs: [spec],
    generatedSources: [],
    correctionPasses: [],
    heroRecognizable: true,
    capabilityLimit: false,
    playwrightLoopUsed: false,
    createdAt: new Date().toISOString(),
  };
}

describe('P0.VR.REPLICATION.3C-R1 materialization', () => {
  it('exports proof slot and build ref', () => {
    expect(HERO_MATERIALIZATION_PROOF_SLOT_ID).toBe('slice_b');
    expect(P0_VR_REPLICATION_3C_R1_BUILD).toBe('v331');
  });

  it('authority crop has non-zero dimensions and variance', async () => {
    const authority = await syntheticAuthorityPng();
    const cropped = await cropAuthorityImageBuffer({ source: authority, slotId: 'slice_b' });
    expect(cropped.ok).toBe(true);
    if (cropped.ok) {
      expect(cropped.width).toBeGreaterThan(0);
      expect(cropped.height).toBeGreaterThan(0);
      expect(cropped.lumaStdDev).toBeGreaterThan(4);
    }
  });

  it('materializes persisted data URL for proof slot', async () => {
    const authority = await syntheticAuthorityPng();
    const result = await materializeHeroProofSlotFromBuffer({
      authorityBuffer: authority,
      sessionId: 'twin_3cr1',
    });
    expect(result.ok).toBe(true);
    expect(result.publicUrl?.startsWith('data:image/jpeg')).toBe(true);
    expect(isBrowserSafeAssetUrl(result.publicUrl)).toBe(true);
    expect(result.trace.visible).toBe(true);
    expect(result.trace.decoded).toBe(true);
    expect(result.trace.naturalWidth).toBeGreaterThan(0);
  });

  it('pipeline binds materialized URL on proof slot', async () => {
    const authority = await syntheticAuthorityPng();
    const dataUrl = bufferToDataUrl(authority, 'image/png');
    const result = await executeReplication3cPipeline({
      session: session(dataUrl),
      visionReport: visionReport(),
      authorityImageUrl: dataUrl,
      priorTwinVersionId: 'twin_v330',
    });
    const proof = result.report.assetSlots.find((s) => s.slotId === 'slice_b');
    expect(proof?.materializedPublicUrl?.startsWith('data:image/jpeg')).toBe(true);
    expect(result.report.proofSlotVisible).toBe(true);
    expect(result.sessionPatch.replicationAssetSlots?.find((s) => s.slotId === 'slice_b')?.bindingStage).toBe('PERSISTED');
  });

  it('rejects uniform blank authority crop', async () => {
    const flat = await sharp({
      create: { width: 200, height: 400, channels: 3, background: { r: 40, g: 40, b: 40 } },
    })
      .png()
      .toBuffer();
    const cropped = await cropAuthorityImageBuffer({ source: flat, slotId: 'slice_b' });
    expect(cropped.ok).toBe(false);
    if (!cropped.ok) expect(cropped.code).toBe('AUTHORITY_CROP_INVALID');
  });

  it('materializeHeroProofSlot accepts data URL authority', async () => {
    const authority = await syntheticAuthorityPng();
    const dataUrl = bufferToDataUrl(authority, 'image/png');
    const result = await materializeHeroProofSlot({ authorityUrl: dataUrl, sessionId: 'x' });
    expect(result.ok).toBe(true);
  });

  it('browser decodes materialized proof URL (Playwright)', async () => {
    const authority = await syntheticAuthorityPng();
    const materialized = await materializeHeroProofSlotFromBuffer({
      authorityBuffer: authority,
      sessionId: 'browser_proof',
    });
    expect(materialized.publicUrl).toBeTruthy();

    const { chromium } = await import('playwright');
    const { writeFileSync, mkdirSync } = await import('node:fs');
    const { join } = await import('node:path');
    const outDir = '/opt/cursor/artifacts';
    mkdirSync(outDir, { recursive: true });

    const html = `<!DOCTYPE html><html><body style="margin:0;background:#000"><img id="p" src="${materialized.publicUrl}" style="width:120px;height:48px;object-fit:cover"/></body></html>`;
    const htmlPath = join(outDir, 'hero-materialization-proof.html');
    writeFileSync(htmlPath, html);

    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`);
    const metrics = await page.evaluate(() => {
      const img = document.getElementById('p');
      if (!(img instanceof HTMLImageElement)) return null;
      const r = img.getBoundingClientRect();
      return {
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        renderedWidth: r.width,
        renderedHeight: r.height,
      };
    });
    await page.screenshot({ path: join(outDir, 'hero-materialization-proof-screenshot.png') });
    await browser.close();

    expect(metrics?.complete).toBe(true);
    expect(metrics?.naturalWidth).toBeGreaterThan(0);
    expect(metrics?.naturalHeight).toBeGreaterThan(0);
    expect(metrics?.renderedWidth).toBeGreaterThan(0);
    expect(metrics?.renderedHeight).toBeGreaterThan(0);
  }, 60_000);

  it('twin source uses img for proof slot', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const twin = readFileSync(
      join(import.meta.dirname, '..', 'src/site00/components/reconstruction/VisionLiteralNdxOverviewTwin.tsx'),
      'utf8',
    );
    expect(twin).toContain('HeroMaterializedSliceImage');
    expect(twin).toContain('materializedPublicUrl');
  });
});
