/**
 * identity-fulfillment adapter — backed by IdentityProductionSnapshot + canonical contracts.
 */

import type { ServiceFulfillmentAdapter } from '../site00-commercial-canon/fulfillmentAdapter.js';
import type { ProjectBootstrapContext } from '../site00-commercial-canon/types.js';
import { getCanonicalPackage } from '../site00-commercial-canon/serviceCatalog.js';
import { identityFulfillmentContract } from './contract.js';
import {
  identityCompletionState,
  identityWorkspaceRoute,
  mapSnapshotToFulfillmentStatus,
  validateIdentityIntakePayload,
} from './pipeline.js';
import { getIdentityProductionSnapshot } from './runtimeStore.js';
import { recordHumanIdentityApproval } from './pipeline.js';

function snapshotFor(ctx: ProjectBootstrapContext) {
  return getIdentityProductionSnapshot(ctx.commercialRecordId);
}

export function createIdentityFulfillmentAdapter(): ServiceFulfillmentAdapter & {
  implementation: 'PARTIAL' | 'WIRED';
} {
  return {
    id: 'identity-fulfillment',
    family: 'IDENTITY',
    implementation: 'PARTIAL',
    validateIntake: (_ctx, payload) => {
      const r = validateIdentityIntakePayload(payload);
      return { ok: r.ok, errors: r.errors };
    },
    createProject: (ctx) => {
      const snap = snapshotFor(ctx);
      return {
        projectId: snap?.projectId ?? ctx.projectId,
        notes: snap?.projectId
          ? 'Identity project linked via commercial bootstrap'
          : 'Awaiting admin/founder project activation from authorized intake',
      };
    },
    provisionEntitlements: (ctx) => {
      const pkg = getCanonicalPackage(ctx.serviceId, ctx.packageId);
      return {
        entitlementId: pkg?.entitlementTemplateId ?? 'identity',
        notes: 'Scope limits enforced only when contract defines numeric caps',
      };
    },
    openWorkspace: (ctx) => ({ route: identityWorkspaceRoute(ctx) }),
    resolveProductionPipeline: () => ({ pipelineId: 'identity-brand-discovery' }),
    getClientStatus: (ctx) => mapSnapshotToFulfillmentStatus(snapshotFor(ctx)),
    getRequiredReviews: () => ['CLIENT_REVIEW', 'HUMAN_APPROVAL'],
    getDeliverables: (ctx) => {
      const snap = snapshotFor(ctx);
      if (!snap) return [];
      return snap.deliverables.map((d) => ({
        deliverableId: d.deliverableId,
        projectId: d.projectId,
        serviceId: d.serviceId,
        packageId: d.packageId,
        version: d.version,
        reviewStatus: d.reviewStatus,
        deliveryStatus: d.deliveryStatus,
        completionCriteriaRef: d.completionCriteriaRef,
      }));
    },
    getCompletionState: (ctx) => identityCompletionState(snapshotFor(ctx)),
  };
}

/** Test helper — simulate approval path without DB */
export function simulateIdentityApprovalForTests(
  commercialRecordId: string,
  approvedBy: string,
  artifactIds: string[],
): void {
  const snap = getIdentityProductionSnapshot(commercialRecordId);
  if (!snap) throw new Error('No snapshot');
  recordHumanIdentityApproval(snap, { approvedBy, approvedArtifactIds: artifactIds });
}

export function resolveIdentityFulfillmentContract(serviceId: string, packageId: string) {
  return identityFulfillmentContract(serviceId, packageId);
}
