/**
 * P0.VR.1D.4A — Founder mood board ingest + live 6×6 reconstruction tests.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  verifyFounderBoardCanonicalResolution,
  founderReferenceReady,
  runFounderMoodBoardIngestAndLiveReconstruction,
  FOUNDER_REFERENCE_SOURCE,
  FAIL_REGION_MAPPING_RUNTIME,
  P0_VR_1D4A_LINEAGE,
  P0_VR_1D4A_REUSED_LINEAGE,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d4a/index.js';
import { ingestNdxProjectHubMoodBoards } from '../shared/site00-brand-lore/visualReconstruction/ndxProjectHubReferenceDecomposition.js';
import { resolveNdxFounderProjectHubBoards } from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d2/index.js';

const ROOT = process.cwd();
const DESKTOP_CANONICAL = join(ROOT, 'visual-references/founder/ndxbook/desktop-mood-board.png');
const MOBILE_CANONICAL = join(ROOT, 'visual-references/founder/ndxbook/mobile-mood-board.png');

describe('P0.VR.1D.4A founder board canonical resolution', () => {
  it('persists founder boards at canonical paths', () => {
    expect(existsSync(DESKTOP_CANONICAL)).toBe(true);
    expect(existsSync(MOBILE_CANONICAL)).toBe(true);
    expect(readFileSync(DESKTOP_CANONICAL).length).toBeGreaterThan(100_000);
    expect(readFileSync(MOBILE_CANONICAL).length).toBeGreaterThan(100_000);
  });

  it('resolves founder reference without fixture fallback', async () => {
    const proof = await verifyFounderBoardCanonicalResolution({ projectRoot: ROOT });
    expect(proof.source).toBe(FOUNDER_REFERENCE_SOURCE);
    expect(proof.fixtureFallback).toBe(false);
    expect(proof.desktopResolved).toBe(true);
    expect(proof.mobileResolved).toBe(true);
    expect(proof.desktopResolvedUrl).toBeTruthy();
    expect(proof.mobileResolvedUrl).toBeTruthy();
    expect(founderReferenceReady(proof)).toBe(true);
  });

  it('resolveNdxFounderProjectHubBoards uses canonical local not fixtures', async () => {
    const resolution = await resolveNdxFounderProjectHubBoards({
      projectRoot: ROOT,
      allowFixtureFallback: false,
      requireFounderReference: true,
    });
    expect(resolution.fixtureSubstitution).toBe(false);
    expect(resolution.source).not.toBe('FIXTURE_FALLBACK');
    expect(resolution.desktopPath).toContain('desktop-mood-board.png');
    expect(resolution.mobilePath).toContain('mobile-mood-board.png');
  });
});

describe('P0.VR.1D.4A screen extraction from real founder boards', () => {
  it('extracts six desktop and six mobile screens', () => {
    const extraction = ingestNdxProjectHubMoodBoards({
      projectSlug: 'ndxbook',
      desktopImageWidth: 1672,
      desktopImageHeight: 941,
      mobileImageWidth: 1672,
      mobileImageHeight: 941,
    });
    expect(extraction.desktop.screens).toHaveLength(6);
    expect(extraction.mobile.screens).toHaveLength(6);
    expect(extraction.desktop.treatedAsSingleScreen).toBe(false);
    for (const screen of [...extraction.desktop.screens, ...extraction.mobile.screens]) {
      expect(['SUFFICIENT', 'PARTIALLY_SUFFICIENT', 'INSUFFICIENT']).toContain(screen.referenceResolution);
    }
  });

  it('lineage constants set', () => {
    expect(P0_VR_1D4A_LINEAGE).toBe('P0.VR.1D.4A');
    expect(P0_VR_1D4A_REUSED_LINEAGE).toContain('P0.VR.1D.4');
    expect(FAIL_REGION_MAPPING_RUNTIME).toBe('FAIL_REGION_MAPPING_RUNTIME');
  });
});

describe('P0.VR.1D.4A live 6×6 reconstruction', () => {
  it('runs live reconstruction with real founder boards when Vite is available', async () => {
    let viteUp = false;
    try {
      const res = await fetch('http://127.0.0.1:5174/', { signal: AbortSignal.timeout(3000) });
      viteUp = res.ok;
    } catch {
      viteUp = false;
    }
    if (!viteUp) {
      console.warn('[P0.VR.1D.4A] Vite not available — skipping live run');
      return;
    }

    const report = await runFounderMoodBoardIngestAndLiveReconstruction({
      projectRoot: ROOT,
      skipPersist: true,
      maxIterations: 1,
      executePatches: true,
      baseUrl: 'http://127.0.0.1:5174',
    });

    expect(report.reconstructionBlocked).toBe(false);
    expect(report.liveFixtureFallbackUsed).toBe(false);
    expect(report.founderReferenceProof.source).toBe(FOUNDER_REFERENCE_SOURCE);
    expect(report.desktopScreens).toHaveLength(6);
    expect(report.mobileScreens).toHaveLength(6);
    expect(report.alignedReport?.actualReconstructionExecuted).toBe(true);
    expect(report.alignedReport?.skipRenderUsed).toBe(false);

    for (const screen of [...report.desktopScreens, ...report.mobileScreens]) {
      expect(screen.referenceCropPath).toBeTruthy();
      expect(screen.iterations).toBeGreaterThanOrEqual(1);
      expect(['SUFFICIENT', 'PARTIALLY_SUFFICIENT', 'INSUFFICIENT']).toContain(screen.resolution.status);
    }
  }, 600_000);
});
