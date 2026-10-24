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
