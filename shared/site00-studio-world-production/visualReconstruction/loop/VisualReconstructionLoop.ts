/**
 * Closed-loop visual reconstruction orchestrator.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type {
  ReconstructionLoopConfig,
  ReconstructionLoopResult,
  ReconstructionPass,
  VisualReconstructionMode,
} from '../types.js';
import { DEFAULT_RECONSTRUCTION_LOOP_CONFIG } from '../constants.js';
import { ingestScreenshotReference } from '../ingestion/ScreenshotReferenceIngestionPipeline.js';
import { decomposeReferenceRegions } from '../regions/VisualReferenceRegion.js';
import { buildVisualReconstructionBlueprint } from '../blueprint/VisualReconstructionBlueprint.js';
import {
  buildDefaultSite00RepositoryCatalog,
  matchRepositoryAssets,
  matchRepositoryComponents,
  preferCanonicalOverReplacement,
} from '../matching/RepositoryComponentMatcher.js';
import { evaluateResponsiveInference } from '../responsive/ResponsiveInferenceEvaluation.js';
import { renderControlledReference } from '../render/ControlledReferenceRenderer.js';
import { compareRenderedReference } from '../compare/RenderedReferenceComparison.js';
import {
  createInitialRegionLocks,
  detectLockedRegionRegression,
  updateRegionLocksFromScores,
} from '../locks/VisualRegionLock.js';
import { buildVisualCorrectionPlan } from '../correction/VisualCorrectionPlan.js';
import {
  evaluateConvergence,
  scoreFromComparison,
  shouldStopForPlateau,
} from '../correction/ReconstructionConvergenceGuard.js';
import { evaluateReferenceMatchReadiness } from '../readiness/ReferenceMatchReadinessEvaluation.js';
import { buildVisualReconstructionReport } from '../report/VisualReconstructionReport.js';
import { createReferenceVisualRegressionBaseline } from '../baseline/ReferenceVisualRegressionBaseline.js';
import sharp from 'sharp';

export type RunVisualReconstructionLoopInput = {
  referenceImagePath: string;
  targetRoute: string;
  baseUrl: string;
  outputDir: string;
  mode?: VisualReconstructionMode;
  config?: Partial<ReconstructionLoopConfig>;
  renderSelector?: string;
  skipRender?: boolean;
};

export async function runVisualReconstructionLoop(
  input: RunVisualReconstructionLoopInput,
): Promise<ReconstructionLoopResult> {
  const config: ReconstructionLoopConfig = { ...DEFAULT_RECONSTRUCTION_LOOP_CONFIG, ...input.config };
  mkdirSync(input.outputDir, { recursive: true });

  const referenceBuffer = readFileSync(input.referenceImagePath);
  const reference = await ingestScreenshotReference({
    sourceAsset: input.referenceImagePath,
    buffer: referenceBuffer,
    forceMobileChrome: referenceBuffer.length > 0 && input.referenceImagePath.includes('mobile'),
  });

  const regions = decomposeReferenceRegions({ reference });
  const catalog = buildDefaultSite00RepositoryCatalog();
  const componentMatches = matchRepositoryComponents(regions, catalog).map(preferCanonicalOverReplacement);
  const assetMatches = matchRepositoryAssets(regions, catalog);

  const blueprint = buildVisualReconstructionBlueprint({
    reference,
    targetRoute: input.targetRoute,
    regions,
    componentMatches,
    assetMatches,
    mode: input.mode ?? 'REPRODUCE',
    copyMatchMode: config.copyMatchMode,
    deviceScaleFactor: 2,
  });

  writeFileSync(join(input.outputDir, 'blueprint.json'), JSON.stringify(blueprint, null, 2));

  let locks = createInitialRegionLocks(regions.map((r) => r.regionId));
  const scoreHistory: number[] = [];
  let lastComparison = null;
  let lastSnapshot = null;
  let previousScores = null;
  let correctionsApplied = 0;
  const passes: ReconstructionPass[] = config.passes;

  for (let iteration = 1; iteration <= config.maxIterations; iteration++) {
    const pass = passes[(iteration - 1) % passes.length]!;

    if (!input.skipRender) {
      lastSnapshot = await renderControlledReference({
        route: input.targetRoute,
        baseUrl: input.baseUrl,
        viewport: blueprint.viewport,
        outputDir: join(input.outputDir, 'renders'),
        reconstructionIteration: iteration,
        blueprintVersion: blueprint.blueprintId,
        selector: input.renderSelector,
      });

      const renderBuffer = readFileSync(lastSnapshot.screenshotPath);
      const croppedReference = await cropReferenceToUsable(referenceBuffer, reference);

      lastComparison = await compareRenderedReference({
        referenceBuffer: croppedReference,
        renderBuffer,
        reference,
        snapshot: lastSnapshot,
        regions,
        outputDir: join(input.outputDir, 'heatmaps'),
      });

      writeFileSync(
        join(input.outputDir, `comparison-iter-${iteration}.json`),
        JSON.stringify(lastComparison, null, 2),
      );

      if (previousScores) {
        locks = detectLockedRegionRegression(locks, previousScores, lastComparison.regionScores);
      }
      previousScores = lastComparison.regionScores;
      locks = updateRegionLocksFromScores(locks, lastComparison.regionScores, iteration, pass);

      const plan = buildVisualCorrectionPlan(lastComparison, locks, iteration, pass);
      correctionsApplied += plan.corrections.length;
      writeFileSync(join(input.outputDir, `plan-iter-${iteration}.json`), JSON.stringify(plan, null, 2));

      scoreHistory.push(scoreFromComparison(lastComparison));
      const trend = evaluateConvergence({ scores: scoreHistory, iterations: scoreHistory.map((_, i) => i + 1) });

      const readiness = evaluateReferenceMatchReadiness(lastComparison, locks, config);
      if (readiness.ready) {
        const report = buildVisualReconstructionReport({
          reference,
          targetRoute: input.targetRoute,
          viewport: blueprint.viewport,
          mode: input.mode ?? 'REPRODUCE',
          iterations: iteration,
          regions,
          locks,
          comparison: lastComparison,
          readiness,
          responsiveInference: evaluateResponsiveInference(reference),
          finalScreenshotPath: lastSnapshot.screenshotPath,
          heatmapPath: lastComparison.heatmapPath,
          repositoryAssetsReused: assetMatches.filter((a: { assetPath: string | null }) => a.assetPath).map((a: { assetPath: string | null }) => a.assetPath!),
          newComponentsCreated: ['ExperimentsHubOperateLayer'],
          convergenceTrend: trend,
          manualFounderCorrections: 0,
          knownLimitations: [],
        });

        writeFileSync(join(input.outputDir, 'report.json'), JSON.stringify(report, null, 2));

        const baseline = createReferenceVisualRegressionBaseline({
          referenceId: reference.referenceId,
          targetRoute: input.targetRoute,
          viewport: blueprint.viewport,
          approvedRenderPath: lastSnapshot.screenshotPath,
          regionLocks: locks,
          readinessSnapshot: readiness,
        });
        writeFileSync(join(input.outputDir, 'baseline.json'), JSON.stringify(baseline, null, 2));

        return { status: 'REFERENCE_MATCH_READY', report };
      }

      if (shouldStopForPlateau(trend, iteration) && iteration >= 4) {
        break;
      }
    } else {
      break;
    }
  }

  const readiness = lastComparison
    ? evaluateReferenceMatchReadiness(lastComparison, locks, config)
    : {
        ready: false,
        blockedReason: 'Render skipped or no comparison',
        macroGeometry: false,
        regionGeometry: false,
        typography: false,
        lineWrapping: false,
        surfaceMatch: false,
        assetBounds: false,
        imageCrop: false,
        colorMatch: false,
        fixedElements: false,
        overallSimilarity: 0,
        unresolvedRegions: locks.map((l) => l.regionId),
        failedHighAuthorityRegions: [],
      };

  const report = buildVisualReconstructionReport({
    reference,
    targetRoute: input.targetRoute,
    viewport: blueprint.viewport,
    mode: input.mode ?? 'REPRODUCE',
    iterations: scoreHistory.length,
    regions,
    locks,
    comparison: lastComparison,
    readiness,
    responsiveInference: evaluateResponsiveInference(reference),
    finalScreenshotPath: lastSnapshot?.screenshotPath ?? null,
    heatmapPath: lastComparison?.heatmapPath ?? null,
    repositoryAssetsReused: assetMatches.filter((a) => a.assetPath).map((a) => a.assetPath!),
    newComponentsCreated: ['ExperimentsHubOperateLayer'],
    convergenceTrend: evaluateConvergence({ scores: scoreHistory, iterations: scoreHistory.map((_, i) => i + 1) }),
    manualFounderCorrections: 0,
    knownLimitations: [
      correctionsApplied > 0 ? `${correctionsApplied} correction plans generated` : 'No corrections applied',
      readiness.blockedReason ?? 'Convergence plateau',
    ],
  });

  writeFileSync(join(input.outputDir, 'report.json'), JSON.stringify(report, null, 2));

  return {
    status: 'REFERENCE_MATCH_BLOCKED',
    report,
    blocker: readiness.blockedReason ?? 'REFERENCE_MATCH_BLOCKED',
  };
}

async function cropReferenceToUsable(buffer: Buffer, reference: { usablePageBounds: { x: number; y: number; width: number; height: number } }): Promise<Buffer> {
  const b = reference.usablePageBounds;
  return sharp(buffer)
    .extract({
      left: Math.max(0, Math.round(b.x)),
      top: Math.max(0, Math.round(b.y)),
      width: Math.round(b.width),
      height: Math.round(b.height),
    })
    .png()
    .toBuffer();
}
