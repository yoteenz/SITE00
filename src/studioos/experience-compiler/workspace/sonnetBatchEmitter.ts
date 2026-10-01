import type { AuthorityPlanEntry, CreativeExperienceGraph, ExperienceFamily } from '../map2/map2Types';
import type { ProjectExperienceMode } from '../map2/map2Types';
import type { SonnetBatchEmit, SonnetBatchStatus } from './types';

export function emitSonnetBatch(input: {
  batch_id: string;
  project_id: string;
  mode: ProjectExperienceMode;
  graph: CreativeExperienceGraph;
  families: ExperienceFamily[];
  plan: AuthorityPlanEntry[];
  pack_filename: string;
  status: SonnetBatchStatus;
}): SonnetBatchEmit {
  const routes = input.graph.nodes.map((n) => n.route);
  const json: Record<string, unknown> = {
    batch_id: input.batch_id,
    project: input.project_id,
    project_mode: input.mode,
    routes,
    experience_units: input.graph.nodes.map((n) => ({ route: n.route, unit: n.experience_unit, family: n.family })),
    families: input.families.map((f) => f.family_id),
    surfaces: [...new Set(input.plan.map((p) => p.surface))],
    authority_ids: input.plan.map((p) => p.authority_id),
    authority_pack_filename: input.pack_filename,
    inheritance: input.families.map((f) => ({ family_id: f.family_id, layers: f.inheritance_layers })),
    custom_experience_rules: input.graph.custom_experiences,
    interactions: 'Follow family grammar; no invented controls',
    responsive_behavior: 'Per SURFACE_EXPRESSION_MANIFEST.json',
    app_behavior: 'Per family app_relationship where applicable',
    business_logic_boundaries: 'Commerce via Shopify; auth via Supabase',
    backend_boundaries: 'API on Railway; static SPA on cPanel',
    asset_slots: input.plan.map((p) => p.authority_id),
    proof_requirements: ['Route loads', 'Authority layout match', 'No generic template drift'],
    do_not_invent_rules: ['No new routes', 'No authority substitution', 'No cross-client visual reuse'],
    brand_rules: 'Uppercase SITE 00 voice where project-specific',
  };

  const markdown = `# Sonnet batch ${input.batch_id}

Project: **${input.project_id}** (${input.mode})

## Routes
${routes.map((r) => `- ${r}`).join('\n')}

## Authorities
${input.plan.map((p) => `- ${p.authority_id} (${p.surface})`).join('\n')}

## Pack
Attach \`${input.pack_filename}\` before implementation.
`;

  const sprint_prompt = `SPRINT: SONNET IMPLEMENTATION BATCH ${input.batch_id}
PROJECT: ${input.project_id}
MODE: ${input.mode}

Implement routes listed in batch JSON using authority pack ${input.pack_filename}.
Do not invent routes or visual grammar. Proof: route load + authority fidelity.

BATCH JSON:
${JSON.stringify(json, null, 2)}
`;

  return { batch_id: input.batch_id, json, markdown, sprint_prompt, status: input.status };
}

export function copyReadySprintText(emit: SonnetBatchEmit): string {
  return emit.sprint_prompt;
}
