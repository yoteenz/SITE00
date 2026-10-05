import type { MarketingEngagementRecord } from '../../../shared/site00-marketing/types.js';
import {
  applyTestAddOnCredit,
  attachStudioWorldHandoff,
  buildAllowanceSummary,
  consumeAddOnCreditAndResume,
  initialCommercialState,
  resumeInterruptedProductionAction,
  runProductionAction,
  type ProductionActionKind,
} from '../../../shared/site00-marketing-commercial/pipeline.js';
import type {
  MarketingEngagementCommercialState,
} from '../../../shared/site00-marketing-commercial/types.js';
import type { UsageLedgerEntry } from '../../../shared/site00-studio-world/modular-production-engine/operational/clientCommercial.js';
import { getSupabaseAdmin } from '../supabase.js';

type StoredCommercial = MarketingEngagementCommercialState & {
  usageLedger?: UsageLedgerEntry[];
};

function parseStored(raw: unknown): StoredCommercial | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as StoredCommercial;
  if (!o.entitlement || !o.marketingProject) return null;
  return o;
}

export async function loadCommercialState(engagementId: string): Promise<StoredCommercial | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('site00_marketing_engagements')
    .select('commercial_state')
    .eq('id', engagementId)
    .single();
  if (!data) return null;
  return parseStored(data.commercial_state);
}

export async function saveCommercialState(engagementId: string, state: StoredCommercial): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase
    .from('site00_marketing_engagements')
    .update({ commercial_state: state, updated_at: new Date().toISOString() })
    .eq('id', engagementId);
}

export async function ensureCommercialOnPayment(engagement: MarketingEngagementRecord): Promise<StoredCommercial> {
  const existing = await loadCommercialState(engagement.id);
  if (existing?.entitlement) return existing;

  const state = initialCommercialState({
    engagement,
    subscriptionOrOrderId: engagement.id,
  });
  const stored: StoredCommercial = { ...state, usageLedger: [] };
  await saveCommercialState(engagement.id, stored);
  return stored;
}

export async function ensureCommercialOnProvision(
  engagement: MarketingEngagementRecord,
  studioWorldCampaignId: string,
): Promise<StoredCommercial> {
  let stored = (await loadCommercialState(engagement.id)) ?? initialCommercialState({ engagement });
  stored = attachStudioWorldHandoff(stored, studioWorldCampaignId, engagement.intake?.existingProjectSlug ?? null);
  if (!stored.usageLedger) stored = { ...stored, usageLedger: [] };
  await saveCommercialState(engagement.id, stored);
  return stored;
}

export async function commercialAllowanceForEngagement(engagementId: string) {
  const state = await loadCommercialState(engagementId);
  if (!state) return null;
  return buildAllowanceSummary(state);
}

export async function runEngagementProductionAction(input: {
  engagementId: string;
  kind: ProductionActionKind;
  assetId?: string;
}): Promise<{
  allowance: ReturnType<typeof buildAllowanceSummary>;
  blocked: boolean;
  addOnRequired: boolean;
  message: string;
}> {
  const stored = await loadCommercialState(input.engagementId);
  if (!stored) throw new Error('COMMERCIAL NOT ACTIVATED');

  const ledger = stored.usageLedger ?? [];
  const result = runProductionAction({
    state: stored,
    kind: input.kind,
    ledger,
    assetId: input.assetId ?? null,
  });

  await saveCommercialState(input.engagementId, {
    ...result.state,
    usageLedger: [...result.ledger],
  });

  return {
    allowance: buildAllowanceSummary(result.state),
    blocked: result.blocked,
    addOnRequired: result.addOnRequired,
    message: result.checkMessage,
  };
}

export async function applyEngagementTestAddOn(input: {
  engagementId: string;
  addOnType: 'EXTRA_CHARACTER' | 'NEW_ACTOR';
  resume?: boolean;
}) {
  let stored = await loadCommercialState(input.engagementId);
  if (!stored) throw new Error('COMMERCIAL NOT ACTIVATED');

  stored = applyTestAddOnCredit(stored, input.addOnType);
  stored = consumeAddOnCreditAndResume(stored, input.addOnType);

  const ledger = stored.usageLedger ?? [];
  if (input.resume !== false && stored.interruptedAction) {
    const resumed = resumeInterruptedProductionAction({ state: stored, ledger });
    if (resumed) {
      stored = { ...resumed.state, usageLedger: [...resumed.ledger] };
    }
  } else {
    await saveCommercialState(input.engagementId, { ...stored, usageLedger: ledger });
    return { allowance: buildAllowanceSummary(stored), resumed: false };
  }

  await saveCommercialState(input.engagementId, stored);
  return { allowance: buildAllowanceSummary(stored), resumed: true };
}
