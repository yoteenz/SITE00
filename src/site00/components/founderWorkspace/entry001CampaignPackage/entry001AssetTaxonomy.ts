/**
 * B5.4 — Entry 001 asset taxonomy helpers.
 */

import type {
  Entry001AssetRole,
  Entry001AssetType,
  Entry001ContentRole,
  Entry001CampaignAsset,
} from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';

export const ENTRY001_ASSET_TYPE_LABELS: Record<Entry001AssetType, string> = {
  REEL: 'REEL',
  REEL_COVER: 'REEL COVER',
  HIGHLIGHT_ICON: 'HIGHLIGHT ICON',
  CAROUSEL: 'CAROUSEL',
  CAROUSEL_SLIDE: 'CAROUSEL SLIDE',
  STORY: 'STORY',
  STORY_FRAME: 'STORY FRAME',
  TIKTOK: 'TIKTOK',
  X_POST: 'X / TWITTER',
  STATIC_POST: 'STATIC POST',
  QUOTE_POST: 'QUOTE POST',
  INFOGRAPHIC: 'INFOGRAPHIC',
  CTA_FRAME: 'CTA',
  REFERENCE_ONLY: 'REFERENCE',
  OTHER: 'OTHER',
};

export const ENTRY001_CONTENT_ROLE_LABELS: Record<Entry001ContentRole, string> = {
  COVER: 'COVER',
  CLAIM: 'CLAIM',
  RECEIPT: 'RECEIPT',
  CONTRADICTION: 'CONTRADICTION',
  LENS: 'LENS',
  INTERJECTION: 'INTERJECTION',
  SYNTHESIS: 'SYNTHESIS',
  CTA: 'CTA',
  SUPPORTING_EVIDENCE: 'SUPPORTING',
  HERO: 'HERO',
  OTHER: 'OTHER',
};

export const ENTRY001_INGESTION_TYPE_OPTIONS: Entry001AssetType[] = [
  'REEL',
  'REEL_COVER',
  'HIGHLIGHT_ICON',
  'CAROUSEL',
  'CAROUSEL_SLIDE',
  'STORY',
  'STORY_FRAME',
  'TIKTOK',
  'X_POST',
  'STATIC_POST',
  'INFOGRAPHIC',
  'CTA_FRAME',
  'OTHER',
];

export const ENTRY001_INGESTION_ROLE_OPTIONS: Entry001ContentRole[] = [
  'COVER',
  'CLAIM',
  'RECEIPT',
  'CONTRADICTION',
  'LENS',
  'INTERJECTION',
  'SYNTHESIS',
  'CTA',
  'SUPPORTING_EVIDENCE',
  'OTHER',
];

export function legacyRoleToAssetType(role: Entry001AssetRole): Entry001AssetType {
  const map: Partial<Record<Entry001AssetRole, Entry001AssetType>> = {
    FINAL_REEL: 'REEL',
    REEL_COVER: 'REEL_COVER',
    HIGHLIGHT_ICON: 'HIGHLIGHT_ICON',
    CAROUSEL_SLIDE: 'CAROUSEL_SLIDE',
    STORY_FRAME: 'STORY_FRAME',
    TIKTOK_POST: 'TIKTOK',
    X_POST: 'X_POST',
    SOCIAL_POST: 'STATIC_POST',
    QUOTE_POST: 'QUOTE_POST',
    INFOGRAPHIC: 'INFOGRAPHIC',
    REFERENCE_GRAPHIC: 'REFERENCE_ONLY',
    ENTRY_COVER: 'CAROUSEL_SLIDE',
    ENTRY_HERO: 'STATIC_POST',
    CAMPAIGN_PACKAGE_ASSET: 'OTHER',
    DERIVED_ASSET: 'OTHER',
  };
  return map[role] ?? 'OTHER';
}

export function assetTypeToLegacyRole(type: Entry001AssetType): Entry001AssetRole {
  const map: Partial<Record<Entry001AssetType, Entry001AssetRole>> = {
    REEL: 'FINAL_REEL',
    REEL_COVER: 'REEL_COVER',
    HIGHLIGHT_ICON: 'HIGHLIGHT_ICON',
    CAROUSEL_SLIDE: 'CAROUSEL_SLIDE',
    STORY_FRAME: 'STORY_FRAME',
    TIKTOK: 'TIKTOK_POST',
    X_POST: 'X_POST',
    STATIC_POST: 'SOCIAL_POST',
    QUOTE_POST: 'QUOTE_POST',
    INFOGRAPHIC: 'INFOGRAPHIC',
    REFERENCE_ONLY: 'REFERENCE_GRAPHIC',
    CTA_FRAME: 'STORY_FRAME',
    OTHER: 'CAMPAIGN_PACKAGE_ASSET',
  };
  return map[type] ?? 'CAMPAIGN_PACKAGE_ASSET';
}

export function enrichAssetWithTaxonomy(asset: Entry001CampaignAsset): Entry001CampaignAsset {
  const assetType = asset.assetType ?? legacyRoleToAssetType(asset.role);
  return {
    ...asset,
    assetType,
    assetRole: asset.assetRole ?? null,
    removedFromActiveArchive: asset.removedFromActiveArchive ?? false,
  };
}

export function groupAssetsByType(
  assets: Entry001CampaignAsset[],
): { type: Entry001AssetType; label: string; assets: Entry001CampaignAsset[] }[] {
  const order: Entry001AssetType[] = [
    'CAROUSEL_SLIDE',
    'CAROUSEL',
    'STORY_FRAME',
    'STORY',
    'STATIC_POST',
    'QUOTE_POST',
    'INFOGRAPHIC',
    'REFERENCE_ONLY',
    'CTA_FRAME',
    'REEL',
    'REEL_COVER',
    'HIGHLIGHT_ICON',
    'TIKTOK',
    'X_POST',
    'OTHER',
  ];
  const buckets = new Map<Entry001AssetType, Entry001CampaignAsset[]>();
  for (const a of assets) {
    const t = a.assetType ?? legacyRoleToAssetType(a.role);
    const list = buckets.get(t) ?? [];
    list.push(a);
    buckets.set(t, list);
  }
  return order
    .filter((t) => (buckets.get(t)?.length ?? 0) > 0)
    .map((t) => ({
      type: t,
      label: ENTRY001_ASSET_TYPE_LABELS[t],
      assets: (buckets.get(t) ?? []).sort(
        (a, b) => (a.sequenceIndex ?? 999) - (b.sequenceIndex ?? 999),
      ),
    }));
}

export function filterArchiveAssets(
  assets: Entry001CampaignAsset[],
  filter: import('../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js').Entry001ArchiveFilter,
): Entry001CampaignAsset[] {
  if (filter === 'ALL') return assets;
  return assets.filter((a) => {
    const t = a.assetType ?? legacyRoleToAssetType(a.role);
    switch (filter) {
      case 'REEL':
        return t === 'REEL' || t === 'REEL_COVER';
      case 'CAROUSEL':
        return t === 'CAROUSEL' || t === 'CAROUSEL_SLIDE';
      case 'STORY':
        return t === 'STORY' || t === 'STORY_FRAME' || t === 'CTA_FRAME';
      case 'X':
        return t === 'X_POST';
      case 'TIKTOK':
        return t === 'TIKTOK';
      case 'STATIC':
        return (
          t === 'STATIC_POST' ||
          t === 'QUOTE_POST' ||
          t === 'INFOGRAPHIC' ||
          t === 'REFERENCE_ONLY'
        );
      default:
        return true;
    }
  });
}

export function isActiveArchiveAsset(asset: Entry001CampaignAsset): boolean {
  return (
    asset.approved &&
    Boolean(asset.filePath) &&
    asset.status !== 'ARCHIVED' &&
    asset.status !== 'MISSING' &&
    !asset.removedFromActiveArchive
  );
}
