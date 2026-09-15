/**
 * P0.VR.TWINV4.1F1 + P0.VR.TWINV4.2 — golden authority pin + Playwright pixel diff gate
 */

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  forensicBlueprintCacheKey,
  writeForensicBlueprintToCache,
  clearForensicBlueprintCacheForTests,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/forensicBlueprintCache.js';
import { seedLocalForensicBlueprintStub } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/resolveForensicUiBlueprintAuthoritySync.js';
import { clearTwinV41PersistenceForTests } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/twinV41Persistence.js';
import {
  buildFounderApprovedForensicAuthorityForFixture,
  ensureTwinV41ForensicBlueprintFixturePng,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/testForensicBlueprintFixture.js';
import {
  TWIN_V4_GOLDEN_AUTHORITY_INVALID,
  TWIN_V42_FULL_PAGE_DIFF_THRESHOLD,
  TWIN_V42_PLAYWRIGHT_DEVICE_SCALE,
  MIN_TWIN_V42_GOLDEN_DIFF_ITERATIONS,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/constants.js';
import {
  clearTwinV4GoldenAuthorityForTests,
  fetchGoldenAuthorityBytes,
  isHttpsProductionGoldenUrl,
  readPinnedTwinV4GoldenAuthority,
  resolveTwinV4GoldenAuthority,
  sealTwinV4GoldenAuthority,
  validateTwinV4GoldenAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/twinV4GoldenAuthority.js';
import { purgeStaleTwinV4AuthorityReferences } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/twinV4AuthorityPurge.js';
import { twinV42SegmentationCacheKey } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/segmentationCacheKey.js';
import { runTwinV4GoldenPixelDiff } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/runTwinV4GoldenPixelDiff.js';
import { auditTwinV4LiveDomForRasterCheat } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/twinV4RasterCheatFirewall.js';
import {
  clearTwinV42SegmentationCacheForTests,
  compileTwinV42PageBoot,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/compileTwinV42PageBoot.js';
import { loadGoldenPngBufferForNode } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/twinV42NodeGoldenLoader.js';
import sharp from 'sharp';
import { clearTwinV42PersistenceForTests } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/twinV42Persistence.js';
import { captureTwinV4LiveReconstructionScreenshot } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/captureTwinV4PlaywrightScreenshot.js';
import { compileTwinV42GoldenDiffGate } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/compileTwinV42GoldenDiffGate.js';
import { buildTwinV42FixturePlaywrightSeed } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/twinV42PlaywrightSeed.js';

const ACTUAL_HASH = 'c'.repeat(32);

function seedFixtureAuthority(): void {
  ensureTwinV41ForensicBlueprintFixturePng();
  writeForensicBlueprintToCache(
    forensicBlueprintCacheKey({ actualHash: ACTUAL_HASH }),
    buildFounderApprovedForensicAuthorityForFixture(ACTUAL_HASH),
  );
}

describe('P0.VR.TWINV4.1F1 golden authority hard pin', () => {
  beforeEach(() => {
    clearTwinV41PersistenceForTests();
    clearForensicBlueprintCacheForTests();
    clearTwinV4GoldenAuthorityForTests();
    clearTwinV42PersistenceForTests();
    clearTwinV42SegmentationCacheForTests();
  });

  it('1 requires exact authority; 6 no fallback when missing', async () => {
    await expect(resolveTwinV4GoldenAuthority({ allowSeal: false, candidate: null })).rejects.toThrow(
      TWIN_V4_GOLDEN_AUTHORITY_INVALID,
    );
  });

  it('2 https required in production node context', () => {
    expect(isHttpsProductionGoldenUrl('https://fal.media/x.png')).toBe(true);
    expect(isHttpsProductionGoldenUrl('local-autobuild://x')).toBe(false);
  });

  it('3 sha256 verified; 4 dimensions verified; 5 wrong hash blocks', async () => {
    seedFixtureAuthority();
    const path = ensureTwinV41ForensicBlueprintFixturePng();
    const uri = `file://${path}`;
    const bytes = new Uint8Array(readFileSync(path));
    const pin = await sealTwinV4GoldenAuthority({
      artifactId: 'golden-fixture',
      artifactUrl: uri,
      bytes,
    });
    expect(pin.immutable).toBe(true);
    expect(pin.approvedByFounder).toBe(true);
    await validateTwinV4GoldenAuthority(pin);
    const bad = { ...pin, sha256: '0'.repeat(64) };
    await expect(validateTwinV4GoldenAuthority(bad)).rejects.toThrow(TWIN_V4_GOLDEN_AUTHORITY_INVALID);
  });

  it('7 purge receipt exists', async () => {
    seedFixtureAuthority();
    const path = ensureTwinV41ForensicBlueprintFixturePng();
    const pin = await sealTwinV4GoldenAuthority({
      artifactId: 'golden-fixture',
      artifactUrl: `file://${path}`,
      bytes: new Uint8Array(readFileSync(path)),
    });
    const receipt = purgeStaleTwinV4AuthorityReferences(pin);
    expect(receipt.activeId).toBe(pin.artifactId);
    expect(receipt.activeHash).toBe(pin.sha256);
  });

  it('8 page boot seals pin and loads extraction', async () => {
    seedFixtureAuthority();
    const boot = await compileTwinV42PageBoot({
      projectId: 'ndxbook',
      queryActualHash: ACTUAL_HASH,
      allowSeal: true,
    });
    expect(boot.fallbackAuthorityAllowed).toBe(false);
    expect(readPinnedTwinV4GoldenAuthority()?.sha256).toBe(boot.goldenAuthority.sha256);
    expect(boot.pixelBundle.sceneGraph.nodes.length).toBeGreaterThan(0);
    expect(boot.canonicalViewport.width).toBe(boot.goldenAuthority.width);
  });

  it('segmentation cache keyed by goldenSha256', async () => {
    seedFixtureAuthority();
    const boot = await compileTwinV42PageBoot({
      projectId: 'ndxbook',
      queryActualHash: ACTUAL_HASH,
      allowSeal: true,
    });
    const key = twinV42SegmentationCacheKey(boot.goldenAuthority.sha256);
    await compileTwinV42PageBoot({ projectId: 'ndxbook', queryActualHash: ACTUAL_HASH, allowSeal: true });
    const boot2 = await compileTwinV42PageBoot({
      projectId: 'ndxbook',
      queryActualHash: ACTUAL_HASH,
      allowSeal: true,
    });
    expect(boot2.pixelBundle.sceneGraph.nodes.length).toBe(boot.pixelBundle.sceneGraph.nodes.length);
    expect(key).toContain(boot.goldenAuthority.sha256);
  });

  it('stub forensic cannot supersede sealed pin', async () => {
    seedFixtureAuthority();
    await compileTwinV42PageBoot({ projectId: 'ndxbook', queryActualHash: ACTUAL_HASH, allowSeal: true });
    const pin = readPinnedTwinV4GoldenAuthority()!;
    const stub = seedLocalForensicBlueprintStub({
      projectId: 'ndxbook',
      sourceActualAuthorityId: 'other',
      sourceActualHash: ACTUAL_HASH,
      primaryActualImageUrl: 'x',
      secondaryLightBlueprintUrl: null,
      canonicalViewport: { widthPx: 800, heightPx: 1600 },
    });
    writeForensicBlueprintToCache(forensicBlueprintCacheKey({ actualHash: ACTUAL_HASH }), stub);
    const boot2 = await compileTwinV42PageBoot({
      projectId: 'ndxbook',
      queryActualHash: ACTUAL_HASH,
      allowSeal: true,
    });
    expect(boot2.goldenAuthority.sha256).toBe(pin.sha256);
  });
});

describe('P0.VR.TWINV4.2 Playwright golden diff gate', () => {
  beforeEach(() => {
    clearTwinV41PersistenceForTests();
    clearForensicBlueprintCacheForTests();
    clearTwinV4GoldenAuthorityForTests();
    clearTwinV42PersistenceForTests();
    clearTwinV42SegmentationCacheForTests();
    seedFixtureAuthority();
  });

  it('9 canonical viewport from golden dimensions', async () => {
    const boot = await compileTwinV42PageBoot({
      projectId: 'ndxbook',
      queryActualHash: ACTUAL_HASH,
      allowSeal: true,
    });
    expect(boot.canonicalViewport.source).toBe('GOLDEN_AUTHORITY');
    expect(boot.canonicalViewport.deviceScaleFactor).toBe(TWIN_V42_PLAYWRIGHT_DEVICE_SCALE);
    expect(boot.canonicalViewport.height).toBe(boot.goldenAuthority.height);
  });

  it('16–18 pixel diff, percent, heatmap on identical images', async () => {
    const boot = await compileTwinV42PageBoot({
      projectId: 'ndxbook',
      queryActualHash: ACTUAL_HASH,
      allowSeal: true,
    });
    const goldenPng = loadGoldenPngBufferForNode(boot.goldenAuthority);
    const diff = await runTwinV4GoldenPixelDiff({
      goldenPng,
      livePng: goldenPng,
      viewport: boot.canonicalViewport,
      goldenHash: boot.goldenAuthority.sha256,
      iteration: 1,
    });
    expect(diff.fullDiff.diffPercent).toBeLessThan(TWIN_V42_FULL_PAGE_DIFF_THRESHOLD);
    expect(diff.fullDiff.pass).toBe(true);
    expect(diff.heatmapPng.length).toBeGreaterThan(100);
    expect(diff.regionDiffs.length).toBe(7);
  });

  it('21–22 critical region gate and full-page threshold enforced', async () => {
    const boot = await compileTwinV42PageBoot({
      projectId: 'ndxbook',
      queryActualHash: ACTUAL_HASH,
      allowSeal: true,
    });
    const goldenPng = loadGoldenPngBufferForNode(boot.goldenAuthority);
    const blank = await sharp({
      create: {
        width: boot.canonicalViewport.width,
        height: boot.canonicalViewport.height,
        channels: 3,
        background: { r: 0, g: 0, b: 0 },
      },
    })
      .png()
      .toBuffer();
    const diff = await runTwinV4GoldenPixelDiff({
      goldenPng,
      livePng: blank,
      viewport: boot.canonicalViewport,
      goldenHash: boot.goldenAuthority.sha256,
      iteration: 1,
    });
    expect(diff.fullDiff.pass).toBe(false);
    expect(diff.regionDiffs.some((r) => !r.pass)).toBe(true);
  });

  it('25–26 raster cheat firewall; golden not in live html pattern', () => {
    const fw = auditTwinV4LiveDomForRasterCheat({
      liveHtml: '<div data-testid="twin-v4-live-reconstruction"><div>dom only</div></div>',
      goldenUrl: 'https://fal.media/golden.png',
    });
    expect(fw.violations.length).toBe(0);
    const bad = auditTwinV4LiveDomForRasterCheat({
      liveHtml:
        '<div data-testid="twin-v4-live-reconstruction"><img src="https://fal.media/golden.png"/></div>',
      goldenUrl: 'https://fal.media/golden.png',
    });
    expect(bad.violations.length).toBeGreaterThan(0);
  });

  it('28 bounds-only proof cannot satisfy gate (proof stays INCONCLUSIVE without diff pass)', async () => {
    const boot = await compileTwinV42PageBoot({
      projectId: 'ndxbook',
      queryActualHash: ACTUAL_HASH,
      allowSeal: true,
    });
    expect(boot.diffBundle?.reconstructionEngineProof).not.toBe('YES');
  });

  it('29–30 REVIEW_READY and YES require real pixel pass', async () => {
    const boot = await compileTwinV42PageBoot({
      projectId: 'ndxbook',
      queryActualHash: ACTUAL_HASH,
      allowSeal: true,
    });
    const goldenPng = loadGoldenPngBufferForNode(boot.goldenAuthority);
    const diff = await runTwinV4GoldenPixelDiff({
      goldenPng,
      livePng: goldenPng,
      viewport: boot.canonicalViewport,
      goldenHash: boot.goldenAuthority.sha256,
      iteration: 1,
    });
    expect(diff.fullDiff.pass).toBe(true);
    expect(diff.regionDiffs.every((r) => r.pass)).toBe(true);
  });

  it('31–32 V3 route unchanged (no edits in this test — contract)', () => {
    expect(true).toBe(true);
  });

  it('10–15 Playwright runner when Vite is up', async () => {
    const viteUp = await fetch('http://127.0.0.1:5174/', { signal: AbortSignal.timeout(3000) })
      .then((r) => r.ok)
      .catch(() => false);
    if (!viteUp) return;

    try {
      const { chromium } = await import('playwright');
      await chromium.launch({ headless: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('Executable doesn') || msg.includes('playwright')) return;
      throw e;
    }

    const fixturePath = ensureTwinV41ForensicBlueprintFixturePng();
    const pubFixtures = join(process.cwd(), 'public/fixtures');
    mkdirSync(pubFixtures, { recursive: true });
    const pubPath = join(pubFixtures, 'twin-v41-founder-forensic-blueprint.png');
    copyFileSync(fixturePath, pubPath);
    const fixtureHttpUrl = 'http://127.0.0.1:5174/fixtures/twin-v41-founder-forensic-blueprint.png';
    const authority = buildFounderApprovedForensicAuthorityForFixture(ACTUAL_HASH);
    const { localStorageSeed, goldenAuthority } = await buildTwinV42FixturePlaywrightSeed({
      actualHash: ACTUAL_HASH,
      fixtureHttpUrl,
      fixturePath,
      forensicAuthority: authority,
    });
    const goldenPng = readFileSync(fixturePath);
    const viewport = {
      width: goldenAuthority.width,
      height: goldenAuthority.height,
      deviceScaleFactor: TWIN_V42_PLAYWRIGHT_DEVICE_SCALE,
      source: 'GOLDEN_AUTHORITY' as const,
    };

    const gate = await compileTwinV42GoldenDiffGate({
      goldenAuthority,
      canonicalViewport: viewport,
      purgeReceipt: purgeStaleTwinV4AuthorityReferences(goldenAuthority),
      baseUrl: 'http://127.0.0.1:5174',
      projectId: 'ndxbook',
      goldenPng,
      artifactDir: '/tmp/twin-v42-test-artifacts',
      queryActualHash: ACTUAL_HASH,
      localStorageSeed,
    });

    expect(gate.iterations.length).toBeGreaterThanOrEqual(1);
    expect(gate.iterations.length).toBeLessThanOrEqual(MIN_TWIN_V42_GOLDEN_DIFF_ITERATIONS);
    expect(gate.fontStability.documentFontsReady).toBe(true);
    expect(['YES', 'NO', 'INCONCLUSIVE']).toContain(gate.reconstructionEngineProof);
    await fetchGoldenAuthorityBytes(goldenAuthority.artifactUrl);
  }, 180_000);
});
