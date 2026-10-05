/**
 * PageRouteCompletionEngine
 */

import type { PageInteractionContract, RequiredChildSurface } from './types.js';

export function discoverExistingRoutes(projectRoutes: string[]): string[] {
  return [...new Set(projectRoutes.filter(Boolean))];
}

export function inferRequiredRoutes(
  contracts: PageInteractionContract[],
  childSurfaces: RequiredChildSurface[],
): string[] {
  const fromContracts = contracts.map((c) => c.route).filter(Boolean) as string[];
  const fromChildren = childSurfaces.map((c) => c.route).filter(Boolean) as string[];
  return [...new Set([...fromContracts, ...fromChildren])];
}

export function compareRequiredVsExisting(required: string[], existing: string[]): {
  missing: string[];
  present: string[];
} {
  const present = required.filter((r) => existing.some((e) => e === r || e.startsWith(r) || r.startsWith(e)));
  const missing = required.filter((r) => !present.includes(r));
  return { missing, present };
}

export function createMissingRoutePlan(missing: string[]): Array<{ route: string; priority: 'BLOCKING' | 'NORMAL'; presentation: string }> {
  return missing.map((route) => ({
    route,
    priority: 'BLOCKING' as const,
    presentation: route.includes('authority') ? 'SHEET' : route.includes('detail') ? 'CHILD_ROUTE' : 'FULL_ROUTE',
  }));
}

export function choosePresentation(input: {
  complexity: 'LOW' | 'HIGH';
  deepLinkValue: boolean;
  mobile: boolean;
  intent: string;
}): 'ROUTE' | 'MODAL' | 'SHEET' | 'DRAWER' | 'TAB_STATE' {
  if (input.intent.includes('TAB')) return 'TAB_STATE';
  if (input.intent.includes('FILTER') || input.intent.includes('SORT')) return 'TAB_STATE';
  if (input.mobile && input.complexity === 'HIGH') return 'SHEET';
  if (input.complexity === 'LOW' && !input.deepLinkValue) return 'MODAL';
  return 'ROUTE';
}
