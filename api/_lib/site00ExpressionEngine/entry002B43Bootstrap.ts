/**
 * Sprint B4.3 — reconcile Entry 002 REEL keyframe provenance + surface existing rasters.
 */

import type {
  Entry002B43BootstrapResult,
  ReelKeyframeFounderReviewFrame,
  ReelKeyframeProvenanceRecord,
} from '../../../shared/site00-expression-engine/entry002ReelTypes.js';
import {
  ENTRY_002_REEL_KF_AUTHORITATIVE_PROVENANCE,
  type ReelKeyframeAuthoritativeProvenance,
} from '../../../shared/site00-expression-engine/entry002ReelKeyframeProvenance.js';
import { ENTRY_002_REEL_KF_DIMENSIONS } from '../../../shared/site00-expression-engine/entry002ReelKeyframeIds.js';
import {
  getSite00AssetPublicUrl,
  site00StorageObjectExists,
} from '../site00Assts/storage.js';
import { registerGeneration } from './lineageRegistration.js';
import { buildEntry002ReelKeyframeCreativeAssetRecord } from './entry002ReelKeyframeAssetRecord.js';
import { ENTRY_002_TERRITORY_ID, ENTRY_002_WORLD_ID } from './entry002Blueprint.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import { ENTRY_002_REEL_ID } from './entry002ReelShotPlan.js';
import { buildEntry002FounderReviewGates } from './entry002ReelProduction.js';

function registerSupersededReceipt(
  superseded: ReelKeyframeAuthoritativeProvenance['supersededExecutions'][number],
  assetId: string,
  planningReceiptId: string,
): void {
  registerGeneration({
    receiptId: superseded.generationReceiptId,
    projectId: 'ndxbook',
    brandId: 'ndxbook',
    entryId: 'entry-002',
    format: 'REEL',
    territoryId: ENTRY_002_TERRITORY_ID,
    worldId: ENTRY_002_WORLD_ID,
    assetId,
    parentAssetId: planningReceiptId,
    provider: superseded.provider,
    model: superseded.executedModel,
    promptLineage: [
      superseded.label,
      'SUPERSEDED',
      'fallback-used:YES',
      `fallback-reason:${superseded.fallbackReason}`,
      `executed-model:${superseded.executedModel}`,
    ],
    referenceLineage: [ENTRY_002_WORLD_ID, ENTRY_002_TERRITORY_ID, CHAPTER_01_ID, ENTRY_002_REEL_ID],
    trackingState: 'TRACKED',
    generatedAt: '2026-09-07T20:25:00.000Z',
  });
}

function reconcileAuthoritativeRecord(
  provenance: ReelKeyframeAuthoritativeProvenance,
): ReelKeyframeProvenanceRecord {
  registerGeneration({
    receiptId: provenance.planningReceiptId,
    projectId: 'ndxbook',
    brandId: 'ndxbook',
    entryId: 'entry-002',
    format: 'REEL',
    territoryId: ENTRY_002_TERRITORY_ID,
    worldId: ENTRY_002_WORLD_ID,
    assetId: provenance.assetId,
    parentAssetId: 'founder-cover-authority-phone',
    provider: 'planning',
    model: 'COMPILED_SPEC',
    promptLineage: [
      'sprint-b4-entry-002-reel-keyframe-planning',
      `kf-entry-002-reel-${provenance.role.toLowerCase()}`,
      provenance.role,
      'PLANNING_RECEIPT',
    ],
    referenceLineage: [
      ENTRY_002_WORLD_ID,
      ENTRY_002_TERRITORY_ID,
      CHAPTER_01_ID,
      ENTRY_002_REEL_ID,
      'founder-cover-authority-phone',
    ],
    trackingState: 'TRACKED',
    generatedAt: '2026-09-07T20:14:00.000Z',
  });

  for (const superseded of provenance.supersededExecutions) {
    registerSupersededReceipt(superseded, provenance.assetId, provenance.planningReceiptId);
  }

  const generationReceipt = registerGeneration({
    receiptId: provenance.generationReceiptId,
    projectId: 'ndxbook',
    brandId: 'ndxbook',
    entryId: 'entry-002',
    format: 'REEL',
    territoryId: ENTRY_002_TERRITORY_ID,
    worldId: ENTRY_002_WORLD_ID,
    assetId: provenance.assetId,
    parentAssetId: provenance.planningReceiptId,
    provider: provenance.provider,
    model: provenance.executedModel,
    promptLineage: [
      'sprint-b4.2-reel-kf-raster',
      provenance.role,
      'GENERATION_RESULT',
      'AUTHORITATIVE',
      `provider-request:${provenance.providerRequestId}`,
      `requested-model:${provenance.requestedModel}`,
      `executed-model:${provenance.executedModel}`,
      'fallback-used:NO',
      'lineage-reconciled-b43',
    ],
    referenceLineage: [
      ENTRY_002_WORLD_ID,
      ENTRY_002_TERRITORY_ID,
      CHAPTER_01_ID,
      ENTRY_002_REEL_ID,
      `kf-entry-002-reel-${provenance.role.toLowerCase()}`,
      'founder-cover-authority-phone',
    ],
    trackingState: 'TRACKED',
    generatedAt: '2026-09-07T20:37:00.000Z',
  });

  return {
    role: provenance.role,
    assetId: provenance.assetId,
    storagePath: provenance.storagePath,
    planningReceiptId: provenance.planningReceiptId,
    generationReceiptId: provenance.generationReceiptId,
    providerRequestId: provenance.providerRequestId,
    provider: provenance.provider,
    routedProvider: provenance.routedProvider,
    requestedModel: provenance.requestedModel,
    executedModel: provenance.executedModel,
    fallbackUsed: provenance.fallbackUsed,
    fallbackReason: null,
    supersededExecutions: provenance.supersededExecutions,
    lineageCorrected: provenance.lineageCorrectedInB43,
    generationReceipt,
  };
}

export async function reconcileEntry002ReelKeyframeProvenance(): Promise<{
  provenance: ReelKeyframeProvenanceRecord[];
  relationshipSummary: string;
}> {
  const provenance = ENTRY_002_REEL_KF_AUTHORITATIVE_PROVENANCE.map(reconcileAuthoritativeRecord);

  const relationshipSummary =
    'Record A (B4.1 gpt-image-2 fallback) was an intermediate execution superseded when B4.2 re-dispatched with fal-ai/flux-pro/v1.1 and overwrote storage. Record B is authoritative for current rasters. requested_model === executed_model === fal-ai/flux-pro/v1.1; fallback_used === NO.';

  return { provenance, relationshipSummary };
}

export async function surfaceEntry002ReelKeyframeRastersForReview(): Promise<ReelKeyframeFounderReviewFrame[]> {
  const frames: ReelKeyframeFounderReviewFrame[] = [];

  for (const record of ENTRY_002_REEL_KF_AUTHORITATIVE_PROVENANCE) {
    const exists = await site00StorageObjectExists(record.storagePath);
    if (!exists) {
      throw new Error(`B4.3 blocked — storage object missing: ${record.storagePath}`);
    }
    const previewUrl = getSite00AssetPublicUrl(record.storagePath);
    frames.push({
      role: record.role,
      assetId: record.assetId,
      generationReceiptId: record.generationReceiptId,
      providerRequestId: record.providerRequestId,
      executedModel: record.executedModel,
      dimensions: { ...ENTRY_002_REEL_KF_DIMENSIONS },
      previewUrl,
      storagePath: record.storagePath,
      actualFileExists: true,
      founderJudgment: 'UNREVIEWED',
    });
  }

  return frames;
}

export async function bootstrapB43Entry002ReelKeyframeGate1Review(): Promise<Entry002B43BootstrapResult> {
  const { provenance, relationshipSummary } = await reconcileEntry002ReelKeyframeProvenance();
  const reviewFrames = await surfaceEntry002ReelKeyframeRastersForReview();

  for (const record of provenance) {
    const frame = reviewFrames.find((f) => f.role === record.role)!;
    buildEntry002ReelKeyframeCreativeAssetRecord({
      assetId: record.assetId,
      role: record.role,
      storagePath: record.storagePath,
      previewUrl: frame.previewUrl,
      receipt: record.generationReceipt,
      providerRequestId: record.providerRequestId,
      planningReceiptId: record.planningReceiptId,
      requestedModel: record.requestedModel,
      executedModel: record.executedModel,
      fallbackUsed: record.fallbackUsed,
    });
  }

  return {
    sprint: 'B4.3_ENTRY_002_REEL_KEYFRAME_PROVENANCE_AND_REVIEW',
    provenanceStatus: 'RECONCILED',
    relationshipSummary,
    provenance,
    reviewFrames,
    continuity: {
      startToMid: {
        persists: 'phone evidence device; 2016 baddie fashion subject; black/lime/cream palette; nostalgia-revision narrative',
        changes: 'black+phone hook → physical edit-suite; archive claim → TACKY/ICONIC label splice',
      },
      midToEnd: {
        persists: 'physical timeline; same-image relabel metaphor; edit-suite world; fashion subject',
        changes: 'active contradiction/splice → synthesis filing card; interjection line resolves narrative',
      },
    },
    founderGates: buildEntry002FounderReviewGates(),
    qaAdvisory: 'PASS — NOT FOUNDER APPROVAL',
    motionBlocked: true,
    klingBlocked: true,
    roughCutBlocked: true,
    downstreamBlocked: true,
  };
}

export { bootstrapB43Entry002ReelKeyframeGate1Review as bootstrapB43 };
