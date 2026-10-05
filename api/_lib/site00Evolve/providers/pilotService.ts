/** Pilot readiness + distribution foundation */

import { orgIdFromSlug } from '../orgRegistry.js';
import { ensurePilotConfig, listSafeConnections } from './connectionService.js';
import { publishingFenceState } from './publishingFence.js';
import { canTransitionDistributionState } from './publishingFence.js';
import { useMemoryConnections } from './connectionService.js';
import * as db from './connectionStore.js';
import { randomUUID } from 'node:crypto';

export type PilotReadinessItem = {
  key: string;
  label: string;
  state: 'READY' | 'PARTIAL' | 'BLOCKED' | 'NOT_CONNECTED' | 'NOT_STARTED' | 'DISABLED';
  detail?: string;
};

export async function getPilotReadiness(orgSlug: string): Promise<{
  organizationSlug: string;
  items: PilotReadinessItem[];
  publishingFence: ReturnType<typeof publishingFenceState>;
  automationMode: string;
}> {
  const pilot = await ensurePilotConfig(orgSlug);
  const connections = await listSafeConnections(orgSlug);
  const analytics = connections.find((c) => c.providerCategory === 'ANALYTICS' && c.status === 'CONNECTED');
  const social = connections.find((c) => c.providerCategory === 'SOCIAL' && c.status === 'CONNECTED');
  const fence = publishingFenceState(String(pilot.publishing_status) as 'DISABLED');

  const items: PilotReadinessItem[] = [
    { key: 'assessment', label: 'Marketing Assessment', state: 'NOT_STARTED' },
    {
      key: 'provider',
      label: 'Provider Connection',
      state: connections.length ? 'PARTIAL' : 'NOT_CONNECTED',
    },
    {
      key: 'account',
      label: 'Account Verified',
      state: connections.some((c) => c.status === 'CONNECTED') ? 'READY' : 'NOT_CONNECTED',
    },
    {
      key: 'analytics',
      label: 'Analytics Connection',
      state: analytics ? 'READY' : 'NOT_CONNECTED',
    },
    { key: 'strategy', label: 'Content Strategy', state: 'NOT_STARTED' },
    { key: 'content_brain', label: 'Content Brain', state: 'NOT_STARTED' },
    { key: 'campaign', label: 'Campaign', state: 'NOT_STARTED' },
    { key: 'calendar', label: 'Content Calendar', state: 'NOT_STARTED' },
    { key: 'production', label: 'Production Pipeline', state: 'NOT_STARTED' },
    { key: 'approval', label: 'Approval Pipeline', state: 'NOT_STARTED' },
    { key: 'distribution', label: 'Distribution Pipeline', state: 'DISABLED' },
    { key: 'publishing_fence', label: 'Publishing Fence', state: fence.canPublish ? 'READY' : 'DISABLED', detail: fence.reason ?? undefined },
    {
      key: 'automation',
      label: 'Automation Mode',
      state: pilot.automation_mode === 'MANUAL' ? 'DISABLED' : 'PARTIAL',
      detail: String(pilot.automation_mode),
    },
    {
      key: 'performance',
      label: 'Performance Ingestion',
      state: analytics ? 'PARTIAL' : 'NOT_CONNECTED',
    },
    { key: 'learning', label: 'Learning Loop', state: 'NOT_STARTED' },
  ];

  if (orgSlug === 'ndxbook' && !social) {
    items.find((i) => i.key === 'provider')!.detail = 'Future social pilot — not connected this sprint';
  }

  return {
    organizationSlug: orgSlug,
    items,
    publishingFence: fence,
    automationMode: String(pilot.automation_mode),
  };
}

export async function createDistributionJob(orgSlug: string, data: Record<string, unknown>) {
  const orgId = orgIdFromSlug(orgSlug)!;
  const toState = String(data.state ?? 'DRAFT');
  const check = canTransitionDistributionState('DRAFT', toState);
  if (!check.ok && toState !== 'DRAFT') throw new Error(check.error);

  const row = {
    id: randomUUID(),
    organization_id: orgId,
    campaign_id: data.campaignId ?? null,
    calendar_item_id: data.calendarItemId ?? null,
    social_item_id: data.socialItemId ?? null,
    channel: String(data.channel ?? 'SOCIAL'),
    state: 'DRAFT',
    automation_mode: 'MANUAL',
    metadata: data.metadata ?? {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (useMemoryConnections()) return row;
  return db.insertDistributionJob(row);
}

export async function bootstrapNdxbookPilot() {
  const orgId = orgIdFromSlug('ndxbook');
  if (!orgId) return { skipped: 'ndxbook org not in registry' };

  if (useMemoryConnections()) {
    await ensurePilotConfig('ndxbook');
    return { ok: true, mode: 'memory' };
  }

  await db.upsertPilotConfig({
    organization_id: orgId,
    pilot_role: 'DISTRIBUTION_PUBLISHING_PILOT',
    automation_mode: 'MANUAL',
    publishing_status: 'DISABLED',
    provider_status: 'NOT_CONNECTED',
    automation_status: 'DISABLED',
    metadata: { registered: 'evolve_sprint03' },
  });
  return { ok: true, mode: 'supabase' };
}
