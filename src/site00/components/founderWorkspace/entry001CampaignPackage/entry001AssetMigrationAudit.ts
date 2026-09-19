/**
 * B5.4 — Migration audit for current Entry 001 approved archive (10 assets).
 */

import type { Entry001MigrationAuditRow } from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';

export const ENTRY001_MIGRATION_AUDIT: Entry001MigrationAuditRow[] = [
  {
    assetId: 'entry001-archive-01-then-now',
    title: 'THEN / NOW',
    currentClassification: 'CAROUSEL_SLIDE (legacy role)',
    recommendedAssetType: 'CAROUSEL_SLIDE',
    recommendedAssetRole: 'CLAIM',
    activeRecommendation: 'KEEP',
  },
  {
    assetId: 'entry001-archive-02-rehab-cycle',
    title: 'PUBLIC REHABILITATION CYCLE',
    currentClassification: 'INFOGRAPHIC (legacy role)',
    recommendedAssetType: 'INFOGRAPHIC',
    recommendedAssetRole: 'CONTRADICTION',
    activeRecommendation: 'KEEP',
  },
  {
    assetId: 'entry001-archive-03-apologies-archives',
    title: 'APOLOGIES ARE NICE. ARCHIVES ARE BETTER.',
    currentClassification: 'QUOTE_POST (legacy role)',
    recommendedAssetType: 'QUOTE_POST',
    recommendedAssetRole: 'INTERJECTION',
    activeRecommendation: 'KEEP',
  },
  {
    assetId: 'entry001-archive-04-story-changed',
    title: 'THE STORY CHANGED.',
    currentClassification: 'CAROUSEL_SLIDE (legacy role)',
    recommendedAssetType: 'CAROUSEL_SLIDE',
    recommendedAssetRole: 'CONTRADICTION',
    activeRecommendation: 'KEEP',
  },
  {
    assetId: 'entry001-archive-05-accountability',
    title: 'ACCOUNTABILITY / REVISION',
    currentClassification: 'REFERENCE_GRAPHIC (legacy role)',
    recommendedAssetType: 'REFERENCE_ONLY',
    recommendedAssetRole: 'SUPPORTING_EVIDENCE',
    activeRecommendation: 'REVIEW',
  },
  {
    assetId: 'entry001-archive-06-quote-statement',
    title: 'QUOTE / STATEMENT',
    currentClassification: 'QUOTE_POST (legacy role)',
    recommendedAssetType: 'QUOTE_POST',
    recommendedAssetRole: 'SYNTHESIS',
    activeRecommendation: 'KEEP',
  },
  {
    assetId: 'entry001-archive-07-revision-frame',
    title: 'REVISION / ACCOUNTABILITY',
    currentClassification: 'CAROUSEL_SLIDE (legacy role)',
    recommendedAssetType: 'CAROUSEL_SLIDE',
    recommendedAssetRole: 'RECEIPT',
    activeRecommendation: 'KEEP',
  },
  {
    assetId: 'entry001-archive-08-media-complicity',
    title: 'MEDIA COMPLICITY',
    currentClassification: 'SOCIAL_POST (legacy role)',
    recommendedAssetType: 'STATIC_POST',
    recommendedAssetRole: 'LENS',
    activeRecommendation: 'KEEP',
  },
  {
    assetId: 'entry001-archive-09-cta-poll',
    title: 'CTA / POLL',
    currentClassification: 'STORY_FRAME (legacy role)',
    recommendedAssetType: 'STORY_FRAME',
    recommendedAssetRole: 'CTA',
    activeRecommendation: 'KEEP',
  },
  {
    assetId: 'entry001-archive-10-entry-cover-slide',
    title: 'ENTRY COVER SLIDE',
    currentClassification: 'ENTRY_COVER (legacy role)',
    recommendedAssetType: 'CAROUSEL_SLIDE',
    recommendedAssetRole: 'COVER',
    activeRecommendation: 'KEEP',
  },
];
