import {
  PUBLIC_REDESIGN_AUTHORITY_RECORDS,
  SUPERSEDED_AUTHORITY_IDS,
  type AuthorityRecord,
} from '../../site00/authority/publicRedesignAuthorityManifest';
import type { AuthorityRegistryEntry } from './types';

function archetypeFromRecord(r: AuthorityRecord): string {
  if (r.pageFamily === 'ORIGIN') return 'ENTRY';
  if (r.route.endsWith('/review') || r.component.includes('review')) return 'REVIEW';
  if (r.component.includes('question')) {
    if (r.route.includes('audience') || r.route.includes('goals')) return 'TEXT_INPUT';
    if (r.route.includes('assets') || r.route.includes('gaps')) return 'MULTI_SELECT';
    return 'SINGLE_SELECT';
  }
  if (r.pageFamily.includes('BUILD_READY')) return 'VERIFICATION';
  if (r.pageFamily.includes('DIAGNOSTIC') && r.state === 'overview') return 'STATE_SELECTOR';
  if (r.pageFamily.includes('PATH_PANEL')) return 'ROUTE_SELECTOR';
  if (r.pageFamily.includes('COMMAND') || r.pageFamily.includes('INTERVENTION')) return 'STATE_SELECTOR';
  if (r.family === 'LOCATIONS') return 'LOCATIONS';
  return 'HUB';
}

export function ingestAuthorities(): {
  active: AuthorityRegistryEntry[];
  superseded: string[];
} {
  const superseded = [...SUPERSEDED_AUTHORITY_IDS];
  const active: AuthorityRegistryEntry[] = PUBLIC_REDESIGN_AUTHORITY_RECORDS.map((r) => ({
    authority_id: r.id,
    family: r.family,
    subfamily: r.pageFamily,
    screen_name: r.id,
    source_path: r.packPath,
    route: r.route,
    archetype: archetypeFromRecord(r),
    viewport: `${r.viewport.w}x${r.viewport.h}`,
    status: r.status,
    approved: true,
    superseded: false,
    primary_visual_responsibilities: [r.pageFamily, r.family],
    interaction_grammar: r.component,
    machine_grammar: r.assetSlots.filter((s) => s.startsWith('MACHINE.')).join(', ') || 'family machine slot',
    shell_grammar: 'SITE00_PUBLIC_GLOBAL',
    panel_grammar: r.family === 'IDNTY' ? 'IDNTY_WORKING_PANEL' : `${r.family}_PANEL`,
    navigation_grammar: 'SITE00_PUBLIC_GLOBAL',
    typography_grammar: 'SITE00_PUBLIC_GLOBAL_UPPERCASE',
    responsive_grammar: 'MOBILE_AUTHORITY_VIEWPORT',
    known_limitations: r.notes ? [r.notes] : [],
    notes: r.notes ?? '',
  }));

  for (const id of superseded) {
    active.push({
      authority_id: id,
      family: 'IDNTY',
      subfamily: 'SUPERSEDED',
      screen_name: id,
      source_path: `99_SUPERSEDED_DO_NOT_USE/${id}.jpg`,
      route: '',
      archetype: 'MULTI_STEP_INTAKE',
      viewport: 'unknown',
      status: 'SUPERSEDED_REJECTED',
      approved: false,
      superseded: true,
      primary_visual_responsibilities: [],
      interaction_grammar: 'none',
      machine_grammar: 'none',
      shell_grammar: 'none',
      panel_grammar: 'none',
      navigation_grammar: 'none',
      typography_grammar: 'none',
      responsive_grammar: 'none',
      known_limitations: ['Never eligible for inheritance'],
      notes: 'Superseded — excluded from compiler inheritance.',
    });
  }

  return { active, superseded };
}

export function normalizeRouteForMatch(route: string): string {
  return route.split('?')[0].replace(/\/$/, '') || '/';
}

export function findAuthorityForRoute(route: string): AuthorityRegistryEntry | undefined {
  const norm = normalizeRouteForMatch(route);
  const { active } = ingestAuthorities();
  const approved = active.filter((a) => a.approved && !a.superseded);
  const exact = approved.find((a) => normalizeRouteForMatch(a.route) === norm);
  if (exact) return exact;
  if (route.includes('?path=')) {
    const path = new URL(route, 'https://site00.com').searchParams.get('path');
    if (path) {
      return approved.find((a) => a.route.includes(`path=${path}`));
    }
  }
  return undefined;
}
