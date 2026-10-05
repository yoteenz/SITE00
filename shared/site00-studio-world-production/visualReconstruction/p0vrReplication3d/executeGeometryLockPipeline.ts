/**
 * P0.VR.REPLICATION.3D — Authority coordinate map + grid lock (after 3C materialization).
 */

import type { AuthorityShellBlueprint } from '../p0vrReplication2/authorityShellBlueprint.js';
import type { LiteralRegionSpec } from '../p0vrReplication3b/types.js';
import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import type { ReplicationAssetSlot } from '../p0vrReplication3c/types.js';
import { buildAuthorityCoordinateMap } from './buildAuthorityCoordinateMap.js';
import { buildAuthorityGrid } from './buildAuthorityGrid.js';
import {
  buildHeroGeometricExecutionPlan,
  cssPatchFromGeometry,
  generateLiteralRegionSourceWithGeometry,
} from './applyGeometryToLiteralSource.js';
import { runGeometryCorrectionLoop } from './runGeometryCorrectionLoop.js';
import { P0_VR_REPLICATION_3D_BUILD } from './constants.js';
import type { GeometryLockReport } from './types.js';

export type GeometryLockResult = {
  report: GeometryLockReport;
  sessionPatch: Partial<ReconstructionTwinSession>;
};

export function executeGeometryLockPipeline(input: {
  session: ReconstructionTwinSession;
  shellBlueprint: AuthorityShellBlueprint;
  heroSpec: LiteralRegionSpec | null;
  assetSlots: ReplicationAssetSlot[];
  priorTwinVersionId: string;
}): GeometryLockResult {
  const coordinateMap = buildAuthorityCoordinateMap({
    blueprint: input.shellBlueprint,
    heroSpec: input.heroSpec,
    sourceAuthorityId: input.session.authorityVersionId,
  });

  const authorityGrid = buildAuthorityGrid(coordinateMap);
  const heroPlan = buildHeroGeometricExecutionPlan({ map: coordinateMap, grid: authorityGrid });
  let cssPatch = cssPatchFromGeometry({ map: coordinateMap, plan: heroPlan });

  const correction = runGeometryCorrectionLoop({
    map: coordinateMap,
    cssPatch,
    regionId: 'hero-editorial',
  });
  cssPatch = correction.cssPatch;

  const heroSource =
    input.heroSpec != null
      ? generateLiteralRegionSourceWithGeometry({
          spec: input.heroSpec,
          assetSlots: input.assetSlots,
          map: coordinateMap,
          grid: authorityGrid,
          plan: heroPlan,
          cssPatch,
        })
      : null;

  const heroGeometryPass =
    correction.receipt.status === 'PASS' ||
    correction.receipt.withinToleranceCount >= Math.min(4, correction.receipt.targetCount);
  const newTwinVersionId = `${input.priorTwinVersionId}_3d_${Date.now()}`;

  const report: GeometryLockReport = {
    reportId: `r3d_${input.session.sessionId}_${Date.now()}`,
    sessionId: input.session.sessionId,
    buildRef: P0_VR_REPLICATION_3D_BUILD,
    coordinateMap,
    authorityGrid,
    executionPlans: [heroPlan],
    fidelityReceipts: [correction.receipt],
    correctionPasses: correction.passes,
    cssPatch,
    heroGeometryPass,
    createdAt: new Date().toISOString(),
  };

  return {
    report,
    sessionPatch: {
      authorityCoordinateMap: coordinateMap,
      authorityGrid,
      geometryLockReport: report,
      geometryFidelityReceipts: [correction.receipt],
      geometryCorrectionPasses: correction.passes,
      twinGeometryCssPatch: cssPatch,
      twinVersionId: newTwinVersionId,
      geometryLiteralHeroSource: heroSource ?? null,
      twinVersions: [
        ...(input.session.twinVersions ?? []),
        {
          versionId: newTwinVersionId,
          sessionId: input.session.sessionId,
          revisionNumber: (input.session.twinVersions?.length ?? 0) + 1,
          buildRef: P0_VR_REPLICATION_3D_BUILD,
          commitSha: null,
          createdAt: new Date().toISOString(),
          status: heroGeometryPass ? 'READY' : 'DRAFT',
        },
      ],
    },
  };
}
