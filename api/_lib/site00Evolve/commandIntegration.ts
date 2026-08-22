/**
 * Merge EVOLVE marketing command items into orchestration dashboard / COMMAND.
 */

import type { EvolveCommandItem } from './types.js';
import { listMarketingOrgs, getEvolveOverview, ensureEvolveSeeded } from './evolveService.js';
import { isMarketingClientOrg } from './seedFixtures.js';
import { buildConnectionCommandItems } from './providers/commandConnections.js';

export type EvolveCommandContribution = {
  items: EvolveCommandItem[];
  needsYou: EvolveCommandItem[];
  blocked: EvolveCommandItem[];
  running: EvolveCommandItem[];
  upcoming: EvolveCommandItem[];
  deferred: EvolveCommandItem[];
};

export async function buildEvolveCommandItems(): Promise<EvolveCommandContribution> {
  await ensureEvolveSeeded();
  const items: EvolveCommandItem[] = [];

  for (const org of listMarketingOrgs()) {
    if (!isMarketingClientOrg(org.classification)) continue;
    const overview = await getEvolveOverview(org.slug, org);
    const nba = overview.nextBestAction;
    if (!nba) continue;

    items.push({
      id: `evolve-${org.slug}-${nba.rank}`,
      organizationSlug: org.slug,
      organizationName: org.name,
      category: nba.category,
      title: nba.title,
      reason: nba.reason,
      route: nba.route,
      priority: nba.priority,
    });

    for (const d of overview.deferredItems) {
      items.push({
        id: `evolve-deferred-${org.slug}-${d.replace(/\s+/g, '-').toLowerCase()}`,
        organizationSlug: org.slug,
        organizationName: org.name,
        category: 'DEFERRED',
        title: `${d} — deferred by owner`,
        reason: 'Owner decision — not a launch or EVOLVE blocker',
        route: overview.route,
        priority: 95,
      });
    }

    const connItems = await buildConnectionCommandItems(org.slug, org.name);
    items.push(...connItems);
  }

  return {
    items,
    needsYou: items.filter((i) => i.category === 'NEEDS_YOU'),
    blocked: items.filter((i) => i.category === 'BLOCKED'),
    running: items.filter((i) => i.category === 'RUNNING'),
    upcoming: items.filter((i) => i.category === 'UPCOMING'),
    deferred: items.filter((i) => i.category === 'DEFERRED'),
  };
}

export async function mergeEvolveIntoFocusNow(
  focusNow: Array<{ organizationSlug: string; action: string; why: string; route: string; priority: number }>,
): Promise<typeof focusNow> {
  const evolve = await buildEvolveCommandItems();
  const merged = [...focusNow];
  for (const item of evolve.items.filter((i) => i.category === 'NEEDS_YOU' || i.category === 'BLOCKED').slice(0, 5)) {
    merged.push({
      organizationSlug: item.organizationSlug,
      action: item.title,
      why: item.reason,
      route: item.route,
      priority: item.priority,
    });
  }
  merged.sort((a, b) => a.priority - b.priority);
  return merged;
}
