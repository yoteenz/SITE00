/**
 * P0.SITE00-IDENTITY-COMMERCIAL-FULFILLMENT-INTEGRATION1
 */

import { describe, expect, it, beforeEach } from 'vitest';

import {
  appendIdentityCommercialQuery,
  commercialBlockFromDraftPayload,
  mergeCommercialIntoDraftPayload,
  parseIdentityCommercialSearchParams,
} from '../shared/site00-identity-commercial/ctaContext.js';
import { identityFulfillmentContract } from '../shared/site00-identity-commercial/contract.js';
import {
  authorizeIdentityCommercial,
  bootstrapIdentityProjectContext,
  guardBuilderIdentityAuthority,
  hydrateSnapshotFromCommercialState,
  identityCustomQuoteRequiresFixedCheckout,
  initialIdentityCommercialState,
  recordHumanIdentityApproval,
  recordIdentityRevisionRequest,
  seedProductionSnapshot,
  validateIdentityIntakePayload,
  attachIdentityProjectToSnapshot,
  identityCompletionState,
  transitionReviewState,
} from '../shared/site00-identity-commercial/pipeline.js';
import { clearIdentityRuntimeStore, getIdentityProductionSnapshot } from '../shared/site00-identity-commercial/runtimeStore.js';
import { listIdentityCommercialPackages } from '../shared/site00-identity-commercial/inventory.js';
import { createIdentityFulfillmentAdapter, simulateIdentityApprovalForTests } from '../shared/site00-identity-commercial/adapter.js';
import {
  deriveClientStatusFromAdapter,
  getCanonicalPackage,
  getSite00ServiceCatalog,
  intakeContextFromPackage,
  isServicePaymentReady,
  packageContextSurvivesIntakeToProject,
} from '../shared/site00-commercial-canon/index.js';
import { isBlockedAutomatedApprover } from '../shared/site00-identity/identityFields.js';

describe('P0.SITE00-IDENTITY-COMMERCIAL-FULFILLMENT-INTEGRATION1', () => {
  beforeEach(() => {
    clearIdentityRuntimeStore();
  });

  it('1 Identity CTA preserves service/package context in URL + draft', () => {
    const href = appendIdentityCommercialQuery('/idnty/state', {
      serviceId: 'services-hub-branding',
      packageId: 'services-hub-branding',
      commercialMode: 'CUSTOM_QUOTE',
    });
    expect(href).toContain('serviceId=services-hub-branding');
    expect(href).toContain('packageId=services-hub-branding');
    const parsed = parseIdentityCommercialSearchParams(href.split('?')[1] ?? '');
    expect(parsed.serviceId).toBe('services-hub-branding');
    const draft = mergeCommercialIntoDraftPayload({ answers: {} }, parsed);
    expect(commercialBlockFromDraftPayload(draft)?.packageId).toBe('services-hub-branding');
  });

  it('2 Identity intake resolves correct tier package from query', () => {
    const parsed = parseIdentityCommercialSearchParams('?tier=foundation');
    expect(parsed.serviceId).toBe('idnty-investment-tiers');
    expect(parsed.packageId).toBe('foundation');
    const pkg = getCanonicalPackage(parsed.serviceId, parsed.packageId);
    expect(pkg?.fulfillmentContract.includedDeliverables).toContain('LOGO');
  });

  it('3 intake validation requires commercial block', () => {
    expect(validateIdentityIntakePayload({}).ok).toBe(false);
    expect(
      validateIdentityIntakePayload(
        mergeCommercialIntoDraftPayload({}, {
          serviceId: 'services-hub-branding',
          packageId: 'services-hub-branding',
          commercialMode: 'CUSTOM_QUOTE',
        }),
      ).ok,
    ).toBe(true);
  });

  it('4 project bootstrap references canonical fulfillment contract', () => {
    const pkg = getCanonicalPackage('idnty-investment-tiers', 'evolve')!;
    const intake = intakeContextFromPackage(pkg);
    const ctx = bootstrapIdentityProjectContext({
      intake,
      commercialRecordId: 'intake-1',
      clientId: 'client@example.com',
      projectId: 'proj-1',
      projectSlug: 'idnty-evolve',
    });
    expect(ctx.fulfillmentAdapterId).toBe('identity-fulfillment');
    expect(ctx.serviceId).toBe('idnty-investment-tiers');
    expect(pkg.fulfillmentContract.includedDeliverables).toContain('REBRANDING');
  });

  it('5 Identity adapter opens identity workspace route when project slug present', () => {
    const adapter = createIdentityFulfillmentAdapter();
    seedProductionSnapshot({
      intakeId: 'intake-ws',
      clientId: 'c1',
      selection: { serviceId: 'services-hub-branding', packageId: 'services-hub-branding', commercialMode: 'CUSTOM_QUOTE' },
      draftPayload: { commercial: { serviceId: 'services-hub-branding', packageId: 'services-hub-branding' } },
    });
    attachIdentityProjectToSnapshot(getIdentityProductionSnapshot('intake-ws')!, {
      projectId: 'p1',
      projectSlug: 'northquarter-idnty',
    });
    const route = adapter.openWorkspace({
      clientId: 'c1',
      brandId: null,
      serviceId: 'services-hub-branding',
      packageId: 'services-hub-branding',
      commercialRecordId: 'intake-ws',
      projectType: 'IDENTITY',
      projectId: 'p1',
      fulfillmentAdapterId: 'identity-fulfillment',
      endClientId: null,
    }).route;
    expect(route).toBe('/projects/northquarter-idnty/identity');
  });

  it('6 intake handoff data enters production snapshot', () => {
    const snap = seedProductionSnapshot({
      intakeId: 'intake-handoff',
      clientId: 'c1',
      selection: { serviceId: 'services-hub-branding', packageId: 'services-hub-branding', commercialMode: 'CUSTOM_QUOTE' },
      draftPayload: { loreAnswers: { feeling: 'trust' }, commercial: { serviceId: 'services-hub-branding', packageId: 'services-hub-branding' } },
    });
    expect(snap.intakeHandoff.loreAnswers).toEqual({ feeling: 'trust' });
    expect(snap.intakeHandoff.commercial).toBeUndefined();
  });

  it('7 package deliverable classes defined for tier without inventing concept caps', () => {
    const contract = identityFulfillmentContract('idnty-investment-tiers', 'foundation');
    expect(contract.scopeLimits.concepts).toBe('FOUNDER_DECISION_REQUIRED');
    expect(contract.includedDeliverables.length).toBe(3);
  });

  it('8 review state persists on snapshot', () => {
    const snap = seedProductionSnapshot({
      intakeId: 'rev-1',
      clientId: 'c1',
      selection: { serviceId: 'services-hub-branding', packageId: 'services-hub-branding', commercialMode: 'CUSTOM_QUOTE' },
      draftPayload: {},
    });
    transitionReviewState(snap, 'CLIENT_REVIEWING');
    expect(getIdentityProductionSnapshot('rev-1')?.review).toBe('CLIENT_REVIEWING');
  });

  it('9 revision state persists with cycle count', () => {
    const snap = seedProductionSnapshot({
      intakeId: 'rev-2',
      clientId: 'c1',
      selection: { serviceId: 'services-hub-branding', packageId: 'services-hub-branding', commercialMode: 'CUSTOM_QUOTE' },
      draftPayload: {},
    });
    const updated = recordIdentityRevisionRequest(snap, { requestedBy: 'client@example.com', note: 'Adjust palette' });
    expect(updated.review).toBe('REVISION_REQUESTED');
    expect(updated.entitlementUsage.revisionCyclesUsed).toBe(1);
    expect(getIdentityProductionSnapshot('rev-2')?.revisions).toHaveLength(1);
  });

  it('10 approval requires human action — automated approver blocked', () => {
    const snap = seedProductionSnapshot({
      intakeId: 'appr-1',
      clientId: 'c1',
      selection: { serviceId: 'services-hub-branding', packageId: 'services-hub-branding', commercialMode: 'CUSTOM_QUOTE' },
      draftPayload: {},
    });
    const blocked = [...(typeof isBlockedAutomatedApprover === 'function' ? ['cursor-agent', 'AI'] : [])].find((id) =>
      isBlockedAutomatedApprover(id),
    );
    expect(blocked).toBeTruthy();
    expect(() =>
      recordHumanIdentityApproval(snap, { approvedBy: blocked!, approvedArtifactIds: ['art-1'] }),
    ).toThrow();
    recordHumanIdentityApproval(snap, { approvedBy: 'founder@site00.com', approvedArtifactIds: ['art-1'] });
    expect(getIdentityProductionSnapshot('appr-1')?.deliverables[0]?.reviewStatus).toBe('APPROVED');
  });

  it('11 approved artifacts create IdentityDeliverable', () => {
    seedProductionSnapshot({
      intakeId: 'appr-dlv',
      clientId: 'c1',
      selection: { serviceId: 'services-hub-branding', packageId: 'services-hub-branding', commercialMode: 'CUSTOM_QUOTE' },
      draftPayload: {},
    });
    simulateIdentityApprovalForTests('appr-dlv', 'founder@site00.com', ['logo-v1']);
    const d = getIdentityProductionSnapshot('appr-dlv')?.deliverables[0];
    expect(d?.approvedArtifactIds).toContain('logo-v1');
  });

  it('12 completion requires deliverables not assets alone', () => {
    const snap = seedProductionSnapshot({
      intakeId: 'cmp-1',
      clientId: 'c1',
      selection: { serviceId: 'services-hub-branding', packageId: 'services-hub-branding', commercialMode: 'CUSTOM_QUOTE' },
      draftPayload: {},
    });
    expect(identityCompletionState(snap)).not.toBe('COMPLETE');
    recordHumanIdentityApproval(snap, { approvedBy: 'founder@site00.com', approvedArtifactIds: ['final'] });
    const after = getIdentityProductionSnapshot('cmp-1')!;
    expect(identityCompletionState(after)).toBe('COMPLETE');
  });

  it('13 client status derives from adapter fulfillment status', () => {
    const adapter = createIdentityFulfillmentAdapter();
    expect(adapter.getClientStatus).toBeDefined();
    seedProductionSnapshot({
      intakeId: 'st-1',
      clientId: 'c1',
      selection: { serviceId: 'services-hub-branding', packageId: 'services-hub-branding', commercialMode: 'CUSTOM_QUOTE' },
      draftPayload: {},
    });
    const derived = deriveClientStatusFromAdapter({
      clientId: 'c1',
      brandId: null,
      serviceId: 'services-hub-branding',
      packageId: 'services-hub-branding',
      commercialRecordId: 'st-1',
      projectType: 'IDENTITY',
      projectId: null,
      fulfillmentAdapterId: 'identity-fulfillment',
      endClientId: null,
    });
    expect(derived.clientLabel).toMatch(/INTAKE|PRODUCTION|REVIEW|READY/i);
  });

  it('14 approved Identity can attach to Builder authority', () => {
    seedProductionSnapshot({
      intakeId: 'bldr-handoff',
      clientId: 'c1',
      selection: { serviceId: 'services-hub-branding', packageId: 'services-hub-branding', commercialMode: 'CUSTOM_QUOTE' },
      draftPayload: {},
    });
    simulateIdentityApprovalForTests('bldr-handoff', 'founder@site00.com', ['logo-v1']);
    let snap = getIdentityProductionSnapshot('bldr-handoff')!;
    snap = attachIdentityProjectToSnapshot(snap, { projectId: 'p1', projectSlug: 'slug-1' });
    const guard = guardBuilderIdentityAuthority(snap);
    expect(guard.ok).toBe(true);
    expect(guard.authority?.projectSlug).toBe('slug-1');
  });

  it('15 unapproved Identity cannot become Builder authority', () => {
    const snap = seedProductionSnapshot({
      intakeId: 'unappr',
      clientId: 'c1',
      selection: { serviceId: 'services-hub-branding', packageId: 'services-hub-branding', commercialMode: 'CUSTOM_QUOTE' },
      draftPayload: {},
    });
    expect(guardBuilderIdentityAuthority(snap).ok).toBe(false);
  });

  it('16 custom-quote Identity does not require fixed checkout', () => {
    expect(
      identityCustomQuoteRequiresFixedCheckout({
        serviceId: 'idnty-investment-tiers',
        packageId: 'foundation',
        commercialMode: 'CUSTOM_QUOTE',
      }),
    ).toBe(false);
  });

  it('17 catalog resolves Identity packages from single canonical source', () => {
    getSite00ServiceCatalog();
    const packages = listIdentityCommercialPackages();
    expect(packages.length).toBeGreaterThanOrEqual(5);
    for (const row of packages) {
      expect(getCanonicalPackage(row.serviceId, row.packageId)?.family).toBe('IDENTITY');
    }
  });

  it('18 payment readiness cannot pass while quote + founder gaps remain', () => {
    const pay = isServicePaymentReady('services-hub-branding');
    expect(pay.ready).toBe(false);
    expect(pay.reasons.length).toBeGreaterThan(0);
  });

  it('package context survives intake → project bootstrap merge', () => {
    const pkg = getCanonicalPackage('services-hub-branding')!;
    const intake = intakeContextFromPackage(pkg);
    const project = bootstrapIdentityProjectContext({
      intake,
      commercialRecordId: 'x',
      clientId: 'c',
    });
    expect(packageContextSurvivesIntakeToProject(intake, project)).toBe(true);
  });

  it('commercial authorization state seeds from intake commercial selection', () => {
    const state = initialIdentityCommercialState({
      serviceId: 'idnty-investment-tiers',
      packageId: 'refine',
      commercialMode: 'CUSTOM_QUOTE',
    });
    const authorized = authorizeIdentityCommercial(state, { authorizationRef: 'quote-1' });
    expect(authorized.authorization.status).toBe('AUTHORIZED');
    hydrateSnapshotFromCommercialState('intake-auth', authorized, {
      commercial: { serviceId: 'idnty-investment-tiers', packageId: 'refine' },
    });
    expect(getIdentityProductionSnapshot('intake-auth')?.authorization.status).toBe('AUTHORIZED');
  });
});
