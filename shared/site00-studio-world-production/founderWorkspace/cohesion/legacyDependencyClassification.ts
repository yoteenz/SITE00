/**
 * P0.UI.2 — Legacy dependency classification + duplicate style audit
 */

import type { LegacyDependencyClass } from './types.js';

export type LegacyComponentEntry = {
  componentId: string;
  classification: LegacyDependencyClass;
  usedByNdxRoutes: string[];
  notes?: string;
};

export const NDX_LEGACY_DEPENDENCY_REGISTRY: LegacyComponentEntry[] = [
  {
    componentId: 'site00-project-lore-calibration',
    classification: 'MIGRATION_WRAPPER',
    usedByNdxRoutes: ['personality-replay', 'lore-calibration', 'experiment-d', 'experiment-g'],
    notes: 'Legacy hero pattern — NDX canonical routes must not depend on this',
  },
  {
    componentId: 'ProjectExperimentsHubNav',
    classification: 'MIGRATION_WRAPPER',
    usedByNdxRoutes: ['experiments-hub', 'character-discovery', 'visual-development'],
    notes: 'Duplicate nav when FounderWorkspaceShell rail present',
  },
  {
    componentId: 'site00-experiment-g__panel',
    classification: 'STILL_REQUIRED',
    usedByNdxRoutes: ['brand-character-readiness', 'embodied-character'],
    notes: 'Legacy card primitive — migrate to site00-fws-panel incrementally',
  },
  {
    componentId: 'site00-label-red',
    classification: 'USED_OUTSIDE_NDX',
    usedByNdxRoutes: ['evolve', 'brand-character-deepening'],
    notes: 'Host red label — valid for host/system, not NDX workspace canvas',
  },
  {
    componentId: 'site00-projects',
    classification: 'USED_OUTSIDE_NDX',
    usedByNdxRoutes: ['evolve'],
    notes: 'Project command layout — overview migrated to FWS',
  },
  {
    componentId: 'EcosystemShell',
    classification: 'STILL_REQUIRED',
    usedByNdxRoutes: ['*'],
    notes: 'Host shell — required parent; not duplicate of FWS',
  },
  {
    componentId: 'FounderWorkspaceShell',
    classification: 'STILL_REQUIRED',
    usedByNdxRoutes: ['*'],
    notes: 'Canonical NDX workspace interior',
  },
];

export function classifyLegacyDependency(componentId: string): LegacyDependencyClass {
  const entry = NDX_LEGACY_DEPENDENCY_REGISTRY.find((e) => e.componentId === componentId);
  return entry?.classification ?? 'UNKNOWN';
}

export const DUPLICATE_STYLE_AUDIT = [
  { id: 'experiment-card-styles', count: 2, canonical: 'site00-fws-asset', legacy: 'site00-experiment-g__panel' },
  { id: 'nav-wrappers', count: 2, canonical: 'site00-fws-rail', legacy: 'ProjectExperimentsHubNav' },
  { id: 'cream-backgrounds', count: 1, canonical: '--ndx-paper', legacy: 'site00-project-lore-calibration' },
  { id: 'lime-tokens', count: 1, canonical: '#B7D236', legacy: '#c8ff00' },
  { id: 'inspect-buttons', count: 1, canonical: 'site00-fws-inspect-trigger', legacy: 'inline methodology links' },
] as const;

export function legacyDependenciesIsolatedForCanonical(): boolean {
  const canonicalBlocked = NDX_LEGACY_DEPENDENCY_REGISTRY.filter(
    (e) => e.classification === 'MIGRATION_WRAPPER' || e.classification === 'SAFE_TO_REMOVE',
  );
  return canonicalBlocked.every((e) => e.usedByNdxRoutes.every((r) => !isCanonicalRoute(r)));
}

function isCanonicalRoute(routeId: string): boolean {
  const canonicalIds = [
    'overview',
    'content-operations',
    'campaign-board',
    'archive',
    'daily-plan',
    'ci-sources',
    'ci-weekly-forecast',
    'character-continuity',
    'motion-character',
    'marketing-expression',
    'content-library',
  ];
  return canonicalIds.includes(routeId);
}
