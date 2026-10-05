/** Connection admin payloads — portfolio + organization views */

import { listMarketingOrgs } from '../evolveService.js';
import { isMarketingClientOrg } from '../seedFixtures.js';
import {
  ensurePilotConfig,
  getConnectionDetail,
  listProviderCatalog,
  listSafeConnections,
} from './connectionService.js';
import { adapterStatus, getProviderDefinition } from './registry.js';
import { publishingFenceState } from './publishingFence.js';
import type { ConnectionStatus, ProviderCategory } from './types.js';

export type ConnectionBucket = 'CONNECTED' | 'NEEDS_ATTENTION' | 'AVAILABLE' | 'DEFERRED' | 'NOT_REQUIRED';

function bucketConnection(status: ConnectionStatus, health: string): ConnectionBucket {
  if (status === 'CONNECTED' && health === 'HEALTHY') return 'CONNECTED';
  if (['AUTHORIZATION_REQUIRED', 'REAUTH_REQUIRED', 'ERROR', 'DEGRADED', 'PERMISSION_LIMITED'].includes(status)) {
    return 'NEEDS_ATTENTION';
  }
  if (status === 'NOT_CONNECTED' || status === 'DISCONNECTED') return 'AVAILABLE';
  return 'NEEDS_ATTENTION';
}

export async function getPortfolioConnectionsPayload() {
  const orgs = listMarketingOrgs().filter((o) => isMarketingClientOrg(o.classification));
  const groups = await Promise.all(
    orgs.map(async (org) => {
      const connections = await listSafeConnections(org.slug);
      const pilot = await ensurePilotConfig(org.slug);
      return {
        organizationSlug: org.slug,
        organizationName: org.name,
        publishingStatus: pilot.publishing_status,
        connections,
      };
    }),
  );
  return { groups, generatedAt: new Date().toISOString() };
}

export async function getOrgConnectionsPayload(orgSlug: string) {
  const connections = await listSafeConnections(orgSlug);
  const pilot = await ensurePilotConfig(orgSlug);
  const catalog = listProviderCatalog();
  const fence = publishingFenceState(String(pilot.publishing_status) as 'DISABLED');

  const buckets: Record<ConnectionBucket, typeof connections> = {
    CONNECTED: [],
    NEEDS_ATTENTION: [],
    AVAILABLE: [],
    DEFERRED: [],
    NOT_REQUIRED: [],
  };

  for (const c of connections) {
    buckets[bucketConnection(c.status, c.health)].push(c);
  }

  const connectedKeys = new Set(connections.map((c) => c.providerKey));
  const availableProviders = catalog.filter((p) => !connectedKeys.has(p.providerKey));

  return {
    organizationSlug: orgSlug,
    buckets,
    availableProviders,
    pilot: {
      pilotRole: pilot.pilot_role,
      automationMode: pilot.automation_mode,
      publishingStatus: pilot.publishing_status,
      providerStatus: pilot.provider_status,
      automationStatus: pilot.automation_status,
    },
    publishingFence: fence,
  };
}

export async function getConnectionWizardPayload(category?: ProviderCategory) {
  return {
    categories: ['ANALYTICS', 'SEARCH', 'EMAIL', 'SOCIAL', 'ADVERTISING'] as ProviderCategory[],
    providers: listProviderCatalog(category),
    steps: [
      'SELECT_ORGANIZATION',
      'SELECT_PROVIDER_CATEGORY',
      'SELECT_PROVIDER',
      'EXPLAIN_REQUIRED_ACCESS',
      'AUTHORIZE',
      'DISCOVER_ACCOUNTS',
      'SELECT_TARGET',
      'VERIFY',
      'SAVE',
      'INITIAL_SYNC',
      'COMPLETE',
    ],
  };
}

export async function discoverAccountsForConnection(orgSlug: string, connectionId: string) {
  const detail = await getConnectionDetail(orgSlug, connectionId);
  if (!detail) throw new Error('Connection not found');
  const def = getProviderDefinition(detail.connection.providerKey);
  return {
    connectionId,
    providerKey: detail.connection.providerKey,
    adapterStatus: adapterStatus(detail.connection.providerKey),
    accounts: [] as Array<{ externalAccountId: string; externalAccountName: string }>,
    requiresExplicitSelection: true,
    requiredScopes: def?.supportedCapabilities ?? [],
    message:
      adapterStatus(detail.connection.providerKey) === 'REQUIRES_CREDENTIALS'
        ? 'Configure secure credentials before account discovery'
        : 'Authorization required before account discovery',
  };
}
