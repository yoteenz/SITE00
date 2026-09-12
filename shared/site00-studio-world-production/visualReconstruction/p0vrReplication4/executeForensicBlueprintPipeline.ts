/**
 * P0.VR.REPLICATION.4 — Forensic blueprint consumption + zero-invention rebuild pipeline.
 */

import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import type { ReplicationRenderBoundaryReceipt } from '../p0vrReplication3dBoundary/types.js';
import { P0_VR_REPLICATION_4_BUILD } from './constants.js';
import { getNdxbookMobileForensicBlueprint, NDXBOOK_FORENSIC_OBJECT_COUNT } from './ndxForensicBlueprintCatalog.js';
import { buildBlueprintDomBindings } from './buildBlueprintDomBindings.js';
import { buildBlueprintAssetBindings } from './buildBlueprintAssetBindings.js';
import { buildBlueprintTranslationReceipts } from './buildBlueprintTranslationReceipts.js';
import { runForensicConvergenceLoop } from './runForensicConvergenceLoop.js';
import type { ForensicBlueprintExecutionReport } from './types.js';

export type ForensicBlueprintPipelineResult = {
  report: ForensicBlueprintExecutionReport;
  sessionPatch: Partial<ReconstructionTwinSession>;
};

function pct(n: number, d: number): number {
  if (d === 0) return 0;
  return Math.round((n / d) * 100);
}

export function executeForensicBlueprintPipeline(input: {
  session: ReconstructionTwinSession;
  boundaryReport: ReplicationRenderBoundaryReceipt | null;
  priorTwinVersionId: string;
}): ForensicBlueprintPipelineResult {
  const authorityAsset = input.session.designAuthorityAssetRef ?? null;
  const blueprint = getNdxbookMobileForensicBlueprint({
    authorityId: input.session.authorityVersionId,
    authorityAsset: authorityAsset ?? undefined,
  });

  const invalidReplicationRoot =
    input.boundaryReport != null &&
    (!input.boundaryReport.verdict.CONTENT_ROOT_VALID || input.boundaryReport.verdict.PAGE_NESTING_DETECTED);

  const domBindings = buildBlueprintDomBindings(blueprint.objects);
  const assetBindings = buildBlueprintAssetBindings({
    objects: blueprint.objects,
    authorityAssetUrl: authorityAsset,
  });

  const translationReceipts = buildBlueprintTranslationReceipts({
    objects: blueprint.objects,
    domBindings,
    assetBindings,
  });

  const requiredObjects = blueprint.objects.filter((o) => o.required);
  const requiredPass = translationReceipts.filter((r) => {
    const obj = blueprint.objects.find((o) => o.objectId === r.objectId);
    return obj?.required && r.status === 'PASS';
  }).length;

  const wholePageScreenshotCheat = assetBindings.some(
    (a) => a.objectId === '22' && a.sourceStrategy === 'AUTHORITY_CROP' && a.crop === 'full-page',
  );

  const { deltas, passes, cssPatch } = runForensicConvergenceLoop({ objects: blueprint.objects });

  const geometryMatchPct = pct(
    translationReceipts.filter((r) => r.geometryMatched).length,
    requiredObjects.length,
  );
  const typographyMatchPct = pct(
    translationReceipts.filter((r) => r.typographyMatched).length,
    requiredObjects.filter((o) => o.objectType === 'text').length,
  );
  const assetMatchPct = pct(
    assetBindings.filter((a) => a.status !== 'UNRESOLVED').length,
    assetBindings.length || 1,
  );
  const colorMatchPct = pct(
    translationReceipts.filter((r) => r.colorMatched).length,
    requiredObjects.length,
  );

  const requiredCoverage = pct(requiredPass, requiredObjects.length);

  let status: ForensicBlueprintExecutionReport['status'] = 'PARTIAL';
  let failureStage: ForensicBlueprintExecutionReport['failureStage'] = null;
  let founderMessage: string | null = null;

  if (invalidReplicationRoot) {
    status = 'FORENSIC_BLUEPRINT_EXECUTION_FAILED';
    failureStage = 'RENDER';
    founderMessage = 'INVALID_REPLICATION_ROOT — fix content root before forensic rebuild.';
  } else if (requiredCoverage < 100) {
    status = 'PARTIAL';
    failureStage = 'BINDING';
    founderMessage = `Required object coverage ${requiredCoverage}% — unresolved blueprint objects remain.`;
  } else if (passes.length >= 3 && passes[passes.length - 1]?.outOfToleranceCount) {
    status = 'FORENSIC_BLUEPRINT_EXECUTION_FAILED';
    failureStage = 'GEOMETRY';
    founderMessage = 'Geometry still out of tolerance after 3 passes — see ObjectGeometryDelta.';
  } else if (requiredCoverage === 100 && !wholePageScreenshotCheat) {
    status = 'PASS';
    founderMessage = null;
  }

  const newTwinVersionId = `${input.priorTwinVersionId}_4fb_${Date.now()}`;

  const report: ForensicBlueprintExecutionReport = {
    reportId: `r4fb_${input.session.sessionId}_${Date.now()}`,
    sessionId: input.session.sessionId,
    buildRef: P0_VR_REPLICATION_4_BUILD,
    blueprint,
    domBindings,
    assetBindings,
    translationReceipts,
    geometryDeltas: deltas,
    convergencePasses: passes,
    mappedObjects: domBindings.filter((b) => b.status === 'BOUND').length,
    totalObjects: NDXBOOK_FORENSIC_OBJECT_COUNT,
    requiredCoverage,
    geometryMatchPct,
    typographyMatchPct,
    assetMatchPct,
    colorMatchPct,
    invalidReplicationRoot,
    wholePageScreenshotCheat,
    status,
    failureStage,
    founderMessage,
    createdAt: new Date().toISOString(),
  };

  const forensicReady = status === 'PASS' || (status === 'PARTIAL' && requiredCoverage >= 95);

  return {
    report,
    sessionPatch: {
      forensicBlueprintReport: report,
      forensicAuthorityBlueprint: blueprint,
      blueprintDomBindings: domBindings,
      blueprintAssetBindings: assetBindings,
      blueprintTranslationReceipts: translationReceipts,
      objectGeometryDeltas: deltas,
      forensicConvergencePasses: passes,
      twinForensicCssPatch: cssPatch,
      replicationMode: 'FORENSIC_BLUEPRINT_REPLICATION',
      twinRenderMode: forensicReady
        ? 'FORENSIC_BLUEPRINT_EXECUTED_NDX_OVERVIEW'
        : 'FORENSIC_BLUEPRINT_NDX_OVERVIEW',
      twinVersionId: newTwinVersionId,
      twinVersions: [
        ...(input.session.twinVersions ?? []),
        {
          versionId: newTwinVersionId,
          sessionId: input.session.sessionId,
          revisionNumber: (input.session.twinVersions?.length ?? 0) + 1,
          buildRef: P0_VR_REPLICATION_4_BUILD,
          commitSha: null,
          createdAt: new Date().toISOString(),
          status: forensicReady ? 'READY' : 'DRAFT',
        },
      ],
    },
  };
}
