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

  const visionReady = visionLiteral.report.heroRecognizable && !visionLiteral.report.capabilityLimit;
  const finalRenderMode = visionReady ? 'VISION_LITERAL_NDX_OVERVIEW' : visionLiteral.report.capabilityLimit
    ? input.session.preVisionBaselineRenderMode ?? 'SHELL_FIRST_NDX_OVERVIEW'
    : 'VISION_LITERAL_NDX_OVERVIEW';

  return {
    blueprint,
    shellMatch,
    shellReceipt,
    sessionPatch: {
      ...base.sessionPatch,
      ...visionLiteral.sessionPatch,
      status: pageReady ? 'READY_FOR_REVIEW' : shellPass ? base.sessionPatch.status : 'FAILED',
      twinRenderMode: finalRenderMode,
      visualAuthorityStatus: shellPass ? 'AUTHORITY_FIRST_BUILT' : 'SHELL_MISMATCH',
      authorityShellBlueprintId: blueprint.blueprintId,
      shellMatchResult: shellMatch,
      shellReconstructionReceipt: shellReceipt,
      replicationExecutionReceipt: base.receipt,
      driftTriangulationReport,
      replicationDecisionTraces: driftTriangulationReport.traces,
      preVisionBaselineRenderMode: 'SHELL_FIRST_NDX_OVERVIEW',
      visionReplicationReport: visionLiteral.report,
    },
  };
}
