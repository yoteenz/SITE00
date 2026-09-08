/**
 * B5.9R2 — Build project index items from canonical API entries.
 */

import type { Site00ProjectIndexEntry } from './types.js';
import { buildProjectIndexItem, type ProjectIndexItem } from './projectIndexItem.js';
import { projectModulePath } from './projectModules.js';

export function buildProjectIndexItemsFromEntries(
  entries: Site00ProjectIndexEntry[],
): ProjectIndexItem[] {
  return entries.map((entry) => {
    const item = buildProjectIndexItem(entry, {
      ownerType: entry.classification.includes('CLIENT') ? 'CLIENT' : 'FOUNDER',
      openRoute: projectModulePath(entry.slug, 'OVERVIEW'),
    });
    return item;
  });
}

export function buildClientProjectIndexItems(
  clientProjects: Array<{ id: string; slug: string; name: string; studioRoute: string }>,
): ProjectIndexItem[] {
  return clientProjects.map((p) => {
    const syntheticEntry: Site00ProjectIndexEntry = {
      slug: p.slug,
      name: p.name,
      displayName: p.name,
      organizationSlug: p.slug,
      organizationUuid: p.id,
      classification: 'CLIENT_PROJECT',
      currentSystem: 'CLIENT STUDIO',
      currentPhase: 'IN PROGRESS',
      focusNow: null,
      lastActivity: null,
      surfaces: [],
      detailRoute: p.studioRoute,
    };
    return buildProjectIndexItem(syntheticEntry, {
      ownerType: 'CLIENT',
      openRoute: p.studioRoute,
    });
  });
}
