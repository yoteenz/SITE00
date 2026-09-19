/**
 * P0.VR.3A — SITE 00 route dependency graph.
 */

import type { Site00RouteDependencyGraph } from '../p0vr3/types.js';
import { buildSite00DiscoveredRoutes, buildSite00MissingRoutes } from './site00RouteForensics.js';

export function buildSite00RouteDependencyGraph(): Site00RouteDependencyGraph {
  const routes = buildSite00DiscoveredRoutes();
  const missing = buildSite00MissingRoutes();
  const byId = new Map(routes.map((r) => [r.screenId, r]));

  const edges: Site00RouteDependencyGraph['edges'] = [
    { fromScreenId: 'homepage', toScreenId: 'homepage-idnty-expanded', flowId: 'origin-home', label: 'expand identity' },
    { fromScreenId: 'homepage', toScreenId: 'homepage-bldr-expanded', flowId: 'origin-home', label: 'expand builder' },
    { fromScreenId: 'homepage', toScreenId: 'identity-hub', flowId: 'origin-identity', label: 'navigate' },
    { fromScreenId: 'homepage', toScreenId: 'builder-hub', flowId: 'origin-builder', label: 'navigate' },
    { fromScreenId: 'homepage', toScreenId: 'waiting-room', flowId: 'origin-enter', label: 'enter 00' },
    { fromScreenId: 'waiting-room', toScreenId: 'waiting-room-menu-open', flowId: 'waiting-room', label: 'open directory' },
    { fromScreenId: 'waiting-room', toScreenId: 'system', flowId: 'waiting-room-info', label: 'system' },
    { fromScreenId: 'waiting-room', toScreenId: 'about', flowId: 'waiting-room-info', label: 'about' },
    { fromScreenId: 'waiting-room', toScreenId: 'support', flowId: 'waiting-room-info', label: 'support' },
    { fromScreenId: 'identity-hub', toScreenId: 'identity-state', flowId: 'identity-flow', label: 'begin' },
    { fromScreenId: 'identity-state', toScreenId: 'identity-begin-starting-at-zero', flowId: 'identity-flow', label: 'assessment' },
    { fromScreenId: 'identity-state', toScreenId: 'identity-begin-some-pieces', flowId: 'identity-flow', label: 'assessment' },
    { fromScreenId: 'identity-hub', toScreenId: 'identity-sign-in-security', flowId: 'identity-flow', label: 'security' },
    { fromScreenId: 'identity-hub', toScreenId: 'missing-brand-page', flowId: 'identity-flow', label: 'brand (missing)' },
    { fromScreenId: 'builder-hub', toScreenId: 'builder-state', flowId: 'builder-flow', label: 'classify' },
    { fromScreenId: 'builder-state', toScreenId: 'builder-select-site', flowId: 'builder-flow', label: 'select site' },
    { fromScreenId: 'builder-state', toScreenId: 'builder-select-world', flowId: 'builder-flow', label: 'select world' },
    { fromScreenId: 'builder-hub', toScreenId: 'builder-templates', flowId: 'builder-flow', label: 'templates' },
    { fromScreenId: 'builder-hub', toScreenId: 'studio-blueprint', flowId: 'builder-blueprint', label: 'blueprint' },
    { fromScreenId: 'system', toScreenId: 'identity-hub', flowId: 'system-map', label: 'identity' },
    { fromScreenId: 'system', toScreenId: 'builder-hub', flowId: 'system-map', label: 'builder' },
    { fromScreenId: 'system', toScreenId: 'asset-vault', flowId: 'system-map', label: 'asset vault' },
    { fromScreenId: 'asset-vault', toScreenId: 'asset-vault-batch', flowId: 'asset-vault', label: 'batch review' },
    { fromScreenId: 'sign-in', toScreenId: 'create-account', flowId: 'account-auth', label: 'register' },
    { fromScreenId: 'sign-in', toScreenId: 'missing-forgot-password', flowId: 'account-auth', label: 'forgot (missing)' },
    { fromScreenId: 'sign-in', toScreenId: 'projects-index', flowId: 'account-auth', label: 'post-auth' },
    { fromScreenId: 'projects-index', toScreenId: 'account-intakes', flowId: 'account', label: 'intakes' },
    { fromScreenId: 'projects-index', toScreenId: 'control-room', flowId: 'account', label: 'control' },
  ];

  const flows = [...new Set(edges.map((e) => e.flowId))];
  const closureByScreenId: Site00RouteDependencyGraph['closureByScreenId'] = {};

  for (const route of routes) {
    closureByScreenId[route.screenId] = route.dependencyClosure ?? 'INCOMPLETE';
  }
  for (const m of missing) {
    closureByScreenId[m.screenId] = 'MISSING_ROUTE';
  }

  // Mark broken if parent exists but child is missing
  for (const edge of edges) {
    if (edge.toScreenId.startsWith('missing-') && byId.has(edge.fromScreenId)) {
      const parent = closureByScreenId[edge.fromScreenId];
      if (parent === 'COMPLETE') closureByScreenId[edge.fromScreenId] = 'INCOMPLETE';
    }
  }

  return { flows, edges, closureByScreenId };
}

export function formatSite00RouteMapTree(): string {
  const graph = buildSite00RouteDependencyGraph();
  const routes = buildSite00DiscoveredRoutes();
  const families = [...new Set(routes.map((r) => r.routeFamily ?? 'OTHER'))].sort();
  const lines: string[] = ['SITE 00'];
  for (const family of families) {
    lines.push(`├── ${family}`);
    const familyRoutes = routes.filter((r) => (r.routeFamily ?? 'OTHER') === family);
    for (const r of familyRoutes) {
      const children = graph.edges.filter((e) => e.fromScreenId === r.screenId);
      lines.push(`│   ├── ${r.displayName} (${r.resolvedRoute})`);
      for (const child of children.slice(0, 3)) {
        lines.push(`│   │   └── ${child.label ?? child.toScreenId}`);
      }
    }
  }
  return lines.join('\n');
}
