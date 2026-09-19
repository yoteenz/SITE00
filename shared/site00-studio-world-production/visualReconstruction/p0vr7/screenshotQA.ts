/**
 * P0.VR.7 — Design reference screenshot QA engine.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import type {
  DesignReferenceDecomposition,
  DesignReferenceFidelityContract,
  DesignReferenceScreenshotQA,
  QaDimension,
  QaRegion,
  ReferenceFidelityStatus,
  ReferenceVisualDriftFinding,
  RegionQaScore,
} from './types.js';

function qaId(): string {
  return `qa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const QA_REGIONS: QaRegion[] = ['HEADER', 'HERO', 'NAV', 'MAIN_CONTENT', 'FOOTER', 'BOTTOM_NAV'];

export const QA_DIMENSIONS: QaDimension[] = [
  'GLOBAL_GEOMETRY',
  'COMPONENT_POSITION',
  'COMPONENT_SIZE',
  'TYPOGRAPHY_SCALE',
  'LINE_HEIGHT',
  'SPACING',
  'COLOR',
  'BORDER',
  'RADIUS',
  'ASSET_POSITION',
  'ASSET_SCALE',
  'VISUAL_WEIGHT',
  'DENSITY',
];

export function createPendingScreenshotQA(input: {
  contractId: string;
  viewport: DesignViewportClass;
  route: string;
  iterationCount: number;
}): DesignReferenceScreenshotQA {
  return {
    qaId: qaId(),
    contractId: input.contractId,
    viewport: input.viewport,
    route: input.route,
    executed: false,
    fidelityStatus: 'NOT_EVALUATED',
    numericScore: null,
    regionScores: QA_REGIONS.map((region) => ({
      region,
      dimensions: {},
      overall: 'NOT_EVALUATED' as ReferenceFidelityStatus,
    })),
    driftFindings: [],
    iterationCount: input.iterationCount,
    capturedAt: null,
    comparedAt: null,
  };
}

export function runDesignReferenceScreenshotQA(input: {
  contract: DesignReferenceFidelityContract;
  decomposition: DesignReferenceDecomposition;
  liveCaptureAvailable: boolean;
  liveGeometryHints?: Partial<{
    headerTooTall: number;
    stepperClipped: boolean;
    cardTooTallRatio: number;
    displaySizeRatio: number;
  }>;
}): DesignReferenceScreenshotQA {
  const { contract, liveCaptureAvailable, liveGeometryHints } = input;
  const driftFindings: ReferenceVisualDriftFinding[] = [];

  if (!liveCaptureAvailable) {
    return {
      qaId: qaId(),
      contractId: contract.contractId,
      viewport: contract.viewport,
      route: contract.route,
      executed: false,
      fidelityStatus: 'NOT_EVALUATED',
      numericScore: null,
      regionScores: QA_REGIONS.map((region) => ({
        region,
        dimensions: Object.fromEntries(QA_DIMENSIONS.map((d) => [d, 'NOT_EVALUATED' as ReferenceFidelityStatus])),
        overall: 'NOT_EVALUATED',
      })),
      driftFindings: [],
      iterationCount: contract.iterationCount + 1,
      capturedAt: null,
      comparedAt: new Date().toISOString(),
    };
  }

  if (liveGeometryHints?.headerTooTall && liveGeometryHints.headerTooTall > 0) {
    driftFindings.push({
      driftType: 'GEOMETRY_DRIFT',
      region: 'HEADER',
      description: `HEADER ${liveGeometryHints.headerTooTall}PX TOO TALL`,
      severity: 'MEDIUM',
    });
  }
  if (liveGeometryHints?.stepperClipped) {
    driftFindings.push({
      driftType: 'COMPONENT_DRIFT',
      region: 'MAIN_CONTENT',
      componentId: 'stepper',
      description: 'STEPPER WIDTH EXCEEDS MOBILE VIEWPORT — LABEL CLIPPED',
      severity: 'HIGH',
    });
  }
  if (liveGeometryHints?.cardTooTallRatio && liveGeometryHints.cardTooTallRatio > 1.1) {
    driftFindings.push({
      driftType: 'SPACING_DRIFT',
      region: 'MAIN_CONTENT',
      componentId: 'main-card',
      description: `CARD ${Math.round((liveGeometryHints.cardTooTallRatio - 1) * 100)}% TOO TALL`,
      severity: 'MEDIUM',
    });
  }
  if (liveGeometryHints?.displaySizeRatio && liveGeometryHints.displaySizeRatio > 1.2) {
    driftFindings.push({
      driftType: 'TYPOGRAPHY_DRIFT',
      region: 'HERO',
      description: `DISPLAY SIZE ${liveGeometryHints.displaySizeRatio.toFixed(1)}X TOO LARGE`,
      severity: 'MEDIUM',
    });
  }

  const regionScores: RegionQaScore[] = QA_REGIONS.map((region) => {
    const regionDrift = driftFindings.filter((d) => d.region === region);
    const overall: ReferenceFidelityStatus =
      regionDrift.length === 0 ? 'HIGH_MATCH' : regionDrift.some((d) => d.severity === 'HIGH') ? 'MAJOR_DRIFT' : 'PARTIAL_MATCH';
    return {
      region,
      dimensions: Object.fromEntries(
        QA_DIMENSIONS.map((d) => [d, regionDrift.length ? ('PARTIAL_MATCH' as ReferenceFidelityStatus) : ('HIGH_MATCH' as ReferenceFidelityStatus)]),
      ),
      overall,
    };
  });

  const highDrift = driftFindings.some((d) => d.severity === 'HIGH');
  const anyDrift = driftFindings.length > 0;
  const fidelityStatus: ReferenceFidelityStatus = !anyDrift
    ? 'HIGH_MATCH'
    : highDrift
      ? 'MAJOR_DRIFT'
      : 'PARTIAL_MATCH';

  return {
    qaId: qaId(),
    contractId: contract.contractId,
    viewport: contract.viewport,
    route: contract.route,
    executed: true,
    fidelityStatus,
    numericScore: null,
    regionScores,
    driftFindings,
    iterationCount: contract.iterationCount + 1,
    capturedAt: new Date().toISOString(),
    comparedAt: new Date().toISOString(),
  };
}

export function shouldBlockFalsePass(contract: DesignReferenceFidelityContract): boolean {
  if (contract.requireScreenshotQA && contract.latestScreenshotQa?.executed !== true) return true;
  if (contract.latestFidelityStatus === 'NOT_EVALUATED') return true;
  return implementationCompleteDoesNotEqualVerified(contract.status);
}

function implementationCompleteDoesNotEqualVerified(status: DesignReferenceFidelityContract['status']): boolean {
  return status !== 'VERIFIED' && status !== 'HIGH_MATCH';
}

export function compareRegionGeometry(
  reference: DesignReferenceDecomposition,
  liveHints: { componentId: string; heightDelta?: number; widthDelta?: number }[],
): ReferenceVisualDriftFinding[] {
  return liveHints
    .map((hint) => {
      const ref = reference.components.find((c) => c.componentId === hint.componentId);
      if (!ref) return null;
      const findings: ReferenceVisualDriftFinding[] = [];
      if (hint.heightDelta && Math.abs(hint.heightDelta) > 4) {
        findings.push({
          driftType: 'GEOMETRY_DRIFT',
          region: 'MAIN_CONTENT',
          componentId: hint.componentId,
          description: `${hint.componentId.toUpperCase()} HEIGHT DELTA ${hint.heightDelta}PX`,
          severity: Math.abs(hint.heightDelta) > 16 ? 'HIGH' : 'MEDIUM',
        });
      }
      if (hint.widthDelta && Math.abs(hint.widthDelta) > 4) {
        findings.push({
          driftType: 'COMPONENT_DRIFT',
          region: 'MAIN_CONTENT',
          componentId: hint.componentId,
          description: `${hint.componentId.toUpperCase()} WIDTH DELTA ${hint.widthDelta}PX`,
          severity: 'MEDIUM',
        });
      }
      return findings;
    })
    .flat()
    .filter(Boolean) as ReferenceVisualDriftFinding[];
}
