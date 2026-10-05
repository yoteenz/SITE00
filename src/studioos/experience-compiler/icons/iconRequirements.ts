import type { CreativeExperienceGraph, CustomExperienceDefinition, ExperienceFamily, IntegrationOpportunity, ProjectExperienceIntelligence } from '../map2/map2Types';
import type { FamilySurfaceExpression } from '../map2/map2Types';
import { getGlobalSemantic, GLOBAL_ICON_SEMANTICS } from './iconSemantics';
import { applyClassification } from './iconClassifier';
import type { IconRequirement, IconRequirementManifest, IconSemanticId } from './iconTypes';

function surfacesFromExpressions(expressions: FamilySurfaceExpression[], familyId: string) {
  return expressions.filter((e) => e.family_id === familyId).map((e) => e.surface);
}

function baseReq(partial: Partial<IconRequirement> & Pick<IconRequirement, 'icon_semantic_id' | 'canonical_name' | 'meaning' | 'category'>): IconRequirement {
  return applyClassification({
    usage_context: partial.usage_context ?? 'Project-wide',
    experience_units: partial.experience_units ?? [],
    families: partial.families ?? [],
    routes: partial.routes ?? [],
    surfaces: partial.surfaces ?? ['MOBILE_WEB', 'DESKTOP_WEB'],
    required_sizes: partial.required_sizes ?? [16, 24, 32],
    interaction_states: partial.interaction_states ?? ['DEFAULT', 'ACTIVE', 'DISABLED'],
    frequency: partial.frequency ?? 'MEDIUM',
    prominence: partial.prominence ?? 'SECONDARY',
    accessibility_label_requirement: partial.accessibility_label_requirement ?? partial.meaning,
    can_use_live_svg: partial.can_use_live_svg ?? false,
    brand_expression_required: partial.brand_expression_required ?? true,
    micro_asset_candidate: partial.micro_asset_candidate ?? false,
    app_nav_variant_required: partial.app_nav_variant_required ?? false,
    compact_variant_required: partial.compact_variant_required ?? true,
    display_variant_required: partial.display_variant_required ?? false,
    notes: partial.notes ?? '',
    ...partial,
  });
}

function collapseDuplicateSemantics(requirements: IconRequirement[]): IconRequirement[] {
  const byId = new Map<IconSemanticId, IconRequirement>();
  for (const r of requirements) {
    const existing = byId.get(r.icon_semantic_id);
    if (!existing) {
      byId.set(r.icon_semantic_id, r);
      continue;
    }
    byId.set(r.icon_semantic_id, {
      ...existing,
      routes: [...new Set([...existing.routes, ...r.routes])],
      families: [...new Set([...existing.families, ...r.families])],
      surfaces: [...new Set([...existing.surfaces, ...r.surfaces])],
      experience_units: [...new Set([...existing.experience_units, ...r.experience_units])],
      frequency: existing.frequency === 'HIGH' || r.frequency === 'HIGH' ? 'HIGH' : existing.frequency,
    });
  }
  return [...byId.values()];
}

function iconsFromGraphNode(
  _graph: CreativeExperienceGraph,
  family: ExperienceFamily,
  surfaces: ReturnType<typeof surfacesFromExpressions>,
): IconRequirement[] {
  const reqs: IconRequirement[] = [];
  const routes = family.route_ids;
  if (family.family_id.includes('CONFIGURATOR')) {
    for (const sem of ['SEM_CONFIGURE', 'SEM_PREVIEW', 'SEM_CONFIRM', 'SEM_RESET', 'SEM_SELECT', 'SEM_ROTATE']) {
      const global = getGlobalSemantic(sem);
      if (global) {
        reqs.push(
          baseReq({
            icon_semantic_id: global.semantic_id,
            canonical_name: global.canonical_name,
            meaning: global.meaning,
            category: global.default_category,
            families: [family.family_id],
            routes,
            surfaces,
            brand_expression_required: true,
            can_use_live_svg: sem === 'SEM_RESET',
            usage_context: 'Product configurator controls',
          }),
        );
      }
    }
  }
  if (family.experience_unit_kinds.includes('NAVIGATION' as never) || family.family_id.includes('EDITORIAL')) {
    const nav = getGlobalSemantic('SEM_BACK');
    if (nav) {
      reqs.push(
        baseReq({
          ...nav,
          icon_semantic_id: nav.semantic_id,
          category: 'NAVIGATION',
          families: [family.family_id],
          routes,
          surfaces,
          can_use_live_svg: true,
          brand_expression_required: false,
        }),
      );
    }
  }
  if (family.family_id.includes('TRANSACTION')) {
    reqs.push(
      baseReq({
        icon_semantic_id: 'SEM_CHECKOUT_DOMAIN',
        canonical_name: 'CHECKOUT',
        meaning: 'Commerce checkout',
        category: 'COMMERCE',
        families: [family.family_id],
        routes,
        surfaces,
        brand_expression_required: true,
      }),
    );
  }
  if (family.family_id.includes('MEMBERSHIP')) {
    reqs.push(
      baseReq({
        icon_semantic_id: 'SEM_ACCOUNT_DOMAIN',
        canonical_name: 'ACCOUNT',
        meaning: 'Account hub',
        category: 'AUTH_ACCOUNT',
        families: [family.family_id],
        routes,
        surfaces,
        app_nav_variant_required: true,
      }),
    );
  }
  return reqs;
}

function iconsFromCustomExperience(cx: CustomExperienceDefinition, surfaces: IconRequirement['surfaces']): IconRequirement[] {
  const reqs: IconRequirement[] = [];
  if (cx.name.includes('BUILD') || cx.new_family_id?.includes('ASSEMBLY')) {
    for (const id of ['SEM_CONFIGURE', 'SEM_PREVIEW', 'SEM_CONFIRM']) {
      const g = getGlobalSemantic(id);
      if (g) {
        reqs.push(
          baseReq({
            icon_semantic_id: g.semantic_id,
            canonical_name: g.canonical_name,
            meaning: g.meaning,
            category: 'CUSTOM_EXPERIENCE',
            families: cx.new_family_id ? [cx.new_family_id] : cx.inherits_from,
            routes: [cx.custom_experience_id],
            surfaces,
            brand_expression_required: true,
            usage_context: cx.name,
          }),
        );
      }
    }
    reqs.push(
      baseReq({
        icon_semantic_id: 'SEM_MICRO_ASSEMBLY',
        canonical_name: 'ASSEMBLY_PREVIEW',
        meaning: 'Live assembly preview object',
        category: 'CUSTOM_EXPERIENCE',
        families: cx.new_family_id ? [cx.new_family_id] : [],
        routes: [cx.custom_experience_id],
        surfaces,
        micro_asset_candidate: true,
        brand_expression_required: true,
        display_variant_required: true,
        usage_context: cx.name,
      }),
    );
  }
  if (cx.name.includes('Existing Location')) {
    const d = getGlobalSemantic('SEM_DIAGNOSE');
    const r = getGlobalSemantic('SEM_REPAIR');
    if (d) reqs.push(baseReq({ ...d, icon_semantic_id: d.semantic_id, category: 'DIAGNOSTIC', routes: ['/existing-location'], families: ['EXISTING_LOCATION_SERVICE'], surfaces, brand_expression_required: true }));
    if (r) reqs.push(baseReq({ ...r, icon_semantic_id: r.semantic_id, category: 'DIAGNOSTIC', routes: ['/existing-location'], families: ['EXISTING_LOCATION_SERVICE'], surfaces, brand_expression_required: true }));
  }
  return reqs;
}

function iconsFromIntegrations(integrations: IntegrationOpportunity[]): IconRequirement[] {
  return integrations.map((i) =>
    baseReq({
      icon_semantic_id: `SEM_EXT_${i.integration.toUpperCase()}`,
      canonical_name: i.integration,
      meaning: `${i.integration} integration`,
      category: 'INTEGRATION',
      routes: i.routes_affected,
      surfaces: ['MOBILE_WEB', 'DESKTOP_WEB'],
      brand_expression_required: false,
      can_use_live_svg: false,
      notes: 'EXTERNAL_PLATFORM',
    }),
  );
}

/** Scan approved graph + families + surfaces for project-wide icon requirements. */
export function compileIconRequirements(input: {
  project_id: string;
  graph: CreativeExperienceGraph;
  families: ExperienceFamily[];
  surface_expressions: FamilySurfaceExpression[];
  intelligence?: ProjectExperienceIntelligence | null;
  integrations?: IntegrationOpportunity[];
}): IconRequirementManifest {
  const all: IconRequirement[] = [];
  let families = input.families;
  if (!families.length && input.graph.nodes.length) {
    const ids = [...new Set(input.graph.nodes.map((n) => n.family))];
    families = ids.map((family_id) => ({
      family_id,
      name: family_id,
      grammar_description: 'Ingest-derived family',
      experience_unit_kinds: [],
      route_ids: input.graph.nodes.filter((n) => n.family === family_id).map((n) => n.route_id),
      inheritance_layers: {},
    }));
  }

  for (const family of families) {
    const surf = surfacesFromExpressions(input.surface_expressions, family.family_id);
    all.push(...iconsFromGraphNode(input.graph, family, surf.length ? surf : ['MOBILE_WEB', 'DESKTOP_WEB']));
  }
  for (const cx of input.graph.custom_experiences) {
    all.push(...iconsFromCustomExperience(cx, ['MOBILE_WEB', 'TABLET_WEB', 'DESKTOP_WEB', 'APP']));
  }
  all.push(...iconsFromIntegrations(input.integrations ?? input.graph.integrations));

  // Universal nav utilities for app if intelligence suggests app
  if (input.intelligence?.app_intent && input.intelligence.app_intent !== 'NOT_REQUIRED') {
    for (const id of ['SEM_BACK', 'SEM_SEARCH', 'SEM_SHARE']) {
      const g = getGlobalSemantic(id);
      if (g) {
        all.push(
          baseReq({
            icon_semantic_id: g.semantic_id,
            canonical_name: g.canonical_name,
            meaning: g.meaning,
            category: 'APP_NAVIGATION',
            surfaces: ['APP'],
            app_nav_variant_required: true,
            compact_variant_required: true,
            can_use_live_svg: id === 'SEM_BACK',
            brand_expression_required: id !== 'SEM_BACK',
            required_sizes: [20, 24],
            interaction_states: ['DEFAULT', 'ACTIVE', 'SELECTED'],
          }),
        );
      }
    }
  }

  // Ensure at least core semantics present for empty edge case
  if (all.length === 0) {
    for (const g of GLOBAL_ICON_SEMANTICS.slice(0, 5)) {
      all.push(baseReq({ ...g, icon_semantic_id: g.semantic_id, category: g.default_category, can_use_live_svg: true, brand_expression_required: false }));
    }
  }

  return {
    project_id: input.project_id,
    requirements: collapseDuplicateSemantics(all),
    compiled_at: new Date().toISOString(),
  };
}

export function semanticIdsForCapability(familyId: string): IconSemanticId[] {
  if (familyId.includes('ASSEMBLY') || familyId.includes('CONFIGURATOR')) {
    return ['SEM_ROTATE', 'SEM_SELECT', 'SEM_REMOVE', 'SEM_ADD', 'SEM_RESET', 'SEM_PREVIEW', 'SEM_CONFIRM'];
  }
  return [];
}
