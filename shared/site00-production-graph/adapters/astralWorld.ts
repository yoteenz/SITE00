/**
 * Adapter: ASTRAL WORLD scene system (shared/site00-astral-world/scenes) → project graph (EXPERIENCE domain).
 *
 * EXPERIENCE is world-building: WORLD → SCENE → objects (ZONE / PORTAL / INTERACTION / INHABITANT / PRESENCE /
 * ENVIRONMENT_ASSET) and hotspots (INTERACTION). Source of truth: the scene contracts, scene-object and hotspot
 * registries and the reference manifest (MASTER > DESTINATION > FEATURE authorities). Every scene is rendered by
 * the immersive Astral World route (`/projects/astral-world/experience/<section>`); no founder verdict or QA run is
 * recorded for any scene, so none is claimed.
 */
import type { AstralHotspotDef, AstralSceneContract, AstralSceneObjectDef } from '../../site00-astral-world/scenes/types.js';
import type { AstralReferenceEntry } from '../../site00-astral-world/scenes/referenceManifest.js';
import type { ArtifactRecord, ExperienceNodeType, ProductionNode, SourceTruthRef } from '../types.js';

export type WorldSystemInput = {
  worldLabel: string;
  scenes: readonly AstralSceneContract[];
  objects: readonly AstralSceneObjectDef[];
  hotspots: readonly AstralHotspotDef[];
  references: readonly AstralReferenceEntry[];
  /** Live immersive route for a route section (`home`, `astrea` …). */
  liveRoute: (section: string) => string;
  /** Workspace route (EXPERIENCE) for a node. */
  workspaceRoute: string;
};

export type WorldGraphPart = { sources: SourceTruthRef[]; nodes: ProductionNode[]; artifacts: ArtifactRecord[] };

const OBJECT_TYPE: Record<AstralSceneObjectDef['kind'], ExperienceNodeType> = {
  DESTINATION: 'ZONE',
  PORTAL: 'PORTAL',
  TABLE: 'INTERACTION',
  READER: 'INHABITANT',
  FRIEND: 'INHABITANT',
  AVATAR: 'PRESENCE_MODEL',
  JOURNAL: 'ENVIRONMENT_ASSET',
  KIOSK: 'ENVIRONMENT_ASSET',
  TAROT_CARD: 'ENVIRONMENT_ASSET',
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function buildWorldGraphPart(projectId: string, w: WorldSystemInput): WorldGraphPart {
  const src = (id: string, path: string, label: string): SourceTruthRef => ({ source_id: `${projectId}.${id}`, kind: 'EXPERIENCE_CONTRACT', path, label });
  const sources: SourceTruthRef[] = [
    src('world.scenes', 'shared/site00-astral-world/scenes/sceneContracts.ts', `${w.worldLabel} scene contracts`),
    src('world.objects', 'shared/site00-astral-world/scenes/sceneObjectRegistry.ts', `${w.worldLabel} scene objects`),
    src('world.hotspots', 'shared/site00-astral-world/scenes/hotspotRegistry.ts', `${w.worldLabel} interaction hotspots`),
    src('world.references', 'shared/site00-astral-world/scenes/referenceManifest.ts', `${w.worldLabel} reference authority manifest`),
  ];
  const worldNode = `${projectId}.experience.world`;
  const sceneNode = (sceneId: string) => `${projectId}.experience.scene.${slug(sceneId)}`;
  const nodes: ProductionNode[] = [];
  const artifacts: ArtifactRecord[] = [];

  const base = {
    project_id: projectId,
    family_id: null,
    domain: 'EXPERIENCE' as const,
    live_status: 'NOT_LIVE' as const,
    actor_scope: [] as string[],
    blockers: [],
    last_event: null,
  };

  /* ── reference authorities (spatial / scene) ── */
  for (const r of w.references) {
    artifacts.push({
      artifact_id: `${projectId}.reference.${slug(r.referenceId)}`,
      project_id: projectId,
      source_node_id: r.authorityLevel === 'MASTER' ? worldNode : sceneNode(r.relatedSceneId),
      artifact_type: r.authorityLevel === 'MASTER' ? 'REFERENCE_AUTHORITY' : 'WORLD_ASSET',
      label: r.label,
      status: 'CANONICAL',
      authority_status: 'APPROVED',
      created_by: 'STUDIO',
      derived_from: r.authorityLevel === 'MASTER' ? [] : ['MASTER_DESKTOP_REFERENCE', 'MASTER_MOBILE_REFERENCE'],
      supersedes: [],
      superseded_by: null,
      used_by: [`scene ${r.relatedSceneId}`, `route ${r.relatedRoute}`, ...r.assetDependencies],
      viewport: r.viewport === 'both' ? 'MOBILE / DESKTOP' : r.viewport.toUpperCase(),
      actor_mode: null,
      url: r.publicPath ?? null,
      source_truth_id: `${projectId}.world.references`,
    });
  }

  /* ── scenes ── */
  for (const s of w.scenes) {
    const id = sceneNode(s.sceneId);
    const ref = w.references.find((r) => r.relatedSceneId === s.sceneId && r.authorityLevel !== 'MASTER');
    const objs = w.objects.filter((o) => o.sceneId === s.sceneId);
    const hots = w.hotspots.filter((h) => h.sceneId === s.sceneId);
    const arts = artifacts.filter((a) => a.source_node_id === id).map((a) => a.artifact_id);
    nodes.push({
      ...base,
      node_id: id,
      node_type: 'SCENE',
      label: s.label,
      parent_id: worldNode,
      workspace_domains: ['HUB', 'EXPERIENCE', 'LIBRARY'],
      current_stage: ref ? 'VISUALLY_IMPLEMENTED' : 'FUNCTIONAL',
      pipeline_step: 'QA',
      status: 'ACTIVE',
      status_detail: `Scene contract + immersive route mounted · ${objs.length} object${objs.length === 1 ? '' : 's'} · ${hots.length} interaction${hots.length === 1 ? '' : 's'}${ref ? ` · authority ${ref.authorityLevel.toLowerCase()}` : ' · no scene authority'}`,
      authority_status: ref ? 'APPROVED' : 'REQUIRED',
      approval_status: 'NOT_REQUESTED',
      implementation_status: 'IMPLEMENTED',
      qa_status: 'NOT_RUN',
      dependencies: [],
      upstream_nodes: [worldNode],
      downstream_nodes: [...objs.map((o) => `${projectId}.experience.object.${slug(o.objectId)}`), ...hots.map((h) => `${projectId}.experience.interaction.${slug(h.hotspotId)}`)],
      viewport_scope: ['MOBILE', 'DESKTOP'],
      artifact_ids: arts,
      source_truth_ids: [`${projectId}.world.scenes`],
      next_required_action: 'Run experience QA and record a founder verdict for the scene',
      route: ref ? w.liveRoute(ref.relatedRoute) : w.workspaceRoute,
      preview_artifact_id: arts[0] ?? null,
    });
    for (const o of objs) {
      nodes.push({
        ...base,
        node_id: `${projectId}.experience.object.${slug(o.objectId)}`,
        node_type: OBJECT_TYPE[o.kind],
        label: o.label,
        parent_id: id,
        workspace_domains: ['EXPERIENCE'],
        current_stage: 'FUNCTIONAL',
        pipeline_step: 'WORLD_CONTRACT',
        status: 'ACTIVE',
        status_detail: `${o.kind.toLowerCase()} in ${s.label}${o.target ? ` → ${o.target}` : ''}${o.presenceState ? ` · presence ${o.presenceState.toLowerCase()}` : ''}`,
        authority_status: 'NOT_REQUIRED',
        approval_status: 'NOT_REQUESTED',
        implementation_status: 'IMPLEMENTED',
        qa_status: 'NOT_RUN',
        dependencies: [id],
        upstream_nodes: [id],
        downstream_nodes: [],
        viewport_scope: [],
        artifact_ids: [],
        source_truth_ids: [`${projectId}.world.objects`],
        next_required_action: null,
        route: w.workspaceRoute,
        preview_artifact_id: null,
      });
    }
    for (const h of hots) {
      nodes.push({
        ...base,
        node_id: `${projectId}.experience.interaction.${slug(h.hotspotId)}`,
        node_type: 'INTERACTION',
        label: h.label,
        parent_id: id,
        workspace_domains: ['EXPERIENCE'],
        current_stage: 'FUNCTIONAL',
        pipeline_step: 'WORLD_CONTRACT',
        status: 'ACTIVE',
        status_detail: `${h.action.replace(/_/g, ' ').toLowerCase()} → ${h.target}`,
        authority_status: 'NOT_REQUIRED',
        approval_status: 'NOT_REQUESTED',
        implementation_status: 'IMPLEMENTED',
        qa_status: 'NOT_RUN',
        dependencies: [id],
        upstream_nodes: [id],
        downstream_nodes: [],
        viewport_scope: [h.mobileAdjustment ? 'MOBILE' : '', h.desktopAdjustment ? 'DESKTOP' : ''].filter(Boolean),
        artifact_ids: [],
        source_truth_ids: [`${projectId}.world.hotspots`],
        next_required_action: null,
        route: w.workspaceRoute,
        preview_artifact_id: null,
      });
    }
  }

  /* ── the world ── */
  const masters = artifacts.filter((a) => a.source_node_id === worldNode).map((a) => a.artifact_id);
  nodes.unshift({
    ...base,
    node_id: worldNode,
    node_type: 'WORLD',
    label: w.worldLabel,
    parent_id: null,
    workspace_domains: ['HUB', 'EXPERIENCE', 'LIBRARY'],
    current_stage: 'VISUALLY_IMPLEMENTED',
    pipeline_step: 'QA',
    status: 'ACTIVE',
    status_detail: `${w.scenes.length} scenes · ${w.objects.length} scene objects · ${w.hotspots.length} interactions · ${masters.length} master authorities`,
    authority_status: masters.length ? 'APPROVED' : 'REQUIRED',
    approval_status: 'NOT_REQUESTED',
    implementation_status: 'IMPLEMENTED',
    qa_status: 'NOT_RUN',
    dependencies: [],
    upstream_nodes: [],
    downstream_nodes: w.scenes.map((s) => sceneNode(s.sceneId)),
    viewport_scope: ['MOBILE', 'DESKTOP'],
    artifact_ids: masters,
    source_truth_ids: sources.map((s) => s.source_id),
    next_required_action: 'Run world experience QA; no founder verdict recorded for any scene',
    route: w.liveRoute('home'),
    preview_artifact_id: masters[0] ?? null,
  });
  return { sources, nodes, artifacts };
}
