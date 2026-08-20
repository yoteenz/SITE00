/** Publication dry run — full internal pipeline, ZERO provider writes */

import { orgIdFromSlug } from '../orgRegistry.js';
import { ensurePilotConfig, listSafeConnections } from './connectionService.js';
import { isGlobalPublishingEnabled, publishingFenceState } from './publishingFence.js';
import { getProviderOAuthConfig } from './oauthService.js';
import { validateSecretStoreConfiguration } from './providerSecretStore.js';
import type { ExternalConnectionRow } from './types.js';
import * as db from './connectionStore.js';
import { useMemoryConnections } from './connectionService.js';

export type DryRunBlockReason =
  | 'BLOCKED_GLOBAL_PUBLISHING_FENCE'
  | 'BLOCKED_ORGANIZATION_PUBLISHING_FENCE'
  | 'BLOCKED_APPROVAL_REQUIRED'
  | 'BLOCKED_ACCOUNT_CONFIRMATION_REQUIRED'
  | 'CROSS_ORG_DENIED'
  | 'REQUIRES_OWNER_CONFIGURATION'
  | 'REQUIRES_SECURE_CONFIGURATION';

export type DryRunResult = {
  status: 'DRY_RUN_COMPLETE' | 'DRY_RUN_BLOCKED';
  wouldPublish: false;
  providerWriteCalled: false;
  blockReason?: DryRunBlockReason;
  preview?: {
    provider: string;
    targetAccount: string | null;
    contentType: string;
    caption: string | null;
    assetRefs: string[];
    scheduledIntent: string;
    lineage: Record<string, unknown>;
    approvalState: string;
    fenceStates: Record<string, unknown>;
  };
};

async function loadConnection(connectionId: string, orgId: string): Promise<ExternalConnectionRow | undefined> {
  if (useMemoryConnections()) {
    const { memConnections } = await import('./connectionService.js');
    return memConnections.find((c) => c.id === connectionId && c.organization_id === orgId) as ExternalConnectionRow | undefined;
  }
  return db.loadConnectionById(connectionId, orgId);
}

export async function runPublicationDryRun(
  orgSlug: string,
  opts: {
    connectionId: string;
    caption?: string;
    assetRefs?: string[];
    approvalState?: string;
    campaignId?: string;
    calendarItemId?: string;
    organizationIdOverride?: string;
  },
): Promise<DryRunResult> {
  const orgId = opts.organizationIdOverride ?? orgIdFromSlug(orgSlug)!;
  const expectedOrgId = orgIdFromSlug(orgSlug)!;
  if (orgId !== expectedOrgId) {
    return { status: 'DRY_RUN_BLOCKED', wouldPublish: false, providerWriteCalled: false, blockReason: 'CROSS_ORG_DENIED' };
  }

  const pilot = await ensurePilotConfig(orgSlug);
  const globalFence = isGlobalPublishingEnabled();
  const orgFence = publishingFenceState(String(pilot.publishing_status) as 'DISABLED');

  if (!globalFence) {
    return { status: 'DRY_RUN_BLOCKED', wouldPublish: false, providerWriteCalled: false, blockReason: 'BLOCKED_GLOBAL_PUBLISHING_FENCE' };
  }
  if (!orgFence.orgEnabled) {
    return { status: 'DRY_RUN_BLOCKED', wouldPublish: false, providerWriteCalled: false, blockReason: 'BLOCKED_ORGANIZATION_PUBLISHING_FENCE' };
  }

  const connection = await loadConnection(opts.connectionId, orgId);
  if (!connection) {
    return { status: 'DRY_RUN_BLOCKED', wouldPublish: false, providerWriteCalled: false, blockReason: 'CROSS_ORG_DENIED' };
  }

  if (!connection.account_confirmed_at && !(connection.metadata as Record<string, unknown>)?.account_confirmed_at) {
    return { status: 'DRY_RUN_BLOCKED', wouldPublish: false, providerWriteCalled: false, blockReason: 'BLOCKED_ACCOUNT_CONFIRMATION_REQUIRED' };
  }

  const approval = opts.approvalState ?? 'DRAFT';
  if (approval !== 'APPROVED') {
    return { status: 'DRY_RUN_BLOCKED', wouldPublish: false, providerWriteCalled: false, blockReason: 'BLOCKED_APPROVAL_REQUIRED' };
  }

  const oauthCfg = getProviderOAuthConfig(String(connection.provider_key));
  const secretCfg = validateSecretStoreConfiguration();

  return {
    status: 'DRY_RUN_COMPLETE',
    wouldPublish: false,
    providerWriteCalled: false,
    preview: {
      provider: String(connection.provider_key),
      targetAccount: connection.external_account_name,
      contentType: 'SOCIAL_POST',
      caption: opts.caption ?? null,
      assetRefs: opts.assetRefs ?? [],
      scheduledIntent: 'IMMEDIATE',
      lineage: {
        campaignId: opts.campaignId ?? null,
        calendarItemId: opts.calendarItemId ?? null,
        organizationSlug: orgSlug,
      },
      approvalState: approval,
      fenceStates: {
        global: globalFence,
        organization: orgFence,
        oauthConfigured: oauthCfg.configured,
        secretStoreConfigured: secretCfg.configured,
      },
    },
  };
}

/** Fence test helper — simulates publish attempt without provider call */
export async function attemptExternalPublish(
  orgSlug: string,
  connectionId: string,
  approvalState: string,
): Promise<{ ok: boolean; blockReason?: DryRunBlockReason }> {
  const result = await runPublicationDryRun(orgSlug, { connectionId, approvalState });
  if (result.status === 'DRY_RUN_BLOCKED') return { ok: false, blockReason: result.blockReason };
  return { ok: false, blockReason: 'BLOCKED_GLOBAL_PUBLISHING_FENCE' };
}
