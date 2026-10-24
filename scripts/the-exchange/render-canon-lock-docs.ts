import { createHash } from 'node:crypto';
import fs from 'node:fs';
import * as X from '../../shared/site00-fiction-production/index.js';
import { assetDoc } from './canon-lock-docs/assetDoc.js';
import { writeDoc } from './canon-lock-docs/md.js';
import { continuityDoc, screenplayBatchDoc, shotListDoc } from './canon-lock-docs/productionDocs.js';
import { dialogueDoc, ledgerDoc, masterDoc } from './canon-lock-docs/storyDocs.js';

/** Renders the data-derived founder-canon-lock deliverables from committed Season 1 data. Deterministic; run after build-season1-production.ts. */
const root = process.cwd();
const P = X.EXCHANGE_PATHS;
const read = (rel: string) => fs.readFileSync(X.repoPath(rel, root), 'utf8');
const json = <T>(rel: string) => JSON.parse(read(rel)) as T;

const master = X.loadSeasonMaster(root);
const assets = X.loadAssetRegistry(root);
const docs = X.loadScreenplays(root);

writeDoc(root, '02_FOUNDER_CANON_PROMOTION_LEDGER.md', ledgerDoc(json(P.ledger)));
writeDoc(root, '03_SEASON1_86_RELEASE_MASTER.md', masterDoc(master));
writeDoc(root, '04_SEASON1_86_RELEASE_MASTER.csv', read(P.masterCsv));
writeDoc(root, '06_CHARACTER_DIALOGUE_STYLE_REGISTRY.md', dialogueDoc(X.loadDialogueRegistry(root)));
writeDoc(root, '07_CHARACTER_SET_WARDROBE_PROP_REGISTRY.md', assetDoc(assets, X.validateAssetRegistry(assets, root)));
writeDoc(root, '10_CONTINUITY_VALIDATION_REPORT.md', continuityDoc(json(P.continuityReport), json(P.stressRegression)));
writeDoc(
  root,
  '12_SCREENPLAY_BATCH_S1-01_TO_S1-05.md',
  screenplayBatchDoc(docs.map((doc) => ({ doc, source: read(doc.sourcePath), sha256: createHash('sha256').update(read(doc.sourcePath)).digest('hex') }))),
);
writeDoc(
  root,
  '13_SCREENPLAY_BATCH_SHOT_LISTS.md',
  shotListDoc(docs.map((d) => ({ shots: json(`${P.shotLists}/${d.meta.identity.releaseId}.json`), manifest: json(`${P.manifests}/${d.meta.identity.releaseId}.json`) }))),
);
writeDoc(root, '14_SCREENPLAY_BACKLOG_86_RELEASES.csv', read(P.backlogCsv));
