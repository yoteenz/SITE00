/**
 * Sprint B4.2 — CreativeAssetRecord for Entry 002 REEL keyframe rasters.
 */

import { defaultBrandLineageFields } from '../../../shared/site00-brand-lore/creativeLineage/founderJudgmentLineage.js';
import type { CreativeAssetRecord } from '../../../shared/site00-brand-lore/creativeLineage/types.js';
import type { GenerationReceipt } from '../../../shared/site00-expression-engine/types.js';
import type { ReelKeyframeRole } from '../../../shared/site00-expression-engine/entry002ReelTypes.js';
import {
  ENTRY_002_ARTIFACT_ID,
  ENTRY_002_TERRITORY_ID,
  ENTRY_002_WORLD_ID,
} from './entry002Blueprint.js';

export function buildEntry002ReelKeyframeCreativeAssetRecord(params: {
  assetId: string;
  role: ReelKeyframeRole;
  storagePath: string;
  previewUrl: string;
  receipt: GenerationReceipt;
  providerRequestId: string;
  planningReceiptId: string | null;
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
      formationId: 'expression-engine-b42',
      formationVersion: '1',
      canonicalAtCreation: true,
      worldId: ENTRY_002_WORLD_ID,
      worldVersion: '1',
      experimentClassification: 'EXPRESSION_ENGINE_REEL_KEYFRAME',
    },
    contentLineage: {
      topicId: 'entry-002-2016-baddie-fashion',
      topicName: '2016 INSTAGRAM BADDIE FASHION',
      contentFranchiseId: 'entry-002',
      episodeId: 'entry-002',
      carouselId: null,
      slideNumber: null,
      format: 'REEL',
      nativeFormatReason: `Sprint B4.2 REEL keyframe ${params.role} — Gate 1 raster`,
    },
    intelligenceLineage: {
      brandLoreVersion: 1,
      brandLoreFingerprint: null,
      personalityFingerprint: null,
      creativeAppetiteFingerprint: null,
      creativeAppetiteAvailability: null,
      expressionContext: 'EXPRESSION_ENGINE_B42',
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
      requestId: params.providerRequestId,
      generationVersion: 'b42-v1',
      parentAssetIds: params.planningReceiptId ? [params.planningReceiptId] : [],
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
      parentAssetId: params.planningReceiptId,
      derivedAssetIds: [],
      adaptationType: 'NATIVE_REEL_KEYFRAME',
    },
    creativeFamilyId: `family-entry-002-reel-kf-${params.role.toLowerCase()}`,
    brandCanonVersionAtGeneration: 1,
    contentCanonVersionAtGeneration: 1,
    founderNotes: null,
    internalNotes: `Sprint B4.2 first-pass ${params.role} keyframe — founder Gate 1 visual review required`,
    salvageClassification: null,
    publishingReadiness: null,
    historicalSourceRef: null,
    immutable: true,
    ...defaultBrandLineageFields(),
    createdAt: ts,
    updatedAt: ts,
  };
}
