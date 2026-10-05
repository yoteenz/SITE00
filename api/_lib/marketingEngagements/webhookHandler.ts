import { getSupabaseAdmin } from '../supabase.js';
import { getProductionServiceAdapter } from '../studioWorld/client.js';
import type { MarketingEngagementStatus } from '../../../shared/site00-marketing/types.js';
import {
  linkApprovedDeliverablesToVault,
  type StudioWorldWebhookPayload,
} from './vaultHandoff.js';
import { syncMarketingEngagement, logEventPublic } from './service.js';

export async function processStudioWorldWebhook(event: StudioWorldWebhookPayload): Promise<{ ok: true; engagementId?: string }> {
  const supabase = getSupabaseAdmin();

  let engagementId = event.externalEngagementId;
  if (!engagementId) {
    const { data } = await supabase
      .from('site00_marketing_engagements')
      .select('id')
      .eq('studio_world_campaign_id', event.campaignId)
      .maybeSingle();
    engagementId = data?.id;
  }

  if (!engagementId) {
    console.warn('[studioWorld webhook] No engagement for campaign', event.campaignId);
    return { ok: true };
  }

  await logEventPublic(engagementId, `WEBHOOK_${event.eventType.toUpperCase().replace(/\./g, '_')}`, 'studio-world', event.payload);

  switch (event.eventType) {
    case 'status.updated':
    case 'client_action.required':
    case 'review.ready':
      await syncMarketingEngagement(engagementId);
      break;
    case 'deliverable.approved': {
      const adapter = getProductionServiceAdapter();
      const deliverables = await adapter.listClientDeliverables(event.campaignId);
      await linkApprovedDeliverablesToVault(engagementId, event.campaignId, deliverables);
      await supabase
        .from('site00_marketing_engagements')
        .update({ status: 'DELIVERABLE_READY', updated_at: new Date().toISOString() })
        .eq('id', engagementId);
      break;
    }
    case 'campaign.complete':
      await supabase
        .from('site00_marketing_engagements')
        .update({
          status: 'COMPLETE' as MarketingEngagementStatus,
          client_phase: '07',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', engagementId);
      break;
    default:
      await syncMarketingEngagement(engagementId);
  }

  return { ok: true, engagementId };
}
