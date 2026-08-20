/** Intelligent marketing manifest generation — org-specific, not universal */

import type { MarketingManifestItemRow, MarketingManifestRow, MarketingProfileRow } from './types.js';
import type { MarketingChannelRow } from './types.js';
import {
  getActiveManifest,
  getManifestItems,
  upsertManifest,
  evolveUuid,
} from './memoryStore.js';
import { orgIdFromSlug } from './seedFixtures.js';

type ManifestTemplate = { item_key: string; title: string; description: string; category: string; channel_key?: string };

const FS_MANIFEST: ManifestTemplate[] = [
  { item_key: 'launch_narrative', title: 'Launch Narrative', description: 'Core launch story and messaging', category: 'STRATEGY' },
  { item_key: 'product_photography', title: 'Product Photography', description: 'Studio World production — governance applies', category: 'PRODUCTION' },
  { item_key: 'campaign_key_visuals', title: 'Campaign Key Visuals', description: 'Hero campaign creative', category: 'PRODUCTION' },
  { item_key: 'lifecycle_email', title: 'Lifecycle Email', description: 'Post-purchase and retention sequences', category: 'EMAIL', channel_key: 'EMAIL' },
  { item_key: 'launch_email', title: 'Launch Email', description: 'Launch announcement sequence', category: 'EMAIL', channel_key: 'EMAIL' },
  { item_key: 'social_launch', title: 'Social Launch Campaign', description: 'Platform-specific launch content', category: 'SOCIAL', channel_key: 'INSTAGRAM' },
  { item_key: 'product_education', title: 'Product Education', description: 'Educational storytelling content', category: 'CONTENT' },
  { item_key: 'landing_experience', title: 'Landing Experience', description: 'Conversion-focused launch landing', category: 'WEB', channel_key: 'WEBSITE' },
  { item_key: 'retargeting', title: 'Retargeting Foundation', description: 'Paid social retargeting setup', category: 'PAID', channel_key: 'PAID_SOCIAL' },
  { item_key: 'post_purchase', title: 'Post-Purchase Lifecycle', description: 'Retention and repeat purchase flows', category: 'EMAIL', channel_key: 'EMAIL' },
  { item_key: 'ugc_strategy', title: 'UGC Strategy', description: 'User-generated content framework', category: 'SOCIAL' },
  { item_key: 'measurement', title: 'Performance Measurement', description: 'Launch KPIs and tracking', category: 'MEASUREMENT' },
];

const AIO_MANIFEST: ManifestTemplate[] = [
  { item_key: 'service_positioning', title: 'Service Positioning', description: 'Trust-focused service messaging', category: 'STRATEGY' },
  { item_key: 'lead_capture', title: 'Lead Capture', description: 'Intake and lead forms', category: 'CONVERSION', channel_key: 'WEBSITE' },
  { item_key: 'service_email', title: 'Service Email Sequence', description: 'Nurture and follow-up email', category: 'EMAIL', channel_key: 'EMAIL' },
  { item_key: 'referral', title: 'Referral Workflow', description: 'Customer referral system', category: 'REFERRAL', channel_key: 'REFERRAL' },
  { item_key: 'search_foundation', title: 'Google/Search Foundation', description: 'Local and search visibility', category: 'SEO', channel_key: 'SEO' },
  { item_key: 'trust_content', title: 'Trust Content', description: 'Industry credibility content', category: 'CONTENT' },
  { item_key: 'customer_education', title: 'Customer Education', description: 'Service education materials', category: 'CONTENT' },
  { item_key: 'conversion_measurement', title: 'Conversion Measurement', description: 'Lead and booking tracking', category: 'MEASUREMENT' },
  // Social explicitly excluded — deferred by owner
];

const SITE00_MANIFEST: ManifestTemplate[] = [
  { item_key: 'creator_acquisition', title: 'Creator Acquisition', description: 'Platform growth campaigns', category: 'STRATEGY' },
  { item_key: 'product_education', title: 'Product Education', description: 'How SITE 00 works', category: 'CONTENT' },
  { item_key: 'case_studies', title: 'Case Studies', description: 'Proof and outcomes', category: 'CONTENT' },
  { item_key: 'launch_campaigns', title: 'Launch Campaigns', description: 'Feature and product announcements', category: 'CAMPAIGN' },
  { item_key: 'email_lifecycle', title: 'Email Lifecycle', description: 'Onboarding and retention email', category: 'EMAIL', channel_key: 'EMAIL' },
  { item_key: 'founder_story', title: 'Founder Storytelling', description: 'Human brand narrative', category: 'CONTENT' },
  { item_key: 'measurement', title: 'Platform Growth Measurement', description: 'Acquisition and activation KPIs', category: 'MEASUREMENT' },
];

function selectTemplate(orgSlug: string): ManifestTemplate[] {
  switch (orgSlug) {
    case 'frontal-slayer':
      return FS_MANIFEST;
    case 'all-in-one-enterprises':
      return AIO_MANIFEST;
    case 'site-00':
      return SITE00_MANIFEST;
    default:
      return [];
  }
}

function filterByChannels(templates: ManifestTemplate[], channels: MarketingChannelRow[]): ManifestTemplate[] {
  return templates.filter((t) => {
    if (!t.channel_key) return true;
    const ch = channels.find((c) => c.channel_key === t.channel_key);
    if (!ch) return true;
    if (ch.channel_state === 'NOT_REQUIRED') return false;
    if (ch.channel_state === 'DEFERRED') return false;
    return true;
  });
}

export function generateMarketingManifest(
  orgSlug: string,
  profile: MarketingProfileRow | undefined,
  channels: MarketingChannelRow[],
): { manifest: MarketingManifestRow; items: MarketingManifestItemRow[] } {
  const orgId = orgIdFromSlug(orgSlug)!;
  const templates = filterByChannels(selectTemplate(orgSlug), channels);
  const manifestId = evolveUuid('mman', Date.now() % 100000);

  const manifest: MarketingManifestRow = {
    id: manifestId,
    organization_id: orgId,
    title: `${orgSlug === 'frontal-slayer' ? 'Flagship Launch' : orgSlug === 'all-in-one-enterprises' ? 'Service Growth' : 'Platform Growth'} Marketing Manifest`,
    manifest_state: 'PROPOSED',
    approval_state: 'PENDING',
    is_active: true,
    generated_from: {
      orgSlug,
      primaryObjective: profile?.primary_objective,
      channelStates: channels.map((c) => ({ key: c.channel_key, state: c.channel_state })),
      socialDeferred: channels.some((c) => c.channel_state === 'DEFERRED' && c.owner_decision === 'DEFERRED_BY_OWNER'),
    },
    approved_by: null,
    approved_at: null,
    metadata: { generated: true, itemCount: templates.length },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const items: MarketingManifestItemRow[] = templates.map((t, i) => ({
    id: evolveUuid('mitem', i + 1),
    manifest_id: manifestId,
    item_key: t.item_key,
    title: t.title,
    description: t.description,
    category: t.category,
    channel_key: t.channel_key ?? null,
    priority: i < 3 ? 'HIGH' : 'MEDIUM',
    status: 'PLANNED',
    sort_order: i,
    metadata: {},
  }));

  upsertManifest(manifest, items);
  return { manifest, items };
}

export function getMarketingManifest(orgSlug: string): {
  manifest: MarketingManifestRow | null;
  items: MarketingManifestItemRow[];
} {
  const orgId = orgIdFromSlug(orgSlug)!;
  const manifest = getActiveManifest(orgId);
  if (!manifest) return { manifest: null, items: [] };
  return { manifest, items: getManifestItems(manifest.id) };
}

import { getEvolveStore } from './memoryStore.js';

export function approveManifestById(manifestId: string, approvedBy: string): MarketingManifestRow | null {
  const m = getEvolveStore().manifests.find((x) => x.id === manifestId);
  if (!m) return null;
  m.approval_state = 'APPROVED';
  m.manifest_state = 'ACTIVE';
  m.approved_by = approvedBy;
  m.approved_at = new Date().toISOString();
  return m;
}
