import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import * as X from '../../shared/site00-fiction-production/index.js';

/** Regenerates every Season 1 production data file from repository sources. Deterministic; no network calls. */
const root = process.cwd();
const P = X.EXCHANGE_PATHS;
const sha = (s: string) => createHash('sha256').update(s).digest('hex');
const write = (rel: string, body: string) => {
  fs.mkdirSync(path.dirname(X.repoPath(rel, root)), { recursive: true });
  fs.writeFileSync(X.repoPath(rel, root), body);
  console.log(`wrote ${rel}`);
};
const json = (rel: string, v: unknown) => write(rel, `${JSON.stringify(v, null, 2)}\n`);
const read = (rel: string) => fs.readFileSync(X.repoPath(rel, root), 'utf8');
const DATE = X.FOUNDER_APPROVAL.date;

const master = X.buildSeasonMaster(root);
json(P.master, master);
write(P.masterCsv, X.masterCsv(master));
json(P.ledger, X.buildPromotionLedger());
json(P.approvalMatrix, X.updateApprovalMatrix(JSON.parse(read(P.approvalMatrix))));
json(P.knowledge, X.knowledgeLedger());

const dialogue = X.loadDialogueRegistry(root);
const assets = X.loadAssetRegistry(root);
const quotes = X.loadPriceQuotes(root);
const docs = X.loadScreenplays(root);
const silentReleases = master.releases.filter((r) => X.silentRelease(master, r.id)).map((r) => r.id);
const continuity = X.validateContinuity({ master, dialogue, assets, screenplays: docs });

type Built = { doc: X.ScreenplayDocument; sha256: string; findings: X.ScreenplayFinding[]; runtime: X.RuntimeEstimate; plan: X.ShotPlan; manifest: X.ProductionManifest; shotPath: string };
const built = new Map<string, Built>();
for (const doc of docs) {
  const id = doc.meta.identity.releaseId;
  const sha256 = sha(read(doc.sourcePath));
  const findings = X.validateScreenplay(doc, { master, dialogue, assets, silentReleases });
  const runtime = X.estimateRuntime(doc);
  const plan = X.planShots(doc, assets, quotes);
  const shotPath = `${P.shotLists}/${id}.json`;
  json(shotPath, {
    schemaVersion: X.FICTION_PRODUCTION_SCHEMA_VERSION,
    releaseId: id,
    status: X.DRAFT_STATUS,
    classification: 'PROVISIONAL_IMPLEMENTATION',
    note: 'Planning document. No shot has been generated.',
    screenplay: { path: doc.sourcePath, sha256, version: doc.meta.identity.version },
    runtime,
    totals: { shots: plan.shots.length, durationSec: plan.totalSec, ...X.summarizeCost(plan) },
    warnings: plan.warnings,
    shots: plan.shots,
  });
  const manifest = X.buildProductionManifest(doc, sha256, plan, assets, dialogue);
  json(`${P.manifests}/${id}.json`, manifest);
  built.set(id, { doc, sha256, findings, runtime, plan, manifest, shotPath });
}

const priorBook: X.ApprovalBook | null = fs.existsSync(X.repoPath(P.approvals, root)) ? JSON.parse(read(P.approvals)) : null;
const seeded: X.ApprovalRecord[] = [];
const seed = (subjectId: string, domain: X.ApprovalDomain, state: X.ApprovalState, actor: string | null, at: string | null, note: string, version = 1) =>
  seeded.push({
    subjectId, domain, state, version,
    actor: state === 'APPROVED' || state === 'REJECTED' || state === 'CHANGES_REQUESTED' ? actor : null,
    decidedAt: state === 'APPROVED' ? at : null,
    note,
    history: state === 'NOT_SUBMITTED' ? [] : [{ from: 'NOT_SUBMITTED', to: state, actor: actor ?? 'system', at: at ?? DATE, note }],
  });
for (const r of master.releases) {
  seed(r.id, 'STORY_STRUCTURE', 'APPROVED', X.FOUNDER_ACTOR, DATE, 'Founder authorization 2026-10-23: S-2 Option A, 86 releases.');
  const b = built.get(r.id);
  seed(r.id, 'SCREENPLAY', b ? 'DRAFT' : 'NOT_SUBMITTED', b ? 'claude-opus-cursor-agent' : null, b ? DATE : null, b ? X.DRAFT_STATUS : 'Gated on founder acceptance of S1-01 to S1-05.', b?.doc.meta.identity.version ?? 1);
  seed(r.id, 'SHOT_PLAN', b ? 'DRAFT' : 'NOT_SUBMITTED', b ? 'claude-opus-cursor-agent' : null, b ? DATE : null, b ? 'Draft shot list for review.' : 'Needs an approved screenplay.');
  seed(r.id, 'GENERATED_VIDEO', 'NOT_SUBMITTED', null, null, 'Nothing generated.');
  seed(r.id, 'FINAL_EDIT', 'NOT_SUBMITTED', null, null, 'Nothing assembled.');
}
const visual = JSON.parse(read(P.visualRegistry)) as { characters: Array<{ characterId: string }> };
for (const c of assets.characters) {
  const v = JSON.stringify(visual.characters.find((x) => x.characterId === c.visualRegistryRef) ?? '');
  if (v.includes('FACIAL_IDENTITY_LOCKED')) seed(c.characterId, 'CHARACTER_VISUAL_IDENTITY', 'APPROVED', X.FOUNDER_ACTOR, null, 'FACIAL_IDENTITY_LOCKED in CHARACTER_VISUAL_REGISTRY_V1; no approval timestamp recorded.');
  else if (v.includes('FOUNDER_REFINEMENT_PROVISIONAL')) seed(c.characterId, 'CHARACTER_VISUAL_IDENTITY', 'IN_REVIEW', null, null, 'FOUNDER_REFINEMENT_PROVISIONAL in CHARACTER_VISUAL_REGISTRY_V1.');
  else seed(c.characterId, 'CHARACTER_VISUAL_IDENTITY', 'NOT_SUBMITTED', null, null, 'No face asset.');
}
for (const c of dialogue.characters) seed(c.characterId, 'CHARACTER_VOICE', 'NOT_SUBMITTED', null, null, 'No verified voice.');
for (const s of assets.sets) seed(s.setId, 'SET', 'NOT_SUBMITTED', null, null, 'No approved reference.');
for (const w of assets.wardrobe) seed(w.wardrobeId, 'WARDROBE', 'NOT_SUBMITTED', null, null, `${w.status}${w.dependency ? ` (${w.dependency})` : ''}`);
const key = (r: X.ApprovalRecord) => `${r.domain}|${r.subjectId}`;
const prior = new Map((priorBook?.records ?? []).map((r) => [key(r), r]));
const records = seeded.map((r) => {
  const p = prior.get(key(r));
  return p && p.state !== 'NOT_SUBMITTED' && p.state !== 'DRAFT' ? p : r;
});
const book: X.ApprovalBook = { schemaVersion: X.FICTION_PRODUCTION_SCHEMA_VERSION, generatedFrom: 'scripts/the-exchange/build-season1-production.ts', rules: X.APPROVAL_RULES, records };
json(P.approvals, book);

const states = (domain: X.ApprovalDomain, subject: string) => X.findRecords(book, domain, subject).map((r) => r.state);
const cueToId = new Map(dialogue.characters.map((c) => [c.cue, c.characterId]));
const pipelineReleases = master.releases.map((r) => {
  const b = built.get(r.id);
  const hard = [
    ...(b?.findings ?? []).filter((f) => f.severity === 'HARD_CONFLICT').map((f) => `${f.check}: ${f.detail}`),
    ...continuity.filter((f) => f.severity === 'HARD_CONFLICT' && f.releases.includes(r.id)).map((f) => `${f.check}: ${f.detail}`),
  ];
  const speakers = b ? [...new Set(X.dialogueLines(b.doc).map((l) => l.character))] : [];
  const assetBlockers = b
    ? [
        ...b.manifest.blockers.filter((x) => x.kind !== 'CHARACTER_VOICE').map((x) => `${x.kind} ${x.subject}: ${x.detail}`),
        ...b.manifest.characters.filter((c) => c.faceRef).map((c) => assets.characters.find((a) => a.cue === c.cue)!).filter((a) => !states('CHARACTER_VISUAL_IDENTITY', a.characterId).every((s) => s === 'APPROVED')).map((a) => `CHARACTER_VISUAL_IDENTITY ${a.characterId}: not approved`),
      ]
    : ['Needs an approved shot list.'];
  const facts: X.ReleaseFacts = {
    releaseId: r.id,
    approval: (d) => (d === 'CHARACTER_VOICE' ? speakers.flatMap((cue) => (cueToId.has(cue) ? states(d, cueToId.get(cue)!) : ['NOT_SUBMITTED' as const])) : states(d, r.id)),
    screenplay: b ? { path: b.doc.sourcePath, sha256: b.sha256, version: b.doc.meta.identity.version } : null,
    hardFindings: hard,
    shotList: b ? { path: b.shotPath, sha256: sha(read(b.shotPath)), screenplaySha256: b.sha256, estimatedCost: { usd: b.manifest.shots.estimatedUsd, credits: b.manifest.shots.estimatedCredits } } : null,
    assetBlockers: [...new Set(assetBlockers)],
    voiceBlockers: b ? [...b.manifest.blockers.filter((x) => x.kind === 'CHARACTER_VOICE').map((x) => `${x.subject}: ${x.detail}`), 'VOICE provider generation not verified (ElevenLabs NOT_VERIFIED).'] : [],
    spendAuthorized: () => false,
    failures: {},
  };
  const stages = X.evaluatePipeline(facts);
  const current = X.currentStage(stages);
  return b ? { releaseId: r.id, currentStage: current.stage, currentStatus: current.status, stages } : { releaseId: r.id, currentStage: current.stage, currentStatus: current.status, stageStatuses: stages.map((s) => `${s.order}:${s.status}`) };
});
json(P.pipelineState, {
  schemaVersion: X.FICTION_PRODUCTION_SCHEMA_VERSION,
  stages: X.PIPELINE_STAGES,
  spendAuthorizations: [],
  jobs: [],
  verifiedGenerationProviders: X.verifiedGenerationProviders(),
  releases: pipelineReleases,
});

json(P.continuityReport, {
  schemaVersion: X.FICTION_PRODUCTION_SCHEMA_VERSION,
  scope: { master: P.master, screenplays: docs.map((d) => d.sourcePath) },
  summary: X.continuitySummary(continuity),
  screenplayFindings: [...built.values()].map((b) => ({ releaseId: b.doc.meta.identity.releaseId, findings: b.findings, planWarnings: b.plan.warnings })),
  findings: continuity,
  forwardDependencies: X.forwardDependencies(master, docs),
});
json(P.stressRegression, { schemaVersion: X.FICTION_PRODUCTION_SCHEMA_VERSION, source: P.stressTest, ...X.runStressRegression(master, continuity, root) });
json(P.providerCapabilities, { schemaVersion: X.FICTION_PRODUCTION_SCHEMA_VERSION, audit: X.PROVIDER_CAPABILITY_AUDIT, verifiedGenerationProviders: X.verifiedGenerationProviders() });
const backlog = X.buildBacklog(master, new Map([...built].map(([id, b]) => [id, b.runtime])));
json(P.backlogJson, { schemaVersion: X.FICTION_PRODUCTION_SCHEMA_VERSION, gate: X.SCREENPLAY_GATE, rows: backlog });
write(P.backlogCsv, X.backlogCsv(backlog));
console.log(JSON.stringify(X.continuitySummary(continuity)));
