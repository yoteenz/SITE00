import { beforeEach, describe, expect, it } from 'vitest';
import { resetEvolveStore } from '../memoryStore.js';
import { resetNdxbookImportMemory } from '../providers/ndxbookLegacyImportService.js';
import { getCreativeDirectionPayload } from '../creativeDirection/engagementService.js';
import { runNdxbookLegacyImport } from '../providers/ndxbookLegacyImportService.js';
import { resolveEvolveCommercialState } from './commercialState.js';
import { setEvolveCommercialPlan } from './governedActions.js';

describe('EVOLVE commercial state — project boundaries', () => {
  beforeEach(() => {
    resetEvolveStore();
    resetNdxbookImportMemory();
  });

  it('Studio World is production infrastructure — commercial model is NOT_APPLICABLE, never a marketing client', async () => {
    const state = await resolveEvolveCommercialState('studio-world');
    expect(state.applicability).toBe('NOT_APPLICABLE');
    expect(state.plan).toBeNull();
    expect(state.planStatus).toBe('NOT_APPLICABLE');
    expect(state.foundation).toBeNull();
  });

  it('Frontal Slayer is an internal founder brand — INTERNAL_NON_BILLING, no fabricated subscription', async () => {
    const state = await resolveEvolveCommercialState('frontal-slayer');
    expect(state.applicability).toBe('INTERNAL_NON_BILLING');
    expect(state.plan).toBeNull();
    expect(state.planStatus).toBe('NOT_APPLICABLE');
  });

  it('NDXBOOK is a billable-eligible managed brand but has NO plan by default — never fabricated', async () => {
    const state = await resolveEvolveCommercialState('ndxbook');
    expect(state.applicability).toBe('BILLABLE_CLIENT');
    expect(state.plan).toBeNull();
    expect(state.planStatus).toBe('NOT_SELECTED');
  });

  it('AIO ("all-in-one-enterprises") is not enrolled in EVOLVE commercially by default', async () => {
    const state = await resolveEvolveCommercialState('all-in-one-enterprises');
    expect(state.applicability).toBe('BILLABLE_CLIENT');
    expect(state.plan).toBeNull();
    expect(state.planStatus).toBe('NOT_SELECTED');
  });

  it('no founder project (frontal-slayer, ndxbook, studio-world) carries a plan out of the box', async () => {
    for (const slug of ['frontal-slayer', 'ndxbook', 'studio-world']) {
      const state = await resolveEvolveCommercialState(slug);
      expect(state.plan).toBeNull();
    }
  });

  it('paid media is truthfully NOT_CONFIGURED, never implied to be running', async () => {
    const state = await resolveEvolveCommercialState('ndxbook');
    expect(state.paidMedia.status).toBe('NOT_CONFIGURED');
  });

  it('usage metering is truthfully NOT_AVAILABLE — no fabricated "12 of 16 assets used"', async () => {
    const state = await resolveEvolveCommercialState('ndxbook');
    expect(state.usageMetering).toBe('NOT_AVAILABLE');
  });

  it('billing is truthfully not integrated', async () => {
    const state = await resolveEvolveCommercialState('ndxbook');
    expect(state.billing.integrated).toBe(false);
    expect(state.billing.provider).toBe('NONE');
  });
});

describe('EVOLVE commercial state — after an explicit plan selection', () => {
  beforeEach(() => {
    resetEvolveStore();
  });

  it('selecting Growth for a managed brand reflects Growth entitlements, and only that org', async () => {
    await setEvolveCommercialPlan('all-in-one-enterprises', 'evolve_growth', 'founder@site00.com');
    const state = await resolveEvolveCommercialState('all-in-one-enterprises');
    expect(state.plan?.id).toBe('evolve_growth');
    expect(state.planStatus).toBe('ACTIVE');
    expect(state.entitlements?.channelLimit).toBe(3);
    expect(state.entitlements?.assetCapacity).toEqual({ min: 12, max: 16 });

    const untouched = await resolveEvolveCommercialState('ndxbook');
    expect(untouched.plan).toBeNull();
  });
});

describe('EVOLVE commercial state — governance separation', () => {
  beforeEach(() => {
    resetEvolveStore();
    resetNdxbookImportMemory();
  });

  it('assigning a commercial plan does not approve Creative Direction, Visual DNA, or Page 001', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    await setEvolveCommercialPlan('ndxbook', 'evolve_studio', 'founder@site00.com');

    const cd = await getCreativeDirectionPayload('ndxbook');
    expect(cd.engagement.visualDna.status).not.toBe('APPROVED');
    expect(cd.engagement.founderDecision).toBeNull();
    expect(cd.engagement.page001Gate.visualDnaApproved).toBe(false);
    expect(cd.engagement.page001Gate.productionEligible).toBe(false);
  });

  it('commercial state resolution never mutates Content Brain or Creative Direction engagement state', async () => {
    const before = await getCreativeDirectionPayload('ndxbook');
    await resolveEvolveCommercialState('ndxbook');
    await resolveEvolveCommercialState('ndxbook');
    const after = await getCreativeDirectionPayload('ndxbook');
    expect(after.engagement.lifecycle_state).toBe(before.engagement.lifecycle_state);
    expect(after.engagement.visualDna.status).toBe(before.engagement.visualDna.status);
  });
});
