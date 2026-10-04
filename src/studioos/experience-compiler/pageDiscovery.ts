import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE00_ROUTES } from '../../site00/config/routes';
import { BLDR_ASSESSMENT_STATE_LIST } from '../../site00/config/bldr-assessment';
import { IDNTY_ASSESSMENT_STATE_LIST } from '../../site00/config/idnty-assessment';
import { EVOLVE_PATHS } from '../../site00/config/evolve';
import type { PageNode } from './types';
import { WAITING_FOR_AUTHORITY_ROUTES } from '../../site00/authority/publicRedesignAuthorityManifest';
import { classifyArchetypeForNode } from './archetypeRules';
import { resolveProductFamily } from './productFamily';

function read(p: string): string {
  return readFileSync(join(process.cwd(), p), 'utf8');
}

/** Static public route entries from SITE00_ROUTES (excludes project/admin production). */
export function discoverStaticPublicRoutes(): { key: string; route: string }[] {
  const out: { key: string; route: string }[] = [];
  for (const [key, val] of Object.entries(SITE00_ROUTES)) {
    if (typeof val !== 'string') continue;
    if (!val.startsWith('/')) continue;
    if (val.includes(':projectSlug') || val.includes('/projects/')) continue;
    if (val.startsWith('/admin/') || val.startsWith('/control/')) continue;
    if (val.startsWith('/app') || val.startsWith('/account')) continue;
    if (val.startsWith('/assts')) continue;
    if (val.includes('/debug/') || val.includes('production')) continue;
    if (val.includes('loader-preview') || val.includes('access/debug')) continue;
    out.push({ key, route: val });
  }
  return out;
}

export function discoverRoutePatternsFromRouter(): string[] {
  const routes = read('src/routes/Site00Routes.tsx');
  const paths = new Set<string>();
  const re = /path="([^"]+)"/g;
  let m: RegExpExecArray | null;
  const skipFragment = (p: string) =>
    p.includes('projects') ||
    p.includes('admin') ||
    p.includes('design-production') ||
    p.startsWith('app') ||
    p.startsWith('/app') ||
    p.includes('/account') ||
    p.startsWith('assts') ||
    p.startsWith('/assts') ||
    p.includes('__dev') ||
    p.includes('/control') ||
    p.includes('/access/debug') ||
    p.includes(':assetId') ||
    p === '/assets';
  while ((m = re.exec(routes))) {
    const p = m[1];
    if (skipFragment(p)) continue;
    paths.add(p.startsWith('/') ? p : `/${p}`);
  }
  return [...paths].sort();
}

function baseNode(partial: Partial<PageNode> & Pick<PageNode, 'page_id' | 'route' | 'product_family'>): PageNode {
  const route_pattern = partial.route_pattern ?? partial.route;
  const archetypes = classifyArchetypeForNode(partial.route, partial.screen_type ?? 'route', partial.product_family);
  return {
    route_pattern,
    parent_route: null,
    subfamily: null,
    component: partial.component ?? 'unknown',
    source_file: partial.source_file ?? 'src/routes/Site00Routes.tsx',
    route_status: partial.route_status ?? 'LIVE',
    public_or_internal: partial.public_or_internal ?? 'PUBLIC',
    auth_requirement: partial.auth_requirement ?? 'NONE',
    mobile_status: partial.mobile_status ?? 'LIVE',
    desktop_status: partial.desktop_status ?? 'LIVE',
    screen_type: partial.screen_type ?? 'route',
    stateful: partial.stateful ?? false,
    modal_or_overlay: partial.modal_or_overlay ?? false,
    wizard_or_flow: partial.wizard_or_flow ?? false,
    flow_id: partial.flow_id ?? null,
    step_index: partial.step_index ?? null,
    conditional: partial.conditional ?? false,
    data_dependencies: partial.data_dependencies ?? [],
    existing_design_status: partial.existing_design_status ?? 'LEGACY_OR_MIXED',
    current_authority_status: partial.current_authority_status ?? 'UNKNOWN',
    primary_archetype: archetypes.primary,
    secondary_archetype: archetypes.secondary,
    classification: 'CREATIVE_AUTHORITY_REQUIRED',
    derivation_confidence: 'LOW',
    notes: partial.notes ?? '',
    ...partial,
  };
}

export function discoverIdntyFlowScreens(): PageNode[] {
  const nodes: PageNode[] = [];
  for (const state of IDNTY_ASSESSMENT_STATE_LIST) {
    const stateRoute = `/idnty/${state.slug}`;
    nodes.push(
      baseNode({
        page_id: `idnty_state_${state.id}_landing`,
        route: stateRoute,
        route_pattern: '/idnty/:stateSlug',
        product_family: 'IDNTY',
        subfamily: state.id,
        component: 'IdentityDiagnosticFlow(mode=detail)',
        source_file: 'src/site00/config/idnty-assessment.ts',
        wizard_or_flow: true,
        flow_id: `idnty_${state.id}`,
        screen_type: 'state_landing',
        notes: 'State landing — diagnostic detail authority or derivable.',
      }),
    );
    state.steps.forEach((step, idx) => {
      const route = `${stateRoute}/${step.id}`;
      nodes.push(
        baseNode({
          page_id: `idnty_${state.id}_step_${step.id}`,
          route,
          route_pattern: '/idnty/:stateSlug/:stepId',
          parent_route: stateRoute,
          product_family: 'IDNTY',
          subfamily: state.id,
          component: 'IdentityDiagnosticFlow(mode=question)',
          source_file: 'src/site00/config/idnty-assessment.ts',
          wizard_or_flow: true,
          flow_id: `idnty_${state.id}`,
          step_index: idx + 1,
          screen_type: 'question',
          data_dependencies: ['useIdntyAssessment', 'site00_idnty_assessment_v1'],
          notes: step.title,
        }),
      );
    });
    nodes.push(
      baseNode({
        page_id: `idnty_${state.id}_review`,
        route: `${stateRoute}/review`,
        route_pattern: '/idnty/:stateSlug/review',
        parent_route: stateRoute,
        product_family: 'IDNTY',
        subfamily: state.id,
        component: 'IdentityDiagnosticFlow(mode=review)',
        screen_type: 'review',
        flow_id: `idnty_${state.id}`,
        data_dependencies: ['useIdntyAssessment'],
      }),
    );
    if (state.id === 'build-ready') {
      for (const stepId of ['verification', 'evidence', 'authority-check'] as const) {
        nodes.push(
          baseNode({
            page_id: `idnty_build-ready_${stepId}`,
            route: `${stateRoute}/${stepId}`,
            route_pattern: `/idnty/:stateSlug/${stepId}`,
            product_family: 'IDNTY',
            subfamily: 'build-ready',
            component: 'IdentityDiagnosticFlow + BuildReady lists',
            screen_type: stepId === 'evidence' ? 'question' : 'question',
            flow_id: 'idnty_build-ready',
            notes: 'Build Ready verification — not BLDR intake.',
          }),
        );
      }
    }
    for (const suffix of ['complete', 'discovery-result'] as const) {
      nodes.push(
        baseNode({
          page_id: `idnty_${state.id}_${suffix}`,
          route: `${stateRoute}/${suffix}`,
          route_pattern: `/idnty/:stateSlug/${suffix}`,
          parent_route: stateRoute,
          product_family: 'IDNTY',
          subfamily: state.id,
          component: suffix === 'complete' ? 'IdntyAssessmentCompletePage' : 'IdntyDiscoveryResultPage',
          screen_type: 'result',
          flow_id: `idnty_${state.id}`,
          notes: 'No authority in pack — WAITING_FOR_AUTHORITY.',
          current_authority_status: 'WAITING_FOR_AUTHORITY',
        }),
      );
    }
  }
  return nodes;
}

export function discoverBldrFlowScreens(): PageNode[] {
  const nodes: PageNode[] = [];
  for (const state of BLDR_ASSESSMENT_STATE_LIST) {
    const base = `/bldr/${state.slug}`;
    nodes.push(
      baseNode({
        page_id: `bldr_${state.id}_landing`,
        route: base,
        route_pattern: '/bldr/:classSlug',
        product_family: 'BLDR',
        subfamily: state.id,
        component: 'BldrAssessmentLanding',
        source_file: 'src/site00/config/bldr-assessment.ts',
        wizard_or_flow: true,
        flow_id: `bldr_${state.id}`,
        screen_type: 'assessment_landing',
        notes: 'BLDR intake — not same as IDNTY Build Ready verification.',
      }),
    );
    state.steps.forEach((step, idx) => {
      nodes.push(
        baseNode({
          page_id: `bldr_${state.id}_step_${step.id}`,
          route: `${base}/${step.id}`,
          route_pattern: '/bldr/:classSlug/:stepId',
          parent_route: base,
          product_family: 'BLDR',
          subfamily: state.id,
          component: 'BldrAssessmentStepPage',
          wizard_or_flow: true,
          flow_id: `bldr_${state.id}`,
          step_index: idx + 1,
          screen_type: 'question',
          data_dependencies: ['useBldrAssessment'],
        }),
      );
    });
    nodes.push(
      baseNode({
        page_id: `bldr_${state.id}_review`,
        route: `${base}/review`,
        route_pattern: '/bldr/:classSlug/review',
        product_family: 'BLDR',
        subfamily: state.id,
        component: 'BldrAssessmentReviewPage',
        screen_type: 'review',
        flow_id: `bldr_${state.id}`,
      }),
    );
  }
  return nodes;
}

export function discoverEvolveFlowScreens(): PageNode[] {
  const nodes: PageNode[] = [];
  for (const path of EVOLVE_PATHS) {
    const base = `/evolve/${path.id}`;
    nodes.push(
      baseNode({
        page_id: `evolve_${path.id}_property`,
        route: `${base}/property`,
        route_pattern: '/evolve/:pathSlug/property',
        product_family: 'PUBLIC_EVOLVE',
        subfamily: path.id,
        component: 'EvolveAssessmentPropertyStep',
        wizard_or_flow: true,
        flow_id: `evolve_${path.id}`,
        screen_type: 'question',
        notes: 'Public EVOLVE assessment — not IDNTY ready-for-evolution.',
      }),
    );
    nodes.push(
      baseNode({
        page_id: `evolve_${path.id}_review`,
        route: `${base}/review`,
        route_pattern: '/evolve/:pathSlug/review',
        product_family: 'PUBLIC_EVOLVE',
        subfamily: path.id,
        component: 'EvolveAssessmentReviewPage',
        screen_type: 'review',
        flow_id: `evolve_${path.id}`,
      }),
    );
  }
  return nodes;
}

export function discoverOriginStatefulScreens(): PageNode[] {
  return (['idnty-expanded', 'bldr-expanded', 'evolve-expanded'] as const).map((mode) =>
    baseNode({
      page_id: `origin_panel_${mode}`,
      route: '/',
      route_pattern: '/?homeMode=' + mode,
      product_family: 'ORIGIN',
      component: 'PublicOriginExpandedPanel',
      source_file: 'src/site00/pages/OriginPage.tsx',
      stateful: true,
      modal_or_overlay: true,
      screen_type: 'expanded_panel',
      notes: `Site00Context.homeMode=${mode}`,
    }),
  );
}

export function discoverDesktopBranches(): PageNode[] {
  return [
    baseNode({
      page_id: 'origin_desktop',
      route: SITE00_ROUTES.originDesktop,
      product_family: 'ORIGIN',
      component: 'OriginPage desktop artboard',
      screen_type: 'desktop_branch',
      mobile_status: 'DESKTOP_ONLY',
      desktop_status: 'LIVE',
    }),
    baseNode({
      page_id: 'idnty_state_desktop',
      route: SITE00_ROUTES.idntyStateDesktop,
      product_family: 'IDNTY',
      component: 'IdntyDesktopStatePageBody',
      screen_type: 'desktop_branch',
      mobile_status: 'DESKTOP_ONLY',
    }),
    baseNode({
      page_id: 'bldr_state_desktop',
      route: SITE00_ROUTES.bldrStateDesktop,
      product_family: 'BLDR',
      screen_type: 'desktop_branch',
      mobile_status: 'DESKTOP_ONLY',
    }),
    baseNode({
      page_id: 'evolve_state_desktop',
      route: SITE00_ROUTES.evolveStateDesktop,
      product_family: 'PUBLIC_EVOLVE',
      screen_type: 'desktop_branch',
      mobile_status: 'DESKTOP_ONLY',
    }),
  ];
}

export function discoverAllPageNodes(): PageNode[] {
  const byId = new Map<string, PageNode>();

  for (const { key, route } of discoverStaticPublicRoutes()) {
    const family = resolveProductFamily(route);
    const id = `route_${key}`;
    byId.set(
      id,
      baseNode({
        page_id: id,
        route,
        product_family: family,
        component: key,
        source_file: 'src/site00/config/routes.ts',
        screen_type: 'route_constant',
        notes: `SITE00_ROUTES.${key}`,
      }),
    );
  }

  for (const p of discoverRoutePatternsFromRouter()) {
    const id = `pattern_${p.replace(/[^a-z0-9]+/gi, '_')}`;
    if (byId.has(id)) continue;
    byId.set(
      id,
      baseNode({
        page_id: id,
        route: p,
        route_pattern: p,
        product_family: resolveProductFamily(p),
        screen_type: 'router_pattern',
        source_file: 'src/routes/Site00Routes.tsx',
      }),
    );
  }

  for (const n of [
    ...discoverOriginStatefulScreens(),
    ...discoverIdntyFlowScreens(),
    ...discoverBldrFlowScreens(),
    ...discoverEvolveFlowScreens(),
    ...discoverDesktopBranches(),
    ...discoverWaitingAuthorityPlaceholders(),
  ]) {
    byId.set(n.page_id, n);
  }

  return [...byId.values()].sort((a, b) => a.route.localeCompare(b.route) || a.page_id.localeCompare(b.page_id));
}

/** Placeholder nodes for routes explicitly flagged in authority manifest (e.g. checkout). */
function discoverWaitingAuthorityPlaceholders(): PageNode[] {
  const samples: Record<string, string[]> = {
    '/checkout/*': ['/checkout', '/checkout/cart', '/checkout/shipping', '/checkout/payment', '/checkout/review', '/checkout/confirmation'],
  };
  const nodes: PageNode[] = [];
  for (const w of WAITING_FOR_AUTHORITY_ROUTES) {
    const routes = samples[w.route] ?? [w.route.replace('/*', '/index')];
    for (const route of routes) {
      nodes.push(
        baseNode({
          page_id: `waiting_${route.replace(/[^a-z0-9]+/gi, '_')}`,
          route,
          route_pattern: w.route,
          product_family: resolveProductFamily(route),
          screen_type: 'route',
          current_authority_status: 'WAITING_FOR_AUTHORITY',
          notes: w.reason,
        }),
      );
    }
  }
  return nodes;
}
