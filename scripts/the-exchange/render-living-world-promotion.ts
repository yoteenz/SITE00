import { buildLivingWorldPromotionDocs } from './living-world-promotion/build.js';
import { writeDoc } from './living-world-promotion/md.js';

/** Renders the living-world promotion deliverables from the committed promotion records and canon. Writes only to the deliverables folder. */
const root = process.cwd();
for (const [name, body] of Object.entries(buildLivingWorldPromotionDocs(root))) writeDoc(root, name, body);
