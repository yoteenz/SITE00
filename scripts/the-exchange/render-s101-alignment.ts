import fs from 'node:fs';
import path from 'node:path';
import { buildS101AlignmentDocs, S101_ALIGNMENT_DOCS_DIR } from './s101-alignment/build.js';

/** Writes deliverables 03 and 04 of the S1-01 packet alignment. Deterministic; no network calls. */
const root = process.cwd();
for (const [name, body] of Object.entries(buildS101AlignmentDocs(root))) {
  const rel = `${S101_ALIGNMENT_DOCS_DIR}/${name}`;
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), body);
  console.log(`wrote ${rel}`);
}
