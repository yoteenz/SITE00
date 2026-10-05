import type { CreativeExperienceGraph, ExperienceFamily, ExperienceUnitKind } from './map2Types';
import { assertFamilyCompilationAllowed } from './experienceArchitectureGate';
import type { ExperienceArchitectureGate } from './map2Types';

const FAMILY_GRAMMARS: Record<string, { name: string; grammar: string; units: ExperienceUnitKind[] }> = {
  EDITORIAL_CONTENT: { name: 'Editorial Content', grammar: 'Chapter spine + story spread', units: ['CONTENT', 'HUB'] },
  PRODUCT_ASSEMBLY_CONFIGURATOR: { name: 'Product Assembly Configurator', grammar: 'Step machine + live preview', units: ['CONFIGURATOR', 'MULTI_STEP_FLOW'] },
  IMMERSIVE_DESTINATION: { name: 'Immersive Destination', grammar: 'Room graph + hotspot navigation', units: ['IMMERSIVE_EXPERIENCE', 'HUB'] },
  MEMBERSHIP_LOUNGE: { name: 'Membership Lounge', grammar: 'Account hub + saved state', units: ['PORTAL', 'MEMBERSHIP_EXPERIENCE'] },
  TRANSACTION_FLOW: { name: 'Transaction Flow', grammar: 'Review + checkout adjacency', units: ['TRANSACTION_FLOW', 'COMMERCE_EXPERIENCE'] },
  MULTI_STEP_CONFIGURATION: { name: 'Multi Step Configuration', grammar: 'Wizard steps with validation', units: ['MULTI_STEP_FLOW', 'WORKFLOW'] },
};

export function compileExperienceFamilies(graph: CreativeExperienceGraph, gateA: ExperienceArchitectureGate): ExperienceFamily[] {
  assertFamilyCompilationAllowed(gateA, graph);
  const byFamily = new Map<string, string[]>();
  for (const n of graph.nodes) {
    const list = byFamily.get(n.family) ?? [];
    list.push(n.route_id);
    byFamily.set(n.family, list);
  }
  for (const cx of graph.custom_experiences) {
    if (cx.new_family_id) {
      byFamily.set(cx.new_family_id, [...(byFamily.get(cx.new_family_id) ?? []), cx.custom_experience_id]);
    }
  }
  const families: ExperienceFamily[] = [];
  for (const [family_id, route_ids] of byFamily) {
    const meta = FAMILY_GRAMMARS[family_id] ?? {
      name: family_id,
      grammar: 'Reusable experience grammar',
      units: ['STANDARD_PAGE'] as ExperienceUnitKind[],
    };
    families.push({
      family_id,
      name: meta.name,
      grammar_description: meta.grammar,
      experience_unit_kinds: meta.units,
      route_ids,
      inheritance_layers: family_id.includes('CONFIGURATOR')
        ? { HOST_SHELL: 'FRONTAL_SLAYER', WORKING_SURFACE: 'MULTI_STEP_CONFIGURATION', PREVIEW: 'LIVE_PRODUCT_ASSEMBLY' }
        : { HOST_SHELL: 'GLOBAL' },
    });
  }
  return families;
}
