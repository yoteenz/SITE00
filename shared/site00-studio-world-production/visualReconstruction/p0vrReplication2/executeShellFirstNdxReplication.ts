/**
 * P0.VR.REPLICATION.2 — Shell-first geometric reconstruction (NDXBOOK overview mobile pilot).
 */

import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import { executeNdxbookReplication } from '../p0vrReplication1R1/executeNdxbookReplication.js';
import { buildNdxAuthorityShellBlueprint } from './authorityShellBlueprint.js';
import { evaluateShellMatch, expectedShellFirstTwinBandPresence } from './shellMatchResult.js';
import { buildShellReconstructionReceipt } from './shellReconstructionReceipt.js';
import { buildDriftTriangulationReport } from '../p0vrReplication3a/buildDriftTriangulationReport.js';
import { executeVisionLiteralNdxReplication } from '../p0vrReplication3b/executeVisionLiteralNdxReplication.js';
import { executeReplication3cPipeline } from '../p0vrReplication3c/executeReplication3cPipeline.js';
import { executeGeometryLockPipeline } from '../p0vrReplication3d/executeGeometryLockPipeline.js';
import { executeContentRootBoundaryPipeline } from '../p0vrReplication3dBoundary/executeContentRootBoundaryPipeline.js';
import { executeForensicBlueprintPipeline } from '../p0vrReplication4/executeForensicBlueprintPipeline.js';
import { P0_VR_REPLICATION_2_BUILD } from './constants.js';
import type { ShellMatchResult } from './shellMatchResult.js';
import type { AuthorityShellBlueprint } from './authorityShellBlueprint.js';
import type { ShellReconstructionReceipt } from './shellReconstructionReceipt.js';

export type ShellFirstReplicationResult = {
  blueprint: AuthorityShellBlueprint;
  shellMatch: ShellMatchResult;
  shellReceipt: ShellReconstructionReceipt;
  sessionPatch: Partial<ReconstructionTwinSession>;
};

export async function executeShellFirstNdxReplication(input: {
  session: ReconstructionTwinSession;
  twinVersionId: string;
}): Promise<ShellFirstReplicationResult> {
  const blueprint = buildNdxAuthorityShellBlueprint({
    pageId: input.session.pageId,
    viewport: input.session.viewport,
    authorityVersionId: input.session.authorityVersionId,
  });

  const base = await executeNdxbookReplication({
    session: input.session,
    twinVersionId: input.twinVersionId,
    convergenceAfter: input.session.convergenceAfter ?? null,
  });

  const shellMatch = evaluateShellMatch({
    blueprint,
    twinRenderMode: 'SHELL_FIRST_NDX_OVERVIEW',
    twinBandPresence: expectedShellFirstTwinBandPresence(),
  });

  const shellReceipt = buildShellReconstructionReceipt({
    sessionId: input.session.sessionId,
    blueprint,
    shellMatch,
    buildRef: P0_VR_REPLICATION_2_BUILD,
    fallbackUsed: base.receipt.directSourceFallback === 'PASS',
  });

  const shellPass = shellMatch.status === 'PASS';
  const pageReady = shellPass && base.receipt.status === 'PASS';

  const driftTriangulationReport = buildDriftTriangulationReport({
    session: input.session,
    shellBlueprint: blueprint,
    replicationMode: true,
  });

  const visionLiteral = await executeVisionLiteralNdxReplication({
    session: {
      ...input.session,
      twinVersionId: input.twinVersionId,
      twinRenderMode: 'SHELL_FIRST_NDX_OVERVIEW',
    },
    twinVersionId: input.twinVersionId,
    authorityImageUrl: input.session.designAuthorityAssetRef ?? null,
    twinPreviewUrl: input.session.twinRoute,
    preVisionBaselineRenderMode: 'SHELL_FIRST_NDX_OVERVIEW',
  });

  const replication3c = await executeReplication3cPipeline({
    session: input.session,
    visionReport: visionLiteral.report,
    authorityImageUrl: input.session.designAuthorityAssetRef ?? null,
    priorTwinVersionId: visionLiteral.sessionPatch.twinVersionId ?? input.twinVersionId,
  });

  const heroSpec = visionLiteral.report.literalRegionSpecs.find((s) => s.regionId === 'hero-editorial') ?? null;
  const geometryLock = executeGeometryLockPipeline({
    session: input.session,
    shellBlueprint: blueprint,
    heroSpec,
    assetSlots: replication3c.sessionPatch.replicationAssetSlots ?? replication3c.report.assetSlots,
    priorTwinVersionId: replication3c.sessionPatch.twinVersionId ?? input.twinVersionId,
  });

  const boundary = executeContentRootBoundaryPipeline({
    session: input.session,
    assetSlots:
      geometryLock.sessionPatch.replicationAssetSlots ??
      replication3c.sessionPatch.replicationAssetSlots ??
      replication3c.report.assetSlots,
    coordinateMap: geometryLock.sessionPatch.authorityCoordinateMap ?? geometryLock.report.coordinateMap,
  });

  const forensic = executeForensicBlueprintPipeline({
    session: input.session,
    boundaryReport: boundary.report,
    priorTwinVersionId: boundary.sessionPatch.twinVersionId ?? geometryLock.sessionPatch.twinVersionId ?? input.twinVersionId,
  });

  const visionReady = replication3c.report.heroHumanRecognizable;
  const forensicReady =
    forensic.report.status === 'PASS' ||
    (forensic.report.requiredCoverage >= 95 && !forensic.report.invalidReplicationRoot);
  const finalRenderMode = forensicReady
    ? 'FORENSIC_BLUEPRINT_EXECUTED_NDX_OVERVIEW'
    : forensic.report.status === 'FORENSIC_BLUEPRINT_EXECUTION_FAILED'
      ? 'FORENSIC_BLUEPRINT_NDX_OVERVIEW'
      : visionReady
        ? 'VISION_LITERAL_EXECUTED_NDX_OVERVIEW'
        : 'VISION_LITERAL_NDX_OVERVIEW';

  return {
    blueprint,
    shellMatch,
    shellReceipt,
    sessionPatch: {
      ...base.sessionPatch,
      ...visionLiteral.sessionPatch,
      ...replication3c.sessionPatch,
      ...geometryLock.sessionPatch,
      ...boundary.sessionPatch,
      ...forensic.sessionPatch,
      status: pageReady ? 'READY_FOR_REVIEW' : shellPass ? base.sessionPatch.status : 'FAILED',
      twinRenderMode: finalRenderMode,
      forensicBlueprintReport: forensic.report,
      visualAuthorityStatus: shellPass ? 'AUTHORITY_FIRST_BUILT' : 'SHELL_MISMATCH',
      authorityShellBlueprintId: blueprint.blueprintId,
      shellMatchResult: shellMatch,
      shellReconstructionReceipt: shellReceipt,
      replicationExecutionReceipt: base.receipt,
      driftTriangulationReport,
      replicationDecisionTraces: driftTriangulationReport.traces,
      preVisionBaselineRenderMode: 'SHELL_FIRST_NDX_OVERVIEW',
      visionReplicationReport: visionLiteral.report,
      replication3cReport: replication3c.report,
      geometryLockReport: geometryLock.report,
    },
  };
}
