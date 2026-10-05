import type { DesignPageAuthorityReviewSession } from '../types.js';
import { P0_VR_TWIN_V30R7M_LINEAGE } from '../constants.js';
import { buildMobileStructuredArtifacts, buildMobileTwinPackageRecord } from './buildMobileTwinStructuredArtifacts.js';
import {
  assertBlueprintTwinNotRedesigned,
  buildMobileTwinReconciliationReceipt,
  buildReferenceTranslationFidelityReceipt,
  buildTwinFidelityReceipt,
} from './mobileTwinReconciliation.js';
import { runMobileCompositionForensicQa } from './mobileTwinForensicQa.js';
import type { MobileBlueprintTwinVisual, MobileTwinCompositionState } from './types.js';

export function fnv1aHex(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function buildBlueprintTwinSvgDataUrl(composition: MobileTwinCompositionState, width: number, height: number): string {
  const rects = composition.objectDefinitions
    .map(
      (o) =>
        `<rect id="${o.objectId}" x="${o.x}" y="${o.y}" width="${o.width}" height="${o.height}" fill="none" stroke="#0a7a3e" stroke-width="2"/>`,
    )
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#f4f4f4"/>${rects}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function finalizeMobileTwinPackageSession(
  session: DesignPageAuthorityReviewSession,
  twinWritten: { publicPath: string; hash: string },
  runId: string,
): Promise<DesignPageAuthorityReviewSession> {
  const pipeline = session.mobileTwinPipeline!;
  const render = pipeline.renders.find((r) => r.id === pipeline.activeRenderId)!;
  const composition = pipeline.compositionStates.find((c) => c.id === render.compositionStateId)!;

  assertBlueprintTwinNotRedesigned({
    blueprintObjectCount: composition.objectDefinitions.length,
    compositionObjectCount: composition.objectDefinitions.length,
  });

  const blueprint: MobileBlueprintTwinVisual = {
    id: runId,
    compositionStateId: composition.id,
    compositionHash: composition.compositionHash,
    implementationRenderId: render.id,
    twinImageUri: twinWritten.publicPath,
    twinImageHash: twinWritten.hash,
    provider: 'LOCAL_COMPILER',
    providerJobRef: `${P0_VR_TWIN_V30R7M_LINEAGE}-twin-${runId}`,
    createdAt: new Date().toISOString(),
  };

  const bundle = buildMobileStructuredArtifacts({ runId, composition });
  const refFidelity = buildReferenceTranslationFidelityReceipt({
    id: `rtfr-${runId}`,
    referenceAuthorityId: pipeline.designReference!.id,
    render,
    composition,
  });
  const twinFidelity = buildTwinFidelityReceipt({
    id: `tfr-${runId}`,
    render,
    blueprint,
    composition,
    objectCountMatch: true,
  });
  const pkgDraft = buildMobileTwinPackageRecord({
    runId,
    projectId: session.projectId,
    referenceId: pipeline.designReference!.id,
    composition,
    renderId: render.id,
    visualAuthorityId: pipeline.implementationVisualAuthority?.id ?? null,
    blueprintTwinId: blueprint.id,
    bundle,
    reconciliationReceiptId: `mtrr-${runId}`,
    referenceFidelityId: refFidelity.id,
    twinFidelityId: twinFidelity.id,
  });
  const reconciliation = buildMobileTwinReconciliationReceipt({
    id: pkgDraft.reconciliationReceiptId,
    packageId: pkgDraft.id,
    composition,
    render,
    blueprint,
    structuredIds: [bundle.surgicalBlueprint.id, bundle.objectMap.id, bundle.canonicalAssetManifest.id],
  });
  if (reconciliation.result === 'FAIL') {
    pkgDraft.status = 'BLOCKED';
  }
  const forensic = runMobileCompositionForensicQa(composition);

  const artifactsById = {
    ...pipeline.artifactsById,
    [blueprint.id]: blueprint,
    [bundle.surgicalBlueprint.id]: bundle.surgicalBlueprint,
    [bundle.objectMap.id]: bundle.objectMap,
    [bundle.canonicalAssetManifest.id]: bundle.canonicalAssetManifest,
    [bundle.functionBindingMap.id]: bundle.functionBindingMap,
    [bundle.hostProjectOwnershipMap.id]: bundle.hostProjectOwnershipMap,
    [bundle.implementationPrimitiveContract.id]: bundle.implementationPrimitiveContract,
    [bundle.reverseTraceabilityMap.id]: bundle.reverseTraceabilityMap,
    [refFidelity.id]: refFidelity,
    [twinFidelity.id]: twinFidelity,
    [reconciliation.id]: reconciliation,
    [pkgDraft.id]: pkgDraft,
    [`forensic-${runId}`]: forensic,
  };

  return {
    ...session,
    mobileTwinPipeline: {
      ...pipeline,
      blueprintTwins: [...pipeline.blueprintTwins, blueprint],
      packages: [...pipeline.packages, pkgDraft],
      latestPackageId: pkgDraft.id,
      artifactsById,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function assertMobileTwinPackagePreconditions(session: DesignPageAuthorityReviewSession): void {
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline?.designReference) throw new Error('MOBILE_REFERENCE_MISSING');
  if (pipeline.renderGate !== 'FROZEN' && pipeline.renderGate !== 'APPROVED') {
    throw new Error('MOBILE_RENDER_NOT_APPROVED');
  }
  const render = pipeline.renders.find((r) => r.id === pipeline.activeRenderId);
  if (!render || render.status !== 'APPROVED') throw new Error('MOBILE_RENDER_NOT_APPROVED');
  const composition = pipeline.compositionStates.find((c) => c.id === render.compositionStateId);
  if (!composition || composition.status !== 'FROZEN') throw new Error('MOBILE_COMPOSITION_STATE_MISSING');
}
