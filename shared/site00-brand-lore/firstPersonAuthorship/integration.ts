/**
 * P0.5C.5 content package + campaign integration.
 */

import type { SocialContentPackage } from '../contentOperations/types.js';
import type { ContentOpportunity } from '../contentOperations/types.js';
import type { BrandMarketingExpressionSystem } from '../brandMarketingExpression/types.js';
import type { FounderLanguageEvidence } from '../brandCharacterReadiness/types.js';
import type { CampaignContentSlateEntry } from '../../site00-studio-world-production/marketingCampaignProduction/types.js';
import type { ContentPackageCaptionLayer, CampaignContentUnit } from './types.js';
import { synthesizeNdxInstagramCaption } from './ndxCaptionSynthesis.js';
import type { CampaignCaption } from '../../site00-studio-world-production/campaignCaption/types.js';

export function buildContentPackageCaptionLayer(params: {
  pkg: SocialContentPackage;
  opportunity: ContentOpportunity;
  expressionSystem: BrandMarketingExpressionSystem;
  founderLanguage?: FounderLanguageEvidence[];
  slideCopy?: string[];
  lockedSlideCount?: number;
  requiredSlideCount?: number;
}): ContentPackageCaptionLayer {
  const slideCopy = params.slideCopy ?? [params.opportunity.summary];
  const caption = synthesizeNdxInstagramCaption({
    contentPieceId: params.pkg.id,
    campaignId: params.pkg.projectId,
    slideCopy,
    founderLanguage: params.founderLanguage,
    thesisSummary: params.opportunity.summary,
    lockedSlideCount: params.lockedSlideCount ?? 0,
    requiredSlideCount: params.requiredSlideCount ?? slideCopy.length,
    humorEligible: true,
  });

  return {
    captionSynthesisContractId: caption ? `csc-${params.pkg.id}` : '',
    caption,
    publicAuthorshipLayerId: null,
    founderLanguageEvidenceIds: (params.founderLanguage ?? []).map((f) => f.id),
    platform: 'INSTAGRAM_FEED',
  };
}

export function extendSlateEntryWithCaptionDraft(params: {
  entry: CampaignContentSlateEntry;
  caption: CampaignCaption | null;
}): CampaignContentSlateEntry & { captionDraft: string | null; captionReadiness: string | null } {
  return {
    ...params.entry,
    captionDraft: params.caption?.text ?? null,
    captionReadiness: params.caption?.readiness ?? null,
  };
}

export function buildCampaignContentUnit(params: {
  contentPieceId: string;
  assets: { assetId: string; sequencePosition: number; generatedAssetUrl: string | null }[];
  caption: CampaignCaption | null;
  platform?: string;
}): CampaignContentUnit {
  return {
    contentPieceId: params.contentPieceId,
    slides: params.assets,
    caption: params.caption,
    platform: params.platform ?? 'INSTAGRAM_FEED',
    approvalState: params.caption?.approvalState === 'APPROVED' ? 'APPROVED' : 'FOUNDER_REVIEW',
    sourceNotes: params.caption?.sourceNotes ?? [],
  };
}

export function contentOperationsRequiresPublicAuthorship(): true {
  return true;
}
