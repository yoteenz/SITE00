/**
 * Sprint B3 — ENTRY 002 creative anchor production orchestrator.
 */

import type { Entry002AnchorProductionResult } from '../../../shared/site00-expression-engine/anchorTypes.js';
import type { CreativeEntry } from '../../../shared/site00-expression-engine/types.js';
import { compileEntry002LockedEntry } from './entry002Blueprint.js';
import { saveEntry } from './entryStore.js';
import {
  compileEntry002AnchorCompositionRoutes,
  selectEntry002AnchorRoute,
} from './entry002AnchorRoutes.js';
import {
  downstreamProductionBlocked,
  evaluateEntry002AnchorQA,
  runPreAnchorQAGates,
} from './entry002AnchorQA.js';
import { dispatchEntry002CreativeAnchor } from './entry002AnchorDispatch.js';
import { buildEntry002AnchorCreativeAssetRecord } from './entry002AnchorAssetRecord.js';

export async function produceEntry002CreativeAnchor(options?: {
  dispatchFal?: boolean;
}): Promise<{ entry: CreativeEntry; result: Entry002AnchorProductionResult }> {
  const baseEntry = compileEntry002LockedEntry();
  const preAnchorQA = runPreAnchorQAGates(baseEntry);

  if (!preAnchorQA.passed) {
    throw new Error(
      `Pre-anchor QA failed: ${[
        !preAnchorQA.formatNativeQA.passed && 'format_native',
        !preAnchorQA.chapterGrammarValidation.valid && 'chapter_grammar',
        !preAnchorQA.chapterRepetitionQA.passed && 'repetition',
        !preAnchorQA.conceptCollapsePassed && 'concept_collapse',
        !preAnchorQA.entry001DifferentiationPassed && 'entry001_diff',
      ]
        .filter(Boolean)
        .join(', ')}`,
    );
  }

  const routes = compileEntry002AnchorCompositionRoutes();
  const selectedRoute = selectEntry002AnchorRoute(routes);
  const anchorQA = evaluateEntry002AnchorQA(selectedRoute);

  if (!anchorQA.passed) {
    throw new Error(`Anchor composition QA failed: ${anchorQA.blockers.join('; ')}`);
  }

  const dispatch = await dispatchEntry002CreativeAnchor(selectedRoute, options);
  const creativeAssetRecord = buildEntry002AnchorCreativeAssetRecord({
    assetId: dispatch.assetId,
    storagePath: dispatch.storagePath,
    previewUrl: dispatch.previewUrl,
    receipt: dispatch.receipt,
  });

  const updatedEntry = saveEntry({
    ...baseEntry,
    generationReceipts: [...baseEntry.generationReceipts, dispatch.receipt],
    assetIds: [...baseEntry.assetIds, dispatch.assetId],
  });

  const anchorTask = updatedEntry.productionPlan?.tasks.find((t) => t.taskId === 't2-anchor-cover');
  if (anchorTask) anchorTask.status = 'DISPATCHED';

  const entry = saveEntry({
    ...updatedEntry,
    metadata: {
      ...(updatedEntry.metadata as Record<string, unknown>),
      sprint: 'B3_CREATIVE_ANCHOR',
      creativeAnchor: {
        assetId: dispatch.assetId,
        previewUrl: dispatch.previewUrl,
        routeId: selectedRoute.routeId,
        founderJudgment: 'UNREVIEWED',
        productionDispatch: 'BLOCKED_PENDING_ANCHOR_APPROVAL',
      },
      downstreamBlocked: downstreamProductionBlocked(),
    } as never,
  });

  const result: Entry002AnchorProductionResult = {
    sprint: 'B3_CREATIVE_ANCHOR',
    entryId: 'entry-002',
    taskId: 't2-anchor-cover',
    format: 'COVER',
    selectedRoute,
    compositionRoutes: routes.map((r) => ({
      ...r,
      selected: r.routeId === selectedRoute.routeId,
    })),
    preAnchorQA,
    anchorQA,
    assetId: dispatch.assetId,
    previewUrl: dispatch.previewUrl,
    storagePath: dispatch.storagePath,
    generationReceipt: dispatch.receipt,
    creativeAssetRecord,
    provider: dispatch.provider,
    model: dispatch.model,
    promptLineage: dispatch.promptLineage,
    referenceLineage: dispatch.referenceLineage,
    canonState: 'NON_CANON',
    founderJudgment: 'UNREVIEWED',
    productionDispatch: 'BLOCKED_PENDING_ANCHOR_APPROVAL',
    downstreamBlocked: downstreamProductionBlocked(),
    generatedAt: dispatch.receipt.generatedAt,
  };

  return { entry, result };
}

export async function bootstrapB3CreativeAnchor(options?: { dispatchFal?: boolean }) {
  process.env.EXPRESSION_ENGINE_MEMORY_STORE = process.env.EXPRESSION_ENGINE_MEMORY_STORE ?? '1';
  const { entry, result } = await produceEntry002CreativeAnchor(options);
  return { entry, anchor: result };
}
