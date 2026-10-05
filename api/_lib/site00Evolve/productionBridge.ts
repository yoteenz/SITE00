/** Studio World production bridge — SITE 00 orchestrates, Studio World produces */

import type { ProductionType, StudioProductionRequestRow } from './types.js';
import { governanceBlockReason, resolveProductionGovernance } from './governance.js';
import { evolveUuid, insertProductionRequest, getProductionRequestsByOrgId } from './storeAdapter.js';
import { orgIdFromSlug } from './orgRegistry.js';

export type ProductionRequestInput = {
  orgSlug: string;
  orgClassification: string;
  productionType: ProductionType;
  objective?: string;
  brief?: string;
  campaignId?: string;
  calendarItemId?: string;
  createdBy?: string;
  deliverables?: unknown[];
  canonRefs?: unknown[];
  referenceRefs?: unknown[];
  dueDate?: string;
};

export async function requestStudioProduction(input: ProductionRequestInput): Promise<{
  ok: boolean;
  request?: StudioProductionRequestRow;
  error?: string;
}> {
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

  const existing = await getProductionRequestsByOrgId(orgId);
  const row: StudioProductionRequestRow = {
    id: evolveUuid('spreq', existing.length + 1),
    organization_id: orgId,
    project_id: null,
    campaign_id: input.campaignId ?? null,
    calendar_item_id: input.calendarItemId ?? null,
    production_type: input.productionType,
    objective: input.objective ?? null,
    brief: input.brief ?? null,
    deliverables: input.deliverables ?? [],
    canon_refs: input.canonRefs ?? [],
    reference_refs: input.referenceRefs ?? [],
    asset_refs: [],
    priority: 'MEDIUM',
    due_date: input.dueDate ?? null,
    approval_state: 'PENDING',
    production_state: 'REQUESTED',
    governance_state: governance,
    external_production_id: null,
    external_status: null,
    estimated_cost: null,
    actual_cost: null,
    created_by: input.createdBy ?? null,
    approved_by: null,
    metadata: {
      lineage: { campaignId: input.campaignId, calendarItemId: input.calendarItemId },
      dispatch_state: governance === 'BLOCKED_BY_GOVERNANCE' ? 'BLOCKED_BY_GOVERNANCE' : 'NOT_DISPATCHED',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (governance === 'BLOCKED_BY_GOVERNANCE') {
    return { ok: false, error: governanceBlockReason(input.productionType) };
  }

  await insertProductionRequest(row);
  return { ok: true, request: row };
}

/** Campaign cannot become LIVE merely from asset completion */
export function canTransitionCampaignToLive(campaignStatus: string, deliverablesComplete: boolean): boolean {
  if (deliverablesComplete && campaignStatus !== 'APPROVED' && campaignStatus !== 'READY' && campaignStatus !== 'SCHEDULED') {
    return false;
  }
  return campaignStatus === 'APPROVED' || campaignStatus === 'READY' || campaignStatus === 'SCHEDULED';
}
