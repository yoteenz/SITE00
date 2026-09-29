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
  resolveIdentityProductionPipelineId,
  validateIdentityIntakePayload,
} from './pipeline.js';
import { identityTierPurchaseBlockedByFounderDecision } from './founderDecisionGate.js';
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
    implementation: 'WIRED',
    validateIntake: (_ctx, payload) => {
      const r = validateIdentityIntakePayload(payload);
      return { ok: r.ok, errors: r.errors };
    },
    createProject: (ctx) => {
      const snap = snapshotFor(ctx);
      const projectId = snap?.projectId ?? ctx.projectId;
      if (identityTierPurchaseBlockedByFounderDecision({
        serviceId: ctx.serviceId,
        packageId: ctx.packageId,
        commercialMode: snap?.commercialMode ?? 'CUSTOM_QUOTE',
      }) && !projectId) {
        return {
          projectId: null,
          notes: 'FD-IDNTY-TIER-PURCHASE blocks automatic tier project bootstrap until founder resolves purchase mapping',
        };
      }
      return {
        projectId,
        notes: projectId
          ? 'Identity project linked via commercial bootstrap'
          : 'Awaiting authorization and intake submit activation',
      };
    },
    provisionEntitlements: (ctx) => {
      const pkg = getCanonicalPackage(ctx.serviceId, ctx.packageId);
      const contract = identityFulfillmentContract(ctx.serviceId, ctx.packageId);
      const revisionCap = contract.scopeLimits.revisions;
      const conceptCap = contract.scopeLimits.concepts;
      const enforced =
        typeof revisionCap === 'number' || typeof conceptCap === 'number' ? 'numeric caps wired' : 'founder-defined limits only';
      return {
        entitlementId: pkg?.entitlementTemplateId ?? 'identity',
        notes: `Identity entitlements: ${enforced}`,
      };
    },
    openWorkspace: (ctx) => ({ route: identityWorkspaceRoute(ctx) }),
    resolveProductionPipeline: (ctx) => ({ pipelineId: resolveIdentityProductionPipelineId(ctx) }),
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
