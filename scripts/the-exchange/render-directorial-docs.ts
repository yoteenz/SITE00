import { buildDirectorialDocs } from './directorial-docs/build.js';
import { writeDoc } from './directorial-docs/md.js';

/** Renders the directorial production engine V2 deliverables from committed data. Run after build-directorial-production.ts. */
const root = process.cwd();
for (const [name, body] of Object.entries(buildDirectorialDocs(root))) writeDoc(root, name, body);
