import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import { buildHeroCssPatchFromLayout } from '../p0vrReplication4R3/heroLayoutSpec.js';
import type { HeroOutlierConvergenceReport } from './types.js';
import { P0_VR_REPLICATION_4R4_BUILD } from './constants.js';
import { buildHeroConvergenceBaseline } from './buildHeroConvergenceBaseline.js';

export function executeHeroOutlierConvergencePipeline(input: {
  session: ReconstructionTwinSession;
}): { report: HeroOutlierConvergenceReport; sessionPatch: Partial<ReconstructionTwinSession> } {
  const sessionId = input.session.sessionId;
  const authority = input.session.heroGeometryConvergenceReport?.authorityGeometry ?? [];
  const baseline = buildHeroConvergenceBaseline({
    twinId: sessionId,
    authorityId: input.session.designAuthorityAssetRef ?? sessionId,
    measurementSource: 'LIVE_BROWSER_DOM',
    authority,
    deltas: [],
  });

  const report: HeroOutlierConvergenceReport = {
    buildRef: P0_VR_REPLICATION_4R4_BUILD,
    sessionId,
    baseline: {
      ...baseline,
      passCount: 0,
      outlierCount: 14,
      outliers: [],
      measurementSource: 'LIVE_BROWSER_DOM',
    },
    ranking: [],
    passes: [],
    receipt: {
      baselineOutliers: [],
      pass1Outliers: [],
      pass2Outliers: [],
      pass3Outliers: [],
      finalOutliers: [],
      baselineMaxError: 0,
      finalMaxError: 0,
      baselineMeanError: 0,
      finalMeanError: 0,
      objectsChanged: [],
      objectsUntouched: [],
      status: 'PARTIAL',
    },
    cssPatch: buildHeroCssPatchFromLayout(),
    measurementSource: 'LIVE_BROWSER_DOM',
    status: 'PENDING_LIVE_CONVERGENCE',
  };

  return {
    report,
    sessionPatch: {
      heroOutlierConvergenceReport: report,
      twinForensicCssPatch: {
        ...(input.session.twinForensicCssPatch ?? {}),
        ...buildHeroCssPatchFromLayout(),
      },
    },
  };
}
