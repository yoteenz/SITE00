import fs from 'node:fs';
import path from 'node:path';
import * as X from '../../shared/site00-fiction-production/index.js';

/** Regenerates the V2 cast, season planning and active-scene production data from repository sources. Deterministic; no network calls. */
const root = process.cwd();
const P = X.EXCHANGE_PATHS;
const write = (rel: string, body: string) => {
  fs.mkdirSync(path.dirname(X.repoPath(rel, root)), { recursive: true });
  fs.writeFileSync(X.repoPath(rel, root), body);
  console.log(`wrote ${rel}`);
};
const json = (rel: string, v: unknown) => write(rel, `${JSON.stringify(v, null, 2)}\n`);
const read = (rel: string) => fs.readFileSync(X.repoPath(rel, root), 'utf8');

const dialogue = X.loadDialogueRegistry(root);
const assets = X.loadAssetRegistry(root);
const edits = X.loadCastEdits(root);
const approvals = JSON.parse(read(P.approvals)) as X.ApprovalBook;
const visual = JSON.parse(read(P.visualRegistry));

const cast = X.buildCastRegistry({ dialogue, assets, visual, edits, approvals });
const castFindings = X.validateCastRegistry(cast, edits, dialogue, assets, root);
const castHard = castFindings.filter((f) => f.severity === 'HARD_CONFLICT');
if (castHard.length) throw new Error(`cast registry: ${castHard.map((f) => `${f.subject}: ${f.detail}`).join('; ')}`);
json(X.CAST_REGISTRY_PATH, { ...cast, findings: castFindings });

const ACTIVE = 'S1-01';
const master = X.loadSeasonMaster(root);
const screenplays = X.loadScreenplays(root);
const index = X.buildSceneIndex({ master, screenplays, assets, approvals, activeReleaseId: ACTIVE });
const indexHard = X.validateSceneIndex(index, master, screenplays, approvals).filter((f) => f.severity === 'HARD_CONFLICT');
if (indexHard.length) throw new Error(`scene index: ${indexHard.map((f) => `${f.releaseId}: ${f.detail}`).join('; ')}`);
json(`${P.season}/SEASON1_SCENE_INDEX_V1.json`, index);

const census = X.buildCastCensus(master, screenplays, cast);
const graph = X.buildDependencyGraph({ master, assets, census, activeReleaseId: ACTIVE });
const graphHard = X.validateDependencyGraph(graph, master).filter((f) => f.severity === 'HARD_CONFLICT');
if (graphHard.length) throw new Error(`dependency graph: ${graphHard.map((f) => `${f.edge}: ${f.detail}`).join('; ')}`);
json(`${P.season}/SEASON1_SCENE_DEPENDENCY_GRAPH_V1.json`, graph);
json(`${P.season}/FUTURE_PRODUCTION_DEPENDENCIES_V1.json`, {
  schemaVersion: '2.0.0',
  activeReleaseId: ACTIVE,
  rule: 'Future needs are tracked silently and reach the founder only when their release enters active production.',
  jit: X.jitPlan(ACTIVE, census, cast),
  census,
  byRelease: X.futureDependencies(graph, master),
});
