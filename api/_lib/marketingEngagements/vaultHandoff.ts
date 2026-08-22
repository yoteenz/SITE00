import { createHmac, timingSafeEqual } from 'node:crypto';
import { getSupabaseAdmin } from '../supabase.js';
import type { StudioWorldClientDeliverable } from '../studioWorld/types.js';
import { getStudioWorldWebhookSecret } from '../studioWorld/contract.js';

export type VaultDeliverableLink = {
  id: string;
  engagementId: string;
  studioWorldDeliverableId: string;
  title: string;
  format?: string;
  aspectRatio?: string;
  version?: string;
  previewUrl?: string;
  downloadUrl?: string;
  vaultStatus: string;
  provenance: Record<string, unknown>;
  linkedAt: string;
};

/** Persist approved deliverable references for Vault access — no duplicate media ingestion. */
export async function linkApprovedDeliverablesToVault(
  engagementId: string,
  campaignId: string,
  deliverables: StudioWorldClientDeliverable[],
): Promise<VaultDeliverableLink[]> {
  const approved = deliverables.filter((d) => d.visibility === 'APPROVED');
  if (!approved.length) return listVaultLinksForEngagement(engagementId);

  const supabase = getSupabaseAdmin();
  const rows = approved.map((d) => ({
    engagement_id: engagementId,
    studio_world_deliverable_id: d.id,
    title: d.title,
    format: d.format ?? null,
    aspect_ratio: d.aspectRatio ?? null,
    version: d.version ?? null,
    preview_url: d.previewUrl ?? null,
    download_url: d.downloadUrl ?? null,
    vault_status: 'LINKED',
    provenance: {
      source: 'STUDIO_WORLD',
      engagementType: 'EVOLVE_MARKETING',
      campaignId,
      version: d.version ?? 'V1',
    },
  }));

  await supabase.from('site00_marketing_deliverable_links').upsert(rows, {
    onConflict: 'engagement_id,studio_world_deliverable_id',
  });

  return listVaultLinksForEngagement(engagementId);
}

export async function listVaultLinksForEngagement(engagementId: string): Promise<VaultDeliverableLink[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('site00_marketing_deliverable_links')
    .select('*')
    .eq('engagement_id', engagementId)
    .order('linked_at', { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    engagementId: row.engagement_id,
    studioWorldDeliverableId: row.studio_world_deliverable_id,
    title: row.title,
    format: row.format ?? undefined,
    aspectRatio: row.aspect_ratio ?? undefined,
    version: row.version ?? undefined,
    previewUrl: row.preview_url ?? undefined,
    downloadUrl: row.download_url ?? undefined,
    vaultStatus: row.vault_status,
    provenance: row.provenance as Record<string, unknown>,
    linkedAt: row.linked_at,
  }));
}

export function verifyStudioWorldWebhookSignature(rawBody: string, signatureHeader: string | undefined): boolean {
  const secret = getStudioWorldWebhookSecret();
  if (!secret) return false;
  if (!signatureHeader?.startsWith('sha256=')) return false;

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const provided = signatureHeader.slice('sha256='.length);

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  } catch {
    return false;
  }
}

export type StudioWorldWebhookPayload = {
  eventType: string;
  campaignId: string;
  externalEngagementId?: string;
  timestamp: string;
  payload?: Record<string, unknown>;
};
