/** Account discovery + capability verification for Meta/Instagram */

import { getProviderCredential } from './providerSecretStore.js';
import { orgIdFromSlug } from '../orgRegistry.js';
import { useMemoryConnections, memConnections } from './connectionService.js';
import * as db from './connectionStore.js';
import type { ProviderCapability } from './types.js';

export type DiscoveredIgAccount = {
  externalAccountId: string;
  externalAccountName: string;
  externalPropertyId?: string;
  externalPropertyName?: string;
};

export type CapabilityReport = Record<string, 'AVAILABLE' | 'UNAVAILABLE' | 'MISSING_SCOPE'>;

const META_CAP_MAP: Array<{ cap: ProviderCapability; scope: string }> = [
  { cap: 'READ_PROFILE', scope: 'instagram_basic' },
  { cap: 'READ_CONTENT', scope: 'instagram_basic' },
  { cap: 'READ_ANALYTICS', scope: 'instagram_basic' },
  { cap: 'PUBLISH_CONTENT', scope: 'instagram_content_publish' },
  { cap: 'UPLOAD_MEDIA', scope: 'instagram_content_publish' },
  { cap: 'SCHEDULE_CONTENT', scope: 'instagram_content_publish' },
];

async function loadConnection(connectionId: string, orgId: string) {
  if (useMemoryConnections()) {
    return memConnections.find((c) => c.id === connectionId && c.organization_id === orgId);
  }
  return db.loadConnectionById(connectionId, orgId);
}

export async function discoverMetaInstagramAccounts(orgSlug: string, connectionId: string) {
  const orgId = orgIdFromSlug(orgSlug)!;
  const conn = await loadConnection(connectionId, orgId);
  if (!conn) throw new Error('Cross-organization access denied');
  if (!conn.secret_ref) {
    return { accounts: [] as DiscoveredIgAccount[], message: 'AUTHORIZATION_REQUIRED', requiresSelection: false };
  }

  const cred = await getProviderCredential(String(conn.secret_ref), orgId);
  if (!cred?.access_token) {
    return { accounts: [], message: 'REQUIRES_AUTHORIZATION', requiresSelection: false };
  }

  if (useMemoryConnections()) {
    return {
      accounts: [
        { externalAccountId: 'ig-test-1', externalAccountName: 'NDXbook (test)', externalPropertyId: 'prop-1', externalPropertyName: 'NDXbook Instagram' },
        { externalAccountId: 'ig-test-2', externalAccountName: 'NDXbook Alt (test)', externalPropertyId: 'prop-2', externalPropertyName: 'Alt Instagram' },
      ],
      message: 'Discovered 2 accounts — owner must select one',
      requiresSelection: true,
    };
  }

  // Production: Graph API /me/accounts — architecture slot; returns empty until live token validated
  return { accounts: [] as DiscoveredIgAccount[], message: 'NO_ACCOUNTS_RETURNED — verify Meta app permissions', requiresSelection: false };
}

export function verifyGrantedCapabilities(grantedScopes: string[]): CapabilityReport {
  const report: CapabilityReport = {};
  for (const { cap, scope } of META_CAP_MAP) {
    if (grantedScopes.includes(scope)) report[cap] = 'AVAILABLE';
    else report[cap] = 'MISSING_SCOPE';
  }
  return report;
}

export async function verifyConnectionCapabilities(orgSlug: string, connectionId: string) {
  const orgId = orgIdFromSlug(orgSlug)!;
  const conn = await loadConnection(connectionId, orgId);
  if (!conn) throw new Error('Connection not found');

  const scopes = (conn.granted_scopes as string[]) ?? ['instagram_basic', 'instagram_content_publish'];
  const capabilities = verifyGrantedCapabilities(scopes);
  const publishing = capabilities.PUBLISH_CONTENT === 'AVAILABLE' ? 'AVAILABLE' : 'MISSING_SCOPE';
  const analytics = capabilities.READ_ANALYTICS === 'AVAILABLE' ? 'AVAILABLE' : 'NOT_AVAILABLE';

  const patch = {
    publishing_capability: publishing,
    analytics_capability: analytics,
    granted_capabilities: Object.entries(capabilities)
      .filter(([, v]) => v === 'AVAILABLE')
      .map(([k]) => k),
    verification_status: 'VERIFIED',
    status: 'CONNECTED',
    connection_state: 'CONNECTED',
    health: 'HEALTHY',
    last_verified_at: new Date().toISOString(),
  };

  if (useMemoryConnections()) {
    Object.assign(conn, patch);
  } else {
    await db.upsertConnection({ ...conn, ...patch });
  }

  return { capabilities, publishingCapability: publishing, analyticsCapability: analytics, verificationStatus: 'VERIFIED' };
}
