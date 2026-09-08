/**
 * B5.2 — Entry 001 Campaign Package asset manifest (single source of truth).
 * Founder-supplied approved archive; static public paths — no Supabase required.
 */

import type { Entry001CampaignAsset } from '../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';

export const ENTRY001_ASSET_BASE = '/assets/ndxbook/entry-001';

export const ENTRY001_REQUIRED_DELIVERABLE_ROLES = [
  'REEL_COVER',
  'HIGHLIGHT_ICON',
  'FINAL_REEL',
  'TIKTOK_POST',
  'X_POST',
] as const;

const v = 'v001';

/** Approved founder archive — seeded from founder reference board migration. */
export const ENTRY001_APPROVED_ARCHIVE: Entry001CampaignAsset[] = [
  {
    assetId: 'entry001-archive-01-then-now',
    entryId: 'entry-001',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-01-then-now.jpg`,
    title: 'THEN / NOW',
    format: 'IMAGE',
    role: 'CAROUSEL_SLIDE',
    status: 'APPROVED',
    source: 'FOUNDER_SUPPLIED',
    approved: true,
    version: v,
    notes: 'Then/now comparison frame — public memory shift',
  },
  {
    assetId: 'entry001-archive-02-rehab-cycle',
    entryId: 'entry-001',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-02-rehab-cycle.jpg`,
    title: 'PUBLIC REHABILITATION CYCLE',
    format: 'IMAGE',
    role: 'INFOGRAPHIC',
    status: 'APPROVED',
    source: 'FOUNDER_SUPPLIED',
    approved: true,
    version: v,
    notes: 'Public rehabilitation cycle argument frame',
  },
  {
    assetId: 'entry001-archive-03-apologies-archives',
    entryId: 'entry-001',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-03-apologies-archives.jpg`,
    title: 'APOLOGIES ARE NICE. ARCHIVES ARE BETTER.',
    format: 'IMAGE',
    role: 'QUOTE_POST',
    status: 'APPROVED',
    source: 'FOUNDER_SUPPLIED',
    approved: true,
    version: v,
  },
  {
    assetId: 'entry001-archive-04-story-changed',
    entryId: 'entry-001',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-04-story-changed.jpg`,
    title: 'THE STORY CHANGED.',
    format: 'IMAGE',
    role: 'CAROUSEL_SLIDE',
    status: 'APPROVED',
    source: 'FOUNDER_SUPPLIED',
    approved: true,
    version: v,
    notes: 'Story-change / revision frame',
  },
  {
    assetId: 'entry001-archive-05-accountability',
    entryId: 'entry-001',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-05-accountability.jpg`,
    title: 'ACCOUNTABILITY / REVISION',
    format: 'IMAGE',
    role: 'REFERENCE_GRAPHIC',
    status: 'APPROVED',
    source: 'FOUNDER_SUPPLIED',
    approved: true,
    version: v,
  },
  {
    assetId: 'entry001-archive-06-quote-statement',
    entryId: 'entry-001',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-06-quote-statement.jpg`,
    title: 'QUOTE / STATEMENT',
    format: 'IMAGE',
    role: 'QUOTE_POST',
    status: 'APPROVED',
    source: 'FOUNDER_SUPPLIED',
    approved: true,
    version: v,
  },
  {
    assetId: 'entry001-archive-07-revision-frame',
    entryId: 'entry-001',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-07-revision-frame.jpg`,
    title: 'REVISION / ACCOUNTABILITY',
    format: 'IMAGE',
    role: 'CAROUSEL_SLIDE',
    status: 'APPROVED',
    source: 'FOUNDER_SUPPLIED',
    approved: true,
    version: v,
  },
  {
    assetId: 'entry001-archive-08-media-complicity',
    entryId: 'entry-001',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-08-media-complicity.jpg`,
    title: 'MEDIA COMPLICITY',
    format: 'IMAGE',
    role: 'SOCIAL_POST',
    status: 'APPROVED',
    source: 'FOUNDER_SUPPLIED',
    approved: true,
    version: v,
  },
  {
    assetId: 'entry001-archive-09-cta-poll',
    entryId: 'entry-001',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-09-cta-poll.jpg`,
    title: 'CTA / POLL',
    format: 'IMAGE',
    role: 'STORY_FRAME',
    status: 'APPROVED',
    source: 'FOUNDER_SUPPLIED',
    approved: true,
    version: v,
  },
  {
    assetId: 'entry001-archive-10-entry-cover-slide',
    entryId: 'entry-001',
    filePath: `${ENTRY001_ASSET_BASE}/entry001-archive-10-entry-cover-slide.jpg`,
    title: 'ENTRY COVER SLIDE',
    format: 'IMAGE',
    role: 'ENTRY_COVER',
    status: 'APPROVED',
    source: 'FOUNDER_SUPPLIED',
    approved: true,
    version: v,
  },
];

export const ENTRY001_HERO_ASSET: Entry001CampaignAsset = {
  assetId: 'entry001-hero-portrait',
  entryId: 'entry-001',
  filePath: `${ENTRY001_ASSET_BASE}/entry001-hero-portrait.jpg`,
  title: 'ENTRY 001 HERO PORTRAIT',
  format: 'IMAGE',
  role: 'ENTRY_HERO',
  status: 'APPROVED',
  source: 'FOUNDER_SUPPLIED',
  approved: true,
  version: v,
  notes: 'Britney archival portrait — hero treatment',
};

export function buildEntry001MissingDeliverablePlaceholders(
  filledRoles: Set<string> = new Set(),
): Entry001CampaignAsset[] {
  const labels: Record<string, string> = {
    REEL_COVER: 'REEL COVER',
    HIGHLIGHT_ICON: 'HIGHLIGHT ICON',
    FINAL_REEL: 'FINAL REEL',
    TIKTOK_POST: 'TIKTOK POST',
    X_POST: 'X / TWITTER POST',
  };

  return ENTRY001_REQUIRED_DELIVERABLE_ROLES.filter((role) => !filledRoles.has(role)).map(
    (role) => ({
      assetId: `entry001-missing-${role.toLowerCase().replace(/_/g, '-')}`,
      entryId: 'entry-001' as const,
      filePath: '',
      title: labels[role] ?? role,
      format: role === 'FINAL_REEL' ? ('VIDEO' as const) : ('IMAGE' as const),
      role,
      status: 'MISSING' as const,
      source: 'FOUNDER_SUPPLIED' as const,
      approved: false,
      version: v,
    }),
  );
}

export function getEntry001FullManifest(extraApproved: Entry001CampaignAsset[] = []): Entry001CampaignAsset[] {
  const filled = new Set(extraApproved.filter((a) => a.approved).map((a) => a.role));
  const archive = [...ENTRY001_APPROVED_ARCHIVE, ...extraApproved.filter((a) => a.approved && a.filePath)];
  const missing = buildEntry001MissingDeliverablePlaceholders(filled);
  return [ENTRY001_HERO_ASSET, ...archive.filter((a) => a.assetId !== ENTRY001_HERO_ASSET.assetId), ...missing];
}

export const ENTRY001_ASSET_MANIFEST = getEntry001FullManifest();
