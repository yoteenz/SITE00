import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CORRECTION_LOOP_DID_NOT_MUTATE_IMPLEMENTATION,
  DIFF_CONVERGENCE_STALLED,
  MAX_TWIN_V42R1_MUTATION_ITERATIONS,
  MUTATION_DID_NOT_CHANGE_RENDER,
  TWIN_V42_FULL_PAGE_DIFF_THRESHOLD,
  TWIN_V42R1_STALL_DELTA_THRESHOLD,
  TWIN_V42_RECONSTRUCTION_CONTRACT_KEY,
} from './constants.js';
import { captureTwinV4LiveReconstructionScreenshot } from './captureTwinV4PlaywrightScreenshot.js';
import { runTwinV4GoldenPixelDiff } from './runTwinV4GoldenPixelDiff.js';
import { buildTwinV4DiffDrivenMutationPlan } from './twinV4DiffDrivenMutationEngine.js';
import {
  createInitialTwinV42ReconstructionContract,
  hashTwinV42Implementation,
  readTwinV42ReconstructionContract,
  writeTwinV42ReconstructionContract,
} from './twinV42ReconstructionContract.js';
import type {
  TwinV4DiffDeltaReceipt,
  TwinV4GoldenDiffGate,
  TwinV4GoldenDiffIteration,
  TwinV4GoldenAuthority,
  TwinV4CanonicalViewport,
} from './twinV42Types.js';
import { sha256Hex } from './sha256Hex.js';

export class TwinV42ConvergenceLoopError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'TwinV42ConvergenceLoopError';
  }
}

function regionRegression(prev: TwinV4GoldenDiffIteration['regionDiffs'], next: TwinV4GoldenDiffIteration['regionDiffs']) {
  const regressed: string[] = [];
  for (const n of next) {
    const p = prev.find((r) => r.regionId === n.regionId);
    if (p && n.diffPercent > p.diffPercent + 0.005) regressed.push(n.regionId);
  }
  return regressed;
}

export async function runTwinV4GoldenDiffConvergenceLoop(input: {
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
  mutationIterations: number;
  gate: TwinV4GoldenDiffGate;
  fontStability: Awaited<ReturnType<typeof captureTwinV4LiveReconstructionScreenshot>>['fontStability'];
  assetStability: Awaited<ReturnType<typeof captureTwinV4LiveReconstructionScreenshot>>['assetStability'];
  browser: string;
  browserVersion: string;
  proof: 'YES' | 'NO' | 'INCONCLUSIVE';
  stalled: boolean;
  regionRegressions: string[];
}> {
  const outDir = input.artifactDir ?? '/opt/cursor/artifacts/twin-v4-golden-diff';
  mkdirSync(outDir, { recursive: true });

  writeTwinV42ReconstructionContract(createInitialTwinV42ReconstructionContract());

  const iterations: TwinV4GoldenDiffIteration[] = [];
  let mutationIterations = 0;
  let priorDiff: number | null = null;
  let priorScreenshotHash: string | null = null;
  let priorImplHash: string | null = null;
  let stallCount = 0;
  const regionRegressions: string[] = [];
  let fontStability = { documentFontsReady: false, fallbackFontsDetected: false };
  let assetStability = { imagesLoaded: 0, imagesPending: 0, placeholderImages: 0 };
  let browser = 'chromium';
  let browserVersion = 'unknown';

  let contract = readTwinV42ReconstructionContract();

  for (let attempt = 1; attempt <= MAX_TWIN_V42R1_MUTATION_ITERATIONS + 1; attempt += 1) {
    const isMutationAttempt = attempt > 1;
    if (isMutationAttempt && priorDiff !== null) {
      const plan = buildTwinV4DiffDrivenMutationPlan({
        regionDiffs: iterations[iterations.length - 1]!.regionDiffs,
        currentDiffPercent: priorDiff,
        contract,
      });
      if (plan.implementationHashBefore === plan.implementationHashAfter) {
        throw new TwinV42ConvergenceLoopError(
          CORRECTION_LOOP_DID_NOT_MUTATE_IMPLEMENTATION,
          'Mutation plan did not change implementation hash.',
        );
      }
      contract = readTwinV42ReconstructionContract();
    }

    const correctionGeneration = contract.correctionGeneration;
    const seed = {
      ...(input.localStorageSeed ?? {}),
      [TWIN_V42_RECONSTRUCTION_CONTRACT_KEY]: JSON.stringify(contract),
    };
    const capture = await captureTwinV4LiveReconstructionScreenshot({
      baseUrl: input.baseUrl,
      projectId: input.projectId,
      viewport: input.viewport,
      queryActualHash: input.queryActualHash,
      localStorageSeed: seed,
      correctionGeneration,
    });
    fontStability = capture.fontStability;
    assetStability = capture.assetStability;
    browser = capture.browser;
    browserVersion = capture.browserVersion;

    const screenshotHash = await sha256Hex(new Uint8Array(capture.png));
    if (isMutationAttempt && priorScreenshotHash === screenshotHash) {
      throw new TwinV42ConvergenceLoopError(
        MUTATION_DID_NOT_CHANGE_RENDER,
        'Screenshot hash unchanged after mutation.',
      );
    }

    const diff = await runTwinV4GoldenPixelDiff({
      goldenPng: input.goldenPng,
      livePng: capture.png,
      viewport: input.viewport,
      goldenHash: input.goldenAuthority.sha256,
      iteration: iterations.length + 1,
    });

    const implHashAfter = hashTwinV42Implementation(readTwinV42ReconstructionContract());
    const validMutation =
      isMutationAttempt &&
      priorImplHash !== null &&
      implHashAfter !== priorImplHash &&
      priorScreenshotHash !== screenshotHash;

    let diffDelta: TwinV4DiffDeltaReceipt | null = null;
    if (priorDiff !== null) {
      const delta = priorDiff - diff.fullDiff.diffPercent;
      const improved = delta > 0;
      const prevRegions = iterations[iterations.length - 1]!.regionDiffs;
      const regionsImproved = diff.regionDiffs
        .filter((r) => {
          const p = prevRegions.find((x) => x.regionId === r.regionId);
          return p && r.diffPercent < p.diffPercent;
        })
        .map((r) => r.regionId);
      const regionsRegressed = regionRegression(prevRegions, diff.regionDiffs);
      regionRegressions.push(...regionsRegressed);
      diffDelta = {
        iteration: iterations.length + 1,
        priorDiff,
        currentDiff: diff.fullDiff.diffPercent,
        delta,
        improved,
        regionsImproved,
        regionsRegressed,
      };
      if (validMutation) {
        mutationIterations += 1;
        if (Math.abs(delta) < TWIN_V42R1_STALL_DELTA_THRESHOLD) stallCount += 1;
        else stallCount = 0;
      }
    }

    const iterIndex = iterations.length + 1;
    const livePath = join(outDir, `live-v4-iteration-${iterIndex}.png`);
    const heatPath = join(outDir, `diff-v4-iteration-${iterIndex}.png`);
    const reportPath = join(outDir, `diff-report-v4-iteration-${iterIndex}.json`);
    const regionPath = join(outDir, `region-diff-v4-iteration-${iterIndex}.json`);
    writeFileSync(livePath, capture.png);
    writeFileSync(heatPath, diff.heatmapPng);
    writeFileSync(reportPath, JSON.stringify(diff.fullDiff, null, 2));
    writeFileSync(regionPath, JSON.stringify(diff.regionDiffs, null, 2));

    iterations.push({
      iteration: iterIndex,
      validMutation,
      implementationHashBefore: priorImplHash,
      implementationHashAfter: implHashAfter,
      screenshotHashBefore: priorScreenshotHash,
      screenshotHashAfter: screenshotHash,
      liveScreenshotPath: livePath,
      diffHeatmapPath: heatPath,
      diffReportPath: reportPath,
      regionDiffPath: regionPath,
      fullDiff: diff.fullDiff,
      regionDiffs: diff.regionDiffs,
      diffDelta,
      targetedRegion: isMutationAttempt ? iterations[iterations.length - 1]?.regionDiffs.sort((a, b) => b.diffPercent - a.diffPercent)[0]?.regionId ?? null : null,
      mutationType: isMutationAttempt ? 'REGION_TUNING' : null,
    });

    priorDiff = diff.fullDiff.diffPercent;
    priorScreenshotHash = screenshotHash;
    priorImplHash = implHashAfter;

    if (diff.fullDiff.pass && diff.regionDiffs.every((r) => r.pass)) break;
    if (stallCount >= 2) break;
    if (mutationIterations >= MAX_TWIN_V42R1_MUTATION_ITERATIONS) break;
  }

  const last = iterations[iterations.length - 1]!;
  const fullPagePass = last.fullDiff.pass;
  const criticalRegionPass = last.regionDiffs.every((r) => r.pass);
  const stalled = stallCount >= 2 || (mutationIterations >= 2 && iterations.length >= 2 && Math.abs((iterations[0]!.fullDiff.diffPercent - last.fullDiff.diffPercent)) < TWIN_V42R1_STALL_DELTA_THRESHOLD);

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
  if (fullPagePass && criticalRegionPass && fontStability.documentFontsReady) proof = 'YES';
  else if (stalled || last.fullDiff.diffPercent > TWIN_V42_FULL_PAGE_DIFF_THRESHOLD * 3) proof = 'NO';
  if (stalled) void DIFF_CONVERGENCE_STALLED;

  return {
    iterations,
    mutationIterations,
    gate,
    fontStability,
    assetStability,
    browser,
    browserVersion,
    proof,
    stalled,
    regionRegressions: [...new Set(regionRegressions)],
  };
}
