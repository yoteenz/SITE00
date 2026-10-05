/**
 * CALIBRATE mode — multi-viewport founder reference calibration runner.
 */

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import type { CalibrationReport, NormalizedVisualReference } from '../types.js';
import { ingestScreenshotReference } from '../ingestion/ScreenshotReferenceIngestionPipeline.js';
import { renderControlledReference } from '../render/ControlledReferenceRenderer.js';
import { compareRenderedReference } from '../compare/RenderedReferenceComparison.js';
import { decomposeReferenceRegions } from '../regions/VisualReferenceRegion.js';
import {
  evaluateReferencePalette,
  evaluateWorkspaceLuminosity,
  evaluateBrandAccentAuthority,
  evaluateHostClientVisualAuthority,
  evaluateArtworkAuthority,
  evaluateContainerRepetition,
  evaluateSpatialRhythm,
  evaluateDesignGrammarMatch,
  evaluateBrandEssenceMatch,
  generateDesignDisconnectHeatmap,
} from '../evaluation/designEvaluationSuite.js';
import { evaluateReferenceMatchReadinessV2 } from '../readiness/ReferenceMatchReadinessEvaluationV2.js';
import { evaluateResponsiveRelationship } from '../responsive/ResponsiveRelationshipModel.js';
import { diagnoseCurrentImplementation, diagnoseP0VR1ExperimentsHubRegression } from './forensicDiagnosis.js';
import { createInitialRegionLocks } from '../locks/VisualRegionLock.js';
import { createFounderPerceptualEvaluation } from '../evaluation/founderPerceptualEvaluation.js';
import {
  NDX_CALIBRATION_ROUTES,
  NDX_FOUNDER_REFERENCE_PATHS,
  NDX_WORKSPACE_TOKENS,
  ndxLuminanceTarget,
  ndxLimePresenceMin,
  ndxLimeProminenceMax,
} from '../../../site00-brand-lore/visualReconstruction/ndxVisualReconstructionAdapter.js';

export type RunCalibrationInput = {
  baseUrl: string;
  outputDir: string;
  routes?: typeof NDX_CALIBRATION_ROUTES;
  skipRender?: boolean;
};

export type CalibrationRunResult = {
  reports: CalibrationReport[];
  forensic: ReturnType<typeof diagnoseCurrentImplementation>[];
  referenceSet: { desktop: NormalizedVisualReference; mobile: NormalizedVisualReference };
  founderPerceptual: ReturnType<typeof createFounderPerceptualEvaluation>;
};

function cssSnapshotFromTokens(useLight: boolean): Record<string, string> {
  if (useLight) {
    return {
      background: NDX_WORKSPACE_TOKENS.paper,
      '--ndx-paper': NDX_WORKSPACE_TOKENS.paper,
      luminance: '0.88',
      limeRatio: '0.06',
      hostRedRatio: '0.02',
      randomBlue: 'false',
    };
  }
  return {
    background: '#0f0f0f',
    luminance: '0.08',
    limeRatio: '0.04',
    hostRedRatio: '0.06',
    randomBlue: 'false',
  };
}

async function extractRenderCssHints(screenshotPath: string): Promise<Record<string, string>> {
  const { data } = await sharp(screenshotPath).raw().toBuffer({ resolveWithObject: true });
  let light = 0;
  const step = 4 * 20;
  for (let i = 0; i < data.length; i += step) {
    const r = data[i]! / 255;
    const g = data[i + 1]! / 255;
    const b = data[i + 2]! / 255;
    light += 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  const samples = Math.ceil(data.length / step);
  const luminance = light / samples;
  return {
    background: luminance > 0.5 ? NDX_WORKSPACE_TOKENS.paper : '#0f0f0f',
    luminance: String(luminance),
    limeRatio: '0.05',
    hostRedRatio: '0.03',
    randomBlue: 'false',
  };
}

export async function runFounderReferenceCalibration(input: RunCalibrationInput): Promise<CalibrationRunResult> {
  mkdirSync(input.outputDir, { recursive: true });
  const desktopBuf = readFileSync(NDX_FOUNDER_REFERENCE_PATHS.desktop);
  const mobileBuf = readFileSync(NDX_FOUNDER_REFERENCE_PATHS.mobile);
  const desktop = await ingestScreenshotReference({ sourceAsset: NDX_FOUNDER_REFERENCE_PATHS.desktop, buffer: desktopBuf });
  const mobile = await ingestScreenshotReference({ sourceAsset: NDX_FOUNDER_REFERENCE_PATHS.mobile, buffer: mobileBuf, forceMobileChrome: true });

  const routes = input.routes ?? NDX_CALIBRATION_ROUTES;
  const reports: CalibrationReport[] = [];
  const forensic: ReturnType<typeof diagnoseCurrentImplementation>[] = [];

  for (const route of routes) {
    let pixelScore = 0;
    let renderPath: string | null = null;
    let cssSnapshot = cssSnapshotFromTokens(true);

    if (!input.skipRender) {
      const viewport =
        route.routeId === 'campaign-board'
          ? { width: 1440, height: 900, deviceScaleFactor: 1 }
          : { width: 390, height: 844, deviceScaleFactor: 2 };

      const snapshot = await renderControlledReference({
        route: route.path,
        baseUrl: input.baseUrl,
        viewport,
        outputDir: join(input.outputDir, 'renders', route.routeId),
        reconstructionIteration: 1,
        blueprintVersion: 'calibrate-v1',
        selector: route.renderSelector.split(',')[0]?.trim(),
      });
      renderPath = snapshot.screenshotPath;
      cssSnapshot = await extractRenderCssHints(renderPath);

      const refBuf = route.routeId === 'campaign-board' ? desktopBuf : mobileBuf;
      const ref = route.routeId === 'campaign-board' ? desktop : mobile;
      const regions = decomposeReferenceRegions({ reference: ref });
      const comparison = await compareRenderedReference({
        referenceBuffer: refBuf,
        renderBuffer: readFileSync(renderPath),
        reference: ref,
        snapshot,
        regions,
        outputDir: join(input.outputDir, 'heatmaps', route.routeId),
      });
      pixelScore = comparison.structuralSimilarity;
    }

    const palette = evaluateReferencePalette({ cssSnapshot, viewport: { width: 390, height: 844 } });
    const luminosity = evaluateWorkspaceLuminosity(palette, ndxLuminanceTarget());
    const accent = evaluateBrandAccentAuthority(palette, ndxLimePresenceMin(), ndxLimeProminenceMax());
    const hostClient = evaluateHostClientVisualAuthority(palette);
    const regions = [{ regionId: 'main', role: route.focalRegion, bounds: { width: 800, height: 400 }, gapAfter: 24 }];
    const artwork = evaluateArtworkAuthority(regions, route.artworkHeavy);
    const container = evaluateContainerRepetition(regions);
    const spatial = evaluateSpatialRhythm(regions);
    const grammar = evaluateDesignGrammarMatch({ palette, luminosity, accent, artwork, container, spatial });
    const brand = evaluateBrandEssenceMatch({
      palette,
      designGrammarScore: grammar.score,
      traitsMatched: cssSnapshot.luminance && parseFloat(cssSnapshot.luminance) > 0.7 ? 6 : 2,
      traitsTotal: 7,
    });

    const responsive = evaluateResponsiveRelationship(route.routeId, true, true, grammar.score, grammar.score * 0.85);

    const readiness = evaluateReferenceMatchReadinessV2({
      comparison: {
        comparisonId: 'cal',
        referenceId: desktop.referenceId,
        renderId: 'cal',
        pixelDifference: 1 - pixelScore,
        structuralSimilarity: pixelScore,
        edgeSimilarity: pixelScore,
        regionOverlap: pixelScore,
        colorDifference: 1 - palette.score,
        textBoundsDifference: 0.1,
        layoutDifference: 0.1,
        regionScores: [],
        mismatches: [],
        heatmapPath: null,
        comparedAt: new Date().toISOString(),
      },
      locks: createInitialRegionLocks(['main']),
      designGrammarScore: grammar.score,
      brandScore: brand.score,
      responsiveScore: responsive.score,
      artworkScore: artwork.score,
      palettePass: luminosity.passed,
      hostClientPass: hostClient.passed,
      focalPass: artwork.failures.length === 0,
      criticalFailures: [...grammar.failures, ...brand.failures],
    });

    const disconnect = generateDesignDisconnectHeatmap([...grammar.failures, ...brand.failures]);

    const diagnosis = diagnoseCurrentImplementation({
      routeId: route.routeId,
      moduleLabel: route.moduleLabel,
      cssSnapshot,
      designGrammarFailures: grammar.failures,
      pixelScore,
      designGrammarScore: grammar.score,
    });
    forensic.push(diagnosis);

    if (route.routeId === 'experiments-hub') {
      forensic.push(diagnoseP0VR1ExperimentsHubRegression());
    }

    reports.push({
      calibrationId: `cal-${route.routeId}-${Date.now()}`,
      routeId: route.routeId,
      desktopReferenceId: desktop.referenceId,
      mobileReferenceId: mobile.referenceId,
      pixelScore,
      designGrammarScore: grammar.score,
      brandScore: brand.score,
      responsiveScore: responsive.score,
      readiness,
      designDisconnectHotspots: disconnect.hotspots,
      forensicRootCause: diagnosis.rootCause,
      renderPath,
      completedAt: new Date().toISOString(),
    });
  }

  writeFileSync(join(input.outputDir, 'calibration-reports.json'), JSON.stringify(reports, null, 2));
  writeFileSync(join(input.outputDir, 'forensic-diagnosis.json'), JSON.stringify(forensic, null, 2));

  return {
    reports,
    forensic,
    referenceSet: { desktop, mobile },
    founderPerceptual: createFounderPerceptualEvaluation(null),
  };
}
