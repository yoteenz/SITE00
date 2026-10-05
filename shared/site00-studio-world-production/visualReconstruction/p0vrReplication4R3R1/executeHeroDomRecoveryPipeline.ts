import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import { P0_VR_REPLICATION_4R3R1_BUILD } from './constants.js';
import { materializeHeroSafeRegionCrops } from './materializeHeroSafeRegionCrops.js';
import type { HeroDomRecoveryReport, HeroGeometryReceiptV2, HeroRenderedCaptureReceipt } from './types.js';
import type { HeroGeometryConvergenceReport } from '../p0vrReplication4R3/types.js';

function pendingCaptureReceipt(): HeroRenderedCaptureReceipt {
  return {
    expectedCount: 14,
    foundCount: 0,
    missingIds: [],
    measurementSource: 'PENDING_LIVE_BROWSER',
    captureTimestamp: null,
    heroRootFound: false,
    fontsReady: false,
    imagesSettled: false,
    status: 'FAIL',
    failureCode: 'HERO_RENDERED_OBJECTS_INCOMPLETE',
  };
}

function pendingGeometryReceiptV2(): HeroGeometryReceiptV2 {
  return {
    authorityCount: 14,
    renderedCount: 0,
    measuredCount: 0,
    withinToleranceCount: 0,
    outlierCount: 14,
    maxPositionError: 0,
    maxSizeError: 0,
    measurementSource: 'PENDING_LIVE_BROWSER',
    status: 'FAIL',
  };
}

export async function executeHeroDomRecoveryPipeline(input: {
  session: ReconstructionTwinSession;
  priorConvergence?: HeroGeometryConvergenceReport | null;
}): Promise<{ report: HeroDomRecoveryReport; sessionPatch: Partial<ReconstructionTwinSession> }> {
  const authorityUrl =
    input.session.blueprintAssetBindings?.find((a) => a.objectId === '22')?.sourceAsset ??
    input.session.designAuthorityAssetRef ??
    null;

  const { crops, receipts } = authorityUrl
    ? await materializeHeroSafeRegionCrops({
        authorityUrl,
        sessionId: input.session.sessionId,
      })
    : { crops: { H06: null, H12: null }, receipts: [] };

  const captureReceipt = pendingCaptureReceipt();
  const geometryReceiptV2 = pendingGeometryReceiptV2();

  const prior = input.priorConvergence ?? input.session.heroGeometryConvergenceReport ?? null;
  const updatedConvergence: HeroGeometryConvergenceReport | null = prior
    ? {
        ...prior,
        renderedGeometry: [],
        geometryDeltas: [],
        geometryReceipt: {
          ...prior.geometryReceipt,
          measuredCount: 0,
          withinToleranceCount: 0,
          status: 'FAIL',
        },
        status: 'FAIL',
      }
    : null;

  const report: HeroDomRecoveryReport = {
    buildRef: P0_VR_REPLICATION_4R3R1_BUILD,
    sessionId: input.session.sessionId,
    captureReceipt,
    geometryReceiptV2,
    liveRenderedGeometry: [],
    liveGeometryDeltas: [],
    safeRegionCrops: receipts,
    status: receipts.every((r) => r.status === 'PASS') ? 'PARTIAL' : 'FAIL',
    notes:
      'Live DOM capture required in hero inspection (LIVE_BROWSER_DOM). Layout-spec geometry no longer counts as PASS.',
  };

  return {
    report,
    sessionPatch: {
      heroDomRecoveryReport: report,
      heroSafeRegionCropUrls: crops,
      ...(updatedConvergence ? { heroGeometryConvergenceReport: updatedConvergence } : {}),
    },
  };
}
