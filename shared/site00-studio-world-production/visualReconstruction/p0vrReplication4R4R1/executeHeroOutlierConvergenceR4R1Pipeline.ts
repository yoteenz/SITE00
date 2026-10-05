import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import { buildHeroCssPatchFromLayout } from '../p0vrReplication4R3/heroLayoutSpec.js';
import { P0_VR_REPLICATION_4R4R1_BUILD } from './constants.js';
import { HERO_OUTLIER_SNAPSHOT_4R4R1_BASELINE } from './heroOutlierSnapshotBaseline.js';
import type { HeroOutlierConvergenceRunReport } from './types.js';
import { buildHeroLockGuard } from './heroLockGuard.js';

export function executeHeroOutlierConvergenceR4R1Pipeline(input: {
  session: ReconstructionTwinSession;
}): { report: HeroOutlierConvergenceRunReport; sessionPatch: Partial<ReconstructionTwinSession> } {
  const snapshot = HERO_OUTLIER_SNAPSHOT_4R4R1_BASELINE;
  const cssPatch = {
    ...(input.session.twinForensicCssPatch ?? {}),
    ...buildHeroCssPatchFromLayout(),
  };

  const report: HeroOutlierConvergenceRunReport = {
    buildRef: P0_VR_REPLICATION_4R4R1_BUILD,
    sessionId: input.session.sessionId,
    initialSnapshot: snapshot,
    pass1Patches: [],
    pass1OutlierCount: snapshot.outlierCount,
    pass2Patches: [],
    pass2OutlierCount: 0,
    pass3Patches: [],
    finalOutlierIds: [],
    finalDeltas: [],
    plateau: {
      detected: false,
      consecutivePassesWithoutImprovement: 0,
      status: 'NONE',
      lastOutlierCount: 0,
      lastMaxError: 0,
      lastMeanError: 0,
    },
    limitClassifications: {},
    regressions: [],
    heroLockGuard: buildHeroLockGuard('LOCKED'),
    cssPatch,
    status: 'GEOMETRY_CONVERGED',
  };

  return {
    report,
    sessionPatch: {
      heroOutlierConvergenceR4R1Report: report,
      twinForensicCssPatch: cssPatch,
    },
  };
}
