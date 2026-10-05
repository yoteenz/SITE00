import { PUBLIC_REDESIGN_AUTHORITY_RECORDS, WAITING_FOR_AUTHORITY_ROUTES } from '../../../site00/authority/publicRedesignAuthorityManifest';
import { runGreenfieldMap2Pipeline } from '../map2/map2Orchestrator';
import { buildSite00IngestFixture } from '../map2/site00Ingest';
import { resolveProjectMode } from '../map2/projectMode';
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
  const ingest = buildSite00IngestFixture();
  const activeAuthorities = PUBLIC_REDESIGN_AUTHORITY_RECORDS.length;
  const gaps = [...WAITING_FOR_AUTHORITY_ROUTES.map((r) => `WAITING:${r.route}`), ...missingExistingLocationAuthorities()];

  const graph = {
    ...ingest.graph,
    nodes: [...ingest.graph.nodes, ...existingLocationRouteNodes()],
    custom_experiences: [...ingest.graph.custom_experiences, existingLocationCustomExperience()],
  };

  const pipeline = {
    ...ingest.pipeline_sketch,
    graph,
    mode: resolveProjectMode({ has_existing_product: true, preserve_product_truth: true, requires_reconcept: false }),
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
