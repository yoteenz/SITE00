/**
 * P0.VR.REPLICATION.3C — Asset realization + literal source execution (downstream of 3B vision).
 * P0.VR.REPLICATION.3C-R1 — Proof-slot authority crop materialization before pass.
 */

import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import type { VisionReplicationReport } from '../p0vrReplication3b/types.js';
import { buildHeroAssetInventory } from './heroAssetInventory.js';
import { heroAssetsFullyBound, heroProofSlotVisible, resolveHeroAssetSlots } from './resolveHeroAssets.js';
import { buildHeroLayoutInstructions } from './literalLayoutInstructions.js';
import { executeLiteralRegionSource } from './literalSourceExecutor.js';
import { P0_VR_REPLICATION_3C_BUILD, MAX_HERO_ASSET_CORRECTION_PASSES } from './constants.js';
import type {
  AssetResolutionReceipt,
  LiteralSourceExecutionReceipt,
  Replication3CReport,
  ReplicationAssetSlot,
} from './types.js';
import {
  materializeHeroProofSlot,
  HERO_MATERIALIZATION_PROOF_SLOT_ID,
  P0_VR_REPLICATION_3C_R1_BUILD,
} from '../p0vrReplication3cR1/index.js';

export type Replication3cResult = {
  report: Replication3CReport;
  sessionPatch: Partial<ReconstructionTwinSession>;
};

function applyProofMaterialization(
  slots: ReplicationAssetSlot[],
  receipts: AssetResolutionReceipt[],
  materialized: Awaited<ReturnType<typeof materializeHeroProofSlot>>,
): { slots: ReplicationAssetSlot[]; receipts: AssetResolutionReceipt[] } {
  const nextSlots = slots.map((s) => {
    if (s.slotId !== HERO_MATERIALIZATION_PROOF_SLOT_ID) return s;
    if (!materialized.publicUrl) {
      return {
        ...s,
        status: 'UNRESOLVED_VISUAL_ASSET' as const,
        materializationTrace: materialized.trace,
        failureReason: materialized.trace.failureCode ?? 'ASSET_CREATION_FAILED',
      };
    }
    return {
      ...s,
      materializedPublicUrl: materialized.publicUrl,
      selectedAsset: materialized.publicUrl,
      status: materialized.ok ? ('BOUND' as const) : ('UNRESOLVED_VISUAL_ASSET' as const),
      bindingStage: materialized.ok ? ('PERSISTED' as const) : ('RESOLVED' as const),
      materializationTrace: materialized.trace,
      cropSpec: { objectFit: 'cover' as const, backgroundPosition: 'center', backgroundSize: 'cover' },
    };
  });

  const proofReceipt: AssetResolutionReceipt = {
    slotId: HERO_MATERIALIZATION_PROOF_SLOT_ID,
    strategy: 'AUTHORITY_REGION_DERIVATION',
    candidateCount: 1,
    selectedAsset: materialized.publicUrl,
    source: materialized.trace.storageBackend ?? 'materialized-crop',
    cropApplied: true,
    bound: materialized.ok,
    rendered: materialized.trace.decoded,
    visible: materialized.trace.visible,
    bindingStage: materialized.trace.visible ? 'VISIBLE' : materialized.ok ? 'PERSISTED' : 'RESOLVED',
    status: materialized.ok ? 'OK' : 'ASSET_BIND_FAILED',
    notes: materialized.trace.notes,
  };

  return {
    slots: nextSlots,
    receipts: [...receipts.filter((r) => r.slotId !== HERO_MATERIALIZATION_PROOF_SLOT_ID), proofReceipt],
  };
}

export async function executeReplication3cPipeline(input: {
  session: ReconstructionTwinSession;
  visionReport: VisionReplicationReport;
  authorityImageUrl: string | null;
  priorTwinVersionId: string;
}): Promise<Replication3cResult> {
  const heroSpec = input.visionReport.literalRegionSpecs.find((s) => s.regionId === 'hero-editorial');
  const authorityImage = input.authorityImageUrl ?? input.session.designAuthorityAssetRef ?? null;

  let inventory = heroSpec ? buildHeroAssetInventory({ heroSpec, authorityImageUrl: authorityImage }) : [];
  let { slots, receipts } = resolveHeroAssetSlots({ slots: inventory, authorityImageUrl: authorityImage });

  let materializationTraces = [];
  if (authorityImage) {
    const materialized = await materializeHeroProofSlot({
      authorityUrl: authorityImage,
      sessionId: input.session.sessionId,
    });
    materializationTraces.push(materialized.trace);
    const applied = applyProofMaterialization(slots, receipts, materialized);
    slots = applied.slots;
    receipts = applied.receipts;
  }

  let correctionPasses = 0;
  while (!heroAssetsFullyBound(slots) && correctionPasses < MAX_HERO_ASSET_CORRECTION_PASSES) {
    correctionPasses += 1;
    const retry = resolveHeroAssetSlots({ slots, authorityImageUrl: authorityImage });
    slots = retry.slots;
    receipts = [...receipts, ...retry.receipts];
  }

  const layoutInstructions = heroSpec ? buildHeroLayoutInstructions(heroSpec) : [];
  const executedSource = heroSpec
    ? executeLiteralRegionSource({ spec: heroSpec, layoutInstructions, assetSlots: slots })
    : null;

  const proofVisible = heroProofSlotVisible(slots);

  const heroExecution: LiteralSourceExecutionReceipt = {
    regionId: 'hero-editorial',
    literalSpecConsumed: Boolean(heroSpec),
    layoutInstructionCount: layoutInstructions.length,
    assetSlotCount: slots.length,
    assetResolvedCount: slots.filter((s) => s.status === 'BOUND').length,
    sourceElementCount: executedSource?.sourceElementCount ?? 0,
    collapsed: executedSource?.structureCollapse ?? true,
    rendered: proofVisible,
    visionCompared: input.visionReport.playwrightLoopUsed,
    correctionPasses,
    status: 'FAIL',
    failureCode: null,
  };

  const sourceOk = executedSource != null && !executedSource.structureCollapse;

  if (!proofVisible) {
    heroExecution.failureCode = 'UNRESOLVED_VISUAL_ASSET';
  } else if (!sourceOk) {
    heroExecution.failureCode = 'SOURCE_STRUCTURE_COLLAPSE';
  } else {
    heroExecution.status = 'PASS';
  }

  const heroHumanRecognizable = proofVisible && sourceOk && (heroSpec?.subregions.length ?? 0) >= 3;
  const capabilityLimit = !heroHumanRecognizable && correctionPasses >= MAX_HERO_ASSET_CORRECTION_PASSES;

  const newTwinVersionId = `${input.priorTwinVersionId}_3cr1_${Date.now()}`;

  const report: Replication3CReport = {
    reportId: `r3c_${input.session.sessionId}_${Date.now()}`,
    sessionId: input.session.sessionId,
    buildRef: `${P0_VR_REPLICATION_3C_BUILD}+${P0_VR_REPLICATION_3C_R1_BUILD}`,
    assetSlots: slots,
    assetReceipts: receipts,
    layoutInstructions,
    executionReceipts: [heroExecution],
    heroHumanRecognizable,
    capabilityLimit,
    capabilityFailure: capabilityLimit ? (proofVisible ? 'SOURCE_EXECUTION' : 'ASSET_REALIZATION') : null,
    priorTwinVersionPreserved: input.priorTwinVersionId,
    newTwinVersionId,
    createdAt: new Date().toISOString(),
    materializationTraces,
    proofSlotVisible: proofVisible,
    activeTwinVersionId: newTwinVersionId,
    sourceBuildVersion: P0_VR_REPLICATION_3C_R1_BUILD,
  };

  return {
    report,
    sessionPatch: {
      twinRenderMode: heroHumanRecognizable ? 'VISION_LITERAL_EXECUTED_NDX_OVERVIEW' : 'VISION_LITERAL_NDX_OVERVIEW',
      replication3cReport: report,
      replicationAssetSlots: slots,
      literalLayoutInstructions: layoutInstructions,
      visionLiteralExecutedSources: executedSource ? [executedSource] : [],
      literalSourceExecutionReceipts: [heroExecution],
      heroMaterializationTraces: materializationTraces,
      assetManifestVersion: P0_VR_REPLICATION_3C_R1_BUILD,
      twinVersionId: newTwinVersionId,
      preVisionLiteralBaselineRenderMode: 'VISION_LITERAL_NDX_OVERVIEW',
      twinVersions: [
        ...(input.session.twinVersions ?? []),
        {
          versionId: newTwinVersionId,
          sessionId: input.session.sessionId,
          revisionNumber: (input.session.twinVersions?.length ?? 0) + 1,
          buildRef: P0_VR_REPLICATION_3C_R1_BUILD,
          commitSha: null,
          createdAt: new Date().toISOString(),
          status: heroHumanRecognizable ? 'READY' : 'DRAFT',
        },
      ],
    },
  };
}
