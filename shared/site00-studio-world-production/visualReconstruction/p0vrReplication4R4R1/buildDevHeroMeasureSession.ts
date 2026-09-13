import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import { executeHeroGeometryConvergencePipeline } from '../p0vrReplication4R3/executeHeroGeometryConvergencePipeline.js';
import { executeHeroSurgicalLockPipeline } from '../p0vrReplication4R2/executeHeroSurgicalLockPipeline.js';
import { buildHeroCssPatchFromLayout } from '../p0vrReplication4R3/heroLayoutSpec.js';

/** Deterministic twin session for Playwright / dev hero DOM measurement (twin-only). */
export function buildDevHeroMeasureSession(): ReconstructionTwinSession {
  const sessionId = 'dev-hero-measure-4r4r1';
  const base = {
    sessionId,
    projectId: 'ndxbook',
    pageId: 'overview-mobile',
    canonicalRoute: '/projects/ndxbook/pages/overview',
    twinRoute: '/projects/ndxbook/debug/reconstruction/overview/dev-hero-measure-4r4r1',
    status: 'READY_FOR_REVIEW' as const,
    viewport: 'mobile' as const,
    authorityVersionId: 'dev',
    mutationPolicy: 'READ_ONLY' as const,
    beforeCaptureId: null,
    reconstructionPlanId: null,
    sourceLiveVersionId: null,
    twinVersionId: 'dev-twin-v1',
    twinMutationPolicy: 'READ_ONLY' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvedForPromotionAt: null,
    promotedAt: null,
    buildSteps: [],
    twinCapture: null,
    revisions: [],
    twinVersions: [],
    fidelityQa: [],
    promotionReadiness: null,
    responsiveImpact: [],
    designAuthorityAssetRef: 'dev-authority-placeholder',
    twinForensicCssPatch: buildHeroCssPatchFromLayout(),
    heroSafeRegionCropUrls: { H06: null, H12: null },
  } as unknown as ReconstructionTwinSession;

  const heroLock = executeHeroSurgicalLockPipeline({ session: base });
  const heroGeometry = executeHeroGeometryConvergencePipeline({
    session: { ...base, ...heroLock.sessionPatch },
  });

  return {
    ...base,
    ...heroLock.sessionPatch,
    ...heroGeometry.sessionPatch,
    twinRenderMode: 'FORENSIC_BLUEPRINT_EXECUTED_NDX_OVERVIEW',
  };
}
