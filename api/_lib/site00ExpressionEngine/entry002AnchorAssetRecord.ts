/**
 * Sprint B3 — CreativeAssetRecord for ENTRY 002 COVER anchor.
 */

import { randomUUID } from 'node:crypto';
import { defaultBrandLineageFields } from '../../../shared/site00-brand-lore/creativeLineage/founderJudgmentLineage.js';
import type { CreativeAssetRecord } from '../../../shared/site00-brand-lore/creativeLineage/types.js';
import type { GenerationReceipt } from '../../../shared/site00-expression-engine/types.js';
import {
  ENTRY_002_TERRITORY_ID,
  ENTRY_002_WORLD_ID,
  ENTRY_002_ARTIFACT_ID,
} from './entry002Blueprint.js';

export function buildEntry002AnchorAssetId(): string {
  return `NDX-ENTRY-002-COVER-ANCHOR-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export function buildEntry002AnchorStoragePath(assetId: string): string {
  const safe = assetId.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
  return `site00/assts/expression-engine/ndxbook/entry-002/${safe}.webp`;
}

export function buildEntry002AnchorCreativeAssetRecord(params: {
  assetId: string;
  storagePath: string;
  previewUrl: string;
  receipt: GenerationReceipt;
}): CreativeAssetRecord {
  const ts = new Date().toISOString();

  return {
    assetId: params.assetId,
    orgId: 'ndxbook-org-proof',
    projectId: 'ndxbook',
    brandSlug: 'ndxbook',
    brandDisplayName: 'NDXBOOK',
    assetType: 'HERO',
    sourceType: 'GENERATED',
    creativeStage: 'PRODUCTION',
    directionLineage: {
      directionId: ENTRY_002_TERRITORY_ID,
      directionName: 'THE NOSTALGIA EDIT SUITE',
      formationId: 'expression-engine-b3',
      formationVersion: '1',
      canonicalAtCreation: true,
      worldId: ENTRY_002_WORLD_ID,
      worldVersion: '1',
      experimentClassification: 'EXPRESSION_ENGINE_CREATIVE_ANCHOR',
    },
    contentLineage: {
      topicId: 'entry-002-2016-baddie-fashion',
      topicName: '2016 INSTAGRAM BADDIE FASHION',
      contentFranchiseId: 'entry-002',
      episodeId: 'entry-002',
      carouselId: null,
      slideNumber: null,
      format: 'COVER',
      nativeFormatReason: 'Sprint B3 creative anchor — COVER native',
    },
    intelligenceLineage: {
      brandLoreVersion: 1,
      brandLoreFingerprint: null,
      personalityFingerprint: null,
      creativeAppetiteFingerprint: null,
      creativeAppetiteAvailability: null,
      expressionContext: 'EXPRESSION_ENGINE_B3',
      directionExpressionSystemId: ENTRY_002_WORLD_ID,
      creativeExpressionSystemId: ENTRY_002_TERRITORY_ID,
      identityArtDirectionId: null,
      visualBriefId: ENTRY_002_ARTIFACT_ID,
      promptHash: null,
      sequenceCreativeSystemId: null,
    },
    generationLineage: {
      provider: params.receipt.provider,
      model: params.receipt.model,
      requestId: params.receipt.receiptId,
      generationVersion: 'b3-v1',
      parentAssetIds: [],
      referenceAssetIds: params.receipt.referenceLineage,
      imageConditioningUsed: false,
      promptVersion: params.receipt.promptLineage.join('|'),
      generatedAt: params.receipt.generatedAt,
      generationCostUsd: null,
      storagePath: params.storagePath,
    },
    reviewState: 'UNREVIEWED',
    creativeValue: 'UNREVIEWED',
    productionState: 'GENERATED',
    productionDestiny: 'UNDECIDED',
    reuseState: 'NOT_APPROVED',
    canonStatus: 'NON_CANON',
    relationship: {
      parentAssetId: null,
      derivedAssetIds: [],
      adaptationType: 'NATIVE_COVER_ANCHOR',
    },
    creativeFamilyId: 'family-entry-002-cover-anchor',
    brandCanonVersionAtGeneration: 1,
    contentCanonVersionAtGeneration: 1,
    founderNotes: null,
    internalNotes: 'Sprint B3 creative anchor — founder judgment required before downstream propagation',
    salvageClassification: null,
    publishingReadiness: null,
    historicalSourceRef: null,
    immutable: true,
    ...defaultBrandLineageFields(),
    createdAt: ts,
    updatedAt: ts,
  };
}
