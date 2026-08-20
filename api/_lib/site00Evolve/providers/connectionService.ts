/**
 * External connection service — production Supabase-backed, memory for tests.
 */

import { randomUUID } from 'node:crypto';
import { orgIdFromSlug } from '../orgRegistry.js';
import { adapterStatus, buildCapabilityMap, getProviderDefinition, listProvidersByCategory } from './registry.js';
import { getProviderAdapter } from './adapters/index.js';
import type { ConnectionStatus, ProviderCategory, SafeConnectionView } from './types.js';
import { ProviderError } from './errors.js';
import { assertPublishingAllowed } from './publishingFence.js';
import * as db from './connectionStore.js';

type MemoryConnection = Record<string, unknown> & { id: string; organization_id: string };

const memConnections: MemoryConnection[] = [];
const memEvents: Array<Record<string, unknown>> = [];
const memPilotConfigs: Map<string, Record<string, unknown>> = new Map();
const memObservations: Array<Record<string, unknown>> = [];

export function useMemoryConnections(): boolean {
  return process.env.EVOLVE_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

export function resetConnectionMemory(): void {
  memConnections.length = 0;
  memEvents.length = 0;
  memPilotConfigs.clear();
  memObservations.length = 0;
}

export async function ensurePilotConfig(orgSlug: string) {
  const orgId = orgIdFromSlug(orgSlug)!;
  const defaults = {
    organization_id: orgId,
    pilot_role: orgSlug === 'ndxbook' ? 'DISTRIBUTION_PUBLISHING_PILOT' : null,
    automation_mode: 'MANUAL',
    publishing_status: 'DISABLED',
    provider_status: 'NOT_CONNECTED',
    automation_status: 'DISABLED',
    metadata: {},
  };
  if (useMemoryConnections()) {
    if (!memPilotConfigs.has(orgId)) memPilotConfigs.set(orgId, { id: randomUUID(), ...defaults });
    return memPilotConfigs.get(orgId)!;
  }
  const existing = await db.loadPilotConfig(orgId);
  if (existing) return existing;
  return db.upsertPilotConfig(defaults);
}

export async function listSafeConnections(orgSlug?: string): Promise<SafeConnectionView[]> {
  const orgId = orgSlug ? orgIdFromSlug(orgSlug) : undefined;
  if (useMemoryConnections()) {
    const rows = orgId ? memConnections.filter((c) => c.organization_id === orgId) : memConnections;
    return rows.map((r) => db.toSafeConnectionView(r as never));
  }
  const rows = await db.loadConnections(orgId);
  return rows.map(db.sanitizeConnectionForClient);
}

export async function getConnectionDetail(orgSlug: string, connectionId: string) {
  const orgId = orgIdFromSlug(orgSlug)!;
  let row: MemoryConnection | undefined;
  if (useMemoryConnections()) {
    row = memConnections.find((c) => c.id === connectionId && c.organization_id === orgId);
  } else {
    row = (await db.loadConnectionById(connectionId, orgId)) as MemoryConnection | undefined;
  }
  if (!row) return null;
  const events = useMemoryConnections()
    ? memEvents.filter((e) => e.connection_id === connectionId).slice(0, 20)
    : await db.loadConnectionEvents(connectionId);
  return { connection: db.sanitizeConnectionForClient(row as never), events };
}

export async function initiateConnection(orgSlug: string, providerKey: string, displayName: string) {
  const orgId = orgIdFromSlug(orgSlug)!;
  const def = getProviderDefinition(providerKey);
  if (!def) throw new ProviderError('NOT_CONFIGURED', `Unknown provider: ${providerKey}`);

  const credState =
    adapterStatus(providerKey) === 'REQUIRES_CREDENTIALS' ? 'REQUIRES_SECURE_CONFIGURATION' : 'NOT_CONFIGURED';

  const row = {
    id: randomUUID(),
    organization_id: orgId,
    external_system_id: randomUUID(),
    logical_name: displayName || def.displayName,
    connection_state: 'AUTHORIZATION_REQUIRED',
    provider_key: providerKey,
    provider_category: def.category,
    connection_type: 'OAUTH',
    display_name: displayName || def.displayName,
    status: 'AUTHORIZATION_REQUIRED' as ConnectionStatus,
    health: 'UNKNOWN',
    supported_capabilities: def.supportedCapabilities,
    granted_capabilities: [],
    granted_scopes: [],
    credential_state: credState,
    secret_ref: null,
    metadata: { adapter_status: adapterStatus(providerKey) },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (useMemoryConnections()) {
    memConnections.push(row);
    memEvents.push({
      id: randomUUID(),
      organization_id: orgId,
      connection_id: row.id,
      event_type: 'CONNECTION_CREATED',
      summary: `Connection initiated for ${providerKey}`,
      created_at: new Date().toISOString(),
    });
    return db.sanitizeConnectionForClient(row as never);
  }

  const saved = await db.upsertConnection(row);
  await db.insertConnectionEvent({
    organization_id: orgId,
    connection_id: saved.id,
    event_type: 'CONNECTION_CREATED',
    summary: `Connection initiated for ${providerKey}`,
  });
  return db.sanitizeConnectionForClient(saved);
}

export async function selectAccountProperty(
  orgSlug: string,
  connectionId: string,
  accountId: string,
  accountName: string,
  propertyId?: string,
  propertyName?: string,
) {
  const orgId = orgIdFromSlug(orgSlug)!;
  const patch = {
    external_account_id: accountId,
    external_account_name: accountName,
    external_property_id: propertyId ?? null,
    external_property_name: propertyName ?? null,
    status: 'CONNECTING',
    updated_at: new Date().toISOString(),
  };

  if (useMemoryConnections()) {
    const row = memConnections.find((c) => c.id === connectionId && c.organization_id === orgId);
    if (!row) throw new Error('Connection not found');
    Object.assign(row, patch);
    memEvents.push({
      organization_id: orgId,
      connection_id: connectionId,
      event_type: 'ACCOUNT_SELECTED',
      summary: `Account selected: ${accountName}`,
    });
    return db.sanitizeConnectionForClient(row as never);
  }

  const existing = await db.loadConnectionById(connectionId, orgId);
  if (!existing) throw new Error('Cross-organization access denied');
  const saved = await db.upsertConnection({ ...existing, ...patch });
  await db.insertConnectionEvent({
    organization_id: orgId,
    connection_id: connectionId,
    event_type: 'ACCOUNT_SELECTED',
    summary: `Account selected: ${accountName}`,
  });
  return db.sanitizeConnectionForClient(saved);
}

export async function verifyConnection(orgSlug: string, connectionId: string) {
  const orgId = orgIdFromSlug(orgSlug)!;
  const pilot = await ensurePilotConfig(orgSlug);
  const row = useMemoryConnections()
    ? memConnections.find((c) => c.id === connectionId && c.organization_id === orgId)
    : await db.loadConnectionById(connectionId, orgId);
  if (!row) throw new Error('Connection not found');

  const adapter = getProviderAdapter(String(row.provider_key));
  const ctx = {
    organizationId: orgId,
    connectionId,
    providerKey: String(row.provider_key),
    secretRef: row.secret_ref as string | null,
    orgPublishingStatus: String(pilot.publishing_status) as 'DISABLED',
  };

  const result = adapter
    ? await adapter.verifyConnection(ctx)
    : { healthy: false, message: 'Adapter unavailable' };

  const status: ConnectionStatus = result.healthy ? 'CONNECTED' : 'AUTHORIZATION_REQUIRED';
  const health = result.healthy ? 'HEALTHY' : result.message?.includes('REQUIRES') ? 'UNKNOWN' : 'BROKEN';
  const granted = adapter ? adapter.getCapabilities(ctx, (row.granted_scopes as string[]) ?? []) : [];

  const patch = {
    status,
    connection_state: status,
    health,
    verification_status: result.healthy ? 'VERIFIED' : 'VERIFICATION_REQUIRED',
    granted_capabilities: granted,
    publishing_capability: granted.includes('PUBLISH_CONTENT') ? 'AVAILABLE' : 'NOT_AVAILABLE',
    analytics_capability: granted.includes('READ_CONTENT_METRICS') ? 'AVAILABLE' : 'NOT_AVAILABLE',
    last_verified_at: new Date().toISOString(),
    last_error_message: result.healthy ? null : result.message,
    updated_at: new Date().toISOString(),
  };

  if (useMemoryConnections()) {
    Object.assign(row, patch);
    return db.sanitizeConnectionForClient(row as never);
  }

  const saved = await db.upsertConnection({ ...row, ...patch });
  await db.insertConnectionEvent({
    organization_id: orgId,
    connection_id: connectionId,
    event_type: result.healthy ? 'AUTHORIZATION_VERIFIED' : 'AUTHORIZATION_FAILED',
    summary: result.message ?? (result.healthy ? 'Verified' : 'Verification failed'),
  });
  return db.sanitizeConnectionForClient(saved);
}

export async function disconnectConnection(orgSlug: string, connectionId: string) {
  const orgId = orgIdFromSlug(orgSlug)!;
  const patch = {
    status: 'DISCONNECTED',
    connection_state: 'DISCONNECTED',
    health: 'UNKNOWN',
    updated_at: new Date().toISOString(),
  };
  if (useMemoryConnections()) {
    const row = memConnections.find((c) => c.id === connectionId && c.organization_id === orgId);
    if (!row) throw new Error('Connection not found');
    Object.assign(row, patch);
    return { ok: true };
  }
  const row = await db.loadConnectionById(connectionId, orgId);
  if (!row) throw new Error('Cross-organization access denied');
  await db.upsertConnection({ ...row, ...patch });
  await db.insertConnectionEvent({
    organization_id: orgId,
    connection_id: connectionId,
    event_type: 'CONNECTION_DISCONNECTED',
    summary: 'Connection disconnected by operator',
  });
  return { ok: true };
}

export async function attemptPublish(orgSlug: string, connectionId: string) {
  const pilot = await ensurePilotConfig(orgSlug);
  assertPublishingAllowed(String(pilot.publishing_status) as 'DISABLED');
  const adapter = getProviderAdapter('meta_instagram');
  if (!adapter) throw new ProviderError('NOT_CONFIGURED', 'No adapter');
  await adapter.publish({
    organizationId: orgIdFromSlug(orgSlug)!,
    connectionId,
    providerKey: 'meta_instagram',
    orgPublishingStatus: String(pilot.publishing_status) as 'DISABLED',
  });
}

export function listProviderCatalog(category?: ProviderCategory) {
  return listProvidersByCategory(category).map((p) => ({
    providerKey: p.providerKey,
    displayName: p.displayName,
    category: p.category,
    supportedCapabilities: p.supportedCapabilities,
    adapterStatus: adapterStatus(p.providerKey),
    capabilityPreview: buildCapabilityMap(p.supportedCapabilities, []),
  }));
}

export { memObservations, memConnections };
