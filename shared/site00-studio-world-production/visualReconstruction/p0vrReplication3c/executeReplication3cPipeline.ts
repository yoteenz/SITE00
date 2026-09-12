/**
 * P0.VR.REPLICATION.3C — Asset realization + literal source execution (downstream of 3B vision).
 */

import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import type { VisionReplicationReport } from '../p0vrReplication3b/types.js';
import { buildHeroAssetInventory } from './heroAssetInventory.js';
import { heroAssetsFullyBound, resolveHeroAssetSlots } from './resolveHeroAssets.js';
import { buildHeroLayoutInstructions } from './literalLayoutInstructions.js';
import { executeLiteralRegionSource } from './literalSourceExecutor.js';
import { P0_VR_REPLICATION_3C_BUILD, MAX_HERO_ASSET_CORRECTION_PASSES } from './constants.js';
import type {
  LiteralSourceExecutionReceipt,
  Replication3CReport,
} from './types.js';

export type Replication3cResult = {
  report: Replication3CReport;
  sessionPatch: Partial<ReconstructionTwinSession>;
};

export function executeReplication3cPipeline(input: {
  session: ReconstructionTwinSession;
  visionReport: VisionReplicationReport;
  authorityImageUrl: string | null;
  priorTwinVersionId: string;
}): Replication3cResult {
  const heroSpec = input.visionReport.literalRegionSpecs.find((s) => s.regionId === 'hero-editorial');
  const authorityImage = input.authorityImageUrl ?? input.session.designAuthorityAssetRef ?? null;

  let inventory = heroSpec ? buildHeroAssetInventory({ heroSpec, authorityImageUrl: authorityImage }) : [];
  let { slots, receipts } = resolveHeroAssetSlots({ slots: inventory, authorityImageUrl: authorityImage });

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

  const heroExecution: LiteralSourceExecutionReceipt = {
    regionId: 'hero-editorial',
    literalSpecConsumed: Boolean(heroSpec),
    layoutInstructionCount: layoutInstructions.length,
    assetSlotCount: slots.length,
    assetResolvedCount: slots.filter((s) => s.status === 'BOUND').length,
    sourceElementCount: executedSource?.sourceElementCount ?? 0,
    collapsed: executedSource?.structureCollapse ?? true,
    rendered: true,
    visionCompared: input.visionReport.playwrightLoopUsed,
    correctionPasses,
    status: 'FAIL',
    failureCode: null,
  };

  const assetsOk = heroAssetsFullyBound(slots);
  const sourceOk = executedSource != null && !executedSource.structureCollapse;

  if (!assetsOk) {
    heroExecution.failureCode = 'UNRESOLVED_VISUAL_ASSET';
  } else if (!sourceOk) {
    heroExecution.failureCode = 'SOURCE_STRUCTURE_COLLAPSE';
  } else {
    heroExecution.status = 'PASS';
  }

  const heroHumanRecognizable = assetsOk && sourceOk && (heroSpec?.subregions.length ?? 0) >= 3;
  const capabilityLimit = !heroHumanRecognizable && correctionPasses >= MAX_HERO_ASSET_CORRECTION_PASSES;

  const newTwinVersionId = `${input.priorTwinVersionId}_3c_${Date.now()}`;

  const report: Replication3CReport = {
    reportId: `r3c_${input.session.sessionId}_${Date.now()}`,
    sessionId: input.session.sessionId,
    buildRef: P0_VR_REPLICATION_3C_BUILD,
    assetSlots: slots,
    assetReceipts: receipts,
    layoutInstructions,
    executionReceipts: [heroExecution],
    heroHumanRecognizable,
    capabilityLimit,
    capabilityFailure: capabilityLimit ? (assetsOk ? 'SOURCE_EXECUTION' : 'ASSET_REALIZATION') : null,
    priorTwinVersionPreserved: input.priorTwinVersionId,
    newTwinVersionId,
    createdAt: new Date().toISOString(),
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
      twinVersionId: newTwinVersionId,
      preVisionLiteralBaselineRenderMode: 'VISION_LITERAL_NDX_OVERVIEW',
      twinVersions: [
        ...(input.session.twinVersions ?? []),
        {
          versionId: newTwinVersionId,
          sessionId: input.session.sessionId,
          revisionNumber: (input.session.twinVersions?.length ?? 0) + 1,
          buildRef: P0_VR_REPLICATION_3C_BUILD,
          commitSha: null,
          createdAt: new Date().toISOString(),
          status: heroHumanRecognizable ? 'READY' : 'DRAFT',
        },
      ],
    },
  };
}
