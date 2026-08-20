/**
 * In-memory orchestration store for development/debug when Supabase is unavailable.
 * Production path uses Supabase via orchestrationService.ts.
 */

import type {
  LaunchManifestRow,
  ManifestRequirementRow,
  OrganizationRow,
  RequirementDependencyRow,
  WorkstreamRow,
} from './types.js';
import {
  FIXTURE_ORGANIZATIONS,
  buildFixtureManifests,
  buildFixtureRequirements,
  buildFixtureWorkstreams,
  buildFixtureDependencies,
  getEvolveItemsFromRequirements,
} from './seedFixtures.js';

export type OrchestrationStore = {
  organizations: OrganizationRow[];
  manifests: LaunchManifestRow[];
  requirements: ManifestRequirementRow[];
  dependencies: RequirementDependencyRow[];
  workstreams: WorkstreamRow[];
  overrides: Set<string>;
  deferrals: Array<Record<string, unknown>>;
  evolveItems: Array<Record<string, unknown>>;
  evidence: Array<Record<string, unknown>>;
  reconciliations: Array<Record<string, unknown>>;
  externalConnections: Array<Record<string, unknown>>;
  signals: Array<Record<string, unknown>>;
  history: Array<Record<string, unknown>>;
  ingestions: Array<Record<string, unknown>>;
  seeded: boolean;
};

let store: OrchestrationStore | null = null;

function uuid(prefix: string, n: number): string {
  return `${prefix}-00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
}

export function getOrchestrationStore(): OrchestrationStore {
  if (!store) {
    store = createFreshStore();
  }
  if (!store.seeded) {
    seedStore(store);
  }
  return store;
}

export function resetOrchestrationStore(): OrchestrationStore {
  store = createFreshStore();
  seedStore(store);
  return store;
}

function createFreshStore(): OrchestrationStore {
  return {
    organizations: [],
    manifests: [],
    requirements: [],
    dependencies: [],
    workstreams: [],
    overrides: new Set(),
    deferrals: [],
    evolveItems: [],
    evidence: [],
    reconciliations: [],
    externalConnections: [],
    signals: [],
    history: [],
    ingestions: [],
    seeded: false,
  };
}

function seedStore(s: OrchestrationStore): void {
  s.organizations = FIXTURE_ORGANIZATIONS.map((o, i) => ({
    ...o,
    id: uuid('org', i + 1),
    metadata: { ...o.metadata, fixture: true, label: 'DEMO / UNRECONCILED' },
  }));

  const orgBySlug = new Map(s.organizations.map((o) => [o.slug, o]));

  s.workstreams = buildFixtureWorkstreams(orgBySlug);
  s.manifests = buildFixtureManifests(orgBySlug);
  s.requirements = buildFixtureRequirements(s.manifests, s.workstreams, orgBySlug);
  s.dependencies = buildFixtureDependencies(s.requirements, s.manifests);

  s.evolveItems = s.organizations.flatMap((org) =>
    getEvolveItemsFromRequirements(
      s.requirements.filter((r) => {
        const manifest = s.manifests.find((m) => m.id === r.manifest_id);
        return manifest?.organization_id === org.id;
      }),
      org.id,
    ),
  );

  s.externalConnections = [
    {
      id: uuid('conn', 1),
      organization_id: orgBySlug.get('frontal-slayer')!.id,
      logical_name: 'Studio World Production Engine',
      connection_state: 'TO_BE_CONNECTED_IN_SPRINT_02',
      external_system_key: 'studio_world',
    },
    {
      id: uuid('conn', 2),
      organization_id: orgBySlug.get('site-00')!.id,
      logical_name: 'SITE 00 Repository',
      connection_state: 'CONNECTED',
      external_system_key: 'github_site00',
      external_identifier: 'yoteenz/SITE00',
    },
  ];

  s.seeded = true;
}

export function findOrgBySlug(slug: string): OrganizationRow | undefined {
  return getOrchestrationStore().organizations.find((o) => o.slug === slug);
}

export function findActiveManifest(orgId: string): LaunchManifestRow | undefined {
  return getOrchestrationStore().manifests.find(
    (m) => m.organization_id === orgId && m.is_active,
  );
}

export function getRequirementsForManifest(manifestId: string): ManifestRequirementRow[] {
  return getOrchestrationStore().requirements.filter((r) => r.manifest_id === manifestId);
}

export function getDependenciesForManifest(manifestId: string): RequirementDependencyRow[] {
  return getOrchestrationStore().dependencies.filter((d) => d.manifest_id === manifestId);
}
