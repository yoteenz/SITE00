/**
 * World hierarchy — WORLD → DISTRICT → DESTINATION → EXPERIENCE
 */

import { getSupabaseAdmin } from '../../supabase.js';
import { resolveCanonicalProject } from '../canonicalProject.js';
import { ASTRAL_WORLD_HIERARCHY_SEED, ASTRAL_WORLD_FOUNDER_HIERARCHY_TRUTH } from '../../../../shared/site00-identity/astralWorldIdentity.js';
import type { WorldHierarchyNodeType } from '../../../../shared/site00-identity/types.js';

export type WorldHierarchyNode = {
  id: string;
  project_id: string;
  node_type: WorldHierarchyNodeType;
  slug: string;
  display_name: string;
  parent_id: string | null;
  sort_order: number;
  truth_layer: string;
  payload: Record<string, unknown>;
  is_canonical: boolean;
};

export async function seedWorldHierarchy(projectIdOrSlug: string): Promise<WorldHierarchyNode[]> {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) throw new Error(resolved.error.message);

  if (resolved.project.slug !== 'astral-world') {
    throw new Error('Hierarchy seed only defined for astral-world');
  }

  const { data: existing } = await getSupabaseAdmin()
    .from('site00_world_hierarchy_nodes')
    .select('*')
    .eq('project_id', resolved.project.id);

  if ((existing ?? []).length >= 5) return (existing ?? []) as WorldHierarchyNode[];

  const seed = ASTRAL_WORLD_HIERARCHY_SEED;
  const nodes: WorldHierarchyNode[] = [];

  const { data: worldNode, error: worldErr } = await getSupabaseAdmin()
    .from('site00_world_hierarchy_nodes')
    .upsert(
      {
        project_id: resolved.project.id,
        node_type: 'WORLD',
        slug: seed.world.slug,
        display_name: seed.world.displayName,
        parent_id: null,
        sort_order: 0,
        truth_layer: 'CLIENT_FOUNDER_TRUTH',
        payload: {
          role: seed.world.role,
          founderTruth: ASTRAL_WORLD_FOUNDER_HIERARCHY_TRUTH,
        },
        is_canonical: false,
      },
      { onConflict: 'project_id,slug' },
    )
    .select('*')
    .single();
  if (worldErr) throw worldErr;
  nodes.push(worldNode as WorldHierarchyNode);

  const { data: districtNode, error: districtErr } = await getSupabaseAdmin()
    .from('site00_world_hierarchy_nodes')
    .upsert(
      {
        project_id: resolved.project.id,
        node_type: 'DISTRICT',
        slug: seed.district.slug,
        display_name: seed.district.displayName,
        parent_id: worldNode.id,
        sort_order: 1,
        truth_layer: 'CLIENT_FOUNDER_TRUTH',
        payload: {
          role: seed.district.role,
          namingNote: ASTRAL_WORLD_FOUNDER_HIERARCHY_TRUTH.astréaNamingNote,
        },
        is_canonical: false,
      },
      { onConflict: 'project_id,slug' },
    )
    .select('*')
    .single();
  if (districtErr) throw districtErr;
  nodes.push(districtNode as WorldHierarchyNode);

  for (let i = 0; i < seed.destinations.length; i++) {
    const dest = seed.destinations[i]!;
    const { data: destNode, error: destErr } = await getSupabaseAdmin()
      .from('site00_world_hierarchy_nodes')
      .upsert(
        {
          project_id: resolved.project.id,
          node_type: 'DESTINATION',
          slug: dest.slug,
          display_name: dest.displayName,
          parent_id: districtNode.id,
          sort_order: i + 1,
          truth_layer: 'CLIENT_FOUNDER_TRUTH',
          payload: { clientConcept: true, note: 'Client-supplied environment concept — not visual canon' },
          is_canonical: false,
        },
        { onConflict: 'project_id,slug' },
      )
      .select('*')
      .single();
    if (destErr) throw destErr;
    nodes.push(destNode as WorldHierarchyNode);
  }

  return nodes;
}

export async function listWorldHierarchy(projectIdOrSlug: string): Promise<WorldHierarchyNode[]> {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) return [];

  const { data } = await getSupabaseAdmin()
    .from('site00_world_hierarchy_nodes')
    .select('*')
    .eq('project_id', resolved.project.id)
    .order('sort_order', { ascending: true });

  return (data ?? []) as WorldHierarchyNode[];
}

export function buildHierarchyTree(nodes: WorldHierarchyNode[]): WorldHierarchyNode[] {
  return nodes.filter((n) => n.node_type === 'WORLD');
}

export async function countFutureDistrictCapacity(projectIdOrSlug: string): Promise<boolean> {
  const nodes = await listWorldHierarchy(projectIdOrSlug);
  const world = nodes.find((n) => n.node_type === 'WORLD');
  if (!world) return false;
  const payload = world.payload as Record<string, unknown>;
  const founderTruth = payload.founderTruth as Record<string, unknown> | undefined;
  return Boolean(founderTruth?.expansionModel);
}
