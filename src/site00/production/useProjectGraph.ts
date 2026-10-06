/**
 * The active project's production graph = static truth (projectGraphSources) + live expression production facts
 * (HubData, only when THIS project has one) + THIS project's workspace ledger. One read shared by every tab.
 */
import { useMemo } from 'react';
import { getSite00ManagedProject } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import { HUB_ASSET_RECEIPTS } from '../../../shared/site00-production-hub/assetReceipts.js';
import type { HubAssetSlot, HubDepartment, HubNodeId } from '../../../shared/site00-production-hub/types.js';
import { getStudioWorldActorCatalogue } from '../../../shared/site00-studio-world/acting-catalogue/index.js';
import {
  assembleProjectGraph,
  buildExpressionGraphPart,
  type AssembledProjectGraph,
  type ExpressionAssetFact,
  type ExpressionRoleFact,
  type GraphPart,
} from '../../../shared/site00-production-graph/index.js';
import { productionExpressionPath } from '../../../shared/site00-production-workspace/routes.js';
import { productionRequestScope, productionRequestTitle } from '../../../shared/site00-production-workspace/requestCatalog.js';
import type { HubData } from '../components/productionHub/useProductionHubData';
import { activityProjectOf } from '../state/productionActivityStore';
import { staticGraphParts } from './projectGraphSources';
import { useWorkspaceLedger } from './workspaceLedgerStore';

const DEPT_NODE: Partial<Record<HubDepartment, HubNodeId>> = {
  NARRATIVE: 'narrative',
  CASTING: 'cast',
  WARDROBE: 'look',
  PERFORMANCE: 'performance',
  SETS: 'set',
  STORYBOARD: 'storyboard',
  KEYFRAMES: 'keyframes',
};

/** Roles: one per casting requirement; an actor counts as CAST only when the catalogue has a record for it. */
export function castRoleFacts(hub: Pick<HubData, 'cast' | 'project'>, route: (sub: string) => string): ExpressionRoleFact[] {
  if (!hub.cast) return [];
  const catalogue = getStudioWorldActorCatalogue().actors;
  return hub.cast.requirements.map((req) => {
    const ch = hub.cast!.characters.find((c) => c.narrativeRole === req.narrativeRole) ?? null;
    const actor = ch?.actorId ? (catalogue.find((a) => a.actorId === ch.actorId) ?? null) : null;
    return {
      roleId: req.requirementId,
      label: req.narrativeRole,
      importance: req.screenImportance,
      characterName: ch?.characterName ?? null,
      actorName: actor ? actor.stageName : null,
      actorMissingFromCatalogue: !!ch?.actorId && !actor,
      route: route(`casting/roles/${encodeURIComponent(req.requirementId)}`),
    };
  });
}

function assetFacts(hub: HubData): ExpressionAssetFact[] {
  const pid = hub.project.projectId;
  const out: ExpressionAssetFact[] = [];
  for (const s of hub.slots as HubAssetSlot[]) {
    if (s.projectId !== pid || s.assetType === 'CHAMBER_ATMOSPHERE') continue;
    const url = hub.assetUrl(s.slotId);
    if (!url) continue; // a missing slot is not an artifact
    const receipt = HUB_ASSET_RECEIPTS.find((r) => r.slotId === s.slotId) ?? null;
    out.push({
      slotId: s.slotId,
      projectId: pid,
      nodeId: DEPT_NODE[s.department] ?? null,
      label: s.purpose.toUpperCase().slice(0, 60),
      url,
      kind: s.assetType === 'STORYBOARD_FRAME' ? 'STORYBOARD_FRAME' : s.assetType === 'PROJECT_COVER' ? 'PROJECT_COVER' : 'NODE_ART',
      source: receipt ? receipt.source : 'EXPRESSION ENGINE',
      receivedAt: receipt?.receivedAt ?? null,
      sourceAuthority: s.sourceAuthority || null,
      usedBy: s.usedBy,
    });
  }
  return out;
}

/** The live expression production part — only for a project that HAS a production (never borrowed). */
export function expressionPartFromHub(hub: HubData): GraphPart | null {
  if (!hub.isEntry002 || !hub.production) return null;
  const pid = hub.project.projectId;
  const route = (sub: string) => productionExpressionPath(pid, sub);
  const names = hub.projects.map((p) => ({ projectId: p.projectId, name: p.name }));
  return buildExpressionGraphPart({
    projectId: pid,
    productionId: hub.production.productionId,
    productionLabel: hub.production.label,
    productionTitle: hub.production.subtitle,
    graph: hub.graph,
    sceneCount: hub.scenes.length,
    roles: castRoleFacts(hub, route),
    attention: hub.attention.map((a) => ({ id: a.id, kind: a.kind, title: a.title, subtitle: a.subtitle, priority: a.priority, nodeId: a.nodeId, why: a.why })),
    activity: hub.activity
      .filter((a) => a.category !== 'REQUEST')
      .map((a) => ({ id: a.id, projectId: activityProjectOf(a, names) ?? '', category: a.category, title: a.title, detail: a.detail, at: a.at, actor: a.actor, nodeId: null })),
    requests: hub.requests.map((r) => ({ id: r.id, projectId: r.projectSlug.toLowerCase(), title: productionRequestTitle(r.kind), scope: productionRequestScope(r.kind), createdAt: r.createdAt, status: r.status })),
    assets: assetFacts(hub),
    route,
    pipelineAvailable: hub.pipeline.available,
  });
}

export function useProjectGraph(hub: HubData): AssembledProjectGraph {
  const pid = hub.project.projectId;
  const ledger = useWorkspaceLedger(pid);
  return useMemo(() => {
    const managed = getSite00ManagedProject(pid);
    const live = expressionPartFromHub(hub);
    return assembleProjectGraph(
      { project_id: pid, project_name: hub.project.name, project_type: managed?.projectType ?? 'UNREGISTERED' },
      [...staticGraphParts(pid), ...(live ? [live] : [])],
      ledger,
    );
  }, [pid, hub, ledger]);
}
