/**
 * P0.PCI.3R1 — PageFamilyDependencyPolicy (capture is downstream, optional for early stages).
 */

export type ReadinessDimension = 'STRUCTURE' | 'DESIGN' | 'WIRING' | 'CAPTURE';

export type DimensionReadiness = 'READY' | 'IN_PROGRESS' | 'PENDING' | 'UNAVAILABLE' | 'BLOCKED';

export type CaptureServiceInput = {
  apiConnected: boolean;
  workerHealthy: boolean;
  browserReady: boolean;
  contractValid: boolean;
};

export type PageFamilyDependencySnapshot = {
  structure: DimensionReadiness;
  design: DimensionReadiness;
  wiring: DimensionReadiness;
  capture: DimensionReadiness;
};

/** Capture service failure must never block structural page-family work. */
export function isCaptureBlockingFamilyWork(): boolean {
  return false;
}

export function canConfirmFamily(): boolean {
  return true;
}

export function canApproveDesign(structureConfirmed: boolean): boolean {
  return structureConfirmed;
}

export function canVerifyWiring(): boolean {
  return true;
}

export function canRunLiveCapture(input: CaptureServiceInput): boolean {
  return input.apiConnected && input.workerHealthy && input.browserReady && input.contractValid;
}

export function deriveCaptureDimensionStatus(input: CaptureServiceInput): DimensionReadiness {
  if (canRunLiveCapture(input)) return 'READY';
  if (!input.apiConnected) return 'UNAVAILABLE';
  return 'UNAVAILABLE';
}

export function derivePageFamilyDependencySnapshot(options: {
  structureConfirmed: boolean;
  approvedCount: number;
  derivativeCount: number;
  wiringIssueCount: number;
  captureService: CaptureServiceInput;
  capturePendingCount: number;
}): PageFamilyDependencySnapshot {
  const { structureConfirmed, approvedCount, derivativeCount, wiringIssueCount, captureService, capturePendingCount } =
    options;

  const structure: DimensionReadiness = structureConfirmed ? 'READY' : 'IN_PROGRESS';
  const design: DimensionReadiness =
    !structureConfirmed
      ? 'PENDING'
      : approvedCount >= derivativeCount && derivativeCount > 0
        ? 'READY'
        : 'IN_PROGRESS';
  const wiring: DimensionReadiness = wiringIssueCount > 0 ? 'IN_PROGRESS' : structureConfirmed ? 'READY' : 'PENDING';
  const capture: DimensionReadiness = canRunLiveCapture(captureService)
    ? capturePendingCount > 0
      ? 'PENDING'
      : 'READY'
    : 'UNAVAILABLE';

  return { structure, design, wiring, capture };
}

export function captureStatusLabel(status: DimensionReadiness): string {
  switch (status) {
    case 'READY':
      return 'READY';
    case 'IN_PROGRESS':
      return 'IN PROGRESS';
    case 'PENDING':
      return 'PENDING';
    case 'UNAVAILABLE':
      return 'UNAVAILABLE';
    case 'BLOCKED':
      return 'BLOCKED';
    default:
      return 'UNKNOWN';
  }
}

export function captureServiceChipLabel(input: CaptureServiceInput): string {
  if (canRunLiveCapture(input)) return 'READY';
  if (!input.apiConnected) return 'OFFLINE';
  if (!input.browserReady) return 'NEEDS ATTENTION';
  return 'NEEDS ATTENTION';
}
