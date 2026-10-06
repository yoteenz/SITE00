/**
 * Assemble ONE project's production graph from adapter parts + the project's own workspace ledger.
 *
 * Isolation invariant (enforced here, not trusted to callers): every node, artifact, decision and event must carry
 * this project's id. Foreign rows are dropped and counted (`foreign_dropped`) — they are never shown under another
 * project, and there is no fallback to any default project.
 */
import { deriveDomainState } from './capabilities.js';
import { applyWorkspaceLedger, type WorkspaceAction } from './ledger.js';
import {
  WORK_DOMAINS,
  type ArtifactRecord,
  type DecisionItem,
  type PipelineStep,
  type ProductionEvent,
  type ProductionNode,
  type ProjectPhase,
  type ProjectProductionGraph,
  type SourceTruthRef,
  type WorkDomain,
} from './types.js';

export type GraphPart = {
  sources?: readonly SourceTruthRef[];
  nodes?: readonly ProductionNode[];
  artifacts?: readonly ArtifactRecord[];
  decisions?: readonly DecisionItem[];
  events?: readonly ProductionEvent[];
};

export type AssembledProjectGraph = ProjectProductionGraph & { foreign_dropped: number };

/** Canonical progression order (expression branch interleaved where it sits in the methodology). */
export const PIPELINE_ORDER: readonly PipelineStep[] = [
  'INTAKE',
  'STRUCTURE',
  'TREE',
  'EXPERIENCE_CONTRACT',
  'FAMILY_LOCK',
  'NARRATIVE',
  'CASTING',
  'LOOK',
  'PERFORMANCE',
  'SET',
  'VISUAL_AUTHORITY_DEVELOPMENT',
  'FOUNDER_VERDICT',
  'AUTHORITY_PACKAGE',
  'ACTOR_MODE_DERIVATION',
  'RESPONSIVE_DERIVATION',
  'PAGE_CONTRACT',
  'WORLD_CONTRACT',
  'STORYBOARD',
  'KEYFRAMES',
  'ASSET_SHEET',
  'IMPLEMENTATION',
  'QA',
  'REFINEMENT',
  'FOUNDER_APPROVAL',
  'LIVE',
  'LIVE_AUTHORITY_PROMOTION',
];

export const PIPELINE_LABEL: Record<PipelineStep, string> = {
  INTAKE: 'INTAKE / SOURCE TRUTH',
  STRUCTURE: 'STRUCTURE',
  TREE: 'FAMILY / PRODUCT / WORLD / PAGE TREE',
  EXPERIENCE_CONTRACT: 'EXPERIENCE CONTRACT',
  FAMILY_LOCK: 'FAMILY LOCK',
  VISUAL_AUTHORITY_DEVELOPMENT: 'VISUAL AUTHORITY DEVELOPMENT',
  FOUNDER_VERDICT: 'FOUNDER VERDICT',
  AUTHORITY_PACKAGE: 'AUTHORITY PACKAGE',
  ACTOR_MODE_DERIVATION: 'ACTOR / MODE DERIVATION',
  RESPONSIVE_DERIVATION: 'RESPONSIVE DERIVATION',
  PAGE_CONTRACT: 'PAGE / COMPONENT / INTERACTION CONTRACT',
  WORLD_CONTRACT: 'WORLD / SCENE / ASSET CONTRACT',
  ASSET_SHEET: 'ICON / ASSET SHEET',
  IMPLEMENTATION: 'IMPLEMENTATION',
  QA: 'QA / E2E',
  REFINEMENT: 'REFINEMENT',
  FOUNDER_APPROVAL: 'FOUNDER APPROVAL',
  LIVE: 'LIVE',
  LIVE_AUTHORITY_PROMOTION: 'LIVE AUTHORITY PROMOTION',
  NARRATIVE: 'NARRATIVE',
  CASTING: 'CASTING',
  LOOK: 'LOOK',
  PERFORMANCE: 'PERFORMANCE',
  SET: 'SET',
  STORYBOARD: 'STORYBOARD',
  KEYFRAMES: 'KEYFRAMES',
};

/** Top-level production nodes (families, entries, worlds) — the units HUB progress counts. */
export const isTopLevel = (n: ProductionNode) => n.parent_id === null;

function phaseOf(nodes: readonly ProductionNode[]): ProjectPhase | null {
  const top = nodes.filter(isTopLevel);
  const open = top.filter((n) => n.status !== 'COMPLETE');
  if (!top.length) return null;
  if (!open.length) return { step: 'LIVE', label: 'ALL TOP-LEVEL NODES COMPLETE', detail: `${top.length} of ${top.length} complete` };
  const rank = (s: PipelineStep) => PIPELINE_ORDER.indexOf(s);
  const earliest = open.reduce((a, b) => (rank(b.pipeline_step) < rank(a.pipeline_step) ? b : a));
  const atStep = open.filter((n) => n.pipeline_step === earliest.pipeline_step);
  return {
    step: earliest.pipeline_step,
    label: PIPELINE_LABEL[earliest.pipeline_step],
    detail: `${atStep.length} of ${top.length} top-level node${top.length === 1 ? '' : 's'} at this step`,
  };
}

export function assembleProjectGraph(
  project: { project_id: string; project_name: string; project_type: string },
  parts: readonly GraphPart[],
  ledger: readonly WorkspaceAction[] = [],
): AssembledProjectGraph {
  const pid = project.project_id;
  let dropped = 0;
  const own = <T extends { project_id: string }>(rows: readonly T[] | undefined): T[] =>
    (rows ?? []).filter((r) => {
      if (r.project_id === pid) return true;
      dropped += 1;
      return false;
    });
  const sources = parts.flatMap((p) => p.sources ?? []);
  const base = {
    nodes: parts.flatMap((p) => own(p.nodes)),
    artifacts: parts.flatMap((p) => own(p.artifacts)),
    decisions: parts.flatMap((p) => own(p.decisions)),
    events: parts.flatMap((p) => own(p.events)),
  };
  const m = applyWorkspaceLedger(pid, base, ledger.filter((a) => a.project_id === pid));
  const events = [...m.events].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const domains = Object.fromEntries(
    WORK_DOMAINS.map((d) => [d, deriveDomainState(d, pid, project.project_name, m.nodes, sources.filter((s) => m.nodes.some((n) => n.domain === d && n.source_truth_ids.includes(s.source_id))).map((s) => s.label))]),
  ) as Record<WorkDomain, ReturnType<typeof deriveDomainState>>;

  const needs = m.decisions.filter((d) => d.state === 'NEEDS_YOU').sort((a, b) => (a.priority === b.priority ? 0 : a.priority === 'HIGH' ? -1 : 1));
  const firstNeed = needs[0];
  const blocked = m.nodes.find((n) => n.blockers.length > 0 && n.blockers.some((b) => b.owner === 'STUDIO'));
  const nextNode = m.nodes.find((n) => n.next_required_action && n.status !== 'COMPLETE');
  const next_action =
    firstNeed ? { node_id: firstNeed.node_id, label: firstNeed.title, owner: firstNeed.owner, route: firstNeed.route }
    : blocked ? { node_id: blocked.node_id, label: blocked.blockers[0]!.required_action, owner: blocked.blockers[0]!.owner, route: blocked.route }
    : nextNode ? { node_id: nextNode.node_id, label: nextNode.next_required_action!, owner: 'STUDIO' as const, route: nextNode.route }
    : null;

  return {
    ...project,
    sources,
    nodes: m.nodes,
    artifacts: m.artifacts,
    decisions: m.decisions,
    events,
    domains,
    phase: phaseOf(m.nodes),
    next_action,
    foreign_dropped: dropped,
  };
}
