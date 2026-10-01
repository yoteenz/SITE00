import type { AuthorityPlanEntry, ExperienceSurface, FamilySurfaceExpression } from './map2Types';
import { assertAuthorityPlanAllowed } from './familySurfaceGate';
import type { FamilySurfaceGate } from './map2Types';
import type { ExperienceFamily } from './map2Types';

export type AuthorityReductionStats = {
  route_count: number;
  authority_count: number;
  reduction_ratio: number;
  surface_authority_count: Record<ExperienceSurface, number>;
};

export function compileAuthorityPlan(
  families: ExperienceFamily[],
  surfaces: FamilySurfaceExpression[],
  gateB: FamilySurfaceGate,
): AuthorityPlanEntry[] {
  assertAuthorityPlanAllowed(gateB);
  const approved = new Set(gateB.approved_family_ids);
  const plan: AuthorityPlanEntry[] = [];
  let seq = 1;
  for (const family of families) {
    if (!approved.has(family.family_id)) continue;
    const familySurfaces = surfaces.filter((s) => s.family_id === family.family_id);
    const needsMobile = familySurfaces.some((s) => s.surface === 'MOBILE_WEB' && s.mobile_authority_required);
    const needsDesktop = familySurfaces.some((s) => s.surface === 'DESKTOP_WEB' && s.desktop_authority_required);
    const needsApp = familySurfaces.some((s) => s.surface === 'APP' && s.app_relationship !== 'NOT_REQUIRED');

    const representatives: { surface: ExperienceSurface; state: string; routes: number }[] = [];
    if (needsMobile) representatives.push({ surface: 'MOBILE_WEB', state: 'ENTRY', routes: Math.max(1, Math.floor(family.route_ids.length * 0.6)) });
    if (needsDesktop) representatives.push({ surface: 'DESKTOP_WEB', state: 'WORKSPACE', routes: Math.max(1, Math.floor(family.route_ids.length * 0.5)) });
    if (needsApp) representatives.push({ surface: 'APP', state: 'APP_HOME', routes: Math.max(1, Math.floor(family.route_ids.length * 0.3)) });
    if (representatives.length === 0) {
      representatives.push({ surface: 'MOBILE_WEB', state: 'REPRESENTATIVE', routes: family.route_ids.length });
    }

    for (const rep of representatives) {
      const authority_id = `${String(seq).padStart(2, '0')}_${family.family_id}_${rep.surface}`;
      plan.push({
        authority_id,
        experience_unit: family.experience_unit_kinds[0] ?? 'STANDARD_PAGE',
        family_id: family.family_id,
        archetype: rep.surface === 'DESKTOP_WEB' ? 'DESKTOP_WORKSPACE' : 'MOBILE_FIRST',
        surface: rep.surface,
        screen_or_state: rep.state,
        routes_unlocked: rep.routes,
        states_unlocked: family.family_id.includes('CONFIGURATOR') ? 4 : 2,
        surfaces_unlocked: representatives.map((r) => r.surface),
        inheritance: family.inheritance_layers,
        new_grammar: family.family_id.includes('CONFIGURATOR'),
        visual_objective: `Representative ${family.name} on ${rep.surface}`,
        interaction_objective: family.grammar_description,
        generation_prompt: `[OpenArt GPT Image 2] ${family.name} ${rep.state} ${rep.surface} — brand-specific, not generic template`,
        approval_status: 'PLANNED',
      });
      seq++;
    }
  }
  return plan;
}

export function computeAuthorityReduction(routeCount: number, plan: AuthorityPlanEntry[]): AuthorityReductionStats {
  const surface_authority_count = { MOBILE_WEB: 0, TABLET_WEB: 0, DESKTOP_WEB: 0, APP: 0 } as Record<ExperienceSurface, number>;
  for (const e of plan) surface_authority_count[e.surface]++;
  return {
    route_count: routeCount,
    authority_count: plan.length,
    reduction_ratio: routeCount > 0 ? routeCount / Math.max(plan.length, 1) : 0,
    surface_authority_count,
  };
}

export function authorityLeverageSummary(entry: AuthorityPlanEntry): string {
  return `Unlocks ~${entry.routes_unlocked} routes, ${entry.states_unlocked} states, surfaces: ${entry.surfaces_unlocked.join(', ')}`;
}
