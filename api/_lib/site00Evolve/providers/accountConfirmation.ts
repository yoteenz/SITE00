/** Account confirmation — owner must verify correct external account */

import { orgIdFromSlug } from '../orgRegistry.js';
import * as db from './connectionStore.js';
import { useMemoryConnections } from './connectionService.js';
import { sanitizeConnectionForClient } from './connectionStore.js';

export async function confirmConnectionAccount(orgSlug: string, connectionId: string, confirmedBy: string) {
  const orgId = orgIdFromSlug(orgSlug)!;

  if (useMemoryConnections()) {
    const { memConnections } = await import('./connectionService.js');
    const row = memConnections.find((c) => c.id === connectionId && c.organization_id === orgId);
    if (!row) throw new Error('Cross-organization access denied');
    const verified = row.verification_status === 'VERIFIED' || row.status === 'CONNECTED';
    if (!verified) throw new Error('ACCOUNT_CONFIRMATION_REQUIRES_VERIFIED_CONNECTION');
    Object.assign(row, {
      account_confirmed_at: new Date().toISOString(),
      account_confirmed_by: confirmedBy,
      metadata: { ...(row.metadata as object), account_confirmed_at: new Date().toISOString() },
    });
    return sanitizeConnectionForClient(row as never);
  }

  const row = await db.loadConnectionById(connectionId, orgId);
  if (!row) throw new Error('Cross-organization access denied');
  if (row.verification_status !== 'VERIFIED' && row.status !== 'CONNECTED') {
    throw new Error('ACCOUNT_CONFIRMATION_REQUIRES_VERIFIED_CONNECTION');
  }

  const saved = await db.upsertConnection({
    ...row,
    account_confirmed_at: new Date().toISOString(),
    account_confirmed_by: confirmedBy,
    metadata: { ...row.metadata, account_confirmed_at: new Date().toISOString(), account_confirmed_by: confirmedBy },
  });

  await db.insertConnectionEvent({
    organization_id: orgId,
    connection_id: connectionId,
    event_type: 'ACCOUNT_CONFIRMED',
    summary: `Account confirmed by ${confirmedBy}`,
    actor_email: confirmedBy,
  });

  return sanitizeConnectionForClient(saved);
}

export function isAccountConfirmed(row: { account_confirmed_at?: string | null; metadata?: Record<string, unknown> }): boolean {
  return Boolean(row.account_confirmed_at ?? row.metadata?.account_confirmed_at);
}
