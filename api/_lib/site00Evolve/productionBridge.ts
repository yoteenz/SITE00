/** Studio World production bridge — SITE 00 orchestrates, Studio World produces */

import type { ProductionType, StudioProductionRequestRow } from './types.js';
import { governanceBlockReason, resolveProductionGovernance } from './governance.js';
import { evolveUuid, getEvolveStore, insertProductionRequest } from './memoryStore.js';
import { orgIdFromSlug } from './seedFixtures.js';

export type ProductionRequestInput = {
  orgSlug: string;
  orgClassification: string;
  productionType: ProductionType;
  objective?: string;
  brief?: string;
  campaignId?: string;
  calendarItemId?: string;
  createdBy?: string;
};

export function requestStudioProduction(input: ProductionRequestInput): {
  ok: boolean;
  request?: StudioProductionRequestRow;
  error?: string;
} {
  const orgId = orgIdFromSlug(input.orgSlug)!;
  const governance = resolveProductionGovernance(input.productionType, input.orgClassification);

  if (governance === 'BLOCKED_BY_GOVERNANCE') {
    return {
      ok: false,
      error: governanceBlockReason(input.productionType),
    };
  }

  if (input.orgClassification === 'PRODUCTION_INFRASTRUCTURE') {
    return { ok: false, error: 'Studio World is production infrastructure — cannot request production against itself' };
  }

  const row: StudioProductionRequestRow = {
    id: evolveUuid('spreq', getEvolveStore().productionRequests.length + 1),
    organization_id: orgId,
    project_id: null,
    campaign_id: input.campaignId ?? null,
    calendar_item_id: input.calendarItemId ?? null,
    production_type: input.productionType,
    objective: input.objective ?? null,
    brief: input.brief ?? null,
    deliverables: [],
    canon_refs: [],
    reference_refs: [],
    asset_refs: [],
    priority: 'MEDIUM',
    due_date: null,
    approval_state: 'PENDING',
    production_state: 'REQUESTED',
    governance_state: governance,
    external_production_id: null,
    external_status: null,
    estimated_cost: null,
    actual_cost: null,
    created_by: input.createdBy ?? null,
    approved_by: null,
    metadata: { lineage: { campaignId: input.campaignId, calendarItemId: input.calendarItemId } },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  insertProductionRequest(row);
  return { ok: true, request: row };
}

/** Campaign cannot become LIVE merely from asset completion */
export function canTransitionCampaignToLive(campaignStatus: string, deliverablesComplete: boolean): boolean {
  if (deliverablesComplete && campaignStatus !== 'APPROVED' && campaignStatus !== 'READY' && campaignStatus !== 'SCHEDULED') {
    return false;
  }
  return campaignStatus === 'APPROVED' || campaignStatus === 'READY' || campaignStatus === 'SCHEDULED';
}
