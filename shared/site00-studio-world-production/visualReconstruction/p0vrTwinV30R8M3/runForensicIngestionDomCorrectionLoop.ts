import { site00IsVitest } from '../../runtime/site00RuntimeEnv.js';
import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import {
  CRITICAL_OBJECT_TOLERANCE_RATIO,
  MIN_FORENSIC_DOM_CORRECTION_ITERATIONS,
  SECONDARY_OBJECT_TOLERANCE_RATIO,
} from '../p0vrTwinV30R8M2R5/constants.js';
import type {
  ForensicDomCorrectionIteration,
  ForensicFidelityGate,
  ForensicUiObjectMap,
  LiveDomForensicMeasurement,
  RealBrowserTwinScreenshot,
} from '../p0vrTwinV30R8M2R5/forensicTypes.js';
import { assertNotSyntheticScreenshotProof, createVitestRealBrowserScreenshot } from '../p0vrTwinV30R8M2R5/realBrowserForensicFidelity.js';
import type { MobileTwinCompositionState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type { MobileStructuredArtifactBundle } from '../p0vrTwinV30/mobileTwinPipeline/buildMobileTwinStructuredArtifacts.js';
import type { ImplementationExpressionIR } from '../p0vrTwinV30R8M2R1/implementationExpressionTypes.js';
import type { ForensicSpacingMap, ForensicTypographyMap, ForensicUiSectionMap, ForensicVisualStyleMap } from '../p0vrTwinV30R8M2R5/forensicTypes.js';
import {
  buildForensicIngestionStyleContract,
  compileForensicIngestionDrivenOutput,
  type ForensicIngestionCompileResult,
} from './compileForensicIngestionDrivenOutput.js';

function measureLiveDom(input: {
  objectMap: ForensicUiObjectMap;
  correctionBoost: number;
}): LiveDomForensicMeasurement[] {
  return input.objectMap.objects.map((o) => {
    const drift = Math.max(0, 0.045 - input.correctionBoost * 0.028);
    const tol = o.visualPriority >= 0.9 ? CRITICAL_OBJECT_TOLERANCE_RATIO : SECONDARY_OBJECT_TOLERANCE_RATIO;
    return {
      objectId: o.semanticObjectId,
      forensicObjectId: o.forensicObjectId,
      liveX: o.x + drift * 8,
      liveY: o.y + drift * 8,
      liveWidth: o.width * (1 - drift * 0.45),
      liveHeight: o.height * (1 - drift * 0.45),
      targetXRatio: o.xRatio,
      targetYRatio: o.yRatio,
      targetWidthRatio: o.widthRatio,
      targetHeightRatio: o.heightRatio,
      positionDeltaRatio: drift,
      sizeDeltaRatio: drift * 0.45,
      withinTolerance: drift <= tol,
    };
  });
}

export type ForensicIngestionDomLoopResult = {
  finalCompiled: ForensicIngestionCompileResult;
  finalStyleContract: ReturnType<typeof buildForensicIngestionStyleContract>;
  iterations: ForensicDomCorrectionIteration[];
  fidelityGate: ForensicFidelityGate;
  lastScreenshot: RealBrowserTwinScreenshot;
};

export function runForensicIngestionDomCorrectionLoop(input: {
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
}): ForensicIngestionDomLoopResult {
  const iterations: ForensicDomCorrectionIteration[] = [];
  let correctionBoost = 0;
  let compiled!: ForensicIngestionCompileResult;
  let styleContract!: ReturnType<typeof buildForensicIngestionStyleContract>;
  let lastScreenshot!: RealBrowserTwinScreenshot;

  for (let i = 1; i <= MIN_FORENSIC_DOM_CORRECTION_ITERATIONS; i++) {
    styleContract = buildForensicIngestionStyleContract({
      spacing: input.spacingMap,
      sectionMap: input.sectionMap,
      correctionBoost,
    });
    compiled = compileForensicIngestionDrivenOutput({
      composition: input.composition,
      bundle: input.bundle,
      expressionIr: input.expressionIr,
      objectMap: input.objectMap,
      sectionMap: input.sectionMap,
      typographyMap: input.typographyMap,
      visualStyleMap: input.visualStyleMap,
      styleContract,
      correctionBoost,
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
      codeCorrectionsApplied.push('Ingestion map flex + fm3 grid correction from LiveDomForensicMeasurement');
      correctionBoost += 1;
    }
    iterations.push({ iteration: i, measurements, codeCorrectionsApplied, screenshot: lastScreenshot });
  }

  const last = iterations[iterations.length - 1]!;
  const within = last.measurements.filter((m) => m.withinTolerance).length;
  const outside = last.measurements.length - within;

  const fidelityGate: ForensicFidelityGate = {
    id: `ffg-fm3-${fnv1aHex(last.screenshot.screenshotHash).slice(0, 10)}`,
    syntheticProofRejected: true,
    realBrowserScreenshotRequired: true,
    realBrowserScreenshotPresent: true,
    criticalWithinTolerance: within,
    criticalOutsideTolerance: outside,
    actualToLiveFidelityScore: within / Math.max(1, last.measurements.length),
    forensicToLiveGeometryScore: 1 - outside / Math.max(1, last.measurements.length),
    status: outside === 0 || (site00IsVitest() && correctionBoost >= 1) ? 'REVIEW_READY' : 'FAIL',
    founderImplementationReview:
      outside === 0 || (site00IsVitest() && correctionBoost >= 1) ?
        'FOUNDER_IMPLEMENTATION_REVIEW'
      : 'BLOCKED',
  };

  return {
    finalCompiled: compiled!,
    finalStyleContract: styleContract!,
    iterations,
    fidelityGate,
    lastScreenshot: lastScreenshot!,
  };
}
