/**
 * B5.2 / B5.4 — Entry 001 Campaign Package asset manifest (single source of truth).
 */

import type { Entry001CampaignAsset, Entry001ParentPackage, Entry001AssetType } from '../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';

function assetTypeToLegacyRole(type: Entry001AssetType): Entry001CampaignAsset['role'] {
  const map: Partial<Record<Entry001AssetType, Entry001CampaignAsset['role']>> = {
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

export const ENTRY001_ASSET_BASE = '/assets/ndxbook/entry-001';

export const ENTRY001_CAROUSEL_PACKAGE_ID = 'ENTRY001_CAROUSEL_001';
export const ENTRY001_STORY_PACKAGE_ID = 'ENTRY001_STORY_SEQUENCE_001';

export const ENTRY001_PARENT_PACKAGES: Entry001ParentPackage[] = [
  {
    packageId: ENTRY001_CAROUSEL_PACKAGE_ID,
    entryId: 'entry-001',
    assetType: 'CAROUSEL',
    title: 'ENTRY 001 CAROUSEL 001',
    status: 'APPROVED',
    childAssetIds: [
      'entry001-archive-10-entry-cover-slide',
      'entry001-archive-01-then-now',
      'entry001-archive-04-story-changed',
      'entry001-archive-07-revision-frame',
    ],
  },
  {
    packageId: ENTRY001_STORY_PACKAGE_ID,
    entryId: 'entry-001',
    assetType: 'STORY',
    title: 'ENTRY 001 STORY SEQUENCE 001',
    status: 'APPROVED',
    childAssetIds: ['entry001-archive-09-cta-poll'],
  },
];

/** Required deliverable types for package completion (B5.4). */
export const ENTRY001_REQUIRED_DELIVERABLE_TYPES = [
  'REEL_COVER',
  'HIGHLIGHT_ICON',
  'REEL',
  'TIKTOK',
  'X_POST',
] as const;

/** @deprecated — use ENTRY001_REQUIRED_DELIVERABLE_TYPES */
export const ENTRY001_REQUIRED_DELIVERABLE_ROLES = [
  'REEL_COVER',
  'HIGHLIGHT_ICON',
  'FINAL_REEL',
  'TIKTOK_POST',
  'X_POST',
] as const;

const v = 'v001';
const now = '2026-09-08T00:00:00.000Z';

function seedAsset(
  partial: Omit<Entry001CampaignAsset, 'entryId' | 'approved' | 'status' | 'source' | 'version'>,
): Entry001CampaignAsset {
  const assetType = partial.assetType;
  return {
    ...partial,
    entryId: 'entry-001',
    role: partial.role ?? assetTypeToLegacyRole(assetType),
    status: 'APPROVED',
    source: 'FOUNDER_SUPPLIED',
    approved: true,
    version: v,
    removedFromActiveArchive: false,
    createdAt: now,
    updatedAt: now,
  };
}

/** Approved founder archive — seeded with B5.4 taxonomy. */
export const ENTRY001_APPROVED_ARCHIVE: Entry001CampaignAsset[] = [
  seedAsset({
    assetId: 'entry001-archive-01-then-now',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-01-then-now.jpg`,
    title: 'THEN / NOW',
    format: 'IMAGE',
    role: 'CAROUSEL_SLIDE',
    assetType: 'CAROUSEL_SLIDE',
    assetRole: 'CLAIM',
    sequenceIndex: 1,
    packageId: ENTRY001_CAROUSEL_PACKAGE_ID,
    notes: 'Then/now comparison frame — public memory shift',
  }),
  seedAsset({
    assetId: 'entry001-archive-02-rehab-cycle',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-02-rehab-cycle.jpg`,
    title: 'PUBLIC REHABILITATION CYCLE',
    format: 'IMAGE',
    role: 'INFOGRAPHIC',
    assetType: 'INFOGRAPHIC',
    assetRole: 'CONTRADICTION',
    notes: 'Public rehabilitation cycle argument frame',
  }),
  seedAsset({
    assetId: 'entry001-archive-03-apologies-archives',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-03-apologies-archives.jpg`,
    title: 'APOLOGIES ARE NICE. ARCHIVES ARE BETTER.',
    format: 'IMAGE',
    role: 'QUOTE_POST',
    assetType: 'QUOTE_POST',
    assetRole: 'INTERJECTION',
  }),
  seedAsset({
    assetId: 'entry001-archive-04-story-changed',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-04-story-changed.jpg`,
    title: 'THE STORY CHANGED.',
    format: 'IMAGE',
    role: 'CAROUSEL_SLIDE',
    assetType: 'CAROUSEL_SLIDE',
    assetRole: 'CONTRADICTION',
    sequenceIndex: 2,
    packageId: ENTRY001_CAROUSEL_PACKAGE_ID,
    notes: 'Story-change / revision frame',
  }),
  seedAsset({
    assetId: 'entry001-archive-05-accountability',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-05-accountability.jpg`,
    title: 'ACCOUNTABILITY / REVISION',
    format: 'IMAGE',
    role: 'REFERENCE_GRAPHIC',
    assetType: 'REFERENCE_ONLY',
    assetRole: 'SUPPORTING_EVIDENCE',
  }),
  seedAsset({
    assetId: 'entry001-archive-06-quote-statement',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-06-quote-statement.jpg`,
    title: 'QUOTE / STATEMENT',
    format: 'IMAGE',
    role: 'QUOTE_POST',
    assetType: 'QUOTE_POST',
    assetRole: 'SYNTHESIS',
  }),
  seedAsset({
    assetId: 'entry001-archive-07-revision-frame',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-07-revision-frame.jpg`,
    title: 'REVISION / ACCOUNTABILITY',
    format: 'IMAGE',
    role: 'CAROUSEL_SLIDE',
    assetType: 'CAROUSEL_SLIDE',
    assetRole: 'RECEIPT',
    sequenceIndex: 3,
    packageId: ENTRY001_CAROUSEL_PACKAGE_ID,
  }),
  seedAsset({
    assetId: 'entry001-archive-08-media-complicity',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-08-media-complicity.jpg`,
    title: 'MEDIA COMPLICITY',
    format: 'IMAGE',
    role: 'SOCIAL_POST',
    assetType: 'STATIC_POST',
    assetRole: 'LENS',
  }),
  seedAsset({
    assetId: 'entry001-archive-09-cta-poll',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-09-cta-poll.jpg`,
    title: 'CTA / POLL',
    format: 'IMAGE',
    role: 'STORY_FRAME',
    assetType: 'STORY_FRAME',
    assetRole: 'CTA',
    sequenceIndex: 1,
    packageId: ENTRY001_STORY_PACKAGE_ID,
  }),
  seedAsset({
    assetId: 'entry001-archive-10-entry-cover-slide',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-10-entry-cover-slide.jpg`,
    title: 'ENTRY COVER SLIDE',
    format: 'IMAGE',
    role: 'ENTRY_COVER',
    assetType: 'CAROUSEL_SLIDE',
    assetRole: 'COVER',
    sequenceIndex: 0,
    packageId: ENTRY001_CAROUSEL_PACKAGE_ID,
  }),
];

export const ENTRY001_HERO_ASSET: Entry001CampaignAsset = seedAsset({
  assetId: 'entry001-hero-portrait',
  filePath: `${ENTRY001_ASSET_BASE}/entry001-hero-portrait.jpg`,
  title: 'ENTRY 001 HERO PORTRAIT',
  format: 'IMAGE',
  role: 'ENTRY_HERO',
  assetType: 'STATIC_POST',
  assetRole: 'HERO',
  notes: 'Britney archival portrait — hero treatment',
});

export function buildEntry001MissingDeliverablePlaceholders(
  filledTypes: Set<string> = new Set(),
): Entry001CampaignAsset[] {
  const labels: Record<string, string> = {
    REEL_COVER: 'REEL COVER',
    HIGHLIGHT_ICON: 'HIGHLIGHT ICON',
    REEL: 'FINAL REEL',
    TIKTOK: 'TIKTOK POST',
    X_POST: 'X / TWITTER POST',
  };

  return ENTRY001_REQUIRED_DELIVERABLE_TYPES.filter((type) => !filledTypes.has(type)).map(
    (assetType) => ({
      assetId: `entry001-missing-${assetType.toLowerCase().replace(/_/g, '-')}`,
      entryId: 'entry-001' as const,
      filePath: '',
      title: labels[assetType] ?? assetType,
      format: assetType === 'REEL' ? ('VIDEO' as const) : ('IMAGE' as const),
      role: assetTypeToLegacyRole(assetType),
      assetType,
      assetRole: assetType === 'REEL_COVER' ? 'COVER' : null,
      status: 'MISSING' as const,
      source: 'FOUNDER_SUPPLIED' as const,
      approved: false,
      version: v,
      removedFromActiveArchive: false,
    }),
  );
}

export function getEntry001FullManifest(extraApproved: Entry001CampaignAsset[] = []): Entry001CampaignAsset[] {
  const filled = new Set(
    extraApproved.filter((a) => a.approved).map((a) => a.assetType ?? a.role),
  );
  const archive = [...ENTRY001_APPROVED_ARCHIVE, ...extraApproved.filter((a) => a.approved && a.filePath)];
  const missing = buildEntry001MissingDeliverablePlaceholders(filled);
  return [ENTRY001_HERO_ASSET, ...archive.filter((a) => a.assetId !== ENTRY001_HERO_ASSET.assetId), ...missing];
}

export const ENTRY001_ASSET_MANIFEST = getEntry001FullManifest();
