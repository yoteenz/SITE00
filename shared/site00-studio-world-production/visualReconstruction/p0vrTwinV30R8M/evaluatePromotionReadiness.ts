import type { MobileTwinImplementationBuildRecord, MobileTwinPromotionReadinessReceipt } from './types.js';
import type { ImplementationStructuralFidelityReceipt, ImplementationVisualFidelityReceipt } from './types.js';

export function evaluateMobileTwinPromotionReadiness(input: {
  packageApprovalDurable: boolean;
  build: MobileTwinImplementationBuildRecord | null;
  visual: ImplementationVisualFidelityReceipt | null;
  structural: ImplementationStructuralFidelityReceipt | null;
  functionalPass: boolean;
  previewRouteHealthy: boolean;
}): MobileTwinPromotionReadinessReceipt {
  const visualOk = input.visual?.result === 'PASS';
  const structuralOk = input.structural?.result === 'PASS';
  const founderApproved = input.build?.founderStatus === 'FOUNDER_APPROVED';
  const noForbidden = !(input.structural?.forbiddenRasterImplementation ?? false);
  const ready =
    input.packageApprovalDurable &&
    founderApproved &&
    visualOk &&
    structuralOk &&
    input.functionalPass &&
    noForbidden &&
    input.previewRouteHealthy &&
    Boolean(input.build);

  return {
    id: `mtprr-${input.build?.id ?? 'none'}`,
    packageApprovalDurable: input.packageApprovalDurable,
    implementationFounderApproved: founderApproved,
    visualFidelityAcceptable: visualOk,
    structuralFidelityAcceptable: structuralOk,
    noCriticalFunctionalFailures: input.functionalPass,
    noForbiddenPrimitives: noForbidden,
    noStaleAuthorityPackage: Boolean(input.build?.packageChecksum),
    previewRouteHealthy: input.previewRouteHealthy,
    status: ready ? 'PROMOTION_READY' : 'NOT_READY',
  };
}
