/** Browser-safe workspace bootstrap (no Node fs / MAP1 compiler). */
import { PUBLIC_REDESIGN_AUTHORITY_RECORDS, WAITING_FOR_AUTHORITY_ROUTES } from '../../../site00/authority/publicRedesignAuthorityManifest';
import { runGreenfieldMap2Pipeline } from '../map2/map2Orchestrator';
import { resolveProjectMode } from '../map2/projectMode';
import type { CreativeExperienceGraph, Map2PipelineState } from '../map2/map2Types';
import site00IngestFixture from '../../../../docs/studioos/experience-compiler/MAP2/MAP2_SITE00_INGEST_FIXTURE.json';
import type { ExperienceCompilerWorkspaceState } from './types';
import { existingLocationCustomExperience, existingLocationRouteNodes, missingExistingLocationAuthorities } from './existingLocationUnit';
import { loadWorkspaceState } from './persistence';

function newHistory(kind: string, detail: string) {
  return { id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, at: new Date().toISOString(), kind, detail };
}

export function bootstrapGreenfieldWorkspace(slug: string): ExperienceCompilerWorkspaceState {
  const pipeline = runGreenfieldMap2Pipeline();
  return {
    project_id: pipeline.intelligence!.project_id,
    project_slug: slug,
    project_name: pipeline.intelligence!.brand_name,
    mode: pipeline.mode,
    pipeline,
    concept_index: 0,
    authority_review_index: 0,
    custom_experiences_draft: pipeline.graph?.custom_experiences ?? [],
    authority_reviews: [],
    ingested_assets: [],
    openart_emit_preview: null,
    history: [newHistory('BOOT', 'Greenfield MAP2 pipeline loaded')],
    site00_authority_count: null,
    site00_authority_gaps: [],
    sonnet_batch_status: {},
  };
}

export function bootstrapSite00IngestWorkspace(slug: string): ExperienceCompilerWorkspaceState {
  const fixture = site00IngestFixture as { graph: CreativeExperienceGraph; map1_node_count: number };
  const activeAuthorities = PUBLIC_REDESIGN_AUTHORITY_RECORDS.length;
  const gaps = [...WAITING_FOR_AUTHORITY_ROUTES.map((r) => `WAITING:${r.route}`), ...missingExistingLocationAuthorities()];

  const graph: CreativeExperienceGraph = {
    ...fixture.graph,
    nodes: [...fixture.graph.nodes, ...existingLocationRouteNodes()],
    custom_experiences: [...fixture.graph.custom_experiences, existingLocationCustomExperience()],
  };

  const pipeline: Map2PipelineState = {
    mode: resolveProjectMode({ has_existing_product: true, preserve_product_truth: true, requires_reconcept: false }),
    intelligence: null,
    concept_set: null,
    gate_0: { gate_id: 'GATE_0_CONCEPT_DIRECTION', status: 'APPROVED', selected_concept_id: 'INGEST_PRODUCT_TRUTH', history: [] },
    graph,
    gate_a: { gate_id: 'GATE_A_EXPERIENCE_ARCHITECTURE', status: 'APPROVED', history: [] },
    families: [],
    surface_expressions: [],
    gate_b: {
      gate_id: 'GATE_B_FAMILY_SURFACE',
      status: 'PENDING',
      approved_family_ids: [],
      icon_expression_approved: false,
      micro_asset_expression_approved: false,
      history: [],
    },
    icon_pipeline: null,
    authority_plan: [],
    gate_c: { gate_id: 'GATE_C_VISUAL_AUTHORITY', status: 'NOT_READY' },
    openart_batches: [],
    authority_pack: null,
    capabilities: [],
  };

  return {
    project_id: 'site00',
    project_slug: slug,
    project_name: 'SITE 00',
    mode: 'INGEST',
    pipeline,
    concept_index: 0,
    authority_review_index: 0,
    custom_experiences_draft: graph.custom_experiences,
    authority_reviews: [],
    ingested_assets: [],
    openart_emit_preview: null,
    history: [newHistory('BOOT', 'SITE 00 INGEST product truth loaded')],
    site00_authority_count: activeAuthorities,
    site00_authority_gaps: gaps,
    sonnet_batch_status: {},
  };
}

export function loadOrBootstrapWorkspace(projectSlug: string): ExperienceCompilerWorkspaceState {
  const saved = loadWorkspaceState(projectSlug);
  if (saved) return saved;
  const slug = projectSlug.toLowerCase();
  if (slug === 'site00' || slug === 'site-00') return bootstrapSite00IngestWorkspace(slug);
  if (slug === 'lumina-atelier' || slug === 'lumina') return bootstrapGreenfieldWorkspace('lumina-atelier');
  return bootstrapGreenfieldWorkspace(slug);
}
