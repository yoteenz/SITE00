/** COMMAND integration for external connections */

import type { EvolveCommandItem } from '../types.js';
import { listSafeConnections } from './connectionService.js';
import { getPilotReadiness } from './pilotService.js';

export async function buildConnectionCommandItems(orgSlug: string, orgName: string): Promise<EvolveCommandItem[]> {
  const items: EvolveCommandItem[] = [];
  const connections = await listSafeConnections(orgSlug);
  const route = `/admin/site00/orchestration/${orgSlug}/evolve/connections`;

  const needsAuth = connections.filter((c) =>
    ['AUTHORIZATION_REQUIRED', 'REAUTH_REQUIRED'].includes(c.status),
  );
  for (const c of needsAuth) {
    items.push({
      id: `conn-needs-${orgSlug}-${c.id}`,
      organizationSlug: orgSlug,
      organizationName: orgName,
      category: 'NEEDS_YOU',
      title: `Connect ${c.displayName}`,
      reason: c.recommendedAction ?? 'Provider authorization required',
      route,
      priority: 12,
    });
  }

  const broken = connections.filter((c) => c.health === 'BROKEN' || c.status === 'ERROR');
  for (const c of broken) {
    items.push({
      id: `conn-blocked-${orgSlug}-${c.id}`,
      organizationSlug: orgSlug,
      organizationName: orgName,
      category: 'BLOCKED',
      title: `${c.displayName} connection issue`,
      reason: c.lastErrorMessage ?? 'Connection degraded — verify or reauthorize',
      route,
      priority: 14,
    });
  }

  const syncing = connections.filter((c) => c.status === 'CONNECTING');
  for (const c of syncing) {
    items.push({
      id: `conn-running-${orgSlug}-${c.id}`,
      organizationSlug: orgSlug,
      organizationName: orgName,
      category: 'RUNNING',
      title: `Connecting ${c.displayName}`,
      reason: 'Account discovery or verification in progress',
      route,
      priority: 42,
    });
  }

  if (orgSlug === 'ndxbook') {
    const readiness = await getPilotReadiness(orgSlug);
    const blockedCount = readiness.items.filter((i) => i.state === 'BLOCKED' || i.state === 'NOT_CONNECTED').length;
    if (blockedCount > 0) {
      items.push({
        id: `ndxbook-pilot-upcoming`,
        organizationSlug: orgSlug,
        organizationName: orgName,
        category: 'UPCOMING',
        title: 'NDXbook publishing pilot readiness',
        reason: `${blockedCount} readiness item(s) remain before controlled publishing pilot`,
        route: `/admin/site00/orchestration/${orgSlug}/evolve/pilot`,
        priority: 55,
      });
    }
  }

  return items;
}
