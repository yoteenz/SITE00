/**
 * P0.SITE00.PRODUCTION-WORKSPACE.PROJECT-ISOLATION-LOGIC-RECONCILIATION-PANEL-INTELLIGENCE1
 * Machine-readable reconciliation artifacts, generated from the code (never hand-written):
 *
 *   project-graph-summary.json      per project: nodes / artifacts / decisions / events / domains / phase / next action
 *   project-domain-capability.json  declared applicability × derived establishment, per project × work domain
 *   panel-contracts.json            GRAPH_PANEL_CONTRACTS + AUDITED_PANELS (classification, disposition)
 *
 *   npx tsx scripts/production-workspace/reconciliation-export.ts [outDir]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import {
  AUDITED_PANELS,
  DESIGN_METHOD,
  GRAPH_PANEL_CONTRACTS,
  PROJECT_DOMAIN_CAPABILITY_MAP,
  WORK_DOMAINS,
  assembleProjectGraph,
  designMethodOf,
  experienceKinds,
  hubSummary,
  topLevelNodes,
} from '../../shared/site00-production-graph/index.js';
import { staticGraphParts } from '../../src/site00/production/projectGraphSources';

const OUT = process.argv[2] ?? 'docs/site00/production-workspace/reconciliation';
mkdirSync(OUT, { recursive: true });

const graphs = PROJECT_DOMAIN_CAPABILITY_MAP.map((p) =>
  assembleProjectGraph({ project_id: p.project_id, project_name: p.label, project_type: 'MANAGED' }, staticGraphParts(p.project_id)),
);

const summary = graphs.map((g) => {
  const h = hubSummary(g);
  const fams = topLevelNodes(g, 'DESIGN');
  return {
    project_id: g.project_id,
    project_name: g.project_name,
    truth:
      g.project_id === 'ndxbook' ?
        'LIVE — Entry 002 expression production is built at runtime from the hub read (useProjectGraph → expressionPartFromHub); the static part is empty by design.'
      : g.nodes.length ? 'STATIC SOURCE TRUTH' : 'NONE RECORDED',
    sources: g.sources.map((s) => s.label),
    counts: {
      nodes: g.nodes.length,
      top_level: h.topLevel.length,
      complete: h.complete.length,
      needs_you: h.needsYou.length,
      watching: h.watching.length,
      resolved: h.resolved.length,
      blockers: h.blockers.length,
      review_nodes: h.reviewNodes.length,
      artifacts: g.artifacts.length,
      canonical_artifacts: h.canonicalArtifacts.length,
      events: g.events.length,
    },
    stages: h.stages,
    domains: Object.fromEntries(WORK_DOMAINS.map((d) => [d, { established: g.domains[d].established, node_count: g.domains[d].node_count, reason: g.domains[d].reason }])),
    phase: g.phase,
    next_action: g.next_action,
    design_method: fams.length ? DESIGN_METHOD.map((m) => ({ step: m.id, label: m.label, families: m.rule ? null : fams.filter((f) => designMethodOf(f) === m.id).map((f) => f.family_id ?? f.node_id) })) : null,
    experience_kinds: experienceKinds(g.nodes),
    foreign_dropped: g.foreign_dropped,
  };
});

const capability = PROJECT_DOMAIN_CAPABILITY_MAP.map((p) => {
  const g = graphs.find((x) => x.project_id === p.project_id)!;
  return {
    project_id: p.project_id,
    label: p.label,
    domains: Object.fromEntries(
      WORK_DOMAINS.map((d) => [
        d,
        {
          applicability: p.domains[d].applicability,
          scope: p.domains[d].scope,
          established_static: g.domains[d].established,
          rule: 'GLOBAL_TAB_AVAILABLE ≠ PROJECT_DOMAIN_ESTABLISHED — established = ≥ 1 node of the project in the domain',
        },
      ]),
    ),
  };
});

const panels = {
  graph_panel_contracts: GRAPH_PANEL_CONTRACTS,
  audited_panels: AUDITED_PANELS.map(([panel_id, surface, classification, disposition, note]) => ({ panel_id, surface, classification, disposition, note })),
  totals: {
    graph_panels: GRAPH_PANEL_CONTRACTS.length,
    audited: AUDITED_PANELS.length,
    by_disposition: AUDITED_PANELS.reduce<Record<string, number>>((acc, [, , , d]) => ({ ...acc, [d]: (acc[d] ?? 0) + 1 }), {}),
    by_classification: AUDITED_PANELS.flatMap(([, , c]) => c).reduce<Record<string, number>>((acc, c) => ({ ...acc, [c]: (acc[c] ?? 0) + 1 }), {}),
  },
};

writeFileSync(`${OUT}/project-graph-summary.json`, `${JSON.stringify(summary, null, 2)}\n`);
writeFileSync(`${OUT}/project-domain-capability.json`, `${JSON.stringify(capability, null, 2)}\n`);
writeFileSync(`${OUT}/panel-contracts.json`, `${JSON.stringify(panels, null, 2)}\n`);
console.log(JSON.stringify(summary.map((s) => ({ id: s.project_id, ...s.counts, domains: Object.entries(s.domains).filter(([, v]) => v.established).map(([k]) => k) }))));
console.log(JSON.stringify(panels.totals));
