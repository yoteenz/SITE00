/**
 * B5.9R10 — Client directory service (list, search, memberships, project resolution).
 */

import type { Site00ClientProjectIndexRef, Site00ProjectIndexEntry } from '../types.js';
import {
  buildProjectIndexItemsFromEntries,
  isSite00PlatformDesignIndexItem,
} from '../buildProjectIndexItems.js';
import type { ProjectIndexItem } from '../projectIndexItem.js';
import { orderProjectIndexItems } from '../projectIndexOrder.js';
import type { ClientDirectorySearchResult, ClientProjectMembership, ClientSimulationContext } from './types.js';
import {
  buildJaneDoeMemberships,
  buildJaneDoeSimulationContext,
  isJaneDoeFixtureEnabled,
  JANE_DOE_CLIENT_ID,
  projectLabelForSlug,
} from './janeDoeFixture.js';

export type ClientDirectoryRecord = ClientSimulationContext;

let membershipStore: ClientProjectMembership[] | null = null;

function ensureMembershipStore(): ClientProjectMembership[] {
  if (!membershipStore) {
    membershipStore = isJaneDoeFixtureEnabled() ? buildJaneDoeMemberships() : [];
  }
  return membershipStore;
}

/** Reusable seed for demo client + memberships (tests / dev). */
export function seedDemoClientFixtures(): { client: ClientSimulationContext; memberships: ClientProjectMembership[] } {
  membershipStore = buildJaneDoeMemberships();
  return { client: buildJaneDoeSimulationContext(), memberships: membershipStore };
}

export function resetClientDirectoryForTests(): void {
  membershipStore = null;
}

function mapApiClientToContext(ref: Site00ClientProjectIndexRef): ClientSimulationContext | null {
  const firstName = ref.ownerFirstName ?? null;
  const lastName = ref.ownerLastName ?? null;
  const displayName =
    ref.ownerDisplayName ?? ([firstName, lastName].filter(Boolean).join(' ') || ref.name);
  if (!displayName?.trim()) return null;

  const parts = displayName.trim().split(/\s+/);
  const fn = firstName ?? parts[0] ?? displayName;
  const ln = lastName ?? (parts.length > 1 ? parts.slice(1).join(' ') : '');

  return {
    clientId: ref.id,
    accountId: ref.id,
    firstName: fn,
    lastName: ln,
    fullName: [fn, ln].filter(Boolean).join(' '),
    displayName,
    companyName: ref.name !== displayName ? ref.name : null,
    projectIds: [ref.slug],
    projectCount: 1,
    activeProjectCount: 1,
    isDemoFixture: false,
    source: 'PROJECT_OWNER',
    status: 'ACTIVE',
  };
}

export function listClients(apiClients: Site00ClientProjectIndexRef[] = []): ClientDirectoryRecord[] {
  const clients: ClientDirectoryRecord[] = [];
  if (isJaneDoeFixtureEnabled()) {
    clients.push(buildJaneDoeSimulationContext());
  }

  for (const ref of apiClients) {
    const mapped = mapApiClientToContext(ref);
    if (mapped && !clients.some((c) => c.clientId === mapped.clientId)) {
      clients.push(mapped);
    }
  }

  return clients;
}

function clientMatchesQuery(client: ClientDirectoryRecord, query: string): { match: boolean; reason: string | null } {
  const q = query.trim().toLowerCase();
  if (!q) return { match: true, reason: null };

  const haystack = [
    client.firstName,
    client.lastName,
    client.fullName,
    client.displayName,
    client.companyName ?? '',
    ...client.projectIds.map(projectLabelForSlug),
    ...client.projectIds,
  ]
    .join(' ')
    .toLowerCase();

  if (haystack.includes(q)) {
    const projectHit = client.projectIds.find(
      (id) => id.includes(q) || projectLabelForSlug(id).toLowerCase().includes(q),
    );
    return { match: true, reason: projectHit ? `PROJECT:${projectHit}` : 'NAME' };
  }
  return { match: false, reason: null };
}

export function searchClients(
  query: string,
  apiClients: Site00ClientProjectIndexRef[] = [],
): ClientDirectorySearchResult[] {
  const all = listClients(apiClients);
  return all
    .map((client) => {
      const { match, reason } = clientMatchesQuery(client, query);
      if (!match) return null;
      return {
        ...client,
        projectLabels: client.projectIds.map(projectLabelForSlug),
        matchReason: reason,
      };
    })
    .filter(Boolean) as ClientDirectorySearchResult[];
}

export function getClient(clientId: string, apiClients: Site00ClientProjectIndexRef[] = []): ClientDirectoryRecord | null {
  return listClients(apiClients).find((c) => c.clientId === clientId) ?? null;
}

export function getClientProjectMemberships(clientId: string): ClientProjectMembership[] {
  return ensureMembershipStore().filter((m) => m.clientId === clientId && m.status === 'ACTIVE');
}

export function clientCanAccessProject(clientId: string, projectId: string): boolean {
  if (projectId === 'site00') return false;
  return getClientProjectMemberships(clientId).some((m) => m.projectId === projectId);
}

function entryFromClientRef(ref: Site00ClientProjectIndexRef): Site00ProjectIndexEntry {
  return {
    slug: ref.slug,
    name: ref.name,
    displayName: ref.name,
    organizationSlug: ref.slug,
    organizationUuid: ref.id,
    classification: 'CLIENT_PROJECT',
    currentSystem: 'CLIENT STUDIO',
    currentPhase: 'IN PROGRESS',
    focusNow: null,
    lastActivity: null,
    surfaces: [],
    detailRoute: ref.studioRoute,
  };
}

export function getClientProjects(args: {
  clientId: string;
  founderEntries: Site00ProjectIndexEntry[];
  clientProjectRefs?: Site00ClientProjectIndexRef[];
}): ProjectIndexItem[] {
  const memberships = getClientProjectMemberships(args.clientId);
  if (!memberships.length) return [];

  const allowed = new Set(memberships.map((m) => m.projectId));
  const entries: Site00ProjectIndexEntry[] = [];

  for (const projectId of allowed) {
    if (projectId === 'site00') continue;
    const fromFounder = args.founderEntries.find((e) => e.slug === projectId);
    if (fromFounder) {
      entries.push(fromFounder);
      continue;
    }
    const fromClient = args.clientProjectRefs?.find((r) => r.slug === projectId);
    if (fromClient) entries.push(entryFromClientRef(fromClient));
  }

  const client = getClient(args.clientId, args.clientProjectRefs ?? []);
  const items = buildProjectIndexItemsFromEntries(entries).map((item) => ({
    ...item,
    ownerType: 'CLIENT' as const,
    clientName: client?.fullName ?? item.clientName,
  }));

  return orderProjectIndexItems(items).filter((item) => !isSite00PlatformDesignIndexItem(item));
}

export function getClientProjectIds(clientId: string): string[] {
  return getClientProjectMemberships(clientId).map((m) => m.projectId);
}

export function isDemoClient(clientId: string | null | undefined): boolean {
  return clientId === JANE_DOE_CLIENT_ID;
}
