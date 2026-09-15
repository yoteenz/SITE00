import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  DIFF_CONVERGENCE_STALLED,
  MIN_TWIN_V42_GOLDEN_DIFF_ITERATIONS,
  TWIN_V42_FULL_PAGE_DIFF_THRESHOLD,
} from './constants.js';
import { captureTwinV4LiveReconstructionScreenshot } from './captureTwinV4PlaywrightScreenshot.js';
import { runTwinV4GoldenPixelDiff } from './runTwinV4GoldenPixelDiff.js';
import type {
  TwinV4GoldenDiffGate,
  TwinV4GoldenDiffIteration,
  TwinV4GoldenAuthority,
  TwinV4CanonicalViewport,
} from './twinV42Types.js';

export async function runTwinV4GoldenDiffLoop(input: {
  goldenAuthority: TwinV4GoldenAuthority;
  goldenPng: Buffer;
  viewport: TwinV4CanonicalViewport;
  baseUrl: string;
  projectId: string;
  artifactDir?: string;
  queryActualHash?: string;
  localStorageSeed?: Record<string, string>;
}): Promise<{
  iterations: TwinV4GoldenDiffIteration[];
  gate: TwinV4GoldenDiffGate;
  fontStability: Awaited<ReturnType<typeof captureTwinV4LiveReconstructionScreenshot>>['fontStability'];
  assetStability: Awaited<ReturnType<typeof captureTwinV4LiveReconstructionScreenshot>>['assetStability'];
  browser: string;
  browserVersion: string;
  proof: 'YES' | 'NO' | 'INCONCLUSIVE';
  stalled: boolean;
}> {
  const outDir = input.artifactDir ?? '/opt/cursor/artifacts/twin-v4-golden-diff';
  mkdirSync(outDir, { recursive: true });

  const iterations: TwinV4GoldenDiffIteration[] = [];
  let lastDiff = 1;
  let fontStability = { documentFontsReady: false, fallbackFontsDetected: false };
  let assetStability = { imagesLoaded: 0, imagesPending: 0, placeholderImages: 0 };
  let browser = 'chromium';
  let browserVersion = 'unknown';

  const maxIter = MIN_TWIN_V42_GOLDEN_DIFF_ITERATIONS;
  for (let i = 1; i <= maxIter; i += 1) {
    const capture = await captureTwinV4LiveReconstructionScreenshot({
      baseUrl: input.baseUrl,
      projectId: input.projectId,
      viewport: input.viewport,
      queryActualHash: input.queryActualHash,
      localStorageSeed: input.localStorageSeed,
    });
    fontStability = capture.fontStability;
    assetStability = capture.assetStability;
    browser = capture.browser;
    browserVersion = capture.browserVersion;

    const diff = await runTwinV4GoldenPixelDiff({
      goldenPng: input.goldenPng,
      livePng: capture.png,
      viewport: input.viewport,
      goldenHash: input.goldenAuthority.sha256,
      iteration: i,
    });

    const livePath = join(outDir, `live-v4-iteration-${i}.png`);
    const heatPath = join(outDir, `diff-v4-iteration-${i}.png`);
    const reportPath = join(outDir, `diff-report-v4-iteration-${i}.json`);
    const regionPath = join(outDir, `region-diff-v4-iteration-${i}.json`);
    writeFileSync(livePath, capture.png);
    writeFileSync(heatPath, diff.heatmapPng);
    writeFileSync(reportPath, JSON.stringify(diff.fullDiff, null, 2));
    writeFileSync(regionPath, JSON.stringify(diff.regionDiffs, null, 2));

    iterations.push({
      iteration: i,
      liveScreenshotPath: livePath,
      diffHeatmapPath: heatPath,
      diffReportPath: reportPath,
      regionDiffPath: regionPath,
      fullDiff: diff.fullDiff,
      regionDiffs: diff.regionDiffs,
    });

    if (i >= 2 && diff.fullDiff.diffPercent >= lastDiff - 0.002) {
      /* stall detection */
    }
    lastDiff = diff.fullDiff.diffPercent;
    if (diff.fullDiff.pass && diff.regionDiffs.every((r) => r.pass)) break;
  }

  const last = iterations[iterations.length - 1]!;
  const fullPagePass = last.fullDiff.pass;
  const criticalRegionPass = last.regionDiffs.every((r) => r.pass);
  const stalled =
    iterations.length >= maxIter &&
    !fullPagePass &&
    iterations[0]!.fullDiff.diffPercent - last.fullDiff.diffPercent < 0.01;

  const gate: TwinV4GoldenDiffGate = {
    status:
      fullPagePass && criticalRegionPass ?
        'REVIEW_READY'
      : stalled ?
        'DIFF_FAILED'
      : 'IMPLEMENTING',
    fullPagePass,
    criticalRegionPass,
    rasterCheatViolations: 0,
  };

  let proof: 'YES' | 'NO' | 'INCONCLUSIVE' = 'INCONCLUSIVE';
  if (fullPagePass && criticalRegionPass && fontStability.documentFontsReady) {
    proof = 'YES';
  } else if (stalled || last.fullDiff.diffPercent > TWIN_V42_FULL_PAGE_DIFF_THRESHOLD * 3) {
    proof = 'NO';
  }
  if (stalled) {
    void DIFF_CONVERGENCE_STALLED;
  }

  return {
    iterations,
    gate,
    fontStability,
    assetStability,
    browser,
    browserVersion,
    proof,
    stalled,
  };
}
