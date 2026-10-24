import type { CensusPerson } from './jitCast.js';
import { KNOWLEDGE_FACTS, type KnowledgeFact } from './knowledge.js';
import type { AssetRegistry } from './registries.js';
import type { SeasonMaster } from './types.js';

/** Season dependency graph (sprint V2 §01, §25 deliverable 06). Every edge names its source so nothing is inferred silently. */
export type EdgeType = 'DEPENDS_ON' | 'PAYS_OFF' | 'SAME_NIGHT' | 'FACT_REVEALED' | 'CHARACTER_LEARNS' | 'FIRST_APPEARANCE' | 'CONTINUITY_CARRY' | 'ASSET_NEEDED';
export type GraphNode = { id: string; kind: 'RELEASE' | 'FACT' | 'PERSON' | 'SET' | 'WARDROBE' | 'PROP'; label: string };
export type GraphEdge = { type: EdgeType; from: string; to: string; source: string; jitTrigger?: string };

export function buildDependencyGraph(input: { master: SeasonMaster; assets: AssetRegistry; census: CensusPerson[]; activeReleaseId: string; facts?: KnowledgeFact[] }) {
  const { master, assets, census, activeReleaseId } = input;
  const facts = input.facts ?? KNOWLEDGE_FACTS;
  const order = new Map(master.releases.map((r) => [r.id, r.order]));
  const byOrder = (ids: string[]) => [...ids].filter((i) => order.has(i)).sort((a, b) => order.get(a)! - order.get(b)!);
  const nodes: GraphNode[] = master.releases.map((r) => ({ id: r.id, kind: 'RELEASE', label: r.title }));
  const edges: GraphEdge[] = [];
  for (const r of master.releases) {
    for (const d of r.dependsOn) edges.push({ type: 'DEPENDS_ON', from: r.id, to: d, source: `master ${r.id}.dependsOn` });
    for (const p of r.paysOffIn) edges.push({ type: 'PAYS_OFF', from: r.id, to: p, source: `master ${r.id}.paysOffIn` });
    for (const n of r.nightDependencies) edges.push({ type: 'SAME_NIGHT', from: r.id, to: n, source: `master ${r.id}.nightDependencies` });
  }
  for (const f of facts) {
    nodes.push({ id: f.factId, kind: 'FACT', label: f.statement });
    if (f.audienceFrom) edges.push({ type: 'FACT_REVEALED', from: f.factId, to: f.audienceFrom, source: f.source });
    for (const k of f.knownBy) edges.push({ type: 'CHARACTER_LEARNS', from: f.factId, to: k.from, source: `${f.factId}: ${k.character} (${k.how})` });
  }
  for (const p of census.filter((x) => x.tier !== 'SCENE_SCOPED')) {
    nodes.push({ id: p.personId, kind: 'PERSON', label: p.name });
    edges.push({ type: 'FIRST_APPEARANCE', from: p.personId, to: p.firstRelease, source: p.mentions[0] });
    edges.push({ type: 'ASSET_NEEDED', from: p.personId, to: p.firstRelease, source: `${p.tier}; appears in ${p.releases.length} release(s)`, jitTrigger: `${p.firstRelease} enters active production` });
  }
  const carry = (id: string, kind: GraphNode['kind'], label: string, releases: string[]) => {
    const rs = byOrder(releases);
    if (!rs.length) return;
    nodes.push({ id, kind, label });
    edges.push({ type: 'ASSET_NEEDED', from: id, to: rs[0], source: `asset registry ${id}.releases`, jitTrigger: `${rs[0]} enters active production` });
    for (let i = 1; i < rs.length; i++) edges.push({ type: 'CONTINUITY_CARRY', from: rs[i - 1], to: rs[i], source: `${id} carries across releases` });
  };
  for (const s of assets.sets) carry(s.setId, 'SET', s.name, s.releases ?? []);
  for (const w of assets.wardrobe) carry(w.wardrobeId, 'WARDROBE', w.description, w.releases);
  for (const p of assets.props) carry(p.propId, 'PROP', p.name, p.releases);
  return { schemaVersion: '2.0.0', graphId: 'THE_EXCHANGE.SEASON1_SCENE_DEPENDENCY_GRAPH.V1', activeReleaseId, nodes, edges };
}
export type DependencyGraph = ReturnType<typeof buildDependencyGraph>;
export type GraphFinding = { severity: 'HARD_CONFLICT' | 'WARNING'; edge: string; detail: string };

export function validateDependencyGraph(g: DependencyGraph, master: SeasonMaster): GraphFinding[] {
  const out: GraphFinding[] = [];
  const order = new Map(master.releases.map((r) => [r.id, r.order]));
  const ids = new Set(g.nodes.map((n) => n.id));
  const label = (e: GraphEdge) => `${e.type} ${e.from}→${e.to}`;
  for (const e of g.edges) {
    if (!ids.has(e.from) || !ids.has(e.to)) out.push({ severity: 'HARD_CONFLICT', edge: label(e), detail: 'edge names a node that does not exist' });
    const a = order.get(e.from);
    const b = order.get(e.to);
    if (e.type === 'DEPENDS_ON' && a !== undefined && b !== undefined && b >= a) out.push({ severity: 'HARD_CONFLICT', edge: label(e), detail: 'a release can only depend on an earlier one' });
    if (e.type === 'PAYS_OFF' && a !== undefined && b !== undefined && b <= a) out.push({ severity: 'HARD_CONFLICT', edge: label(e), detail: 'a payoff must come later' });
    if (e.type === 'CONTINUITY_CARRY' && a !== undefined && b !== undefined && b <= a) out.push({ severity: 'HARD_CONFLICT', edge: label(e), detail: 'continuity carries forward only' });
    if (e.type === 'ASSET_NEEDED' && !e.jitTrigger) out.push({ severity: 'HARD_CONFLICT', edge: label(e), detail: 'every asset need names its just-in-time trigger' });
  }
  const first = new Map(g.edges.filter((e) => e.type === 'FIRST_APPEARANCE').map((e) => [e.from, e.to]));
  for (const e of g.edges.filter((x) => x.type === 'ASSET_NEEDED' && first.has(x.from))) if (first.get(e.from) !== e.to) out.push({ severity: 'HARD_CONFLICT', edge: label(e), detail: 'a person is needed first where they first appear' });
  const seen = new Set<string>();
  for (const e of g.edges) {
    const k = `${e.type}|${e.from}|${e.to}`;
    if (seen.has(k) && e.type !== 'CONTINUITY_CARRY' && e.type !== 'CHARACTER_LEARNS') out.push({ severity: 'WARNING', edge: label(e), detail: 'duplicate edge' });
    seen.add(k);
  }
  return out;
}

/** Future needs grouped by the release that triggers them. Tracked silently; none is sent to the founder until its release is active. */
export function futureDependencies(g: DependencyGraph, master: SeasonMaster) {
  const order = new Map(master.releases.map((r) => [r.id, r.order]));
  const active = order.get(g.activeReleaseId) ?? 0;
  const label = new Map(g.nodes.map((n) => [n.id, `${n.kind} ${n.label}`]));
  const groups = new Map<string, string[]>();
  for (const e of g.edges.filter((x) => x.type === 'ASSET_NEEDED')) {
    const at = order.get(e.to) ?? 0;
    if (at <= active) continue;
    groups.set(e.to, [...(groups.get(e.to) ?? []), `${e.from} (${label.get(e.from)})`]);
  }
  return [...groups.entries()].sort((a, b) => order.get(a[0])! - order.get(b[0])!).map(([releaseId, needs]) => ({ releaseId, trigger: `${releaseId} enters active production`, founderAttention: 'NOT REQUESTED' as const, needs }));
}
