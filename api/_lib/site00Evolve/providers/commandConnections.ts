/** COMMAND integration for external connections */

import type { EvolveCommandItem } from '../types.js';
import { listSafeConnections } from './connectionService.js';
import { getOwnerConfigurationChecklist } from './ownerConfigService.js';
import { getExpandedPilotReadiness } from './pilotReadinessSprint04.js';
import { getNdxbookImportState } from './ndxbookLegacyImportService.js';

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
    const readiness = await getExpandedPilotReadiness(orgSlug);
    const ownerConfig = getOwnerConfigurationChecklist();
    const importState = getNdxbookImportState();
    const legacyImported = importState.state === 'IMPORTED';
    const pilotRoute = `/admin/site00/orchestration/${orgSlug}/evolve/pilot`;

    if (legacyImported) {
      items.push({
        id: 'ndxbook-focus-visual-identity',
        organizationSlug: orgSlug,
        organizationName: orgName,
        category: 'FOCUS_NOW',
        title: 'Finalize NDXbook visual identity / Creative Direction',
        reason: 'Legacy intelligence imported — placeholder visual DNA is reference-only until identity process completes',
        route: pilotRoute,
        priority: 5,
      });
    }

    if (!ownerConfig.allConfigured) {
      items.push({
        id: 'ndxbook-config-needs-you',
        organizationSlug: orgSlug,
        organizationName: orgName,
        category: 'NEEDS_YOU',
        title: 'Configure Meta credentials',
        reason: ownerConfig.items.filter((i) => i.status !== 'CONFIGURED').map((i) => i.label).join(', '),
        route: `/admin/site00/orchestration/${orgSlug}/evolve/pilot`,
        priority: 8,
      });
    }

    const assessmentItem = readiness.items.find((i) => i.key === 'assessment');
    if (
      !legacyImported &&
      (assessmentItem?.state === 'NOT_STARTED' || assessmentItem?.state === 'PARTIAL')
    ) {
      items.push({
        id: 'ndxbook-assessment-needs-you',
        organizationSlug: orgSlug,
        organizationName: orgName,
        category: 'NEEDS_YOU',
        title: 'Complete NDXbook marketing assessment',
        reason: 'Owner assessment required before manifest and pilot content',
        route: `/admin/site00/orchestration/${orgSlug}/evolve/pilot`,
        priority: 9,
      });
    }

    const accountItem = readiness.items.find((i) => i.key === 'account_confirm');
    if (accountItem?.state === 'PARTIAL') {
      items.push({
        id: 'ndxbook-account-needs-you',
        organizationSlug: orgSlug,
        organizationName: orgName,
        category: 'NEEDS_YOU',
        title: 'Confirm Instagram account',
        reason: 'Verified connection requires owner account confirmation',
        route: `/admin/site00/orchestration/${orgSlug}/evolve/pilot`,
        priority: 10,
      });
    }

    if (readiness.currentState === 'READY_FOR_FENCE_ENABLEMENT') {
      items.push({
        id: 'ndxbook-first-post-needs-you',
        organizationSlug: orgSlug,
        organizationName: orgName,
        category: 'NEEDS_YOU',
        title: 'Approve first pilot content',
        reason: 'First-post candidate ready for owner approval',
        route: `/admin/site00/orchestration/${orgSlug}/evolve/pilot`,
        priority: 11,
      });
    }

    if (legacyImported) {
      for (const upcoming of [
        {
          id: 'ndxbook-page001-rebuild-upcoming',
          title: 'Rebuild Page 001 through EVOLVE creative/content pipeline',
          reason: 'Topic approved — script, visual, and packaging require new pipeline pass',
        },
        {
          id: 'ndxbook-human-review-upcoming',
          title: 'Human review of Page 001 candidate',
          reason: 'Publication, visual, and script approval all NOT_APPROVED',
        },
        {
          id: 'ndxbook-measurement-baseline-upcoming',
          title: 'Measurement baseline from provider evidence',
          reason: 'No fabricated metrics — baseline starts after genuine Instagram evidence',
        },
        {
          id: 'ndxbook-controlled-publish-upcoming',
          title: 'Controlled Instagram publication',
          reason: 'After Page 001 approval and fence enablement',
        },
      ]) {
        items.push({
          id: upcoming.id,
          organizationSlug: orgSlug,
          organizationName: orgName,
          category: 'UPCOMING',
          title: upcoming.title,
          reason: upcoming.reason,
          route: pilotRoute,
          priority: 50,
        });
      }
    } else {
      items.push({
        id: 'ndxbook-controlled-publish-upcoming',
        organizationSlug: orgSlug,
        organizationName: orgName,
        category: 'UPCOMING',
        title: 'Controlled first publication',
        reason: 'Available after fence enablement in next sprint',
        route: pilotRoute,
        priority: 50,
      });
    }

    const deferredItems = legacyImported
      ? ['Autonomous publishing', 'Cross-platform distribution', 'Paid promotion', 'Monetization activation']
      : ['Automation', 'Cross-posting', 'Paid promotion'];

    for (const deferred of deferredItems) {
      items.push({
        id: `ndxbook-deferred-${deferred.toLowerCase().replace(/\s+/g, '-')}`,
        organizationSlug: orgSlug,
        organizationName: orgName,
        category: 'DEFERRED',
        title: deferred,
        reason: legacyImported
          ? 'Deferred until Instagram pilot pipeline produces real evidence'
          : 'Out of scope for Sprint 05A pilot activation',
        route: pilotRoute,
        priority: 90,
      });
    }
  }

  return items;
}
