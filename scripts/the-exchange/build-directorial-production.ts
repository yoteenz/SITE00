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

const D = X.Directorial;
const kbProblems = D.validateKnowledgeBase();
if (kbProblems.length) throw new Error(`knowledge base: ${kbProblems.join('; ')}`);
json(`${P.season}/PRODUCTION_KNOWLEDGE_BASE_V1.json`, { schemaVersion: D.DIRECTORIAL_SCHEMA_VERSION, version: D.KNOWLEDGE_BASE_VERSION, rule: 'Recommendations cite recorded outcomes and founder decisions; nothing here is model training.', entries: D.PRODUCTION_KNOWLEDGE });

const activePath = `${P.season}/ACTIVE_PRODUCTION_V1.json`;
const releaseIds = master.releases.map((r) => r.id);
const active: X.Directorial.ActiveProduction = fs.existsSync(X.repoPath(activePath, root)) ? JSON.parse(read(activePath)) : D.initialActiveProduction(releaseIds, ACTIVE);
if (active.activeUnit !== ACTIVE || active.units.filter((u) => u.status === 'ACTIVE').length !== 1) throw new Error(`active production: expected exactly ${ACTIVE} active, found ${active.activeUnit}`);
json(activePath, active);

const approved = X.approvedAssetIds(cast);
for (const unitId of Object.keys(X.DIRECTED_SCENES)) {
  const b = X.directedSceneBundle(unitId, root);
  const { plan } = b.direction;
  const people = census.filter((p) => p.releases.includes(plan.releaseId));
  const packet = D.buildScenePacket(b.direction, {
    review: b.review,
    budget: b.budget,
    approvedAssets: approved,
    cast: { people, rule: 'Scene-scoped inhabitants get performance direction and no permanent package (sprint V2 §28).', registryCharacters: cast.characters.filter((c) => people.some((p) => p.registryId === c.characterId)) },
    assets: { sets: assets.sets.filter((s) => b.assetRefs.sets.includes(s.setId)), props: assets.props.filter((p) => b.assetRefs.props.includes(p.propId)), approvedAssetIds: [...approved].sort() },
    screenplayText: read(plan.screenplay.path),
    overview: b.overview,
  });
  if (packet.validation.errors) throw new Error(`${unitId} packet: ${packet.validation.findings.filter((f) => f.severity === 'ERROR').map((f) => `${f.code} ${f.subject}`).join('; ')}`);
  const out = (file: string) => X.scenePath(unitId, file);
  json(out(X.SCENE_FILES.packet), packet);
  json(out(X.SCENE_FILES.timeline), { schemaVersion: D.DIRECTORIAL_SCHEMA_VERSION, unitId, fps: plan.fps, durationFrames: plan.durationFrames, events: D.deriveTimelineEvents(plan), editJoins: D.editJoins(plan) });
  json(out(X.SCENE_FILES.multitrack), D.buildMultitrack(plan));
  json(out(X.SCENE_FILES.shotList), b.shotList);
  write(out(X.SCENE_FILES.shotListCsv), b.shotListCsv);
  json(out(X.SCENE_FILES.keyframes), { schemaVersion: D.DIRECTORIAL_SCHEMA_VERSION, unitId, counts: D.keyframeCounts(plan), productionOrder: D.keyframeProductionOrder(plan), keyframes: packet.sections['4_SHOT_STORYBOARD'].keyframes });
  write(out(X.SCENE_FILES.cueSheet), b.cueSheetCsv);
  json(out(X.SCENE_FILES.budget), b.budget);
  json(out(X.SCENE_FILES.review), b.review);
  console.log(`${unitId}: ${plan.shots.length} shots, ${packet.validation.errors} errors, ${packet.validation.warnings} warnings, ${packet.validation.advisories} advisories, ${b.budget.estimated.credits} credits estimated`);
}
