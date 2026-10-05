/**
 * P0.SW.MARKETING-WEBSITE-TO-STUDIO-WORLD-COMMERCIAL-PIPELINE-INTEGRATION1
 */

import { describe, expect, it } from 'vitest';

import { MARKETING_ARCHITECTURE_AUDIT } from '../shared/site00-marketing-commercial/auditConstants.js';
import { entitlementTemplateForService } from '../shared/site00-marketing-commercial/entitlementTemplates.js';
import {
  activateClientMarketingEntitlement,
  applyTestAddOnCredit,
  attachStudioWorldHandoff,
  buildAllowanceSummary,
  buildMarketingProjectCommercial,
  consumeAddOnCreditAndResume,
  initialCommercialState,
  narrativeToCastingCataloguePath,
  resetMonthlyAllowancesKeepInventory,
  resolveEndClientBrandFromIntake,
  resumeInterruptedProductionAction,
  runProductionAction,
} from '../shared/site00-marketing-commercial/pipeline.js';
import type { MarketingEngagementRecord } from '../shared/site00-marketing/types.js';
import { compileEntry002RetroactiveNarrativeMomentum } from '../shared/site00-expression-engine/narrative-momentum/entry002RetroactiveIngest.js';
import { deriveCastingRequirementsFromNarrativePlan } from '../shared/site00-studio-world/acting-catalogue/deriveCastingRequirements.js';

function engagement(overrides: Partial<MarketingEngagementRecord> = {}): MarketingEngagementRecord {
  return {
    id: 'eng-1',
    engagementCode: 'MKT-1001',
    clientEmail: 'client@example.com',
    clientUserId: 'user-1',
    campaignName: 'Q1 Campaign',
    serviceCategory: 'social-content',
    status: 'PAID',
    paymentState: 'CONFIRMED',
    brandSource: 'UNKNOWN',
    brandSetupRequired: false,
    intake: { campaignObjective: 'Grow awareness', businessName: 'Acme' },
    scope: { serviceCategory: 'social-content', status: 'READY' },
    clientPhase: '02',
    clientActionRequired: false,
    provisioningState: 'COMPLETE',
    externalSyncStatus: 'LINKED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('P0.SW.MARKETING-COMMERCIAL-PIPELINE-INTEGRATION1', () => {
  it('audit documents real marketing routes (no parallel product)', () => {
    expect(MARKETING_ARCHITECTURE_AUDIT.MARKETING_PUBLIC_ROUTE).toBe('/evolve/marketing');
    expect(MARKETING_ARCHITECTURE_AUDIT.MARKETING_INTAKE_FLOW).toContain('/evolve/marketing/intake');
    expect(MARKETING_ARCHITECTURE_AUDIT.MARKETING_CLIENT_WORKSPACE_ROUTE).toContain('engagement');
  });

  it('package category maps to entitlement template with configurable allowances', () => {
    const tpl = entitlementTemplateForService('social-content');
    expect(tpl.characterAllowance).toBe(1);
    expect(tpl.entitlementTemplateId).toBe('ent-tpl-social-content');
  });

  it('payment activation creates client entitlement tied to engagement', () => {
    const ent = activateClientMarketingEntitlement({ engagement: engagement() });
    expect(ent.marketingEngagementId).toBe('eng-1');
    expect(ent.subscriptionOrOrderId).toBeTruthy();
    expect(ent.usage.charactersCreated).toBe(0);
  });

  it('provision links marketing project to Studio World campaign', () => {
    let state = initialCommercialState({ engagement: engagement() });
    state = attachStudioWorldHandoff(state, 'sw-campaign-99', 'ndxbook');
    expect(state.marketingProject.studioWorldCampaignId).toBe('sw-campaign-99');
    expect(state.marketingProject.marketingProjectId).toContain('eng-1');
  });

  it('client-of-client intake resolves end client brand scope', () => {
    const end = resolveEndClientBrandFromIntake(
      { campaignForEndClient: true, endClientBrandName: 'Retail Co' },
      'agency-1',
      'ws-agency',
    );
    expect(end?.name).toBe('Retail Co');
    const proj = buildMarketingProjectCommercial({
      engagement: engagement({
        intake: { campaignForEndClient: true, endClientBrandName: 'Retail Co' },
      }),
      entitlement: activateClientMarketingEntitlement({ engagement: engagement() }),
      endClientBrand: end,
    });
    expect(proj.endClientBrandId).toBeTruthy();
  });

  it('reuse does not consume character allowance', () => {
    let state = initialCommercialState({ engagement: engagement() });
    const r = runProductionAction({ state, kind: 'USE_EXISTING', ledger: [] });
    expect(r.addOnRequired).toBe(false);
    expect(r.state.entitlement.usage.charactersCreated).toBe(0);
  });

  it('character creation consumes allowance until exhausted', () => {
    let state = initialCommercialState({ engagement: engagement() });
    let ledger: readonly never[] = [];
    const first = runProductionAction({ state, kind: 'CREATE_CHARACTER', ledger });
    expect(first.state.entitlement.usage.charactersCreated).toBe(1);
    state = first.state;
    ledger = first.ledger;
    const blocked = runProductionAction({ state, kind: 'CREATE_CHARACTER', ledger });
    expect(blocked.blocked).toBe(true);
    expect(blocked.addOnRequired).toBe(true);
    expect(blocked.state.interruptedAction?.actionType).toBe('CREATE_CHARACTER');
  });

  it('add-on credit unblocks interrupted casting action', () => {
    let state = initialCommercialState({ engagement: engagement() });
    let ledger: readonly never[] = [];
    state = runProductionAction({ state, kind: 'CREATE_CHARACTER', ledger }).state;
    state = runProductionAction({ state, kind: 'CREATE_CHARACTER', ledger }).state;
    expect(state.interruptedAction).toBeTruthy();

    state = applyTestAddOnCredit(state, 'EXTRA_CHARACTER');
    state = consumeAddOnCreditAndResume(state, 'EXTRA_CHARACTER');
    const resumed = resumeInterruptedProductionAction({ state, ledger });
    expect(resumed?.blocked).toBe(false);
    expect(resumed?.state.entitlement.usage.charactersCreated).toBe(2);
  });

  it('narrative casting requirement flows to catalogue search before net-new actor', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    const req = deriveCastingRequirementsFromNarrativePlan(plan)[0]!;
    const path = narrativeToCastingCataloguePath({
      requirement: req,
      projectId: plan.projectId,
      brand: 'ndxbook',
      creativeTerritory: plan.creativeTerritoryLabel,
    });
    expect(['MATCHED', 'POSSIBLE_MATCH', 'NO_SUITABLE_MATCH']).toContain(path.searchOutcome);
  });

  it('monthly reset renews allowances without implying asset deletion', () => {
    let state = initialCommercialState({ engagement: engagement() });
    state = runProductionAction({ state, kind: 'CREATE_CHARACTER', ledger: [] }).state;
    expect(state.entitlement.usage.charactersCreated).toBe(1);
    state = resetMonthlyAllowancesKeepInventory(state, '2026-10');
    expect(state.entitlement.usage.charactersCreated).toBe(0);
    expect(state.entitlement.billingPeriod).toBe('2026-10');
    expect(buildAllowanceSummary(state).characters.used).toBe(0);
  });

  it('usage ledger grows from real production actions only', () => {
    const state = initialCommercialState({ engagement: engagement() });
    const r = runProductionAction({ state, kind: 'RESKIN', ledger: [] });
    expect(r.ledger.length).toBe(1);
    expect(r.ledger[0]?.operationType).toBe('RESKIN_EXISTING');
    expect(r.ledger[0]?.accidentalHallucination).toBe(false);
  });
});
