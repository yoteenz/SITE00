/**
 * P0.CB.1 — Build CreativeAssetRecord for founder creative (extends lineage — no duplication).
 */

import type { CreativeAssetRecord } from '../../site00-brand-lore/creativeLineage/types.js';
import { defaultBrandLineageFields } from '../../site00-brand-lore/creativeLineage/founderJudgmentLineage.js';
import type { FounderCreativeProvenance, SlideProductionAsset } from './types.js';

export function buildFounderCreativeAssetRecord(params: {
  asset: SlideProductionAsset;
  provenance: FounderCreativeProvenance;
  projectId: string;
  brandSlug: string;
  parentAssetId?: string | null;
}): CreativeAssetRecord {
  const ts = new Date().toISOString();
  return {
    assetId: params.asset.assetId,
    orgId: 'ndx-org',
    projectId: params.projectId,
    brandSlug: params.brandSlug,
    brandDisplayName: 'NDXBOOK',
    assetType: 'CAROUSEL_SLIDE',
    sourceType: 'FOUNDER_UPLOAD',
    creativeStage: 'PRODUCTION',
    directionLineage: {
      directionId: `founder-${params.asset.sequenceId}`,
      directionName: params.provenance.origin,
      formationId: null,
      formationVersion: null,
      canonicalAtCreation: false,
      worldId: `founder-creative-${params.asset.sequenceId}`,
      worldVersion: 'P0.CB.1',
      experimentClassification: null,
    },
    contentLineage: {
      topicId: params.asset.sequenceId,
      topicName: params.asset.sequenceId,
      contentFranchiseId: null,
      episodeId: null,
      carouselId: params.asset.sequenceId,
      slideNumber: null,
      format: 'CAROUSEL_SLIDE',
      nativeFormatReason: 'Founder creative ingestion',
    },
    intelligenceLineage: {
      brandLoreVersion: null,
      brandLoreFingerprint: null,
      personalityFingerprint: null,
      creativeAppetiteFingerprint: null,
      creativeAppetiteAvailability: null,
      expressionContext: 'FOUNDER_CREATIVE_INGESTION',
      directionExpressionSystemId: null,
      creativeExpressionSystemId: null,
      identityArtDirectionId: null,
      visualBriefId: null,
      promptHash: null,
      sequenceCreativeSystemId: null,
    },
    generationLineage: {
      provider: null,
      model: null,
      requestId: null,
      generationVersion: params.provenance.generationProvenance,
      parentAssetIds: params.asset.lineageParentIds,
      referenceAssetIds: params.asset.lineageParentIds,
      imageConditioningUsed: false,
      promptVersion: 'P0.CB.1',
      generatedAt: params.asset.approvedAt,
      generationCostUsd: null,
      storagePath: params.asset.masterUrl,
    },
    reviewState: params.asset.approvedAt ? 'APPROVED' : 'UNREVIEWED',
    productionState: params.asset.approvedAt ? 'PRODUCTION_CANDIDATE' : 'EXPERIMENTAL',
    reuseState: 'ORIGINAL_USE_ONLY',
    canonStatus: 'CONTENT_CANON_CANDIDATE',
    relationship: {
      parentAssetId: params.parentAssetId ?? null,
      derivedAssetIds: [],
      adaptationType: null,
    },
    creativeFamilyId: null,
    brandCanonVersionAtGeneration: 0,
    contentCanonVersionAtGeneration: 0,
    founderNotes: null,
    internalNotes: `Founder creative origin: ${params.provenance.origin}`,
    salvageClassification: null,
    publishingReadiness: null,
    historicalSourceRef: params.provenance.generationProvenance,
    immutable: true,
    ...defaultBrandLineageFields(),
    rootAssetId: params.asset.assetId,
    revisionNumber: 0,
    currentRevisionId: null,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function referenceAssetIsDistinctFromProduction(referenceId: string, productionId: string): boolean {
  return referenceId !== productionId;
}

export function founderCreatedProvenancePersists(provenance: FounderCreativeProvenance): boolean {
  return provenance.origin === 'FOUNDER_CREATED' && provenance.creativeAuthority === 'FOUNDER_APPROVED';
}
