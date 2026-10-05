/**
 * P0.SITE00-IDENTITY-COMMERCIAL-FULFILLMENT-CLOSEOUT1
 */

import { describe, expect, it, beforeEach } from 'vitest';

import {
  activateIdentityCommercialAfterIntakeSubmit,
  applyFounderDecisionBlockToSnapshot,
} from '../shared/site00-identity-commercial/activation.js';
import { createIdentityFulfillmentAdapter } from '../shared/site00-identity-commercial/adapter.js';
import { identityFounderDecisionReceipt } from '../shared/site00-identity-commercial/founderDecisionGate.js';
import { mergeCommercialIntoDraftPayload } from '../shared/site00-identity-commercial/ctaContext.js';
import {
  authorizeIdentityCommercial,
  initialIdentityCommercialState,
  mapSnapshotToFulfillmentStatus,
  seedProductionSnapshot,
} from '../shared/site00-identity-commercial/pipeline.js';
import { clearIdentityRuntimeStore, getIdentityProductionSnapshot } from '../shared/site00-identity-commercial/runtimeStore.js';
import { isServicePaymentReady, listFulfillmentAdapters } from '../shared/site00-commercial-canon/index.js';
import { IDENTITY_TIER_PACKAGE_IDS } from '../shared/site00-identity-commercial/inventory.js';

describe('P0 Identity commercial closeout', () => {
  beforeEach(() => {
    clearIdentityRuntimeStore();
  });

  it('Part 1 — surfaces FD-IDNTY-TIER-PURCHASE without guessing founder answer', () => {
    const receipt = identityFounderDecisionReceipt();
    expect(receipt?.decisionId).toBe('FD-IDNTY-TIER-PURCHASE');
    expect(receipt?.question).toMatch(/IDNTY investment tiers/i);
  });

  it('Part 2/3 — hub branding intake activates to authorized state with bootstrap linkage fields', async () => {
    const draft = mergeCommercialIntoDraftPayload(
      { businessName: 'North Quarter' },
      { serviceId: 'services-hub-branding', packageId: 'services-hub-branding', commercialMode: 'CUSTOM_QUOTE' },
    );
    const intake = {
      id: 'intake-hub-1',
      email: 'client@example.com',
      projectId: null as string | null,
      draftPayload: draft,
    };
    let saved: ReturnType<typeof initialIdentityCommercialState> | null = null;
    const result = await activateIdentityCommercialAfterIntakeSubmit(intake, {
      ensureCommercial: async () => {
        saved = initialIdentityCommercialState(
          { serviceId: 'services-hub-branding', packageId: 'services-hub-branding', commercialMode: 'CUSTOM_QUOTE' },
          { intakeId: intake.id, clientId: intake.email, brandId: 'North Quarter' },
        );
        seedProductionSnapshot({
          intakeId: intake.id,
          clientId: intake.email!,
          selection: saved.selection,
          draftPayload: draft,
        });
        return saved;
      },
      authorizeCommercial: async (_i, ref) => {
        saved = authorizeIdentityCommercial(saved!, { authorizationRef: ref });
        return saved;
      },
      convertToProject: async () => ({
        projectId: 'proj-hub-1',
        projectSlug: 'idnty-north-quarter-abc',
        created: true,
      }),
      saveState: async (_id, state) => {
        saved = state;
      },
    });
    expect(result.ok).toBe(true);
    expect(result.founderDecisionBlocked).toBe(false);
    expect(result.projectCreated).toBe(true);
    expect(saved?.bootstrap.fulfillmentContractId).toBe('services-hub-branding:services-hub-branding');
    expect(saved?.bootstrap.commercialRecordId).toBe('intake-hub-1');
    expect(saved?.bootstrap.clientId).toBe('client@example.com');
  });

  it('Part 2 — tier intake stays blocked by founder decision (no auto project)', async () => {
    const draft = mergeCommercialIntoDraftPayload(
      {},
      { serviceId: 'idnty-investment-tiers', packageId: 'foundation', commercialMode: 'CUSTOM_QUOTE' },
    );
    const intake = { id: 'intake-tier-1', email: 'c@x.com', projectId: null, draftPayload: draft };
    let saved = initialIdentityCommercialState(
      { serviceId: 'idnty-investment-tiers', packageId: 'foundation', commercialMode: 'CUSTOM_QUOTE' },
      { intakeId: intake.id, clientId: intake.email },
    );
    seedProductionSnapshot({
      intakeId: intake.id,
      clientId: intake.email,
      selection: saved.selection,
      draftPayload: draft,
    });
    const result = await activateIdentityCommercialAfterIntakeSubmit(intake, {
      ensureCommercial: async () => saved,
      authorizeCommercial: async (_i, ref) => {
        saved = authorizeIdentityCommercial(saved, { authorizationRef: ref });
        return saved;
      },
      convertToProject: async () => {
        throw new Error('convert should not run for tier founder block');
      },
      saveState: async (_id, state) => {
        saved = state;
      },
    });
    expect(result.founderDecisionBlocked).toBe(true);
    expect(result.founderDecisionId).toBe('FD-IDNTY-TIER-PURCHASE');
    expect(saved.bootstrap.blockedByFounderDecisionId).toBe('FD-IDNTY-TIER-PURCHASE');
    expect(getIdentityProductionSnapshot('intake-tier-1')?.founderDecisionBlockId).toBe('FD-IDNTY-TIER-PURCHASE');
    expect(mapSnapshotToFulfillmentStatus(getIdentityProductionSnapshot('intake-tier-1'))).toBe('BLOCKED');
  });

  it('Part 4 — identity adapter registered WIRED with pipeline resolver', () => {
    const adapter = listFulfillmentAdapters().find((a) => a.id === 'identity-fulfillment');
    expect(adapter?.implementation).toBe('WIRED');
    const created = createIdentityFulfillmentAdapter();
    expect(created.resolveProductionPipeline({
      clientId: 'c',
      brandId: null,
      serviceId: 'services-hub-branding',
      packageId: 'services-hub-branding',
      commercialRecordId: 'x',
      projectType: 'IDENTITY',
      projectId: null,
      fulfillmentAdapterId: 'identity-fulfillment',
      endClientId: null,
    }).pipelineId).toBe('identity-brand-discovery');
  });

  it('Part 8 — custom quote tiers do not require fixed checkout', async () => {
    const { identityCustomQuoteRequiresFixedCheckout } = await import('../shared/site00-identity-commercial/pipeline.js');
    expect(
      identityCustomQuoteRequiresFixedCheckout({
        serviceId: 'idnty-investment-tiers',
        packageId: 'foundation',
        commercialMode: 'CUSTOM_QUOTE',
      }),
    ).toBe(false);
  });

  it('Part 12 — payment readiness remains NOT_READY for Identity packages (honest)', () => {
    const hub = isServicePaymentReady('services-hub-branding');
    expect(hub.ready).toBe(false);
    for (const tierId of IDENTITY_TIER_PACKAGE_IDS) {
      const pay = isServicePaymentReady('idnty-investment-tiers', tierId);
      expect(pay.ready).toBe(false);
      expect(pay.reasons.length).toBeGreaterThan(0);
    }
  });

  it('founder block helper updates snapshot', () => {
    seedProductionSnapshot({
      intakeId: 'blk-1',
      clientId: 'c',
      selection: { serviceId: 'idnty-investment-tiers', packageId: 'refine', commercialMode: 'CUSTOM_QUOTE' },
      draftPayload: {},
    });
    applyFounderDecisionBlockToSnapshot('blk-1', 'FD-IDNTY-TIER-PURCHASE');
    expect(getIdentityProductionSnapshot('blk-1')?.founderDecisionBlockId).toBe('FD-IDNTY-TIER-PURCHASE');
  });
});
