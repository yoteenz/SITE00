/**
 * Register fulfillment adapters (formalize existing pipelines — do not duplicate Marketing sprint).
 */

import type { ServiceFulfillmentAdapter } from '../fulfillmentAdapter.js';
import { registerFulfillmentAdapter } from '../fulfillmentAdapter.js';
import type { FulfillmentStatus, ProjectBootstrapContext } from '../types.js';
import { createIdentityFulfillmentAdapter } from '../../site00-identity-commercial/adapter.js';

function partialAdapter(
  id: string,
  family: ServiceFulfillmentAdapter['family'],
  pipelineId: string,
  workspaceRoute: (ctx: ProjectBootstrapContext) => string | null,
  notes: string,
): ServiceFulfillmentAdapter {
  const baseStatus: FulfillmentStatus = 'INTAKE';
  return {
    id,
    family,
    validateIntake: () => ({ ok: true, errors: [] }),
    createProject: () => ({ projectId: null, notes }),
    provisionEntitlements: () => ({ entitlementId: null, notes }),
    openWorkspace: (ctx) => ({ route: workspaceRoute(ctx) }),
    resolveProductionPipeline: () => ({ pipelineId }),
    getClientStatus: () => baseStatus,
    getRequiredReviews: () => ['CLIENT_APPROVAL'],
    getDeliverables: () => [],
    getCompletionState: () => 'NOT_STARTED',
  };
}

export function registerAllSite00FulfillmentAdapters(): void {
  registerFulfillmentAdapter(createIdentityFulfillmentAdapter());

  registerFulfillmentAdapter({
    ...partialAdapter(
      'builder-simple-fulfillment',
      'BUILDER_SIMPLE',
      'bldr-site-studio-pipeline',
      (ctx) => (ctx.projectId ? `/studio/${ctx.projectId}` : '/project/:slug/provisioning'),
      'Studio/provisioning wired; page/revision limits not enforced yet',
    ),
    implementation: 'PARTIAL',
  });

  registerFulfillmentAdapter({
    ...partialAdapter(
      'builder-custom-world-fulfillment',
      'BUILDER_CUSTOM_WORLD',
      'design-workspace-page-system',
      (ctx) => (ctx.projectId ? `/production/${ctx.projectId.toLowerCase()}/design` : null),
      'Design workspace route canonical; premium scope FOUNDER_DECISION_REQUIRED',
    ),
    implementation: 'PARTIAL',
  });

  registerFulfillmentAdapter({
    id: 'marketing-campaign-fulfillment',
    family: 'MARKETING_CAMPAIGN',
    validateIntake: () => ({ ok: true, errors: [] }),
    createProject: () => ({
      projectId: null,
      notes: 'Marketing engagement record — site00_marketing_engagements',
    }),
    provisionEntitlements: () => ({
      entitlementId: 'commercial_state',
      notes: 'PR #1249 ensureCommercialOnPayment / ensureCommercialOnProvision',
    }),
    openWorkspace: () => ({ route: '/evolve/marketing/engagement/:engagementId' }),
    resolveProductionPipeline: () => ({ pipelineId: 'studio-world-marketing-adapter' }),
    getClientStatus: () => 'IN_PRODUCTION',
    getRequiredReviews: () => ['DIRECTION', 'DELIVERABLE'],
    getDeliverables: () => [],
    getCompletionState: () => 'IN_PRODUCTION',
    implementation: 'PARTIAL',
  });

  registerFulfillmentAdapter({
    ...partialAdapter(
      'recurring-retainer-fulfillment',
      'RECURRING_RETAINER',
      'evolve-os-recurring-capacity',
      (ctx) => (ctx.projectId ? `/projects/${ctx.projectId}/evolve` : '/control/evolve-operations'),
      'Catalog + admin assign; capacity enforcement INFORMATIONAL only',
    ),
    implementation: 'PARTIAL',
  });

  registerFulfillmentAdapter({
    ...partialAdapter(
      'custom-quote-fulfillment',
      'CUSTOM_QUOTE',
      'quote-scope-activation',
      () => '/contact',
      'Quote → approval → activation path; no fixed checkout',
    ),
    implementation: 'PARTIAL',
  });

  registerFulfillmentAdapter({
    id: 'add-on-fulfillment',
    family: 'ADD_ON',
    validateIntake: () => ({ ok: false, errors: ['Add-ons require parentProjectId or parentEntitlementId'] }),
    createProject: () => ({ projectId: null, notes: 'Must attach to parent context' }),
    provisionEntitlements: () => ({ entitlementId: null, notes: 'commercial-test-addon / credit increment' }),
    openWorkspace: (ctx) => ({
      route: ctx.projectId ? `/evolve/marketing/engagement/${ctx.commercialRecordId}` : null,
    }),
    resolveProductionPipeline: () => ({ pipelineId: 'modular-production-engine-add-on' }),
    getClientStatus: () => 'AWAITING_CLIENT',
    getRequiredReviews: () => [],
    getDeliverables: () => [],
    getCompletionState: () => 'NOT_STARTED',
    implementation: 'PARTIAL',
  });

  registerFulfillmentAdapter({
    ...partialAdapter(
      'evolve-platform-fulfillment',
      'EVOLVE_PLATFORM',
      'evolve-path-assessment',
      () => '/evolve/state',
      'Discovery assessments only — not a sellable checkout SKU',
    ),
    implementation: 'MISSING',
  });
}
