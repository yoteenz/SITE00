/**
 * ChildSurfaceClassifier — classify each child by functional archetype.
 */

import type { ChildSurfaceArchetype, ChildSurfaceDescriptor, ParentChildRouteNode } from './types.js';

const ROUTE_ARCHETYPE_RULES: Array<{ pattern: RegExp; archetype: ChildSurfaceArchetype }> = [
  { pattern: /\/overview$|\/origin$|\/enter$|^\/$/, archetype: 'LANDING' },
  { pattern: /\/more(\?|$)/, archetype: 'SETTINGS' },
  { pattern: /\/library|\/assets/, archetype: 'LIBRARY' },
  { pattern: /\/edit|\/editor/, archetype: 'EDITOR' },
  { pattern: /\/wizard|\/intake|\/calibrat|\/brief/, archetype: 'INTAKE' },
  { pattern: /\/form|\/submit/, archetype: 'FORM' },
  { pattern: /\/gallery|\/carousel/, archetype: 'GALLERY' },
  { pattern: /\/review|\/dailies/, archetype: 'REVIEW' },
  { pattern: /\/compare/, archetype: 'COMPARISON' },
  { pattern: /\/search/, archetype: 'SEARCH' },
  { pattern: /\/results/, archetype: 'RESULTS' },
  { pattern: /\/timeline|\/activity/, archetype: 'TIMELINE' },
  { pattern: /\/inbox|\/messages/, archetype: 'MESSAGING' },
  { pattern: /\/media|\/film-production/, archetype: 'MEDIA' },
  { pattern: /\/map/, archetype: 'MAP' },
  { pattern: /\/workspace|\/production/, archetype: 'WORKSPACE' },
  { pattern: /\/settings|\/system|\/providers|\/capture|\/route-audit/, archetype: 'SETTINGS' },
  { pattern: /\/operations|\/control/, archetype: 'OPERATIONS' },
  { pattern: /\/status/, archetype: 'STATUS' },
  { pattern: /\/checkout/, archetype: 'CHECKOUT' },
  { pattern: /\/profile/, archetype: 'PROFILE' },
  { pattern: /\/detail|\/entry\/|\/:[^/]+$/, archetype: 'DETAIL' },
  { pattern: /\/list|\/queue|\/projects$/, archetype: 'LIST' },
];

const MODULE_ARCHETYPE_MAP: Record<string, ChildSurfaceArchetype> = {
  SKINS: 'GALLERY',
  PAGES: 'LIST',
  ASSETS: 'LIBRARY',
  MORE: 'SETTINGS',
  CAMPAIGN_BOARD: 'WORKSPACE',
  REALISM_LAB: 'FULLSCREEN_TOOL',
  WIZARD: 'WIZARD',
};

function classifyFromRoute(route: string): ChildSurfaceArchetype | null {
  for (const rule of ROUTE_ARCHETYPE_RULES) {
    if (rule.pattern.test(route)) return rule.archetype;
  }
  return null;
}

function classifyFromDescriptor(descriptor: ChildSurfaceDescriptor): ChildSurfaceArchetype {
  if (descriptor.hasMediaCanvas && descriptor.interactionDensity === 'HIGH') return 'FULLSCREEN_TOOL';
  if (descriptor.hasFormFields && descriptor.interactionDensity === 'HIGH') return 'FORM';
  if (descriptor.hasDataTables && !descriptor.hasGenericAdminFallback) return 'LIST';
  if (descriptor.hasGenericAdminFallback) return 'OPERATIONS';
  return 'OTHER';
}

export function classifyChildSurface(input: {
  node: ParentChildRouteNode;
  descriptor?: ChildSurfaceDescriptor;
}): ChildSurfaceArchetype {
  const moduleType = input.descriptor?.moduleScreenType ?? (input.node.metadata?.moduleScreenType as string | undefined);
  if (moduleType && MODULE_ARCHETYPE_MAP[moduleType]) {
    return MODULE_ARCHETYPE_MAP[moduleType];
  }

  const fromRoute = classifyFromRoute(input.node.route);
  if (fromRoute) return fromRoute;

  if (input.descriptor) return classifyFromDescriptor(input.descriptor);

  if (input.node.kind === 'MODAL') return 'REVIEW';
  if (input.node.kind === 'DRAWER') return 'OPERATIONS';
  if (input.node.kind === 'TAB_STATE') return 'LIST';
  if (input.node.kind === 'WORKSPACE') return 'WORKSPACE';

  return 'OTHER';
}

export function classifyChildSurfaces(input: {
  nodes: ParentChildRouteNode[];
  descriptors?: ChildSurfaceDescriptor[];
}): Map<string, ChildSurfaceArchetype> {
  const descriptorByRoute = new Map(
    (input.descriptors ?? []).map((d) => [d.route, d]),
  );

  const result = new Map<string, ChildSurfaceArchetype>();
  for (const node of input.nodes) {
    if (node.kind === 'LANDING') continue;
    result.set(
      node.nodeId,
      classifyChildSurface({ node, descriptor: descriptorByRoute.get(node.route) }),
    );
  }
  return result;
}
