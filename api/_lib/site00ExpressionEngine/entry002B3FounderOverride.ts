/**
 * Sprint B3.1 — preserved B3 generated anchor + founder NOT_FOR_ME judgment.
 */

import type { CreativeAssetRecord } from '../../../shared/site00-brand-lore/creativeLineage/types.js';
import type { B3PreservedAnchorRecord } from '../../../shared/site00-expression-engine/chapterCoverGrammarTypes.js';
import type { GenerationReceipt } from '../../../shared/site00-expression-engine/types.js';
import { buildEntry002AnchorCreativeAssetRecord } from './entry002AnchorAssetRecord.js';
import {
  getGenerationReceipt,
  listGenerationReceiptsForEntry,
  recordFounderJudgmentOnReceipt,
  registerGeneration,
} from './lineageRegistration.js';
import { recordFounderJudgment, saveEntry } from './entryStore.js';
import { compileEntry002LockedEntry } from './entry002Blueprint.js';
import { ENTRY_002_TERRITORY_ID, ENTRY_002_WORLD_ID } from './entry002Blueprint.js';

/** Canonical B3 generated asset — preserved as NON_CANON history. */
export const B3_GENERATED_ANCHOR_ASSET_ID = 'NDX-ENTRY-002-COVER-ANCHOR-6062E715';

export const B3_GENERATED_ANCHOR_REJECTION_REASON =
  'Too much like a graphic flyer / environmental composition. Failed artifact-first cover language established by Entry 001.';

export function buildB3GeneratedAnchorReceipt(assetId: string = B3_GENERATED_ANCHOR_ASSET_ID): GenerationReceipt {
  return registerGeneration({
    projectId: 'ndxbook',
    brandId: 'ndxbook',
    entryId: 'entry-002',
    format: 'COVER',
    territoryId: ENTRY_002_TERRITORY_ID,
    worldId: ENTRY_002_WORLD_ID,
    assetId,
    provider: 'fal-flux',
    model: 'fal-ai/flux-pro',
    promptLineage: [
      'sprint-b3-entry-002-cover-anchor',
      'ROUTE_A_TIMELINE_CLIP',
      'environment-edit-suite-composition',
    ],
    referenceLineage: [
      ENTRY_002_WORLD_ID,
      ENTRY_002_TERRITORY_ID,
      'ROUTE_A_TIMELINE_CLIP',
      'chapter-01-nostalgia-revision',
    ],
    trackingState: 'TRACKED',
  });
}

export function buildB3PreservedCreativeAssetRecord(
  receipt: GenerationReceipt,
): CreativeAssetRecord {
  const storagePath = `site00/assts/expression-engine/ndxbook/entry-002/ndx-entry-002-cover-anchor-6062e715.png`;
  return buildEntry002AnchorCreativeAssetRecord({
    assetId: receipt.assetId,
    storagePath,
    previewUrl: `https://expression-engine.local/${storagePath}`,
    receipt,
  });
}

export function preserveB3GeneratedAnchor(options?: {
  assetId?: string;
}): {
  receipt: GenerationReceipt;
  creativeAssetRecord: CreativeAssetRecord;
  preserved: B3PreservedAnchorRecord;
} {
  const assetId = options?.assetId ?? B3_GENERATED_ANCHOR_ASSET_ID;
  const existing = listGenerationReceiptsForEntry('entry-002').find((r) => r.assetId === assetId);
  const receipt = existing ?? buildB3GeneratedAnchorReceipt(assetId);
  const creativeAssetRecord = buildB3PreservedCreativeAssetRecord(receipt);

  const preserved: B3PreservedAnchorRecord = {
    assetId,
    founderJudgment: 'NOT_FOR_ME',
    canonState: 'NON_CANON',
    lineagePreserved: true,
    doNotPropagate: true,
    doNotResurfaceSilently: true,
    rejectionReason: B3_GENERATED_ANCHOR_REJECTION_REASON,
    generationReceiptId: receipt.receiptId,
    provider: receipt.provider,
    model: receipt.model,
    routeId: 'ROUTE_A_TIMELINE_CLIP',
  };

  return { receipt, creativeAssetRecord, preserved };
}

export function applyFounderNotForMeOnB3Anchor(params: {
  assetId?: string;
  entry?: ReturnType<typeof compileEntry002LockedEntry>;
}): {
  entry: ReturnType<typeof saveEntry>;
  preserved: B3PreservedAnchorRecord;
  receipt: GenerationReceipt;
  creativeAssetRecord: CreativeAssetRecord;
} {
  const { receipt, creativeAssetRecord, preserved } = preserveB3GeneratedAnchor({
    assetId: params.assetId,
  });

  recordFounderJudgmentOnReceipt(receipt.receiptId, 'NOT_FOR_ME');

  const baseEntry = params.entry ?? compileEntry002LockedEntry();
  const withAsset: typeof baseEntry = {
    ...baseEntry,
    generationReceipts: baseEntry.generationReceipts.some((r) => r.assetId === receipt.assetId)
      ? baseEntry.generationReceipts
      : [...baseEntry.generationReceipts, getGenerationReceipt(receipt.receiptId)!],
    assetIds: baseEntry.assetIds.includes(receipt.assetId)
      ? baseEntry.assetIds
      : [...baseEntry.assetIds, receipt.assetId],
  };

  const judged = recordFounderJudgment({
    entry: withAsset,
    scope: 'ASSET',
    scopeId: receipt.assetId,
    action: 'NOT_FOR_ME',
  });

  const entry = saveEntry({
    ...judged,
    metadata: {
      ...(judged.metadata as Record<string, unknown>),
      sprint: 'B3.1_FOUNDER_OVERRIDE',
      b3PreservedAnchor: preserved,
      b3CreativeAssetRecord: creativeAssetRecord,
      b3DoNotPropagate: true,
      b3DoNotResurfaceSilently: true,
    } as never,
  });

  return { entry, preserved, receipt: getGenerationReceipt(receipt.receiptId)!, creativeAssetRecord };
}
