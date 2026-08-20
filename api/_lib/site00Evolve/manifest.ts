/** Intelligent marketing manifest generation — org-specific, not universal */

import type { MarketingManifestItemRow, MarketingManifestRow, MarketingProfileRow } from './types.js';
import type { MarketingChannelRow } from './types.js';
import {
  getActiveManifest,
  getManifestItems,
  upsertManifest,
  evolveUuid,
} from './storeAdapter.js';
import { orgIdFromSlug } from './orgRegistry.js';

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

const NDXBOOK_MANIFEST: ManifestTemplate[] = [
  { item_key: 'page_001_specimen', title: 'Page 001 — Credit / Debt Payoff', description: 'First candidate content specimen — NOT publication approved', category: 'CONTENT', channel_key: 'INSTAGRAM' },
  { item_key: 'instagram_pilot', title: 'Instagram Pilot Pipeline', description: 'Prove intelligence → production → approval → distribution → measurement', category: 'SOCIAL', channel_key: 'INSTAGRAM' },
  { item_key: 'content_taxonomy', title: 'Volume & Chapter Taxonomy', description: 'Five launch volumes programming architecture', category: 'STRATEGY' },
  { item_key: 'voice_system', title: 'Voice & Hook System', description: 'Canonical voice and page structure rules', category: 'STRATEGY' },
  { item_key: 'measurement_baseline', title: 'Measurement Baseline', description: 'Genuine provider evidence only — no fabricated targets', category: 'MEASUREMENT' },
  { item_key: 'visual_direction', title: 'Visual / Creative Direction', description: 'Future identity process — placeholder DNA not canon', category: 'PRODUCTION' },
];

function selectTemplate(orgSlug: string): ManifestTemplate[] {
  switch (orgSlug) {
    case 'frontal-slayer':
      return FS_MANIFEST;
    case 'all-in-one-enterprises':
      return AIO_MANIFEST;
    case 'site-00':
      return SITE00_MANIFEST;
    case 'ndxbook':
      return NDXBOOK_MANIFEST;
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

export async function generateMarketingManifest(
  orgSlug: string,
  profile: MarketingProfileRow | undefined,
  channels: MarketingChannelRow[],
): Promise<{ manifest: MarketingManifestRow; items: MarketingManifestItemRow[] }> {
  const orgId = orgIdFromSlug(orgSlug)!;
  const templates = filterByChannels(selectTemplate(orgSlug), channels);
  const manifestId = evolveUuid('mman', Date.now() % 100000);

  const manifest: MarketingManifestRow = {
    id: manifestId,
    organization_id: orgId,
    title: `${orgSlug === 'frontal-slayer' ? 'Flagship Launch' : orgSlug === 'all-in-one-enterprises' ? 'Service Growth' : orgSlug === 'ndxbook' ? 'NDXbook Founder Pilot' : 'Platform Growth'} Marketing Manifest`,
    manifest_state: 'PROPOSED',
    approval_state: 'PENDING',
    is_active: true,
    generated_from: {
      orgSlug,
      primaryObjective: profile?.primary_objective,
      channelStates: channels.map((c) => ({ key: c.channel_key, state: c.channel_state })),
      socialDeferred: channels.some((c) => c.channel_state === 'DEFERRED' && c.owner_decision === 'DEFERRED_BY_OWNER'),
      ...(orgSlug === 'ndxbook'
        ? { lineage: 'legacy recovery → founder confirmation → Content Brain → objectives → channels → manifest' }
        : {}),
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

  await upsertManifest(manifest, items);
  return { manifest, items };
}

export async function getMarketingManifest(orgSlug: string): Promise<{
  manifest: MarketingManifestRow | null;
  items: MarketingManifestItemRow[];
}> {
  const orgId = orgIdFromSlug(orgSlug)!;
  const manifest = await getActiveManifest(orgId);
  if (!manifest) return { manifest: null, items: [] };
  return { manifest, items: await getManifestItems(manifest.id) };
}

export async function approveManifestById(manifestId: string, approvedBy: string): Promise<MarketingManifestRow | null> {
  if (process.env.VITEST === 'true' || process.env.EVOLVE_USE_MEMORY === '1') {
    const { getEvolveStore } = await import('./memoryStore.js');
    const m = getEvolveStore().manifests.find((x) => x.id === manifestId);
    if (!m) return null;
    m.approval_state = 'APPROVED';
    m.manifest_state = 'ACTIVE';
    m.approved_by = approvedBy;
    m.approved_at = new Date().toISOString();
    return m;
  }
  const { approveManifestById: dbApprove } = await import('./storeAdapter.js');
  return dbApprove(manifestId, approvedBy);
}
