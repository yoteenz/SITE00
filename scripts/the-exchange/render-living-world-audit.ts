import { buildLivingWorldAuditDocs } from './living-world-audit/build.js';
import { writeDoc } from './living-world-audit/md.js';

/** Renders the Season 1 living-world audit deliverables from the committed audit records. Read-only against canon. */
const root = process.cwd();
for (const [name, body] of Object.entries(buildLivingWorldAuditDocs(root))) writeDoc(root, name, body);
