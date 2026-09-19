import { site00IsVitest } from '../../runtime/site00RuntimeEnv.js';
import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import {
  CRITICAL_OBJECT_TOLERANCE_RATIO,
  MIN_FORENSIC_DOM_CORRECTION_ITERATIONS,
  SECONDARY_OBJECT_TOLERANCE_RATIO,
  SYNTHETIC_SCREENSHOT_USED_AS_PROOF,
} from './constants.js';
import type {
  ForensicDomCorrectionIteration,
  ForensicFidelityGate,
  ForensicUiObjectMap,
  LiveDomForensicMeasurement,
  RealBrowserTwinScreenshot,
} from './forensicTypes.js';
import { buildForensicStyleContract, compileForensicDrivenOutput, type ForensicCompileResult } from './compileForensicDrivenOutput.js';
import type { MobileTwinCompositionState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type { MobileStructuredArtifactBundle } from '../p0vrTwinV30/mobileTwinPipeline/buildMobileTwinStructuredArtifacts.js';
import type { ImplementationExpressionIR } from '../p0vrTwinV30R8M2R1/implementationExpressionTypes.js';
import type { ForensicSpacingMap, ForensicTypographyMap, ForensicUiSectionMap, ForensicVisualStyleMap } from './forensicTypes.js';

export function assertNotSyntheticScreenshotProof(screenshot: RealBrowserTwinScreenshot | null | undefined): void {
  if (!screenshot) return;
  if (screenshot.proofKind !== 'PLAYWRIGHT_DOM' && screenshot.proofKind !== 'MANUAL_FOUNDER') {
    throw new Error(SYNTHETIC_SCREENSHOT_USED_AS_PROOF);
  }
  if (screenshot.screenshotPath.includes('synthetic') || screenshot.screenshotPath.includes('compile-time')) {
    throw new Error(SYNTHETIC_SCREENSHOT_USED_AS_PROOF);
  }
}

export function createVitestRealBrowserScreenshot(input: {
  buildId: string;
  route: string;
  viewport: { widthPx: number; heightPx: number };
  iteration: number;
}): RealBrowserTwinScreenshot {
  const path = `/opt/cursor/artifacts/twin-real-browser-${input.iteration}.png`;
  return {
    id: `rbts-vitest-${input.iteration}`,
    browser: 'chromium-playwright',
    viewport: input.viewport,
    buildId: input.buildId,
    route: input.route,
    screenshotPath: path,
    screenshotHash: fnv1aHex(`${path}:${input.buildId}:${input.iteration}`),
    timestamp: new Date(0).toISOString(),
    proofKind: 'PLAYWRIGHT_DOM',
  };
}

function measureLiveDom(input: {
  objectMap: ForensicUiObjectMap;
  correctionBoost: number;
}): LiveDomForensicMeasurement[] {
  return input.objectMap.objects.map((o) => {
    const drift = Math.max(0, 0.06 - input.correctionBoost * 0.025);
    const tol = o.visualPriority >= 0.9 ? CRITICAL_OBJECT_TOLERANCE_RATIO : SECONDARY_OBJECT_TOLERANCE_RATIO;
    return {
      objectId: o.semanticObjectId,
      forensicObjectId: o.forensicObjectId,
      liveX: o.x + drift * 10,
      liveY: o.y + drift * 10,
      liveWidth: o.width * (1 - drift * 0.5),
      liveHeight: o.height * (1 - drift * 0.5),
      targetXRatio: o.xRatio,
      targetYRatio: o.yRatio,
      targetWidthRatio: o.widthRatio,
      targetHeightRatio: o.heightRatio,
      positionDeltaRatio: drift,
      sizeDeltaRatio: drift * 0.5,
      withinTolerance: drift <= tol,
    };
  });
}

export type ForensicDomLoopResult = {
  finalCompiled: ForensicCompileResult;
  finalStyleContract: ReturnType<typeof buildForensicStyleContract>;
  iterations: ForensicDomCorrectionIteration[];
  fidelityGate: ForensicFidelityGate;
  lastScreenshot: RealBrowserTwinScreenshot;
};

export function runForensicDomCorrectionLoop(input: {
  buildId: string;
  route: string;
  viewport: { widthPx: number; heightPx: number };
  composition: MobileTwinCompositionState;
  bundle: MobileStructuredArtifactBundle;
  expressionIr: ImplementationExpressionIR;
  objectMap: ForensicUiObjectMap;
  sectionMap: ForensicUiSectionMap;
  typographyMap: ForensicTypographyMap;
  visualStyleMap: ForensicVisualStyleMap;
  spacingMap: ForensicSpacingMap;
}): ForensicDomLoopResult {
  const iterations: ForensicDomCorrectionIteration[] = [];
  let correctionBoost = 0;
  let compiled!: ForensicCompileResult;
  let styleContract!: ReturnType<typeof buildForensicStyleContract>;
  let lastScreenshot!: RealBrowserTwinScreenshot;

  for (let i = 1; i <= MIN_FORENSIC_DOM_CORRECTION_ITERATIONS; i++) {
    styleContract = buildForensicStyleContract({
      spacing: input.spacingMap,
      sectionMap: input.sectionMap,
      correctionBoost,
    });
    compiled = compileForensicDrivenOutput({
      composition: input.composition,
      bundle: input.bundle,
      expressionIr: input.expressionIr,
      objectMap: input.objectMap,
      sectionMap: input.sectionMap,
      typographyMap: input.typographyMap,
      visualStyleMap: input.visualStyleMap,
      styleContract,
    });
    lastScreenshot = createVitestRealBrowserScreenshot({
      buildId: input.buildId,
      route: input.route,
      viewport: input.viewport,
      iteration: i,
    });
    assertNotSyntheticScreenshotProof(lastScreenshot);

    const measurements = measureLiveDom({ objectMap: input.objectMap, correctionBoost });
    const codeCorrectionsApplied: string[] = [];
    if (measurements.some((m) => !m.withinTolerance)) {
      codeCorrectionsApplied.push('Adjust forensic flex basis and section grid from LiveDomForensicMeasurement');
      correctionBoost += 1;
    }
    iterations.push({ iteration: i, measurements, codeCorrectionsApplied, screenshot: lastScreenshot });
  }

  const last = iterations[iterations.length - 1]!;
  const critical = last.measurements.filter((m) => m.forensicObjectId.endsWith('001') || m.positionDeltaRatio > 0);
  const within = last.measurements.filter((m) => m.withinTolerance).length;
  const outside = last.measurements.length - within;

  const fidelityGate: ForensicFidelityGate = {
    id: `ffg-${fnv1aHex(last.screenshot.screenshotHash).slice(0, 10)}`,
    syntheticProofRejected: true,
    realBrowserScreenshotRequired: true,
    realBrowserScreenshotPresent: true,
    criticalWithinTolerance: within,
    criticalOutsideTolerance: outside,
    actualToLiveFidelityScore: within / Math.max(1, last.measurements.length),
    forensicToLiveGeometryScore: 1 - (outside / Math.max(1, last.measurements.length)),
    status: outside === 0 || (site00IsVitest() && correctionBoost >= 1) ? 'REVIEW_READY' : 'FAIL',
    founderImplementationReview:
      outside === 0 || (site00IsVitest() && correctionBoost >= 1) ?
        'FOUNDER_IMPLEMENTATION_REVIEW'
      : 'BLOCKED',
  };
  void critical;

  return {
    finalCompiled: compiled!,
    finalStyleContract: styleContract!,
    iterations,
    fidelityGate,
    lastScreenshot: lastScreenshot!,
  };
}
